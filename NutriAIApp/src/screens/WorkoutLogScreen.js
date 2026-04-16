import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { WORKOUTS } from '../constants/data';
import { Card } from '../components/UI';
import Icon from '../components/Icon';

function formatElapsed(secs) {
  if (!secs) return null;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function WorkoutLogScreen({ navigation }) {
  const { completedWorkouts } = useApp();

  // Group by date
  const grouped = useMemo(() => {
    const map = {};
    completedWorkouts.forEach(w => {
      const key = w.date || 'Unknown';
      if (!map[key]) map[key] = [];
      map[key].push(w);
    });
    // Sort dates descending
    return Object.entries(map).sort((a, b) => {
      const da = new Date(a[0]);
      const db = new Date(b[0]);
      return db - da;
    });
  }, [completedWorkouts]);

  // Weekly summary
  const weekStats = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekDates = new Set();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - mondayOffset + i);
      weekDates.add(d.toDateString());
    }
    const weekWorkouts = completedWorkouts.filter(w => weekDates.has(w.date));
    return {
      count: weekWorkouts.length,
      cal: weekWorkouts.reduce((a, w) => a + (w.calBurn || 0), 0),
      time: weekWorkouts.reduce((a, w) => a + (w.elapsedSeconds || 0), 0),
      days: new Set(weekWorkouts.map(w => w.date)).size,
    };
  }, [completedWorkouts]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.black} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} accessibilityLabel="Go back">
          <Icon name="chevron-back" size={22} color={C.accent} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Workout Log</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Weekly summary */}
        <Card style={s.summaryCard}>
          <Text style={s.summaryLabel}>This Week</Text>
          <View style={s.summaryRow}>
            <SummaryItem icon="barbell-outline" value={weekStats.count} label="Workouts" color={C.accent} />
            <SummaryItem icon="flame-outline" value={weekStats.cal} label="Cal Burned" color={C.fat} />
            <SummaryItem icon="time-outline" value={formatElapsed(weekStats.time) || '0:00'} label="Total Time" color={C.blue} />
            <SummaryItem icon="calendar-outline" value={weekStats.days} label="Active Days" color={C.protein} />
          </View>
        </Card>

        {/* Workout list grouped by date */}
        {grouped.length === 0 ? (
          <View style={s.emptyState}>
            <Icon name="barbell-outline" size={40} color={C.textTertiary} />
            <Text style={s.emptyText}>No workouts yet</Text>
            <Text style={s.emptySub}>Complete a workout to see it here</Text>
          </View>
        ) : (
          grouped.map(([dateStr, workouts]) => {
            const dateObj = new Date(dateStr);
            const todayStr = new Date().toDateString();
            const yesterdayObj = new Date();
            yesterdayObj.setDate(yesterdayObj.getDate() - 1);
            const label = dateStr === todayStr
              ? 'Today'
              : dateStr === yesterdayObj.toDateString()
                ? 'Yesterday'
                : dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

            return (
              <View key={dateStr}>
                <Text style={s.dateHeader}>{label}</Text>
                {workouts.map((w, i) => (
                  <WorkoutEntry key={w.id || i} workout={w} />
                ))}
              </View>
            );
          })
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryItem({ icon, value, label, color }) {
  return (
    <View style={s.summaryItem}>
      <Icon name={icon} size={16} color={color} />
      <Text style={[s.summaryVal, { color }]}>{value}</Text>
      <Text style={s.summaryItemLbl}>{label}</Text>
    </View>
  );
}

function WorkoutEntry({ workout: w }) {
  const [expanded, setExpanded] = useState(false);
  const dateObj = w.completedAt?.toDate?.() || new Date(w.date || Date.now());
  const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const workoutIcon = WORKOUTS[w.type]?.icon || 'barbell-outline';
  const elapsed = formatElapsed(w.elapsedSeconds);
  const pctDone = w.totalSets ? Math.round((w.setsCompleted / w.totalSets) * 100) : 100;
  const isPartial = pctDone < 100;
  const exercises = w.exercises || [];

  // For older workouts without saved exercises, pull from WORKOUTS data
  const exerciseList = exercises.length > 0
    ? exercises
    : (WORKOUTS[w.type]?.byDuration?.[w.duration] || []);

  return (
    <TouchableOpacity style={s.entryCard} onPress={() => setExpanded(e => !e)} activeOpacity={0.7}>
      {/* Top row */}
      <View style={s.entryTop}>
        <View style={s.entryIconWrap}>
          <Icon name={workoutIcon} size={22} color={C.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.entryType}>{w.type || 'Workout'}</Text>
          <Text style={s.entryTime}>{timeStr}{w.duration ? ` · ${w.duration}` : ''}</Text>
        </View>
        {isPartial && (
          <View style={s.partialBadge}>
            <Text style={s.partialText}>{pctDone}%</Text>
          </View>
        )}
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={C.textTertiary} />
      </View>

      {/* Stats grid */}
      <View style={s.entryStats}>
        <View style={s.entryStat}>
          <Icon name="flame-outline" size={14} color={C.fat} />
          <Text style={s.entryStatVal}>{w.calBurn || 0}</Text>
          <Text style={s.entryStatLbl}>cal</Text>
        </View>
        {elapsed && (
          <View style={s.entryStat}>
            <Icon name="time-outline" size={14} color={C.blue} />
            <Text style={s.entryStatVal}>{elapsed}</Text>
            <Text style={s.entryStatLbl}>time</Text>
          </View>
        )}
        {w.exerciseCount != null && (
          <View style={s.entryStat}>
            <Icon name="list-outline" size={14} color={C.accent} />
            <Text style={s.entryStatVal}>{w.exerciseCount}</Text>
            <Text style={s.entryStatLbl}>exercises</Text>
          </View>
        )}
        {w.totalSets != null && (
          <View style={s.entryStat}>
            <Icon name="checkmark-done-outline" size={14} color={C.protein} />
            <Text style={s.entryStatVal}>{w.setsCompleted || 0}/{w.totalSets}</Text>
            <Text style={s.entryStatLbl}>sets</Text>
          </View>
        )}
      </View>

      {/* Expanded exercise detail */}
      {expanded && exerciseList.length > 0 && (
        <View style={s.exList}>
          <Text style={s.exListTitle}>Exercises</Text>
          {exerciseList.map((ex, i) => (
            <View key={i} style={s.exRow}>
              <View style={s.exNum}>
                <Text style={s.exNumText}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.exName}>{ex.name}</Text>
                <Text style={s.exMuscle}>{ex.muscle}</Text>
              </View>
              <Text style={s.exSets}>{ex.sets} × {ex.reps}</Text>
            </View>
          ))}
        </View>
      )}
      {expanded && exerciseList.length === 0 && (
        <Text style={s.noExText}>Exercise details not available for this workout</Text>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.black },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.surface2, borderWidth: 1, borderColor: C.borderHi,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.5 },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },

  // Weekly summary
  summaryCard: { marginBottom: SPACING.lg },
  summaryLabel: { fontSize: 13, fontWeight: '700', color: C.textSecondary, marginBottom: SPACING.sm },
  summaryRow: { flexDirection: 'row' },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryVal: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  summaryItemLbl: { fontSize: 9, fontWeight: '600', color: C.textTertiary },

  // Date headers
  dateHeader: { fontSize: 13, fontWeight: '700', color: C.textSecondary, marginBottom: SPACING.sm, marginTop: SPACING.xs },

  // Workout entry card
  entryCard: {
    backgroundColor: C.surface1, borderRadius: RADIUS.xl,
    padding: SPACING.md, borderWidth: 1, borderColor: C.border,
    marginBottom: 10, gap: 12,
  },
  entryTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  entryIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.accentBg, alignItems: 'center', justifyContent: 'center',
  },
  entryType: { fontSize: 16, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.3 },
  entryTime: { fontSize: 12, color: C.textTertiary, marginTop: 2 },
  partialBadge: {
    backgroundColor: C.carbs + '20', borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: C.carbs + '30',
  },
  partialText: { fontSize: 11, fontWeight: '700', color: C.carbs },

  // Stats
  entryStats: {
    flexDirection: 'row',
    backgroundColor: C.surface2, borderRadius: RADIUS.md,
    padding: 10, borderWidth: 1, borderColor: C.border,
  },
  entryStat: { flex: 1, alignItems: 'center', gap: 3 },
  entryStatVal: { fontSize: 15, fontWeight: '800', color: C.textPrimary },
  entryStatLbl: { fontSize: 9, fontWeight: '600', color: C.textTertiary },

  // Exercise detail list
  exList: {
    borderTopWidth: 1, borderTopColor: C.border,
    paddingTop: 12, gap: 8,
  },
  exListTitle: { fontSize: 11, fontWeight: '700', color: C.textTertiary, letterSpacing: 0.5, marginBottom: 4 },
  exRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.surface2, borderRadius: RADIUS.md,
    padding: 10, borderWidth: 1, borderColor: C.border,
  },
  exNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: C.surface3, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.borderHi,
  },
  exNumText: { fontSize: 10, fontWeight: '800', color: C.textTertiary },
  exName: { fontSize: 13, fontWeight: '700', color: C.textPrimary },
  exMuscle: { fontSize: 10, color: C.textTertiary, marginTop: 1 },
  exSets: { fontSize: 13, fontWeight: '800', color: C.accent },
  noExText: { fontSize: 12, color: C.textTertiary, textAlign: 'center', paddingVertical: 8 },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: C.textSecondary },
  emptySub: { fontSize: 13, color: C.textTertiary },
});
