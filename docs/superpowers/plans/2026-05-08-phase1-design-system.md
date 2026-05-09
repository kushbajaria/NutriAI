# Phase 1: Design System & Component Library — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing charcoal-themed design system into a glassmorphism + vibrant gradient system with full light/dark mode support, and upgrade all shared UI components.

**Architecture:** Create a ThemeContext provider that wraps the app and exposes the active theme (dark/light) plus all tokens. Upgrade `theme.js` to export both palettes. Upgrade every component in `UI.js` to use glassmorphism styling with blur, gradients, and spring animations. Split the monolithic `UI.js` into focused component files.

**Tech Stack:** React Native 0.76.9, react-native-reanimated, @react-native-community/blur, react-native-linear-gradient, react-native-gesture-handler, lottie-react-native, react-native-svg (existing)

**Spec:** `docs/superpowers/specs/2026-05-08-nutrismart-redesign-design.md` — Section 5 (Visual Design System)

---

### Task 1: Install New Dependencies

**Files:**
- Modify: `NutriAIApp/package.json`
- Modify: `NutriAIApp/ios/Podfile`
- Modify: `NutriAIApp/babel.config.js`

- [ ] **Step 1: Install npm packages**

```bash
cd /Users/kush/NutriAI/NutriAIApp
npm install react-native-reanimated@3 @react-native-community/blur react-native-linear-gradient react-native-gesture-handler lottie-react-native
```

- [ ] **Step 2: Add reanimated babel plugin**

In `babel.config.js`, add the reanimated plugin as the **last** plugin in the plugins array:

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
  ],
};
```

- [ ] **Step 3: Install iOS pods**

```bash
cd /Users/kush/NutriAI/NutriAIApp/ios
pod install
```

Expected: Pods installed successfully. If there are C++ compatibility warnings, they should be resolved by existing Podfile patches.

- [ ] **Step 4: Verify build**

```bash
cd /Users/kush/NutriAI/NutriAIApp
npx react-native run-ios --simulator="iPhone 16"
```

Expected: App launches without crashes. Existing functionality unchanged.

- [ ] **Step 5: Commit**

```bash
cd /Users/kush/NutriAI/NutriAIApp
git add package.json package-lock.json babel.config.js ios/Podfile ios/Podfile.lock
git commit -m "feat: install glassmorphism dependencies (reanimated, blur, gradient, gesture-handler, lottie)"
```

---

### Task 2: Expand Theme System with Light/Dark Mode Support

**Files:**
- Modify: `NutriAIApp/src/constants/theme.js`

- [ ] **Step 1: Read the current theme file**

Read `NutriAIApp/src/constants/theme.js` to confirm current state before modifying.

- [ ] **Step 2: Rewrite theme.js with dual-palette support**

Replace the entire contents of `NutriAIApp/src/constants/theme.js` with:

```javascript
import { Dimensions, Platform } from 'react-native';

export const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── DARK PALETTE ─────────────────────────────────────────────────
const DARK = {
  // Backgrounds — deep navy-black with purple undertones
  bg0:        '#0C0C1A',
  bg1:        '#161628',
  bg2:        '#1E1E35',
  bg3:        '#2A2A45',

  // Borders
  border:     'rgba(255,255,255,0.08)',
  borderHi:   'rgba(255,255,255,0.12)',

  // Text
  textPrimary:   '#F0F0F5',
  textSecondary: '#8A8A9A',
  textTertiary:  '#505060',
  textInverse:   '#FFFFFF',

  // Glass cards
  glass1Bg:       'rgba(255,255,255,0.06)',
  glass1Border:   'rgba(255,255,255,0.08)',
  glass2Bg:       'rgba(255,255,255,0.10)',
  glass2Border:   'rgba(255,255,255,0.12)',
  glass3Bg:       'rgba(255,255,255,0.15)',
  glass3Border:   'rgba(255,255,255,0.18)',

  // Shadows
  shadowColor:    '#000',
  shadowOpacity:  0.3,

  // Overlays
  overlay:        'rgba(0,0,0,0.5)',
  shimmer:        'rgba(255,255,255,0.06)',
};

// ── LIGHT PALETTE ────────────────────────────────────────────────
const LIGHT = {
  // Backgrounds — soft lavender-white with cool undertones
  bg0:        '#FFFFFF',
  bg1:        '#F2F2F7',
  bg2:        '#E8E8F0',
  bg3:        '#D8D8E5',

  // Borders
  border:     'rgba(0,0,0,0.06)',
  borderHi:   'rgba(0,0,0,0.10)',

  // Text
  textPrimary:   '#1C1C2E',
  textSecondary: '#6B6B80',
  textTertiary:  '#9999AA',
  textInverse:   '#FFFFFF',

  // Glass cards
  glass1Bg:       'rgba(255,255,255,0.70)',
  glass1Border:   'rgba(255,255,255,0.50)',
  glass2Bg:       'rgba(255,255,255,0.80)',
  glass2Border:   'rgba(255,255,255,0.60)',
  glass3Bg:       'rgba(255,255,255,0.90)',
  glass3Border:   'rgba(255,255,255,0.70)',

  // Shadows
  shadowColor:    '#000',
  shadowOpacity:  0.08,

  // Overlays
  overlay:        'rgba(0,0,0,0.3)',
  shimmer:        'rgba(0,0,0,0.04)',
};

// ── SHARED COLORS (same in both modes) ───────────────────────────
export const ACCENT = {
  // Primary — green to teal
  primary:      '#34C759',
  primaryEnd:   '#00C9A7',
  primaryDim:   '#2AA548',
  primaryBg:    'rgba(52,199,89,0.10)',

  // Premium — purple to indigo
  premium:      '#A78BFA',
  premiumMid:   '#818CF8',
  premiumEnd:   '#6366F1',
  premiumBg:    'rgba(167,139,250,0.10)',

  // Energy — orange to amber
  energy:       '#F97316',
  energyMid:    '#F59E0B',
  energyEnd:    '#FBBF24',
  energyBg:     'rgba(249,115,22,0.10)',

  // Intensity — pink to red
  intensity:    '#EC4899',
  intensityMid: '#F43F5E',
  intensityEnd: '#EF4444',
  intensityBg:  'rgba(236,72,153,0.10)',

  // Hydration — cyan to blue
  hydration:    '#06B6D4',
  hydrationMid: '#3B82F6',
  hydrationEnd: '#6366F1',
  hydrationBg:  'rgba(6,182,212,0.10)',

  // Macros
  protein:    '#A78BFA',
  proteinEnd: '#C084FC',
  proteinBg:  'rgba(167,139,250,0.10)',
  carbs:      '#F5C060',
  carbsEnd:   '#FBBF24',
  carbsBg:    'rgba(245,192,96,0.10)',
  fat:        '#F08050',
  fatEnd:     '#F97316',
  fatBg:      'rgba(240,128,80,0.10)',

  // Semantic
  blue:       '#6BA4FA',
  blueBg:     'rgba(107,164,250,0.10)',
  red:        '#F07070',
  redBg:      'rgba(240,112,112,0.10)',
  green:      '#34C759',
};

// ── GRADIENTS (start/end pairs for LinearGradient) ───────────────
export const GRADIENTS = {
  primary:    ['#34C759', '#30D158', '#00C9A7'],
  premium:    ['#A78BFA', '#818CF8', '#6366F1'],
  energy:     ['#F97316', '#F59E0B', '#FBBF24'],
  intensity:  ['#EC4899', '#F43F5E', '#EF4444'],
  hydration:  ['#06B6D4', '#3B82F6', '#6366F1'],
  protein:    ['#A78BFA', '#C084FC'],
  carbs:      ['#F5C060', '#FBBF24'],
  fat:        ['#F08050', '#F97316'],
};

// ── GLASSMORPHISM TOKENS ─────────────────────────────────────────
export const BLUR = {
  surface:  16,
  elevated: 24,
  floating: 32,
};

// ── TYPOGRAPHY ───────────────────────────────────────────────────
export const FONT = {
  black:    Platform.OS === 'ios' ? 'System' : 'sans-serif-black',
  bold:     Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
  semibold: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  regular:  Platform.OS === 'ios' ? 'System' : 'sans-serif',
  mono:     Platform.OS === 'ios' ? 'Menlo' : 'monospace',
};

export const TYPE = {
  display:  { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  headline: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  subhead:  { fontSize: 17, fontWeight: '600', letterSpacing: 0 },
  body:     { fontSize: 15, fontWeight: '400', letterSpacing: 0.1 },
  caption:  { fontSize: 13, fontWeight: '400', letterSpacing: 0.2 },
};

// ── SPACING & RADIUS (unchanged) ─────────────────────────────────
export const RADIUS = {
  xs:   6,
  sm:   10,
  md:   16,
  lg:   22,
  xl:   30,
  xxl:  40,
  full: 999,
};

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

// ── SHADOWS ──────────────────────────────────────────────────────
export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  accent: {
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

// ── THEME GETTER ─────────────────────────────────────────────────
// Returns the palette for a given mode. Used by ThemeContext.
export function getTheme(mode) {
  return mode === 'dark' ? DARK : LIGHT;
}

// ── BACKWARD COMPAT ──────────────────────────────────────────────
// Legacy `C` export maps to dark palette + shared accents.
// Screens that haven't migrated to useTheme() yet still work.
export const C = {
  // Legacy surface names → new dark palette
  black:      DARK.bg0,
  surface0:   DARK.bg0,
  surface1:   DARK.bg1,
  surface2:   DARK.bg2,
  surface3:   DARK.bg3,
  surface4:   DARK.bg3,
  border:     DARK.border,
  borderHi:   DARK.borderHi,

  // Text
  textPrimary:   DARK.textPrimary,
  textSecondary: DARK.textSecondary,
  textTertiary:  DARK.textTertiary,
  textInverse:   DARK.textInverse,
  textMuted:     '#252530',

  // Accents (shared)
  accent:     ACCENT.primary,
  accentDim:  ACCENT.primaryDim,
  accentDeep: '#1A3D24',
  accentBg:   ACCENT.primaryBg,
  accentBgSm: 'rgba(52,199,89,0.05)',
  accentBgMd: 'rgba(52,199,89,0.15)',

  // Macros
  protein:   ACCENT.protein,
  proteinBg: ACCENT.proteinBg,
  carbs:     ACCENT.carbs,
  carbsBg:   ACCENT.carbsBg,
  fat:       ACCENT.fat,
  fatBg:     ACCENT.fatBg,

  // Semantic
  blue:    ACCENT.blue,
  blueBg:  ACCENT.blueBg,
  red:     ACCENT.red,
  redBg:   ACCENT.redBg,
  green:   ACCENT.green,
};
```

- [ ] **Step 3: Verify app still builds with backward-compatible C export**

```bash
cd /Users/kush/NutriAI/NutriAIApp
npx react-native run-ios --simulator="iPhone 16"
```

Expected: App launches, all screens render correctly. The `C` export ensures zero regressions.

- [ ] **Step 4: Commit**

```bash
git add src/constants/theme.js
git commit -m "feat: expand theme with dual light/dark palettes, gradients, glassmorphism tokens, and typography scale"
```

---

### Task 3: Create ThemeContext Provider

**Files:**
- Create: `NutriAIApp/src/context/ThemeContext.js`
- Modify: `NutriAIApp/App.js`

- [ ] **Step 1: Create ThemeContext.js**

Create `NutriAIApp/src/context/ThemeContext.js`:

```javascript
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { getTheme, ACCENT, GRADIENTS, BLUR, TYPE, FONT, RADIUS, SPACING, SHADOW } from '../constants/theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState(null); // null = follow system

  const mode = override || systemScheme || 'dark';
  const palette = useMemo(() => getTheme(mode), [mode]);

  const toggleTheme = useCallback(() => {
    setOverride(prev => {
      if (prev === null) return mode === 'dark' ? 'light' : 'dark';
      return prev === 'dark' ? 'light' : 'dark';
    });
  }, [mode]);

  const setThemeMode = useCallback((m) => {
    setOverride(m === 'system' ? null : m);
  }, []);

  const value = useMemo(() => ({
    mode,
    palette,
    accent: ACCENT,
    gradients: GRADIENTS,
    blur: BLUR,
    type: TYPE,
    font: FONT,
    radius: RADIUS,
    spacing: SPACING,
    shadow: SHADOW,
    toggleTheme,
    setThemeMode,
  }), [mode, palette, toggleTheme, setThemeMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
```

- [ ] **Step 2: Wrap App.js with ThemeProvider**

In `App.js`, import `ThemeProvider` and wrap the root component. Find the outermost provider wrapper (likely `AppProvider` or `SafeAreaProvider`) and wrap it with `ThemeProvider`:

Add import at top:
```javascript
import { ThemeProvider } from './src/context/ThemeContext';
```

Wrap the root return — find the existing root structure and add `<ThemeProvider>` as the outermost wrapper:

```javascript
// In the App component's return, wrap everything:
<ThemeProvider>
  {/* existing SafeAreaProvider, AppProvider, NavigationContainer, etc. */}
</ThemeProvider>
```

- [ ] **Step 3: Verify app builds and runs**

```bash
cd /Users/kush/NutriAI/NutriAIApp
npx react-native run-ios --simulator="iPhone 16"
```

Expected: App launches. No visual changes yet — ThemeProvider just wraps without affecting rendering.

- [ ] **Step 4: Commit**

```bash
git add src/context/ThemeContext.js App.js
git commit -m "feat: add ThemeContext provider with light/dark mode support and system scheme detection"
```

---

### Task 4: Create GlassCard Component

**Files:**
- Create: `NutriAIApp/src/components/GlassCard.js`

- [ ] **Step 1: Create GlassCard.js**

Create `NutriAIApp/src/components/GlassCard.js`:

```javascript
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING } from '../constants/theme';

/**
 * GlassCard — frosted glass card with 3 elevation levels.
 *
 * Props:
 *   level    — 1 (surface), 2 (elevated), 3 (floating). Default 1.
 *   onPress  — if provided, card becomes touchable.
 *   style    — additional styles.
 *   children — card contents.
 */
export default function GlassCard({ level = 1, onPress, style, children }) {
  const { palette, blur } = useTheme();

  const glassKey = `glass${level}`;
  const bgColor = palette[`${glassKey}Bg`];
  const borderColor = palette[`${glassKey}Border`];
  const blurAmount = level === 1 ? blur.surface : level === 2 ? blur.elevated : blur.floating;

  const cardStyle = [
    styles.card,
    {
      borderColor,
      backgroundColor: bgColor,
    },
    level === 3 && {
      shadowColor: palette.shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: palette.shadowOpacity,
      shadowRadius: 32,
      elevation: 10,
    },
    style,
  ];

  const content = (
    <View style={cardStyle}>
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType={palette === 'dark' ? 'dark' : 'light'}
        blurAmount={blurAmount}
        reducedTransparencyFallbackColor={palette.bg1}
      />
      <View style={styles.inner}>
        {children}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75} accessibilityRole="button">
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inner: {
    padding: SPACING.md,
  },
});
```

- [ ] **Step 2: Fix the blur type detection**

The `palette` is an object, not a string. Fix the `blurType` prop to use the `mode` from theme context:

```javascript
// Update the import in GlassCard.js
export default function GlassCard({ level = 1, onPress, style, children }) {
  const { mode, palette, blur } = useTheme();
  // ...
  // Change blurType line to:
  blurType={mode === 'dark' ? 'dark' : 'light'}
```

- [ ] **Step 3: Verify GlassCard renders**

Import and render a `GlassCard` temporarily in `DashboardScreen` to verify it works:

```javascript
import GlassCard from '../components/GlassCard';
// In the render, add temporarily:
<GlassCard level={1}><Text style={{color:'#fff'}}>Glass Test</Text></GlassCard>
```

Run the app, verify the glass card renders with blur effect. Remove the test code after verifying.

- [ ] **Step 4: Commit**

```bash
git add src/components/GlassCard.js
git commit -m "feat: add GlassCard component with 3 elevation levels and native blur"
```

---

### Task 5: Create GradientButton Component

**Files:**
- Create: `NutriAIApp/src/components/GradientButton.js`

- [ ] **Step 1: Create GradientButton.js**

Create `NutriAIApp/src/components/GradientButton.js`:

```javascript
import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING, SHADOW } from '../constants/theme';
import Icon from './Icon';

/**
 * GradientButton — primary CTA with gradient fill, or glass secondary variant.
 *
 * Props:
 *   label     — button text
 *   onPress   — press handler
 *   variant   — 'primary' (gradient), 'secondary' (glass), 'ghost', 'danger'
 *   gradient  — array of color stops (default: GRADIENTS.primary)
 *   icon      — optional Ionicons name (rendered left of label)
 *   disabled  — disables button
 *   style     — additional styles
 */
export default function GradientButton({
  label,
  onPress,
  variant = 'primary',
  gradient,
  icon,
  disabled,
  style,
}) {
  const { mode, palette, gradients, accent } = useTheme();
  const colors = gradient || gradients.primary;

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!disabled }}
        style={[disabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.btn, SHADOW.accent]}
        >
          {icon && <Icon name={icon} size={18} color={palette.textInverse} style={styles.icon} />}
          <Text style={[styles.text, { color: palette.textInverse }]}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!disabled }}
        style={[disabled && styles.disabled, style]}
      >
        <View style={[styles.btn, styles.glassBg, { borderColor: palette.glass2Border, backgroundColor: palette.glass2Bg }]}>
          {icon && <Icon name={icon} size={18} color={accent.primary} style={styles.icon} />}
          <Text style={[styles.text, { color: palette.textPrimary }]}>{label}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'ghost') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!disabled }}
        style={[disabled && styles.disabled, style]}
      >
        <View style={[styles.btn, { borderColor: palette.borderHi, borderWidth: 1, backgroundColor: 'transparent' }]}>
          {icon && <Icon name={icon} size={18} color={palette.textSecondary} style={styles.icon} />}
          <Text style={[styles.text, { color: palette.textSecondary }]}>{label}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // danger
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={[disabled && styles.disabled, style]}
    >
      <View style={[styles.btn, { borderColor: accent.red + '40', borderWidth: 1, backgroundColor: accent.redBg }]}>
        {icon && <Icon name={icon} size={18} color={accent.red} style={styles.icon} />}
        <Text style={[styles.text, { color: accent.red }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  glassBg: {
    borderWidth: 1,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  icon: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.35,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GradientButton.js
git commit -m "feat: add GradientButton component with gradient primary and glass secondary variants"
```

---

### Task 6: Create GlassTabBar Component

**Files:**
- Create: `NutriAIApp/src/components/GlassTabBar.js`

- [ ] **Step 1: Create GlassTabBar.js**

Create `NutriAIApp/src/components/GlassTabBar.js`:

```javascript
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING, SHADOW } from '../constants/theme';
import Icon from './Icon';

/**
 * GlassTabBar — floating frosted glass tab bar for bottom navigation.
 *
 * This is a custom tabBar component passed to Tab.Navigator's `tabBar` prop.
 * It renders a floating glass bar with an animated indicator and a
 * gradient-highlighted center tab (AI).
 *
 * Props: standard React Navigation bottom tab bar props
 *   { state, descriptors, navigation }
 */
export default function GlassTabBar({ state, descriptors, navigation }) {
  const { mode, palette, gradients } = useTheme();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.bar, { borderColor: palette.glass2Border }]}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={mode === 'dark' ? 'dark' : 'light'}
          blurAmount={24}
          reducedTransparencyFallbackColor={palette.bg1}
        />
        <View style={styles.tabs}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const isCenter = options.tabBarIsCenter;

            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const iconName = options.tabBarIconName || 'ellipse';
            const label = options.tabBarLabel || options.title || route.name;

            if (isCenter) {
              return (
                <TouchableOpacity key={route.key} onPress={onPress} style={styles.centerTab} activeOpacity={0.8} accessibilityRole="tab" accessibilityState={{ selected: isFocused }} accessibilityLabel={label}>
                  <LinearGradient colors={gradients.premium} style={styles.centerIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Icon name={iconName} size={24} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.labelCenter, isFocused && styles.labelFocused]}>{label}</Text>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity key={route.key} onPress={onPress} style={styles.tab} activeOpacity={0.7} accessibilityRole="tab" accessibilityState={{ selected: isFocused }} accessibilityLabel={label}>
                <Icon name={isFocused ? iconName : `${iconName}-outline`} size={22} color={isFocused ? palette.textPrimary : palette.textTertiary} />
                <Text style={[styles.label, { color: isFocused ? palette.textPrimary : palette.textTertiary }]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    paddingBottom: 34, // safe area for home indicator
  },
  bar: {
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOW.lg,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: SPACING.sm,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 4,
  },
  centerTab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -20,
    gap: 4,
  },
  centerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
  labelCenter: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A78BFA',
  },
  labelFocused: {
    color: '#A78BFA',
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GlassTabBar.js
git commit -m "feat: add GlassTabBar component with floating blur bar and gradient center tab"
```

---

### Task 7: Create GlassBottomSheet Component

**Files:**
- Create: `NutriAIApp/src/components/GlassBottomSheet.js`

- [ ] **Step 1: Create GlassBottomSheet.js**

Create `NutriAIApp/src/components/GlassBottomSheet.js`:

```javascript
import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING } from '../constants/theme';

const SCREEN_H = Dimensions.get('window').height;

/**
 * GlassBottomSheet — frosted glass modal sheet with spring animation.
 *
 * Props:
 *   visible   — boolean to show/hide
 *   onClose   — called when backdrop tapped or swiped down
 *   height    — sheet height (default: 400)
 *   children  — sheet contents
 */
export default function GlassBottomSheet({ visible, onClose, height = 400, children }) {
  const { mode, palette } = useTheme();
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SCREEN_H,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity, backgroundColor: palette.overlay }]} />
      </TouchableWithoutFeedback>
      <Animated.View style={[styles.sheet, { height, transform: [{ translateY }], borderColor: palette.glass2Border }]}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={mode === 'dark' ? 'dark' : 'light'}
          blurAmount={24}
          reducedTransparencyFallbackColor={palette.bg1}
        />
        <View style={styles.handleRow}>
          <View style={[styles.handle, { backgroundColor: palette.textTertiary }]} />
        </View>
        <View style={styles.content}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    opacity: 0.4,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GlassBottomSheet.js
git commit -m "feat: add GlassBottomSheet with spring animation and frosted glass backdrop"
```

---

### Task 8: Create GlassToast Component

**Files:**
- Create: `NutriAIApp/src/components/GlassToast.js`

- [ ] **Step 1: Create GlassToast.js**

Create `NutriAIApp/src/components/GlassToast.js`:

```javascript
import React, { useEffect, useRef } from 'react';
import { Text, Animated, StyleSheet, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING, SHADOW, ACCENT } from '../constants/theme';
import Icon from './Icon';

/**
 * GlassToast — frosted glass notification with slide-in and auto-dismiss.
 *
 * Props:
 *   message  — text to display
 *   visible  — controls visibility
 *   onDismiss — called when toast auto-hides (after 2500ms)
 */
export default function GlassToast({ message, visible, onDismiss }) {
  const { mode, palette } = useTheme();
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const isError = /fail|error|incorrect|wrong/i.test(message);
  const isSuccess = /logged|posted|saved|complete|hit|deleted|sent|updated/i.test(message);
  const iconName = isError ? 'close-circle' : isSuccess ? 'checkmark-circle' : 'information-circle';
  const iconColor = isError ? ACCENT.red : isSuccess ? ACCENT.primary : ACCENT.blue;

  useEffect(() => {
    if (visible && message) {
      // Slide in from top
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 200 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        // Auto-dismiss after 2500ms
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(translateY, { toValue: -80, duration: 300, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]).start(() => {
            if (onDismiss) onDismiss();
          });
        }, 2500);
      });
    }
  }, [visible, message]);

  if (!visible || !message) return null;

  return (
    <Animated.View style={[styles.wrapper, { opacity, transform: [{ translateY }] }]}>
      <View style={[styles.toast, { borderColor: palette.glass2Border }]}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={mode === 'dark' ? 'dark' : 'light'}
          blurAmount={24}
          reducedTransparencyFallbackColor={palette.bg1}
        />
        <View style={styles.content}>
          <Icon name={iconName} size={18} color={iconColor} />
          <Text style={[styles.text, { color: palette.textPrimary }]}>{message}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 60,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GlassToast.js
git commit -m "feat: add GlassToast with slide-in animation and frosted glass blur"
```

---

### Task 9: Create GradientRing Component (Upgraded CircularProgress)

**Files:**
- Create: `NutriAIApp/src/components/GradientRing.js`

- [ ] **Step 1: Create GradientRing.js**

Create `NutriAIApp/src/components/GradientRing.js`:

```javascript
import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

/**
 * GradientRing — circular progress with gradient stroke and optional glow.
 *
 * Props:
 *   value       — current value
 *   max         — maximum value
 *   size        — diameter (default 200)
 *   strokeWidth — ring thickness (default 8)
 *   gradient    — array of color stops (default: GRADIENTS.primary)
 *   trackColor  — color of the background track
 *   children    — content rendered inside the ring
 */
export default function GradientRing({
  value,
  max,
  size = 200,
  strokeWidth = 8,
  gradient,
  trackColor,
  children,
}) {
  const { palette, gradients } = useTheme();
  const colors = gradient || gradients.primary;
  const track = trackColor || palette.bg3;

  const pct = Math.min(1, Math.max(0, value / max));
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference * (1 - pct);

  const gradId = `ring-grad-${size}-${colors[0]}`;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessible accessibilityLabel={`${value} of ${max}`}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <SvgGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            {colors.map((color, i) => (
              <Stop key={i} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={color} />
            ))}
          </SvgGradient>
        </Defs>

        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={track}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Gradient fill */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GradientRing.js
git commit -m "feat: add GradientRing component with SVG gradient stroke for macro tracking"
```

---

### Task 10: Create BlurHeader Component

**Files:**
- Create: `NutriAIApp/src/components/BlurHeader.js`

- [ ] **Step 1: Create BlurHeader.js**

Create `NutriAIApp/src/components/BlurHeader.js`:

```javascript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '../context/ThemeContext';
import { SPACING, TYPE } from '../constants/theme';
import Icon from './Icon';

/**
 * BlurHeader — transparent navigation header with blur background on scroll.
 *
 * Props:
 *   title     — header title
 *   subtitle  — optional subtitle above title
 *   onBack    — if provided, shows back button
 *   right     — optional right-side element
 *   scrolled  — boolean, when true shows blur background
 */
export default function BlurHeader({ title, subtitle, onBack, right, scrolled = false }) {
  const { mode, palette, accent } = useTheme();

  return (
    <View style={styles.wrapper}>
      {scrolled && (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={mode === 'dark' ? 'dark' : 'light'}
          blurAmount={16}
          reducedTransparencyFallbackColor={palette.bg0}
        />
      )}
      <View style={[styles.header, scrolled && { borderBottomColor: palette.border, borderBottomWidth: 1 }]}>
        <View style={styles.left}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={[styles.backBtn, { backgroundColor: palette.glass1Bg, borderColor: palette.glass1Border }]} activeOpacity={0.7}>
              <Icon name="chevron-back" size={20} color={accent.primary} />
            </TouchableOpacity>
          )}
          <View>
            {subtitle && <Text style={[styles.subtitle, { color: accent.primary }]}>{subtitle}</Text>}
            <Text style={[TYPE.headline, { color: palette.textPrimary }]}>{title}</Text>
          </View>
        </View>
        {right && <View>{right}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subtitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginBottom: 1,
    textTransform: 'uppercase',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BlurHeader.js
git commit -m "feat: add BlurHeader with transparent-to-blur scroll transition"
```

---

### Task 11: Create Component Index File

**Files:**
- Create: `NutriAIApp/src/components/index.js`

- [ ] **Step 1: Create index.js barrel export**

Create `NutriAIApp/src/components/index.js`:

```javascript
// ── New Glassmorphism Components ─────────────────────────────────
export { default as GlassCard } from './GlassCard';
export { default as GradientButton } from './GradientButton';
export { default as GlassTabBar } from './GlassTabBar';
export { default as GlassBottomSheet } from './GlassBottomSheet';
export { default as GlassToast } from './GlassToast';
export { default as GradientRing } from './GradientRing';
export { default as BlurHeader } from './BlurHeader';

// ── Legacy Components (still exported for screens not yet migrated) ──
export {
  CircularProgress,
  DottedRing,
  PillButton,
  Badge,
  ProgressBar,
  SectionHeader,
  MacroChip,
  Card,
  Divider,
  ScreenHeader,
  StatPill,
  GlowDot,
  Skeleton,
  SkeletonCard,
  FadeIn,
  Toast,
} from './UI';
export { default as Icon } from './Icon';
export { default as ErrorBoundary } from './ErrorBoundary';
```

- [ ] **Step 2: Commit**

```bash
git add src/components/index.js
git commit -m "feat: add component barrel export with new glassmorphism and legacy components"
```

---

### Task 12: Verify Full Build and Visual Smoke Test

**Files:**
- No new files — verification only

- [ ] **Step 1: Clean build**

```bash
cd /Users/kush/NutriAI/NutriAIApp
npx react-native start --reset-cache &
sleep 5
npx react-native run-ios --simulator="iPhone 16"
```

Expected: App builds and launches. All existing screens render correctly using legacy `C` exports. No crashes.

- [ ] **Step 2: Test theme toggle**

Temporarily add a theme toggle button to DashboardScreen to verify light/dark mode works:

```javascript
import { useTheme } from '../context/ThemeContext';
// In the component:
const { mode, toggleTheme, palette } = useTheme();
// In the render, add a test button:
<TouchableOpacity onPress={toggleTheme} style={{padding:10, backgroundColor: palette.glass1Bg, borderRadius:8, margin:16}}>
  <Text style={{color: palette.textPrimary}}>Mode: {mode} (tap to toggle)</Text>
</TouchableOpacity>
```

Verify: tapping toggles between light and dark. The test button itself should change appearance. Remove test code after verifying.

- [ ] **Step 3: Test each new component**

Import and render each new component briefly in DashboardScreen to verify no import/render errors:
- `<GlassCard level={1}><Text>Test</Text></GlassCard>`
- `<GradientButton label="Test" onPress={() => {}} />`
- `<GradientRing value={75} max={100} size={100} />`
- `<BlurHeader title="Test" />`

Verify each renders. Remove test code after.

- [ ] **Step 4: Commit verified state**

No code changes to commit if tests passed. If any fixes were needed, commit them:

```bash
git add -A
git commit -m "fix: resolve any build issues from design system integration"
```

---

## Summary

After Phase 1, the codebase has:
- **5 new npm packages** installed and configured
- **Dual light/dark theme system** with `ThemeContext` provider
- **7 new glassmorphism components**: GlassCard, GradientButton, GlassTabBar, GlassBottomSheet, GlassToast, GradientRing, BlurHeader
- **Full backward compatibility** — existing screens continue working via legacy `C` export
- **Component barrel export** — clean imports via `src/components/index.js`

**Next:** Phase 2 will migrate all 14 existing screens to use the new design system.
