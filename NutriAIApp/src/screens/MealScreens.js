import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { RECIPES } from '../constants/data';
import { useApp } from '../context/AppContext';
import { Badge, SectionHeader, GlowDot } from '../components/UI';

// ── MACRO BAR ROW ──────────────────────────────────────────────────
function MacroBar({ label, value, max, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <View style={s.macroBarRow}>
      <Text style={s.macroBarLabel}>{label}</Text>
      <View style={s.macroBarTrack}>
        <View style={[s.macroBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[s.macroBarVal, { color }]}>{value}g</Text>
    </View>
  );
}

// ── RECIPE CARD ────────────────────────────────────────────────────
function RecipeCard({ recipe: r, onPress }) {
  return (
    <TouchableOpacity style={s.recipeCard} onPress={onPress} activeOpacity={0.8}>
      {/* Emoji + difficulty badge */}
      <View style={s.cardHeader}>
        <View style={s.emojiWrap}>
          <Text style={s.emoji}>{r.emoji}</Text>
        </View>
        <View style={s.cardHeaderRight}>
          <Badge label={r.tag} color={C.lime} />
          <View style={s.diffRow}>
            <Text style={s.diffText}>{r.diff}</Text>
          </View>
        </View>
      </View>

      {/* Name + meta */}
      <Text style={s.recipeName}>{r.name}</Text>
      <View style={s.metaRow}>
        <View style={s.metaChip}>
          <Text style={s.metaChipText}>🔥 {r.cal} cal</Text>
        </View>
        <View style={s.metaChip}>
          <Text style={s.metaChipText}>💪 {r.protein}g prot</Text>
        </View>
        <View style={s.metaChip}>
          <Text style={s.metaChipText}>⏱ {r.prepTime + r.cookTime}m</Text>
        </View>
      </View>

      {/* Macro bars */}
      <View style={s.macroSection}>
        <MacroBar label="P" value={r.protein} max={60}  color={C.protein} />
        <MacroBar label="C" value={r.carbs}   max={100} color={C.carbs}   />
        <MacroBar label="F" value={r.fat}     max={40}  color={C.fat}     />
      </View>

      {/* Footer */}
      <View style={s.cardFooter}>
        <Text style={s.footerServings}>{r.servings} serving{r.servings !== 1 ? 's' : ''}</Text>
        <View style={s.viewBtn}>
          <Text style={s.viewBtnText}>View Recipe →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── MEALS LIST ─────────────────────────────────────────────────────
export function MealsScreen({ navigation }) {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.black} />

      {/* Header */}
      <View style={s.header}>
        <View>
          <View style={s.eyebrowRow}>
            <GlowDot size={6} />
            <Text style={s.eyebrow}>AI GENERATED</Text>
          </View>
          <Text style={s.headerTitle}>Meal Planner</Text>
        </View>
        <View style={s.countBadge}>
          <Text style={s.countText}>{RECIPES.length} recipes</Text>
        </View>
      </View>

      {/* Subtitle */}
      <View style={s.subtitleRow}>
        <Text style={s.subtitle}>Based on your pantry &amp; goal</Text>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="RECOMMENDED FOR YOU" />
        {RECIPES.map(r => (
          <RecipeCard
            key={r.id}
            recipe={r}
            onPress={() => navigation.navigate('Recipe', { recipe: r })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── RECIPE DETAIL ──────────────────────────────────────────────────
export function RecipeScreen({ navigation, route }) {
  const { logMeal } = useApp();

  if (!route?.params?.recipe) {
    return (
      <SafeAreaView style={rs.safe} edges={['top']}>
        <View style={rs.errorWrap}>
          <Text style={rs.errorText}>Recipe not found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={rs.errorBtn}>
            <Text style={rs.errorBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const r = route.params.recipe;
  const handleLog = () => { logMeal(r); navigation.navigate('Main'); };

  return (
    <SafeAreaView style={rs.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.black} />

      {/* Nav bar */}
      <View style={rs.navbar}>
        <TouchableOpacity style={rs.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={rs.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={rs.navTitle} numberOfLines={1}>{r.name}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Hero */}
        <View style={rs.hero}>
          <View style={rs.heroEmoji}>
            <Text style={rs.heroEmojiText}>{r.emoji}</Text>
          </View>
          <View style={rs.heroInfo}>
            <Badge label={r.tag} color={C.lime} />
            <Text style={rs.heroTitle}>{r.name}</Text>
            <View style={rs.chipRow}>
              {[`⏱ ${r.prepTime}m prep`, `🔥 ${r.cookTime}m cook`, `🍽 ${r.servings} srv`, r.diff].map(c => (
                <View key={c} style={rs.chip}><Text style={rs.chipText}>{c}</Text></View>
              ))}
            </View>
          </View>
        </View>

        <View style={rs.body}>

          {/* Nutrition */}
          <Text style={rs.sectionLabel}>NUTRITION</Text>
          <View style={rs.nutriGrid}>
            {[
              { val: r.cal,     unit: '',  label: 'Calories', color: C.lime    },
              { val: r.protein, unit: 'g', label: 'Protein',  color: C.protein },
              { val: r.carbs,   unit: 'g', label: 'Carbs',    color: C.carbs   },
              { val: r.fat,     unit: 'g', label: 'Fat',      color: C.fat     },
            ].map(n => (
              <View key={n.label} style={[rs.nutriCard, { borderColor: n.color + '30', backgroundColor: n.color + '0C' }]}>
                <Text style={[rs.nutriVal, { color: n.color }]}>
                  {n.val}<Text style={rs.nutriUnit}>{n.unit}</Text>
                </Text>
                <Text style={rs.nutriLabel}>{n.label}</Text>
              </View>
            ))}
          </View>

          {/* Ingredients */}
          <Text style={rs.sectionLabel}>INGREDIENTS</Text>
          <View style={rs.ingRow}>
            {r.ingredients.map(ing => (
              <View key={ing} style={rs.ingChip}>
                <Text style={rs.ingText}>{ing}</Text>
              </View>
            ))}
          </View>

          {/* Instructions */}
          <Text style={rs.sectionLabel}>METHOD</Text>
          <View style={rs.steps}>
            {r.instructions.map((step, i) => (
              <View key={i} style={rs.step}>
                <View style={rs.stepNum}>
                  <Text style={rs.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={rs.stepText}>{step}</Text>
              </View>
            ))}
          </View>

        </View>
      </ScrollView>

      {/* Bottom action */}
      <View style={rs.actionBar}>
        <TouchableOpacity style={rs.ghostBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={rs.ghostBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={rs.logBtn} onPress={handleLog} activeOpacity={0.85}>
          <Text style={rs.logBtnText}>Log This Meal ✓</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── STYLES: MEALS ──────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.black },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  eyebrow:    { fontSize: 9, fontWeight: '700', color: C.lime, letterSpacing: 2 },
  headerTitle:{ fontSize: 26, fontWeight: '900', color: C.textPrimary, letterSpacing: -0.5 },
  countBadge: {
    backgroundColor: C.surface2, borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: C.border, marginTop: 4,
  },
  countText: { fontSize: 12, fontWeight: '700', color: C.textSecondary },
  subtitleRow: { paddingHorizontal: SPACING.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  subtitle:    { fontSize: 13, color: C.textSecondary, fontWeight: '500' },
  scroll:        { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },

  // Recipe card
  recipeCard: {
    backgroundColor: C.surface1, borderRadius: RADIUS.xl,
    padding: SPACING.md, marginBottom: 14,
    borderWidth: 1, borderColor: C.border,
    gap: 10,
  },
  cardHeader:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  emojiWrap:       { width: 64, height: 64, backgroundColor: C.surface3, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  emoji:           { fontSize: 34 },
  cardHeaderRight: { flex: 1, gap: 6, paddingTop: 2 },
  diffRow:         { flexDirection: 'row', alignItems: 'center', gap: 4 },
  diffText:        { fontSize: 11, color: C.textTertiary, fontWeight: '600' },
  recipeName:      { fontSize: 18, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.4 },
  metaRow:         { flexDirection: 'row', gap: 6 },
  metaChip:        { backgroundColor: C.surface2, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.border },
  metaChipText:    { fontSize: 11, color: C.textSecondary, fontWeight: '600' },
  macroSection:    { gap: 5, paddingTop: 2 },
  macroBarRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  macroBarLabel:   { fontSize: 9, fontWeight: '700', color: C.textTertiary, width: 12 },
  macroBarTrack:   { flex: 1, height: 4, backgroundColor: C.surface3, borderRadius: 2, overflow: 'hidden' },
  macroBarFill:    { height: 4, borderRadius: 2 },
  macroBarVal:     { fontSize: 10, fontWeight: '700', width: 30, textAlign: 'right' },
  cardFooter:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10 },
  footerServings:  { fontSize: 12, color: C.textTertiary, fontWeight: '500' },
  viewBtn:         { flexDirection: 'row', alignItems: 'center' },
  viewBtnText:     { fontSize: 13, color: C.lime, fontWeight: '700' },
});

// ── STYLES: RECIPE ──────────────────────────────────────────────────
const rs = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.black },
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { fontSize: 16, color: C.textSecondary },
  errorBtn:  { backgroundColor: C.lime, borderRadius: RADIUS.full, paddingHorizontal: 24, paddingVertical: 12 },
  errorBtnText: { fontSize: 14, fontWeight: '700', color: C.textInverse },

  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.borderHi, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 18, color: C.lime, marginTop: -1 },
  navTitle:    { fontSize: 16, fontWeight: '700', color: C.textPrimary, flex: 1, textAlign: 'center', marginHorizontal: 8 },

  hero: {
    flexDirection: 'row', gap: 16,
    padding: SPACING.md,
    backgroundColor: C.surface1,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  heroEmoji:     { width: 88, height: 88, backgroundColor: C.surface3, borderRadius: RADIUS.xl, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  heroEmojiText: { fontSize: 46 },
  heroInfo:      { flex: 1, gap: 8, justifyContent: 'center' },
  heroTitle:     { fontSize: 20, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.4 },
  chipRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip:          { backgroundColor: C.surface3, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 5 },
  chipText:      { fontSize: 11, color: C.textSecondary, fontWeight: '600' },

  body:         { padding: SPACING.md },
  sectionLabel: { fontSize: 9, fontWeight: '700', color: C.textTertiary, letterSpacing: 1.8, marginBottom: 10, marginTop: 4 },

  nutriGrid: { flexDirection: 'row', gap: 8, marginBottom: SPACING.lg },
  nutriCard: { flex: 1, borderRadius: RADIUS.md, padding: 12, alignItems: 'center', borderWidth: 1 },
  nutriVal:  { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  nutriUnit: { fontSize: 12, fontWeight: '700' },
  nutriLabel:{ fontSize: 10, color: C.textTertiary, fontWeight: '600', marginTop: 3 },

  ingRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.lg },
  ingChip: { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.borderHi, borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 8 },
  ingText: { fontSize: 13, color: C.textPrimary, fontWeight: '500' },

  steps:       { gap: 10, marginBottom: SPACING.lg },
  step:        { flexDirection: 'row', gap: 14, backgroundColor: C.surface1, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: C.border },
  stepNum:     { width: 28, height: 28, borderRadius: 14, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...SHADOW.lime },
  stepNumText: { fontSize: 12, fontWeight: '900', color: C.textInverse },
  stepText:    { fontSize: 14, color: C.textSecondary, lineHeight: 22, flex: 1, paddingTop: 3 },

  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10,
    padding: SPACING.md, paddingBottom: 32,
    backgroundColor: C.black, borderTopWidth: 1, borderTopColor: C.border,
  },
  ghostBtn:     { width: 80, height: 52, borderRadius: RADIUS.full, borderWidth: 1, borderColor: C.borderHi, alignItems: 'center', justifyContent: 'center' },
  ghostBtnText: { fontSize: 14, color: C.textSecondary, fontWeight: '600' },
  logBtn:       { flex: 1, height: 52, backgroundColor: C.lime, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center', ...SHADOW.lime },
  logBtnText:   { fontSize: 15, fontWeight: '800', color: C.textInverse },
});
