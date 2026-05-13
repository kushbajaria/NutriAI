import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RADIUS, SPACING } from '../constants/theme';
import { WORKOUTS, DURATIONS } from '../constants/data';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { GlassCard, GradientButton, Badge, SectionHeader, FadeIn } from '../components';
import Icon from '../components/Icon';

const TYPES = Object.keys(WORKOUTS);

export default function WorkoutScreen({ navigation }) {
  const [type, setType]         = useState('Full Body');
  const [duration, setDuration] = useState('30 min');
  const [refreshing, setRefreshing] = useState(false);
  const { totalCals, goal } = useApp();
  const { mode, palette, accent, gradients } = useTheme();
  const onRefresh = useCallback(() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }, []);
  const plan      = WORKOUTS[type];
  const exercises = plan.byDuration[duration];
  const calBurn   = plan.calBurn[duration];

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[s.header, { borderBottomColor: palette.border }]}>
        <Text style={[s.headerTitle, { color: palette.textPrimary }]}>Workout</Text>
        <View style={[s.calBadge, { backgroundColor: accent.primaryBg, borderColor: accent.primary + '30' }]}>
          <Text style={[s.calBadgeVal, { color: accent.primary }]}>~{calBurn}</Text>
          <Text style={[s.calBadgeLbl, { color: accent.primaryDim }]}>cal burn</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent.primary} />}>

        {/* Workout log card */}
        <FadeIn delay={0}>
        <GlassCard level={1} onPress={() => navigation.navigate('WorkoutLog')} style={s.logCard}>
          <View style={s.logCardInner}>
            <Icon name="time-outline" size={18} color={accent.primary} />
            <Text style={[s.logCardText, { color: palette.textPrimary }]}>Workout Log</Text>
            <Icon name="chevron-forward" size={16} color={palette.textTertiary} />
          </View>
        </GlassCard>
        </FadeIn>

        {/* Type selector */}
        <FadeIn delay={60}>
        <SectionHeader title="Workout Type" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.lg }}>
          <View style={s.typeRow}>
            {TYPES.map(t => {
              const active = type === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[
                    s.typeCard,
                    { borderColor: palette.border, backgroundColor: palette.glass1Bg },
                    active && { borderColor: accent.primary, backgroundColor: accent.primaryBg },
                  ]}
                  onPress={() => { setType(t); }}
                  activeOpacity={0.8}
                >
                  <Icon name={WORKOUTS[t].icon} size={24} color={active ? accent.primary : palette.textSecondary} />
                  <Text style={[s.typeLabel, { color: active ? palette.textPrimary : palette.textSecondary }]}>{t}</Text>
                  <Text style={[s.typeDesc, { color: palette.textTertiary }]}>{WORKOUTS[t].desc}</Text>
                  {active && <View style={[s.typeActiveDot, { backgroundColor: accent.primary }]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
        </FadeIn>

        {/* Duration */}
        <FadeIn delay={120}>
        <SectionHeader title="Duration" />
        <View style={s.durRow}>
          {DURATIONS.map(d => {
            const active = duration === d;
            return (
              <TouchableOpacity
                key={d}
                style={[
                  s.durChip,
                  { borderColor: palette.border, backgroundColor: palette.glass1Bg },
                  active && { borderColor: accent.primary, backgroundColor: accent.primaryBg },
                ]}
                onPress={() => { setDuration(d); }}
                activeOpacity={0.75}
              >
                <Text style={[s.durText, { color: active ? accent.primary : palette.textSecondary }, active && s.durTextActive]}>{d}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        </FadeIn>

        {/* Plan card */}
        <FadeIn delay={180}>
        <GlassCard level={1} style={s.planCard}>
          <View style={s.planTop}>
            <View style={[s.planEmoji, { backgroundColor: palette.bg2 }]}>
              <Icon name={plan.icon} size={28} color={accent.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.planTitle, { color: palette.textPrimary }]}>{type}</Text>
              <Text style={[s.planDuration, { color: accent.primary }]}>{duration} · {exercises.length} exercises</Text>
              <Text style={[s.planDesc, { color: palette.textSecondary }]}>{plan.desc}</Text>
            </View>
            <Badge label={`~${calBurn} cal`} color={accent.primary} />
          </View>

          <View style={[s.planDivider, { backgroundColor: palette.border }]} />

          <SectionHeader title="Exercises" />
          <View style={s.exerciseList}>
            {exercises.map((ex, i) => (
              <View key={ex.name} style={[s.exerciseRow, { backgroundColor: palette.bg2, borderColor: palette.border }]}>
                <View style={[s.exNum, { backgroundColor: palette.bg3, borderColor: palette.borderHi }]}>
                  <Text style={[s.exNumText, { color: palette.textTertiary }]}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.exName, { color: palette.textPrimary }]}>{ex.name}</Text>
                  <Text style={[s.exMuscle, { color: palette.textTertiary }]}>{ex.muscle}</Text>
                </View>
                <View style={s.exRight}>
                  <Text style={[s.exSets, { color: accent.primary }]}>{ex.sets} × {ex.reps}</Text>
                  <Text style={[s.exRest, { color: palette.textTertiary }]}>{ex.rest}s rest</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Start button */}
          <GradientButton
            label="Start Workout"
            onPress={() => navigation.navigate('ActiveWorkout', { type, duration, calBurn, exercises })}
            gradient={gradients.energy}
          />
        </GlassCard>
        </FadeIn>

        {/* AI Insight */}
        <FadeIn delay={240}>
        <GlassCard level={1} style={[s.insightCard, { borderColor: accent.primary + '22' }]}>
          <View style={s.insightHeader}>
            <Text style={[s.insightLabel, { color: accent.primary }]}>Insight</Text>
          </View>
          <Text style={[s.insightBody, { color: palette.textSecondary }]}>
            With{' '}
            <Text style={[s.insightHighlight, { color: palette.textPrimary }]}>{totalCals} kcal consumed</Text>
            {' '}today and your{' '}
            <Text style={[s.insightHighlight, { color: palette.textPrimary }]}>{goal?.toLowerCase()}</Text>
            {' '}goal, this {type.toLowerCase()} session is optimally timed.
            Your body has adequate fuel for peak performance.
          </Text>
        </GlassCard>
        </FadeIn>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  calBadge:    { borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, alignItems: 'center', marginTop: 4 },
  calBadgeVal: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  calBadgeLbl: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

  scroll:        { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },

  // Log card
  logCard:      { marginBottom: SPACING.md },
  logCardInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logCardText:  { flex: 1, fontSize: 14, fontWeight: '700' },

  // Type selector
  typeRow: { flexDirection: 'row', gap: 10, paddingRight: SPACING.md },
  typeCard: {
    width: 128,
    borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, gap: 4,
  },
  typeLabel:      { fontSize: 13, fontWeight: '700' },
  typeDesc:       { fontSize: 10, fontWeight: '500' },
  typeActiveDot:  { width: 5, height: 5, borderRadius: 3, marginTop: 4 },

  // Duration
  durRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.lg, flexWrap: 'wrap' },
  durChip: {
    paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  durText:       { fontSize: 13, fontWeight: '600' },
  durTextActive: { fontWeight: '700' },

  // Plan card
  planCard:      { marginBottom: SPACING.md },
  planTop:       { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: SPACING.md },
  planEmoji:     { width: 56, height: 56, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  planTitle:     { fontSize: 18, fontWeight: '800', letterSpacing: -0.3, marginBottom: 2 },
  planDuration:  { fontSize: 12, fontWeight: '600', marginBottom: 3 },
  planDesc:      { fontSize: 12 },
  planDivider:   { height: 1, marginBottom: SPACING.md },

  // Exercises
  exerciseList: { gap: 8, marginBottom: SPACING.md },
  exerciseRow:  {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: RADIUS.md,
    padding: 12, borderWidth: 1,
  },
  exNum:     { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderWidth: 1 },
  exNumText: { fontSize: 12, fontWeight: '800' },
  exName:    { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  exMuscle:  { fontSize: 11 },
  exRight:   { alignItems: 'flex-end' },
  exSets:    { fontSize: 14, fontWeight: '800' },
  exRest:    { fontSize: 10, marginTop: 2 },

  // Insight card
  insightCard:      { borderWidth: 1 },
  insightHeader:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  insightLabel:     { fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  insightBody:      { fontSize: 14, lineHeight: 23 },
  insightHighlight: { fontWeight: '700' },
});
