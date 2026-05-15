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

// Existing screens
import AuthScreen           from './src/screens/AuthScreen';
import OnboardScreen        from './src/screens/OnboardScreen';
import DashboardScreen      from './src/screens/DashboardScreen';
import PantryScreen         from './src/screens/PantryScreen';
import WorkoutScreen        from './src/screens/WorkoutScreen';
import ProfileScreen        from './src/screens/ProfileScreen';
import { MealsScreen, RecipeScreen } from './src/screens/MealScreens';
import FoodSearchScreen     from './src/screens/FoodSearchScreen';
import WeightScreen         from './src/screens/WeightScreen';
import WaterScreen          from './src/screens/WaterScreen';
import ActiveWorkoutScreen  from './src/screens/ActiveWorkoutScreen';
import WorkoutLogScreen     from './src/screens/WorkoutLogScreen';
import WeeklyDetailScreen   from './src/screens/WeeklyDetailScreen';

// New screens — Phase 3
import PaywallScreen        from './src/screens/PaywallScreen';
import SubscriptionScreen   from './src/screens/SubscriptionScreen';
import AIChatScreen         from './src/screens/AIChatScreen';
import MealPlanScreen       from './src/screens/MealPlanScreen';
import ShoppingListScreen   from './src/screens/ShoppingListScreen';
import ProgramsScreen       from './src/screens/ProgramsScreen';
import ProgramDetailScreen  from './src/screens/ProgramDetailScreen';
import AnalyticsScreen      from './src/screens/AnalyticsScreen';
import InsightsScreen       from './src/screens/InsightsScreen';
import ProgressPhotosScreen from './src/screens/ProgressPhotosScreen';
import SecuritySettingsScreen from './src/screens/SecuritySettingsScreen';

const RootStack  = createNativeStackNavigator();
const Tab        = createBottomTabNavigator();
const HomeStack  = createNativeStackNavigator();
const MealsStack = createNativeStackNavigator();
const AIStack    = createNativeStackNavigator();
const FitStack   = createNativeStackNavigator();
const ProfStack  = createNativeStackNavigator();

const SCREEN_OPTS = { headerShown: false };

// ── Tab Stacks ──────────────────────────────────────────────

function HomeTabStack() {
  return (
    <HomeStack.Navigator screenOptions={SCREEN_OPTS}>
      <HomeStack.Screen name="Dashboard"    component={DashboardScreen} />
      <HomeStack.Screen name="Water"        component={WaterScreen} />
      <HomeStack.Screen name="Weight"       component={WeightScreen} />
      <HomeStack.Screen name="WeeklyDetail" component={WeeklyDetailScreen} />
      <HomeStack.Screen name="Analytics"    component={AnalyticsScreen} />
      <HomeStack.Screen name="Insights"     component={InsightsScreen} />
    </HomeStack.Navigator>
  );
}

function MealsTabStack() {
  return (
    <MealsStack.Navigator screenOptions={SCREEN_OPTS}>
      <MealsStack.Screen name="MealsList"    component={MealsScreen} />
      <MealsStack.Screen name="Recipe"       component={RecipeScreen} />
      <MealsStack.Screen name="FoodSearch"   component={FoodSearchScreen} />
      <MealsStack.Screen name="MealPlan"     component={MealPlanScreen} />
      <MealsStack.Screen name="ShoppingList" component={ShoppingListScreen} />
    </MealsStack.Navigator>
  );
}

function AITabStack() {
  return (
    <AIStack.Navigator screenOptions={SCREEN_OPTS}>
      <AIStack.Screen name="AIChat" component={AIChatScreen} />
    </AIStack.Navigator>
  );
}

function FitnessTabStack() {
  return (
    <FitStack.Navigator screenOptions={SCREEN_OPTS}>
      <FitStack.Screen name="WorkoutMain"   component={WorkoutScreen} />
      <FitStack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} options={{ gestureEnabled: false }} />
      <FitStack.Screen name="WorkoutLog"    component={WorkoutLogScreen} />
      <FitStack.Screen name="Programs"      component={ProgramsScreen} />
      <FitStack.Screen name="ProgramDetail" component={ProgramDetailScreen} />
    </FitStack.Navigator>
  );
}

function ProfileTabStack() {
  return (
    <ProfStack.Navigator screenOptions={SCREEN_OPTS}>
      <ProfStack.Screen name="ProfileMain"     component={ProfileScreen} />
      <ProfStack.Screen name="Pantry"          component={PantryScreen} />
      <ProfStack.Screen name="Subscription"    component={SubscriptionScreen} />
      <ProfStack.Screen name="ProgressPhotos"  component={ProgressPhotosScreen} />
      <ProfStack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
    </ProfStack.Navigator>
  );
}

// ── Main Tabs ───────────────────────────────────────────────

const TABS = [
  { name: 'HomeTab',    label: 'Home',    icon: 'home',       component: HomeTabStack },
  { name: 'MealsTab',   label: 'Meals',   icon: 'restaurant', component: MealsTabStack },
  { name: 'AITab',      label: 'AI',      icon: 'sparkles',   component: AITabStack,    isCenter: true },
  { name: 'FitnessTab', label: 'Fitness', icon: 'barbell',    component: FitnessTabStack },
  { name: 'ProfileTab', label: 'Profile', icon: 'person',     component: ProfileTabStack },
];

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={SCREEN_OPTS}
    >
      {TABS.map(t => (
        <Tab.Screen
          key={t.name}
          name={t.name}
          component={t.component}
          options={{
            tabBarLabel: t.label,
            tabBarIconName: t.icon,
            ...(t.isCenter && { tabBarIsCenter: true }),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

// ── Splash ──────────────────────────────────────────────────

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

// ── Root Navigator ──────────────────────────────────────────

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
        <RootStack.Navigator screenOptions={SCREEN_OPTS}>
          {!user ? (
            <RootStack.Screen name="Auth" component={AuthScreen} />
          ) : !isOnboarded ? (
            <RootStack.Screen name="Onboard" component={OnboardScreen} />
          ) : (
            <>
              <RootStack.Screen name="Main" component={MainTabs} />
              <RootStack.Screen
                name="Paywall"
                component={PaywallScreen}
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
              />
            </>
          )}
        </RootStack.Navigator>
      </NavigationContainer>
      {toast && <Toast message={toast} />}
    </View>
  );
}

// ── App Entry ───────────────────────────────────────────────

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
