import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING } from '../constants/theme';
import { RECIPES } from '../constants/data';
import { useApp } from '../context/AppContext';
import { ScreenHeader, Badge, SectionHeader, PillButton } from '../components/UI';

// ── MEALS LIST ────────────────────────────────────────────────────
export function MealsScreen({ navigation }) {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.black} />
      <View style={s.header}>
        <View>
          <Text style={s.headerEyebrow}>AI GENERATED</Text>
          <Text style={s.headerTitle}>Meal Planner</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.introText}>Based on your pantry & goal</Text>

        {RECIPES.map(r => (
          <TouchableOpacity
            key={r.id}
            style={s.recipeCard}
            onPress={() => navigation.navigate('Recipe', { recipe: r })}
            activeOpacity={0.8}
          >
            {/* Left emoji block */}
            <View style={s.emojiBlock}>
              <Text style={s.emoji}>{r.emoji}</Text>
            </View>

            {/* Content */}
            <View style={s.content}>
              <View style={s.topRow}>
                <View style={s.tagWrap}>
                  <Text style={s.tagText}>{r.tag}</Text>
                </View>
                <Text style={s.diff}>{r.diff}</Text>
              </View>

              <Text style={s.name}>{r.name}</Text>

              <View style={s.metaRow}>
                <Text style={s.metaItem}>🔥 {r.cal} cal</Text>
                <Text style={s.metaItem}>💪 {r.protein}g</Text>
                <Text style={s.metaItem}>⏱ {r.prepTime + r.cookTime}m</Text>
              </View>

              {/* Macro bars */}
              <View style={s.macroBars}>
                {[
                  { val: r.protein, max: 60,  color: C.protein, label: 'P' },
                  { val: r.carbs,   max: 100, color: C.carbs,   label: 'C' },
                  { val: r.fat,     max: 40,  color: C.fat,     label: 'F' },
                ].map(m => (
                  <View key={m.label} style={s.macroRow}>
                    <Text style={s.macroLabel}>{m.label}</Text>
                    <View style={s.macroTrack}>
                      <View style={[
                        s.macroFill,
                        { width: `${Math.min(100, (m.val / m.max) * 100)}%`, backgroundColor: m.color }
                      ]} />
                    </View>
                    <Text style={s.macroVal}>{m.val}g</Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={s.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── RECIPE DETAIL ─────────────────────────────────────────────────
export function RecipeScreen({ navigation, route }) {
  const { logMeal } = useApp();

  // Safety check — if no recipe passed, go back
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

  const handleLog = () => {
    logMeal(r);
    navigation.navigate('Main');
  };

  return (
    <SafeAreaView style={rs.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.black} />

      {/* Header */}
      <View style={rs.header}>
        <TouchableOpacity
          style={rs.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={rs.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={rs.headerTitle} numberOfLines={1}>{r.name}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Hero block */}
        <View style={rs.hero}>
          <View style={rs.heroEmoji}>
            <Text style={rs.heroEmojiText}>{r.emoji}</Text>
          </View>
          <View style={rs.heroInfo}>
            <View style={rs.heroBadge}>
              <Text style={rs.heroBadgeText}>{r.tag}</Text>
            </View>
            <Text style={rs.heroTitle}>{r.name}</Text>
            <View style={rs.heroChips}>
              <View style={rs.chip}><Text style={rs.chipText}>⏱ {r.prepTime}m prep</Text></View>
              <View style={rs.chip}><Text style={rs.chipText}>🔥 {r.cookTime}m cook</Text></View>
              <View style={rs.chip}><Text style={rs.chipText}>🍽 {r.servings} serving</Text></View>
              <View style={rs.chip}><Text style={rs.chipText}>{r.diff}</Text></View>
            </View>
          </View>
        </View>

        <View style={rs.body}>

          {/* Nutrition grid */}
          <Text style={rs.sectionLabel}>NUTRITION</Text>
          <View style={rs.nutriGrid}>
            {[
              { val: r.cal,     unit: '',  label: 'Calories', color: C.lime    },
              { val: r.protein, unit: 'g', label: 'Protein',  color: C.protein },
              { val: r.carbs,   unit: 'g', label: 'Carbs',    color: C.carbs   },
              { val: r.fat,     unit: 'g', label: 'Fat',      color: C.fat     },
            ].map(n => (
              <View key={n.label} style={rs.nutriCard}>
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

      {/* Bottom action bar */}
      <View style={rs.actionBar}>
        <TouchableOpacity
          style={rs.ghostBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={rs.ghostBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={rs.logBtn}
          onPress={handleLog}
          activeOpacity={0.85}
        >
          <Text style={rs.logBtnText}>Log This Meal ✓</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── STYLES: MEALS ────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.black },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerEyebrow: {
    fontSize: 10, fontWeight: '700', color: C.lime,
    letterSpacing: 2, marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24, fontWeight: '900', color: C.textPrimary, letterSpacing: -0.5,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },
  introText: {
    fontSize: 13, color: C.textSecondary,
    marginBottom: SPACING.md, fontWeight: '500',
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: C.surface1,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
    alignItems: 'flex-start',
  },
  emojiBlock: {
    width: 56, height: 56,
    backgroundColor: C.surface3,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emoji: { fontSize: 30 },
  content: { flex: 1, gap: 5 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagWrap: {
    backgroundColor: 'rgba(168,255,62,0.12)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(168,255,62,0.25)',
  },
  tagText: { fontSize: 10, fontWeight: '700', color: C.lime, letterSpacing: 0.3 },
  diff: { fontSize: 11, color: C.textTertiary, fontWeight: '600' },
  name: {
    fontSize: 16, fontWeight: '800',
    color: C.textPrimary, letterSpacing: -0.3,
  },
  metaRow: { flexDirection: 'row', gap: 10 },
  metaItem: { fontSize: 12, color: C.textSecondary, fontWeight: '500' },
  macroBars: { gap: 4, marginTop: 2 },
  macroRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  macroLabel: { fontSize: 9, fontWeight: '700', color: C.textTertiary, width: 10 },
  macroTrack: {
    flex: 1, height: 3,
    backgroundColor: C.surface3,
    borderRadius: 2, overflow: 'hidden',
  },
  macroFill: { height: 3, borderRadius: 2 },
  macroVal: {
    fontSize: 10, color: C.textTertiary,
    fontWeight: '600', width: 28, textAlign: 'right',
  },
  arrow: { fontSize: 16, color: C.textTertiary, alignSelf: 'center' },
});

// ── STYLES: RECIPE ────────────────────────────────────────────────
const rs = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.black },

  // error state
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { fontSize: 16, color: C.textSecondary },
  errorBtn: {
    backgroundColor: C.lime, borderRadius: RADIUS.full,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  errorBtnText: { fontSize: 14, fontWeight: '700', color: C.textInverse },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.surface2,
    borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { fontSize: 18, color: C.lime, marginTop: -1 },
  headerTitle: {
    fontSize: 17, fontWeight: '700',
    color: C.textPrimary, flex: 1,
    textAlign: 'center', marginHorizontal: 8,
  },

  hero: {
    flexDirection: 'row', gap: 14,
    padding: SPACING.md,
    backgroundColor: C.surface1,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  heroEmoji: {
    width: 80, height: 80,
    backgroundColor: C.surface3,
    borderRadius: RADIUS.lg,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  heroEmojiText: { fontSize: 40 },
  heroInfo: { flex: 1, gap: 6, justifyContent: 'center' },
  heroBadge: {
    backgroundColor: 'rgba(168,255,62,0.12)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 4,
    alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(168,255,62,0.25)',
  },
  heroBadgeText: { fontSize: 10, fontWeight: '700', color: C.lime, letterSpacing: 0.4 },
  heroTitle: {
    fontSize: 18, fontWeight: '800',
    color: C.textPrimary, letterSpacing: -0.4,
  },
  heroChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    backgroundColor: C.surface3,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  chipText: { fontSize: 11, color: C.textSecondary, fontWeight: '600' },

  body: { padding: SPACING.md },
  sectionLabel: {
    fontSize: 10, fontWeight: '700',
    color: C.textTertiary, letterSpacing: 1.2,
    marginBottom: 10, marginTop: 4,
  },

  nutriGrid: { flexDirection: 'row', gap: 8, marginBottom: SPACING.lg },
  nutriCard: {
    flex: 1, backgroundColor: C.surface1,
    borderRadius: RADIUS.md, padding: 12,
    alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  nutriVal: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  nutriUnit: { fontSize: 12, fontWeight: '700' },
  nutriLabel: { fontSize: 10, color: C.textTertiary, fontWeight: '600', marginTop: 3 },

  ingRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.lg },
  ingChip: {
    backgroundColor: C.surface2,
    borderWidth: 1, borderColor: C.borderHi,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  ingText: { fontSize: 13, color: C.textPrimary, fontWeight: '500' },

  steps: { gap: 10, marginBottom: SPACING.lg },
  step: {
    flexDirection: 'row', gap: 12,
    backgroundColor: C.surface1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1, borderColor: C.border,
  },
  stepNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.lime,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumText: { fontSize: 12, fontWeight: '900', color: C.textInverse },
  stepText: {
    fontSize: 14, color: C.textSecondary,
    lineHeight: 22, flex: 1, paddingTop: 3,
  },

  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10,
    padding: SPACING.md, paddingBottom: 32,
    backgroundColor: C.black,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  ghostBtn: {
    width: 80, height: 52,
    borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: C.borderHi,
    alignItems: 'center', justifyContent: 'center',
  },
  ghostBtnText: { fontSize: 14, color: C.textSecondary, fontWeight: '600' },
  logBtn: {
    flex: 1, height: 52,
    backgroundColor: C.lime,
    borderRadius: RADIUS.full,
    alignItems: 'center', justifyContent: 'center',
  },
  logBtnText: { fontSize: 15, fontWeight: '800', color: C.textInverse },
});