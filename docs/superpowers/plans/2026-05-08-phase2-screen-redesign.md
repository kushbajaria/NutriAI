# Phase 2: Screen Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all 14 existing screens from the old charcoal theme to the new glassmorphism design system with light/dark mode support.

**Architecture:** Each screen replaces direct `C.*` token usage with `useTheme()` hook, swaps legacy components (Card → GlassCard, PillButton → GradientButton, etc.), and applies glassmorphism styling. The migration preserves all existing functionality — no feature changes, only visual.

**Tech Stack:** React Native 0.76.9, useTheme() hook, GlassCard, GradientButton, GlassBottomSheet, GlassToast, GradientRing, BlurHeader, GlassTabBar (all from Phase 1)

**Spec:** `docs/superpowers/specs/2026-05-08-nutrismart-redesign-design.md` — Section 5

---

## Migration Pattern Reference

Every screen follows this transformation pattern. Each task below applies these rules to a specific screen.

### Import Changes

```javascript
// BEFORE:
import { C, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { Card, PillButton, ScreenHeader, CircularProgress, Badge, ... } from '../components/UI';

// AFTER:
import { useTheme } from '../context/ThemeContext';
import { ACCENT } from '../constants/theme';
import { GlassCard, GradientButton, BlurHeader, GradientRing, Badge, ... } from '../components';
```

### Hook Setup

```javascript
// Add at top of every component function body:
const { mode, palette, accent, gradients, spacing, radius, shadow, type } = useTheme();
```

### Token Mapping (C.* → palette.*)

| Old Token | New Token | Notes |
|-----------|-----------|-------|
| `C.black` | `palette.bg0` | Screen background |
| `C.surface0` | `palette.bg0` | |
| `C.surface1` | `palette.bg1` | Card backgrounds → use GlassCard instead |
| `C.surface2` | `palette.bg2` | Secondary surfaces |
| `C.surface3` | `palette.bg3` | Tertiary surfaces |
| `C.surface4` | `palette.bg3` | |
| `C.border` | `palette.border` | |
| `C.borderHi` | `palette.borderHi` | |
| `C.textPrimary` | `palette.textPrimary` | |
| `C.textSecondary` | `palette.textSecondary` | |
| `C.textTertiary` | `palette.textTertiary` | |
| `C.textInverse` | `palette.textInverse` | |
| `C.accent` | `accent.primary` | Green accent |
| `C.accentBg` | `accent.primaryBg` | |
| `C.accentBgSm` | `'rgba(52,199,89,0.05)'` | Keep as literal |
| `C.accentDim` | `accent.primaryDim` | |
| `C.protein` | `accent.protein` | |
| `C.proteinBg` | `accent.proteinBg` | |
| `C.carbs` | `accent.carbs` | |
| `C.carbsBg` | `accent.carbsBg` | |
| `C.fat` | `accent.fat` | |
| `C.fatBg` | `accent.fatBg` | |
| `C.blue` | `accent.blue` | |
| `C.blueBg` | `accent.blueBg` | |
| `C.red` | `accent.red` | |
| `C.redBg` | `accent.redBg` | |
| `C.green` | `accent.green` | |

### Component Swaps

| Old Component | New Component | Prop Changes |
|---------------|---------------|-------------|
| `Card` | `GlassCard` | Add `level={1}` (or 2/3), remove `style` with bg/border |
| `PillButton` | `GradientButton` | Same props, `variant` works the same |
| `ScreenHeader` | `BlurHeader` | Same props + add `scrolled={isScrolled}` |
| `CircularProgress` | `GradientRing` | Add `gradient={gradients.primary}`, remove `color` |
| `Toast` | `GlassToast` | Add `visible` and `onDismiss` props |

### StyleSheet Pattern

```javascript
// BEFORE: Static StyleSheet at bottom of file
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.black },
  card: { backgroundColor: C.surface1, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: C.border },
});

// AFTER: Dynamic styles inside component using palette
// Move styles that reference palette into the component (inline or useMemo)
// Keep static styles in StyleSheet.create
const styles = StyleSheet.create({
  container: { flex: 1 },
  // Static layout styles stay here
});

// In component:
<View style={[styles.container, { backgroundColor: palette.bg0 }]}>
```

### Bottom Sheet Migration

```javascript
// BEFORE: Custom Modal-based sheet
<Modal visible={visible} transparent animationType="slide">
  <TouchableOpacity style={ps.overlay} onPress={onClose}>
    <View style={ps.sheet}>
      {children}
    </View>
  </TouchableOpacity>
</Modal>

// AFTER: GlassBottomSheet
<GlassBottomSheet visible={visible} onClose={onClose} height={400}>
  {children}
</GlassBottomSheet>
```

### StatusBar

```javascript
// BEFORE:
<StatusBar barStyle="light-content" />

// AFTER:
<StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
```

---

### Task 1: Migrate AuthScreen

**Files:**
- Modify: `NutriAIApp/src/screens/AuthScreen.js`

This is the first screen users see. It has a custom-built UI (no UI.js components), auth form, OAuth buttons, and tab switcher.

- [ ] **Step 1: Read the current file**

Read `/Users/kush/NutriAI/NutriAIApp/src/screens/AuthScreen.js` completely.

- [ ] **Step 2: Update imports**

Replace theme imports:
```javascript
// REMOVE:
import { C, RADIUS, SPACING, SHADOW } from '../constants/theme';

// ADD:
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING, SHADOW } from '../constants/theme';
```

Import GradientButton:
```javascript
import { GradientButton } from '../components';
```

- [ ] **Step 3: Add useTheme hook**

At the top of the `AuthScreen` component function, add:
```javascript
const { mode, palette, accent, gradients } = useTheme();
```

- [ ] **Step 4: Apply token mapping**

Apply the token mapping table above to all style references in the file. Key replacements:
- `C.black` → `palette.bg0`
- `C.accent` → `accent.primary`
- `C.textPrimary` → `palette.textPrimary`
- `C.textSecondary` → `palette.textSecondary`
- `C.textTertiary` → `palette.textTertiary`
- `C.textInverse` → `palette.textInverse`
- `C.surface0` → `palette.bg0`
- `C.surface1` → `palette.bg1`
- `C.surface2` → `palette.bg2`
- `C.surface3` → `palette.bg3`
- `C.border` → `palette.border`
- `C.borderHi` → `palette.borderHi`
- `C.red` → `accent.red`

Since styles reference palette (which changes with theme), move any `StyleSheet.create` styles that use `C.*` tokens into inline styles or use the pattern `[styles.staticPart, { backgroundColor: palette.bg0 }]`.

- [ ] **Step 5: Replace the main CTA button**

Replace the main sign-in/sign-up TouchableOpacity button with:
```javascript
<GradientButton
  label={tab === 'login' ? 'Sign In  →' : 'Create Account  →'}
  onPress={handleSubmit}
  disabled={busy}
  gradient={gradients.primary}
/>
```

- [ ] **Step 6: Style OAuth buttons with glass**

Give the Apple and Google sign-in buttons a glass look:
```javascript
style={[styles.oauthBtn, { backgroundColor: palette.glass1Bg, borderColor: palette.glass1Border }]}
```

- [ ] **Step 7: Update StatusBar**

```javascript
<StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
```

- [ ] **Step 8: Verify visual appearance**

Run the app, navigate to AuthScreen. Verify:
- Background is deep navy (dark mode) or lavender-white (light mode)
- Form inputs have proper contrast
- CTA button has gradient fill
- OAuth buttons have frosted glass appearance
- All text is readable in both modes

- [ ] **Step 9: Commit**

```bash
git add src/screens/AuthScreen.js
git commit -m "redesign: migrate AuthScreen to glassmorphism theme with gradient CTA"
```

---

### Task 2: Migrate OnboardScreen

**Files:**
- Modify: `NutriAIApp/src/screens/OnboardScreen.js`

- [ ] **Step 1: Read the current file**

Read `/Users/kush/NutriAI/NutriAIApp/src/screens/OnboardScreen.js` completely.

- [ ] **Step 2: Update imports**

```javascript
// REMOVE:
import { C, RADIUS, SPACING } from '../constants/theme';
import { PillButton } from '../components/UI';

// ADD:
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING } from '../constants/theme';
import { GradientButton, GlassCard } from '../components';
```

- [ ] **Step 3: Add useTheme hook and apply token mapping**

Add `const { mode, palette, accent, gradients } = useTheme();` at top of component.

Apply full token mapping (C.* → palette.*/accent.*). Replace `PillButton` with `GradientButton`. Replace goal selection cards with `GlassCard`:

```javascript
// Goal card:
<GlassCard
  level={selected === goal ? 2 : 1}
  onPress={() => setGoal(goal)}
  style={selected === goal && { borderColor: accent.primary }}
>
  {/* card content */}
</GlassCard>
```

- [ ] **Step 4: Update progress bar to use gradient**

Replace the solid accent progress fill with a gradient background using the inline style or wrap with LinearGradient if imported.

- [ ] **Step 5: Verify and commit**

```bash
git add src/screens/OnboardScreen.js
git commit -m "redesign: migrate OnboardScreen to glassmorphism with glass goal cards"
```

---

### Task 3: Migrate WaterScreen and WeightScreen

**Files:**
- Modify: `NutriAIApp/src/screens/WaterScreen.js`
- Modify: `NutriAIApp/src/screens/WeightScreen.js`

Both are small tracking screens (~215-261 lines) with similar patterns.

- [ ] **Step 1: Read both files**

Read `WaterScreen.js` and `WeightScreen.js` completely.

- [ ] **Step 2: Migrate WaterScreen**

Update imports:
```javascript
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING } from '../constants/theme';
import { GlassCard, GradientButton, GradientRing, BlurHeader, FadeIn } from '../components';
```

Add `const { mode, palette, accent, gradients } = useTheme();`

Key swaps:
- `CircularProgress` → `GradientRing` with `gradient={gradients.hydration}`
- `Card` → `GlassCard level={1}`
- Header back button → `BlurHeader` with `onBack`
- Quick-add buttons: use `palette.glass1Bg` background, `palette.glass1Border` border
- Weekly chart bars: use `accent.hydration` for fill color
- All `C.*` → `palette.*` / `accent.*` per mapping table
- `StatusBar barStyle` → dynamic based on `mode`

- [ ] **Step 3: Migrate WeightScreen**

Update imports:
```javascript
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING } from '../constants/theme';
import { GlassCard, GradientButton, BlurHeader, FadeIn } from '../components';
```

Add `const { mode, palette, accent, gradients } = useTheme();`

Key swaps:
- `PillButton` → `GradientButton`
- Header → `BlurHeader`
- Current weight card: `GlassCard level={2}`
- History rows: use `palette.bg1` background with `palette.border`
- Trend arrow colors: use `accent.green` (down/good) / `accent.red` (up/bad)
- All `C.*` → `palette.*` / `accent.*`
- `StatusBar barStyle` → dynamic

- [ ] **Step 4: Verify both screens**

Run app, navigate to Water and Weight screens. Check backgrounds, cards, buttons, charts, and header blur all render correctly in dark mode.

- [ ] **Step 5: Commit**

```bash
git add src/screens/WaterScreen.js src/screens/WeightScreen.js
git commit -m "redesign: migrate WaterScreen and WeightScreen to glassmorphism"
```

---

### Task 4: Migrate PantryScreen

**Files:**
- Modify: `NutriAIApp/src/screens/PantryScreen.js`

- [ ] **Step 1: Read the current file**

Read `/Users/kush/NutriAI/NutriAIApp/src/screens/PantryScreen.js` completely.

- [ ] **Step 2: Update imports and add hook**

```javascript
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING } from '../constants/theme';
import { GlassCard, GradientButton, BlurHeader } from '../components';
import { SectionHeader } from '../components/UI';
```

Add `const { mode, palette, accent, gradients } = useTheme();`

- [ ] **Step 3: Apply migrations**

- Screen background: `palette.bg0`
- Search input: `palette.bg2` background, `palette.border` border, `palette.textPrimary` text
- Autocomplete dropdown: `palette.bg2` background, `palette.border` border
- Pantry tags: `accent.primaryBg` background, `accent.primary` text/border
- Quick-add ingredient chips: `palette.glass1Bg` background, `palette.glass1Border` border
- `PillButton` → `GradientButton` for "Generate Meals" CTA
- `SectionHeader` action text: `accent.primary`
- All `C.*` → `palette.*` / `accent.*`
- `StatusBar barStyle` → dynamic

- [ ] **Step 4: Verify and commit**

```bash
git add src/screens/PantryScreen.js
git commit -m "redesign: migrate PantryScreen to glassmorphism with glass ingredient chips"
```

---

### Task 5: Migrate WorkoutScreen and WorkoutLogScreen

**Files:**
- Modify: `NutriAIApp/src/screens/WorkoutScreen.js`
- Modify: `NutriAIApp/src/screens/WorkoutLogScreen.js`

- [ ] **Step 1: Read both files**

Read `WorkoutScreen.js` and `WorkoutLogScreen.js` completely.

- [ ] **Step 2: Migrate WorkoutScreen**

Update imports:
```javascript
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING } from '../constants/theme';
import { GlassCard, GradientButton, BlurHeader, Badge, FadeIn } from '../components';
import { SectionHeader } from '../components/UI';
```

Add `const { mode, palette, accent, gradients } = useTheme();`

Key swaps:
- Type selector chips: active = `accent.primaryBg` bg + `accent.primary` text, inactive = `palette.glass1Bg`
- Duration chips: same glass pattern
- Workout plan card: `GlassCard level={1}`
- Exercise rows: `palette.bg2` background
- Start workout button: `GradientButton` with `gradient={gradients.energy}`
- AI insight card: `GlassCard level={1}` with premium purple tint
- Workout log card: `GlassCard level={1}` with `onPress`
- All `C.*` → per mapping
- `StatusBar barStyle` → dynamic

- [ ] **Step 3: Migrate WorkoutLogScreen**

Update imports:
```javascript
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING } from '../constants/theme';
import { GlassCard, BlurHeader, FadeIn } from '../components';
```

Add `const { mode, palette, accent, gradients } = useTheme();`

Key swaps:
- `Card` → `GlassCard level={1}`
- Header → `BlurHeader`
- Weekly summary stats: `GlassCard level={2}` wrapper
- Date group headers: `palette.textSecondary`
- Entry cards: `GlassCard level={1}` with `onPress` for expand
- Stats grid values: use `accent.energy` for calories, `accent.blue` for time
- All `C.*` → per mapping

- [ ] **Step 4: Verify and commit**

```bash
git add src/screens/WorkoutScreen.js src/screens/WorkoutLogScreen.js
git commit -m "redesign: migrate WorkoutScreen and WorkoutLogScreen to glassmorphism"
```

---

### Task 6: Migrate FoodSearchScreen and WeeklyDetailScreen

**Files:**
- Modify: `NutriAIApp/src/screens/FoodSearchScreen.js`
- Modify: `NutriAIApp/src/screens/WeeklyDetailScreen.js`

- [ ] **Step 1: Read both files**

Read `FoodSearchScreen.js` and `WeeklyDetailScreen.js` completely.

- [ ] **Step 2: Migrate FoodSearchScreen**

Update imports:
```javascript
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING } from '../constants/theme';
import { GlassCard, GradientButton, BlurHeader, GlassBottomSheet, Badge, FadeIn } from '../components';
```

Add `const { mode, palette, accent, gradients } = useTheme();`

Key swaps:
- Search bar: `palette.bg2` background, `palette.textPrimary` text, `palette.border` border
- Filter chips: active = `accent.primaryBg` bg, inactive = `palette.glass1Bg`
- Recipe result cards: `GlassCard level={1}` with `onPress`
- Pantry match indicator: use `accent.green` / `accent.energy` / `accent.red`
- Custom food modal → `GlassBottomSheet`
- Log button in modal: `GradientButton`
- FAB: gradient background using `gradients.primary`
- All `C.*` → per mapping

- [ ] **Step 3: Migrate WeeklyDetailScreen**

Update imports:
```javascript
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING } from '../constants/theme';
import { GlassCard, BlurHeader, FadeIn } from '../components';
```

Add `const { mode, palette, accent, gradients } = useTheme();`

Key swaps:
- `Card` → `GlassCard level={1}`
- Header → `BlurHeader`
- Bar chart: bars use `accent.primary` fill, selected bar has `accent.primary` glow
- Stats card: `GlassCard level={1}`, stat values use semantic colors from `accent.*`
- Macros card: protein/carbs/fat dots use `accent.protein`, `accent.carbs`, `accent.fat`
- Daily breakdown rows: `palette.bg2` background
- All `C.*` → per mapping

- [ ] **Step 4: Verify and commit**

```bash
git add src/screens/FoodSearchScreen.js src/screens/WeeklyDetailScreen.js
git commit -m "redesign: migrate FoodSearchScreen and WeeklyDetailScreen to glassmorphism"
```

---

### Task 7: Migrate ActiveWorkoutScreen

**Files:**
- Modify: `NutriAIApp/src/screens/ActiveWorkoutScreen.js`

This is a large screen (594 lines) with multiple overlays (rest timer, paused, summary).

- [ ] **Step 1: Read the current file**

Read `/Users/kush/NutriAI/NutriAIApp/src/screens/ActiveWorkoutScreen.js` completely.

- [ ] **Step 2: Update imports**

```javascript
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING } from '../constants/theme';
import { GlassCard, GradientButton } from '../components';
```

Add `const { mode, palette, accent, gradients } = useTheme();`

- [ ] **Step 3: Migrate main exercise UI**

- Screen background: `palette.bg0`
- Top bar (exit, timer, pause): `palette.bg1` background, `palette.border` border
- Progress bar track: `palette.bg3`, fill: `accent.primary`
- Exercise card: `GlassCard level={2}` — this is the main focus area
- Set dots: completed = `accent.primary`, current = `accent.primaryBg` border, pending = `palette.bg3`
- Up-next preview: `palette.bg2` background
- Running stats (sets, calories, elapsed): `GlassCard level={1}`
- Bottom action bar: `palette.bg1` background with blur
- Skip button: `GradientButton variant="ghost"`
- Complete Set button: `GradientButton variant="primary"` with `gradient={gradients.energy}`

- [ ] **Step 4: Migrate overlays**

**Rest timer overlay:**
- Dark overlay background: `palette.overlay`
- Timer card: `GlassCard level={3}`
- Skip rest button: `GradientButton variant="secondary"`
- +15s button: `palette.glass1Bg` background

**Paused overlay:**
- Overlay: `palette.overlay`
- Resume button: `GradientButton variant="primary"`

**Workout summary overlay:**
- Overlay: `palette.overlay`
- Summary card: `GlassCard level={3}`
- Stats grid: `palette.bg2` backgrounds for each stat cell
- Log workout button: `GradientButton variant="primary"` with `gradient={gradients.primary}`
- Discard button: `GradientButton variant="danger"`

- [ ] **Step 5: All `C.*` → `palette.*` / `accent.*` per mapping**

- [ ] **Step 6: Verify and commit**

```bash
git add src/screens/ActiveWorkoutScreen.js
git commit -m "redesign: migrate ActiveWorkoutScreen overlays and exercise UI to glassmorphism"
```

---

### Task 8: Migrate MealScreens (MealsScreen + RecipeScreen)

**Files:**
- Modify: `NutriAIApp/src/screens/MealScreens.js`

This file contains two exported screens (749 lines). Both need migration.

- [ ] **Step 1: Read the current file**

Read `/Users/kush/NutriAI/NutriAIApp/src/screens/MealScreens.js` completely.

- [ ] **Step 2: Update imports**

```javascript
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING, SHADOW } from '../constants/theme';
import { GlassCard, GradientButton, BlurHeader, GlassBottomSheet, Badge } from '../components';
import { SectionHeader, FadeIn } from '../components/UI';
```

- [ ] **Step 3: Migrate MealsScreen**

Add `const { mode, palette, accent, gradients } = useTheme();` at top.

- Header badges: keep `Badge` component (it's already theme-compatible via color props)
- Recipe cards: `GlassCard level={1}` with `onPress`
- Recipe card content: emoji icon area uses `palette.bg2`, text uses `palette.textPrimary`/`textSecondary`
- Pantry match badge: green = `accent.green`, partial = `accent.energy`
- Section headers: `SectionHeader` (keep, it uses accent color)
- Empty state: icon and text use `palette.textTertiary`
- All `C.*` → per mapping

- [ ] **Step 4: Migrate RecipeScreen**

Add `const { mode, palette, accent, gradients } = useTheme();` at top.

- Header: `BlurHeader` with `onBack`
- Hero section: `GlassCard level={2}` for the emoji/title area
- Pantry match banner: green/blue/orange backgrounds from `accent.*`
- Nutrition grid: 4 x `GlassCard level={1}` for cal/protein/carbs/fat
- Ingredient chips: matched = `accent.primaryBg` + `accent.primary` border, missing = `palette.bg2` + `palette.border`
- Method steps: numbered circles use `accent.primary` background
- Reviews section: `GlassCard level={1}` per review
- Add review form: `palette.bg2` textarea, `GradientButton` submit
- Meal time picker modal → `GlassBottomSheet`
- Log meal button: `GradientButton` with `gradient={gradients.primary}`
- All `C.*` → per mapping

- [ ] **Step 5: Verify and commit**

```bash
git add src/screens/MealScreens.js
git commit -m "redesign: migrate MealsScreen and RecipeScreen to glassmorphism with glass recipe cards"
```

---

### Task 9: Migrate ProfileScreen

**Files:**
- Modify: `NutriAIApp/src/screens/ProfileScreen.js`

Largest screen after Dashboard (788 lines). Has multiple inline bottom sheets (`Sheet` component) that need GlassBottomSheet migration.

- [ ] **Step 1: Read the current file**

Read `/Users/kush/NutriAI/NutriAIApp/src/screens/ProfileScreen.js` completely.

- [ ] **Step 2: Update imports**

```javascript
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING } from '../constants/theme';
import { GlassCard, GradientButton, BlurHeader, GlassBottomSheet, Badge, FadeIn } from '../components';
import { SectionHeader } from '../components/UI';
```

- [ ] **Step 3: Replace the `Sheet` component**

The file defines a local `Sheet` component (Modal-based). Replace ALL usages of `<Sheet>` with `<GlassBottomSheet>`. The `Sheet` component can be removed entirely.

```javascript
// BEFORE:
<Sheet visible={showGoal} onClose={() => setShowGoal(false)} title="Select Goal">
  {/* content */}
</Sheet>

// AFTER:
<GlassBottomSheet visible={showGoal} onClose={() => setShowGoal(false)} height={350}>
  <Text style={[type.headline, { color: palette.textPrimary, marginBottom: spacing.md }]}>Select Goal</Text>
  {/* content */}
</GlassBottomSheet>
```

Do this for ALL sheet instances: goal picker, diet picker, age input, height input, weight input, calorie goal, data & privacy, about modal.

- [ ] **Step 4: Migrate ProfileScreen main UI**

Add `const { mode, palette, accent, gradients, type, spacing } = useTheme();`

- Avatar block: avatar circle border uses `accent.primary`
- Member pill: `palette.glass1Bg` background
- Stats row (3 cards): each becomes `GlassCard level={1}`
- Your Data rows: `palette.bg1` background for each row, icons use `accent.*` colors
- Settings section rows: same glass pattern
- Units toggle: active = `accent.primaryBg` + `accent.primary`, inactive = `palette.bg2`
- Sign out button: `GradientButton variant="ghost"`
- Delete account button: `GradientButton variant="danger"`
- All `C.*` → per mapping

- [ ] **Step 5: Migrate sheet contents**

Inside each GlassBottomSheet:
- Option rows (goal picker, diet picker): `palette.bg2` background, selected = `accent.primaryBg` with `accent.primary` border and checkmark
- Number inputs: `palette.bg2` background, `palette.textPrimary` text
- Save buttons: `GradientButton variant="primary"`
- Data & Privacy content: `palette.textSecondary` body text
- Export button: `GradientButton variant="secondary"`

- [ ] **Step 6: Verify and commit**

```bash
git add src/screens/ProfileScreen.js
git commit -m "redesign: migrate ProfileScreen to glassmorphism with GlassBottomSheet modals"
```

---

### Task 10: Migrate DashboardScreen

**Files:**
- Modify: `NutriAIApp/src/screens/DashboardScreen.js`

The hero screen (846 lines). Most complex — has streak celebration, macro ring, meal timing, water card, health card, quick access, weekly chart, suggested meal, FAB, and modals.

- [ ] **Step 1: Read the current file**

Read `/Users/kush/NutriAI/NutriAIApp/src/screens/DashboardScreen.js` completely.

- [ ] **Step 2: Update imports**

```javascript
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING } from '../constants/theme';
import { GlassCard, GradientButton, GradientRing, GlassBottomSheet, Badge, FadeIn, SkeletonCard } from '../components';
import { MacroChip, SectionHeader } from '../components/UI';
```

- [ ] **Step 3: Migrate StreakCelebration sub-component**

The `StreakCelebration` component is defined in the same file. It needs theme access too.

Pass palette/accent as props or use `useTheme()` inside it:
```javascript
function StreakCelebration({ count, onDone }) {
  const { palette, accent, gradients } = useTheme();
  // ... replace C.* usage with palette.*/accent.*
}
```

- Celebration card: `GlassCard level={3}` style (use glass3Bg/glass3Border)
- Particle emojis: keep as-is (they're decorative)
- Overlay: `palette.overlay` background

- [ ] **Step 4: Migrate Dashboard main sections**

Add `const { mode, palette, accent, gradients, type } = useTheme();` at top.

**Header area:**
- Greeting text: `palette.textPrimary`
- Streak inline: dot colors — filled = `accent.primary`, empty = `palette.bg3`
- Profile avatar: keep existing, ring border = `accent.primary`
- Goal pill: `palette.glass1Bg` background

**Calorie hero card:**
- `GlassCard level={2}` — the main macro tracking card
- `CircularProgress` → `GradientRing` with `gradient={gradients.primary}`
- `MacroChip` — keep, but pass `accent.protein`, `accent.carbs`, `accent.fat` as colors

**Meal timing section:**
- 4 meal rows: `palette.bg1` background, icons use `palette.textTertiary` (empty) or `accent.primary` (logged)
- "Log" buttons: small `GradientButton variant="ghost"` or keep as touchable text

**Water card:**
- `GlassCard level={1}`
- `GradientRing` with `gradient={gradients.hydration}` for water progress
- Quick-add button: `accent.hydration` colored

**HealthKit activity card:**
- `GlassCard level={1}`
- Steps icon: `accent.primary`, active cal icon: `accent.energy`

**Quick access cards:**
- 3 x `GlassCard level={1}` with `onPress`
- Icons: Pantry = `accent.primary`, Meals = `accent.energy`, Workout = `accent.hydration`

**Weekly progress card:**
- `GlassCard level={1}`
- Bar chart: `accent.primary` fill, `palette.bg3` track

**Suggested meal card:**
- `GlassCard level={1}` with gradient border accent

**FAB (floating add button):**
- LinearGradient with `gradients.primary` colors
- Round, bottom-right positioned

- [ ] **Step 5: Migrate modals**

- Meal detail modal → `GlassBottomSheet`
- Any other overlays → `GlassBottomSheet`

- [ ] **Step 6: All `C.*` → `palette.*` / `accent.*` per mapping**

- [ ] **Step 7: Verify and commit**

```bash
git add src/screens/DashboardScreen.js
git commit -m "redesign: migrate DashboardScreen to glassmorphism with gradient rings and glass cards"
```

---

### Task 11: Wire Up GlassTabBar in App.js

**Files:**
- Modify: `NutriAIApp/App.js`

Replace the standard bottom tab bar with the new GlassTabBar.

- [ ] **Step 1: Read App.js**

Read `/Users/kush/NutriAI/NutriAIApp/App.js` completely.

- [ ] **Step 2: Import GlassTabBar**

```javascript
import { GlassTabBar } from './src/components';
```

- [ ] **Step 3: Add tabBar prop to Tab.Navigator**

Find the `Tab.Navigator` component and add the `tabBar` prop:

```javascript
<Tab.Navigator
  tabBar={props => <GlassTabBar {...props} />}
  screenOptions={{
    headerShown: false,
    // Remove any existing tabBarStyle since GlassTabBar handles its own styling
  }}
>
```

- [ ] **Step 4: Add tabBarIconName and tabBarLabel to each Tab.Screen**

For each tab screen, add options that GlassTabBar reads:

```javascript
<Tab.Screen
  name="Home"
  component={HomeStack}
  options={{
    tabBarLabel: 'Home',
    tabBarIconName: 'home',
  }}
/>
<Tab.Screen
  name="Pantry"
  component={PantryScreen}
  options={{
    tabBarLabel: 'Pantry',
    tabBarIconName: 'basket',
  }}
/>
<Tab.Screen
  name="Meals"
  component={MealsStack}
  options={{
    tabBarLabel: 'Meals',
    tabBarIconName: 'restaurant',
  }}
/>
<Tab.Screen
  name="Workout"
  component={WorkoutStack}
  options={{
    tabBarLabel: 'Fitness',
    tabBarIconName: 'barbell',
  }}
/>
<Tab.Screen
  name="Profile"
  component={ProfileScreen}
  options={{
    tabBarLabel: 'Profile',
    tabBarIconName: 'person',
  }}
/>
```

Note: The AI center tab (with `tabBarIsCenter: true`) will be added in Phase 5 when the AI features are built. For now, keep the existing 5 tabs but with the glass tab bar styling.

- [ ] **Step 5: Migrate App.js theme usage**

Replace `C.*` usage in App.js styles with `useTheme()`:

Since App.js defines the root navigator, add `useTheme` to the navigator component (not the root App component which wraps ThemeProvider):

```javascript
function RootNav() {
  const { mode, palette } = useTheme();
  // ... use palette for NavigationContainer theme and other styling
}
```

Set NavigationContainer theme dynamically:
```javascript
<NavigationContainer
  theme={{
    dark: mode === 'dark',
    colors: {
      primary: '#34C759',
      background: palette.bg0,
      card: palette.bg1,
      text: palette.textPrimary,
      border: palette.border,
      notification: '#34C759',
    },
  }}
>
```

- [ ] **Step 6: Add bottom padding to scrollable screens**

Since GlassTabBar is absolutely positioned (floating), scrollable content needs extra bottom padding (~100px) so content isn't hidden behind the tab bar. This should already be handled if screens have `contentContainerStyle={{ paddingBottom: X }}` but verify and adjust if needed.

- [ ] **Step 7: Verify and commit**

Run the app. Verify:
- Floating glass tab bar renders at bottom
- All 5 tabs are tappable and navigate correctly
- Tab icons switch between filled/outline on focus
- Tab bar has blur effect
- Content scrolls behind the tab bar

```bash
git add App.js
git commit -m "redesign: wire up GlassTabBar and dynamic NavigationContainer theme"
```

---

### Task 12: Final Verification and Polish

**Files:**
- Potentially any screen file for minor fixes

- [ ] **Step 1: Full app walkthrough in dark mode**

Launch the app and navigate through every screen:
1. AuthScreen (sign in/up)
2. OnboardScreen (if accessible)
3. DashboardScreen (home tab)
4. WaterScreen (from dashboard)
5. WeightScreen (from dashboard)
6. PantryScreen (pantry tab)
7. MealsScreen (meals tab)
8. RecipeScreen (tap a recipe)
9. FoodSearchScreen (search)
10. WorkoutScreen (fitness tab)
11. ActiveWorkoutScreen (start a workout)
12. WorkoutLogScreen (workout history)
13. WeeklyDetailScreen (weekly detail)
14. ProfileScreen (profile tab, open sheets)

Verify: no `C.black` charcoal backgrounds remain, all cards have glass appearance, buttons have gradients, headers have blur potential, tab bar is floating glass.

- [ ] **Step 2: Test light mode**

If possible, toggle to light mode (via system settings or a test toggle) and verify:
- Backgrounds are lavender-white
- Text contrast is good
- Glass cards have proper light-mode opacity
- StatusBar is dark-content

- [ ] **Step 3: Fix any visual issues**

Fix any visual regressions found during walkthrough. Common issues:
- Text color contrast in light mode
- Glass card borders too visible/invisible
- Missing bottom padding behind floating tab bar
- Hard-coded colors that should use palette

- [ ] **Step 4: Commit fixes**

```bash
git add -A
git commit -m "fix: polish glassmorphism visual issues found during Phase 2 walkthrough"
```

---

## Summary

After Phase 2, the codebase has:
- **All 14 screens** migrated to the glassmorphism design system
- **Dynamic light/dark mode** support across the entire app
- **GlassTabBar** replacing the standard bottom tabs
- **GlassBottomSheet** replacing all Modal-based bottom sheets
- **GradientRing** replacing CircularProgress for macro/water tracking
- **GradientButton** replacing PillButton across all screens
- **GlassCard** replacing Card for all content containers
- **BlurHeader** replacing ScreenHeader on detail screens

**Next:** Phase 3 will add the subscription infrastructure (RevenueCat, paywall, entitlements).
