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

export function subscribePantry(uid, callback) {
  return db.collection('users').doc(uid).collection('pantry').doc('items')
    .onSnapshot(doc => {
      callback(doc.exists ? doc.data().items || [] : []);
    });
}

// ── Meals ─────────────────────────────────────────────────────────

export async function logMealToFirestore(uid, mealData) {
  await db.collection('users').doc(uid).collection('meals').add({
    ...mealData,
    loggedAt: firestore.FieldValue.serverTimestamp(),
    date: new Date().toDateString(),
  });
}

export function subscribeMeals(uid, callback) {
  return db.collection('users').doc(uid).collection('meals')
    .orderBy('loggedAt', 'desc')
    .onSnapshot(snapshot => {
      const meals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(meals);
    });
}

// ── Streaks ───────────────────────────────────────────────────────

export async function getStreak(uid) {
  const doc = await db.collection('users').doc(uid).collection('streaks').doc('current').get();
  return doc.exists ? doc.data() : { count: 0, activityDates: [], earnedToday: false };
}

export async function updateStreak(uid, streakData) {
  await db.collection('users').doc(uid).collection('streaks').doc('current').set(streakData);
}

export function subscribeStreak(uid, callback) {
  return db.collection('users').doc(uid).collection('streaks').doc('current')
    .onSnapshot(doc => {
      callback(doc.exists ? doc.data() : { count: 0, activityDates: [], earnedToday: false });
    });
}

// ── Workouts ──────────────────────────────────────────────────────

export async function logWorkoutToFirestore(uid, workoutData) {
  await db.collection('users').doc(uid).collection('workouts').add({
    ...workoutData,
    completedAt: firestore.FieldValue.serverTimestamp(),
    date: new Date().toDateString(),
  });
}

export function subscribeWorkouts(uid, callback) {
  return db.collection('users').doc(uid).collection('workouts')
    .orderBy('completedAt', 'desc')
    .onSnapshot(snapshot => {
      const workouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(workouts);
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

// ── Account Deletion ──────────────────────────────────────────────

export async function deleteUserData(uid) {
  const userRef = db.collection('users').doc(uid);

  // Delete subcollections
  const subcollections = ['pantry', 'meals', 'streaks', 'workouts'];
  for (const sub of subcollections) {
    const snapshot = await userRef.collection(sub).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    if (snapshot.docs.length > 0) await batch.commit();
  }

  // Delete user document
  await userRef.delete();
}
