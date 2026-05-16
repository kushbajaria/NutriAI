import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RADIUS, SPACING } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { GlassCard, GradientButton } from '../components';
import Icon from '../components/Icon';
import { hapticSuccess, hapticMedium, hapticSelection } from '../utils/haptics';

// ── REST TIMER ────────────────────────────────────────────────────
function RestTimer({ seconds, onDone, onSkip }) {
  const { palette, accent } = useTheme();
  const [remaining, setRemaining] = useState(seconds);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const barAnim = useRef(new Animated.Value(1)).current;
  const barAnimRef = useRef(null);
  const totalRef = useRef(seconds);

  // Start smooth bar animation
  useEffect(() => {
    barAnim.setValue(1);
    barAnimRef.current = Animated.timing(barAnim, {
      toValue: 0,
      duration: seconds * 1000,
      useNativeDriver: false,
    });
    barAnimRef.current.start();
    return () => barAnimRef.current?.stop();
  }, []);

  // Countdown for the number display
  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(id);
          hapticMedium();
          onDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (remaining <= 5 && remaining > 0) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 150, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [remaining]);

  // Handle +15s extension
  const handleExtend = useCallback(() => {
    setRemaining(prev => prev + 15);
    totalRef.current += 15;
    barAnimRef.current?.stop();
    barAnimRef.current = Animated.timing(barAnim, {
      toValue: 0,
      duration: (remaining + 15) * 1000,
      useNativeDriver: false,
    });
    barAnimRef.current.start();
  }, [remaining]);

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[s.restOverlay, { backgroundColor: palette.overlay || (palette.bg0 + 'E6') }]}>
      <View style={s.restCard}>
        <Text style={[s.restLabel, { color: palette.textTertiary }]}>Rest</Text>
        <Animated.Text style={[s.restTime, { color: accent.primary, transform: [{ scale: pulseAnim }] }]}>
          {remaining}
        </Animated.Text>
        <Text style={[s.restSec, { color: palette.textTertiary }]}>seconds</Text>

        {/* Progress bar — smooth */}
        <View style={[s.restBarBg, { backgroundColor: palette.bg3 }]}>
          <Animated.View style={[s.restBarFill, { width: barWidth, backgroundColor: accent.primary }]} />
        </View>

        <View style={s.restBtns}>
          <TouchableOpacity style={[s.restSkipBtn, { borderColor: palette.border, backgroundColor: palette.glass1Bg }]} onPress={onSkip} activeOpacity={0.7}>
            <Text style={[s.restSkipText, { color: palette.textSecondary }]}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.restExtendBtn, { backgroundColor: accent.primaryBg, borderColor: accent.primary + '30' }]} onPress={handleExtend} activeOpacity={0.7}>
            <Text style={[s.restExtendText, { color: accent.primary }]}>+15s</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── WORKOUT SUMMARY ───────────────────────────────────────────────
function WorkoutSummary({ type, duration, calBurn, exercises, totalSets, completedSets, elapsedTime, onLog, onDiscard }) {
  const { palette, accent, gradients } = useTheme();
  const mins = Math.floor(elapsedTime / 60);
  const secs = elapsedTime % 60;
  const pctComplete = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 100;

  return (
    <View style={s.summaryContainer}>
      <GlassCard level={3} style={s.summaryCardInner}>
        <Icon name="checkmark-circle" size={48} color={accent.primary} />
        <Text style={[s.summaryTitle, { color: palette.textPrimary }]}>Workout Complete!</Text>

        <View style={s.summaryGrid}>
          <SummaryStat icon="time-outline" value={`${mins}:${secs.toString().padStart(2, '0')}`} label="Duration" color={accent.blue} />
          <SummaryStat icon="flame-outline" value={`~${calBurn}`} label="Cal Burned" color={accent.energy} />
          <SummaryStat icon="list-outline" value={exercises.length} label="Exercises" color={accent.primary} />
          <SummaryStat icon="checkmark-done-outline" value={`${completedSets}/${totalSets}`} label="Sets Done" color={accent.protein} />
        </View>

        {pctComplete < 100 && (
          <Text style={[s.summaryPartial, { color: accent.carbs }]}>
            {pctComplete}% completed — partial workout
          </Text>
        )}

        <GradientButton
          label="Log Workout"
          onPress={onLog}
          gradient={gradients.primary}
          icon="checkmark"
        />

        <TouchableOpacity style={s.discardBtn} onPress={onDiscard} activeOpacity={0.7}>
          <Text style={[s.discardBtnText, { color: palette.textTertiary }]}>Discard</Text>
        </TouchableOpacity>
      </GlassCard>
    </View>
  );
}

function SummaryStat({ icon, value, label, color }) {
  const { palette } = useTheme();
  return (
    <View style={[s.summaryStat, { backgroundColor: palette.bg2, borderColor: palette.border }]}>
      <Icon name={icon} size={18} color={color} />
      <Text style={[s.summaryStatVal, { color: palette.textPrimary }]}>{value}</Text>
      <Text style={[s.summaryStatLbl, { color: palette.textTertiary }]}>{label}</Text>
    </View>
  );
}

// ── ACTIVE WORKOUT SCREEN ─────────────────────────────────────────
export default function ActiveWorkoutScreen({ route, navigation }) {
  const { type, duration, calBurn, exercises } = route.params;
  const { logWorkout } = useApp();
  const { mode, palette, accent, gradients } = useTheme();

  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSets, setCompletedSets] = useState(0);
  const [resting, setResting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const totalSets = useMemo(() => exercises.reduce((a, ex) => a + ex.sets, 0), [exercises]);
  const exercise = exercises[currentExIdx];

  // Elapsed timer
  const timerRef = useRef(null);
  useEffect(() => {
    if (!finished && !paused) {
      timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [finished, paused]);

  const handleSetComplete = useCallback(() => {
    hapticSelection();
    const newCompleted = completedSets + 1;
    setCompletedSets(newCompleted);

    if (currentSet < exercise.sets) {
      setResting(true);
    } else if (currentExIdx < exercises.length - 1) {
      setResting(true);
    } else {
      hapticSuccess();
      setFinished(true);
    }
  }, [completedSets, currentSet, exercise, currentExIdx, exercises.length]);

  const handleRestDone = useCallback(() => {
    setResting(false);
    if (currentSet < exercise.sets) {
      setCurrentSet(prev => prev + 1);
    } else {
      setCurrentExIdx(prev => prev + 1);
      setCurrentSet(1);
    }
  }, [currentSet, exercise?.sets]);

  const handleSkipExercise = useCallback(() => {
    hapticSelection();
    if (currentExIdx < exercises.length - 1) {
      setCurrentExIdx(prev => prev + 1);
      setCurrentSet(1);
    } else {
      hapticSuccess();
      setFinished(true);
    }
  }, [currentExIdx, exercises.length]);

  const handleExit = useCallback(() => {
    Alert.alert(
      'End Workout?',
      completedSets > 0
        ? 'You can log a partial workout or discard your progress.'
        : 'Your progress won\'t be saved.',
      [
        { text: 'Keep Going', style: 'cancel' },
        completedSets > 0
          ? { text: 'View Summary', onPress: () => setFinished(true) }
          : null,
        { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
      ].filter(Boolean),
    );
  }, [completedSets, navigation]);

  const handleLog = useCallback(async () => {
    const pctDone = totalSets > 0 ? completedSets / totalSets : 1;
    const adjustedCal = Math.round(calBurn * pctDone);
    await logWorkout({
      type,
      duration,
      calBurn: adjustedCal,
      exerciseCount: exercises.length,
      setsCompleted: completedSets,
      totalSets,
      elapsedSeconds: elapsedTime,
      exercises: exercises.map(ex => ({
        name: ex.name,
        muscle: ex.muscle,
        sets: ex.sets,
        reps: ex.reps,
        rest: ex.rest,
      })),
    });
    navigation.goBack();
  }, [type, duration, calBurn, exercises, completedSets, totalSets, elapsedTime, logWorkout, navigation]);

  // Progress
  const progressPct = totalSets > 0 ? completedSets / totalSets : 0;
  const mins = Math.floor(elapsedTime / 60);
  const secs = elapsedTime % 60;

  if (finished) {
    const pctDone = totalSets > 0 ? completedSets / totalSets : 1;
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
        <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
        <WorkoutSummary
          type={type}
          duration={duration}
          calBurn={Math.round(calBurn * pctDone)}
          exercises={exercises}
          totalSets={totalSets}
          completedSets={completedSets}
          elapsedTime={elapsedTime}
          onLog={handleLog}
          onDiscard={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={handleExit} style={[s.exitBtn, { backgroundColor: palette.bg2, borderColor: palette.borderHi }]} accessibilityLabel="End workout">
          <Icon name="close" size={20} color={palette.textSecondary} />
        </TouchableOpacity>

        <View style={s.topCenter}>
          <Text style={[s.topType, { color: palette.textSecondary }]}>{type}</Text>
          <Text style={[s.topTimer, { color: palette.textPrimary }]}>{mins}:{secs.toString().padStart(2, '0')}</Text>
        </View>

        <TouchableOpacity onPress={() => setPaused(p => !p)} style={[s.pauseBtn, { backgroundColor: accent.primaryBg, borderColor: accent.primary + '30' }]} accessibilityLabel={paused ? 'Resume' : 'Pause'}>
          <Icon name={paused ? 'play' : 'pause'} size={18} color={accent.primary} />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={[s.progressBarBg, { backgroundColor: palette.bg3 }]}>
        <View style={[s.progressBarFill, { width: `${progressPct * 100}%`, backgroundColor: accent.primary }]} />
      </View>

      {/* Paused overlay */}
      {paused && (
        <View style={[s.pausedOverlay, { backgroundColor: palette.overlay || (palette.bg0 + 'E6') }]}>
          <View style={s.pausedCard}>
            <Icon name="pause-circle" size={48} color={accent.primary} />
            <Text style={[s.pausedText, { color: palette.textPrimary }]}>Paused</Text>
            <GradientButton
              label="Resume"
              onPress={() => setPaused(false)}
              gradient={gradients.primary}
              style={{ paddingHorizontal: 32 }}
            />
          </View>
        </View>
      )}

      {/* Rest timer overlay */}
      {resting && !paused && (
        <RestTimer
          seconds={exercise.rest}
          onDone={handleRestDone}
          onSkip={() => { setResting(false); handleRestDone(); }}
        />
      )}

      {/* Exercise content */}
      {!resting && !paused && (
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Exercise counter */}
          <Text style={[s.exCounter, { color: palette.textTertiary }]}>
            Exercise {currentExIdx + 1} of {exercises.length}
          </Text>

          {/* Exercise card */}
          <GlassCard level={2} style={[s.exCardInner, { alignItems: 'center' }]}>
            <Text style={[s.exName, { color: palette.textPrimary }]}>{exercise.name}</Text>
            <Text style={[s.exMuscle, { color: palette.textSecondary }]}>{exercise.muscle}</Text>

            <View style={[s.exDivider, { backgroundColor: accent.primary }]} />

            {/* Reps / Set info */}
            <View style={s.exInfoRow}>
              <View style={s.exInfoItem}>
                <Text style={[s.exInfoVal, { color: palette.textPrimary }]}>{exercise.reps}</Text>
                <Text style={[s.exInfoLbl, { color: palette.textTertiary }]}>Reps</Text>
              </View>
              <View style={[s.exInfoDivider, { backgroundColor: palette.border }]} />
              <View style={s.exInfoItem}>
                <Text style={[s.exInfoVal, { color: palette.textPrimary }]}>{currentSet}/{exercise.sets}</Text>
                <Text style={[s.exInfoLbl, { color: palette.textTertiary }]}>Set</Text>
              </View>
              <View style={[s.exInfoDivider, { backgroundColor: palette.border }]} />
              <View style={s.exInfoItem}>
                <Text style={[s.exInfoVal, { color: palette.textPrimary }]}>{exercise.rest}s</Text>
                <Text style={[s.exInfoLbl, { color: palette.textTertiary }]}>Rest</Text>
              </View>
            </View>

            {/* Set dots */}
            <View style={s.setDots}>
              {Array.from({ length: exercise.sets }, (_, i) => (
                <View key={i} style={[
                  s.setDot,
                  { borderColor: palette.bg3, backgroundColor: palette.bg2 },
                  i < currentSet - 1 && { backgroundColor: accent.primary, borderColor: accent.primary },
                  i === currentSet - 1 && { borderColor: accent.primary, borderStyle: 'dashed' },
                ]} >
                  {i < currentSet - 1 && <Icon name="checkmark" size={10} color={palette.textInverse} />}
                </View>
              ))}
            </View>
          </GlassCard>

          {/* Up next */}
          {currentExIdx < exercises.length - 1 && (
            <View style={[s.upNext, { backgroundColor: palette.bg1, borderColor: palette.border }]}>
              <Text style={[s.upNextLabel, { color: palette.textTertiary }]}>Up Next</Text>
              <Text style={[s.upNextName, { color: palette.textPrimary }]}>{exercises[currentExIdx + 1].name}</Text>
              <Text style={[s.upNextMuscle, { color: palette.textSecondary }]}>{exercises[currentExIdx + 1].muscle}</Text>
            </View>
          )}

          {/* Running stats */}
          <View style={[s.statsRow, { backgroundColor: palette.bg1, borderColor: palette.border }]}>
            <View style={s.statItem}>
              <Icon name="checkmark-done-outline" size={16} color={accent.primary} />
              <Text style={[s.statVal, { color: palette.textPrimary }]}>{completedSets}/{totalSets}</Text>
              <Text style={[s.statLbl, { color: palette.textTertiary }]}>Sets</Text>
            </View>
            <View style={s.statItem}>
              <Icon name="flame-outline" size={16} color={accent.energy} />
              <Text style={[s.statVal, { color: palette.textPrimary }]}>~{Math.round(calBurn * progressPct)}</Text>
              <Text style={[s.statLbl, { color: palette.textTertiary }]}>Cal</Text>
            </View>
            <View style={s.statItem}>
              <Icon name="time-outline" size={16} color={accent.blue} />
              <Text style={[s.statVal, { color: palette.textPrimary }]}>{mins}:{secs.toString().padStart(2, '0')}</Text>
              <Text style={[s.statLbl, { color: palette.textTertiary }]}>Elapsed</Text>
            </View>
          </View>

        </ScrollView>
      )}

      {/* Bottom action */}
      {!resting && !paused && (
        <View style={[s.bottomBar, { backgroundColor: palette.bg0, borderTopColor: palette.border }]}>
          <TouchableOpacity style={[s.skipExBtn, { borderColor: palette.border, backgroundColor: palette.glass1Bg }]} onPress={handleSkipExercise} activeOpacity={0.7}>
            <Text style={[s.skipExText, { color: palette.textSecondary }]}>Skip Exercise</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.completeSetBtn, { backgroundColor: accent.primary }]} onPress={handleSetComplete} activeOpacity={0.85}>
            <Icon name="checkmark" size={22} color={palette.textInverse} />
            <Text style={[s.completeSetText, { color: palette.textInverse }]}>
              {currentSet === exercise.sets && currentExIdx === exercises.length - 1
                ? 'Finish Workout'
                : 'Complete Set'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  exitBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  topCenter: { alignItems: 'center' },
  topType: { fontSize: 12, fontWeight: '700' },
  topTimer: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  pauseBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },

  // Progress bar
  progressBarBg: { height: 3 },
  progressBarFill: { height: 3, borderRadius: 2 },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 120 },

  // Exercise counter
  exCounter: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: SPACING.md },

  // Exercise card inner
  exCardInner: { marginBottom: SPACING.md },
  exName: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center' },
  exMuscle: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  exDivider: { width: 40, height: 2, borderRadius: 1, marginVertical: SPACING.md },

  exInfoRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  exInfoItem: { flex: 1, alignItems: 'center', gap: 4 },
  exInfoVal: { fontSize: 22, fontWeight: '900' },
  exInfoLbl: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  exInfoDivider: { width: 1, height: 32 },

  // Set dots
  setDots: { flexDirection: 'row', gap: 8, marginTop: SPACING.lg },
  setDot: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },

  // Up next
  upNext: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1,
    marginBottom: SPACING.md,
  },
  upNextLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  upNextName: { fontSize: 16, fontWeight: '800' },
  upNextMuscle: { fontSize: 12, marginTop: 2 },

  // Stats row
  statsRow: {
    flexDirection: 'row', gap: 10,
    borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 16, fontWeight: '800' },
  statLbl: { fontSize: 11, fontWeight: '600' },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10,
    padding: SPACING.md, paddingBottom: SPACING.xl,
    borderTopWidth: 1,
  },
  skipExBtn: {
    paddingHorizontal: 20, paddingVertical: 16,
    borderRadius: RADIUS.full, borderWidth: 1,
    justifyContent: 'center',
  },
  skipExText: { fontSize: 14, fontWeight: '700' },
  completeSetBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: RADIUS.full,
    paddingVertical: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  completeSetText: { fontSize: 15, fontWeight: '800' },

  // Rest timer
  restOverlay: {
    ...StyleSheet.absoluteFillObject, top: 50,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  restCard: { alignItems: 'center', gap: 8 },
  restLabel: { fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  restTime: { fontSize: 72, fontWeight: '900', letterSpacing: -3 },
  restSec: { fontSize: 14, fontWeight: '600', marginTop: -8 },
  restBarBg: { width: 200, height: 4, borderRadius: 2, marginTop: SPACING.md },
  restBarFill: { height: 4, borderRadius: 2 },
  restBtns: { flexDirection: 'row', gap: 12, marginTop: SPACING.lg },
  restSkipBtn: {
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  restSkipText: { fontSize: 14, fontWeight: '700' },
  restExtendBtn: {
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  restExtendText: { fontSize: 14, fontWeight: '700' },

  // Paused
  pausedOverlay: {
    ...StyleSheet.absoluteFillObject, top: 50,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  pausedCard: { alignItems: 'center', gap: 12 },
  pausedText: { fontSize: 28, fontWeight: '900' },

  // Summary
  summaryContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.md },
  summaryCardInner: { width: '100%', alignItems: 'center', gap: 16 },
  summaryTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: '100%' },
  summaryStat: {
    flex: 1, minWidth: '40%', alignItems: 'center', gap: 4,
    borderRadius: RADIUS.md,
    paddingVertical: 14, borderWidth: 1,
  },
  summaryStatVal: { fontSize: 20, fontWeight: '900' },
  summaryStatLbl: { fontSize: 12, fontWeight: '600' },
  summaryPartial: { fontSize: 12, fontWeight: '600' },

  discardBtn: { paddingVertical: 10 },
  discardBtnText: { fontSize: 14, fontWeight: '600' },
});
