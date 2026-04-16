import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { CircularProgress, Card } from '../components/UI';
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
  const { user, waterData, waterGoalOz, addWater, removeWater, units } = useApp();
  const isMetric = units === 'Metric';
  const sizes = isMetric ? SIZES_METRIC : SIZES_IMPERIAL;

  const [weekWater, setWeekWater] = useState([]);

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
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.black} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} accessibilityLabel="Go back">
          <Icon name="chevron-back" size={22} color={C.blue} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Hydration</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Today's progress */}
        <Card style={s.progressCard}>
          <View style={{ alignItems: 'center' }}>
            <CircularProgress value={waterData.totalOz} max={waterGoalOz} size={160} color={C.blue}>
              {goalHit ? (
                <>
                  <Icon name="checkmark-circle" size={32} color={C.blue} />
                  <Text style={s.ringLabel}>Complete!</Text>
                </>
              ) : (
                <>
                  <Text style={s.ringValue}>{displayVol(waterData.totalOz)}</Text>
                  <Text style={s.ringGoal}>of {displayVol(waterGoalOz)}</Text>
                  <Text style={s.ringPct}>{Math.round(pct * 100)}%</Text>
                </>
              )}
            </CircularProgress>
          </View>

          <Text style={s.goalNote}>
            Goal based on your weight{waterGoalOz > 64 ? ' + workout boost' : ''}
          </Text>
        </Card>

        {/* Quick-add buttons */}
        <Text style={s.sectionTitle}>Quick Add</Text>
        <View style={s.sizeGrid}>
          {sizes.map(size => (
            <TouchableOpacity
              key={size.label}
              style={s.sizeBtn}
              onPress={() => addWater(size.label)}
              activeOpacity={0.7}
            >
              <Icon name={size.icon} size={22} color={C.blue} />
              <Text style={s.sizeName}>{size.label}</Text>
              <Text style={s.sizeVol}>{size.display}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Undo */}
        {waterData.entries.length > 0 && (
          <TouchableOpacity style={s.undoBtn} onPress={removeWater} activeOpacity={0.7}>
            <Icon name="arrow-undo-outline" size={14} color={C.textTertiary} />
            <Text style={s.undoText}>Undo last</Text>
          </TouchableOpacity>
        )}

        {/* Weekly chart */}
        {weekWater.length > 0 && (
          <>
            <Text style={s.sectionTitle}>This Week</Text>
            <Card style={s.weekCard}>
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
                          backgroundColor: isFuture ? C.surface3 : metGoal ? C.blue : C.blue + '40',
                          opacity: isFuture ? 0.25 : 1,
                          ...(isToday ? { borderWidth: 1, borderColor: C.blue } : {}),
                        }
                      ]} />
                      <Text style={[s.weekLabel, isToday && { color: C.blue }]}>{DAY_LABELS[i]}</Text>
                    </View>
                  );
                })}
              </View>
              {/* Goal line label */}
              <View style={s.goalLineRow}>
                <View style={s.goalLine} />
                <Text style={s.goalLineText}>Goal: {displayVol(waterGoalOz)}</Text>
              </View>
            </Card>
          </>
        )}

        {/* Today's entries */}
        <Text style={s.sectionTitle}>Today's Log</Text>
        {waterData.entries.length === 0 ? (
          <View style={s.emptyState}>
            <Icon name="water-outline" size={36} color={C.textTertiary} />
            <Text style={s.emptyText}>No drinks logged yet</Text>
          </View>
        ) : (
          [...waterData.entries].reverse().map((entry, i) => {
            const time = entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';
            return (
              <View key={i} style={s.entryRow}>
                <View style={s.entryDot} />
                <View style={{ flex: 1 }}>
                  <Text style={s.entryLabel}>{entry.label || 'Water'}</Text>
                  {time ? <Text style={s.entryTime}>{time}</Text> : null}
                </View>
                <Text style={s.entryVol}>{displayVol(entry.oz)}</Text>
              </View>
            );
          })
        )}

      </ScrollView>
    </SafeAreaView>
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

  // Progress card
  progressCard: { marginBottom: SPACING.md, alignItems: 'center' },
  ringValue: { fontSize: 20, fontWeight: '900', color: C.textPrimary, letterSpacing: -0.5 },
  ringGoal: { fontSize: 11, color: C.textTertiary, fontWeight: '500', marginTop: 2 },
  ringPct: { fontSize: 13, fontWeight: '800', color: C.blue, marginTop: 4 },
  ringLabel: { fontSize: 14, fontWeight: '800', color: C.blue, marginTop: 4 },
  goalNote: { fontSize: 11, color: C.textTertiary, textAlign: 'center', marginTop: SPACING.sm },

  // Section title
  sectionTitle: { fontSize: 13, fontWeight: '700', color: C.textSecondary, marginBottom: SPACING.sm, marginTop: SPACING.xs },

  // Size buttons
  sizeGrid: { flexDirection: 'row', gap: 10, marginBottom: SPACING.sm },
  sizeBtn: {
    flex: 1, alignItems: 'center', gap: 6,
    backgroundColor: C.surface1, borderRadius: RADIUS.lg,
    paddingVertical: 14, borderWidth: 1, borderColor: C.border,
  },
  sizeName: { fontSize: 12, fontWeight: '700', color: C.textPrimary },
  sizeVol: { fontSize: 10, fontWeight: '600', color: C.textTertiary },

  // Undo
  undoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'center', paddingVertical: 8, marginBottom: SPACING.md,
  },
  undoText: { fontSize: 12, color: C.textTertiary, fontWeight: '600' },

  // Week chart
  weekCard: { marginBottom: SPACING.lg },
  weekChart: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', height: 90 },
  weekBarWrap: { flex: 1, alignItems: 'center', gap: 6 },
  weekBar: { width: '100%', borderRadius: 5, minHeight: 4 },
  weekLabel: { fontSize: 10, color: C.textTertiary, fontWeight: '600' },
  goalLineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  goalLine: { flex: 1, height: 1, backgroundColor: C.blue + '30' },
  goalLineText: { fontSize: 10, color: C.textTertiary, fontWeight: '600' },

  // Entries
  entryRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surface1, borderRadius: RADIUS.md,
    padding: 14, marginBottom: 6,
    borderWidth: 1, borderColor: C.border,
  },
  entryDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.blue },
  entryLabel: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  entryTime: { fontSize: 11, color: C.textTertiary, marginTop: 1 },
  entryVol: { fontSize: 14, fontWeight: '800', color: C.blue },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xl, gap: 8 },
  emptyText: { fontSize: 14, fontWeight: '600', color: C.textTertiary },
});
