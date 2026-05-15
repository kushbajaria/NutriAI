// ONE-TIME SEED SCRIPT — populates Firestore with initial recipe data.
// Do not maintain this file after seeding is complete.

const { FieldValue } = require("firebase-admin/firestore");

// ── Helper: derive enhanced fields from existing recipe data ────────

function deriveCategory(recipe) {
  if (recipe.suggestedTimes && recipe.suggestedTimes.length > 0) {
    return recipe.suggestedTimes[0];
  }
  return 'general';
}

function deriveDietaryFlags(recipe) {
  const flags = [];
  if (recipe.tag === 'Vegetarian') flags.push('vegetarian');
  // Check ingredients for common non-veg items
  const nonVeg = ['chicken', 'salmon', 'tuna', 'shrimp', 'bacon', 'beef', 'steak', 'turkey', 'tilapia', 'ground beef', 'pork'];
  const hasNonVeg = recipe.ingredients.some(ing =>
    nonVeg.some(nv => ing.toLowerCase().includes(nv))
  );
  if (!hasNonVeg && !flags.includes('vegetarian')) flags.push('vegetarian');
  return flags;
}

// ── Recipe data (34 recipes) ────────────────────────────────────────

const RECIPES = [
  {
    id: '1', name: 'Seared Salmon Bowl', icon: 'fish-outline',
    cal: 480, diff: 'Easy', prepTime: 10, cookTime: 15, servings: 1,
    protein: 42, carbs: 38, fat: 16, tag: 'High Protein',
    ingredients: ['salmon', 'rice', 'spinach', 'garlic', 'olive oil'],
    instructions: [
      'Season salmon with salt, pepper, and garlic powder on both sides.',
      'Heat olive oil in a cast iron skillet over high heat until smoking.',
      'Sear salmon skin-side up for 4 minutes until a golden crust forms.',
      'Flip and cook 3 more minutes. Remove and rest for 2 minutes.',
      'Cook rice per package directions. Wilt spinach with garlic in the same pan.',
      'Assemble: rice base, wilted spinach, then flaked salmon on top.',
      'Finish with a squeeze of lemon and a drizzle of olive oil.',
    ],
  },
  {
    id: '2', name: 'Garlic Herb Chicken', icon: 'restaurant-outline',
    cal: 520, diff: 'Easy', prepTime: 15, cookTime: 25, servings: 2,
    protein: 48, carbs: 42, fat: 14, tag: 'Meal Prep',
    ingredients: ['chicken breast', 'garlic', 'olive oil', 'basil', 'black pepper'],
    instructions: [
      'Pound chicken breasts to an even thickness for consistent cooking.',
      'Combine olive oil, minced garlic, fresh basil, salt, and black pepper.',
      'Coat chicken thoroughly and marinate for at least 10 minutes.',
      'Cook in a skillet over medium-high heat, 6–7 minutes per side.',
      'Verify internal temperature reaches 165°F / 74°C.',
      'Rest for 5 minutes before slicing to retain all the juices.',
      'Serve over steamed rice or roasted vegetables.',
    ],
  },
  {
    id: '3', name: 'Spinach Egg Scramble', icon: 'egg-outline',
    cal: 320, diff: 'Easy', prepTime: 5, cookTime: 8, servings: 1,
    protein: 24, carbs: 8, fat: 22, tag: 'Quick',
    ingredients: ['eggs', 'spinach', 'parmesan', 'butter', 'black pepper', 'garlic'],
    instructions: [
      'Whisk 3 eggs with a pinch of salt and black pepper until fully combined.',
      'Melt butter in a non-stick pan over medium-low heat.',
      'Add minced garlic and sauté 30 seconds until fragrant.',
      'Add spinach and cook until just wilted, about 1–2 minutes.',
      'Pour in eggs and fold gently with a spatula — don\'t stir aggressively.',
      'Remove from heat while slightly underdone; carry-over heat finishes them.',
      'Top with freshly grated parmesan and cracked black pepper.',
    ],
  },
  {
    id: '4', name: 'Sweet Potato & Tuna', icon: 'nutrition-outline',
    cal: 410, diff: 'Easy', prepTime: 5, cookTime: 20, servings: 1,
    protein: 36, carbs: 48, fat: 8, tag: 'Clean Eating',
    ingredients: ['sweet potatoes', 'tuna', 'olive oil', 'black pepper', 'cumin', 'onions'],
    instructions: [
      'Pierce sweet potato all over with a fork and microwave 8–10 minutes until tender.',
      'Drain tuna and mix with finely diced onion, olive oil, cumin, salt, and pepper.',
      'Slice the sweet potato open lengthwise and fluff the inside with a fork.',
      'Pile the tuna mixture generously over the sweet potato.',
      'Drizzle with a little extra olive oil and finish with cracked black pepper.',
    ],
  },
  {
    id: '5', name: 'Arrabiata Pasta', icon: 'restaurant-outline',
    cal: 430, diff: 'Easy', prepTime: 5, cookTime: 20, servings: 2,
    protein: 14, carbs: 74, fat: 10, tag: 'Vegetarian',
    ingredients: ['pasta', 'tomatoes', 'garlic', 'olive oil', 'basil', 'onions'],
    instructions: [
      'Cook pasta in heavily salted boiling water until al dente. Reserve ½ cup pasta water.',
      'Meanwhile, sauté diced onion in olive oil over medium heat for 4 minutes.',
      'Add minced garlic and cook 1 minute more until fragrant.',
      'Add chopped fresh tomatoes and a pinch of chilli flakes. Simmer 12 minutes.',
      'Toss drained pasta into the sauce, adding pasta water to loosen as needed.',
      'Remove from heat, fold in torn fresh basil, and finish with a drizzle of olive oil.',
    ],
  },
  {
    id: '6', name: 'Chicken Stir-fry', icon: 'flame-outline',
    cal: 460, diff: 'Medium', prepTime: 15, cookTime: 15, servings: 2,
    protein: 44, carbs: 28, fat: 18, tag: 'Meal Prep',
    ingredients: ['chicken breast', 'broccoli', 'bell peppers', 'garlic', 'vegetable oil', 'onions'],
    instructions: [
      'Slice chicken thin against the grain. Season with salt, pepper, and a splash of soy sauce.',
      'Heat vegetable oil in a wok or large pan over very high heat.',
      'Cook chicken in a single layer 4–5 minutes until golden. Remove and set aside.',
      'Stir-fry broccoli, sliced bell peppers, and onion for 3 minutes — keep them crisp.',
      'Add garlic and toss for 30 seconds until fragrant.',
      'Return chicken to the pan, toss everything together, and cook 1 more minute.',
      'Serve immediately over steamed rice.',
    ],
  },
  {
    id: '7', name: 'Bacon Fried Rice', icon: 'cafe-outline',
    cal: 510, diff: 'Easy', prepTime: 5, cookTime: 15, servings: 1,
    protein: 22, carbs: 56, fat: 22, tag: 'Quick',
    ingredients: ['rice', 'eggs', 'bacon', 'onions', 'garlic', 'vegetable oil'],
    instructions: [
      'Fry bacon in a large pan until crispy. Remove, chop roughly, keep 1 tbsp fat in pan.',
      'Add diced onion to the bacon fat and cook over medium heat for 3 minutes.',
      'Add minced garlic and cook 30 seconds. Add cold cooked rice and press flat.',
      'Leave undisturbed for 2 minutes to develop a crust, then toss.',
      'Push rice to the edges and scramble eggs in the centre over medium-low heat.',
      'Fold the scrambled eggs and chopped bacon through the rice.',
      'Season with black pepper and a splash of soy sauce. Serve hot.',
    ],
  },
  {
    id: '8', name: 'Broccoli Cheese Soup', icon: 'cafe-outline',
    cal: 320, diff: 'Easy', prepTime: 10, cookTime: 20, servings: 2,
    protein: 16, carbs: 22, fat: 18, tag: 'Clean Eating',
    ingredients: ['broccoli', 'onions', 'garlic', 'milk', 'butter', 'parmesan'],
    instructions: [
      'Melt butter in a pot over medium heat. Sauté diced onion for 4 minutes.',
      'Add minced garlic and cook 1 minute more.',
      'Add broccoli florets with just enough water to barely cover. Simmer 12 minutes.',
      'Use an immersion blender to partially blend — keep some texture.',
      'Stir in milk and bring to a gentle simmer. Don\'t let it boil or it will split.',
      'Season generously with salt and pepper. Serve topped with grated parmesan.',
    ],
  },
  {
    id: '9', name: 'Chicken Spinach Pasta', icon: 'restaurant-outline',
    cal: 560, diff: 'Medium', prepTime: 10, cookTime: 25, servings: 2,
    protein: 50, carbs: 54, fat: 14, tag: 'High Protein',
    ingredients: ['pasta', 'chicken breast', 'spinach', 'garlic', 'olive oil', 'parmesan'],
    instructions: [
      'Cook pasta in salted water until al dente. Reserve 1 cup pasta water before draining.',
      'Season chicken and cook in olive oil over medium-high heat, 6–7 min per side. Slice thin.',
      'In the same pan, sauté garlic in the remaining oil for 30 seconds.',
      'Add spinach and wilt for 1–2 minutes.',
      'Add drained pasta with a splash of pasta water and toss to form a light sauce.',
      'Top with sliced chicken and a generous amount of grated parmesan.',
    ],
  },
  {
    id: '10', name: 'Tomato Egg Drop', icon: 'leaf-outline',
    cal: 270, diff: 'Easy', prepTime: 5, cookTime: 10, servings: 1,
    protein: 18, carbs: 14, fat: 16, tag: 'Quick',
    ingredients: ['eggs', 'tomatoes', 'onions', 'garlic', 'vegetable oil', 'black pepper'],
    instructions: [
      'Heat vegetable oil in a pan over medium-high heat.',
      'Sauté diced onion for 2 minutes until softened.',
      'Add minced garlic and cook 30 seconds until fragrant.',
      'Add chopped tomatoes and cook until they break down into a jammy sauce, about 4 minutes.',
      'Whisk eggs separately, then pour around the edges of the tomato base.',
      'Gently fold the eggs through the tomatoes once they begin to set.',
      'Season with black pepper and a pinch of salt. Serve immediately.',
    ],
  },
  {
    id: '11', name: 'Lentil Tomato Soup', icon: 'leaf-outline',
    cal: 360, diff: 'Easy', prepTime: 10, cookTime: 25, servings: 2,
    protein: 20, carbs: 52, fat: 8, tag: 'Vegetarian',
    ingredients: ['lentils', 'tomatoes', 'onions', 'garlic', 'olive oil', 'cumin'],
    instructions: [
      'Sauté diced onion in olive oil over medium heat for 5 minutes.',
      'Add garlic and cumin, stir for 1 minute until fragrant.',
      'Add rinsed lentils and chopped tomatoes. Cover with 3 cups of water.',
      'Bring to a boil, then reduce to a simmer for 20 minutes until lentils are tender.',
      'Season with salt and black pepper. Add more water if too thick.',
      'Serve with a drizzle of olive oil and fresh herbs if available.',
    ],
  },
  {
    id: '12', name: 'Quinoa Chicken Bowl', icon: 'nutrition-outline',
    cal: 490, diff: 'Medium', prepTime: 10, cookTime: 20, servings: 1,
    protein: 46, carbs: 44, fat: 12, tag: 'High Protein',
    ingredients: ['quinoa', 'chicken breast', 'bell peppers', 'spinach', 'olive oil', 'garlic'],
    instructions: [
      'Rinse quinoa and cook in 2:1 water ratio for 15 minutes until fluffy.',
      'Season chicken and cook in olive oil over medium-high heat, 6 min per side.',
      'Rest chicken for 5 minutes, then slice.',
      'In the same pan, sauté garlic and diced bell pepper for 3 minutes.',
      'Add spinach and wilt for 1 minute.',
      'Build the bowl: quinoa base, sautéed vegetables, then sliced chicken on top.',
    ],
  },
  {
    id: '13', name: 'Shrimp Stir-fry', icon: 'fish-outline',
    cal: 340, diff: 'Easy', prepTime: 10, cookTime: 10, servings: 1,
    protein: 34, carbs: 18, fat: 14, tag: 'Quick',
    ingredients: ['shrimp', 'bell peppers', 'garlic', 'vegetable oil', 'onions', 'broccoli'],
    instructions: [
      'Pat shrimp dry and season with salt, pepper, and a pinch of garlic powder.',
      'Heat vegetable oil in a wok over very high heat.',
      'Cook shrimp 1–2 minutes per side until pink and curled. Remove and set aside.',
      'Stir-fry sliced bell peppers, broccoli florets, and onion for 3 minutes.',
      'Add minced garlic and toss for 30 seconds.',
      'Return shrimp to the wok, toss with a splash of soy sauce, and serve immediately.',
    ],
  },
  // ── BREAKFAST ──
  {
    id: '14', name: 'Overnight Oats', icon: 'cafe-outline',
    cal: 340, diff: 'Easy', prepTime: 5, cookTime: 0, servings: 1,
    protein: 14, carbs: 52, fat: 10, tag: 'Quick',
    suggestedTimes: ['breakfast'],
    ingredients: ['oats', 'greek yogurt', 'milk', 'honey', 'berries'],
    instructions: [
      'Combine oats, Greek yogurt, and milk in a jar or container.',
      'Stir in a drizzle of honey until evenly mixed.',
      'Cover and refrigerate overnight (at least 6 hours).',
      'In the morning, top with fresh berries and serve cold.',
    ],
  },
  {
    id: '15', name: 'Protein Pancakes', icon: 'cafe-outline',
    cal: 420, diff: 'Easy', prepTime: 5, cookTime: 10, servings: 2,
    protein: 32, carbs: 44, fat: 12, tag: 'High Protein',
    suggestedTimes: ['breakfast'],
    ingredients: ['eggs', 'oats', 'banana', 'greek yogurt', 'butter'],
    instructions: [
      'Blend oats, eggs, banana, and Greek yogurt into a smooth batter.',
      'Heat a non-stick pan with a small amount of butter over medium heat.',
      'Pour small circles of batter and cook 2-3 minutes per side until golden.',
      'Stack and serve with fresh fruit or a drizzle of honey.',
    ],
  },
  {
    id: '16', name: 'Avocado Toast', icon: 'leaf-outline',
    cal: 310, diff: 'Easy', prepTime: 5, cookTime: 3, servings: 1,
    protein: 12, carbs: 28, fat: 18, tag: 'Quick',
    suggestedTimes: ['breakfast', 'lunch'],
    ingredients: ['bread', 'avocado', 'eggs', 'lemon', 'salt'],
    instructions: [
      'Toast bread until golden and crisp.',
      'Mash avocado with lemon juice, salt, and pepper.',
      'Spread mashed avocado generously over toast.',
      'Top with a fried or poached egg and cracked pepper.',
    ],
  },
  {
    id: '17', name: 'Smoothie Bowl', icon: 'nutrition-outline',
    cal: 290, diff: 'Easy', prepTime: 5, cookTime: 0, servings: 1,
    protein: 16, carbs: 48, fat: 6, tag: 'Clean Eating',
    suggestedTimes: ['breakfast'],
    ingredients: ['banana', 'berries', 'greek yogurt', 'honey', 'oats'],
    instructions: [
      'Blend frozen banana, berries, and Greek yogurt until thick and smooth.',
      'Pour into a bowl — it should be thicker than a drinkable smoothie.',
      'Top with granola/oats, fresh berries, and a drizzle of honey.',
      'Eat immediately with a spoon.',
    ],
  },
  {
    id: '18', name: 'Breakfast Burrito', icon: 'restaurant-outline',
    cal: 480, diff: 'Easy', prepTime: 5, cookTime: 10, servings: 1,
    protein: 28, carbs: 38, fat: 22, tag: 'Meal Prep',
    suggestedTimes: ['breakfast'],
    ingredients: ['tortillas', 'eggs', 'cheese', 'bell pepper', 'onion'],
    instructions: [
      'Scramble eggs in a pan over medium heat with salt and pepper.',
      'Sauté diced bell pepper and onion until softened, about 3 minutes.',
      'Warm a tortilla in a dry pan for 30 seconds per side.',
      'Layer eggs, veggies, and cheese in the center. Fold and roll tightly.',
    ],
  },
  // ── LUNCH ──
  {
    id: '19', name: 'Chicken Caesar Wrap', icon: 'restaurant-outline',
    cal: 440, diff: 'Easy', prepTime: 10, cookTime: 12, servings: 1,
    protein: 38, carbs: 32, fat: 18, tag: 'High Protein',
    suggestedTimes: ['lunch'],
    ingredients: ['chicken breast', 'tortillas', 'lettuce', 'parmesan', 'garlic'],
    instructions: [
      'Season chicken breast and grill or pan-sear 6 minutes per side.',
      'Rest 5 minutes then slice into thin strips.',
      'Warm a large tortilla in a dry pan.',
      'Layer lettuce, chicken, shaved parmesan, and a light dressing.',
      'Roll tightly, cut in half diagonally, and serve.',
    ],
  },
  {
    id: '20', name: 'Mediterranean Bowl', icon: 'leaf-outline',
    cal: 460, diff: 'Easy', prepTime: 10, cookTime: 15, servings: 1,
    protein: 22, carbs: 52, fat: 18, tag: 'Vegetarian',
    suggestedTimes: ['lunch'],
    ingredients: ['quinoa', 'chickpeas', 'cucumber', 'tomatoes', 'feta cheese', 'olive oil'],
    instructions: [
      'Cook quinoa according to package directions and let cool slightly.',
      'Drain and rinse chickpeas. Dice cucumber and tomatoes.',
      'Build the bowl: quinoa base, chickpeas, veggies around the edges.',
      'Crumble feta on top and drizzle with olive oil and lemon juice.',
    ],
  },
  {
    id: '21', name: 'Grilled Chicken Salad', icon: 'leaf-outline',
    cal: 380, diff: 'Easy', prepTime: 10, cookTime: 12, servings: 1,
    protein: 40, carbs: 16, fat: 18, tag: 'Clean Eating',
    suggestedTimes: ['lunch'],
    ingredients: ['chicken breast', 'lettuce', 'tomatoes', 'cucumber', 'olive oil', 'lemon'],
    instructions: [
      'Season chicken with salt, pepper, and a drizzle of olive oil.',
      'Grill or pan-sear 6 minutes per side until cooked through. Slice.',
      'Toss lettuce, diced tomatoes, and cucumber in a bowl.',
      'Top with sliced chicken. Dress with olive oil and lemon juice.',
    ],
  },
  {
    id: '22', name: 'Black Bean Tacos', icon: 'restaurant-outline',
    cal: 390, diff: 'Easy', prepTime: 5, cookTime: 10, servings: 2,
    protein: 18, carbs: 52, fat: 14, tag: 'Vegetarian',
    suggestedTimes: ['lunch', 'dinner'],
    ingredients: ['tortillas', 'beans', 'avocado', 'tomatoes', 'lime', 'onion'],
    instructions: [
      'Heat beans in a pan with cumin, salt, and a splash of water.',
      'Warm tortillas in a dry pan 30 seconds per side.',
      'Mash beans slightly and spoon onto tortillas.',
      'Top with diced avocado, tomatoes, onion, and a squeeze of lime.',
    ],
  },
  {
    id: '23', name: 'Poke Bowl', icon: 'fish-outline',
    cal: 450, diff: 'Medium', prepTime: 15, cookTime: 15, servings: 1,
    protein: 32, carbs: 48, fat: 16, tag: 'High Protein',
    suggestedTimes: ['lunch'],
    ingredients: ['salmon', 'rice', 'avocado', 'cucumber', 'soy sauce'],
    instructions: [
      'Cook sushi rice and season with rice vinegar. Let cool.',
      'Dice salmon into cubes and marinate in soy sauce for 10 minutes.',
      'Slice avocado and cucumber thinly.',
      'Assemble: rice base, salmon, avocado, cucumber. Drizzle with soy sauce.',
    ],
  },
  // ── DINNER ──
  {
    id: '24', name: 'Teriyaki Chicken', icon: 'restaurant-outline',
    cal: 520, diff: 'Medium', prepTime: 10, cookTime: 20, servings: 2,
    protein: 44, carbs: 48, fat: 14, tag: 'Meal Prep',
    suggestedTimes: ['dinner'],
    ingredients: ['chicken breast', 'rice', 'broccoli', 'soy sauce', 'honey', 'garlic'],
    instructions: [
      'Mix soy sauce, honey, and minced garlic into a teriyaki glaze.',
      'Cut chicken into bite-sized pieces and cook in a hot pan 5-6 minutes.',
      'Pour glaze over chicken and cook 2 more minutes until sticky.',
      'Steam broccoli until tender-crisp. Serve over rice with glazed chicken.',
    ],
  },
  {
    id: '25', name: 'Beef & Broccoli', icon: 'flame-outline',
    cal: 480, diff: 'Medium', prepTime: 10, cookTime: 15, servings: 2,
    protein: 40, carbs: 32, fat: 20, tag: 'High Protein',
    suggestedTimes: ['dinner'],
    ingredients: ['steak', 'broccoli', 'garlic', 'soy sauce', 'vegetable oil', 'rice'],
    instructions: [
      'Slice steak thinly against the grain. Season with salt and pepper.',
      'Sear in a hot wok with oil for 2 minutes. Remove and set aside.',
      'Stir-fry broccoli for 3 minutes until bright green.',
      'Add garlic, return beef, and toss with soy sauce. Serve over rice.',
    ],
  },
  {
    id: '26', name: 'Mediterranean Salmon', icon: 'fish-outline',
    cal: 490, diff: 'Easy', prepTime: 5, cookTime: 15, servings: 1,
    protein: 42, carbs: 18, fat: 28, tag: 'Clean Eating',
    suggestedTimes: ['dinner'],
    ingredients: ['salmon', 'tomatoes', 'olive oil', 'lemon', 'garlic'],
    instructions: [
      'Season salmon with salt, pepper, and a squeeze of lemon.',
      'Sear skin-side down in olive oil over high heat for 4 minutes.',
      'Flip and cook 3 more minutes. Remove to a plate.',
      'In the same pan, sauté halved tomatoes and garlic. Spoon over salmon.',
    ],
  },
  {
    id: '27', name: 'Stuffed Bell Peppers', icon: 'nutrition-outline',
    cal: 420, diff: 'Medium', prepTime: 15, cookTime: 30, servings: 2,
    protein: 28, carbs: 38, fat: 16, tag: 'Meal Prep',
    suggestedTimes: ['dinner'],
    ingredients: ['bell pepper', 'ground beef', 'rice', 'tomatoes', 'cheese', 'onion'],
    instructions: [
      'Cut tops off bell peppers and remove seeds. Blanch 3 minutes.',
      'Cook ground beef with diced onion until browned. Drain fat.',
      'Mix in cooked rice and diced tomatoes. Season well.',
      'Stuff peppers with the filling, top with cheese, bake at 375F for 20 minutes.',
    ],
  },
  {
    id: '28', name: 'Thai Basil Stir-fry', icon: 'flame-outline',
    cal: 440, diff: 'Easy', prepTime: 10, cookTime: 10, servings: 2,
    protein: 36, carbs: 34, fat: 16, tag: 'Quick',
    suggestedTimes: ['dinner'],
    ingredients: ['chicken breast', 'basil', 'garlic', 'bell pepper', 'soy sauce', 'rice'],
    instructions: [
      'Slice chicken thinly. Heat oil in a wok over high heat.',
      'Cook chicken 3-4 minutes until golden. Add garlic and bell pepper.',
      'Stir-fry 2 minutes more, then add soy sauce and a pinch of sugar.',
      'Toss in fresh basil leaves just before serving over steamed rice.',
    ],
  },
  {
    id: '29', name: 'Lean Turkey Burger', icon: 'restaurant-outline',
    cal: 400, diff: 'Easy', prepTime: 10, cookTime: 12, servings: 2,
    protein: 34, carbs: 30, fat: 16, tag: 'High Protein',
    suggestedTimes: ['dinner'],
    ingredients: ['turkey', 'bread', 'lettuce', 'tomatoes', 'onion'],
    instructions: [
      'Mix ground turkey with salt, pepper, and minced onion. Form patties.',
      'Cook on a grill or pan over medium-high heat, 5-6 minutes per side.',
      'Toast buns lightly in the same pan.',
      'Assemble with lettuce, tomato, and your choice of condiment.',
    ],
  },
  {
    id: '30', name: 'Baked Cod with Herbs', icon: 'fish-outline',
    cal: 280, diff: 'Easy', prepTime: 5, cookTime: 15, servings: 1,
    protein: 36, carbs: 4, fat: 14, tag: 'Clean Eating',
    suggestedTimes: ['dinner'],
    ingredients: ['tilapia', 'lemon', 'garlic', 'olive oil', 'basil'],
    instructions: [
      'Place fish in a baking dish. Drizzle with olive oil and lemon juice.',
      'Top with minced garlic, torn basil, salt, and pepper.',
      'Bake at 400F for 12-15 minutes until fish flakes easily.',
      'Serve with steamed vegetables or a side salad.',
    ],
  },
  // ── SNACKS ──
  {
    id: '31', name: 'Protein Shake', icon: 'cafe-outline',
    cal: 220, diff: 'Easy', prepTime: 3, cookTime: 0, servings: 1,
    protein: 30, carbs: 18, fat: 4, tag: 'Quick',
    suggestedTimes: ['snack'],
    ingredients: ['milk', 'banana', 'peanut butter', 'oats'],
    instructions: [
      'Add milk, banana, a scoop of peanut butter, and oats to a blender.',
      'Blend on high for 30-60 seconds until completely smooth.',
      'Pour into a glass and drink immediately.',
    ],
  },
  {
    id: '32', name: 'Hummus & Veggies', icon: 'leaf-outline',
    cal: 180, diff: 'Easy', prepTime: 5, cookTime: 0, servings: 1,
    protein: 8, carbs: 22, fat: 8, tag: 'Vegetarian',
    suggestedTimes: ['snack'],
    ingredients: ['chickpeas', 'carrots', 'cucumber', 'bell pepper', 'lemon'],
    instructions: [
      'Blend chickpeas, lemon juice, salt, and a splash of water until smooth.',
      'Slice carrots, cucumber, and bell pepper into sticks.',
      'Serve hummus in a bowl with veggie sticks for dipping.',
    ],
  },
  {
    id: '33', name: 'Cottage Cheese Bowl', icon: 'nutrition-outline',
    cal: 200, diff: 'Easy', prepTime: 3, cookTime: 0, servings: 1,
    protein: 24, carbs: 16, fat: 4, tag: 'High Protein',
    suggestedTimes: ['snack'],
    ingredients: ['cottage cheese', 'berries', 'honey'],
    instructions: [
      'Scoop cottage cheese into a bowl.',
      'Top with fresh berries and a drizzle of honey.',
      'Eat immediately — simple and high protein.',
    ],
  },
  {
    id: '34', name: 'Rice Cakes & PB', icon: 'nutrition-outline',
    cal: 240, diff: 'Easy', prepTime: 2, cookTime: 0, servings: 1,
    protein: 8, carbs: 28, fat: 12, tag: 'Quick',
    suggestedTimes: ['snack'],
    ingredients: ['rice', 'peanut butter', 'banana', 'honey'],
    instructions: [
      'Spread peanut butter generously on rice cakes.',
      'Slice banana thinly and arrange on top.',
      'Drizzle with honey and enjoy.',
    ],
  },
];

// ── Mock reviews (recipes 1-13) ─────────────────────────────────────

const MOCK_REVIEWS = {
  '1': [
    { user: 'Alex M.', avatar: 'A', stars: 5, text: 'Made this twice this week. The crust on the salmon was perfect.', date: '2d ago' },
    { user: 'Jordan K.', avatar: 'J', stars: 4, text: 'Really filling and hits macros perfectly. Added some lemon zest.', date: '5d ago' },
    { user: 'Sam R.', avatar: 'S', stars: 5, text: 'My go-to post-workout meal. Quick, clean, and delicious.', date: '1w ago' },
  ],
  '2': [
    { user: 'Taylor B.', avatar: 'T', stars: 5, text: 'Meal-prepped 4 servings on Sunday. Holds up great in the fridge.', date: '1d ago' },
    { user: 'Morgan P.', avatar: 'M', stars: 4, text: 'Simple but really flavourful. Added chilli flakes for heat.', date: '3d ago' },
  ],
  '3': [
    { user: 'Casey L.', avatar: 'C', stars: 5, text: 'Best quick breakfast. I always keep these ingredients stocked.', date: '3d ago' },
    { user: 'Riley D.', avatar: 'R', stars: 4, text: 'Creamy and fast. Swapped parmesan for feta — also great.', date: '6d ago' },
    { user: 'Drew N.', avatar: 'D', stars: 5, text: 'Perfect macros for a cut. Light but really satisfying.', date: '1w ago' },
  ],
  '4': [
    { user: 'Quinn F.', avatar: 'Q', stars: 4, text: 'Great clean meal. The cumin makes all the difference.', date: '4d ago' },
    { user: 'Blake H.', avatar: 'B', stars: 5, text: 'Surprisingly filling for the calories. My go-to on a cut.', date: '1w ago' },
  ],
  '5': [
    { user: 'Avery S.', avatar: 'A', stars: 5, text: 'As good as any restaurant version. The pasta water trick is key.', date: '2d ago' },
    { user: 'Parker W.', avatar: 'P', stars: 4, text: 'Quick weeknight dinner. Added a pinch of chilli for extra heat.', date: '5d ago' },
  ],
  '6': [
    { user: 'Morgan P.', avatar: 'M', stars: 5, text: 'High protein and so easy to batch cook. Best stir-fry ratio.', date: '1d ago' },
    { user: 'Alex M.', avatar: 'A', stars: 4, text: 'Crispy veggies, tender chicken. Nailed it on the second try.', date: '4d ago' },
    { user: 'Jamie V.', avatar: 'J', stars: 5, text: 'Perfect for meal prep — stays great in the fridge for 4 days.', date: '1w ago' },
  ],
  '7': [
    { user: 'Sam R.', avatar: 'S', stars: 4, text: 'Comfort food with solid macros. Don\'t skip the crispy rice step.', date: '3d ago' },
    { user: 'Casey L.', avatar: 'C', stars: 5, text: 'The bacon fat and egg combo is incredible. Absolute 10/10.', date: '6d ago' },
  ],
  '8': [
    { user: 'Taylor B.', avatar: 'T', stars: 5, text: 'Warm, filling, and easy. Perfect for a rest day.', date: '2d ago' },
    { user: 'Drew N.', avatar: 'D', stars: 4, text: 'Creamy without any heavy cream. The parmesan finish is essential.', date: '5d ago' },
  ],
  '9': [
    { user: 'Jordan K.', avatar: 'J', stars: 5, text: 'One of my weekly staples. High protein without feeling heavy.', date: '1d ago' },
    { user: 'Riley D.', avatar: 'R', stars: 5, text: 'The pasta water sauce technique is a total game-changer.', date: '4d ago' },
    { user: 'Quinn F.', avatar: 'Q', stars: 4, text: 'Really solid. Added sun-dried tomatoes for extra depth.', date: '1w ago' },
  ],
  '10': [
    { user: 'Blake H.', avatar: 'B', stars: 4, text: 'Fast and light. Perfect when I need something under 300 cal.', date: '3d ago' },
    { user: 'Avery S.', avatar: 'A', stars: 5, text: 'The tomatoes get jammy and sweet. Love this for a quick lunch.', date: '6d ago' },
  ],
  '11': [
    { user: 'Parker W.', avatar: 'P', stars: 5, text: 'Rich and hearty. Perfect winter meal. So easy to make.', date: '2d ago' },
    { user: 'Jamie V.', avatar: 'J', stars: 4, text: 'Great plant-based protein hit. Added a squeeze of lemon at the end.', date: '4d ago' },
  ],
  '12': [
    { user: 'Morgan P.', avatar: 'M', stars: 5, text: 'Quinoa makes this so filling. Perfect macro split for muscle building.', date: '1d ago' },
    { user: 'Casey L.', avatar: 'C', stars: 4, text: 'Clean and satisfying. I make this on Sundays for the week.', date: '3d ago' },
  ],
  '13': [
    { user: 'Alex M.', avatar: 'A', stars: 5, text: 'Shrimp cooks so fast and the veggies stay crispy. Perfect weeknight.', date: '2d ago' },
    { user: 'Sam R.', avatar: 'S', stars: 5, text: 'Low cal, high protein, done in 20 minutes. My new favourite.', date: '5d ago' },
  ],
};

// ── Seed function ───────────────────────────────────────────────────

async function seedRecipesAndReviews(db) {
  const batch = db.batch();
  let recipesSeeded = 0;

  for (const recipe of RECIPES) {
    const ref = db.collection("recipes").doc(recipe.id);
    const { id, ...data } = recipe;
    batch.set(ref, {
      ...data,
      suggestedTimes: data.suggestedTimes || [],
      premium: false,
      dietaryFlags: deriveDietaryFlags(recipe),
      category: deriveCategory(recipe),
      cuisine: 'American',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    recipesSeeded++;
  }

  await batch.commit();

  // Seed reviews (separate batches since subcollections)
  let reviewsSeeded = 0;
  const reviewBatch = db.batch();

  for (const [recipeId, reviews] of Object.entries(MOCK_REVIEWS)) {
    for (const review of reviews) {
      const ref = db.collection("recipes").doc(recipeId)
        .collection("reviews").doc();
      reviewBatch.set(ref, {
        ...review,
        uid: 'seed_user',
        createdAt: FieldValue.serverTimestamp(),
      });
      reviewsSeeded++;
    }
  }

  await reviewBatch.commit();

  return { recipesSeeded, reviewsSeeded };
}

module.exports = { seedRecipesAndReviews };
