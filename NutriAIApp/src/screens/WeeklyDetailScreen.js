import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Card } from '../components/UI';
import Icon from '../components/Icon';
import { hapticSelection } from '../utils/haptics';
import { getWaterWeek } from '../services/firestore';

const DAY_LABELS = ['M','T','W','T','F','S','S'];
const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function WeeklyDetailScreen({ navigation }) {
  const { loggedMeals, completedWorkouts, calGoal, user, waterGoalOz, units } = useApp();
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
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.black} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} accessibilityLabel="Go back">
          <Icon name="chevron-back" size={22} color={C.accent} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Weekly Progress</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Bar chart card */}
        <Card style={s.chartCard}>
          {selectedDay !== null && (
            <Text style={s.dayLabel}>{DAY_NAMES[selectedDay]}, {activeDay.shortDate}</Text>
          )}
          {selectedDay === null && (
            <Text style={s.dayLabel}>This Week</Text>
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
                      backgroundColor: isSelected ? C.accent : isFuture ? C.surface3 : (isToday && selectedDay === null) ? C.accent : C.accentDim,
                      opacity: isSelected ? 1 : isFuture ? 0.25 : (isToday && selectedDay === null) ? 1 : 0.55,
                      ...(isSelected || (isToday && selectedDay === null) ? SHADOW.accent : {}),
                    }
                  ]} />
                  <Text style={[
                    s.barDay,
                    isToday && selectedDay === null && { color: C.accent },
                    isSelected && { color: C.accent, fontWeight: '800' },
                  ]}>
                    {DAY_LABELS[i]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Summary stats */}
        <Card style={s.statsCard}>
          <Text style={s.statsTitle}>{selectedDay !== null ? DAY_NAMES[selectedDay] : 'Week'} Overview</Text>
          <View style={s.statsGrid}>
            <StatTile
              icon="restaurant-outline" color={C.accent}
              value={activeDay ? activeDay.meals : weekMeals.length}
              label="Meals Logged"
            />
            <StatTile
              icon="flame-outline" color={C.carbs}
              value={activeDay ? activeDay.cal : weekCalConsumed}
              label="Cal Consumed"
            />
            <StatTile
              icon="barbell-outline" color={C.blue}
              value={activeDay ? activeDay.workouts : weekWorkouts.length}
              label="Workouts"
            />
            <StatTile
              icon="flash-outline" color={C.red}
              value={activeDay ? activeDay.calBurned : weekCalBurned}
              label="Cal Burned"
            />
            {weekWater.length > 0 && (
              <StatTile
                icon="water-outline" color={C.blue}
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
        </Card>

        {/* Macros breakdown */}
        <Card style={s.statsCard}>
          <Text style={s.statsTitle}>
            {selectedDay !== null ? DAY_NAMES[selectedDay] : 'Week'} Macros
          </Text>
          <View style={s.macroRows}>
            <MacroRow
              label="Protein"
              value={activeDay ? activeDay.protein : daily.reduce((a, d) => a + d.protein, 0)}
              unit="g"
              color={C.protein}
            />
            <MacroRow
              label="Carbs"
              value={activeDay ? activeDay.carbs : daily.reduce((a, d) => a + d.carbs, 0)}
              unit="g"
              color={C.carbs}
            />
            <MacroRow
              label="Fat"
              value={activeDay ? activeDay.fat : daily.reduce((a, d) => a + d.fat, 0)}
              unit="g"
              color={C.fat}
            />
          </View>
        </Card>

        {/* Daily breakdown list */}
        <Text style={s.sectionTitle}>Daily Breakdown</Text>
        {daily.map((d, i) => {
          const isToday = i === todayIdx;
          const isFuture = i > todayIdx;
          return (
            <TouchableOpacity
              key={i}
              style={[s.dayRow, selectedDay === i && s.dayRowSelected]}
              onPress={() => handleBarPress(i)}
              activeOpacity={0.7}
            >
              <View style={[s.dayDot, { backgroundColor: isFuture ? C.surface3 : d.meals > 0 ? C.accent : C.textTertiary }]} />
              <View style={{ flex: 1 }}>
                <Text style={[s.dayRowName, isToday && { color: C.accent }]}>
                  {DAY_NAMES[i]}{isToday ? ' (Today)' : ''}
                </Text>
                <Text style={s.dayRowSub}>{d.shortDate}</Text>
              </View>
              <View style={s.dayRowStats}>
                <Text style={s.dayRowMeals}>{d.meals} meals</Text>
                <Text style={s.dayRowCal}>{d.cal} cal</Text>
                {weekWater[i] && weekWater[i].totalOz > 0 && (
                  <Text style={s.dayRowWater}>
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
  return (
    <View style={s.statTile}>
      <View style={[s.statIconWrap, { backgroundColor: color + '15' }]}>
        <Icon name={icon} size={18} color={color} />
      </View>
      <Text style={s.statVal}>{value}</Text>
      <Text style={s.statLbl}>{label}</Text>
    </View>
  );
}

function MacroRow({ label, value, unit, color }) {
  return (
    <View style={s.macroRow}>
      <View style={[s.macroDot, { backgroundColor: color }]} />
      <Text style={s.macroLabel}>{label}</Text>
      <Text style={[s.macroVal, { color }]}>{Math.round(value)}{unit}</Text>
    </View>
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

  // Chart card
  chartCard: { marginBottom: SPACING.md },
  dayLabel: { fontSize: 14, fontWeight: '700', color: C.textSecondary, textAlign: 'center', marginBottom: SPACING.sm },
  barChart: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', height: 110, paddingTop: SPACING.sm },
  barWrap: { flex: 1, alignItems: 'center', gap: 8 },
  bar: { width: '100%', borderRadius: 6, minHeight: 6 },
  barDay: { fontSize: 11, color: C.textTertiary, fontWeight: '600' },

  // Stats card
  statsCard: { marginBottom: SPACING.md },
  statsTitle: { fontSize: 13, fontWeight: '700', color: C.textSecondary, marginBottom: SPACING.sm },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statTile: {
    flex: 1, minWidth: '45%',
    backgroundColor: C.surface2, borderRadius: RADIUS.md,
    padding: SPACING.sm, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: C.border,
  },
  statIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  statVal: { fontSize: 22, fontWeight: '900', color: C.textPrimary, letterSpacing: -0.5 },
  statLbl: { fontSize: 10, fontWeight: '600', color: C.textTertiary },

  // Macros
  macroRows: { gap: 10 },
  macroRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  macroDot: { width: 10, height: 10, borderRadius: 5 },
  macroLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: C.textPrimary },
  macroVal: { fontSize: 16, fontWeight: '800' },

  // Daily breakdown
  sectionTitle: { fontSize: 13, fontWeight: '700', color: C.textSecondary, marginBottom: SPACING.sm, marginTop: SPACING.xs },
  dayRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surface1, borderRadius: RADIUS.md,
    padding: 14, marginBottom: 6,
    borderWidth: 1, borderColor: C.border,
  },
  dayRowSelected: { borderColor: C.accent + '50', backgroundColor: C.accentBgSm },
  dayDot: { width: 8, height: 8, borderRadius: 4 },
  dayRowName: { fontSize: 14, fontWeight: '700', color: C.textPrimary },
  dayRowSub: { fontSize: 11, color: C.textTertiary, marginTop: 1 },
  dayRowStats: { alignItems: 'flex-end' },
  dayRowMeals: { fontSize: 13, fontWeight: '700', color: C.textPrimary },
  dayRowCal: { fontSize: 11, color: C.textSecondary, marginTop: 1 },
  dayRowWater: { fontSize: 11, color: C.blue, marginTop: 1 },
});
