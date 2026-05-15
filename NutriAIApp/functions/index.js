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
const rcWebhookSecret = defineSecret("REVENUECAT_WEBHOOK_SECRET");

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
