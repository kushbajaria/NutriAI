export const PANTRY_DEFAULT = [
  'chicken breast','rice','eggs','spinach','parmesan','pasta',
  'onions','garlic','olive oil','bell peppers','broccoli','tomatoes',
  'salmon','milk','sweet potatoes','butter','black pepper','cumin',
  'basil','tuna','bacon','vegetable oil',
];

export const COMMON_INGREDIENTS = [
  'greek yogurt','cottage cheese','quinoa','lentils','chickpeas',
  'oats','tofu','tempeh','turkey','pork chops',
  'tilapia','shrimp','lamb','goat cheese','cream cheese',
  'heavy cream','beans','sour cream','feta cheese','couscous',
];

export const RECIPES = [
  {
    id: '1',
    name: 'Seared Salmon Bowl',
    emoji: '🐟',
    cal: 480, diff: 'Easy',
    prepTime: 10, cookTime: 15, servings: 1,
    protein: 42, carbs: 38, fat: 16,
    tag: 'High Protein',
    ingredients: ['salmon','rice','spinach','garlic','olive oil','lemon'],
    instructions: [
      'Season salmon fillet generously with salt, pepper, and garlic powder.',
      'Heat olive oil in a cast iron skillet over high heat until smoking.',
      'Sear salmon skin-side up for 4 minutes until golden crust forms.',
      'Flip and cook 3 more minutes. Remove and rest for 2 minutes.',
      'Cook rice according to package. Wilt spinach in the same pan.',
      'Assemble bowl: rice base, wilted spinach, flaked salmon on top.',
      'Finish with a squeeze of fresh lemon and a drizzle of olive oil.',
    ],
  },
  {
    id: '2',
    name: 'Garlic Herb Chicken',
    emoji: '🍗',
    cal: 520, diff: 'Easy',
    prepTime: 15, cookTime: 25, servings: 2,
    protein: 48, carbs: 42, fat: 14,
    tag: 'Meal Prep',
    ingredients: ['chicken breast','garlic','olive oil','basil','lemon','black pepper'],
    instructions: [
      'Pound chicken to even thickness for consistent cooking.',
      'Mix olive oil, minced garlic, basil, salt, and pepper into a marinade.',
      'Coat chicken thoroughly and let marinate for at least 10 minutes.',
      'Heat skillet over medium-high. Cook chicken 6-7 minutes per side.',
      'Check internal temperature reaches 165°F / 74°C.',
      'Rest chicken 5 minutes before slicing to retain juices.',
      'Serve over rice or vegetables with a squeeze of lemon.',
    ],
  },
  {
    id: '3',
    name: 'Spinach Egg Scramble',
    emoji: '🥚',
    cal: 320, diff: 'Easy',
    prepTime: 5, cookTime: 8, servings: 1,
    protein: 24, carbs: 8, fat: 22,
    tag: 'Quick',
    ingredients: ['eggs','spinach','parmesan','butter','black pepper','garlic'],
    instructions: [
      'Whisk eggs with a pinch of salt and pepper until fully combined.',
      'Melt butter in non-stick pan over medium-low heat.',
      'Add minced garlic and sauté 30 seconds until fragrant.',
      'Add spinach and cook until just wilted, about 1-2 minutes.',
      'Pour in eggs and gently fold with a spatula continuously.',
      'Remove from heat while eggs are still slightly underdone — carry-over cooks them.',
      'Top with freshly grated parmesan and cracked black pepper.',
    ],
  },
  {
    id: '4',
    name: 'Sweet Potato & Tuna',
    emoji: '🍠',
    cal: 410, diff: 'Easy',
    prepTime: 5, cookTime: 20, servings: 1,
    protein: 36, carbs: 48, fat: 8,
    tag: 'Clean Eating',
    ingredients: ['sweet potatoes','tuna','olive oil','black pepper','cumin','onions'],
    instructions: [
      'Pierce sweet potato and microwave 8-10 minutes until tender.',
      'Drain tuna and mix with diced onion, olive oil, cumin, salt, and pepper.',
      'Slice sweet potato open and fluff the inside with a fork.',
      'Pile tuna mixture generously over the sweet potato.',
      'Add a drizzle of olive oil and extra cracked pepper to finish.',
    ],
  },
];

export const WORKOUTS = {
  'Full Body': {
    emoji: '⚡',
    desc: 'Balanced total-body activation',
    exercises: [
      { name: 'Push-ups',     muscle: 'Chest · Triceps',  sets: 3, reps: '12–15', rest: 45 },
      { name: 'Squats',       muscle: 'Quads · Glutes',   sets: 3, reps: '15–20', rest: 45 },
      { name: 'Plank Hold',   muscle: 'Core',             sets: 3, reps: '45 sec', rest: 30 },
      { name: 'Lunges',       muscle: 'Legs · Glutes',    sets: 3, reps: '10 each', rest: 45 },
      { name: 'Pike Push-up', muscle: 'Shoulders · Arms', sets: 3, reps: '8–12',  rest: 45 },
      { name: 'Glute Bridge', muscle: 'Glutes · Hamstrings', sets: 3, reps: '15', rest: 30 },
    ],
  },
  'Upper Body': {
    emoji: '💪',
    desc: 'Chest, back, shoulders & arms',
    exercises: [
      { name: 'Bench Press',     muscle: 'Chest · Triceps',   sets: 4, reps: '8–10',  rest: 60 },
      { name: 'Pull-ups',        muscle: 'Back · Biceps',     sets: 3, reps: '6–10',  rest: 60 },
      { name: 'Dumbbell Rows',   muscle: 'Back',              sets: 3, reps: '10–12', rest: 45 },
      { name: 'Shoulder Press',  muscle: 'Shoulders',         sets: 3, reps: '10',    rest: 45 },
      { name: 'Bicep Curls',     muscle: 'Biceps',            sets: 3, reps: '12–15', rest: 30 },
      { name: 'Tricep Dips',     muscle: 'Triceps',           sets: 3, reps: '12',    rest: 30 },
    ],
  },
  'Lower Body': {
    emoji: '🦵',
    desc: 'Quads, hamstrings & glutes',
    exercises: [
      { name: 'Barbell Squat',      muscle: 'Quads · Glutes',    sets: 4, reps: '8–10',  rest: 90 },
      { name: 'Romanian Deadlift',  muscle: 'Hamstrings',        sets: 3, reps: '10–12', rest: 60 },
      { name: 'Leg Press',          muscle: 'Quads',             sets: 3, reps: '12–15', rest: 60 },
      { name: 'Walking Lunges',     muscle: 'Legs · Glutes',     sets: 3, reps: '12 each',rest:45 },
      { name: 'Calf Raises',        muscle: 'Calves',            sets: 4, reps: '20',    rest: 30 },
      { name: 'Hip Thrusts',        muscle: 'Glutes',            sets: 3, reps: '12',    rest: 45 },
    ],
  },
  'Cardio HIIT': {
    emoji: '🔥',
    desc: 'High intensity interval training',
    exercises: [
      { name: 'Burpees',            muscle: 'Full Body',    sets: 4, reps: '10',    rest: 30 },
      { name: 'Jump Rope',          muscle: 'Cardio',       sets: 5, reps: '2 min', rest: 30 },
      { name: 'Mountain Climbers',  muscle: 'Core · Legs',  sets: 4, reps: '30 sec',rest: 20 },
      { name: 'Box Jumps',          muscle: 'Legs',         sets: 3, reps: '12',    rest: 45 },
      { name: 'High Knees',         muscle: 'Cardio',       sets: 4, reps: '30 sec',rest: 20 },
      { name: 'Jump Squats',        muscle: 'Quads · Glutes',sets: 3, reps: '15',  rest: 30 },
    ],
  },
};

export const DURATIONS = ['20 min', '30 min', '45 min', '60 min'];
export const GOALS = [
  { icon: '🔥', label: 'Lose Weight',  desc: 'Calorie deficit focus' },
  { icon: '💪', label: 'Build Muscle', desc: 'Strength & hypertrophy' },
  { icon: '🧘', label: 'Stay Healthy', desc: 'Balanced wellness' },
  { icon: '⚡', label: 'Boost Energy', desc: 'Performance focus' },
];
export const DIETS = ['No Restrictions','Vegetarian','Vegan','Keto','Gluten-Free','Paleo'];
