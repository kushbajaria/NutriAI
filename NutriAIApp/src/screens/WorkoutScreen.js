import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING } from '../constants/theme';
import { WORKOUTS, DURATIONS } from '../constants/data';
import { useApp } from '../context/AppContext';
import { ScreenHeader, SectionHeader, Badge, PillButton } from '../components/UI';

const TYPES = Object.keys(WORKOUTS);

export default function WorkoutScreen({ navigation }) {
  const [type, setType]         = useState('Full Body');
  const [duration, setDuration] = useState('30 min');
  const { totalCals, goal, showToast } = useApp();
  const plan = WORKOUTS[type];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScreenHeader title="Workout" subtitle="PLAN" onBack={() => navigation.goBack()} />

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Type selector */}
        <SectionHeader title="WORKOUT TYPE" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.lg }}>
          <View style={s.typeRow}>
            {TYPES.map(t => (
              <TouchableOpacity
                key={t}
                style={[s.typeCard, type === t && s.typeCardActive]}
                onPress={() => setType(t)}
                activeOpacity={0.8}
              >
                <Text style={s.typeEmoji}>{WORKOUTS[t].emoji}</Text>
                <Text style={[s.typeLabel, type === t && s.typeLabelActive]}>{t}</Text>
                <Text style={s.typeDesc}>{WORKOUTS[t].desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Duration */}
        <SectionHeader title="DURATION" />
        <View style={s.durRow}>
          {DURATIONS.map(d => (
            <TouchableOpacity
              key={d}
              style={[s.durChip, duration === d && s.durChipActive]}
              onPress={() => setDuration(d)}
              activeOpacity={0.8}
            >
              <Text style={[s.durText, duration === d && s.durTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Plan card */}
        <View style={s.planCard}>
          <View style={s.planHeader}>
            <View>
              <Text style={s.planTitle}>{type} · {duration}</Text>
              <Text style={s.planDesc}>{plan.desc}</Text>
            </View>
            <Badge label="~300 cal" color={C.lime} />
          </View>

          <View style={s.divider} />

          <View style={s.exerciseList}>
            {plan.exercises.map((ex, i) => (
              <View key={ex.name} style={s.exerciseRow}>
                <View style={s.exerciseNum}>
                  <Text style={s.exerciseNumText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.exerciseName}>{ex.name}</Text>
                  <Text style={s.exerciseMuscle}>{ex.muscle}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.exerciseSets}>{ex.sets} × {ex.reps}</Text>
                  <Text style={s.exerciseRest}>{ex.rest}s rest</Text>
                </View>
              </View>
            ))}
          </View>

          <PillButton
            label="▶  Start Workout"
            onPress={() => showToast('Workout started!')}
            style={{ marginTop: SPACING.md }}
          />
        </View>

        {/* AI insight */}
        <View style={s.aiCard}>
          <View style={s.aiHeader}>
            <View style={s.aiDot} />
            <Text style={s.aiHeaderText}>AI INSIGHT</Text>
          </View>
          <Text style={s.aiBody}>
            With <Text style={s.aiHighlight}>{totalCals} cal consumed</Text> today and your{' '}
            <Text style={s.aiHighlight}>{goal.toLowerCase()}</Text> goal, this{' '}
            {type.toLowerCase()} session is optimally timed. Your body has adequate fuel for peak performance.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.black },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },
  typeRow: { flexDirection: 'row', gap: 10, paddingRight: SPACING.md },
  typeCard: { width: 130, backgroundColor: C.surface1, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: C.border, gap: 4 },
  typeCardActive: { borderColor: C.lime, backgroundColor: C.limeGlowSm },
  typeEmoji: { fontSize: 24, marginBottom: 4 },
  typeLabel: { fontSize: 14, fontWeight: '700', color: C.textSecondary },
  typeLabelActive: { color: C.textPrimary },
  typeDesc: { fontSize: 10, color: C.textTertiary, fontWeight: '500' },
  durRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.lg, flexWrap: 'wrap' },
  durChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: RADIUS.full, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface1 },
  durChipActive: { borderColor: C.lime, backgroundColor: C.limeGlow },
  durText: { fontSize: 13, color: C.textSecondary, fontWeight: '600' },
  durTextActive: { color: C.lime },
  planCard: { backgroundColor: C.surface1, borderRadius: RADIUS.xl, padding: SPACING.md, borderWidth: 1, borderColor: C.border, marginBottom: SPACING.md },
  planHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: SPACING.md },
  planTitle: { fontSize: 18, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.3, marginBottom: 3 },
  planDesc: { fontSize: 12, color: C.textSecondary },
  divider: { height: 1, backgroundColor: C.border, marginBottom: SPACING.md },
  exerciseList: { gap: 8 },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface2, borderRadius: RADIUS.md, padding: 12, borderWidth: 1, borderColor: C.border },
  exerciseNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.surface3, alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderWidth: 1, borderColor: C.borderHi },
  exerciseNumText: { fontSize: 12, fontWeight: '800', color: C.textTertiary },
  exerciseName: { fontSize: 14, fontWeight: '700', color: C.textPrimary, marginBottom: 2 },
  exerciseMuscle: { fontSize: 11, color: C.textTertiary },
  exerciseSets: { fontSize: 13, fontWeight: '700', color: C.lime },
  exerciseRest: { fontSize: 10, color: C.textTertiary, marginTop: 2 },
  aiCard: { backgroundColor: C.limeGlowSm, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: C.lime + '20' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  aiDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.lime },
  aiHeaderText: { fontSize: 10, fontWeight: '700', color: C.lime, letterSpacing: 1.2 },
  aiBody: { fontSize: 14, color: C.textSecondary, lineHeight: 22 },
  aiHighlight: { color: C.textPrimary, fontWeight: '700' },
});
