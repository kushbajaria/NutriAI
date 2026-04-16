# NutriSmart

A React Native nutrition and fitness companion for iOS. NutriSmart generates personalised meal recommendations from your pantry, tracks your daily macros, schedules workouts, and builds consistent habits through a daily streak system.

---

## Features

### Nutrition
- **Pantry management** — add and remove ingredients; meals update automatically based on what you have
- **Smart meal scoring** — recipes are ranked by pantry match (65%) and goal alignment (35%) so you always see meals you can actually make
- **Macro tracking** — daily calories, protein, carbs, and fat visualised with a dotted ring chart
- **Recipe detail** — full ingredient list with pantry status (have / missing), step-by-step instructions, prep and cook time, and nutritional breakdown

### Social & Reviews
- **Star ratings** — rate any recipe from 1–5 stars
- **Community reviews** — read reviews from other users and post your own

### Workouts
- **4 workout types** — Full Body, Upper Body, Lower Body, Cardio HIIT
- **Duration-aware plans** — exercise count, sets, reps, and estimated calorie burn all scale with your chosen duration (20 / 30 / 45 / 60 min)
- **AI insight** — contextual tip based on your calories consumed and active goal

### Daily Streak
- Earn a streak point every day you log a meal or complete a workout
- Animated celebration overlay fires on the first activity of the day
- 7-day dot history visible at a glance on the dashboard

### Profile & Settings
- Edit goal, dietary preference, age, height, and weight inline via bottom sheets
- Toggle notifications on/off
- Switch between Metric and Imperial units
- Data & Privacy and About NutriSmart info panels

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React Native 0.76.9 |
| UI | React 18.3.1 (all components built from scratch — no UI library) |
| Navigation | @react-navigation/native · native-stack · bottom-tabs |
| Safe area | react-native-safe-area-context |
| Screens | react-native-screens |
| State | React Context API + hooks |
| Platform | iOS (Xcode 26 / Apple Clang 21) |

---

## Project Structure

```
NutriAIApp/
├── App.js                        # Root navigator (Stack: Auth → Onboard → Main)
├── src/
│   ├── screens/
│   │   ├── AuthScreen.js         # Sign-in / sign-up
│   │   ├── OnboardScreen.js      # Goal & preferences onboarding
│   │   ├── DashboardScreen.js    # Home — macros, streak, quick access
│   │   ├── PantryScreen.js       # Ingredient management
│   │   ├── MealScreens.js        # Meal list + recipe detail
│   │   ├── WorkoutScreen.js      # Workout planner
│   │   └── ProfileScreen.js      # User profile + settings
│   ├── components/
│   │   └── UI.js                 # Shared components (Badge, Card, Toast, DottedRing, …)
│   ├── constants/
│   │   ├── theme.js              # Colors, typography, spacing, radius, shadows
│   │   └── data.js               # Recipes, workouts, pantry defaults, mock reviews
│   └── context/
│       └── AppContext.js         # Global state — user, pantry, meals, streak, macros
└── ios/
    └── Podfile                   # CocoaPods config with C++20 + fmt patch for Xcode 26
```

---

## Getting Started

### Prerequisites

- Node >= 18
- Xcode 15+ (Xcode 26 supported)
- CocoaPods
- React Native CLI

### Install

```bash
# Clone the repo
git clone <repo-url>
cd NutriAIApp

# Install JS dependencies
npm install

# Install iOS pods
cd ios && pod install && cd ..
```

### Run

```bash
# Start the Metro bundler
npx react-native start

# Then press i in the terminal, or hit the play button in Xcode
```

> **Xcode 26 note:** The Podfile includes a post-install hook that patches `fmt/base.h` to set `FMT_USE_CONSTEVAL 0`, which is required to build on Apple Clang 21. This is applied automatically on every `pod install`.

---

## Meal Scoring Algorithm

Each recipe receives a `combinedScore` used to rank suggestions:

```
combinedScore = matchScore × 0.65 + goalScore × 0.35
```

| Component | Logic |
|---|---|
| `matchScore` | Fraction of recipe ingredients found in the user's pantry (bidirectional substring match) |
| `goalScore` (Lose Weight) | 1.0 if cal < 400 · 0.65 if < 550 · 0.2 otherwise |
| `goalScore` (Build Muscle) | 1.0 if protein ≥ 40 g · 0.7 if ≥ 25 g · 0.3 otherwise |
| `goalScore` (Boost Energy) | 1.0 if carbs ≥ 45 g · 0.65 if ≥ 25 g · 0.3 otherwise |
| `goalScore` (Stay Healthy) | 0.7 (flat) |

Meals with `matchScore ≥ 0.6` appear in the **From Your Pantry** section; the rest appear under **Discover More**.

---

## Design System

All tokens live in `src/constants/theme.js`.

| Token | Value |
|---|---|
| Background | `#0E0E12` |
| Accent (indigo) | `#7C8FFA` |
| Text primary | `#F0F0F8` |
| Text secondary | `#8888A8` |
| Protein | `#A78BFA` (purple) |
| Carbs | `#F5C060` (amber) |
| Fat | `#F08050` (orange) |
