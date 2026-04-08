import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';
import {
  setPantry as setPantryFirestore,
  subscribePantry,
  logMealToFirestore,
  subscribeMeals,
  subscribeStreak,
  updateStreak as updateStreakFirestore,
  logWorkoutToFirestore,
  subscribeWorkouts,
  getAllRecipes,
  updateUserProfile,
} from '../services/firestore';
import { cacheRecipes, getCachedRecipes, cacheUserData, getCachedUserData } from '../services/cache';
import { RECIPES as FALLBACK_RECIPES, MOCK_REVIEWS } from '../constants/data';

const DataContext = createContext(null);

// ── Meal scoring (same algorithm as before) ──────────────────────
function scoreRecipes(recipes, pantry, goal) {
  const pantryNorm = pantry.map(p => p.toLowerCase().trim());
  return recipes
    .map(recipe => {
      const matched = recipe.ingredients.filter(ing =>
        pantryNorm.some(p => p.includes(ing.toLowerCase()) || ing.toLowerCase().includes(p))
      );
      const missing = recipe.ingredients.filter(ing =>
        !pantryNorm.some(p => p.includes(ing.toLowerCase()) || ing.toLowerCase().includes(p))
      );
      const matchScore = matched.length / recipe.ingredients.length;

      let goalScore = 0.5;
      if (goal === 'Lose Weight')  goalScore = recipe.cal     < 400 ? 1 : recipe.cal     < 550 ? 0.65 : 0.2;
      if (goal === 'Build Muscle') goalScore = recipe.protein >= 40  ? 1 : recipe.protein >= 25  ? 0.70 : 0.3;
      if (goal === 'Stay Healthy') goalScore = 0.7;
      if (goal === 'Boost Energy') goalScore = recipe.carbs   >= 45  ? 1 : recipe.carbs   >= 25  ? 0.65 : 0.3;

      return {
        ...recipe,
        matchScore,
        matchedIngredients: matched,
        missingIngredients: missing,
        combinedScore: matchScore * 0.65 + goalScore * 0.35,
      };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore);
}

export function DataProvider({ children }) {
  const { user, profile } = useAuth();
  const { showToast } = useUI();

  // State
  const [goal, setGoalLocal]       = useState('Lose Weight');
  const [age, setAgeLocal]         = useState('');
  const [height, setHeightLocal]   = useState('');
  const [weight, setWeightLocal]   = useState('');
  const [diet, setDietLocal]       = useState('No Restrictions');
  const [pantry, setPantryLocal]   = useState([]);
  const [loggedMeals, setLoggedMeals] = useState([]);
  const [streakData, setStreakData]    = useState({ count: 0, activityDates: [], earnedToday: false });
  const [completedWorkouts, setCompletedWorkouts] = useState([]);
  const [recipes, setRecipes]      = useState(FALLBACK_RECIPES);
  const [recipesLoaded, setRecipesLoaded] = useState(false);
  const [reviews, setReviews]      = useState(MOCK_REVIEWS || {});

  // Sync profile data from AuthContext
  useEffect(() => {
    if (profile) {
      if (profile.goal)   setGoalLocal(profile.goal);
      if (profile.age)    setAgeLocal(profile.age);
      if (profile.height) setHeightLocal(profile.height);
      if (profile.weight) setWeightLocal(profile.weight);
      if (profile.diet)   setDietLocal(profile.diet);
    }
  }, [profile]);

  // Load recipes (cache-first, then Firestore)
  useEffect(() => {
    let mounted = true;
    (async () => {
      // Try cache first
      const cached = await getCachedRecipes();
      if (cached && cached.length > 0 && mounted) {
        setRecipes(cached);
        setRecipesLoaded(true);
      }

      // Then fetch from Firestore
      try {
        const fresh = await getAllRecipes();
        if (fresh.length > 0 && mounted) {
          setRecipes(fresh);
          setRecipesLoaded(true);
          await cacheRecipes(fresh);
        }
      } catch (err) {
        console.warn('Failed to fetch recipes from Firestore, using fallback:', err.message);
        // If no cache either, FALLBACK_RECIPES already set
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Subscribe to Firestore data when authenticated
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribers = [
      subscribePantry(user.uid, (items) => {
        setPantryLocal(items);
        cacheUserData('pantry', items);
      }),
      subscribeMeals(user.uid, (meals) => {
        setLoggedMeals(meals);
        cacheUserData('meals', meals);
      }),
      subscribeStreak(user.uid, (data) => {
        setStreakData(data);
        cacheUserData('streak', data);
      }),
      subscribeWorkouts(user.uid, (workouts) => {
        setCompletedWorkouts(workouts);
        cacheUserData('workouts', workouts);
      }),
    ];

    // Load cached data for instant display
    (async () => {
      const cachedPantry   = await getCachedUserData('pantry');
      const cachedMeals    = await getCachedUserData('meals');
      const cachedStreak   = await getCachedUserData('streak');
      const cachedWorkouts = await getCachedUserData('workouts');
      if (cachedPantry)   setPantryLocal(cachedPantry);
      if (cachedMeals)    setLoggedMeals(cachedMeals);
      if (cachedStreak)   setStreakData(cachedStreak);
      if (cachedWorkouts) setCompletedWorkouts(cachedWorkouts);
    })();

    return () => unsubscribers.forEach(unsub => unsub());
  }, [user?.uid]);

  // ── Setters that sync to Firestore ──────────────────────────────

  const setGoal = useCallback(async (val) => {
    setGoalLocal(val);
    if (user?.uid) await updateUserProfile(user.uid, { goal: val });
  }, [user?.uid]);

  const setAge = useCallback(async (val) => {
    setAgeLocal(val);
    if (user?.uid) await updateUserProfile(user.uid, { age: val });
  }, [user?.uid]);

  const setHeight = useCallback(async (val) => {
    setHeightLocal(val);
    if (user?.uid) await updateUserProfile(user.uid, { height: val });
  }, [user?.uid]);

  const setWeight = useCallback(async (val) => {
    setWeightLocal(val);
    if (user?.uid) await updateUserProfile(user.uid, { weight: val });
  }, [user?.uid]);

  const setDiet = useCallback(async (val) => {
    setDietLocal(val);
    if (user?.uid) await updateUserProfile(user.uid, { diet: val });
  }, [user?.uid]);

  const setPantry = useCallback(async (items) => {
    setPantryLocal(items);
    if (user?.uid) await setPantryFirestore(user.uid, items);
  }, [user?.uid]);

  // ── Actions ─────────────────────────────────────────────────────

  const recordActivity = useCallback(async () => {
    const today = new Date().toDateString();
    if (streakData.activityDates.includes(today)) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const continued = streakData.activityDates.includes(yesterday.toDateString());

    const newStreak = {
      count:         continued ? streakData.count + 1 : 1,
      activityDates: [...streakData.activityDates, today],
      earnedToday:   true,
    };

    setStreakData(newStreak);
    if (user?.uid) await updateStreakFirestore(user.uid, newStreak);

    // Clear earnedToday flag after celebration
    setTimeout(() => {
      setStreakData(prev => prev.earnedToday ? { ...prev, earnedToday: false } : prev);
    }, 4000);
  }, [streakData, user?.uid]);

  const logMeal = useCallback(async (recipe) => {
    if (user?.uid) {
      await logMealToFirestore(user.uid, {
        name: recipe.name,
        emoji: recipe.emoji,
        cal: recipe.cal,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat,
        tag: recipe.tag,
        recipeId: recipe.id,
      });
    }
    showToast(`${recipe.name} logged`);
    await recordActivity();
  }, [user?.uid, showToast, recordActivity]);

  const addReview = useCallback((recipeId, stars, text) => {
    const displayName = user?.displayName || 'You';
    const newReview = {
      id:     `own_${recipeId}_${Date.now()}`,
      user:   displayName.split(' ')[0],
      avatar: (displayName[0] || 'Y').toUpperCase(),
      stars,
      text,
      date:   'Just now',
      isOwn:  true,
    };
    setReviews(prev => ({
      ...prev,
      [recipeId]: [newReview, ...(prev[recipeId] || [])],
    }));
    showToast('Review posted ✓');
  }, [user, showToast]);

  const logWorkout = useCallback(async (workoutData) => {
    if (user?.uid) {
      await logWorkoutToFirestore(user.uid, workoutData);
    }
    showToast('Workout logged! 🔥');
    await recordActivity();
  }, [user?.uid, showToast, recordActivity]);

  // ── Derived values ──────────────────────────────────────────────

  // For today's meals only
  const todayStr = new Date().toDateString();
  const todaysMeals = useMemo(
    () => loggedMeals.filter(m => m.date === todayStr),
    [loggedMeals, todayStr]
  );

  const totalCals    = todaysMeals.reduce((a, m) => a + (m.cal || 0),     0);
  const totalProtein = todaysMeals.reduce((a, m) => a + (m.protein || 0), 0);
  const totalCarbs   = todaysMeals.reduce((a, m) => a + (m.carbs || 0),   0);
  const totalFat     = todaysMeals.reduce((a, m) => a + (m.fat || 0),     0);

  const pantryMeals = useMemo(
    () => scoreRecipes(recipes, pantry, goal),
    [recipes, pantry, goal]
  );

  return (
    <DataContext.Provider value={{
      goal, setGoal,
      age, setAge,
      height, setHeight,
      weight, setWeight,
      diet, setDiet,
      pantry, setPantry,
      loggedMeals, logMeal,
      todaysMeals,
      totalCals, totalProtein, totalCarbs, totalFat,
      streakData, recordActivity,
      completedWorkouts, logWorkout,
      recipes, recipesLoaded,
      reviews, addReview,
      pantryMeals,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
