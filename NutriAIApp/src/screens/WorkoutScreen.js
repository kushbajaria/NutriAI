import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { WORKOUTS, DURATIONS } from '../constants/data';
import { useApp } from '../context/AppContext';
import { Badge, SectionHeader } from '../components/UI';
import Icon from '../components/Icon';

const TYPES = Object.keys(WORKOUTS);

export default function WorkoutScreen({ navigation }) {
  const [type, setType]         = useState('Full Body');
  const [duration, setDuration] = useState('30 min');
  const { totalCals, goal } = useApp();
  const plan      = WORKOUTS[type];
  const exercises = plan.byDuration[duration];
  const calBurn   = plan.calBurn[duration];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Workout</Text>
        <View style={s.calBadge}>
          <Text style={s.calBadgeVal}>~{calBurn}</Text>
          <Text style={s.calBadgeLbl}>cal burn</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Workout log card */}
        <TouchableOpacity style={s.logCard} onPress={() => navigation.navigate('WorkoutLog')} activeOpacity={0.7}>
          <Icon name="time-outline" size={18} color={C.accent} />
          <Text style={s.logCardText}>Workout Log</Text>
          <Icon name="chevron-forward" size={16} color={C.textTertiary} />
        </TouchableOpacity>

        {/* Type selector */}
        <SectionHeader title="Workout Type" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.lg }}>
          <View style={s.typeRow}>
            {TYPES.map(t => {
              const active = type === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[s.typeCard, active && s.typeCardActive]}
                  onPress={() => { setType(t); setCompleted(false); }}
                  activeOpacity={0.8}
                >
                  <Icon name={WORKOUTS[t].icon} size={24} color={active ? C.accent : C.textSecondary} />
                  <Text style={[s.typeLabel, active && s.typeLabelActive]}>{t}</Text>
                  <Text style={s.typeDesc}>{WORKOUTS[t].desc}</Text>
                  {active && <View style={s.typeActiveDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Duration */}
        <SectionHeader title="Duration" />
        <View style={s.durRow}>
          {DURATIONS.map(d => {
            const active = duration === d;
            return (
              <TouchableOpacity
                key={d}
                style={[s.durChip, active && s.durChipActive]}
                onPress={() => { setDuration(d); setCompleted(false); }}
                activeOpacity={0.75}
              >
                <Text style={[s.durText, active && s.durTextActive]}>{d}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Plan card */}
        <View style={s.planCard}>
          <View style={s.planTop}>
            <View style={s.planEmoji}>
              <Icon name={plan.icon} size={28} color={C.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.planTitle}>{type}</Text>
              <Text style={s.planDuration}>{duration} · {exercises.length} exercises</Text>
              <Text style={s.planDesc}>{plan.desc}</Text>
            </View>
            <Badge label={`~${calBurn} cal`} color={C.accent} />
          </View>

          <View style={s.planDivider} />

          <SectionHeader title="Exercises" />
          <View style={s.exerciseList}>
            {exercises.map((ex, i) => (
              <View key={ex.name} style={s.exerciseRow}>
                <View style={s.exNum}>
                  <Text style={s.exNumText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.exName}>{ex.name}</Text>
                  <Text style={s.exMuscle}>{ex.muscle}</Text>
                </View>
                <View style={s.exRight}>
                  <Text style={s.exSets}>{ex.sets} × {ex.reps}</Text>
                  <Text style={s.exRest}>{ex.rest}s rest</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Start button */}
          <TouchableOpacity
            style={s.startBtn}
            onPress={() => navigation.navigate('ActiveWorkout', { type, duration, calBurn, exercises })}
            activeOpacity={0.85}
          >
            <Text style={s.startBtnText}>Start Workout</Text>
          </TouchableOpacity>
        </View>

        {/* AI Insight */}
        <View style={s.insightCard}>
          <View style={s.insightHeader}>
            <Text style={s.insightLabel}>Insight</Text>
          </View>
          <Text style={s.insightBody}>
            With{' '}
            <Text style={s.insightHighlight}>{totalCals} kcal consumed</Text>
            {' '}today and your{' '}
            <Text style={s.insightHighlight}>{goal?.toLowerCase()}</Text>
            {' '}goal, this {type.toLowerCase()} session is optimally timed.
            Your body has adequate fuel for peak performance.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.black },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  eyebrowRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  eyebrow:     { fontSize: 9, fontWeight: '700', color: C.accent, letterSpacing: 2 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: C.textPrimary, letterSpacing: -0.5 },
  calBadge:    { backgroundColor: C.accentBg, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: C.accent + '30', alignItems: 'center', marginTop: 4 },
  calBadgeVal: { fontSize: 18, fontWeight: '900', color: C.accent, letterSpacing: -0.5 },
  calBadgeLbl: { fontSize: 9, fontWeight: '700', color: C.accentDim, letterSpacing: 0.5 },

  scroll:        { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },

  // Type selector
  typeRow: { flexDirection: 'row', gap: 10, paddingRight: SPACING.md },
  typeCard: {
    width: 128, backgroundColor: C.surface1,
    borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: C.border, gap: 4,
  },
  typeCardActive: {
    borderColor: C.accent,
    backgroundColor: C.accentBgSm,
    ...SHADOW.accent,
  },
  typeEmoji:      { fontSize: 26, marginBottom: 2 },
  typeLabel:      { fontSize: 13, fontWeight: '700', color: C.textSecondary },
  typeLabelActive:{ color: C.textPrimary },
  typeDesc:       { fontSize: 10, color: C.textTertiary, fontWeight: '500' },
  typeActiveDot:  { width: 5, height: 5, borderRadius: 3, backgroundColor: C.accent, marginTop: 4, ...SHADOW.accent },

  // Duration
  durRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.lg, flexWrap: 'wrap' },
  durChip: {
    paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: RADIUS.full, borderWidth: 1,
    borderColor: C.border, backgroundColor: C.surface1,
  },
  durChipActive: { borderColor: C.accent, backgroundColor: C.accentBg },
  durText:       { fontSize: 13, color: C.textSecondary, fontWeight: '600' },
  durTextActive: { color: C.accent, fontWeight: '700' },

  // Plan card
  planCard: {
    backgroundColor: C.surface1, borderRadius: RADIUS.xl,
    padding: SPACING.md, borderWidth: 1, borderColor: C.border,
    marginBottom: SPACING.md,
  },
  planTop:       { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: SPACING.md },
  planEmoji:     { width: 56, height: 56, backgroundColor: C.surface3, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  planEmojiText: { fontSize: 28 },
  planTitle:     { fontSize: 18, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.3, marginBottom: 2 },
  planDuration:  { fontSize: 12, color: C.accent, fontWeight: '600', marginBottom: 3 },
  planDesc:      { fontSize: 12, color: C.textSecondary },
  planDivider:   { height: 1, backgroundColor: C.border, marginBottom: SPACING.md },

  // Exercises
  exerciseList: { gap: 8, marginBottom: SPACING.md },
  exerciseRow:  {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surface2, borderRadius: RADIUS.md,
    padding: 12, borderWidth: 1, borderColor: C.border,
  },
  exNum:     { width: 30, height: 30, borderRadius: 15, backgroundColor: C.surface3, alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderWidth: 1, borderColor: C.borderHi },
  exNumText: { fontSize: 12, fontWeight: '800', color: C.textTertiary },
  exName:    { fontSize: 14, fontWeight: '700', color: C.textPrimary, marginBottom: 2 },
  exMuscle:  { fontSize: 11, color: C.textTertiary },
  exRight:   { alignItems: 'flex-end' },
  exSets:    { fontSize: 14, fontWeight: '800', color: C.accent },
  exRest:    { fontSize: 10, color: C.textTertiary, marginTop: 2 },

  // Start button
  startBtn: {
    backgroundColor: C.accent, borderRadius: RADIUS.full,
    paddingVertical: 16, alignItems: 'center',
    ...SHADOW.accent,
  },
  startBtnText: { fontSize: 15, fontWeight: '800', color: C.textInverse },

  // Insight card
  insightCard: {
    backgroundColor: C.accentBgSm, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: C.accent + '22',
  },
  insightHeader:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  insightLabel:     { fontSize: 9, fontWeight: '800', color: C.accent, letterSpacing: 2 },
  insightBody:      { fontSize: 14, color: C.textSecondary, lineHeight: 23 },
  insightHighlight: { color: C.textPrimary, fontWeight: '700' },

  logCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.surface1, borderRadius: RADIUS.md,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: C.border,
    marginBottom: SPACING.md,
  },
  logCardText: { flex: 1, fontSize: 14, fontWeight: '700', color: C.textPrimary },
});
