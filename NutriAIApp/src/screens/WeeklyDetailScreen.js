import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RADIUS, SPACING } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { GlassCard, BlurHeader } from '../components';
import Icon from '../components/Icon';
import { hapticSelection } from '../utils/haptics';
import { getWaterWeek } from '../services/firestore';

const DAY_LABELS = ['M','T','W','T','F','S','S'];
const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function WeeklyDetailScreen({ navigation }) {
  const { loggedMeals, completedWorkouts, calGoal, user, waterGoalOz, units } = useApp();
  const { mode, palette, accent } = useTheme();
  const [selectedDay, setSelectedDay] = useState(null);
  const [weekWater, setWeekWater] = useState([]);
  const isMetric = units === 'Metric';

  useEffect(() => {
    if (!user?.uid) return;
    getWaterWeek(user.uid).then(setWeekWater).catch(() => {});
  }, [user?.uid]);

  const weekData = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const todayIdx = mondayOffset;

    const weekDateStrings = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - mondayOffset + i);
      weekDateStrings.push(d.toDateString());
    }
    const weekSet = new Set(weekDateStrings);

    const weekMeals = loggedMeals.filter(m => weekSet.has(m.date));
    const weekWorkouts = completedWorkouts.filter(w => weekSet.has(w.date));
    const weekCalBurned = weekWorkouts.reduce((a, w) => a + (w.calBurn || 0), 0);
    const weekCalConsumed = weekMeals.reduce((a, m) => a + (m.cal || 0), 0);
    const daysActive = new Set([
      ...weekMeals.map(m => m.date),
      ...weekWorkouts.map(w => w.date),
    ]).size;
    const daysSoFar = mondayOffset + 1;
    const adherence = daysSoFar > 0 ? Math.round((daysActive / daysSoFar) * 100) : 0;

    const daily = weekDateStrings.map((dateStr, i) => {
      const meals = weekMeals.filter(m => m.date === dateStr);
      const workouts = weekWorkouts.filter(w => w.date === dateStr);
      const d = new Date(now);
      d.setDate(now.getDate() - mondayOffset + i);
      return {
        dateStr,
        shortDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        meals: meals.length,
        cal: meals.reduce((a, m) => a + (m.cal || 0), 0),
        protein: meals.reduce((a, m) => a + (m.protein || 0), 0),
        carbs: meals.reduce((a, m) => a + (m.carbs || 0), 0),
        fat: meals.reduce((a, m) => a + (m.fat || 0), 0),
        workouts: workouts.length,
        calBurned: workouts.reduce((a, w) => a + (w.calBurn || 0), 0),
      };
    });

    const maxMeals = Math.max(...daily.map(d => d.meals), 1);

    return { daily, maxMeals, todayIdx, weekMeals, weekWorkouts, weekCalBurned, weekCalConsumed, adherence, daysSoFar };
  }, [loggedMeals, completedWorkouts]);

  const { daily, maxMeals, todayIdx, weekMeals, weekWorkouts, weekCalBurned, weekCalConsumed, adherence, daysSoFar } = weekData;
  const CAL_GOAL = calGoal || 2200;

  const handleBarPress = useCallback((i) => {
    hapticSelection();
    setSelectedDay(prev => prev === i ? null : i);
  }, []);

  // Active view data
  const activeDay = selectedDay !== null ? daily[selectedDay] : null;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />

      <BlurHeader title="Weekly Progress" onBack={() => navigation.goBack()} />

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={false} tintColor={accent.primary} />}>

        {/* Bar chart card */}
        <GlassCard level={1} style={s.chartCard}>
          {selectedDay !== null && (
            <Text style={[s.dayLabel, { color: palette.textSecondary }]}>{DAY_NAMES[selectedDay]}, {activeDay.shortDate}</Text>
          )}
          {selectedDay === null && (
            <Text style={[s.dayLabel, { color: palette.textSecondary }]}>This Week</Text>
          )}

          <View style={s.barChart}>
            {daily.map((d, i) => {
              const h = maxMeals > 0 ? (d.meals / maxMeals) * 100 : 0;
              const isToday = i === todayIdx;
              const isFuture = i > todayIdx;
              const isSelected = i === selectedDay;
              return (
                <TouchableOpacity
                  key={i}
                  style={s.barWrap}
                  onPress={() => handleBarPress(i)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`${DAY_LABELS[i]}: ${d.meals} meals, ${d.cal} calories`}
                >
                  <View style={[
                    s.bar,
                    {
                      height: h * 0.9,
                      backgroundColor: isSelected ? accent.primary : isFuture ? palette.bg3 : (isToday && selectedDay === null) ? accent.primary : accent.primaryDim,
                      opacity: isSelected ? 1 : isFuture ? 0.25 : (isToday && selectedDay === null) ? 1 : 0.55,
                    }
                  ]} />
                  <Text style={[
                    s.barDay,
                    { color: palette.textTertiary },
                    isToday && selectedDay === null && { color: accent.primary },
                    isSelected && { color: accent.primary, fontWeight: '800' },
                  ]}>
                    {DAY_LABELS[i]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassCard>

        {/* Summary stats */}
        <GlassCard level={1} style={s.statsCard}>
          <Text style={[s.statsTitle, { color: palette.textSecondary }]}>{selectedDay !== null ? DAY_NAMES[selectedDay] : 'Week'} Overview</Text>
          <View style={s.statsGrid}>
            <StatTile
              icon="restaurant-outline" color={accent.primary}
              value={activeDay ? activeDay.meals : weekMeals.length}
              label="Meals Logged"
            />
            <StatTile
              icon="flame-outline" color={accent.carbs}
              value={activeDay ? activeDay.cal : weekCalConsumed}
              label="Cal Consumed"
            />
            <StatTile
              icon="barbell-outline" color={accent.blue}
              value={activeDay ? activeDay.workouts : weekWorkouts.length}
              label="Workouts"
            />
            <StatTile
              icon="flash-outline" color={accent.red}
              value={activeDay ? activeDay.calBurned : weekCalBurned}
              label="Cal Burned"
            />
            {weekWater.length > 0 && (
              <StatTile
                icon="water-outline" color={accent.blue}
                value={(() => {
                  const oz = selectedDay !== null && weekWater[selectedDay]
                    ? weekWater[selectedDay].totalOz
                    : weekWater.reduce((a, d) => a + d.totalOz, 0);
                  return isMetric ? `${Math.round(oz * 29.5735)}` : oz;
                })()}
                label={isMetric ? 'Water (ml)' : 'Water (oz)'}
              />
            )}
          </View>
        </GlassCard>

        {/* Macros breakdown */}
        <GlassCard level={1} style={s.statsCard}>
          <Text style={[s.statsTitle, { color: palette.textSecondary }]}>
            {selectedDay !== null ? DAY_NAMES[selectedDay] : 'Week'} Macros
          </Text>
          <View style={s.macroRows}>
            <MacroRow
              label="Protein"
              value={activeDay ? activeDay.protein : daily.reduce((a, d) => a + d.protein, 0)}
              unit="g"
              color={accent.protein}
            />
            <MacroRow
              label="Carbs"
              value={activeDay ? activeDay.carbs : daily.reduce((a, d) => a + d.carbs, 0)}
              unit="g"
              color={accent.carbs}
            />
            <MacroRow
              label="Fat"
              value={activeDay ? activeDay.fat : daily.reduce((a, d) => a + d.fat, 0)}
              unit="g"
              color={accent.fat}
            />
          </View>
        </GlassCard>

        {/* Daily breakdown list */}
        <Text style={[s.sectionTitle, { color: palette.textSecondary }]}>Daily Breakdown</Text>
        {daily.map((d, i) => {
          const isToday = i === todayIdx;
          const isFuture = i > todayIdx;
          return (
            <TouchableOpacity
              key={i}
              style={[
                s.dayRow,
                { backgroundColor: palette.bg1, borderColor: palette.border },
                selectedDay === i && { borderColor: accent.primary + '50', backgroundColor: accent.primaryBg },
              ]}
              onPress={() => handleBarPress(i)}
              activeOpacity={0.7}
            >
              <View style={[s.dayDot, { backgroundColor: isFuture ? palette.bg3 : d.meals > 0 ? accent.primary : palette.textTertiary }]} />
              <View style={{ flex: 1 }}>
                <Text style={[s.dayRowName, { color: palette.textPrimary }, isToday && { color: accent.primary }]}>
                  {DAY_NAMES[i]}{isToday ? ' (Today)' : ''}
                </Text>
                <Text style={[s.dayRowSub, { color: palette.textTertiary }]}>{d.shortDate}</Text>
              </View>
              <View style={s.dayRowStats}>
                <Text style={[s.dayRowMeals, { color: palette.textPrimary }]}>{d.meals} meals</Text>
                <Text style={[s.dayRowCal, { color: palette.textSecondary }]}>{d.cal} cal</Text>
                {weekWater[i] && weekWater[i].totalOz > 0 && (
                  <Text style={[s.dayRowWater, { color: accent.blue }]}>
                    {isMetric ? `${Math.round(weekWater[i].totalOz * 29.5735)} ml` : `${weekWater[i].totalOz} oz`}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

      </ScrollView>
    </SafeAreaView>
  );
}

function StatTile({ icon, color, value, label }) {
  const { palette } = useTheme();
  return (
    <View style={[s.statTile, { backgroundColor: palette.bg2, borderColor: palette.border }]}>
      <View style={[s.statIconWrap, { backgroundColor: color + '15' }]}>
        <Icon name={icon} size={18} color={color} />
      </View>
      <Text style={[s.statVal, { color: palette.textPrimary }]}>{value}</Text>
      <Text style={[s.statLbl, { color: palette.textTertiary }]}>{label}</Text>
    </View>
  );
}

function MacroRow({ label, value, unit, color }) {
  const { palette } = useTheme();
  return (
    <View style={s.macroRow}>
      <View style={[s.macroDot, { backgroundColor: color }]} />
      <Text style={[s.macroLabel, { color: palette.textPrimary }]}>{label}</Text>
      <Text style={[s.macroVal, { color }]}>{Math.round(value)}{unit}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },

  // Chart card
  chartCard: { marginBottom: SPACING.md },
  dayLabel: { fontSize: 14, fontWeight: '700', textAlign: 'center', marginBottom: SPACING.sm },
  barChart: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', height: 110, paddingTop: SPACING.sm },
  barWrap: { flex: 1, alignItems: 'center', gap: 8 },
  bar: { width: '100%', borderRadius: 6, minHeight: 6 },
  barDay: { fontSize: 11, fontWeight: '600' },

  // Stats card
  statsCard: { marginBottom: SPACING.md },
  statsTitle: { fontSize: 13, fontWeight: '700', marginBottom: SPACING.sm },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statTile: {
    flex: 1, minWidth: '45%',
    borderRadius: RADIUS.md,
    padding: SPACING.sm, alignItems: 'center', gap: 6,
    borderWidth: 1,
  },
  statIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  statVal: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  statLbl: { fontSize: 10, fontWeight: '600' },

  // Macros
  macroRows: { gap: 10 },
  macroRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  macroDot: { width: 10, height: 10, borderRadius: 5 },
  macroLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  macroVal: { fontSize: 16, fontWeight: '800' },

  // Daily breakdown
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: SPACING.sm, marginTop: SPACING.xs },
  dayRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: RADIUS.md,
    padding: 14, marginBottom: 6,
    borderWidth: 1,
  },
  dayDot: { width: 8, height: 8, borderRadius: 4 },
  dayRowName: { fontSize: 14, fontWeight: '700' },
  dayRowSub: { fontSize: 11, marginTop: 1 },
  dayRowStats: { alignItems: 'flex-end' },
  dayRowMeals: { fontSize: 13, fontWeight: '700' },
  dayRowCal: { fontSize: 11, marginTop: 1 },
  dayRowWater: { fontSize: 11, marginTop: 1 },
});
