import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  ScrollView, Modal, StatusBar, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { CircularProgress, MacroChip, SectionHeader, Badge, Card } from '../components/UI';
import Icon from '../components/Icon';
import { hapticSelection } from '../utils/haptics';

// ── STREAK CELEBRATION OVERLAY ────────────────────────────────────
function StreakCelebration({ count, onDone }) {
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(0.4)).current;
  const particles  = useRef([...Array(10)].map(() => ({
    x:   new Animated.Value(0),
    y:   new Animated.Value(0),
    op:  new Animated.Value(1),
  }))).current;

  useEffect(() => {
    // Fade in background
    Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    // Spring-in card
    Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
    // Float particles
    particles.forEach((p, i) => {
      const angle = (i / particles.length) * Math.PI * 2;
      Animated.parallel([
        Animated.timing(p.x,  { toValue: Math.cos(angle) * 90, duration: 1400 + i * 60, useNativeDriver: true }),
        Animated.timing(p.y,  { toValue: -80 - Math.random() * 80, duration: 1400 + i * 60, useNativeDriver: true }),
        Animated.timing(p.op, { toValue: 0, duration: 1400 + i * 60, delay: 600, useNativeDriver: true }),
      ]).start();
    });
    // Dismiss after 2.6s
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
      {/* Particles */}
      {particles.map((p, i) => (
        <Animated.Text
          key={i}
          style={[ds.particle, { transform: [{ translateX: p.x }, { translateY: p.y }], opacity: p.op }]}
        >★</Animated.Text>
      ))}
      {/* Center card */}
      <Animated.View style={[ds.celebCard, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={ds.celebStar}>⭐</Text>
        <Text style={ds.celebDayLabel}>Day</Text>
        <Text style={ds.celebCount}>{count}</Text>
        <Text style={ds.celebSub}>Day Streak</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ── STREAK INLINE (under greeting in header) ─────────────────────
function StreakInline({ streakData }) {
  const streak = streakData || { count: 0, activityDates: [], earnedToday: false };
  const now = new Date();
  const today = now.toDateString();
  const dayOfWeek = now.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - mondayOffset + i);
    const dateStr = d.toDateString();
    return {
      isToday: dateStr === today,
      isEarned: streak.activityDates.includes(dateStr),
    };
  });

  return (
    <View style={ds.streakInline}>
      <Icon name="flame" size={12} color={C.accent} />
      <Text style={ds.streakInlineCount}>{streak.count} day streak</Text>
      <View style={ds.streakInlineDots}>
        {days.map((d, i) => (
          <View key={i} style={[
            ds.streakInlineDot,
            d.isEarned && ds.streakInlineDotOn,
            d.isToday && !d.isEarned && ds.streakInlineDotToday,
          ]} />
        ))}
      </View>
    </View>
  );
}

// ── CALORIE HERO ───────────────────────────────────────────────────
function CalorieHero({ totalCals, totalProtein, totalCarbs, totalFat, calGoal, onPress }) {
  const CAL_GOAL = calGoal || 2200;
  const pct = Math.min(1, totalCals / CAL_GOAL);

  return (
    <TouchableOpacity style={ds.heroCard} onPress={onPress} activeOpacity={0.9} accessibilityRole="button" accessibilityLabel={`Calories today: ${totalCals} of ${CAL_GOAL} kcal`}>
      {/* Header row */}
      <View style={ds.heroTop}>
        <View>
          <Text style={ds.heroLabel}>Calories Today</Text>
          <Text style={ds.heroGoalText}>of {CAL_GOAL} kcal goal</Text>
        </View>
        <Badge label={`${Math.round(pct * 100)}%`} color={C.accent} />
      </View>

      {/* Dotted ring */}
      <View style={{ alignItems: 'center', marginVertical: SPACING.md }}>
        <CircularProgress value={totalCals} max={CAL_GOAL} size={188} color={C.accent}>
          <Text style={ds.ringCal}>{totalCals}</Text>
          <Text style={ds.ringUnit}>kcal</Text>
          <Text style={ds.ringRemain}>{CAL_GOAL - totalCals} left</Text>
        </CircularProgress>
      </View>

      {/* Macro row */}
      <View style={ds.macroRow}>
        <MacroChip value={totalProtein} unit="g" label="Protein" color={C.protein} />
        <MacroChip value={totalCarbs}   unit="g" label="Carbs"   color={C.carbs}   />
        <MacroChip value={totalFat}     unit="g" label="Fat"     color={C.fat}      />
      </View>
    </TouchableOpacity>
  );
}

// ── QUICK ACTION CARD ──────────────────────────────────────────────
function QuickCard({ icon, label, sub, color = C.accent, onPress }) {
  return (
    <TouchableOpacity style={ds.qaCard} onPress={onPress} activeOpacity={0.75} accessibilityRole="button" accessibilityLabel={`${label}: ${sub}`}>
      <View style={[ds.qaIconWrap, { backgroundColor: color + '15', borderColor: color + '25' }]}>
        <Icon name={icon} size={22} color={color} />
      </View>
      <Text style={ds.qaLabel}>{label}</Text>
      <Text style={ds.qaSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

// ── MEAL DETAIL MODAL ─────────────────────────────────────────────
function MealDetailModal({ visible, onClose, type }) {
  const { loggedMeals, totalCals, totalProtein, totalCarbs, totalFat, completedWorkouts } = useApp();
  const todayStr = new Date().toDateString();
  const todaysWorkouts = completedWorkouts.filter(w => w.date === todayStr);
  const totalCalBurned = todaysWorkouts.reduce((a, w) => a + (w.calBurn || 0), 0);
  const totalMinActive = todaysWorkouts.reduce((a, w) => a + (parseInt(w.duration) || 0), 0);
  const totalExercises = todaysWorkouts.reduce((a, w) => a + (w.exerciseCount || 0), 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={ds.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={ds.sheet} activeOpacity={1}>
          <View style={ds.sheetHandle} />

          {type === 'calories' && (
            <>
              <Text style={ds.sheetTitle}>Today's Nutrition</Text>
              <View style={ds.bigRow}>
                <Text style={[ds.bigNum, { color: C.accent }]}>{totalCals}</Text>
                <Text style={ds.bigSub}> kcal consumed</Text>
              </View>
              <View style={ds.macroRow}>
                <MacroChip value={totalProtein} unit="g" label="Protein" color={C.protein} />
                <MacroChip value={totalCarbs}   unit="g" label="Carbs"   color={C.carbs}   />
                <MacroChip value={totalFat}     unit="g" label="Fat"     color={C.fat}      />
              </View>
              <SectionHeader title={`Meals Logged · ${loggedMeals.length}`} />
              {loggedMeals.length === 0 ? (
                <View style={ds.emptyWrap}>
                  <Text style={ds.emptyText}>No meals logged yet</Text>
                  <Text style={ds.emptySub}>Head to Meals to log your first meal</Text>
                </View>
              ) : (
                loggedMeals.map((m, i) => (
                  <View key={i} style={ds.mealRow}>
                    <View style={ds.mealEmojiWrap}>
                      <Icon name={m.icon || 'restaurant-outline'} size={20} color={C.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={ds.mealName}>{m.name}</Text>
                      <Text style={ds.mealMacros}>P {m.protein}g · C {m.carbs}g · F {m.fat}g</Text>
                    </View>
                    <Text style={[ds.mealCal, { color: C.accent }]}>{m.cal}</Text>
                  </View>
                ))
              )}
            </>
          )}

          {type === 'workouts' && (
            <>
              <Text style={ds.sheetTitle}>Today's Activity</Text>
              <View style={ds.macroRow}>
                <MacroChip value={totalCalBurned} unit="" label="Cal Burned" color={C.accent}    />
                <MacroChip value={totalMinActive}  unit="" label="Min Active" color={C.blue}    />
                <MacroChip value={totalExercises}  unit="" label="Exercises"  color={C.protein} />
              </View>
              <SectionHeader title="Sessions" />
              {todaysWorkouts.length === 0 ? (
                <View style={ds.emptyWrap}>
                  <Text style={ds.emptyText}>No workouts today</Text>
                  <Text style={ds.emptySub}>Head to Workout to start a session</Text>
                </View>
              ) : (
                todaysWorkouts.map((w, i) => (
                  <View key={w.id || i} style={ds.workoutRow}>
                    <View style={[ds.wDot, { backgroundColor: C.accent, borderColor: C.accent }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={ds.workoutName}>{w.type || 'Workout'}</Text>
                      <Text style={ds.workoutTime}>{w.duration || ''} min</Text>
                    </View>
                    <Badge label={`${w.calBurn || 0} cal`} color={C.accent} />
                  </View>
                ))
              )}
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ── MAIN SCREEN ───────────────────────────────────────────────────
// ── WEEKLY PROGRESS (interactive) ─────────────────────────────────
const DAY_LABELS = ['M','T','W','T','F','S','S'];

function WeeklyProgress({ loggedMeals, completedWorkouts }) {
  const [selectedDay, setSelectedDay] = useState(null);

  const weekData = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
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

    // Per-day data
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

  // Stats to show — week summary or selected day
  const stats = useMemo(() => {
    if (selectedDay !== null) {
      const d = daily[selectedDay];
      return [
        { val: d.meals,   lbl: 'Meals',      color: C.accent },
        { val: d.cal,     lbl: 'Calories',    color: C.blue },
        { val: `${d.protein}g`, lbl: 'Protein', color: C.protein },
        { val: d.workouts, lbl: 'Workouts',   color: C.carbs },
      ];
    }
    return [
      { val: weekMeals.length,    lbl: 'Meals',      color: C.accent },
      { val: weekWorkouts.length,  lbl: 'Workouts',   color: C.blue },
      { val: `${adherence}%`,      lbl: 'Adherence',  color: C.protein },
      { val: weekCalBurned >= 1000 ? `${(weekCalBurned / 1000).toFixed(1)}k` : weekCalBurned, lbl: 'Cal Burned', color: C.carbs },
    ];
  }, [selectedDay, daily, weekMeals, weekWorkouts, adherence, weekCalBurned]);

  return (
    <Card style={ds.weekCard}>
      {/* Stats row */}
      <View style={ds.weekStats}>
        {stats.map(s => (
          <View key={s.lbl} style={ds.weekStat}>
            <Text style={[ds.weekStatVal, { color: s.color }]}>{s.val}</Text>
            <Text style={ds.weekStatLbl}>{s.lbl}</Text>
          </View>
        ))}
      </View>

      {/* Day label when selected */}
      {selectedDay !== null && (
        <Text style={ds.weekSelectedLabel}>
          {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][selectedDay]}
        </Text>
      )}

      <View style={ds.weekDivider} />

      {/* Bars */}
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
                  backgroundColor: isSelected ? C.accent : isFuture ? C.surface3 : (isToday && selectedDay === null) ? C.accent : C.accentDim,
                  opacity: isSelected ? 1 : isFuture ? 0.25 : (isToday && selectedDay === null) ? 1 : 0.55,
                  ...(isSelected || (isToday && selectedDay === null) ? SHADOW.accent : {}),
                }
              ]} />
              <Text style={[
                ds.barDay,
                isToday && selectedDay === null && { color: C.accent },
                isSelected && ds.barDaySelected,
              ]}>
                {DAY_LABELS[i]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Card>
  );
}

export default function DashboardScreen({ navigation }) {
  const { totalCals, totalProtein, totalCarbs, totalFat, loggedMeals, goal, user, profile, pantryMeals, streakData, pantry, completedWorkouts, calGoal, waterData, waterGoalOz, addWater, removeWater, units, healthKitEnabled, todaySteps, todayActiveCal } = useApp();
  const todayStr = new Date().toDateString();
  const todaysWorkoutCount = completedWorkouts.filter(w => w.date === todayStr).length;
  const [modal, setModal]         = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const firstName = (user?.displayName || user?.name || 'there').split(' ')[0];
  const initial = firstName[0]?.toUpperCase();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  useEffect(() => {
    if (streakData?.earnedToday) setShowCelebration(true);
  }, [streakData?.earnedToday]);

  return (
    <SafeAreaView style={ds.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.black} />

      {/* Header */}
      <View style={ds.header}>
        <View style={{ flex: 1 }}>
          <Text style={ds.headerDate}>{today}</Text>
          <Text style={ds.headerGreet}>{greeting}, {firstName}!</Text>
          <StreakInline streakData={streakData} />
        </View>
        <TouchableOpacity style={ds.avatar} onPress={() => navigation.navigate('Profile')} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Profile">
          {profile?.profilePhoto ? (
            <Image source={{ uri: profile.profilePhoto }} style={ds.avatarImg} />
          ) : (
            <Text style={ds.avatarText}>{initial}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ds.scroll}>

        <View style={ds.goalPill}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent }} />
          <Text style={ds.goalText}>{goal}</Text>
          <Text style={ds.goalStatus}>Active</Text>
        </View>

        {/* Calorie hero */}
        <CalorieHero
          totalCals={totalCals}
          totalProtein={totalProtein}
          totalCarbs={totalCarbs}
          totalFat={totalFat}
          calGoal={calGoal}
          onPress={() => setModal('calories')}
        />

        {/* Water tracking */}
        {(() => {
          const isMetric = units === 'Metric';
          const displayTotal = isMetric ? Math.round(waterData.totalOz * 29.5735) : waterData.totalOz;
          const displayGoal = isMetric ? Math.round(waterGoalOz * 29.5735) : waterGoalOz;
          const displayUnit = isMetric ? 'ml' : 'oz';
          const pct = waterGoalOz > 0 ? waterData.totalOz / waterGoalOz : 0;
          const goalHit = pct >= 1;
          return (
            <TouchableOpacity style={[ds.waterCard, goalHit && ds.waterCardDone]} onPress={() => navigation.navigate('Water')} activeOpacity={0.8}>
              <View style={ds.waterLeft}>
                <CircularProgress value={waterData.totalOz} max={waterGoalOz} size={68} color={C.blue} accessibilityLabel={`Water: ${displayTotal} of ${displayGoal} ${displayUnit}`}>
                  <Icon name={goalHit ? 'checkmark-circle' : 'water'} size={22} color={C.blue} />
                </CircularProgress>
              </View>
              <View style={ds.waterMid}>
                <Text style={ds.waterTitle}>{goalHit ? 'Goal Complete!' : 'Water Intake'}</Text>
                <Text style={ds.waterCount}>
                  <Text style={{ color: C.blue, fontWeight: '900' }}>{displayTotal}</Text>
                  <Text style={{ color: C.textTertiary }}> / {displayGoal} {displayUnit}</Text>
                </Text>
                {!goalHit && pct < 0.4 && new Date().getHours() >= 12 && (
                  <Text style={ds.waterNudge}>Behind pace — drink up!</Text>
                )}
              </View>
              <TouchableOpacity style={[ds.waterBtn, ds.waterBtnAdd]} onPress={() => addWater('Glass')} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={`Add ${isMetric ? '350ml' : '12oz'}`}>
                <Text style={[ds.waterBtnText, { color: C.blue }]}>+</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })()}

        {/* HealthKit Activity */}
        {healthKitEnabled && (
          <View style={ds.activityCard}>
            <Text style={ds.activityTitle}>Today's Activity</Text>
            <View style={ds.activityRow}>
              <View style={ds.activityItem}>
                <Icon name="footsteps-outline" size={20} color={C.accent} />
                <Text style={ds.activityVal}>{todaySteps.toLocaleString()}</Text>
                <Text style={ds.activityLabel}>Steps</Text>
              </View>
              <View style={ds.activityDivider} />
              <View style={ds.activityItem}>
                <Icon name="flame-outline" size={20} color={C.fat} />
                <Text style={ds.activityVal}>{todayActiveCal}</Text>
                <Text style={ds.activityLabel}>Active Cal</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick actions */}
        <SectionHeader title="Quick Access" style={{ marginTop: SPACING.md }} />
        <View style={ds.qaGrid}>
          <QuickCard
            icon="basket-outline" label="Pantry"
            sub={`${pantry.length} items`} color={C.carbs}
            onPress={() => navigation.navigate('Pantry')}
          />
          <QuickCard
            icon="restaurant-outline" label="Meals"
            sub={`${loggedMeals.length} logged`} color={C.accent}
            onPress={() => navigation.navigate('Meals')}
          />
          <QuickCard
            icon="barbell-outline" label="Workout"
            sub={`${todaysWorkoutCount} done today`} color={C.protein}
            onPress={() => navigation.navigate('Workout')}
          />
        </View>

        {/* Weekly bar chart */}
        <SectionHeader title="Weekly Progress" action="Details" onAction={() => navigation.navigate('WeeklyDetail')} />
        <WeeklyProgress loggedMeals={loggedMeals} completedWorkouts={completedWorkouts} />

        {/* Suggested meal */}
        <SectionHeader title="Suggested Meal" action="See All" onAction={() => navigation.navigate('Meals')} />
        {pantryMeals.slice(0, 1).map(r => (
          <TouchableOpacity
            key={r.id}
            style={ds.suggestCard}
            onPress={() => navigation.navigate('Recipe', { recipe: r })}
            activeOpacity={0.8}
          >
            <View style={ds.suggestLeft}>
              <Icon name={r.icon} size={28} color={C.accent} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Badge label={r.tag} color={C.accent} />
              <Text style={ds.suggestName}>{r.name}</Text>
              <Text style={ds.suggestMeta}>{r.cal} cal · {r.protein}g protein · {r.prepTime + r.cookTime} min</Text>
            </View>
            <View style={ds.suggestArrow}>
              <Text style={ds.suggestArrowText}>→</Text>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>

      {/* Floating action button */}
      <TouchableOpacity
        style={ds.fab}
        onPress={() => navigation.navigate('Meals')}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Log a meal"
      >
        <Icon name="add" size={28} color={C.textInverse} />
      </TouchableOpacity>

      <MealDetailModal visible={!!modal} onClose={() => setModal(null)} type={modal} />

      {/* Streak celebration */}
      {showCelebration && (
        <StreakCelebration count={streakData?.count || 0} onDone={() => setShowCelebration(false)} />
      )}
    </SafeAreaView>
  );
}

const ds = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.black },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerDate:  { fontSize: 9, fontWeight: '700', color: C.textTertiary, letterSpacing: 1.8, marginBottom: 3 },
  headerGreet: { fontSize: 24, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.5 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center',
    ...SHADOW.accent,
  },
  avatarText: { fontSize: 17, fontWeight: '900', color: C.textInverse },
  avatarImg: { width: 42, height: 42, borderRadius: 21 },
  scroll: { padding: SPACING.md, paddingBottom: 100 },

  // Goal pill
  goalPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
    backgroundColor: C.accentBgSm, borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: C.accent + '20',
    marginBottom: SPACING.md,
  },
  goalText:   { fontSize: 13, fontWeight: '600', color: C.textPrimary, flex: 1 },
  goalStatus: { fontSize: 10, fontWeight: '700', color: C.accent, letterSpacing: 0.5 },

  // Hero card
  heroCard: {
    backgroundColor: C.surface1, borderRadius: RADIUS.xl,
    padding: SPACING.md, borderWidth: 1, borderColor: C.border,
    marginBottom: SPACING.lg,
  },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  heroLabel: { fontSize: 13, fontWeight: '600', color: C.textSecondary, letterSpacing: 0.2, marginBottom: 3 },
  heroGoalText: { fontSize: 12, color: C.textSecondary, fontWeight: '500' },

  // Ring center
  ringCal:    { fontSize: 48, fontWeight: '900', color: C.textPrimary, letterSpacing: -2 },
  ringUnit:   { fontSize: 13, color: C.textSecondary, fontWeight: '600', marginTop: -4 },
  ringRemain: { fontSize: 11, color: C.accent, fontWeight: '700', marginTop: 4 },

  macroRow: { flexDirection: 'row', gap: 8 },

  // Water card
  waterCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.surface1, borderRadius: RADIUS.xl,
    padding: SPACING.md, borderWidth: 1, borderColor: C.border,
    marginBottom: SPACING.lg,
  },
  waterCardDone: { borderColor: C.blue + '40' },
  waterLeft: {},
  waterMid: { flex: 1, gap: 4 },
  waterTitle: { fontSize: 13, fontWeight: '600', color: C.textSecondary },
  waterCount: { fontSize: 16, fontWeight: '600' },
  waterNudge: { fontSize: 11, fontWeight: '500', color: C.carbs, marginTop: 2 },
  waterBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.surface3, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  waterBtnAdd: { backgroundColor: C.blue + '20', borderColor: C.blue + '40' },
  waterBtnText: { fontSize: 20, fontWeight: '700', color: C.textSecondary, lineHeight: 22 },

  // HealthKit activity card
  activityCard: {
    backgroundColor: C.surface1, borderRadius: RADIUS.xl,
    padding: SPACING.md, borderWidth: 1, borderColor: C.border,
    marginBottom: SPACING.lg,
  },
  activityTitle: { fontSize: 13, fontWeight: '600', color: C.textSecondary, marginBottom: 12 },
  activityRow: { flexDirection: 'row', alignItems: 'center' },
  activityItem: { flex: 1, alignItems: 'center', gap: 4 },
  activityDivider: { width: 1, height: 40, backgroundColor: C.border },
  activityIcon: { fontSize: 24 },
  activityVal: { fontSize: 24, fontWeight: '900', color: C.textPrimary, letterSpacing: -0.5 },
  activityLabel: { fontSize: 10, fontWeight: '600', color: C.textTertiary, letterSpacing: 0.5 },

  // Quick actions
  qaGrid: { flexDirection: 'row', gap: 10, marginBottom: SPACING.lg },
  qaCard: {
    flex: 1, backgroundColor: C.surface1, borderRadius: RADIUS.lg,
    padding: 14, borderWidth: 1, borderColor: C.border, gap: 6, alignItems: 'flex-start',
  },
  qaIconWrap: { width: 40, height: 40, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  qaIcon:  { fontSize: 20 },
  qaLabel: { fontSize: 13, fontWeight: '700', color: C.textPrimary },
  qaSub:   { fontSize: 11, color: C.textTertiary },

  // Week card
  weekCard: { marginBottom: SPACING.lg },
  weekStats: { flexDirection: 'row', marginBottom: SPACING.sm },
  weekStat:  { flex: 1, alignItems: 'center' },
  weekStatVal: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  weekStatLbl: { fontSize: 9, color: C.textTertiary, fontWeight: '600', marginTop: 2, letterSpacing: 0.5 },
  weekDivider: { height: 1, backgroundColor: C.border, marginBottom: SPACING.sm },
  barChart: { flexDirection: 'row', gap: 6, alignItems: 'flex-end', height: 52 },
  barWrap:  { flex: 1, alignItems: 'center', gap: 5 },
  bar:      { width: '100%', borderRadius: 4, minHeight: 4 },
  barDay:   { fontSize: 9, color: C.textTertiary, fontWeight: '600' },
  barDaySelected: { color: C.accent, fontWeight: '800' },
  weekSelectedLabel: { fontSize: 11, fontWeight: '700', color: C.textSecondary, textAlign: 'center', marginBottom: 4 },

  // Suggest card
  suggestCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.surface1, borderRadius: RADIUS.xl,
    padding: SPACING.md, borderWidth: 1, borderColor: C.border,
    marginBottom: SPACING.lg,
  },
  suggestLeft: {
    width: 60, height: 60, borderRadius: RADIUS.lg,
    backgroundColor: C.surface3, alignItems: 'center', justifyContent: 'center',
  },
  suggestEmoji: { fontSize: 32 },
  suggestName:  { fontSize: 16, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.3 },
  suggestMeta:  { fontSize: 12, color: C.textSecondary },
  suggestArrow: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.surface3, alignItems: 'center', justifyContent: 'center',
  },
  suggestArrowText: { fontSize: 14, color: C.accent, fontWeight: '700' },

  // Streak inline (header)
  streakInline: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginTop: 4,
  },
  streakInlineCount: { fontSize: 11, fontWeight: '600', color: C.textTertiary },
  streakInlineDots: { flexDirection: 'row', gap: 4, marginLeft: 4 },
  streakInlineDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: C.surface3,
  },
  streakInlineDotOn: { backgroundColor: C.accent },
  streakInlineDotToday: { backgroundColor: C.surface3, borderWidth: 1, borderColor: C.accent },

  // Celebration overlay
  celebOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 999,
  },
  particle: { position: 'absolute', fontSize: 18, color: C.accent, fontWeight: '900' },
  celebCard: {
    backgroundColor: C.surface1, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: C.accent + '40',
    padding: SPACING.xl, alignItems: 'center', gap: 4,
    ...SHADOW.accent,
    minWidth: 180,
  },
  celebStar:     { fontSize: 52, marginBottom: 4 },
  celebDayLabel: { fontSize: 10, fontWeight: '800', color: C.accent, letterSpacing: 3 },
  celebCount:    { fontSize: 72, fontWeight: '900', color: C.textPrimary, letterSpacing: -3, lineHeight: 76 },
  celebSub:      { fontSize: 15, fontWeight: '600', color: C.textSecondary },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  sheet:   {
    backgroundColor: C.surface0,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    borderWidth: 1, borderColor: C.border,
    padding: SPACING.lg, paddingBottom: 44, maxHeight: '82%',
  },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: C.surface3,
    borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.lg,
  },
  sheetTitle: { fontSize: 26, fontWeight: '900', color: C.textPrimary, letterSpacing: -0.5, marginBottom: SPACING.sm },
  bigRow:     { flexDirection: 'row', alignItems: 'baseline', marginBottom: SPACING.md },
  bigNum:     { fontSize: 52, fontWeight: '900', letterSpacing: -2 },
  bigSub:     { fontSize: 14, color: C.textSecondary, marginLeft: 4 },
  emptyWrap:  { alignItems: 'center', padding: SPACING.xl },
  emptyText:  { fontSize: 16, fontWeight: '700', color: C.textSecondary },
  emptySub:   { fontSize: 13, color: C.textTertiary, marginTop: 4 },
  mealRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surface1, borderRadius: RADIUS.md,
    padding: 12, marginBottom: 8,
  },
  mealEmojiWrap: { width: 40, height: 40, borderRadius: RADIUS.sm, backgroundColor: C.surface3, alignItems: 'center', justifyContent: 'center' },
  mealEmoji:  { fontSize: 22 },
  mealName:   { fontSize: 14, fontWeight: '600', color: C.textPrimary, marginBottom: 2 },
  mealMacros: { fontSize: 11, color: C.textTertiary },
  mealCal:    { fontSize: 16, fontWeight: '800' },
  workoutRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surface1, borderRadius: RADIUS.md,
    padding: 14, marginBottom: 8,
  },
  wDot:        { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  workoutName: { fontSize: 14, fontWeight: '600', color: C.textPrimary, marginBottom: 2 },
  workoutTime: { fontSize: 11, color: C.textTertiary },

  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: C.accent,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOW.accent,
    zIndex: 10,
  },
});
