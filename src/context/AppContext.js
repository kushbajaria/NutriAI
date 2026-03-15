import React, { createContext, useContext, useState, useCallback } from 'react';
import { PANTRY_DEFAULT, RECIPES } from '../constants/data';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [goal, setGoal]       = useState('Lose Weight');
  const [age, setAge]         = useState('');
  const [height, setHeight]   = useState('');
  const [weight, setWeight]   = useState('');
  const [diet, setDiet]       = useState('No Restrictions');
  const [pantry, setPantry]   = useState(PANTRY_DEFAULT);
  const [loggedMeals, setLoggedMeals] = useState([RECIPES[0]]);
  const [toast, setToast]     = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  const logMeal = useCallback((recipe) => {
    setLoggedMeals(prev => [...prev, recipe]);
    showToast(`${recipe.name} logged`);
  }, [showToast]);

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
      loggedMeals,
      logMeal,
      totalCals,
      totalProtein,
      totalCarbs,
      totalFat,
      toast,
      showToast,
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
