import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RADIUS, SPACING } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { GlassCard, GradientButton, BlurHeader } from '../components';
import Icon from '../components/Icon';
import { logWeight, subscribeWeightLog } from '../services/firestore';
import { hapticSuccess } from '../utils/haptics';

export default function WeightScreen({ navigation }) {
  const { mode, palette, accent } = useTheme();
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
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <BlurHeader
        title="Weight"
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Current weight card */}
        <GlassCard level={2} style={s.currentCard}>
          <Text style={[s.currentLabel, { color: palette.textSecondary }]}>Current Weight</Text>
          <View style={s.currentRow}>
            <Text style={[s.currentValue, { color: palette.textPrimary }]}>
              {latest ? latest.value.toFixed(1) : '--'}
            </Text>
            <Text style={[s.currentUnit, { color: palette.textSecondary }]}>{weightUnit}</Text>
          </View>
          {trend !== null && (
            <View style={s.trendRow}>
              <Icon
                name={trend > 0 ? 'arrow-up' : trend < 0 ? 'arrow-down' : 'remove'}
                size={14}
                color={trend > 0 ? accent.red : trend < 0 ? accent.green : palette.textTertiary}
              />
              <Text style={[s.trendText, { color: trend > 0 ? accent.red : trend < 0 ? accent.green : palette.textTertiary }]}>
                {Math.abs(trend).toFixed(1)} {weightUnit} from last entry
              </Text>
            </View>
          )}
        </GlassCard>

        {/* Log weight input */}
        <GlassCard level={1} style={s.inputCard}>
          <Text style={[s.inputLabel, { color: palette.textSecondary }]}>Log Weight</Text>
          <View style={s.inputRow}>
            <TextInput
              style={[s.input, { backgroundColor: palette.bg2, color: palette.textPrimary, borderColor: palette.border }]}
              placeholder={`e.g. ${units === 'Imperial' ? '165' : '75'}`}
              placeholderTextColor={palette.textTertiary}
              value={input}
              onChangeText={setInput}
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
            <Text style={[s.inputUnit, { color: palette.textTertiary }]}>{weightUnit}</Text>
          </View>
          <GradientButton
            label={saving ? 'Saving...' : 'Log Weight'}
            onPress={handleLog}
            disabled={saving || !input}
            style={{ marginTop: SPACING.sm }}
          />
        </GlassCard>

        {/* History */}
        <Text style={[s.historyTitle, { color: palette.textSecondary }]}>History</Text>
        {sorted.length === 0 ? (
          <View style={s.emptyState}>
            <Icon name="scale-outline" size={40} color={palette.textTertiary} />
            <Text style={[s.emptyText, { color: palette.textSecondary }]}>No entries yet</Text>
            <Text style={[s.emptySub, { color: palette.textTertiary }]}>Log your weight to start tracking</Text>
          </View>
        ) : (
          sorted.map((entry, i) => {
            const date = new Date(entry.timestamp);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const prev = sorted[i + 1];
            const diff = prev ? entry.value - prev.value : null;

            return (
              <View key={entry.id || i} style={[s.historyRow, { backgroundColor: palette.bg1, borderColor: palette.border }]}>
                <View style={[s.historyDot, { backgroundColor: accent.primary }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.historyDate, { color: palette.textPrimary }]}>{dateStr}</Text>
                </View>
                <Text style={[s.historyValue, { color: palette.textPrimary }]}>{entry.value.toFixed(1)} {entry.unit || weightUnit}</Text>
                {diff !== null && (
                  <Text style={[s.historyDiff, { color: diff > 0 ? accent.red : diff < 0 ? accent.green : palette.textTertiary }]}>
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
  safe: { flex: 1 },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },

  // Current weight
  currentCard: {
    alignItems: 'center', marginBottom: SPACING.md,
  },
  currentLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  currentRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  currentValue: { fontSize: 48, fontWeight: '900', letterSpacing: -2 },
  currentUnit: { fontSize: 16, fontWeight: '600' },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  trendText: { fontSize: 13, fontWeight: '600' },

  // Input
  inputCard: {
    marginBottom: SPACING.lg,
  },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    flex: 1, borderRadius: RADIUS.md,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 18, fontWeight: '700',
    borderWidth: 1,
  },
  inputUnit: { fontSize: 16, fontWeight: '600' },

  // History
  historyTitle: { fontSize: 13, fontWeight: '600', marginBottom: SPACING.sm },
  historyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: RADIUS.md,
    padding: 14, marginBottom: 6,
    borderWidth: 1,
  },
  historyDot: { width: 8, height: 8, borderRadius: 4 },
  historyDate: { fontSize: 14, fontWeight: '600' },
  historyValue: { fontSize: 15, fontWeight: '800' },
  historyDiff: { fontSize: 12, fontWeight: '700', width: 44, textAlign: 'right' },

  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700' },
  emptySub: { fontSize: 13 },
});
