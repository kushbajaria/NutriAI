import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { GlassCard, GradientButton, BlurHeader, LineChart, BarChart } from '../components';
import Icon from '../components/Icon';
import { SPACING, RADIUS } from '../constants/theme';
import { getMealsForRange, getWeightForRange } from '../services/firestore';

const RANGES = ['7D', '30D', '90D'];
const RANGE_DAYS = { '7D': 7, '30D': 30, '90D': 90 };
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDateShort(date) {
  return `${MONTH_LABELS[date.getMonth()]} ${date.getDate()}`;
}

function getDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export default function AnalyticsScreen({ navigation }) {
  const { mode, palette, accent, gradients } = useTheme();
  const { isPro } = useSubscription();
  const { user } = useAuth();
  const { calGoal } = useApp();

  const [range, setRange] = useState('7D');
  const [meals, setMeals] = useState([]);
  const [weights, setWeights] = useState([]);
  const [loading, setLoading] = useState(true);

  // Compute date boundaries
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - RANGE_DAYS[range] + 1);
    start.setHours(0, 0, 0, 0);
    return { startDate: start, endDate: end };
  }, [range]);

  // Fetch data for range
  useEffect(() => {
    if (!user?.uid || !isPro) return;
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const [m, w] = await Promise.all([
          getMealsForRange(user.uid, startDate, endDate),
          getWeightForRange(user.uid, startDate.getTime()),
        ]);
        if (!cancelled) {
          setMeals(m);
          setWeights(w);
        }
      } catch (err) {
        console.warn('Analytics fetch error:', err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user?.uid, isPro, startDate, endDate]);

  // Aggregate meals by day
  const { dailyData, avgCal, avgProtein, daysTracked } = useMemo(() => {
    const days = RANGE_DAYS[range];
    const buckets = {};

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      buckets[getDateKey(d)] = { date: d, cal: 0, protein: 0, carbs: 0, fat: 0, count: 0 };
    }

    meals.forEach(m => {
      const mDate = m.loggedAt?.toDate ? m.loggedAt.toDate() : new Date(m.loggedAt);
      const key = getDateKey(mDate);
      if (buckets[key]) {
        buckets[key].cal += m.cal || 0;
        buckets[key].protein += m.protein || 0;
        buckets[key].carbs += m.carbs || 0;
        buckets[key].fat += m.fat || 0;
        buckets[key].count++;
      }
    });

    const daily = Object.values(buckets).sort((a, b) => a.date - b.date);
    const tracked = daily.filter(d => d.count > 0);
    const totalCal = tracked.reduce((a, d) => a + d.cal, 0);
    const totalProtein = tracked.reduce((a, d) => a + d.protein, 0);

    return {
      dailyData: daily,
      avgCal: tracked.length > 0 ? Math.round(totalCal / tracked.length) : 0,
      avgProtein: tracked.length > 0 ? Math.round(totalProtein / tracked.length) : 0,
      daysTracked: tracked.length,
    };
  }, [meals, range, startDate]);

  // Weight change
  const weightChange = useMemo(() => {
    if (weights.length < 2) return null;
    const first = weights[0].value;
    const last = weights[weights.length - 1].value;
    return { change: +(last - first).toFixed(1), unit: weights[0].unit || 'lbs' };
  }, [weights]);

  // Calorie chart data
  const calChartData = useMemo(() => {
    if (range === '90D') {
      const weeks = [];
      for (let i = 0; i < dailyData.length; i += 7) {
        const week = dailyData.slice(i, i + 7);
        const tracked = week.filter(d => d.count > 0);
        const avg = tracked.length > 0 ? Math.round(tracked.reduce((a, d) => a + d.cal, 0) / tracked.length) : 0;
        weeks.push({ y: avg });
      }
      return weeks;
    }
    return dailyData.map(d => ({ y: d.cal }));
  }, [dailyData, range]);

  // X-axis labels
  const calXLabels = useMemo(() => {
    if (range === '7D') return dailyData.map(d => DAY_LABELS[d.date.getDay()]);
    if (range === '90D') {
      const labels = [];
      for (let i = 0; i < dailyData.length; i += 7) {
        labels.push(formatDateShort(dailyData[i].date));
      }
      return labels;
    }
    return dailyData.map((d, i) => i % 5 === 0 ? `${d.date.getDate()}` : '');
  }, [dailyData, range]);

  // Macro stacked bar data
  const macroBarData = useMemo(() => {
    if (range === '90D') {
      const weeks = [];
      for (let i = 0; i < dailyData.length; i += 7) {
        const week = dailyData.slice(i, i + 7);
        const tracked = week.filter(d => d.count > 0);
        const len = tracked.length || 1;
        weeks.push({
          values: [
            Math.round(tracked.reduce((a, d) => a + d.protein, 0) / len),
            Math.round(tracked.reduce((a, d) => a + d.carbs, 0) / len),
            Math.round(tracked.reduce((a, d) => a + d.fat, 0) / len),
          ],
        });
      }
      return weeks;
    }
    return dailyData.map(d => ({ values: [d.protein, d.carbs, d.fat] }));
  }, [dailyData, range]);

  // Weight chart
  const weightChartData = useMemo(() => weights.map(w => ({ y: w.value })), [weights]);
  const weightXLabels = useMemo(() => weights.map(w => {
    const d = new Date(w.timestamp);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }), [weights]);

  // ── Premium gate ────────────────────────────────────────────────
  if (!isPro) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
        <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
        <BlurHeader title="Analytics" onBack={() => navigation.goBack()} />
        <View style={s.gateContent}>
          <GlassCard level={2} style={s.gateCard}>
            <View style={[s.iconWrap, { backgroundColor: accent.blue + '15' }]}>
              <Icon name="bar-chart-outline" size={32} color={accent.blue} />
            </View>
            <Text style={[s.gateTitle, { color: palette.textPrimary }]}>Analytics</Text>
            <Text style={[s.gateSub, { color: palette.textSecondary }]}>
              Trend charts for weight, macros, and calories over 7, 30, and 90 days.
            </Text>
          </GlassCard>
          <GradientButton
            label="Unlock with Pro"
            gradient={gradients.premium}
            icon="sparkles"
            onPress={() => navigation.navigate('Paywall')}
            style={s.gateCta}
          />
        </View>
      </SafeAreaView>
    );
  }

  const hasData = daysTracked > 0;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <BlurHeader title="Analytics" onBack={() => navigation.goBack()} />

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Time range selector */}
        <View style={s.rangeRow}>
          {RANGES.map(r => (
            <TouchableOpacity
              key={r}
              style={[
                s.rangeChip,
                { backgroundColor: palette.bg2, borderColor: palette.border },
                range === r && { backgroundColor: accent.primaryBg, borderColor: accent.primary },
              ]}
              onPress={() => setRange(r)}
              activeOpacity={0.7}
            >
              <Text style={[
                s.rangeText,
                { color: palette.textSecondary },
                range === r && { color: accent.primary, fontWeight: '700' },
              ]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator size="large" color={accent.primary} />
          </View>
        ) : !hasData ? (
          <View style={s.emptyWrap}>
            <Icon name="bar-chart-outline" size={40} color={palette.textTertiary} />
            <Text style={[s.emptyText, { color: palette.textSecondary }]}>No data yet</Text>
            <Text style={[s.emptySub, { color: palette.textTertiary }]}>
              Log meals to see your analytics here
            </Text>
          </View>
        ) : (
          <>
            {/* Summary stats */}
            <GlassCard level={1} style={s.statsCard}>
              <View style={s.statsRow}>
                <View style={s.stat}>
                  <Text style={[s.statVal, { color: palette.textPrimary }]}>{avgCal}</Text>
                  <Text style={[s.statLabel, { color: palette.textTertiary }]}>Avg Cal</Text>
                </View>
                <View style={s.stat}>
                  <Text style={[s.statVal, { color: palette.textPrimary }]}>{avgProtein}g</Text>
                  <Text style={[s.statLabel, { color: palette.textTertiary }]}>Avg Protein</Text>
                </View>
                <View style={s.stat}>
                  <Text style={[s.statVal, { color: palette.textPrimary }]}>{daysTracked}</Text>
                  <Text style={[s.statLabel, { color: palette.textTertiary }]}>Days Tracked</Text>
                </View>
                {weightChange && (
                  <View style={s.stat}>
                    <Text style={[s.statVal, { color: weightChange.change <= 0 ? accent.primary : accent.energy }]}>
                      {weightChange.change > 0 ? '+' : ''}{weightChange.change}
                    </Text>
                    <Text style={[s.statLabel, { color: palette.textTertiary }]}>{weightChange.unit}</Text>
                  </View>
                )}
              </View>
            </GlassCard>

            {/* Calorie trend */}
            <GlassCard level={1} style={s.chartCard}>
              <Text style={[s.chartTitle, { color: palette.textPrimary }]}>Calorie Trend</Text>
              <LineChart
                data={calChartData}
                height={150}
                color={accent.primary}
                goalLine={calGoal}
                xLabels={calXLabels}
                fillGradient
              />
              <View style={s.legendRow}>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: accent.primary }]} />
                  <Text style={[s.legendText, { color: palette.textTertiary }]}>Calories</Text>
                </View>
                <View style={s.legendItem}>
                  <View style={[s.legendDash, { borderColor: accent.primary }]} />
                  <Text style={[s.legendText, { color: palette.textTertiary }]}>Goal ({calGoal})</Text>
                </View>
              </View>
            </GlassCard>

            {/* Macro breakdown */}
            <GlassCard level={1} style={s.chartCard}>
              <Text style={[s.chartTitle, { color: palette.textPrimary }]}>Macro Breakdown</Text>
              <BarChart
                data={macroBarData}
                height={130}
                stacked
                stackColors={[accent.protein, accent.carbs, accent.fat]}
                xLabels={calXLabels}
              />
              <View style={s.legendRow}>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: accent.protein }]} />
                  <Text style={[s.legendText, { color: palette.textTertiary }]}>Protein</Text>
                </View>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: accent.carbs }]} />
                  <Text style={[s.legendText, { color: palette.textTertiary }]}>Carbs</Text>
                </View>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: accent.fat }]} />
                  <Text style={[s.legendText, { color: palette.textTertiary }]}>Fat</Text>
                </View>
              </View>
            </GlassCard>

            {/* Weight trend */}
            {weights.length >= 2 && weightChange && (
              <GlassCard level={1} style={s.chartCard}>
                <View style={s.chartTitleRow}>
                  <Text style={[s.chartTitle, { color: palette.textPrimary }]}>Weight Trend</Text>
                  <Text style={[s.chartBadge, {
                    color: weightChange.change <= 0 ? accent.primary : accent.energy,
                    backgroundColor: (weightChange.change <= 0 ? accent.primary : accent.energy) + '15',
                  }]}>
                    {weightChange.change > 0 ? '+' : ''}{weightChange.change} {weightChange.unit}
                  </Text>
                </View>
                <LineChart
                  data={weightChartData}
                  height={140}
                  color={accent.blue}
                  xLabels={weightXLabels}
                  fillGradient
                />
              </GlassCard>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },

  // Premium gate
  gateContent: { flex: 1, justifyContent: 'center', padding: SPACING.md },
  gateCard: { alignItems: 'center', marginBottom: 20 },
  iconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  gateTitle: { fontSize: 22, fontWeight: '900', marginBottom: 8 },
  gateSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  gateCta: { marginTop: 4 },

  // Range selector
  rangeRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.md },
  rangeChip: { flex: 1, paddingVertical: 10, borderRadius: RADIUS.full, borderWidth: 1, alignItems: 'center' },
  rangeText: { fontSize: 14, fontWeight: '600' },

  // Loading / Empty
  loadingWrap: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700' },
  emptySub: { fontSize: 13, textAlign: 'center' },

  // Stats
  statsCard: { marginBottom: SPACING.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', gap: 4 },
  statVal: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },

  // Charts
  chartCard: { marginBottom: SPACING.md },
  chartTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  chartTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  chartBadge: { fontSize: 13, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.sm, overflow: 'hidden' },

  // Legend
  legendRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendDash: { width: 12, height: 0, borderTopWidth: 2, borderStyle: 'dashed' },
  legendText: { fontSize: 12, fontWeight: '600' },
});
