# NutriAI — React Native

AI-powered nutrition & fitness app. Built for iOS & Android.

## Quick Setup (Recommended)

```bash
bash setup.sh
```

That's it. The script will:
1. Scaffold a clean React Native 0.76.9 project
2. Copy all NutriAI source files in
3. Install all dependencies
4. Run `pod install` for iOS (Mac only)

---

## Manual Setup

If you prefer to do it step by step:

```bash
# 1. Create fresh RN project
npx @react-native-community/cli@latest init NutriAIApp --version 0.76.9

# 2. Copy source files
cp App.js NutriAIApp/
cp babel.config.js NutriAIApp/
cp metro.config.js NutriAIApp/
cp -r src NutriAIApp/

# 3. Install dependencies
cd NutriAIApp
npm install
npm install \
  @react-navigation/native \
  @react-navigation/native-stack \
  @react-navigation/bottom-tabs \
  react-native-screens \
  react-native-safe-area-context

# 4. iOS pods (Mac only)
cd ios && pod install && cd ..
```

---

## Running the App

### iOS (Xcode)
```bash
npx react-native start
```
Then open `NutriAIApp/ios/NutriAIApp.xcworkspace` in Xcode and press ▶ Play.

### iOS (Terminal only)
```bash
npx react-native run-ios
```

### Android
```bash
npx react-native run-android
```

---

## Project Structure

```
src/
├── components/
│   └── UI.js           # Reusable components (Button, Badge, Card, Toast...)
├── constants/
│   ├── theme.js        # Colors, spacing, radius design tokens
│   └── data.js         # Recipes, workouts, pantry data
├── context/
│   └── AppContext.js   # Global state (meals, pantry, user, etc.)
└── screens/
    ├── AuthScreen.js
    ├── OnboardScreen.js
    ├── DashboardScreen.js
    ├── PantryScreen.js
    ├── MealScreens.js   # MealsScreen + RecipeScreen
    ├── WorkoutScreen.js
    └── ProfileScreen.js
```

---

## Dependencies

Only 5 runtime dependencies — no Expo, no gesture handler, no reanimated:

| Package | Purpose |
|---|---|
| `@react-navigation/native` | Navigation container |
| `@react-navigation/native-stack` | Stack navigator |
| `@react-navigation/bottom-tabs` | Tab navigator |
| `react-native-screens` | Native screen optimization |
| `react-native-safe-area-context` | Safe area insets |
