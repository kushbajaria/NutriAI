export const PANTRY_DEFAULT = [
  'chicken breast','rice','eggs','spinach','parmesan','pasta',
  'onions','garlic','olive oil','bell peppers','broccoli','tomatoes',
  'salmon','milk','sweet potatoes','butter','black pepper','cumin',
  'basil','tuna','bacon','vegetable oil',
];

export const COMMON_INGREDIENTS = [
  // Proteins
  'chicken breast','ground beef','salmon','shrimp','turkey','eggs','tofu','tempeh',
  'bacon','sausage','tuna','tilapia','lamb','pork chops','steak',
  // Dairy
  'milk','butter','cheese','greek yogurt','cottage cheese','cream cheese',
  'sour cream','heavy cream','feta cheese','goat cheese','mozzarella','parmesan',
  // Grains & Carbs
  'rice','pasta','bread','oats','quinoa','couscous','tortillas','flour',
  'lentils','chickpeas','beans','potatoes','sweet potatoes','noodles',
  // Vegetables
  'onion','garlic','tomatoes','spinach','broccoli','bell pepper','carrots',
  'celery','mushrooms','zucchini','cucumber','lettuce','kale','corn',
  'avocado','green beans','peas','cauliflower','cabbage','jalapeño',
  // Fruits
  'banana','apple','lemon','lime','berries','orange','mango','pineapple',
  // Pantry Staples
  'olive oil','vegetable oil','salt','pepper','sugar','honey','soy sauce',
  'vinegar','hot sauce','mustard','ketchup','mayo','peanut butter',
  'coconut milk','tomato sauce','chicken broth','canned tomatoes',
];

export const WORKOUTS = {
  'Full Body': {
    icon: 'body-outline',
    desc: 'Balanced total-body activation',
    calBurn: { '20 min': 150, '30 min': 220, '45 min': 330, '60 min': 440 },
    byDuration: {
      '20 min': [
        { name: 'Push-ups',   muscle: 'Chest · Triceps', sets: 3, reps: '12–15',  rest: 45 },
        { name: 'Squats',     muscle: 'Quads · Glutes',  sets: 3, reps: '15–20',  rest: 45 },
        { name: 'Plank Hold', muscle: 'Core',            sets: 3, reps: '40 sec', rest: 30 },
        { name: 'Lunges',     muscle: 'Legs · Glutes',   sets: 3, reps: '10 each',rest: 45 },
      ],
      '30 min': [
        { name: 'Push-ups',     muscle: 'Chest · Triceps',     sets: 3, reps: '12–15',  rest: 45 },
        { name: 'Squats',       muscle: 'Quads · Glutes',      sets: 3, reps: '15–20',  rest: 45 },
        { name: 'Plank Hold',   muscle: 'Core',                sets: 3, reps: '45 sec', rest: 30 },
        { name: 'Lunges',       muscle: 'Legs · Glutes',       sets: 3, reps: '10 each',rest: 45 },
        { name: 'Pike Push-up', muscle: 'Shoulders · Arms',    sets: 3, reps: '8–12',   rest: 45 },
        { name: 'Glute Bridge', muscle: 'Glutes · Hamstrings', sets: 3, reps: '15',     rest: 30 },
      ],
      '45 min': [
        { name: 'Push-ups',          muscle: 'Chest · Triceps',     sets: 4, reps: '12–15',  rest: 45 },
        { name: 'Squats',            muscle: 'Quads · Glutes',      sets: 4, reps: '15–20',  rest: 45 },
        { name: 'Plank Hold',        muscle: 'Core',                sets: 3, reps: '60 sec', rest: 30 },
        { name: 'Lunges',            muscle: 'Legs · Glutes',       sets: 3, reps: '12 each',rest: 45 },
        { name: 'Pike Push-up',      muscle: 'Shoulders · Arms',    sets: 3, reps: '10–12',  rest: 45 },
        { name: 'Glute Bridge',      muscle: 'Glutes · Hamstrings', sets: 3, reps: '15',     rest: 30 },
        { name: 'Mountain Climbers', muscle: 'Core · Legs',         sets: 3, reps: '30 sec', rest: 20 },
        { name: 'Burpees',           muscle: 'Full Body',           sets: 3, reps: '10',     rest: 40 },
      ],
      '60 min': [
        { name: 'Push-ups',          muscle: 'Chest · Triceps',     sets: 4, reps: '15',     rest: 45 },
        { name: 'Squats',            muscle: 'Quads · Glutes',      sets: 4, reps: '20',     rest: 45 },
        { name: 'Plank Hold',        muscle: 'Core',                sets: 4, reps: '60 sec', rest: 30 },
        { name: 'Lunges',            muscle: 'Legs · Glutes',       sets: 4, reps: '12 each',rest: 45 },
        { name: 'Pike Push-up',      muscle: 'Shoulders · Arms',    sets: 3, reps: '12',     rest: 45 },
        { name: 'Glute Bridge',      muscle: 'Glutes · Hamstrings', sets: 4, reps: '15',     rest: 30 },
        { name: 'Mountain Climbers', muscle: 'Core · Legs',         sets: 4, reps: '30 sec', rest: 20 },
        { name: 'Burpees',           muscle: 'Full Body',           sets: 3, reps: '12',     rest: 40 },
        { name: 'Dumbbell Rows',     muscle: 'Back · Biceps',       sets: 4, reps: '10–12',  rest: 45 },
        { name: 'Hip Thrusts',       muscle: 'Glutes',              sets: 3, reps: '15',     rest: 30 },
        { name: 'Calf Raises',       muscle: 'Calves',              sets: 4, reps: '20',     rest: 20 },
      ],
    },
  },
  'Upper Body': {
    icon: 'barbell-outline',
    desc: 'Chest, back, shoulders & arms',
    calBurn: { '20 min': 120, '30 min': 180, '45 min': 270, '60 min': 360 },
    byDuration: {
      '20 min': [
        { name: 'Bench Press',    muscle: 'Chest · Triceps', sets: 3, reps: '10',    rest: 60 },
        { name: 'Pull-ups',       muscle: 'Back · Biceps',   sets: 3, reps: '6–8',   rest: 60 },
        { name: 'Shoulder Press', muscle: 'Shoulders',       sets: 3, reps: '10',    rest: 45 },
        { name: 'Bicep Curls',    muscle: 'Biceps',          sets: 3, reps: '12',    rest: 30 },
      ],
      '30 min': [
        { name: 'Bench Press',    muscle: 'Chest · Triceps', sets: 4, reps: '8–10',  rest: 60 },
        { name: 'Pull-ups',       muscle: 'Back · Biceps',   sets: 3, reps: '6–10',  rest: 60 },
        { name: 'Dumbbell Rows',  muscle: 'Back',            sets: 3, reps: '10–12', rest: 45 },
        { name: 'Shoulder Press', muscle: 'Shoulders',       sets: 3, reps: '10',    rest: 45 },
        { name: 'Bicep Curls',    muscle: 'Biceps',          sets: 3, reps: '12–15', rest: 30 },
        { name: 'Tricep Dips',    muscle: 'Triceps',         sets: 3, reps: '12',    rest: 30 },
      ],
      '45 min': [
        { name: 'Bench Press',       muscle: 'Chest · Triceps', sets: 4, reps: '8–10',  rest: 60 },
        { name: 'Pull-ups',          muscle: 'Back · Biceps',   sets: 4, reps: '6–10',  rest: 60 },
        { name: 'Dumbbell Rows',     muscle: 'Back',            sets: 3, reps: '10–12', rest: 45 },
        { name: 'Shoulder Press',    muscle: 'Shoulders',       sets: 3, reps: '10–12', rest: 45 },
        { name: 'Bicep Curls',       muscle: 'Biceps',          sets: 3, reps: '12–15', rest: 30 },
        { name: 'Tricep Dips',       muscle: 'Triceps',         sets: 3, reps: '12',    rest: 30 },
        { name: 'Lateral Raises',    muscle: 'Shoulders',       sets: 3, reps: '15',    rest: 30 },
        { name: 'Face Pulls',        muscle: 'Rear Delts',      sets: 3, reps: '15',    rest: 30 },
      ],
      '60 min': [
        { name: 'Bench Press',       muscle: 'Chest · Triceps', sets: 4, reps: '8–10',  rest: 60 },
        { name: 'Pull-ups',          muscle: 'Back · Biceps',   sets: 4, reps: '8–10',  rest: 60 },
        { name: 'Dumbbell Rows',     muscle: 'Back',            sets: 4, reps: '10–12', rest: 45 },
        { name: 'Shoulder Press',    muscle: 'Shoulders',       sets: 4, reps: '10–12', rest: 45 },
        { name: 'Bicep Curls',       muscle: 'Biceps',          sets: 3, reps: '12–15', rest: 30 },
        { name: 'Tricep Dips',       muscle: 'Triceps',         sets: 3, reps: '12',    rest: 30 },
        { name: 'Lateral Raises',    muscle: 'Shoulders',       sets: 3, reps: '15',    rest: 30 },
        { name: 'Face Pulls',        muscle: 'Rear Delts',      sets: 3, reps: '15',    rest: 30 },
        { name: 'Hammer Curls',      muscle: 'Biceps · Forearm',sets: 3, reps: '12',    rest: 30 },
        { name: 'Skull Crushers',    muscle: 'Triceps',         sets: 3, reps: '10–12', rest: 30 },
        { name: 'Cable Flyes',       muscle: 'Chest',           sets: 4, reps: '12',    rest: 45 },
      ],
    },
  },
  'Lower Body': {
    icon: 'walk-outline',
    desc: 'Quads, hamstrings & glutes',
    calBurn: { '20 min': 130, '30 min': 200, '45 min': 290, '60 min': 390 },
    byDuration: {
      '20 min': [
        { name: 'Barbell Squat',     muscle: 'Quads · Glutes', sets: 3, reps: '10',     rest: 75 },
        { name: 'Romanian Deadlift', muscle: 'Hamstrings',     sets: 3, reps: '10–12',  rest: 60 },
        { name: 'Walking Lunges',    muscle: 'Legs · Glutes',  sets: 3, reps: '10 each',rest: 45 },
        { name: 'Calf Raises',       muscle: 'Calves',         sets: 3, reps: '20',     rest: 30 },
      ],
      '30 min': [
        { name: 'Barbell Squat',     muscle: 'Quads · Glutes', sets: 4, reps: '8–10',   rest: 90 },
        { name: 'Romanian Deadlift', muscle: 'Hamstrings',     sets: 3, reps: '10–12',  rest: 60 },
        { name: 'Leg Press',         muscle: 'Quads',          sets: 3, reps: '12–15',  rest: 60 },
        { name: 'Walking Lunges',    muscle: 'Legs · Glutes',  sets: 3, reps: '12 each',rest: 45 },
        { name: 'Calf Raises',       muscle: 'Calves',         sets: 4, reps: '20',     rest: 30 },
        { name: 'Hip Thrusts',       muscle: 'Glutes',         sets: 3, reps: '12',     rest: 45 },
      ],
      '45 min': [
        { name: 'Barbell Squat',     muscle: 'Quads · Glutes', sets: 4, reps: '8–10',   rest: 90 },
        { name: 'Romanian Deadlift', muscle: 'Hamstrings',     sets: 4, reps: '10–12',  rest: 60 },
        { name: 'Leg Press',         muscle: 'Quads',          sets: 3, reps: '12–15',  rest: 60 },
        { name: 'Walking Lunges',    muscle: 'Legs · Glutes',  sets: 3, reps: '12 each',rest: 45 },
        { name: 'Calf Raises',       muscle: 'Calves',         sets: 4, reps: '20',     rest: 30 },
        { name: 'Hip Thrusts',       muscle: 'Glutes',         sets: 4, reps: '12',     rest: 45 },
        { name: 'Leg Curls',         muscle: 'Hamstrings',     sets: 3, reps: '12–15',  rest: 45 },
        { name: 'Sumo Squats',       muscle: 'Inner Thighs',   sets: 3, reps: '15',     rest: 40 },
        { name: 'Step-ups',          muscle: 'Quads · Glutes', sets: 3, reps: '10 each',rest: 40 },
      ],
      '60 min': [
        { name: 'Barbell Squat',          muscle: 'Quads · Glutes',  sets: 5, reps: '8–10',   rest: 90 },
        { name: 'Romanian Deadlift',      muscle: 'Hamstrings',      sets: 4, reps: '10–12',  rest: 60 },
        { name: 'Leg Press',              muscle: 'Quads',           sets: 4, reps: '12–15',  rest: 60 },
        { name: 'Walking Lunges',         muscle: 'Legs · Glutes',   sets: 4, reps: '12 each',rest: 45 },
        { name: 'Calf Raises',            muscle: 'Calves',          sets: 5, reps: '20',     rest: 30 },
        { name: 'Hip Thrusts',            muscle: 'Glutes',          sets: 4, reps: '15',     rest: 45 },
        { name: 'Leg Curls',              muscle: 'Hamstrings',      sets: 3, reps: '12–15',  rest: 45 },
        { name: 'Sumo Squats',            muscle: 'Inner Thighs',    sets: 3, reps: '15',     rest: 40 },
        { name: 'Bulgarian Split Squat',  muscle: 'Quads · Glutes',  sets: 3, reps: '10 each',rest: 60 },
        { name: 'Leg Extensions',         muscle: 'Quads',           sets: 3, reps: '15',     rest: 45 },
        { name: 'Seated Calf Raises',     muscle: 'Calves',          sets: 4, reps: '20',     rest: 20 },
        { name: 'Good Mornings',          muscle: 'Hamstrings · Lower Back', sets: 3, reps: '12', rest: 45 },
      ],
    },
  },
  'Cardio HIIT': {
    icon: 'flame-outline',
    desc: 'High intensity interval training',
    calBurn: { '20 min': 200, '30 min': 300, '45 min': 420, '60 min': 560 },
    byDuration: {
      '20 min': [
        { name: 'Burpees',           muscle: 'Full Body',     sets: 3, reps: '10',    rest: 30 },
        { name: 'Jump Rope',         muscle: 'Cardio',        sets: 3, reps: '90 sec',rest: 30 },
        { name: 'Mountain Climbers', muscle: 'Core · Legs',   sets: 3, reps: '30 sec',rest: 20 },
        { name: 'High Knees',        muscle: 'Cardio',        sets: 3, reps: '30 sec',rest: 20 },
      ],
      '30 min': [
        { name: 'Burpees',           muscle: 'Full Body',     sets: 4, reps: '10',    rest: 30 },
        { name: 'Jump Rope',         muscle: 'Cardio',        sets: 5, reps: '2 min', rest: 30 },
        { name: 'Mountain Climbers', muscle: 'Core · Legs',   sets: 4, reps: '30 sec',rest: 20 },
        { name: 'Box Jumps',         muscle: 'Legs',          sets: 3, reps: '12',    rest: 45 },
        { name: 'High Knees',        muscle: 'Cardio',        sets: 4, reps: '30 sec',rest: 20 },
        { name: 'Jump Squats',       muscle: 'Quads · Glutes',sets: 3, reps: '15',    rest: 30 },
      ],
      '45 min': [
        { name: 'Burpees',           muscle: 'Full Body',     sets: 4, reps: '12',    rest: 30 },
        { name: 'Jump Rope',         muscle: 'Cardio',        sets: 5, reps: '2 min', rest: 30 },
        { name: 'Mountain Climbers', muscle: 'Core · Legs',   sets: 4, reps: '40 sec',rest: 20 },
        { name: 'Box Jumps',         muscle: 'Legs',          sets: 4, reps: '12',    rest: 45 },
        { name: 'High Knees',        muscle: 'Cardio',        sets: 4, reps: '40 sec',rest: 20 },
        { name: 'Jump Squats',       muscle: 'Quads · Glutes',sets: 4, reps: '15',    rest: 30 },
        { name: 'Sprint Intervals',  muscle: 'Cardio',        sets: 5, reps: '30 sec',rest: 30 },
        { name: 'Bear Crawl',        muscle: 'Full Body',     sets: 3, reps: '30 sec',rest: 30 },
        { name: 'Jumping Jacks',     muscle: 'Cardio',        sets: 3, reps: '45 sec',rest: 15 },
      ],
      '60 min': [
        { name: 'Burpees',           muscle: 'Full Body',     sets: 5, reps: '12',    rest: 30 },
        { name: 'Jump Rope',         muscle: 'Cardio',        sets: 6, reps: '2 min', rest: 30 },
        { name: 'Mountain Climbers', muscle: 'Core · Legs',   sets: 5, reps: '40 sec',rest: 20 },
        { name: 'Box Jumps',         muscle: 'Legs',          sets: 4, reps: '15',    rest: 45 },
        { name: 'High Knees',        muscle: 'Cardio',        sets: 5, reps: '40 sec',rest: 20 },
        { name: 'Jump Squats',       muscle: 'Quads · Glutes',sets: 4, reps: '15',    rest: 30 },
        { name: 'Sprint Intervals',  muscle: 'Cardio',        sets: 8, reps: '30 sec',rest: 30 },
        { name: 'Bear Crawl',        muscle: 'Full Body',     sets: 4, reps: '30 sec',rest: 30 },
        { name: 'Jumping Jacks',     muscle: 'Cardio',        sets: 4, reps: '45 sec',rest: 15 },
        { name: 'Squat Thrusters',   muscle: 'Full Body',     sets: 4, reps: '12',    rest: 30 },
        { name: 'Lateral Hops',      muscle: 'Legs · Cardio', sets: 4, reps: '30 sec',rest: 20 },
        { name: 'Tuck Jumps',        muscle: 'Cardio · Core', sets: 3, reps: '15',    rest: 30 },
      ],
    },
  },
};

export const DURATIONS = ['20 min', '30 min', '45 min', '60 min'];

export const GOALS = [
  { icon: 'flame-outline', label: 'Lose Weight',  desc: 'Calorie deficit focus' },
  { icon: 'barbell-outline', label: 'Build Muscle', desc: 'Strength & hypertrophy' },
  { icon: 'heart-outline', label: 'Stay Healthy', desc: 'Balanced wellness' },
  { icon: 'flash-outline', label: 'Boost Energy', desc: 'Performance focus' },
];

export const DIETS = ['No Restrictions','Vegetarian','Vegan','Keto','Gluten-Free','Paleo'];
