import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { PANTRY_DEFAULT, RECIPES, MOCK_REVIEWS } from '../constants/data';

const AppContext = createContext(null);

// ── Meal scoring ─────────────────────────────────────────────────
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

// ── Streak initial state (pre-populated with last 3 days for demo) ─
function initStreakData() {
  const dates = [];
  for (let i = 3; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toDateString());
  }
  return { count: 3, activityDates: dates, earnedToday: false };
}

// ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [goal, setGoal]     = useState('Lose Weight');
  const [age, setAge]       = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [diet, setDiet]     = useState('No Restrictions');
  const [pantry, setPantry] = useState(PANTRY_DEFAULT);
  const [loggedMeals, setLoggedMeals] = useState([RECIPES[0]]);
  const [toast, setToast]   = useState(null);
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [streakData, setStreakData] = useState(initStreakData);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  // Records activity for the current day and advances the streak.
  // Uses functional update to avoid stale closure — safe to call from any callback.
  const recordActivity = useCallback(() => {
    setStreakData(prev => {
      const today = new Date().toDateString();
      if (prev.activityDates.includes(today)) return prev; // already earned today

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const continued = prev.activityDates.includes(yesterday.toDateString());

      return {
        count:         continued ? prev.count + 1 : 1,
        activityDates: [...prev.activityDates, today],
        earnedToday:   true,
      };
    });
    // Clear the earnedToday flag after the celebration animation finishes
    setTimeout(() => {
      setStreakData(prev => prev.earnedToday ? { ...prev, earnedToday: false } : prev);
    }, 4000);
  }, []);

  const logMeal = useCallback((recipe) => {
    setLoggedMeals(prev => [...prev, recipe]);
    showToast(`${recipe.name} logged`);
    recordActivity();
  }, [showToast, recordActivity]);

  const addReview = useCallback((recipeId, stars, text) => {
    const newReview = {
      id:     `own_${recipeId}_${Date.now()}`,
      user:   user?.name?.split(' ')[0] || 'You',
      avatar: (user?.name?.[0] || 'Y').toUpperCase(),
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

  const pantryMeals = useMemo(
    () => scoreRecipes(RECIPES, pantry, goal),
    [pantry, goal]
  );

  const totalCals    = loggedMeals.reduce((a, m) => a + m.cal,     0);
  const totalProtein = loggedMeals.reduce((a, m) => a + m.protein, 0);
  const totalCarbs   = loggedMeals.reduce((a, m) => a + m.carbs,   0);
  const totalFat     = loggedMeals.reduce((a, m) => a + m.fat,     0);

  return (
    <AppContext.Provider value={{
      user, setUser,
      goal, setGoal,
      age, setAge,
      height, setHeight,
      weight, setWeight,
      diet, setDiet,
      pantry, setPantry,
      loggedMeals, logMeal,
      totalCals, totalProtein, totalCarbs, totalFat,
      toast, showToast,
      reviews, addReview,
      pantryMeals,
      streakData, recordActivity,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
