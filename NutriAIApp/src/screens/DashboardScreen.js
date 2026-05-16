import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  ScrollView, StatusBar, Animated, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RADIUS, SPACING } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { GlassCard, GradientRing, GlassBottomSheet, Badge, SkeletonCard } from '../components';
import { MacroChip, SectionHeader, FadeIn } from '../components/UI';
import Icon from '../components/Icon';
import { hapticSelection } from '../utils/haptics';

// ── STREAK CELEBRATION OVERLAY ────────────────────────────────────
function StreakCelebration({ count, onDone }) {
  const { palette, accent } = useTheme();
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(0.4)).current;
  const particles  = useRef([...Array(10)].map(() => ({
    x:   new Animated.Value(0),
    y:   new Animated.Value(0),
    op:  new Animated.Value(1),
  }))).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
    particles.forEach((p, i) => {
      const angle = (i / particles.length) * Math.PI * 2;
      Animated.parallel([
        Animated.timing(p.x,  { toValue: Math.cos(angle) * 90, duration: 1400 + i * 60, useNativeDriver: true }),
        Animated.timing(p.y,  { toValue: -80 - Math.random() * 80, duration: 1400 + i * 60, useNativeDriver: true }),
        Animated.timing(p.op, { toValue: 0, duration: 1400 + i * 60, delay: 600, useNativeDriver: true }),
      ]).start();
    });
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.7, duration: 300, useNativeDriver: true }),
      ]).start(() => onDone());
    }, 2600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[ds.celebOverlay, { opacity: fadeAnim }]} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.Text
          key={i}
          style={[ds.particle, { color: accent.primary, transform: [{ translateX: p.x }, { translateY: p.y }], opacity: p.op }]}
        >★</Animated.Text>
      ))}
      <Animated.View style={[ds.celebCard, { backgroundColor: palette.glass3Bg || palette.bg1, borderColor: accent.primary + '40', transform: [{ scale: scaleAnim }] }]}>
        <Text style={ds.celebStar}>⭐</Text>
        <Text style={[ds.celebDayLabel, { color: accent.primary }]}>Day</Text>
        <Text style={[ds.celebCount, { color: palette.textPrimary }]}>{count}</Text>
        <Text style={[ds.celebSub, { color: palette.textSecondary }]}>Day Streak</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ── STREAK INLINE (under greeting in header) ─────────────────────
function StreakInline({ streakData }) {
  const { palette, accent } = useTheme();
  const streak = streakData || { count: 0, activityDates: [], earnedToday: false };
  const now = new Date();
  const today = now.toDateString();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - mondayOffset + i);
    const dateStr = d.toDateString();
    return { isToday: dateStr === today, isEarned: streak.activityDates.includes(dateStr) };
  });

  return (
    <View style={ds.streakInline}>
      <Icon name="flame" size={12} color={accent.primary} />
      <Text style={[ds.streakInlineCount, { color: palette.textTertiary }]}>{streak.count} day streak</Text>
      <View style={ds.streakInlineDots}>
        {days.map((d, i) => (
          <View key={i} style={[
            ds.streakInlineDot,
            { backgroundColor: palette.bg3 },
            d.isEarned && { backgroundColor: accent.primary },
            d.isToday && !d.isEarned && { backgroundColor: palette.bg3, borderWidth: 1, borderColor: accent.primary },
          ]} />
        ))}
      </View>
    </View>
  );
}

// ── CALORIE HERO ───────────────────────────────────────────────────
function CalorieHero({ totalCals, totalProtein, totalCarbs, totalFat, calGoal, onPress }) {
  const { palette, accent, gradients } = useTheme();
  const CAL_GOAL = calGoal || 2200;
  const pct = Math.min(1, totalCals / CAL_GOAL);

  return (
    <TouchableOpacity style={[ds.heroCard, { backgroundColor: palette.bg1, borderColor: palette.border }]} onPress={onPress} activeOpacity={0.9} accessibilityRole="button" accessibilityLabel={`Calories today: ${totalCals} of ${CAL_GOAL} kcal`}>
      <View style={ds.heroTop}>
        <View>
          <Text style={[ds.heroLabel, { color: palette.textSecondary }]}>Calories Today</Text>
          <Text style={[ds.heroGoalText, { color: palette.textSecondary }]}>of {CAL_GOAL} kcal goal</Text>
        </View>
        <Badge label={`${Math.round(pct * 100)}%`} color={accent.primary} />
      </View>

      <View style={{ alignItems: 'center', marginVertical: SPACING.md }}>
        <GradientRing value={totalCals} max={CAL_GOAL} size={188} gradient={gradients.primary}>
          <Text style={[ds.ringCal, { color: palette.textPrimary }]}>{totalCals.toLocaleString()}</Text>
          <Text style={[ds.ringUnit, { color: palette.textSecondary }]}>kcal</Text>
          <Text style={[ds.ringRemain, { color: accent.primary }]}>{Math.max(0, CAL_GOAL - totalCals).toLocaleString()} left</Text>
        </GradientRing>
      </View>

      <View style={ds.macroRow}>
        <MacroChip value={totalProtein} unit="g" label="Protein" color={accent.protein} />
        <MacroChip value={totalCarbs}   unit="g" label="Carbs"   color={accent.carbs}   />
        <MacroChip value={totalFat}     unit="g" label="Fat"     color={accent.fat}      />
      </View>
    </TouchableOpacity>
  );
}

// ── QUICK ACTION CARD ──────────────────────────────────────────────
function QuickCard({ icon, label, sub, color, onPress }) {
  const { palette } = useTheme();
  return (
    <TouchableOpacity style={[ds.qaCard, { backgroundColor: palette.bg1, borderColor: palette.border }]} onPress={onPress} activeOpacity={0.75} accessibilityRole="button" accessibilityLabel={`${label}: ${sub}`}>
      <View style={[ds.qaIconWrap, { backgroundColor: color + '15', borderColor: color + '25' }]}>
        <Icon name={icon} size={22} color={color} />
      </View>
      <Text style={[ds.qaLabel, { color: palette.textPrimary }]}>{label}</Text>
      <Text style={[ds.qaSub, { color: palette.textTertiary }]}>{sub}</Text>
    </TouchableOpacity>
  );
}

// ── MEAL DETAIL MODAL ─────────────────────────────────────────────
function MealDetailModal({ visible, onClose, type }) {
  const { loggedMeals, totalCals, totalProtein, totalCarbs, totalFat, completedWorkouts } = useApp();
  const { palette, accent } = useTheme();
  const todayStr = new Date().toDateString();
  const todaysWorkouts = completedWorkouts.filter(w => w.date === todayStr);
  const totalCalBurned = todaysWorkouts.reduce((a, w) => a + (w.calBurn || 0), 0);
  const totalMinActive = todaysWorkouts.reduce((a, w) => a + (parseInt(w.duration) || 0), 0);
  const totalExercises = todaysWorkouts.reduce((a, w) => a + (w.exerciseCount || 0), 0);

  return (
    <GlassBottomSheet visible={visible} onClose={onClose} height={500}>
      {type === 'calories' && (
        <>
          <Text style={[ds.sheetTitle, { color: palette.textPrimary }]}>Today's Nutrition</Text>
          <View style={ds.bigRow}>
            <Text style={[ds.bigNum, { color: accent.primary }]}>{totalCals}</Text>
            <Text style={[ds.bigSub, { color: palette.textSecondary }]}> kcal consumed</Text>
          </View>
          <View style={ds.macroRow}>
            <MacroChip value={totalProtein} unit="g" label="Protein" color={accent.protein} />
            <MacroChip value={totalCarbs}   unit="g" label="Carbs"   color={accent.carbs}   />
            <MacroChip value={totalFat}     unit="g" label="Fat"     color={accent.fat}      />
          </View>
          <SectionHeader title={`Meals Logged · ${loggedMeals.length}`} />
          {loggedMeals.length === 0 ? (
            <View style={ds.emptyWrap}>
              <Text style={[ds.emptyText, { color: palette.textSecondary }]}>No meals logged yet</Text>
              <Text style={[ds.emptySub, { color: palette.textTertiary }]}>Head to Meals to log your first meal</Text>
            </View>
          ) : (
            loggedMeals.map((m, i) => (
              <View key={i} style={[ds.mealRow, { backgroundColor: palette.bg1 }]}>
                <View style={[ds.mealEmojiWrap, { backgroundColor: palette.bg3 }]}>
                  <Icon name={m.icon || 'restaurant-outline'} size={20} color={accent.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[ds.mealName, { color: palette.textPrimary }]}>{m.name}</Text>
                  <Text style={[ds.mealMacros, { color: palette.textTertiary }]}>P {m.protein}g · C {m.carbs}g · F {m.fat}g</Text>
                </View>
                <Text style={[ds.mealCal, { color: accent.primary }]}>{m.cal}</Text>
              </View>
            ))
          )}
        </>
      )}

      {type === 'workouts' && (
        <>
          <Text style={[ds.sheetTitle, { color: palette.textPrimary }]}>Today's Activity</Text>
          <View style={ds.macroRow}>
            <MacroChip value={totalCalBurned} unit="" label="Cal Burned" color={accent.primary} />
            <MacroChip value={totalMinActive}  unit="" label="Min Active" color={accent.blue}    />
            <MacroChip value={totalExercises}  unit="" label="Exercises"  color={accent.protein} />
          </View>
          <SectionHeader title="Sessions" />
          {todaysWorkouts.length === 0 ? (
            <View style={ds.emptyWrap}>
              <Text style={[ds.emptyText, { color: palette.textSecondary }]}>No workouts today</Text>
              <Text style={[ds.emptySub, { color: palette.textTertiary }]}>Head to Workout to start a session</Text>
            </View>
          ) : (
            todaysWorkouts.map((w, i) => (
              <View key={w.id || i} style={[ds.workoutRow, { backgroundColor: palette.bg1 }]}>
                <View style={[ds.wDot, { backgroundColor: accent.primary, borderColor: accent.primary }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[ds.workoutName, { color: palette.textPrimary }]}>{w.type || 'Workout'}</Text>
                  <Text style={[ds.workoutTime, { color: palette.textTertiary }]}>{w.duration || ''} min</Text>
                </View>
                <Badge label={`${w.calBurn || 0} cal`} color={accent.primary} />
              </View>
            ))
          )}
        </>
      )}
    </GlassBottomSheet>
  );
}

// ── WEEKLY PROGRESS (interactive) ─────────────────────────────────
const DAY_LABELS = ['M','T','W','T','F','S','S'];

function WeeklyProgress({ loggedMeals, completedWorkouts }) {
  const { palette, accent } = useTheme();
  const [selectedDay, setSelectedDay] = useState(null);

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
    const daysActive = new Set([
      ...weekMeals.map(m => m.date),
      ...weekWorkouts.map(w => w.date),
    ]).size;
    const daysSoFar = mondayOffset + 1;
    const adherence = daysSoFar > 0 ? Math.round((daysActive / daysSoFar) * 100) : 0;

    const daily = weekDateStrings.map(dateStr => {
      const meals = weekMeals.filter(m => m.date === dateStr);
      const workouts = weekWorkouts.filter(w => w.date === dateStr);
      return {
        meals: meals.length,
        cal: meals.reduce((a, m) => a + (m.cal || 0), 0),
        protein: meals.reduce((a, m) => a + (m.protein || 0), 0),
        workouts: workouts.length,
        calBurned: workouts.reduce((a, w) => a + (w.calBurn || 0), 0),
      };
    });

    const maxMeals = Math.max(...daily.map(d => d.meals), 1);
    return { daily, maxMeals, todayIdx, weekMeals, weekWorkouts, weekCalBurned, adherence };
  }, [loggedMeals, completedWorkouts]);

  const { daily, maxMeals, todayIdx, weekMeals, weekWorkouts, weekCalBurned, adherence } = weekData;

  const handleBarPress = useCallback((i) => {
    hapticSelection();
    setSelectedDay(prev => prev === i ? null : i);
  }, []);

  const stats = useMemo(() => {
    if (selectedDay !== null) {
      const d = daily[selectedDay];
      return [
        { val: d.meals,   lbl: 'Meals',      color: accent.primary },
        { val: d.cal,     lbl: 'Calories',    color: accent.blue },
        { val: `${d.protein}g`, lbl: 'Protein', color: accent.protein },
        { val: d.workouts, lbl: 'Workouts',   color: accent.carbs },
      ];
    }
    return [
      { val: weekMeals.length,    lbl: 'Meals',      color: accent.primary },
      { val: weekWorkouts.length,  lbl: 'Workouts',   color: accent.blue },
      { val: `${adherence}%`,      lbl: 'Adherence',  color: accent.protein },
      { val: weekCalBurned >= 1000 ? `${(weekCalBurned / 1000).toFixed(1)}k` : weekCalBurned, lbl: 'Cal Burned', color: accent.carbs },
    ];
  }, [selectedDay, daily, weekMeals, weekWorkouts, adherence, weekCalBurned, accent]);

  return (
    <GlassCard level={1} style={ds.weekCard}>
      <View style={ds.weekStats}>
        {stats.map(s => (
          <View key={s.lbl} style={ds.weekStat}>
            <Text style={[ds.weekStatVal, { color: s.color }]}>{s.val}</Text>
            <Text style={[ds.weekStatLbl, { color: palette.textTertiary }]}>{s.lbl}</Text>
          </View>
        ))}
      </View>

      {selectedDay !== null && (
        <Text style={[ds.weekSelectedLabel, { color: palette.textSecondary }]}>
          {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][selectedDay]}
        </Text>
      )}

      <View style={[ds.weekDivider, { backgroundColor: palette.border }]} />

      <View style={ds.barChart}>
        {daily.map((d, i) => {
          const h = maxMeals > 0 ? (d.meals / maxMeals) * 100 : 0;
          const isToday = i === todayIdx;
          const isFuture = i > todayIdx;
          const isSelected = i === selectedDay;
          return (
            <TouchableOpacity
              key={i}
              style={ds.barWrap}
              onPress={() => handleBarPress(i)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${DAY_LABELS[i]}: ${d.meals} meals, ${d.cal} calories`}
            >
              <View style={[
                ds.bar,
                {
                  height: h * 0.44,
                  backgroundColor: isSelected ? accent.primary : isFuture ? palette.bg3 : (isToday && selectedDay === null) ? accent.primary : accent.primaryDim,
                  opacity: isSelected ? 1 : isFuture ? 0.25 : (isToday && selectedDay === null) ? 1 : 0.55,
                }
              ]} />
              <Text style={[
                ds.barDay,
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
  );
}

// ── MAIN SCREEN ───────────────────────────────────────────────────
export default function DashboardScreen({ navigation }) {
  const { totalCals, totalProtein, totalCarbs, totalFat, loggedMeals, goal, user, profile, pantryMeals, streakData, pantry, completedWorkouts, calGoal, waterData, waterGoalOz, addWater, removeWater, units, healthKitEnabled, todaySteps, todayActiveCal, mealsByTime } = useApp();
  const { mode, palette, accent, gradients } = useTheme();
  const todayStr = new Date().toDateString();
  const todaysWorkoutCount = completedWorkouts.filter(w => w.date === todayStr).length;
  const [modal, setModal]         = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const firstName = (user?.displayName || user?.name || 'there').split(' ')[0];
  const initial = firstName[0]?.toUpperCase();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const isLoaded = !!user;

  useEffect(() => {
    if (streakData?.earnedToday) setShowCelebration(true);
  }, [streakData?.earnedToday]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  return (
    <SafeAreaView style={[ds.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[ds.header, { borderBottomColor: palette.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[ds.headerDate, { color: palette.textTertiary }]}>{today}</Text>
          <Text style={[ds.headerGreet, { color: palette.textPrimary }]}>{greeting}, {firstName}!</Text>
          <StreakInline streakData={streakData} />
        </View>
        <TouchableOpacity style={[ds.avatar, { backgroundColor: accent.primary }]} onPress={() => navigation.navigate('ProfileTab', { screen: 'ProfileMain' })} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Profile">
          {profile?.profilePhoto ? (
            <Image source={{ uri: profile.profilePhoto }} style={ds.avatarImg} />
          ) : (
            <Text style={[ds.avatarText, { color: palette.textInverse }]}>{initial}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={ds.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={accent.primary}
            progressBackgroundColor={palette.bg1}
          />
        }
      >

        <FadeIn delay={0}>
          <View style={[ds.goalPill, { backgroundColor: accent.primaryBg, borderColor: accent.primary + '20' }]}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: accent.primary }} />
            <Text style={[ds.goalText, { color: palette.textPrimary }]}>{goal}</Text>
            <Text style={[ds.goalStatus, { color: accent.primary }]}>Active</Text>
          </View>
        </FadeIn>

        {/* Calorie hero */}
        {!isLoaded ? <SkeletonCard height={280} style={{ marginBottom: SPACING.lg }} /> : (
        <FadeIn delay={60}>
          <CalorieHero
            totalCals={totalCals}
            totalProtein={totalProtein}
            totalCarbs={totalCarbs}
            totalFat={totalFat}
            calGoal={calGoal}
            onPress={() => setModal('calories')}
          />
        </FadeIn>
        )}

        {/* Meal timing breakdown */}
        <FadeIn delay={90}>
          <View style={[ds.mealTimeCard, { backgroundColor: palette.bg1, borderColor: palette.border }]}>
            {[
              { key: 'breakfast', label: 'Breakfast', icon: 'sunny-outline', color: accent.carbs },
              { key: 'lunch', label: 'Lunch', icon: 'restaurant-outline', color: accent.primary },
              { key: 'dinner', label: 'Dinner', icon: 'moon-outline', color: accent.blue },
              { key: 'snack', label: 'Snack', icon: 'cafe-outline', color: accent.protein },
            ].map(slot => {
              const meals = mealsByTime?.[slot.key] || [];
              const cal = meals.reduce((a, m) => a + (m.cal || 0), 0);
              return (
                <View key={slot.key} style={ds.mealTimeRow}>
                  <View style={[ds.mealTimeIconWrap, { backgroundColor: slot.color + '15' }]}>
                    <Icon name={slot.icon} size={16} color={slot.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[ds.mealTimeLabel, { color: palette.textPrimary }]}>{slot.label}</Text>
                    {meals.length > 0 ? (
                      <Text style={[ds.mealTimeSub, { color: palette.textSecondary }]}>{meals.length} {meals.length === 1 ? 'item' : 'items'} · {cal} cal</Text>
                    ) : (
                      <Text style={[ds.mealTimeSub, { color: palette.textTertiary }]}>Not logged yet</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[ds.mealTimeAdd, { backgroundColor: accent.primary + '15' }]}
                    onPress={() => navigation.navigate('MealsTab', { screen: 'MealsList' })}
                    activeOpacity={0.7}
                    accessibilityLabel={`Add ${slot.label}`}
                  >
                    <Icon name="add" size={16} color={accent.primary} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </FadeIn>

        {/* Water tracking */}
        <FadeIn delay={150}>
        {(() => {
          const isMetric = units === 'Metric';
          const displayTotal = isMetric ? Math.round(waterData.totalOz * 29.5735) : waterData.totalOz;
          const displayGoal = isMetric ? Math.round(waterGoalOz * 29.5735) : waterGoalOz;
          const displayUnit = isMetric ? 'ml' : 'oz';
          const pct = waterGoalOz > 0 ? waterData.totalOz / waterGoalOz : 0;
          const goalHit = pct >= 1;
          return (
            <TouchableOpacity style={[ds.waterCard, { backgroundColor: palette.bg1, borderColor: palette.border }, goalHit && { borderColor: accent.blue + '40' }]} onPress={() => navigation.navigate('Water')} activeOpacity={0.8}>
              <View style={ds.waterLeft}>
                <GradientRing value={waterData.totalOz} max={waterGoalOz} size={68} gradient={gradients.hydration} accessibilityLabel={`Water: ${displayTotal} of ${displayGoal} ${displayUnit}`}>
                  <Icon name={goalHit ? 'checkmark-circle' : 'water'} size={22} color={accent.blue} />
                </GradientRing>
              </View>
              <View style={ds.waterMid}>
                <Text style={[ds.waterTitle, { color: palette.textSecondary }]}>{goalHit ? 'Goal Complete!' : 'Water Intake'}</Text>
                <Text style={ds.waterCount}>
                  <Text style={{ color: accent.blue, fontWeight: '900' }}>{displayTotal}</Text>
                  <Text style={{ color: palette.textTertiary }}> / {displayGoal} {displayUnit}</Text>
                </Text>
                {!goalHit && pct < 0.4 && new Date().getHours() >= 12 && (
                  <Text style={[ds.waterNudge, { color: accent.carbs }]}>Behind pace — drink up!</Text>
                )}
              </View>
              <TouchableOpacity style={[ds.waterBtn, { backgroundColor: accent.blue + '20', borderColor: accent.blue + '40' }]} onPress={() => addWater('Glass')} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={`Add ${isMetric ? '350ml' : '12oz'}`}>
                <Text style={[ds.waterBtnText, { color: accent.blue }]}>+</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })()}
        </FadeIn>

        {/* HealthKit Activity */}
        {healthKitEnabled && (
          <View style={[ds.activityCard, { backgroundColor: palette.bg1, borderColor: palette.border }]}>
            <Text style={[ds.activityTitle, { color: palette.textSecondary }]}>Today's Activity</Text>
            <View style={ds.activityRow}>
              <View style={ds.activityItem}>
                <Icon name="footsteps-outline" size={20} color={accent.primary} />
                <Text style={[ds.activityVal, { color: palette.textPrimary }]}>{todaySteps.toLocaleString()}</Text>
                <Text style={[ds.activityLabel, { color: palette.textTertiary }]}>Steps</Text>
              </View>
              <View style={[ds.activityDivider, { backgroundColor: palette.border }]} />
              <View style={ds.activityItem}>
                <Icon name="flame-outline" size={20} color={accent.energy} />
                <Text style={[ds.activityVal, { color: palette.textPrimary }]}>{todayActiveCal}</Text>
                <Text style={[ds.activityLabel, { color: palette.textTertiary }]}>Active Cal</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick actions */}
        <FadeIn delay={210}>
          <SectionHeader title="Quick Access" style={{ marginTop: SPACING.md }} />
          <View style={ds.qaGrid}>
            <QuickCard icon="basket-outline" label="Pantry" sub={`${pantry.length} items`} color={accent.carbs} onPress={() => navigation.navigate('ProfileTab', { screen: 'Pantry' })} />
            <QuickCard icon="restaurant-outline" label="Meals" sub={`${loggedMeals.length} logged`} color={accent.primary} onPress={() => navigation.navigate('MealsTab', { screen: 'MealsList' })} />
            <QuickCard icon="barbell-outline" label="Workout" sub={`${todaysWorkoutCount} done today`} color={accent.protein} onPress={() => navigation.navigate('FitnessTab', { screen: 'WorkoutMain' })} />
          </View>
        </FadeIn>

        {/* Weekly bar chart */}
        <FadeIn delay={270}>
          <SectionHeader title="Weekly Progress" action="Details" onAction={() => navigation.navigate('WeeklyDetail')} />
          <WeeklyProgress loggedMeals={loggedMeals} completedWorkouts={completedWorkouts} />
        </FadeIn>

        {/* Suggested meal */}
        <FadeIn delay={330}>
          <SectionHeader title="Suggested Meal" action="See All" onAction={() => navigation.navigate('MealsTab', { screen: 'MealsList' })} />
          {pantryMeals.slice(0, 1).map(r => (
            <TouchableOpacity
              key={r.id}
              style={[ds.suggestCard, { backgroundColor: palette.bg1, borderColor: palette.border }]}
              onPress={() => navigation.navigate('MealsTab', { screen: 'Recipe', params: { recipe: r } })}
              activeOpacity={0.8}
            >
              <View style={[ds.suggestLeft, { backgroundColor: palette.bg3 }]}>
                <Icon name={r.icon} size={28} color={accent.primary} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Badge label={r.tag} color={accent.primary} />
                <Text style={[ds.suggestName, { color: palette.textPrimary }]}>{r.name}</Text>
                <Text style={[ds.suggestMeta, { color: palette.textSecondary }]}>{r.cal} cal · {r.protein}g protein · {r.prepTime + r.cookTime} min</Text>
              </View>
              <View style={[ds.suggestArrow, { backgroundColor: palette.bg3 }]}>
                <Icon name="chevron-forward" size={16} color={accent.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </FadeIn>

      </ScrollView>

      {/* Floating action button */}
      <TouchableOpacity
        style={[ds.fab, { backgroundColor: accent.primary }]}
        onPress={() => navigation.navigate('MealsTab', { screen: 'MealsList' })}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Log a meal"
      >
        <Icon name="add" size={28} color={palette.textInverse} />
      </TouchableOpacity>

      <MealDetailModal visible={!!modal} onClose={() => setModal(null)} type={modal} />

      {showCelebration && (
        <StreakCelebration count={streakData?.count || 0} onDone={() => setShowCelebration(false)} />
      )}
    </SafeAreaView>
  );
}

const ds = StyleSheet.create({
  safe:   { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  headerDate:  { fontSize: 11, fontWeight: '700', letterSpacing: 1.8, marginBottom: 3 },
  headerGreet: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  avatarText: { fontSize: 17, fontWeight: '900' },
  avatarImg: { width: 42, height: 42, borderRadius: 21 },
  scroll: { padding: SPACING.md, paddingBottom: 100 },

  // Goal pill
  goalPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  goalText:   { fontSize: 13, fontWeight: '600', flex: 1 },
  goalStatus: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  // Hero card
  heroCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md, borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  heroLabel: { fontSize: 13, fontWeight: '600', letterSpacing: 0.2, marginBottom: 3 },
  heroGoalText: { fontSize: 12, fontWeight: '500' },

  // Ring center
  ringCal:    { fontSize: 48, fontWeight: '900', letterSpacing: -2 },
  ringUnit:   { fontSize: 13, fontWeight: '600', marginTop: -4 },
  ringRemain: { fontSize: 11, fontWeight: '700', marginTop: 4 },

  macroRow: { flexDirection: 'row', gap: 8 },

  // Water card
  waterCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: RADIUS.xl,
    padding: SPACING.md, borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  waterLeft: {},
  waterMid: { flex: 1, gap: 4 },
  waterTitle: { fontSize: 13, fontWeight: '600' },
  waterCount: { fontSize: 16, fontWeight: '600' },
  waterNudge: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  waterBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  waterBtnText: { fontSize: 20, fontWeight: '700', lineHeight: 22 },

  // HealthKit activity card
  activityCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md, borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  activityTitle: { fontSize: 13, fontWeight: '600', marginBottom: 12 },
  activityRow: { flexDirection: 'row', alignItems: 'center' },
  activityItem: { flex: 1, alignItems: 'center', gap: 4 },
  activityDivider: { width: 1, height: 40 },
  activityVal: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  activityLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },

  // Quick actions
  qaGrid: { flexDirection: 'row', gap: 10, marginBottom: SPACING.lg },
  qaCard: {
    flex: 1, borderRadius: RADIUS.lg,
    padding: 14, borderWidth: 1, gap: 6, alignItems: 'flex-start',
  },
  qaIconWrap: { width: 40, height: 40, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  qaLabel: { fontSize: 13, fontWeight: '700' },
  qaSub:   { fontSize: 11 },

  // Week card
  weekCard: { marginBottom: SPACING.lg },
  weekStats: { flexDirection: 'row', marginBottom: SPACING.sm },
  weekStat:  { flex: 1, alignItems: 'center' },
  weekStatVal: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  weekStatLbl: { fontSize: 11, fontWeight: '600', marginTop: 2, letterSpacing: 0.5 },
  weekDivider: { height: 1, marginBottom: SPACING.sm },
  barChart: { flexDirection: 'row', gap: 6, alignItems: 'flex-end', height: 52 },
  barWrap:  { flex: 1, alignItems: 'center', gap: 5 },
  bar:      { width: '100%', borderRadius: 4, minHeight: 4 },
  barDay:   { fontSize: 11, fontWeight: '600' },
  weekSelectedLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center', marginBottom: 4 },

  // Suggest card
  suggestCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: RADIUS.xl,
    padding: SPACING.md, borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  suggestLeft: {
    width: 60, height: 60, borderRadius: RADIUS.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  suggestName:  { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  suggestMeta:  { fontSize: 12 },
  suggestArrow: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },

  // Streak inline (header)
  streakInline: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  streakInlineCount: { fontSize: 11, fontWeight: '600' },
  streakInlineDots: { flexDirection: 'row', gap: 4, marginLeft: 4 },
  streakInlineDot: { width: 6, height: 6, borderRadius: 3 },

  // Meal timing section
  mealTimeCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md, borderWidth: 1,
    marginBottom: SPACING.lg, gap: 2,
  },
  mealTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  mealTimeIconWrap: { width: 32, height: 32, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  mealTimeLabel: { fontSize: 14, fontWeight: '600' },
  mealTimeSub: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  mealTimeAdd: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  // Celebration overlay
  celebOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 999,
  },
  particle: { position: 'absolute', fontSize: 18, fontWeight: '900' },
  celebCard: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.xl, alignItems: 'center', gap: 4,
    minWidth: 180,
  },
  celebStar:     { fontSize: 52, marginBottom: 4 },
  celebDayLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 3 },
  celebCount:    { fontSize: 72, fontWeight: '900', letterSpacing: -3, lineHeight: 76 },
  celebSub:      { fontSize: 15, fontWeight: '600' },

  // Sheet content
  sheetTitle: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5, marginBottom: SPACING.sm },
  bigRow:     { flexDirection: 'row', alignItems: 'baseline', marginBottom: SPACING.md },
  bigNum:     { fontSize: 52, fontWeight: '900', letterSpacing: -2 },
  bigSub:     { fontSize: 14, marginLeft: 4 },
  emptyWrap:  { alignItems: 'center', padding: SPACING.xl },
  emptyText:  { fontSize: 16, fontWeight: '700' },
  emptySub:   { fontSize: 13, marginTop: 4 },
  mealRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: RADIUS.md,
    padding: 12, marginBottom: 8,
  },
  mealEmojiWrap: { width: 40, height: 40, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  mealName:   { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  mealMacros: { fontSize: 11 },
  mealCal:    { fontSize: 16, fontWeight: '800' },
  workoutRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: RADIUS.md,
    padding: 14, marginBottom: 8,
  },
  wDot:        { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  workoutName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  workoutTime: { fontSize: 11 },

  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
    zIndex: 10,
  },
});
