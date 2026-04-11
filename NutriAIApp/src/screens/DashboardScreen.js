import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Modal, StatusBar, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { DottedRing, MacroChip, SectionHeader, Badge, Card, GlowDot } from '../components/UI';

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
        <Text style={ds.celebDayLabel}>DAY</Text>
        <Text style={ds.celebCount}>{count}</Text>
        <Text style={ds.celebSub}>Day Streak</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ── STREAK CARD ────────────────────────────────────────────────────
function StreakCard({ streakData }) {
  const streak = streakData || { count: 0, activityDates: [], earnedToday: false };
  const today = new Date().toDateString();
  const days  = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const ds = d.toDateString();
    const isToday   = ds === today;
    const isEarned  = streak.activityDates.includes(ds);
    return { isToday, isEarned };
  });

  return (
    <View style={ds.streakCard}>
      {/* Left: count */}
      <View style={ds.streakLeft}>
        <Text style={ds.streakFire}>🔥</Text>
        <View>
          <Text style={ds.streakCount}>{streak.count}</Text>
          <Text style={ds.streakLabel}>day streak</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={ds.streakDivider} />

      {/* Right: 7-day dots */}
      <View style={ds.streakDots}>
        {days.map((d, i) => (
          <View key={i} style={[
            ds.streakDot,
            d.isEarned  && ds.streakDotEarned,
            d.isToday && !d.isEarned && ds.streakDotToday,
          ]}>
            {d.isEarned && <Text style={ds.streakDotStar}>★</Text>}
          </View>
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
          <Text style={ds.heroLabel}>CALORIES TODAY</Text>
          <Text style={ds.heroGoalText}>of {CAL_GOAL} kcal goal</Text>
        </View>
        <Badge label={`${Math.round(pct * 100)}%`} color={C.lime} />
      </View>

      {/* Dotted ring */}
      <View style={{ alignItems: 'center', marginVertical: SPACING.md }}>
        <DottedRing value={totalCals} max={CAL_GOAL} size={188} color={C.lime}>
          <Text style={ds.ringCal}>{totalCals}</Text>
          <Text style={ds.ringUnit}>kcal</Text>
          <Text style={ds.ringRemain}>{CAL_GOAL - totalCals} left</Text>
        </DottedRing>
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
function QuickCard({ icon, label, sub, color = C.lime, onPress }) {
  return (
    <TouchableOpacity style={ds.qaCard} onPress={onPress} activeOpacity={0.75} accessibilityRole="button" accessibilityLabel={`${label}: ${sub}`}>
      <View style={[ds.qaIconWrap, { backgroundColor: color + '15', borderColor: color + '25' }]}>
        <Text style={ds.qaIcon}>{icon}</Text>
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
                <Text style={[ds.bigNum, { color: C.lime }]}>{totalCals}</Text>
                <Text style={ds.bigSub}> kcal consumed</Text>
              </View>
              <View style={ds.macroRow}>
                <MacroChip value={totalProtein} unit="g" label="Protein" color={C.protein} />
                <MacroChip value={totalCarbs}   unit="g" label="Carbs"   color={C.carbs}   />
                <MacroChip value={totalFat}     unit="g" label="Fat"     color={C.fat}      />
              </View>
              <SectionHeader title={`MEALS LOGGED · ${loggedMeals.length}`} />
              {loggedMeals.length === 0 ? (
                <View style={ds.emptyWrap}>
                  <Text style={ds.emptyText}>No meals logged yet</Text>
                  <Text style={ds.emptySub}>Head to Meals to log your first meal</Text>
                </View>
              ) : (
                loggedMeals.map((m, i) => (
                  <View key={i} style={ds.mealRow}>
                    <View style={ds.mealEmojiWrap}>
                      <Text style={ds.mealEmoji}>{m.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={ds.mealName}>{m.name}</Text>
                      <Text style={ds.mealMacros}>P {m.protein}g · C {m.carbs}g · F {m.fat}g</Text>
                    </View>
                    <Text style={[ds.mealCal, { color: C.lime }]}>{m.cal}</Text>
                  </View>
                ))
              )}
            </>
          )}

          {type === 'workouts' && (
            <>
              <Text style={ds.sheetTitle}>Today's Activity</Text>
              <View style={ds.macroRow}>
                <MacroChip value={totalCalBurned} unit="" label="Cal Burned" color={C.lime}    />
                <MacroChip value={totalMinActive}  unit="" label="Min Active" color={C.blue}    />
                <MacroChip value={totalExercises}  unit="" label="Exercises"  color={C.protein} />
              </View>
              <SectionHeader title="SESSIONS" />
              {todaysWorkouts.length === 0 ? (
                <View style={ds.emptyWrap}>
                  <Text style={ds.emptyText}>No workouts today</Text>
                  <Text style={ds.emptySub}>Head to Workout to start a session</Text>
                </View>
              ) : (
                todaysWorkouts.map((w, i) => (
                  <View key={w.id || i} style={ds.workoutRow}>
                    <View style={[ds.wDot, { backgroundColor: C.lime, borderColor: C.lime }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={ds.workoutName}>{w.type || 'Workout'}</Text>
                      <Text style={ds.workoutTime}>{w.duration || ''} min</Text>
                    </View>
                    <Badge label={`${w.calBurn || 0} cal`} color={C.lime} />
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
export default function DashboardScreen({ navigation }) {
  const { totalCals, totalProtein, totalCarbs, totalFat, loggedMeals, goal, user, pantryMeals, streakData, pantry, completedWorkouts, calGoal, waterGlasses, waterGoal, addWater, removeWater, healthKitEnabled, todaySteps, todayActiveCal } = useApp();
  const todayStr = new Date().toDateString();
  const todaysWorkoutCount = completedWorkouts.filter(w => w.date === todayStr).length;
  const [modal, setModal]         = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const firstName = (user?.displayName || user?.name || 'there').split(' ')[0];
  const initial = firstName[0]?.toUpperCase();

  useEffect(() => {
    if (streakData?.earnedToday) setShowCelebration(true);
  }, [streakData?.earnedToday]);

  return (
    <SafeAreaView style={ds.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.black} />

      {/* Header */}
      <View style={ds.header}>
        <View>
          <Text style={ds.headerDate}>{today.toUpperCase()}</Text>
          <Text style={ds.headerGreet}>Hey, {firstName} 👋</Text>
        </View>
        <TouchableOpacity style={ds.avatar} onPress={() => navigation.navigate('Profile')} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Profile">
          <Text style={ds.avatarText}>{initial}</Text>
        </TouchableOpacity>
      </View>

      {/* Streak bar */}
      <StreakCard streakData={streakData} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ds.scroll}>

        {/* Goal pill */}
        <View style={ds.goalPill}>
          <GlowDot />
          <Text style={ds.goalText}>
            {goal === 'Lose Weight' ? '🔥 Lose Weight' :
             goal === 'Build Muscle' ? '💪 Build Muscle' :
             goal === 'Stay Healthy' ? '🧘 Stay Healthy' : '⚡ Boost Energy'}
          </Text>
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
        <View style={ds.waterCard}>
          <View style={ds.waterLeft}>
            <DottedRing value={waterGlasses} max={waterGoal} size={68} color={C.blue} accessibilityLabel={`Water: ${waterGlasses} of ${waterGoal} glasses`}>
              <Text style={ds.waterIcon}>💧</Text>
            </DottedRing>
          </View>
          <View style={ds.waterMid}>
            <Text style={ds.waterTitle}>Water Intake</Text>
            <Text style={ds.waterCount}>
              <Text style={{ color: C.blue, fontWeight: '900' }}>{waterGlasses}</Text>
              <Text style={{ color: C.textTertiary }}> / {waterGoal} glasses</Text>
            </Text>
          </View>
          <View style={ds.waterBtns}>
            <TouchableOpacity style={ds.waterBtn} onPress={removeWater} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Remove water glass">
              <Text style={ds.waterBtnText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[ds.waterBtn, ds.waterBtnAdd]} onPress={addWater} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Add water glass">
              <Text style={[ds.waterBtnText, { color: C.blue }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* HealthKit Activity */}
        {healthKitEnabled && (
          <View style={ds.activityCard}>
            <Text style={ds.activityTitle}>TODAY'S ACTIVITY</Text>
            <View style={ds.activityRow}>
              <View style={ds.activityItem}>
                <Text style={ds.activityIcon}>👟</Text>
                <Text style={ds.activityVal}>{todaySteps.toLocaleString()}</Text>
                <Text style={ds.activityLabel}>Steps</Text>
              </View>
              <View style={ds.activityDivider} />
              <View style={ds.activityItem}>
                <Text style={ds.activityIcon}>🔥</Text>
                <Text style={ds.activityVal}>{todayActiveCal}</Text>
                <Text style={ds.activityLabel}>Active Cal</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick actions */}
        <SectionHeader title="QUICK ACCESS" style={{ marginTop: SPACING.md }} />
        <View style={ds.qaGrid}>
          <QuickCard
            icon="🥫" label="Pantry"
            sub={`${pantry.length} items`} color={C.carbs}
            onPress={() => navigation.navigate('Pantry')}
          />
          <QuickCard
            icon="🍽️" label="Meals"
            sub={`${loggedMeals.length} logged`} color={C.lime}
            onPress={() => navigation.navigate('Meals')}
          />
          <QuickCard
            icon="💪" label="Workout"
            sub={`${todaysWorkoutCount} done today`} color={C.protein}
            onPress={() => navigation.navigate('Workout')}
          />
        </View>

        {/* Weekly bar chart */}
        <SectionHeader title="WEEKLY PROGRESS" action="Details" onAction={() => {}} />
        <Card style={ds.weekCard}>
          {(() => {
            // Compute real weekly stats
            const now = new Date();
            const dayOfWeek = now.getDay(); // 0=Sun
            const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - mondayOffset);
            weekStart.setHours(0, 0, 0, 0);

            const weekMeals = loggedMeals.filter(m => {
              const d = new Date(m.date);
              return d >= weekStart;
            });
            const weekWorkouts = completedWorkouts.filter(w => {
              const d = new Date(w.date);
              return d >= weekStart;
            });
            const weekCalBurned = weekWorkouts.reduce((a, w) => a + (w.calBurn || 0), 0);
            const daysActive = new Set([
              ...weekMeals.map(m => m.date),
              ...weekWorkouts.map(w => w.date),
            ]).size;
            const daysSoFar = mondayOffset + 1;
            const adherence = daysSoFar > 0 ? Math.round((daysActive / daysSoFar) * 100) : 0;

            // Compute daily meal counts for bar chart (Mon-Sun)
            const dailyCounts = [0, 0, 0, 0, 0, 0, 0];
            weekMeals.forEach(m => {
              const d = new Date(m.date);
              const idx = d.getDay() === 0 ? 6 : d.getDay() - 1;
              dailyCounts[idx]++;
            });
            const maxCount = Math.max(...dailyCounts, 1);

            return (
              <>
          <View style={ds.weekStats}>
            {[
              { val: weekMeals.length,    lbl: 'Meals',     color: C.lime    },
              { val: weekWorkouts.length,  lbl: 'Workouts',  color: C.blue    },
              { val: `${adherence}%`,      lbl: 'Adherence', color: C.protein },
              { val: weekCalBurned >= 1000 ? `${(weekCalBurned / 1000).toFixed(1)}k` : weekCalBurned, lbl: 'Cal Burned', color: C.carbs },
            ].map(s => (
              <View key={s.lbl} style={ds.weekStat}>
                <Text style={[ds.weekStatVal, { color: s.color }]}>{s.val}</Text>
                <Text style={ds.weekStatLbl}>{s.lbl}</Text>
              </View>
            ))}
          </View>
          <View style={ds.weekDivider} />
          <View style={ds.barChart}>
            {dailyCounts.map((count, i) => {
              const h = maxCount > 0 ? (count / maxCount) * 100 : 0;
              const todayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1;
              const isToday = i === todayIdx;
              const isFuture = i > todayIdx;
              return (
                <View key={i} style={ds.barWrap}>
                  <View style={[
                    ds.bar,
                    {
                      height: h * 0.44,
                      backgroundColor: isFuture ? C.surface3 : isToday ? C.lime : C.limeDim,
                      opacity: isFuture ? 0.25 : isToday ? 1 : 0.55,
                      ...(isToday ? SHADOW.lime : {}),
                    }
                  ]} />
                  <Text style={[ds.barDay, isToday && { color: C.lime }]}>
                    {['M','T','W','T','F','S','S'][i]}
                  </Text>
                </View>
              );
            })}
          </View>
              </>
            );
          })()}
        </Card>

        {/* Suggested meal */}
        <SectionHeader title="SUGGESTED MEAL" action="See All" onAction={() => navigation.navigate('Meals')} />
        {pantryMeals.slice(0, 1).map(r => (
          <TouchableOpacity
            key={r.id}
            style={ds.suggestCard}
            onPress={() => navigation.navigate('Recipe', { recipe: r })}
            activeOpacity={0.8}
          >
            <View style={ds.suggestLeft}>
              <Text style={ds.suggestEmoji}>{r.emoji}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Badge label={r.tag} color={C.lime} />
              <Text style={ds.suggestName}>{r.name}</Text>
              <Text style={ds.suggestMeta}>{r.cal} cal · {r.protein}g protein · {r.prepTime + r.cookTime} min</Text>
            </View>
            <View style={ds.suggestArrow}>
              <Text style={ds.suggestArrowText}>→</Text>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>

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
    backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center',
    ...SHADOW.lime,
  },
  avatarText: { fontSize: 17, fontWeight: '900', color: C.textInverse },
  scroll: { padding: SPACING.md, paddingBottom: 100 },

  // Goal pill
  goalPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
    backgroundColor: C.limeGlowSm, borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: C.lime + '20',
    marginBottom: SPACING.md,
  },
  goalText:   { fontSize: 13, fontWeight: '600', color: C.textPrimary, flex: 1 },
  goalStatus: { fontSize: 10, fontWeight: '700', color: C.lime, letterSpacing: 0.5 },

  // Hero card
  heroCard: {
    backgroundColor: C.surface1, borderRadius: RADIUS.xl,
    padding: SPACING.md, borderWidth: 1, borderColor: C.border,
    marginBottom: SPACING.lg,
  },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  heroLabel: { fontSize: 9, fontWeight: '700', color: C.textTertiary, letterSpacing: 1.8, marginBottom: 3 },
  heroGoalText: { fontSize: 12, color: C.textSecondary, fontWeight: '500' },

  // Ring center
  ringCal:    { fontSize: 48, fontWeight: '900', color: C.textPrimary, letterSpacing: -2 },
  ringUnit:   { fontSize: 13, color: C.textSecondary, fontWeight: '600', marginTop: -4 },
  ringRemain: { fontSize: 11, color: C.lime, fontWeight: '700', marginTop: 4 },

  macroRow: { flexDirection: 'row', gap: 8 },

  // Water card
  waterCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.surface1, borderRadius: RADIUS.xl,
    padding: SPACING.md, borderWidth: 1, borderColor: C.border,
    marginBottom: SPACING.lg,
  },
  waterLeft: {},
  waterMid: { flex: 1, gap: 4 },
  waterTitle: { fontSize: 9, fontWeight: '700', color: C.textTertiary, letterSpacing: 1.8 },
  waterCount: { fontSize: 16, fontWeight: '600' },
  waterIcon: { fontSize: 22 },
  waterBtns: { flexDirection: 'row', gap: 8 },
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
  activityTitle: { fontSize: 9, fontWeight: '700', color: C.textTertiary, letterSpacing: 1.8, marginBottom: 12 },
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
  suggestArrowText: { fontSize: 14, color: C.lime, fontWeight: '700' },

  // Streak card
  streakCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface1, borderBottomWidth: 1, borderBottomColor: C.border,
    paddingHorizontal: SPACING.md, paddingVertical: 12,
  },
  streakLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  streakFire:  { fontSize: 26 },
  streakCount: { fontSize: 28, fontWeight: '900', color: C.lime, letterSpacing: -1, lineHeight: 30 },
  streakLabel: { fontSize: 10, fontWeight: '700', color: C.textTertiary, letterSpacing: 0.5 },
  streakDivider: { width: 1, height: 32, backgroundColor: C.border, marginHorizontal: 16 },
  streakDots:  { flex: 1, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'flex-end' },
  streakDot: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 1.5, borderColor: C.surface4,
    backgroundColor: C.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
  streakDotEarned: {
    backgroundColor: C.limeDeep, borderColor: C.lime,
    ...SHADOW.lime,
  },
  streakDotToday: {
    borderColor: C.lime, borderStyle: 'dashed',
  },
  streakDotStar: { fontSize: 11, color: C.lime },

  // Celebration overlay
  celebOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 999,
  },
  particle: { position: 'absolute', fontSize: 18, color: C.lime, fontWeight: '900' },
  celebCard: {
    backgroundColor: C.surface1, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: C.lime + '40',
    padding: SPACING.xl, alignItems: 'center', gap: 4,
    ...SHADOW.lime,
    minWidth: 180,
  },
  celebStar:     { fontSize: 52, marginBottom: 4 },
  celebDayLabel: { fontSize: 10, fontWeight: '800', color: C.lime, letterSpacing: 3 },
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
});
