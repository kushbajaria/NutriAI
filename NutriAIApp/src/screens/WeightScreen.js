import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { PillButton } from '../components/UI';
import Icon from '../components/Icon';
import { logWeight, subscribeWeightLog } from '../services/firestore';
import { hapticSuccess } from '../utils/haptics';

export default function WeightScreen({ navigation }) {
  const { user, profile } = useApp();
  const units = profile?.units || 'Imperial';
  const weightUnit = units === 'Imperial' ? 'lbs' : 'kg';

  const [input, setInput] = useState('');
  const [weightLog, setWeightLog] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeWeightLog(user.uid, (entries) => {
      setWeightLog(entries);
    });
    return unsub;
  }, [user?.uid]);

  const handleLog = useCallback(async () => {
    const num = parseFloat(input);
    if (!input || isNaN(num) || num <= 0 || num > 1000) {
      Alert.alert('Invalid weight', 'Please enter a valid weight.');
      return;
    }
    setSaving(true);
    try {
      await logWeight(user.uid, { value: num, unit: weightUnit });
      hapticSuccess();
      setInput('');
    } catch (err) {
      Alert.alert('Error', 'Could not save weight. Try again.');
    } finally {
      setSaving(false);
    }
  }, [input, user?.uid, weightUnit]);

  // Trend calculation
  const sorted = [...weightLog].sort((a, b) => b.timestamp - a.timestamp);
  const latest = sorted[0];
  const previous = sorted[1];
  const trend = latest && previous ? latest.value - previous.value : null;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.black} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} accessibilityLabel="Go back">
          <Icon name="chevron-back" size={22} color={C.accent} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Weight</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Current weight card */}
        <View style={s.currentCard}>
          <Text style={s.currentLabel}>Current Weight</Text>
          <View style={s.currentRow}>
            <Text style={s.currentValue}>
              {latest ? latest.value.toFixed(1) : '--'}
            </Text>
            <Text style={s.currentUnit}>{weightUnit}</Text>
          </View>
          {trend !== null && (
            <View style={s.trendRow}>
              <Icon
                name={trend > 0 ? 'arrow-up' : trend < 0 ? 'arrow-down' : 'remove'}
                size={14}
                color={trend > 0 ? C.red : trend < 0 ? C.accent : C.textTertiary}
              />
              <Text style={[s.trendText, { color: trend > 0 ? C.red : trend < 0 ? C.accent : C.textTertiary }]}>
                {Math.abs(trend).toFixed(1)} {weightUnit} from last entry
              </Text>
            </View>
          )}
        </View>

        {/* Log weight input */}
        <View style={s.inputCard}>
          <Text style={s.inputLabel}>Log Weight</Text>
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              placeholder={`e.g. ${units === 'Imperial' ? '165' : '75'}`}
              placeholderTextColor={C.textTertiary}
              value={input}
              onChangeText={setInput}
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
            <Text style={s.inputUnit}>{weightUnit}</Text>
          </View>
          <PillButton
            label={saving ? 'Saving...' : 'Log Weight'}
            onPress={handleLog}
            disabled={saving || !input}
            style={{ marginTop: SPACING.sm }}
          />
        </View>

        {/* History */}
        <Text style={s.historyTitle}>History</Text>
        {sorted.length === 0 ? (
          <View style={s.emptyState}>
            <Icon name="scale-outline" size={40} color={C.textTertiary} />
            <Text style={s.emptyText}>No entries yet</Text>
            <Text style={s.emptySub}>Log your weight to start tracking</Text>
          </View>
        ) : (
          sorted.map((entry, i) => {
            const date = new Date(entry.timestamp);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const prev = sorted[i + 1];
            const diff = prev ? entry.value - prev.value : null;

            return (
              <View key={entry.id || i} style={s.historyRow}>
                <View style={s.historyDot} />
                <View style={{ flex: 1 }}>
                  <Text style={s.historyDate}>{dateStr}</Text>
                </View>
                <Text style={s.historyValue}>{entry.value.toFixed(1)} {entry.unit || weightUnit}</Text>
                {diff !== null && (
                  <Text style={[s.historyDiff, { color: diff > 0 ? C.red : diff < 0 ? C.accent : C.textTertiary }]}>
                    {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                  </Text>
                )}
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

  // Current weight
  currentCard: {
    backgroundColor: C.surface1, borderRadius: RADIUS.xl,
    padding: SPACING.lg, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', marginBottom: SPACING.md,
  },
  currentLabel: { fontSize: 13, fontWeight: '600', color: C.textSecondary, marginBottom: 8 },
  currentRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  currentValue: { fontSize: 48, fontWeight: '900', color: C.textPrimary, letterSpacing: -2 },
  currentUnit: { fontSize: 16, fontWeight: '600', color: C.textSecondary },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  trendText: { fontSize: 13, fontWeight: '600' },

  // Input
  inputCard: {
    backgroundColor: C.surface1, borderRadius: RADIUS.xl,
    padding: SPACING.md, borderWidth: 1, borderColor: C.border,
    marginBottom: SPACING.lg,
  },
  inputLabel: { fontSize: 13, fontWeight: '600', color: C.textSecondary, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    flex: 1, backgroundColor: C.surface2, borderRadius: RADIUS.md,
    paddingHorizontal: 16, paddingVertical: 14,
    color: C.textPrimary, fontSize: 18, fontWeight: '700',
    borderWidth: 1, borderColor: C.border,
  },
  inputUnit: { fontSize: 16, fontWeight: '600', color: C.textTertiary },

  // History
  historyTitle: { fontSize: 13, fontWeight: '600', color: C.textSecondary, marginBottom: SPACING.sm },
  historyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surface1, borderRadius: RADIUS.md,
    padding: 14, marginBottom: 6,
    borderWidth: 1, borderColor: C.border,
  },
  historyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.accent },
  historyDate: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  historyValue: { fontSize: 15, fontWeight: '800', color: C.textPrimary },
  historyDiff: { fontSize: 12, fontWeight: '700', width: 44, textAlign: 'right' },

  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: C.textSecondary },
  emptySub: { fontSize: 13, color: C.textTertiary },
});
