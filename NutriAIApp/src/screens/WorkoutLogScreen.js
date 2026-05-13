import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RADIUS, SPACING } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { WORKOUTS } from '../constants/data';
import { GlassCard, BlurHeader } from '../components';
import Icon from '../components/Icon';

function formatElapsed(secs) {
  if (!secs) return null;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function WorkoutLogScreen({ navigation }) {
  const { completedWorkouts } = useApp();
  const { mode, palette, accent } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }, []);

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
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />

      <BlurHeader title="Workout Log" onBack={() => navigation.goBack()} />

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent.primary} />}>

        {/* Weekly summary */}
        <GlassCard level={2} style={s.summaryCard}>
          <Text style={[s.summaryLabel, { color: palette.textSecondary }]}>This Week</Text>
          <View style={s.summaryRow}>
            <SummaryItem icon="barbell-outline" value={weekStats.count} label="Workouts" color={accent.primary} />
            <SummaryItem icon="flame-outline" value={weekStats.cal} label="Cal Burned" color={accent.energy} />
            <SummaryItem icon="time-outline" value={formatElapsed(weekStats.time) || '0:00'} label="Total Time" color={accent.blue} />
            <SummaryItem icon="calendar-outline" value={weekStats.days} label="Active Days" color={accent.protein} />
          </View>
        </GlassCard>

        {/* Workout list grouped by date */}
        {grouped.length === 0 ? (
          <View style={s.emptyState}>
            <Icon name="barbell-outline" size={40} color={palette.textTertiary} />
            <Text style={[s.emptyText, { color: palette.textSecondary }]}>No workouts yet</Text>
            <Text style={[s.emptySub, { color: palette.textTertiary }]}>Complete a workout to see it here</Text>
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
                <Text style={[s.dateHeader, { color: palette.textSecondary }]}>{label}</Text>
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
  const { palette } = useTheme();
  return (
    <View style={s.summaryItem}>
      <Icon name={icon} size={16} color={color} />
      <Text style={[s.summaryVal, { color }]}>{value}</Text>
      <Text style={[s.summaryItemLbl, { color: palette.textTertiary }]}>{label}</Text>
    </View>
  );
}

function WorkoutEntry({ workout: w }) {
  const [expanded, setExpanded] = useState(false);
  const { palette, accent } = useTheme();
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
    <TouchableOpacity
      style={[s.entryCard, { backgroundColor: palette.bg1, borderColor: palette.border }]}
      onPress={() => setExpanded(e => !e)}
      activeOpacity={0.7}
    >
      {/* Top row */}
      <View style={s.entryTop}>
        <View style={[s.entryIconWrap, { backgroundColor: accent.primaryBg }]}>
          <Icon name={workoutIcon} size={22} color={accent.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.entryType, { color: palette.textPrimary }]}>{w.type || 'Workout'}</Text>
          <Text style={[s.entryTime, { color: palette.textTertiary }]}>{timeStr}{w.duration ? ` · ${w.duration}` : ''}</Text>
        </View>
        {isPartial && (
          <View style={[s.partialBadge, { backgroundColor: accent.carbs + '20', borderColor: accent.carbs + '30' }]}>
            <Text style={[s.partialText, { color: accent.carbs }]}>{pctDone}%</Text>
          </View>
        )}
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={palette.textTertiary} />
      </View>

      {/* Stats grid */}
      <View style={[s.entryStats, { backgroundColor: palette.bg2, borderColor: palette.border }]}>
        <View style={s.entryStat}>
          <Icon name="flame-outline" size={14} color={accent.energy} />
          <Text style={[s.entryStatVal, { color: palette.textPrimary }]}>{w.calBurn || 0}</Text>
          <Text style={[s.entryStatLbl, { color: palette.textTertiary }]}>cal</Text>
        </View>
        {elapsed && (
          <View style={s.entryStat}>
            <Icon name="time-outline" size={14} color={accent.blue} />
            <Text style={[s.entryStatVal, { color: palette.textPrimary }]}>{elapsed}</Text>
            <Text style={[s.entryStatLbl, { color: palette.textTertiary }]}>time</Text>
          </View>
        )}
        {w.exerciseCount != null && (
          <View style={s.entryStat}>
            <Icon name="list-outline" size={14} color={accent.primary} />
            <Text style={[s.entryStatVal, { color: palette.textPrimary }]}>{w.exerciseCount}</Text>
            <Text style={[s.entryStatLbl, { color: palette.textTertiary }]}>exercises</Text>
          </View>
        )}
        {w.totalSets != null && (
          <View style={s.entryStat}>
            <Icon name="checkmark-done-outline" size={14} color={accent.protein} />
            <Text style={[s.entryStatVal, { color: palette.textPrimary }]}>{w.setsCompleted || 0}/{w.totalSets}</Text>
            <Text style={[s.entryStatLbl, { color: palette.textTertiary }]}>sets</Text>
          </View>
        )}
      </View>

      {/* Expanded exercise detail */}
      {expanded && exerciseList.length > 0 && (
        <View style={[s.exList, { borderTopColor: palette.border }]}>
          <Text style={[s.exListTitle, { color: palette.textTertiary }]}>Exercises</Text>
          {exerciseList.map((ex, i) => (
            <View key={i} style={[s.exRow, { backgroundColor: palette.bg2, borderColor: palette.border }]}>
              <View style={[s.exNum, { backgroundColor: palette.bg3, borderColor: palette.borderHi }]}>
                <Text style={[s.exNumText, { color: palette.textTertiary }]}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.exName, { color: palette.textPrimary }]}>{ex.name}</Text>
                <Text style={[s.exMuscle, { color: palette.textTertiary }]}>{ex.muscle}</Text>
              </View>
              <Text style={[s.exSets, { color: accent.primary }]}>{ex.sets} × {ex.reps}</Text>
            </View>
          ))}
        </View>
      )}
      {expanded && exerciseList.length === 0 && (
        <Text style={[s.noExText, { color: palette.textTertiary }]}>Exercise details not available for this workout</Text>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },

  // Weekly summary
  summaryCard: { marginBottom: SPACING.lg },
  summaryLabel: { fontSize: 13, fontWeight: '700', marginBottom: SPACING.sm },
  summaryRow: { flexDirection: 'row' },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryVal: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  summaryItemLbl: { fontSize: 9, fontWeight: '600' },

  // Date headers
  dateHeader: { fontSize: 13, fontWeight: '700', marginBottom: SPACING.sm, marginTop: SPACING.xs },

  // Workout entry card
  entryCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md, borderWidth: 1,
    marginBottom: 10, gap: 12,
  },
  entryTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  entryIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  entryType: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  entryTime: { fontSize: 12, marginTop: 2 },
  partialBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1,
  },
  partialText: { fontSize: 11, fontWeight: '700' },

  // Stats
  entryStats: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    padding: 10, borderWidth: 1,
  },
  entryStat: { flex: 1, alignItems: 'center', gap: 3 },
  entryStatVal: { fontSize: 15, fontWeight: '800' },
  entryStatLbl: { fontSize: 9, fontWeight: '600' },

  // Exercise detail list
  exList: {
    borderTopWidth: 1,
    paddingTop: 12, gap: 8,
  },
  exListTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  exRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: RADIUS.md,
    padding: 10, borderWidth: 1,
  },
  exNum: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  exNumText: { fontSize: 10, fontWeight: '800' },
  exName: { fontSize: 13, fontWeight: '700' },
  exMuscle: { fontSize: 10, marginTop: 1 },
  exSets: { fontSize: 13, fontWeight: '800' },
  noExText: { fontSize: 12, textAlign: 'center', paddingVertical: 8 },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700' },
  emptySub: { fontSize: 13 },
});
