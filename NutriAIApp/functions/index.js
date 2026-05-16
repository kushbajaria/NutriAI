const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

// ── PROFANITY FILTER (basic blocklist) ──────────────────────────────
const BLOCKED_WORDS = [
  // Add words as needed — keeping this minimal for now
  "fuck", "shit", "ass", "bitch", "dick", "damn", "cunt", "bastard",
  "nigger", "nigga", "faggot", "retard",
];

function containsProfanity(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BLOCKED_WORDS.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    return regex.test(lower);
  });
}

// ── 1. REVIEW MODERATION ────────────────────────────────────────────
// Automatically flags or deletes reviews with profanity
exports.moderateReview = onDocumentCreated(
  "recipes/{recipeId}/reviews/{reviewId}",
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    if (containsProfanity(data.text)) {
      // Option A: Delete the review
      await event.data.ref.delete();
      console.log(
        `Deleted review ${event.params.reviewId} for profanity`,
      );

      // Option B (alternative): Flag it instead of deleting
      // await event.data.ref.update({ flagged: true, visible: false });
    }
  },
);

// ── 2. STREAK RESET (daily at midnight UTC) ─────────────────────────
// Resets earnedToday flag for all users so streaks calculate correctly
exports.resetDailyStreaks = onSchedule(
  {
    schedule: "0 0 * * *", // midnight UTC daily
    timeZone: "UTC",
    retryCount: 3,
  },
  async () => {
    const streaksSnap = await db
      .collectionGroup("streaks")
      .where("earnedToday", "==", true)
      .get();

    if (streaksSnap.empty) {
      console.log("No streaks to reset");
      return;
    }

    // Batch update in chunks of 500
    const chunks = [];
    let batch = db.batch();
    let count = 0;

    streaksSnap.docs.forEach((doc) => {
      batch.update(doc.ref, { earnedToday: false });
      count++;
      if (count % 500 === 0) {
        chunks.push(batch);
        batch = db.batch();
      }
    });
    if (count % 500 !== 0) chunks.push(batch);

    await Promise.all(chunks.map((b) => b.commit()));
    console.log(`Reset earnedToday for ${count} streak docs`);
  },
);

// ── 3. WELCOME PROFILE INIT ────────────────────────────────────────
// When a new user profile is created, ensure default fields exist
exports.onUserProfileCreated = onDocumentCreated(
  "users/{userId}",
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const defaults = {};
    if (!data.goal) defaults.goal = "Stay Healthy";
    if (!data.units) defaults.units = "Imperial";
    if (!data.diet) defaults.diet = "No Restrictions";
    if (!data.createdAt) defaults.createdAt = FieldValue.serverTimestamp();

    if (Object.keys(defaults).length > 0) {
      await event.data.ref.update(defaults);
      console.log(`Set defaults for user ${event.params.userId}`);
    }
  },
);

// ── 4. CLEANUP ORPHANED DATA ────────────────────────────────────────
// Weekly cleanup: find user docs that reference deleted auth accounts
// This catches cases where deleteUserData failed mid-way
exports.cleanupOrphanedData = onSchedule(
  {
    schedule: "0 3 * * 0", // 3am UTC every Sunday
    timeZone: "UTC",
    retryCount: 1,
  },
  async () => {
    const { getAuth } = require("firebase-admin/auth");
    const usersSnap = await db.collection("users").limit(1000).get();
    let cleaned = 0;

    for (const doc of usersSnap.docs) {
      try {
        await getAuth().getUser(doc.id);
      } catch (err) {
        if (err.code === "auth/user-not-found") {
          // Auth user doesn't exist — clean up Firestore data
          const subcollections = [
            "pantry", "meals", "streaks", "workouts", "weightLog", "water",
          ];
          for (const sub of subcollections) {
            const subSnap = await doc.ref.collection(sub).limit(500).get();
            if (!subSnap.empty) {
              const batch = db.batch();
              subSnap.docs.forEach((d) => batch.delete(d.ref));
              await batch.commit();
            }
          }
          // Clean up AI chat messages (nested subcollection)
          const chatDoc = doc.ref.collection("aiChats").doc("current");
          const msgSnap = await chatDoc.collection("messages").limit(500).get();
          if (!msgSnap.empty) {
            const batch = db.batch();
            msgSnap.docs.forEach((d) => batch.delete(d.ref));
            await batch.commit();
          }
          await chatDoc.delete().catch(() => {});
          await doc.ref.delete();
          cleaned++;
          console.log(`Cleaned orphaned user: ${doc.id}`);
        }
      }
    }
    console.log(`Cleanup complete: ${cleaned} orphaned users removed`);
  },
);

// ── 5. RATE-LIMITED REVIEW SUBMISSION ───────────────────────────────
// Callable function that checks rate limits before allowing a review
exports.submitReview = onCall(
  { enforceAppCheck: false }, // Set to true when App Check is enabled
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const uid = request.auth.uid;
    const { recipeId, stars, text } = request.data;

    // Validate input
    if (!recipeId || typeof recipeId !== "string") {
      throw new HttpsError("invalid-argument", "Invalid recipe ID");
    }
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      throw new HttpsError("invalid-argument", "Stars must be 1-5");
    }
    if (typeof text !== "string" || text.length > 1000) {
      throw new HttpsError("invalid-argument", "Review text too long");
    }
    if (containsProfanity(text)) {
      throw new HttpsError(
        "invalid-argument",
        "Review contains inappropriate language",
      );
    }

    // Rate limit: max 5 reviews per hour per user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentReviews = await db
      .collectionGroup("reviews")
      .where("uid", "==", uid)
      .where("createdAt", ">=", oneHourAgo)
      .limit(5)
      .get();

    if (recentReviews.size >= 5) {
      throw new HttpsError(
        "resource-exhausted",
        "Too many reviews. Try again later.",
      );
    }

    // Check for duplicate review on same recipe
    const existingReview = await db
      .collection("recipes")
      .doc(recipeId)
      .collection("reviews")
      .where("uid", "==", uid)
      .limit(1)
      .get();

    if (!existingReview.empty) {
      throw new HttpsError(
        "already-exists",
        "You already reviewed this recipe",
      );
    }

    // Write the review
    const reviewRef = await db
      .collection("recipes")
      .doc(recipeId)
      .collection("reviews")
      .add({
        uid,
        stars,
        text,
        createdAt: FieldValue.serverTimestamp(),
      });

    return { reviewId: reviewRef.id };
  },
);

// ── 6. SECURE DATA EXPORT ──────────────────────────────────────────
// Server-side export ensures complete data and prevents client manipulation
exports.exportMyData = onCall(
  { enforceAppCheck: false }, // Set to true when App Check is enabled
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const uid = request.auth.uid;
    const userRef = db.collection("users").doc(uid);
    const profileDoc = await userRef.get();

    if (!profileDoc.exists) {
      throw new HttpsError("not-found", "User profile not found");
    }

    const profile = profileDoc.data();
    // Strip sensitive internal fields
    delete profile.profilePhoto; // Too large for export payload

    const subcollections = [
      "pantry", "meals", "streaks", "workouts", "water", "weightLog",
    ];
    const data = { profile };

    for (const sub of subcollections) {
      const snapshot = await userRef.collection(sub).limit(5000).get();
      data[sub] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    return data;
  },
);

// ── REVENUECAT SUBSCRIPTION WEBHOOK ─────────────────────────────────
const { seedRecipesAndReviews } = require("./seed");

const rcWebhookSecret = defineSecret("REVENUECAT_WEBHOOK_SECRET");
const seedSecret = defineSecret("SEED_SECRET");
const anthropicApiKey = defineSecret("ANTHROPIC_API_KEY");

exports.handleSubscriptionWebhook = onRequest(
  { secrets: [rcWebhookSecret] },
  async (req, res) => {
    // Only allow POST
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    // Verify authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${rcWebhookSecret.value()}`) {
      res.status(401).send("Unauthorized");
      return;
    }

    try {
      const event = req.body?.event;
      if (!event) {
        res.status(400).send("Missing event");
        return;
      }

      const { type, app_user_id: uid } = event;
      if (!uid) {
        res.status(400).send("Missing app_user_id");
        return;
      }

      const userRef = db.collection("users").doc(uid);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        console.warn(`[Webhook] User ${uid} not found`);
        res.status(200).send("OK");
        return;
      }

      let subscriptionUpdate;

      switch (type) {
        case "INITIAL_PURCHASE":
        case "RENEWAL":
        case "PRODUCT_CHANGE":
          subscriptionUpdate = {
            status: "pro",
            plan: event.product_id || null,
            expiresAt: event.expiration_at_ms
              ? new Date(event.expiration_at_ms)
              : null,
            rcUserId: event.original_app_user_id || uid,
            updatedAt: FieldValue.serverTimestamp(),
          };
          break;

        case "CANCELLATION":
          subscriptionUpdate = {
            status: "cancelled",
            expiresAt: event.expiration_at_ms
              ? new Date(event.expiration_at_ms)
              : null,
            updatedAt: FieldValue.serverTimestamp(),
          };
          break;

        case "EXPIRATION":
          subscriptionUpdate = {
            status: "expired",
            updatedAt: FieldValue.serverTimestamp(),
          };
          break;

        case "BILLING_ISSUE":
          subscriptionUpdate = {
            status: "billing_issue",
            updatedAt: FieldValue.serverTimestamp(),
          };
          break;

        default:
          // Unknown event type — acknowledge but don't update
          console.log(`[Webhook] Unhandled event type: ${type}`);
          res.status(200).send("OK");
          return;
      }

      await userRef.update({ subscription: subscriptionUpdate });
      console.log(`[Webhook] Updated subscription for ${uid}: ${type}`);
      res.status(200).send("OK");
    } catch (error) {
      console.error("[Webhook] Error:", error);
      res.status(500).send("Internal Server Error");
    }
  },
);

// ── SEED RECIPES (callable — admin UID allowlist) ──────────────────
const ADMIN_UIDS = [
  // Add your Firebase Auth UID here to authorize seeding
];

exports.seedRecipes = onCall(
  { enforceAppCheck: false },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }
    if (!ADMIN_UIDS.includes(request.auth.uid)) {
      throw new HttpsError("permission-denied", "Admin access required");
    }

    const result = await seedRecipesAndReviews(db);
    return result;
  },
);

// ── SEED RECIPES (HTTP — secret-gated for curl/CI) ─────────────────
exports.seedRecipesHttp = onRequest(
  { secrets: [seedSecret] },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${seedSecret.value()}`) {
      res.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await seedRecipesAndReviews(db);
      res.status(200).json(result);
    } catch (error) {
      console.error("[Seed] Error:", error);
      res.status(500).send("Internal Server Error");
    }
  },
);

// ── AI CHAT ────────────────────────────────────────────────────────

// TDEE Calculation (Mifflin-St Jeor) — mirrors client-side DataContext
function calculateTDEE(age, height, weight, units, goal) {
  const ageNum = parseInt(age, 10);
  const heightNum = parseFloat(height);
  const weightNum = parseFloat(weight);
  if (!ageNum || !heightNum || !weightNum) return 2200;

  const weightKg = units === "Imperial" ? weightNum * 0.453592 : weightNum;
  const heightCm = units === "Imperial" ? heightNum * 2.54 : heightNum;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum;
  const tdee = Math.round(bmr * 1.55);

  if (goal === "Lose Weight") return Math.round(tdee - 500);
  if (goal === "Build Muscle") return Math.round(tdee + 300);
  return tdee;
}

function calculateMacroGoals(calGoal, goal) {
  if (goal === "Build Muscle") {
    return {
      protein: Math.round((calGoal * 0.35) / 4),
      carbs: Math.round((calGoal * 0.40) / 4),
      fat: Math.round((calGoal * 0.25) / 9),
    };
  }
  if (goal === "Lose Weight") {
    return {
      protein: Math.round((calGoal * 0.30) / 4),
      carbs: Math.round((calGoal * 0.40) / 4),
      fat: Math.round((calGoal * 0.30) / 9),
    };
  }
  return {
    protein: Math.round((calGoal * 0.25) / 4),
    carbs: Math.round((calGoal * 0.50) / 4),
    fat: Math.round((calGoal * 0.25) / 9),
  };
}

async function buildSystemPrompt(uid) {
  // Read user profile
  const userDoc = await db.collection("users").doc(uid).get();
  const profile = userDoc.exists ? userDoc.data() : {};

  const goal = profile.goal || "Stay Healthy";
  const age = profile.age || "";
  const height = profile.height || "";
  const weight = profile.weight || "";
  const diet = profile.diet || "No Restrictions";
  const units = profile.units || "Imperial";
  const calGoal = profile.calGoal || calculateTDEE(age, height, weight, units, goal);
  const macros = calculateMacroGoals(calGoal, goal);

  // Read today's meals
  const todayStr = new Date().toDateString();
  const mealsSnap = await db
    .collection("users").doc(uid).collection("meals")
    .where("date", "==", todayStr)
    .limit(20)
    .get();

  const meals = mealsSnap.docs.map((d) => d.data());
  const totalCals = meals.reduce((a, m) => a + (m.cal || 0), 0);
  const totalProtein = meals.reduce((a, m) => a + (m.protein || 0), 0);
  const totalCarbs = meals.reduce((a, m) => a + (m.carbs || 0), 0);
  const totalFat = meals.reduce((a, m) => a + (m.fat || 0), 0);
  const mealList = meals.map((m) => `${m.name} (${m.cal} cal)`).join(", ") || "None yet";

  // Read pantry
  const pantrySnap = await db
    .collection("users").doc(uid).collection("pantry")
    .limit(1)
    .get();
  let pantryItems = [];
  if (!pantrySnap.empty) {
    const pantryData = pantrySnap.docs[0].data();
    pantryItems = pantryData.items || [];
  }
  const pantryList = pantryItems.length > 0 ? pantryItems.join(", ") : "Not set";

  const unitLabel = units === "Imperial" ? "in/lbs" : "cm/kg";

  return `You are NutriAI Coach, a friendly and knowledgeable nutrition and fitness assistant.

User Profile:
- Goal: ${goal}
- Age: ${age}, Height: ${height}${unitLabel}, Weight: ${weight}${unitLabel}
- Diet: ${diet}
- Daily calorie target: ${calGoal} kcal
- Macro targets: ${macros.protein}g protein, ${macros.carbs}g carbs, ${macros.fat}g fat

Today's Progress:
- Calories: ${totalCals}/${calGoal} kcal
- Protein: ${totalProtein}g/${macros.protein}g, Carbs: ${totalCarbs}g/${macros.carbs}g, Fat: ${totalFat}g/${macros.fat}g
- Meals logged: ${mealList}

Pantry items: ${pantryList}

Guidelines:
- Give concise, actionable advice
- Reference the user's actual data when relevant
- Stay focused on nutrition, fitness, and wellness
- If asked about medical conditions, recommend consulting a healthcare professional
- Use ${units === "Imperial" ? "imperial" : "metric"} units to match the user's preference
- Keep responses under 300 words unless the user asks for detail`;
}

exports.aiChat = onCall(
  { secrets: [anthropicApiKey], enforceAppCheck: false },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const uid = request.auth.uid;
    const { message } = request.data;

    // Validate input
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      throw new HttpsError("invalid-argument", "Message is required");
    }
    if (message.length > 2000) {
      throw new HttpsError("invalid-argument", "Message too long (max 2000 characters)");
    }

    // Rate limit: 30 user messages per hour
    const chatRef = db
      .collection("users").doc(uid)
      .collection("aiChats").doc("current");
    const messagesRef = chatRef.collection("messages");

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentMsgs = await messagesRef
      .where("role", "==", "user")
      .where("createdAt", ">=", oneHourAgo)
      .limit(30)
      .get();

    if (recentMsgs.size >= 30) {
      throw new HttpsError(
        "resource-exhausted",
        "Message limit reached. Try again later.",
      );
    }

    // Build system prompt from user's Firestore data
    const systemPrompt = await buildSystemPrompt(uid);

    // Retrieve last 20 messages for conversation history
    const historySnap = await messagesRef
      .orderBy("createdAt", "asc")
      .limitToLast(20)
      .get();

    const history = historySnap.docs.map((doc) => {
      const d = doc.data();
      return { role: d.role, content: d.content };
    });

    // Call Claude API
    const Anthropic = require("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: anthropicApiKey.value() });

    let assistantText;
    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [...history, { role: "user", content: message.trim() }],
      });
      assistantText = response.content[0].text;
    } catch (err) {
      console.error("[AI Chat] Claude API error:", err);
      throw new HttpsError("internal", "AI service temporarily unavailable");
    }

    // Store both messages in Firestore
    const now = FieldValue.serverTimestamp();
    const batch = db.batch();

    batch.set(messagesRef.doc(), {
      role: "user",
      content: message.trim(),
      createdAt: now,
    });
    batch.set(messagesRef.doc(), {
      role: "assistant",
      content: assistantText,
      createdAt: now,
    });

    // Update or create chat metadata
    batch.set(
      chatRef,
      {
        lastMessageAt: now,
        messageCount: FieldValue.increment(2),
        createdAt: now,
      },
      { merge: true },
    );

    await batch.commit();

    return { message: assistantText };
  },
);

// ── WEEKLY INSIGHTS ────────────────────────────────────────────────

function getISOWeekId(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

exports.generateInsights = onCall(
  { secrets: [anthropicApiKey], enforceAppCheck: false },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const uid = request.auth.uid;
    const regenerate = request.data?.regenerate === true;
    const weekId = getISOWeekId(new Date());

    const insightRef = db
      .collection("users").doc(uid)
      .collection("insights").doc(weekId);

    // Return cached if exists and not regenerating
    if (!regenerate) {
      const cached = await insightRef.get();
      if (cached.exists) {
        return cached.data();
      }
    }

    // Rate limit: max 3 regenerations per week
    if (regenerate) {
      const insightsSnap = await db
        .collection("users").doc(uid)
        .collection("insights")
        .where("weekId", "==", weekId)
        .limit(3)
        .get();
      // Count how many times regenerated (check regenerateCount field)
      const existing = await insightRef.get();
      if (existing.exists && (existing.data().regenerateCount || 0) >= 3) {
        throw new HttpsError(
          "resource-exhausted",
          "Maximum regenerations reached for this week.",
        );
      }
    }

    // Gather last 7 days of data
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [mealsSnap, workoutsSnap, weightSnap] = await Promise.all([
      db.collection("users").doc(uid).collection("meals")
        .where("loggedAt", ">=", sevenDaysAgo)
        .orderBy("loggedAt", "asc")
        .get(),
      db.collection("users").doc(uid).collection("workouts")
        .where("completedAt", ">=", sevenDaysAgo)
        .orderBy("completedAt", "asc")
        .get(),
      db.collection("users").doc(uid).collection("weightLog")
        .where("timestamp", ">=", sevenDaysAgo.getTime())
        .orderBy("timestamp", "asc")
        .get(),
    ]);

    const meals = mealsSnap.docs.map((d) => d.data());
    const workouts = workoutsSnap.docs.map((d) => d.data());
    const weightEntries = weightSnap.docs.map((d) => d.data());

    // Check minimum data threshold
    if (meals.length < 3) {
      return { notEnoughData: true, weekId };
    }

    // Read user profile for targets
    const userDoc = await db.collection("users").doc(uid).get();
    const profile = userDoc.exists ? userDoc.data() : {};
    const goal = profile.goal || "Stay Healthy";
    const calGoal = profile.calGoal || calculateTDEE(
      profile.age, profile.height, profile.weight, profile.units, goal,
    );
    const macros = calculateMacroGoals(calGoal, goal);

    // Aggregate daily data
    const totalCals = meals.reduce((a, m) => a + (m.cal || 0), 0);
    const totalProtein = meals.reduce((a, m) => a + (m.protein || 0), 0);
    const totalCarbs = meals.reduce((a, m) => a + (m.carbs || 0), 0);
    const totalFat = meals.reduce((a, m) => a + (m.fat || 0), 0);
    const daysWithMeals = new Set(meals.map((m) => m.date)).size;
    const avgCal = Math.round(totalCals / daysWithMeals);
    const avgProtein = Math.round(totalProtein / daysWithMeals);

    const dataContext = `
User Goal: ${goal}
Daily Targets: ${calGoal} kcal, ${macros.protein}g protein, ${macros.carbs}g carbs, ${macros.fat}g fat

This Week Summary (${daysWithMeals} days with meals logged):
- Total meals logged: ${meals.length}
- Average daily calories: ${avgCal} kcal (target: ${calGoal})
- Average daily protein: ${avgProtein}g (target: ${macros.protein}g)
- Total carbs consumed: ${totalCarbs}g, Total fat: ${totalFat}g
- Workouts completed: ${workouts.length}
- Workout types: ${[...new Set(workouts.map((w) => w.type))].join(", ") || "None"}
${weightEntries.length >= 2
  ? `- Weight change: ${(weightEntries[weightEntries.length - 1].value - weightEntries[0].value).toFixed(1)} ${weightEntries[0].unit || "lbs"}`
  : "- No weight data this week"}
`.trim();

    // Call Claude for structured insights
    const Anthropic = require("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: anthropicApiKey.value() });

    let insights;
    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 512,
        system: `You are a nutrition analytics engine. Analyze the user's weekly data and return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "weekSummary": "1-2 sentence overview of the week",
  "wentWell": ["item1", "item2", "item3"],
  "toImprove": ["item1", "item2"],
  "tip": "One specific actionable tip for next week",
  "calorieAdherence": <number 0-100>,
  "proteinAdherence": <number 0-100>
}
Be encouraging but honest. Reference specific numbers from the data.`,
        messages: [{ role: "user", content: dataContext }],
      });

      let text = response.content[0].text.trim();
      // Strip markdown code fences if present
      if (text.startsWith("```")) {
        text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      insights = JSON.parse(text);
    } catch (err) {
      console.error("[Insights] Claude API or parse error:", err);
      // Fallback insights
      insights = {
        weekSummary: `You logged ${meals.length} meals across ${daysWithMeals} days this week.`,
        wentWell: ["Consistent meal tracking", "Staying active with your goals"],
        toImprove: ["Try to log meals every day for better insights"],
        tip: "Consistency is key — even imperfect tracking helps you stay aware.",
        calorieAdherence: Math.min(100, Math.round((avgCal / calGoal) * 100)),
        proteinAdherence: Math.min(100, Math.round((avgProtein / macros.protein) * 100)),
      };
    }

    // Store in Firestore
    const insightDoc = {
      ...insights,
      weekId,
      generatedAt: FieldValue.serverTimestamp(),
      regenerateCount: regenerate ? FieldValue.increment(1) : 1,
      notEnoughData: false,
    };

    await insightRef.set(insightDoc, { merge: true });

    return { ...insights, weekId, notEnoughData: false };
  },
);
