import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RADIUS, SPACING } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { GlassCard, GradientRing, BlurHeader } from '../components';
import Icon from '../components/Icon';
import { getWaterWeek } from '../services/firestore';

const SIZES_IMPERIAL = [
  { label: 'Small',  oz: 8,  display: '8 oz',    icon: 'water-outline' },
  { label: 'Glass',  oz: 12, display: '12 oz',   icon: 'water' },
  { label: 'Bottle', oz: 16, display: '16 oz',   icon: 'flask-outline' },
  { label: 'Large',  oz: 32, display: '32 oz',   icon: 'beaker-outline' },
];

const SIZES_METRIC = [
  { label: 'Small',  oz: 8,  display: '250 ml',  icon: 'water-outline' },
  { label: 'Glass',  oz: 12, display: '350 ml',  icon: 'water' },
  { label: 'Bottle', oz: 16, display: '500 ml',  icon: 'flask-outline' },
  { label: 'Large',  oz: 32, display: '1 L',     icon: 'beaker-outline' },
];

export default function WaterScreen({ navigation }) {
  const { mode, palette, accent, gradients } = useTheme();
  const { user, waterData, waterGoalOz, addWater, removeWater, units } = useApp();
  const isMetric = units === 'Metric';
  const sizes = isMetric ? SIZES_METRIC : SIZES_IMPERIAL;

  const [weekWater, setWeekWater] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (user?.uid) getWaterWeek(user.uid).then(setWeekWater).catch(() => {}).finally(() => setRefreshing(false));
    else setTimeout(() => setRefreshing(false), 800);
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    getWaterWeek(user.uid).then(setWeekWater).catch(() => {});
  }, [user?.uid, waterData.totalOz]);

  const displayVol = useCallback((oz) => {
    if (isMetric) return `${Math.round(oz * 29.5735)} ml`;
    return `${oz} oz`;
  }, [isMetric]);

  const pct = waterGoalOz > 0 ? Math.min(waterData.totalOz / waterGoalOz, 1) : 0;
  const goalHit = pct >= 1;

  // Week chart
  const maxWeekOz = useMemo(() => Math.max(...weekWater.map(d => d.totalOz), waterGoalOz, 1), [weekWater, waterGoalOz]);
  const DAY_LABELS = ['M','T','W','T','F','S','S'];

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <BlurHeader
        title="Hydration"
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent.hydration} />}>

        {/* Today's progress */}
        <GlassCard level={1} style={s.progressCard}>
          <View style={{ alignItems: 'center' }}>
            <GradientRing value={waterData.totalOz} max={waterGoalOz} size={160} gradient={gradients.hydration}>
              {goalHit ? (
                <>
                  <Icon name="checkmark-circle" size={32} color={accent.hydration} />
                  <Text style={[s.ringLabel, { color: accent.hydration }]}>Complete!</Text>
                </>
              ) : (
                <>
                  <Text style={[s.ringValue, { color: palette.textPrimary }]}>{displayVol(waterData.totalOz)}</Text>
                  <Text style={[s.ringGoal, { color: palette.textTertiary }]}>of {displayVol(waterGoalOz)}</Text>
                  <Text style={[s.ringPct, { color: accent.hydration }]}>{Math.round(pct * 100)}%</Text>
                </>
              )}
            </GradientRing>
          </View>

          <Text style={[s.goalNote, { color: palette.textTertiary }]}>
            Goal based on your weight{waterGoalOz > 64 ? ' + workout boost' : ''}
          </Text>
        </GlassCard>

        {/* Quick-add buttons */}
        <Text style={[s.sectionTitle, { color: palette.textSecondary }]}>Quick Add</Text>
        <View style={s.sizeGrid}>
          {sizes.map(size => (
            <TouchableOpacity
              key={size.label}
              style={[s.sizeBtn, { backgroundColor: palette.glass1Bg, borderColor: palette.glass1Border }]}
              onPress={() => addWater(size.label)}
              activeOpacity={0.7}
            >
              <Icon name={size.icon} size={22} color={accent.hydration} />
              <Text style={[s.sizeName, { color: palette.textPrimary }]}>{size.label}</Text>
              <Text style={[s.sizeVol, { color: palette.textTertiary }]}>{size.display}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Undo */}
        {waterData.entries.length > 0 && (
          <TouchableOpacity style={s.undoBtn} onPress={removeWater} activeOpacity={0.7}>
            <Icon name="arrow-undo-outline" size={14} color={palette.textTertiary} />
            <Text style={[s.undoText, { color: palette.textTertiary }]}>Undo last</Text>
          </TouchableOpacity>
        )}

        {/* Weekly chart */}
        {weekWater.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { color: palette.textSecondary }]}>This Week</Text>
            <GlassCard level={1} style={s.weekCard}>
              <View style={s.weekChart}>
                {weekWater.map((d, i) => {
                  const h = maxWeekOz > 0 ? (d.totalOz / maxWeekOz) * 100 : 0;
                  const metGoal = d.totalOz >= waterGoalOz;
                  const now = new Date();
                  const todayIdx = (now.getDay() === 0 ? 6 : now.getDay() - 1);
                  const isToday = i === todayIdx;
                  const isFuture = i > todayIdx;
                  return (
                    <View key={i} style={s.weekBarWrap}>
                      <View style={[
                        s.weekBar,
                        {
                          height: h * 0.7,
                          backgroundColor: isFuture ? palette.bg3 : metGoal ? accent.hydration : accent.hydration + '40',
                          opacity: isFuture ? 0.25 : 1,
                          ...(isToday ? { borderWidth: 1, borderColor: accent.hydration } : {}),
                        }
                      ]} />
                      <Text style={[s.weekLabel, { color: isToday ? accent.hydration : palette.textTertiary }]}>{DAY_LABELS[i]}</Text>
                    </View>
                  );
                })}
              </View>
              {/* Goal line label */}
              <View style={s.goalLineRow}>
                <View style={[s.goalLine, { backgroundColor: accent.hydration + '30' }]} />
                <Text style={[s.goalLineText, { color: palette.textTertiary }]}>Goal: {displayVol(waterGoalOz)}</Text>
              </View>
            </GlassCard>
          </>
        )}

        {/* Today's entries */}
        <Text style={[s.sectionTitle, { color: palette.textSecondary }]}>Today's Log</Text>
        {waterData.entries.length === 0 ? (
          <View style={s.emptyState}>
            <Icon name="water-outline" size={36} color={palette.textTertiary} />
            <Text style={[s.emptyText, { color: palette.textTertiary }]}>No drinks logged yet</Text>
          </View>
        ) : (
          [...waterData.entries].reverse().map((entry, i) => {
            const time = entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';
            return (
              <View key={i} style={[s.entryRow, { backgroundColor: palette.bg1, borderColor: palette.border }]}>
                <View style={[s.entryDot, { backgroundColor: accent.hydration }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.entryLabel, { color: palette.textPrimary }]}>{entry.label || 'Water'}</Text>
                  {time ? <Text style={[s.entryTime, { color: palette.textTertiary }]}>{time}</Text> : null}
                </View>
                <Text style={[s.entryVol, { color: accent.hydration }]}>{displayVol(entry.oz)}</Text>
              </View>
            );
          })
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },

  // Progress card
  progressCard: { marginBottom: SPACING.md, alignItems: 'center' },
  ringValue: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  ringGoal: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  ringPct: { fontSize: 13, fontWeight: '800', marginTop: 4 },
  ringLabel: { fontSize: 14, fontWeight: '800', marginTop: 4 },
  goalNote: { fontSize: 11, textAlign: 'center', marginTop: SPACING.sm },

  // Section title
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: SPACING.sm, marginTop: SPACING.xs },

  // Size buttons
  sizeGrid: { flexDirection: 'row', gap: 10, marginBottom: SPACING.sm },
  sizeBtn: {
    flex: 1, alignItems: 'center', gap: 6,
    borderRadius: RADIUS.lg,
    paddingVertical: 14, borderWidth: 1,
  },
  sizeName: { fontSize: 12, fontWeight: '700' },
  sizeVol: { fontSize: 12, fontWeight: '600' },

  // Undo
  undoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'center', paddingVertical: 8, marginBottom: SPACING.md,
  },
  undoText: { fontSize: 12, fontWeight: '600' },

  // Week chart
  weekCard: { marginBottom: SPACING.lg },
  weekChart: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', height: 90 },
  weekBarWrap: { flex: 1, alignItems: 'center', gap: 6 },
  weekBar: { width: '100%', borderRadius: 5, minHeight: 4 },
  weekLabel: { fontSize: 11, fontWeight: '600' },
  goalLineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  goalLine: { flex: 1, height: 1 },
  goalLineText: { fontSize: 11, fontWeight: '600' },

  // Entries
  entryRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: RADIUS.md,
    padding: 14, marginBottom: 6,
    borderWidth: 1,
  },
  entryDot: { width: 8, height: 8, borderRadius: 4 },
  entryLabel: { fontSize: 14, fontWeight: '600' },
  entryTime: { fontSize: 11, marginTop: 1 },
  entryVol: { fontSize: 14, fontWeight: '800' },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xl, gap: 8 },
  emptyText: { fontSize: 14, fontWeight: '600' },
});
