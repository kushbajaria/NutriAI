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
  addReviewToFirestore,
  setWaterIntake,
  subscribeWater,
} from '../services/firestore';
import { cacheRecipes, getCachedRecipes, cacheUserData, getCachedUserData } from '../services/cache';
import { hapticSuccess, hapticMedium, hapticSelection } from '../utils/haptics';
import { initHealthKit, isHealthKitAvailable, writeMealToHealthKit, writeWorkoutToHealthKit, getTodaySteps, getTodayActiveCalories } from '../services/healthkit';
import { RECIPES as FALLBACK_RECIPES, MOCK_REVIEWS } from '../constants/data';

const DataContext = createContext(null);

// ── TDEE Calculation (Mifflin-St Jeor) ──────────────────────────
function calculateTDEE(age, height, weight, units, goal) {
  const ageNum = parseInt(age, 10);
  const heightNum = parseFloat(height);
  const weightNum = parseFloat(weight);
  if (!ageNum || !heightNum || !weightNum) return 2200; // fallback

  const weightKg = units === 'Imperial' ? weightNum * 0.453592 : weightNum;
  const heightCm = units === 'Imperial' ? heightNum * 2.54 : heightNum;
  // Using gender-neutral average of male/female formulas
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum;
  const tdee = Math.round(bmr * 1.55); // moderate activity

  // Adjust for goal
  if (goal === 'Lose Weight')  return Math.round(tdee - 500);
  if (goal === 'Build Muscle') return Math.round(tdee + 300);
  return tdee;
}

function calculateMacroGoals(calGoal, goal) {
  if (goal === 'Build Muscle') {
    return {
      proteinGoal: Math.round(calGoal * 0.35 / 4),
      carbsGoal:   Math.round(calGoal * 0.40 / 4),
      fatGoal:     Math.round(calGoal * 0.25 / 9),
    };
  }
  if (goal === 'Lose Weight') {
    return {
      proteinGoal: Math.round(calGoal * 0.30 / 4),
      carbsGoal:   Math.round(calGoal * 0.40 / 4),
      fatGoal:     Math.round(calGoal * 0.30 / 9),
    };
  }
  // Default balanced
  return {
    proteinGoal: Math.round(calGoal * 0.25 / 4),
    carbsGoal:   Math.round(calGoal * 0.50 / 4),
    fatGoal:     Math.round(calGoal * 0.25 / 9),
  };
}

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
  const [units, setUnitsLocal]     = useState('Imperial');
  const [pantry, setPantryLocal]   = useState([]);
  const [loggedMeals, setLoggedMeals] = useState([]);
  const [streakData, setStreakData]    = useState({ count: 0, activityDates: [], earnedToday: false });
  const [completedWorkouts, setCompletedWorkouts] = useState([]);
  const [recipes, setRecipes]      = useState(FALLBACK_RECIPES);
  const [recipesLoaded, setRecipesLoaded] = useState(false);
  const [reviews, setReviews]      = useState(MOCK_REVIEWS || {});
  const [calGoalOverride, setCalGoalOverride] = useState(null);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const waterGoal = 8;
  const [healthKitEnabled, setHealthKitEnabled] = useState(false);
  const [todaySteps, setTodaySteps] = useState(0);
  const [todayActiveCal, setTodayActiveCal] = useState(0);

  // Initialize HealthKit
  useEffect(() => {
    (async () => {
      const available = await isHealthKitAvailable();
      if (!available) return;
      try {
        await initHealthKit();
        setHealthKitEnabled(true);
        const [steps, cal] = await Promise.all([getTodaySteps(), getTodayActiveCalories()]);
        setTodaySteps(steps);
        setTodayActiveCal(cal);
      } catch (err) {
        console.warn('HealthKit init failed:', err.message);
      }
    })();
  }, []);

  // Refresh HealthKit activity data periodically
  useEffect(() => {
    if (!healthKitEnabled) return;
    const interval = setInterval(async () => {
      try {
        const [steps, cal] = await Promise.all([getTodaySteps(), getTodayActiveCalories()]);
        setTodaySteps(steps);
        setTodayActiveCal(cal);
      } catch {}
    }, 60000); // every 60s
    return () => clearInterval(interval);
  }, [healthKitEnabled]);

  // Sync profile data from AuthContext
  useEffect(() => {
    if (profile) {
      if (profile.goal)   setGoalLocal(profile.goal);
      if (profile.age)    setAgeLocal(profile.age);
      if (profile.height) setHeightLocal(profile.height);
      if (profile.weight) setWeightLocal(profile.weight);
      if (profile.diet)   setDietLocal(profile.diet);
      if (profile.units)  setUnitsLocal(profile.units);
      if (profile.calGoal) setCalGoalOverride(profile.calGoal);
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

    const onSubError = (label) => (err) => {
      console.warn(`${label} subscription error:`, err.message);
    };

    const unsubscribers = [
      subscribePantry(user.uid, (items) => {
        setPantryLocal(items);
        cacheUserData('pantry', items);
      }, onSubError('Pantry')),
      subscribeMeals(user.uid, (meals) => {
        setLoggedMeals(meals);
        cacheUserData('meals', meals);
      }, onSubError('Meals')),
      subscribeStreak(user.uid, (data) => {
        setStreakData(data);
        cacheUserData('streak', data);
      }, onSubError('Streak')),
      subscribeWorkouts(user.uid, (workouts) => {
        setCompletedWorkouts(workouts);
        cacheUserData('workouts', workouts);
      }, onSubError('Workouts')),
      subscribeWater(user.uid, new Date().toDateString(), (glasses) => {
        setWaterGlasses(glasses);
      }, onSubError('Water')),
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

  const safeUpdate = useCallback(async (field, value) => {
    if (!user?.uid) return;
    try {
      await updateUserProfile(user.uid, { [field]: value });
    } catch (err) {
      console.warn(`Failed to save ${field}:`, err.message);
      showToast('Failed to save. Try again.');
    }
  }, [user?.uid, showToast]);

  const setGoal = useCallback(async (val) => {
    setGoalLocal(val);
    await safeUpdate('goal', val);
  }, [safeUpdate]);

  const setAge = useCallback(async (val) => {
    setAgeLocal(val);
    await safeUpdate('age', val);
  }, [safeUpdate]);

  const setHeight = useCallback(async (val) => {
    setHeightLocal(val);
    await safeUpdate('height', val);
  }, [safeUpdate]);

  const setWeight = useCallback(async (val) => {
    setWeightLocal(val);
    await safeUpdate('weight', val);
  }, [safeUpdate]);

  const setDiet = useCallback(async (val) => {
    setDietLocal(val);
    await safeUpdate('diet', val);
  }, [safeUpdate]);

  const setUnits = useCallback(async (val) => {
    setUnitsLocal(val);
    await safeUpdate('units', val);
  }, [safeUpdate]);

  const setPantry = useCallback(async (items) => {
    setPantryLocal(items);
    if (user?.uid) {
      try {
        await setPantryFirestore(user.uid, items);
      } catch (err) {
        console.warn('Failed to save pantry:', err.message);
      }
    }
  }, [user?.uid]);

  // ── Actions ─────────────────────────────────────────────────────

  const recordActivity = useCallback(async () => {
    const today = new Date().toDateString();
    if (streakData.activityDates.includes(today)) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const continued = streakData.activityDates.includes(yesterday.toDateString());

    // Prune activityDates to last 60 entries
    const prunedDates = [...streakData.activityDates, today].slice(-60);

    const newStreak = {
      count:         continued ? streakData.count + 1 : 1,
      activityDates: prunedDates,
      earnedToday:   true,
    };

    setStreakData(newStreak);
    if (user?.uid) {
      try {
        await updateStreakFirestore(user.uid, newStreak);
      } catch (err) {
        console.warn('Failed to update streak:', err.message);
      }
    }

    // Clear earnedToday flag after celebration
    setTimeout(() => {
      setStreakData(prev => prev.earnedToday ? { ...prev, earnedToday: false } : prev);
    }, 4000);
  }, [streakData, user?.uid]);

  const logMeal = useCallback(async (recipe) => {
    try {
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
      hapticSuccess();
      if (healthKitEnabled) writeMealToHealthKit(recipe).catch(() => {});
      showToast(`${recipe.name} logged`);
      await recordActivity();
    } catch (err) {
      console.warn('Failed to log meal:', err.message);
      showToast('Failed to log meal. Try again.');
    }
  }, [user?.uid, showToast, recordActivity, healthKitEnabled]);

  const addReview = useCallback(async (recipeId, stars, text) => {
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
    hapticMedium();
    showToast('Review posted');

    // Persist to Firestore
    if (user?.uid) {
      try {
        await addReviewToFirestore(recipeId, user.uid, { stars, text });
      } catch (err) {
        console.warn('Failed to persist review:', err.message);
      }
    }
  }, [user, showToast]);

  const logWorkout = useCallback(async (workoutData) => {
    try {
      if (user?.uid) {
        await logWorkoutToFirestore(user.uid, workoutData);
      }
      hapticSuccess();
      if (healthKitEnabled) writeWorkoutToHealthKit(workoutData).catch(() => {});
      showToast('Workout logged!');
      await recordActivity();
    } catch (err) {
      console.warn('Failed to log workout:', err.message);
      showToast('Failed to log workout. Try again.');
    }
  }, [user?.uid, showToast, recordActivity, healthKitEnabled]);

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

  // Calorie & macro goals (computed or custom override)
  const calGoal = calGoalOverride || calculateTDEE(age, height, weight, units, goal);
  const macroGoals = useMemo(() => calculateMacroGoals(calGoal, goal), [calGoal, goal]);

  const addWater = useCallback(async () => {
    hapticSelection();
    const newCount = waterGlasses + 1;
    setWaterGlasses(newCount);
    if (user?.uid) {
      try {
        await setWaterIntake(user.uid, new Date().toDateString(), newCount);
      } catch (err) {
        console.warn('Failed to save water:', err.message);
      }
    }
  }, [waterGlasses, user?.uid]);

  const removeWater = useCallback(async () => {
    hapticSelection();
    const newCount = Math.max(0, waterGlasses - 1);
    setWaterGlasses(newCount);
    if (user?.uid) {
      try {
        await setWaterIntake(user.uid, new Date().toDateString(), newCount);
      } catch (err) {
        console.warn('Failed to save water:', err.message);
      }
    }
  }, [waterGlasses, user?.uid]);

  const setCalGoal = useCallback(async (val) => {
    const num = parseInt(val, 10);
    if (!num || num <= 0) return;
    setCalGoalOverride(num);
    await safeUpdate('calGoal', num);
  }, [safeUpdate]);

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
      units, setUnits,
      pantry, setPantry,
      loggedMeals, logMeal,
      todaysMeals,
      totalCals, totalProtein, totalCarbs, totalFat,
      calGoal, setCalGoal, macroGoals,
      streakData, recordActivity,
      completedWorkouts, logWorkout,
      recipes, recipesLoaded,
      reviews, addReview,
      pantryMeals,
      waterGlasses, waterGoal, addWater, removeWater,
      healthKitEnabled, todaySteps, todayActiveCal,
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
