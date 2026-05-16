import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useApp } from '../context/AppContext';
import { GlassCard, GradientButton, BlurHeader } from '../components';
import Icon from '../components/Icon';
import { SPACING, RADIUS } from '../constants/theme';
import functions from '@react-native-firebase/functions';

const MEAL_TIMES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function MealPlanScreen({ navigation }) {
  const { mode, palette, accent, gradients } = useTheme();
  const { isPro } = useSubscription();
  const { goal, diet, calGoal } = useApp();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [error, setError] = useState(null);

  const generatePlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const generate = functions().httpsCallable('aiChat');
      const prompt = `Generate a ${diet === 'No Restrictions' ? '' : diet + ' '}meal plan for today (${DAY_NAMES[selectedDay]}) targeting ${calGoal} calories. Goal: ${goal}. Return exactly 4 meals in this format for each:
- Meal name (emoji) | calories | protein g
Keep it brief, one line per meal. Label each: Breakfast, Lunch, Dinner, Snack.`;
      const result = await generate({ message: prompt });
      setPlan(prev => ({ ...prev, [selectedDay]: result.data.message }));
    } catch (err) {
      setError(err.message || 'Failed to generate meal plan');
    } finally {
      setLoading(false);
    }
  }, [selectedDay, diet, calGoal, goal]);

  // ── Premium gate ────────────────────────────────────────────────
  if (!isPro) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
        <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
        <BlurHeader title="Meal Plans" onBack={() => navigation.goBack()} />
        <View style={s.gateContent}>
          <GlassCard level={2} style={s.gateCard}>
            <View style={[s.iconWrap, { backgroundColor: accent.primary + '15' }]}>
              <Icon name="calendar" size={32} color={accent.primary} />
            </View>
            <Text style={[s.gateTitle, { color: palette.textPrimary }]}>Meal Plans</Text>
            <Text style={[s.gateSub, { color: palette.textSecondary }]}>
              AI-generated daily meal plans tailored to your goals, diet, and calorie target.
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

  const dayPlan = plan?.[selectedDay];

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <BlurHeader title="Meal Plans" onBack={() => navigation.goBack()} />

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Day selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.dayScroll} contentContainerStyle={s.dayRow}>
          {DAY_NAMES.map((day, i) => (
            <TouchableOpacity
              key={day}
              style={[
                s.dayChip,
                { backgroundColor: palette.bg2, borderColor: palette.border },
                selectedDay === i && { backgroundColor: accent.primaryBg, borderColor: accent.primary },
              ]}
              onPress={() => setSelectedDay(i)}
              activeOpacity={0.7}
            >
              <Text style={[
                s.dayText,
                { color: palette.textSecondary },
                selectedDay === i && { color: accent.primary, fontWeight: '700' },
              ]}>{day.slice(0, 3)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Plan info */}
        <GlassCard level={1} style={s.infoCard}>
          <View style={s.infoRow}>
            <Icon name="flame-outline" size={16} color={accent.energy} />
            <Text style={[s.infoText, { color: palette.textSecondary }]}>Target: {calGoal} cal</Text>
          </View>
          <View style={s.infoRow}>
            <Icon name="leaf-outline" size={16} color={accent.primary} />
            <Text style={[s.infoText, { color: palette.textSecondary }]}>{diet}</Text>
          </View>
          <View style={s.infoRow}>
            <Icon name="trophy-outline" size={16} color={accent.blue} />
            <Text style={[s.infoText, { color: palette.textSecondary }]}>{goal}</Text>
          </View>
        </GlassCard>

        {/* Generated plan or generate button */}
        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator size="large" color={accent.primary} />
            <Text style={[s.loadingText, { color: palette.textSecondary }]}>Generating meal plan...</Text>
          </View>
        ) : dayPlan ? (
          <GlassCard level={1} style={s.planCard}>
            <Text style={[s.planTitle, { color: palette.textPrimary }]}>{DAY_NAMES[selectedDay]}</Text>
            <Text style={[s.planText, { color: palette.textSecondary }]}>{dayPlan}</Text>
            <GradientButton
              label="Regenerate"
              variant="secondary"
              icon="refresh"
              onPress={generatePlan}
              style={s.regenBtn}
            />
          </GlassCard>
        ) : (
          <View style={s.emptyWrap}>
            <Icon name="restaurant-outline" size={36} color={palette.textTertiary} />
            <Text style={[s.emptyText, { color: palette.textSecondary }]}>No plan for {DAY_NAMES[selectedDay]}</Text>
            <GradientButton
              label="Generate Plan"
              gradient={gradients.primary}
              icon="sparkles"
              onPress={generatePlan}
              style={s.genBtn}
            />
          </View>
        )}

        {error && (
          <Text style={[s.errorText, { color: accent.red }]}>{error}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },

  gateContent: { flex: 1, justifyContent: 'center', padding: SPACING.md },
  gateCard: { alignItems: 'center', marginBottom: 20 },
  iconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  gateTitle: { fontSize: 22, fontWeight: '900', marginBottom: 8 },
  gateSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  gateCta: { marginTop: 4 },

  dayScroll: { marginBottom: SPACING.md },
  dayRow: { gap: 8 },
  dayChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.full, borderWidth: 1 },
  dayText: { fontSize: 13, fontWeight: '600' },

  infoCard: { marginBottom: SPACING.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  infoText: { fontSize: 13, fontWeight: '500' },

  loadingWrap: { alignItems: 'center', paddingTop: 40, gap: 12 },
  loadingText: { fontSize: 14 },

  planCard: { marginBottom: SPACING.md },
  planTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  planText: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
  regenBtn: { marginTop: 4 },

  emptyWrap: { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyText: { fontSize: 15, fontWeight: '600' },
  genBtn: { marginTop: 8, width: '100%' },

  errorText: { fontSize: 13, textAlign: 'center', marginTop: 12 },
});
