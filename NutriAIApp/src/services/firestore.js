import firestore from '@react-native-firebase/firestore';

const db = firestore();

// ── User Profile ──────────────────────────────────────────────────

export async function createUserProfile(uid, data) {
  await db.collection('users').doc(uid).set({
    ...data,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function getUserProfile(uid) {
  const doc = await db.collection('users').doc(uid).get();
  return doc.exists ? doc.data() : null;
}

export async function updateUserProfile(uid, fields) {
  await db.collection('users').doc(uid).update({
    ...fields,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

// ── Pantry ────────────────────────────────────────────────────────

export async function setPantry(uid, items) {
  await db.collection('users').doc(uid).collection('pantry').doc('items').set({
    items,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

export function subscribePantry(uid, callback, onError) {
  return db.collection('users').doc(uid).collection('pantry').doc('items')
    .onSnapshot(doc => {
      callback(doc.exists && doc.data() ? doc.data().items || [] : []);
    }, onError);
}

// ── Meals ─────────────────────────────────────────────────────────

export async function logMealToFirestore(uid, mealData) {
  await db.collection('users').doc(uid).collection('meals').add({
    ...mealData,
    loggedAt: firestore.FieldValue.serverTimestamp(),
    date: new Date().toDateString(),
  });
}

export function subscribeMeals(uid, callback, onError) {
  return db.collection('users').doc(uid).collection('meals')
    .orderBy('loggedAt', 'desc')
    .onSnapshot(snapshot => {
      const meals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(meals);
    }, onError);
}

// ── Streaks ───────────────────────────────────────────────────────

export async function getStreak(uid) {
  const doc = await db.collection('users').doc(uid).collection('streaks').doc('current').get();
  return doc.exists ? doc.data() : { count: 0, activityDates: [], earnedToday: false };
}

export async function updateStreak(uid, streakData) {
  await db.collection('users').doc(uid).collection('streaks').doc('current').set(streakData);
}

export function subscribeStreak(uid, callback, onError) {
  return db.collection('users').doc(uid).collection('streaks').doc('current')
    .onSnapshot(doc => {
      callback(doc.exists ? doc.data() : { count: 0, activityDates: [], earnedToday: false });
    }, onError);
}

// ── Workouts ──────────────────────────────────────────────────────

export async function logWorkoutToFirestore(uid, workoutData) {
  await db.collection('users').doc(uid).collection('workouts').add({
    ...workoutData,
    completedAt: firestore.FieldValue.serverTimestamp(),
    date: new Date().toDateString(),
  });
}

export function subscribeWorkouts(uid, callback, onError) {
  return db.collection('users').doc(uid).collection('workouts')
    .orderBy('completedAt', 'desc')
    .onSnapshot(snapshot => {
      const workouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(workouts);
    }, onError);
}

// ── Water Tracking ───────────────────────────────────────────────

export async function addWaterEntry(uid, date, { oz, label }) {
  const ref = db.collection('users').doc(uid).collection('water').doc(date);
  const doc = await ref.get();
  const existing = doc.exists ? doc.data() : {};
  const entries = existing.entries || [];

  // Migrate old glasses-only docs
  if (!existing.entries && existing.glasses) {
    for (let i = 0; i < existing.glasses; i++) {
      entries.push({ oz: 8, label: 'Glass', timestamp: Date.now() - (existing.glasses - i) * 1000 });
    }
  }

  const newEntry = { oz, label, timestamp: Date.now() };
  entries.push(newEntry);
  const totalOz = entries.reduce((a, e) => a + e.oz, 0);

  await ref.set({
    entries,
    totalOz,
    glasses: Math.round(totalOz / 8),
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function removeLastWaterEntry(uid, date) {
  const ref = db.collection('users').doc(uid).collection('water').doc(date);
  const doc = await ref.get();
  if (!doc.exists) return;
  const data = doc.data();
  const entries = data.entries || [];
  if (entries.length === 0) return;

  entries.pop();
  const totalOz = entries.reduce((a, e) => a + e.oz, 0);

  await ref.set({
    entries,
    totalOz,
    glasses: Math.round(totalOz / 8),
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

export function subscribeWaterDay(uid, date, callback, onError) {
  return db.collection('users').doc(uid).collection('water').doc(date)
    .onSnapshot(doc => {
      if (!doc.exists || !doc.data()) {
        callback({ totalOz: 0, entries: [], glasses: 0 });
        return;
      }
      const data = doc.data();
      // Lazy migration for old glasses-only docs
      if (!data.entries && data.glasses) {
        callback({
          totalOz: data.glasses * 8,
          entries: Array.from({ length: data.glasses }, (_, i) => ({ oz: 8, label: 'Glass', timestamp: 0 })),
          glasses: data.glasses,
        });
        return;
      }
      callback({
        totalOz: data.totalOz || 0,
        entries: data.entries || [],
        glasses: data.glasses || 0,
      });
    }, onError);
}

export async function getWaterWeek(uid) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - mondayOffset + i);
    dates.push(d.toDateString());
  }

  const docs = await Promise.all(
    dates.map(date =>
      db.collection('users').doc(uid).collection('water').doc(date).get()
    )
  );

  return dates.map((date, i) => {
    const data = docs[i].exists ? docs[i].data() : {};
    return {
      date,
      totalOz: data.totalOz || (data.glasses ? data.glasses * 8 : 0),
      entries: data.entries || [],
    };
  });
}

// ── Recipes ───────────────────────────────────────────────────────

export async function getAllRecipes() {
  const snapshot = await db.collection('recipes').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getRecipeReviews(recipeId) {
  const snapshot = await db.collection('recipes').doc(recipeId)
    .collection('reviews').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addReviewToFirestore(recipeId, uid, reviewData) {
  await db.collection('recipes').doc(recipeId).collection('reviews').add({
    ...reviewData,
    uid,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
}

// ── Data Export (GDPR) ───────────────────────────────────────────

export async function exportUserData(uid) {
  const userRef = db.collection('users').doc(uid);
  const profileDoc = await userRef.get();
  const profile = profileDoc.exists ? profileDoc.data() : {};

  const subcollections = ['pantry', 'meals', 'streaks', 'workouts', 'water'];
  const data = { profile };

  for (const sub of subcollections) {
    const snapshot = await userRef.collection(sub).get();
    data[sub] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  return data;
}

// ── Account Deletion ──────────────────────────────────────────────

// ── Weight Log ───────────────────────────────────────────────────

export async function logWeight(uid, { value, unit }) {
  await db.collection('users').doc(uid).collection('weightLog').add({
    value,
    unit,
    timestamp: Date.now(),
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
}

export function subscribeWeightLog(uid, callback, onError) {
  return db
    .collection('users').doc(uid).collection('weightLog')
    .orderBy('timestamp', 'desc')
    .limit(50)
    .onSnapshot(
      snap => {
        const entries = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(entries);
      },
      err => { console.error('WeightLog subscribe error:', err); onError?.(err); }
    );
}

export async function deleteUserData(uid) {
  const userRef = db.collection('users').doc(uid);

  // Delete subcollections
  const subcollections = ['pantry', 'meals', 'streaks', 'workouts', 'weightLog', 'water'];
  for (const sub of subcollections) {
    const snapshot = await userRef.collection(sub).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    if (snapshot.docs.length > 0) await batch.commit();
  }

  // Delete user document
  await userRef.delete();
}
