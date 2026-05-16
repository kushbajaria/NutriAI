import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { GlassCard, GradientButton, BlurHeader } from '../components';
import Icon from '../components/Icon';
import { SPACING, RADIUS } from '../constants/theme';
import functions from '@react-native-firebase/functions';

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - ((day + 6) % 7)); // Monday
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Sunday

  const fmt = (d) => `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
  return `${fmt(start)} - ${fmt(end)}, ${end.getFullYear()}`;
}

function AdherenceBadge({ value, label, palette, accent }) {
  const color = value >= 80 ? accent.primary : value >= 50 ? accent.energy : accent.red;
  return (
    <View style={s.adherenceItem}>
      <Text style={[s.adherenceVal, { color }]}>{value}%</Text>
      <Text style={[s.adherenceLabel, { color: palette.textTertiary }]}>{label}</Text>
    </View>
  );
}

export default function InsightsScreen({ navigation }) {
  const { mode, palette, accent, gradients } = useTheme();
  const { isPro } = useSubscription();

  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsights = useCallback(async (regenerate = false) => {
    if (regenerate) setRegenerating(true);
    else setLoading(true);
    setError(null);

    try {
      const generateInsights = functions().httpsCallable('generateInsights');
      const result = await generateInsights({ regenerate });
      setInsights(result.data);
    } catch (err) {
      console.warn('Insights fetch error:', err.message);
      setError(err.message || 'Failed to generate insights');
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  }, []);

  useEffect(() => {
    if (isPro) fetchInsights(false);
  }, [isPro, fetchInsights]);

  // ── Premium gate ────────────────────────────────────────────────
  if (!isPro) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
        <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
        <BlurHeader title="Weekly Insights" onBack={() => navigation.goBack()} />
        <View style={s.gateContent}>
          <GlassCard level={2} style={s.gateCard}>
            <View style={[s.iconWrap, { backgroundColor: accent.energy + '15' }]}>
              <Icon name="bulb" size={32} color={accent.energy} />
            </View>
            <Text style={[s.gateTitle, { color: palette.textPrimary }]}>Weekly Insights</Text>
            <Text style={[s.gateSub, { color: palette.textSecondary }]}>
              AI-powered weekly summaries with personalized recommendations based on your data.
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

  // ── Loading state ───────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
        <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
        <BlurHeader title="Weekly Insights" onBack={() => navigation.goBack()} />
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={accent.energy} />
          <Text style={[s.loadingText, { color: palette.textSecondary }]}>Generating your insights...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Not enough data ─────────────────────────────────────────────
  if (insights?.notEnoughData) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
        <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
        <BlurHeader title="Weekly Insights" onBack={() => navigation.goBack()} />
        <View style={s.emptyWrap}>
          <Icon name="restaurant-outline" size={40} color={palette.textTertiary} />
          <Text style={[s.emptyText, { color: palette.textSecondary }]}>Not enough data yet</Text>
          <Text style={[s.emptySub, { color: palette.textTertiary }]}>
            Log at least 3 meals this week to get AI-powered insights.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error state ─────────────────────────────────────────────────
  if (error && !insights) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
        <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
        <BlurHeader title="Weekly Insights" onBack={() => navigation.goBack()} />
        <View style={s.emptyWrap}>
          <Icon name="alert-circle-outline" size={40} color={accent.red} />
          <Text style={[s.emptyText, { color: palette.textSecondary }]}>Something went wrong</Text>
          <GradientButton
            label="Try Again"
            gradient={gradients.primary}
            onPress={() => fetchInsights(false)}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ── Main insights UI ────────────────────────────────────────────
  return (
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <BlurHeader title="Weekly Insights" onBack={() => navigation.goBack()} />

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Week header */}
        <Text style={[s.weekHeader, { color: palette.textTertiary }]}>Week of {getWeekRange()}</Text>

        {/* Summary card */}
        <GlassCard level={1} style={s.card}>
          <Text style={[s.summaryText, { color: palette.textPrimary }]}>
            {insights?.weekSummary}
          </Text>
          <View style={s.adherenceRow}>
            <AdherenceBadge
              value={insights?.calorieAdherence || 0}
              label="Calories"
              palette={palette}
              accent={accent}
            />
            <AdherenceBadge
              value={insights?.proteinAdherence || 0}
              label="Protein"
              palette={palette}
              accent={accent}
            />
          </View>
        </GlassCard>

        {/* What Went Well */}
        {insights?.wentWell?.length > 0 && (
          <GlassCard level={1} style={s.card}>
            <View style={s.cardHeader}>
              <View style={[s.cardIconWrap, { backgroundColor: accent.primary + '15' }]}>
                <Icon name="checkmark-circle" size={18} color={accent.primary} />
              </View>
              <Text style={[s.cardTitle, { color: palette.textPrimary }]}>What Went Well</Text>
            </View>
            {insights.wentWell.map((item, i) => (
              <View key={i} style={s.listItem}>
                <Icon name="checkmark" size={14} color={accent.primary} />
                <Text style={[s.listText, { color: palette.textSecondary }]}>{item}</Text>
              </View>
            ))}
          </GlassCard>
        )}

        {/* Areas to Improve */}
        {insights?.toImprove?.length > 0 && (
          <GlassCard level={1} style={s.card}>
            <View style={s.cardHeader}>
              <View style={[s.cardIconWrap, { backgroundColor: accent.energy + '15' }]}>
                <Icon name="arrow-up-circle" size={18} color={accent.energy} />
              </View>
              <Text style={[s.cardTitle, { color: palette.textPrimary }]}>Areas to Improve</Text>
            </View>
            {insights.toImprove.map((item, i) => (
              <View key={i} style={s.listItem}>
                <Icon name="arrow-forward" size={14} color={accent.energy} />
                <Text style={[s.listText, { color: palette.textSecondary }]}>{item}</Text>
              </View>
            ))}
          </GlassCard>
        )}

        {/* Tip of the Week */}
        {insights?.tip && (
          <GlassCard level={1} style={s.card}>
            <View style={s.cardHeader}>
              <View style={[s.cardIconWrap, { backgroundColor: accent.blue + '15' }]}>
                <Icon name="bulb" size={18} color={accent.blue} />
              </View>
              <Text style={[s.cardTitle, { color: palette.textPrimary }]}>Tip of the Week</Text>
            </View>
            <Text style={[s.tipText, { color: palette.textSecondary }]}>{insights.tip}</Text>
          </GlassCard>
        )}

        {/* Regenerate button */}
        <GradientButton
          label={regenerating ? 'Regenerating...' : 'Regenerate Insights'}
          variant="secondary"
          icon="refresh"
          onPress={() => fetchInsights(true)}
          disabled={regenerating}
          style={s.regenBtn}
        />
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

  // Loading
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, fontWeight: '500' },

  // Empty
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: SPACING.md },
  emptyText: { fontSize: 16, fontWeight: '700' },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 19 },

  // Week header
  weekHeader: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3, marginBottom: SPACING.md },

  // Cards
  card: { marginBottom: SPACING.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700' },

  // Summary
  summaryText: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  adherenceRow: { flexDirection: 'row', gap: 24 },
  adherenceItem: { alignItems: 'center', gap: 2 },
  adherenceVal: { fontSize: 22, fontWeight: '800' },
  adherenceLabel: { fontSize: 11, fontWeight: '600' },

  // List items
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  listText: { fontSize: 14, lineHeight: 20, flex: 1 },

  // Tip
  tipText: { fontSize: 14, lineHeight: 21, fontStyle: 'italic' },

  // Regenerate
  regenBtn: { marginTop: 4 },
});
