import React from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AppProvider, useApp } from './src/context/AppContext';
import { useAuth } from './src/context/AuthContext';
import { C, SHADOW } from './src/constants/theme';
import { Toast } from './src/components/UI';

import AuthScreen      from './src/screens/AuthScreen';
import OnboardScreen   from './src/screens/OnboardScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import PantryScreen    from './src/screens/PantryScreen';
import WorkoutScreen   from './src/screens/WorkoutScreen';
import ProfileScreen   from './src/screens/ProfileScreen';
import { MealsScreen, RecipeScreen } from './src/screens/MealScreens';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const TABS = [
  { name: 'Home',    label: 'Home',    icon: '⌂',  iconOn: '⌂'  },
  { name: 'Pantry',  label: 'Pantry',  icon: '◫',  iconOn: '◫'  },
  { name: 'Meals',   label: 'Meals',   icon: '⊞',  iconOn: '⊞'  },
  { name: 'Workout', label: 'Workout', icon: '◎',  iconOn: '◎'  },
];

const COMPONENTS = {
  Home: DashboardScreen,
  Pantry: PantryScreen,
  Meals: MealsScreen,
  Workout: WorkoutScreen,
};

function TabIcon({ icon, label, focused }) {
  return (
    <View style={ts.item}>
      <View style={[ts.iconWrap, focused && ts.iconWrapOn]}>
        <Text style={[ts.icon, focused && ts.iconOn]}>{icon}</Text>
      </View>
      <Text style={[ts.label, focused && ts.labelOn]}>{label}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: ts.bar,
      }}
    >
      {TABS.map(t => (
        <Tab.Screen
          key={t.name}
          name={t.name}
          component={COMPONENTS[t.name]}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon={focused ? t.iconOn : t.icon} label={t.label} focused={focused} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

// Loading screen shown during Firebase auth initialization
function SplashScreen() {
  return (
    <View style={ts.splash}>
      <View style={ts.splashLogo}>
        <Text style={ts.splashLogoText}>N</Text>
      </View>
      <Text style={ts.splashName}>NutriSmart</Text>
      <ActivityIndicator color={C.lime} style={{ marginTop: 20 }} />
    </View>
  );
}

function RootNav() {
  const { toast } = useApp();
  const { user, initializing, isOnboarded } = useAuth();

  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.black }}>
      <NavigationContainer>
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
              <Stack.Screen name="Main"    component={MainTabs}      />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Recipe"  component={RecipeScreen}  options={{ animation: 'slide_from_bottom' }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      {toast && <Toast message={toast} />}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={C.black} />
      <AppProvider>
        <RootNav />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const ts = StyleSheet.create({
  bar: {
    backgroundColor: C.surface0,
    borderTopWidth: 1,
    borderTopColor: C.border,
    height: 76,
    paddingBottom: 10,
    paddingTop: 6,
    ...SHADOW.md,
  },
  item: { alignItems: 'center', gap: 3 },
  iconWrap: {
    width: 44, height: 30,
    borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapOn: {
    backgroundColor: C.limeGlow,
    borderWidth: 1,
    borderColor: C.lime + '30',
  },
  icon:    { fontSize: 18, color: C.textMuted },
  iconOn:  { fontSize: 18, color: C.lime },
  label:   { fontSize: 10, color: C.textTertiary, fontWeight: '600', letterSpacing: 0.3 },
  labelOn: { color: C.lime, fontWeight: '700' },

  // Splash screen
  splash: {
    flex: 1, backgroundColor: C.black,
    alignItems: 'center', justifyContent: 'center',
  },
  splashLogo: {
    width: 80, height: 80, borderRadius: 18,
    backgroundColor: C.lime,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, ...SHADOW.lime,
  },
  splashLogoText: { fontSize: 44, fontWeight: '900', color: C.textInverse },
  splashName: { fontSize: 28, fontWeight: '900', color: C.textPrimary, letterSpacing: -0.5 },
});
