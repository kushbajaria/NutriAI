import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icon';
import { hapticSuccess, hapticMedium, hapticSelection } from '../utils/haptics';

// ── REST TIMER ────────────────────────────────────────────────────
function RestTimer({ seconds, onDone, onSkip }) {
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
    // Restart bar from current position with new remaining time
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
    <View style={s.restOverlay}>
      <View style={s.restCard}>
        <Text style={s.restLabel}>Rest</Text>
        <Animated.Text style={[s.restTime, { transform: [{ scale: pulseAnim }] }]}>
          {remaining}
        </Animated.Text>
        <Text style={s.restSec}>seconds</Text>

        {/* Progress bar — smooth */}
        <View style={s.restBarBg}>
          <Animated.View style={[s.restBarFill, { width: barWidth }]} />
        </View>

        <View style={s.restBtns}>
          <TouchableOpacity style={s.restSkipBtn} onPress={onSkip} activeOpacity={0.7}>
            <Text style={s.restSkipText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.restExtendBtn} onPress={handleExtend} activeOpacity={0.7}>
            <Text style={s.restExtendText}>+15s</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── WORKOUT SUMMARY ───────────────────────────────────────────────
function WorkoutSummary({ type, duration, calBurn, exercises, totalSets, completedSets, elapsedTime, onLog, onDiscard }) {
  const mins = Math.floor(elapsedTime / 60);
  const secs = elapsedTime % 60;
  const pctComplete = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 100;

  return (
    <View style={s.summaryContainer}>
      <View style={s.summaryCard}>
        <Icon name="checkmark-circle" size={48} color={C.accent} />
        <Text style={s.summaryTitle}>Workout Complete!</Text>

        <View style={s.summaryGrid}>
          <SummaryStat icon="time-outline" value={`${mins}:${secs.toString().padStart(2, '0')}`} label="Duration" color={C.blue} />
          <SummaryStat icon="flame-outline" value={`~${calBurn}`} label="Cal Burned" color={C.fat} />
          <SummaryStat icon="list-outline" value={exercises.length} label="Exercises" color={C.accent} />
          <SummaryStat icon="checkmark-done-outline" value={`${completedSets}/${totalSets}`} label="Sets Done" color={C.protein} />
        </View>

        {pctComplete < 100 && (
          <Text style={s.summaryPartial}>
            {pctComplete}% completed — partial workout
          </Text>
        )}

        <TouchableOpacity style={s.logBtn} onPress={onLog} activeOpacity={0.85}>
          <Icon name="checkmark" size={20} color={C.textInverse} />
          <Text style={s.logBtnText}>Log Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.discardBtn} onPress={onDiscard} activeOpacity={0.7}>
          <Text style={s.discardBtnText}>Discard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SummaryStat({ icon, value, label, color }) {
  return (
    <View style={s.summaryStat}>
      <Icon name={icon} size={18} color={color} />
      <Text style={s.summaryStatVal}>{value}</Text>
      <Text style={s.summaryStatLbl}>{label}</Text>
    </View>
  );
}

// ── ACTIVE WORKOUT SCREEN ─────────────────────────────────────────
export default function ActiveWorkoutScreen({ route, navigation }) {
  const { type, duration, calBurn, exercises } = route.params;
  const { logWorkout } = useApp();

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
      // More sets of this exercise — start rest timer
      setResting(true);
    } else if (currentExIdx < exercises.length - 1) {
      // Move to next exercise — start rest timer
      setResting(true);
    } else {
      // All done
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
      <SafeAreaView style={s.safe} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={C.black} />
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
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.black} />

      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={handleExit} style={s.exitBtn} accessibilityLabel="End workout">
          <Icon name="close" size={20} color={C.textSecondary} />
        </TouchableOpacity>

        <View style={s.topCenter}>
          <Text style={s.topType}>{type}</Text>
          <Text style={s.topTimer}>{mins}:{secs.toString().padStart(2, '0')}</Text>
        </View>

        <TouchableOpacity onPress={() => setPaused(p => !p)} style={s.pauseBtn} accessibilityLabel={paused ? 'Resume' : 'Pause'}>
          <Icon name={paused ? 'play' : 'pause'} size={18} color={C.accent} />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={s.progressBarBg}>
        <View style={[s.progressBarFill, { width: `${progressPct * 100}%` }]} />
      </View>

      {/* Paused overlay */}
      {paused && (
        <View style={s.pausedOverlay}>
          <View style={s.pausedCard}>
            <Icon name="pause-circle" size={48} color={C.accent} />
            <Text style={s.pausedText}>Paused</Text>
            <TouchableOpacity style={s.pausedResumeBtn} onPress={() => setPaused(false)} activeOpacity={0.85}>
              <Text style={s.pausedResumeBtnText}>Resume</Text>
            </TouchableOpacity>
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
          <Text style={s.exCounter}>
            Exercise {currentExIdx + 1} of {exercises.length}
          </Text>

          {/* Exercise card */}
          <View style={s.exCard}>
            <Text style={s.exName}>{exercise.name}</Text>
            <Text style={s.exMuscle}>{exercise.muscle}</Text>

            <View style={s.exDivider} />

            {/* Reps / Set info */}
            <View style={s.exInfoRow}>
              <View style={s.exInfoItem}>
                <Text style={s.exInfoVal}>{exercise.reps}</Text>
                <Text style={s.exInfoLbl}>Reps</Text>
              </View>
              <View style={s.exInfoDivider} />
              <View style={s.exInfoItem}>
                <Text style={s.exInfoVal}>{currentSet}/{exercise.sets}</Text>
                <Text style={s.exInfoLbl}>Set</Text>
              </View>
              <View style={s.exInfoDivider} />
              <View style={s.exInfoItem}>
                <Text style={s.exInfoVal}>{exercise.rest}s</Text>
                <Text style={s.exInfoLbl}>Rest</Text>
              </View>
            </View>

            {/* Set dots */}
            <View style={s.setDots}>
              {Array.from({ length: exercise.sets }, (_, i) => (
                <View key={i} style={[
                  s.setDot,
                  i < currentSet - 1 && s.setDotDone,
                  i === currentSet - 1 && s.setDotCurrent,
                ]} >
                  {i < currentSet - 1 && <Icon name="checkmark" size={10} color={C.textInverse} />}
                </View>
              ))}
            </View>
          </View>

          {/* Up next */}
          {currentExIdx < exercises.length - 1 && (
            <View style={s.upNext}>
              <Text style={s.upNextLabel}>Up Next</Text>
              <Text style={s.upNextName}>{exercises[currentExIdx + 1].name}</Text>
              <Text style={s.upNextMuscle}>{exercises[currentExIdx + 1].muscle}</Text>
            </View>
          )}

          {/* Running stats */}
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Icon name="checkmark-done-outline" size={16} color={C.accent} />
              <Text style={s.statVal}>{completedSets}/{totalSets}</Text>
              <Text style={s.statLbl}>Sets</Text>
            </View>
            <View style={s.statItem}>
              <Icon name="flame-outline" size={16} color={C.fat} />
              <Text style={s.statVal}>~{Math.round(calBurn * progressPct)}</Text>
              <Text style={s.statLbl}>Cal</Text>
            </View>
            <View style={s.statItem}>
              <Icon name="time-outline" size={16} color={C.blue} />
              <Text style={s.statVal}>{mins}:{secs.toString().padStart(2, '0')}</Text>
              <Text style={s.statLbl}>Elapsed</Text>
            </View>
          </View>

        </ScrollView>
      )}

      {/* Bottom action */}
      {!resting && !paused && (
        <View style={s.bottomBar}>
          <TouchableOpacity style={s.skipExBtn} onPress={handleSkipExercise} activeOpacity={0.7}>
            <Text style={s.skipExText}>Skip Exercise</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.completeSetBtn} onPress={handleSetComplete} activeOpacity={0.85}>
            <Icon name="checkmark" size={22} color={C.textInverse} />
            <Text style={s.completeSetText}>
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
  safe: { flex: 1, backgroundColor: C.black },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  exitBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.surface2, borderWidth: 1, borderColor: C.borderHi,
    alignItems: 'center', justifyContent: 'center',
  },
  topCenter: { alignItems: 'center' },
  topType: { fontSize: 12, fontWeight: '700', color: C.textSecondary },
  topTimer: { fontSize: 28, fontWeight: '900', color: C.textPrimary, letterSpacing: -1 },
  pauseBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.accentBg, borderWidth: 1, borderColor: C.accent + '30',
    alignItems: 'center', justifyContent: 'center',
  },

  // Progress bar
  progressBarBg: { height: 3, backgroundColor: C.surface2 },
  progressBarFill: { height: 3, backgroundColor: C.accent, borderRadius: 2 },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 120 },

  // Exercise counter
  exCounter: { fontSize: 12, fontWeight: '600', color: C.textTertiary, textAlign: 'center', marginBottom: SPACING.md },

  // Exercise card
  exCard: {
    backgroundColor: C.surface1, borderRadius: RADIUS.xl,
    padding: SPACING.lg, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', marginBottom: SPACING.md,
  },
  exName: { fontSize: 26, fontWeight: '900', color: C.textPrimary, letterSpacing: -0.5, textAlign: 'center' },
  exMuscle: { fontSize: 14, fontWeight: '600', color: C.textSecondary, marginTop: 4 },
  exDivider: { width: 40, height: 2, backgroundColor: C.accent, borderRadius: 1, marginVertical: SPACING.md },

  exInfoRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  exInfoItem: { flex: 1, alignItems: 'center', gap: 4 },
  exInfoVal: { fontSize: 22, fontWeight: '900', color: C.textPrimary },
  exInfoLbl: { fontSize: 10, fontWeight: '600', color: C.textTertiary, letterSpacing: 0.5 },
  exInfoDivider: { width: 1, height: 32, backgroundColor: C.border },

  // Set dots
  setDots: { flexDirection: 'row', gap: 8, marginTop: SPACING.lg },
  setDot: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: C.surface4,
    backgroundColor: C.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
  setDotDone: { backgroundColor: C.accent, borderColor: C.accent },
  setDotCurrent: { borderColor: C.accent, borderStyle: 'dashed' },

  // Up next
  upNext: {
    backgroundColor: C.surface1, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: C.border,
    marginBottom: SPACING.md,
  },
  upNextLabel: { fontSize: 10, fontWeight: '700', color: C.textTertiary, letterSpacing: 0.5, marginBottom: 4 },
  upNextName: { fontSize: 16, fontWeight: '800', color: C.textPrimary },
  upNextMuscle: { fontSize: 12, color: C.textSecondary, marginTop: 2 },

  // Stats row
  statsRow: {
    flexDirection: 'row', gap: 10,
    backgroundColor: C.surface1, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: C.border,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 16, fontWeight: '800', color: C.textPrimary },
  statLbl: { fontSize: 9, fontWeight: '600', color: C.textTertiary },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10,
    padding: SPACING.md, paddingBottom: SPACING.xl,
    backgroundColor: C.black,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  skipExBtn: {
    paddingHorizontal: 20, paddingVertical: 16,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: C.border,
    backgroundColor: C.surface1, justifyContent: 'center',
  },
  skipExText: { fontSize: 14, fontWeight: '700', color: C.textSecondary },
  completeSetBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: C.accent, borderRadius: RADIUS.full,
    paddingVertical: 16,
    ...SHADOW.accent,
  },
  completeSetText: { fontSize: 15, fontWeight: '800', color: C.textInverse },

  // Rest timer
  restOverlay: {
    ...StyleSheet.absoluteFillObject, top: 50,
    backgroundColor: C.black + 'E6',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  restCard: { alignItems: 'center', gap: 8 },
  restLabel: { fontSize: 14, fontWeight: '700', color: C.textTertiary, letterSpacing: 1 },
  restTime: { fontSize: 72, fontWeight: '900', color: C.accent, letterSpacing: -3 },
  restSec: { fontSize: 14, fontWeight: '600', color: C.textTertiary, marginTop: -8 },
  restBarBg: { width: 200, height: 4, backgroundColor: C.surface3, borderRadius: 2, marginTop: SPACING.md },
  restBarFill: { height: 4, backgroundColor: C.accent, borderRadius: 2 },
  restBtns: { flexDirection: 'row', gap: 12, marginTop: SPACING.lg },
  restSkipBtn: {
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: C.border,
    backgroundColor: C.surface1,
  },
  restSkipText: { fontSize: 14, fontWeight: '700', color: C.textSecondary },
  restExtendBtn: {
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: RADIUS.full, backgroundColor: C.accentBg,
    borderWidth: 1, borderColor: C.accent + '30',
  },
  restExtendText: { fontSize: 14, fontWeight: '700', color: C.accent },

  // Paused
  pausedOverlay: {
    ...StyleSheet.absoluteFillObject, top: 50,
    backgroundColor: C.black + 'E6',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  pausedCard: { alignItems: 'center', gap: 12 },
  pausedText: { fontSize: 28, fontWeight: '900', color: C.textPrimary },
  pausedResumeBtn: {
    paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: RADIUS.full, backgroundColor: C.accent,
    marginTop: 8, ...SHADOW.accent,
  },
  pausedResumeBtnText: { fontSize: 16, fontWeight: '800', color: C.textInverse },

  // Summary
  summaryContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.md },
  summaryCard: {
    width: '100%', backgroundColor: C.surface1, borderRadius: RADIUS.xl,
    padding: SPACING.lg, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', gap: 16,
  },
  summaryTitle: { fontSize: 24, fontWeight: '900', color: C.textPrimary, letterSpacing: -0.5 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: '100%' },
  summaryStat: {
    flex: 1, minWidth: '40%', alignItems: 'center', gap: 4,
    backgroundColor: C.surface2, borderRadius: RADIUS.md,
    paddingVertical: 14, borderWidth: 1, borderColor: C.border,
  },
  summaryStatVal: { fontSize: 20, fontWeight: '900', color: C.textPrimary },
  summaryStatLbl: { fontSize: 10, fontWeight: '600', color: C.textTertiary },
  summaryPartial: { fontSize: 12, fontWeight: '600', color: C.carbs },

  logBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', backgroundColor: C.accent, borderRadius: RADIUS.full,
    paddingVertical: 16, ...SHADOW.accent,
  },
  logBtnText: { fontSize: 16, fontWeight: '800', color: C.textInverse },
  discardBtn: { paddingVertical: 10 },
  discardBtnText: { fontSize: 14, fontWeight: '600', color: C.textTertiary },
});
