import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import crashlytics from '@react-native-firebase/crashlytics';
import analytics from '@react-native-firebase/analytics';

import { AppProvider, useApp } from './src/context/AppContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { useAuth } from './src/context/AuthContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import { SHADOW } from './src/constants/theme';
import { Toast } from './src/components/UI';
import { GlassTabBar } from './src/components';

import AuthScreen      from './src/screens/AuthScreen';
import OnboardScreen   from './src/screens/OnboardScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import PantryScreen    from './src/screens/PantryScreen';
import WorkoutScreen   from './src/screens/WorkoutScreen';
import ProfileScreen   from './src/screens/ProfileScreen';
import { MealsScreen, RecipeScreen } from './src/screens/MealScreens';
import FoodSearchScreen from './src/screens/FoodSearchScreen';
import WeightScreen        from './src/screens/WeightScreen';
import WaterScreen           from './src/screens/WaterScreen';
import ActiveWorkoutScreen   from './src/screens/ActiveWorkoutScreen';
import WorkoutLogScreen      from './src/screens/WorkoutLogScreen';
import WeeklyDetailScreen  from './src/screens/WeeklyDetailScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const TABS = [
  { name: 'Home',    label: 'Home',    icon: 'home-outline',       iconOn: 'home'       },
  { name: 'Pantry',  label: 'Pantry',  icon: 'basket-outline',     iconOn: 'basket'     },
  { name: 'Meals',   label: 'Meals',   icon: 'restaurant-outline', iconOn: 'restaurant' },
  { name: 'Workout', label: 'Workout', icon: 'barbell-outline',    iconOn: 'barbell'    },
];

const COMPONENTS = {
  Home: DashboardScreen,
  Pantry: PantryScreen,
  Meals: MealsScreen,
  Workout: WorkoutScreen,
};

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TABS.map(t => (
        <Tab.Screen
          key={t.name}
          name={t.name}
          component={COMPONENTS[t.name]}
          options={{
            tabBarLabel: t.label,
            tabBarIconName: t.iconOn,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

// Loading screen shown during Firebase auth initialization
function SplashScreen() {
  const { palette, accent } = useTheme();
  return (
    <View style={[ts.splash, { backgroundColor: palette.bg0 }]}>
      <View style={[ts.splashLogo, { backgroundColor: accent.primary }]}>
        <Text style={[ts.splashLogoText, { color: palette.textInverse }]}>N</Text>
      </View>
      <Text style={[ts.splashName, { color: palette.textPrimary }]}>NutriSmart</Text>
      <ActivityIndicator color={accent.primary} style={{ marginTop: 20 }} />
    </View>
  );
}

function RootNav() {
  const { toast } = useApp();
  const { user, initializing, isOnboarded } = useAuth();
  const { mode, palette } = useTheme();
  const routeNameRef = React.useRef();
  const navigationRef = React.useRef();

  const navTheme = {
    ...(mode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(mode === 'dark' ? DarkTheme : DefaultTheme).colors,
      background: palette.bg0,
      card: palette.bg1,
      text: palette.textPrimary,
      border: palette.border,
    },
  };

  // Set Crashlytics user ID for crash reports
  useEffect(() => {
    if (user?.uid) {
      crashlytics().setUserId(user.uid);
      analytics().setUserId(user.uid);
    }
  }, [user?.uid]);

  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg0 }}>
      <NavigationContainer
        ref={navigationRef}
        theme={navTheme}
        onReady={() => { routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name; }}
        onStateChange={async () => {
          const previousRoute = routeNameRef.current;
          const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
          if (previousRoute !== currentRoute && currentRoute) {
            await analytics().logScreenView({ screen_name: currentRoute, screen_class: currentRoute });
          }
          routeNameRef.current = currentRoute;
        }}
      >
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          {!user ? (
            // Not authenticated — show auth screen
            <Stack.Screen name="Auth" component={AuthScreen} />
          ) : !isOnboarded ? (
            // Authenticated but no profile — show onboarding
            <Stack.Screen name="Onboard" component={OnboardScreen} />
          ) : (
            // Fully set up — show main app
            <>
              <Stack.Screen name="Main"       component={MainTabs}        />
              <Stack.Screen name="Profile"    component={ProfileScreen}   />
              <Stack.Screen name="Recipe"     component={RecipeScreen}    options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="FoodSearch" component={FoodSearchScreen} />
              <Stack.Screen name="Weight"       component={WeightScreen}       />
              <Stack.Screen name="WeeklyDetail" component={WeeklyDetailScreen} />
              <Stack.Screen name="Water"         component={WaterScreen}         />
              <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} options={{ gestureEnabled: false }} />
              <Stack.Screen name="WorkoutLog"    component={WorkoutLogScreen}    />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      {toast && <Toast message={toast} />}
    </View>
  );
}

function ThemedStatusBar() {
  const { mode, palette } = useTheme();
  return <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={palette.bg0} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SafeAreaProvider>
          <ThemedStatusBar />
          <AppProvider>
            <RootNav />
          </AppProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const ts = StyleSheet.create({
  // Splash screen
  splash: {
    flex: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  splashLogo: {
    width: 80, height: 80, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, ...SHADOW.accent,
  },
  splashLogoText: { fontSize: 44, fontWeight: '900' },
  splashName: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
});
