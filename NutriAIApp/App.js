import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AppProvider, useApp } from './src/context/AppContext';
import { C } from './src/constants/theme';
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
  { name: 'Home',    icon: '⌂', component: DashboardScreen },
  { name: 'Pantry',  icon: '◫', component: PantryScreen    },
  { name: 'Meals',   icon: '⊞', component: MealsScreen     },
  { name: 'Workout', icon: '◉', component: WorkoutScreen   },
];

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
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarShowLabel: false, tabBarStyle: ts.bar }}>
      {TABS.map(t => (
        <Tab.Screen
          key={t.name}
          name={t.name}
          component={t.component}
          options={{ tabBarIcon: ({ focused }) => <TabIcon icon={t.icon} label={t.name} focused={focused} /> }}
        />
      ))}
    </Tab.Navigator>
  );
}

function RootNav() {
  const { toast } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: C.black }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="Auth"    component={AuthScreen}    />
          <Stack.Screen name="Onboard" component={OnboardScreen} />
          <Stack.Screen name="Main"    component={MainTabs}      />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Recipe"  component={RecipeScreen}  options={{ animation: 'slide_from_bottom' }} />
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
  bar: { backgroundColor: C.surface0, borderTopWidth: 1, borderTopColor: C.border, height: 72, paddingBottom: 8, paddingTop: 8 },
  item: { alignItems: 'center', gap: 3 },
  iconWrap: { width: 36, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconWrapOn: { backgroundColor: C.limeGlow },
  icon: { fontSize: 18, color: C.textTertiary },
  iconOn: { color: C.lime },
  label: { fontSize: 10, color: C.textTertiary, fontWeight: '600' },
  labelOn: { color: C.lime },
});
