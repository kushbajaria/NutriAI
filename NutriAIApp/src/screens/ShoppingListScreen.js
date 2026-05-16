import React, { useState, useCallback } from 'react';
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

export default function ShoppingListScreen({ navigation }) {
  const { mode, palette, accent, gradients } = useTheme();
  const { isPro } = useSubscription();
  const { pantry, diet, calGoal, goal } = useApp();

  const [items, setItems] = useState([]);
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const generate = functions().httpsCallable('aiChat');
      const prompt = `Generate a grocery shopping list for a week of ${diet === 'No Restrictions' ? 'balanced' : diet} eating at ~${calGoal} cal/day. Goal: ${goal}. I already have: ${pantry.slice(0, 15).join(', ') || 'nothing listed'}.
Return ONLY a newline-separated list of items I need to buy (no numbering, no categories, just item names). Keep it to 15-25 items.`;
      const result = await generate({ message: prompt });
      const lines = result.data.message
        .split('\n')
        .map(l => l.replace(/^[-•*]\s*/, '').trim())
        .filter(l => l.length > 0 && l.length < 60);
      setItems(lines);
      setChecked({});
    } catch (err) {
      setError(err.message || 'Failed to generate list');
    } finally {
      setLoading(false);
    }
  }, [pantry, diet, calGoal, goal]);

  const toggleItem = (index) => {
    setChecked(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const checkedCount = Object.values(checked).filter(Boolean).length;

  // ── Premium gate ────────────────────────────────────────────────
  if (!isPro) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
        <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
        <BlurHeader title="Shopping List" onBack={() => navigation.goBack()} />
        <View style={s.gateContent}>
          <GlassCard level={2} style={s.gateCard}>
            <View style={[s.iconWrap, { backgroundColor: accent.primary + '15' }]}>
              <Icon name="cart" size={32} color={accent.primary} />
            </View>
            <Text style={[s.gateTitle, { color: palette.textPrimary }]}>Shopping List</Text>
            <Text style={[s.gateSub, { color: palette.textSecondary }]}>
              AI-generated shopping lists based on your goals, diet, and pantry.
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

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <BlurHeader title="Shopping List" onBack={() => navigation.goBack()} />

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator size="large" color={accent.primary} />
            <Text style={[s.loadingText, { color: palette.textSecondary }]}>Generating your list...</Text>
          </View>
        ) : items.length > 0 ? (
          <>
            {/* Progress */}
            <View style={s.progressRow}>
              <Text style={[s.progressText, { color: palette.textTertiary }]}>
                {checkedCount}/{items.length} items
              </Text>
            </View>

            {/* Items */}
            {items.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[s.item, { backgroundColor: palette.bg1, borderColor: palette.border }]}
                onPress={() => toggleItem(i)}
                activeOpacity={0.7}
              >
                <View style={[
                  s.checkbox,
                  { borderColor: palette.border },
                  checked[i] && { backgroundColor: accent.primary, borderColor: accent.primary },
                ]}>
                  {checked[i] && <Icon name="checkmark" size={14} color="#fff" />}
                </View>
                <Text style={[
                  s.itemText,
                  { color: palette.textPrimary },
                  checked[i] && { textDecorationLine: 'line-through', color: palette.textTertiary },
                ]}>{item}</Text>
              </TouchableOpacity>
            ))}

            <GradientButton
              label="Regenerate List"
              variant="secondary"
              icon="refresh"
              onPress={generateList}
              style={s.regenBtn}
            />
          </>
        ) : (
          <View style={s.emptyWrap}>
            <Icon name="cart-outline" size={40} color={palette.textTertiary} />
            <Text style={[s.emptyText, { color: palette.textSecondary }]}>No shopping list yet</Text>
            <Text style={[s.emptySub, { color: palette.textTertiary }]}>
              Generate a personalized list based on your goals and pantry.
            </Text>
            <GradientButton
              label="Generate Shopping List"
              gradient={gradients.primary}
              icon="sparkles"
              onPress={generateList}
              style={s.genBtn}
            />
          </View>
        )}

        {error && <Text style={[s.errorText, { color: accent.red }]}>{error}</Text>}
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

  loadingWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
  loadingText: { fontSize: 14 },

  progressRow: { marginBottom: 12 },
  progressText: { fontSize: 12, fontWeight: '600' },

  item: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 6,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  itemText: { fontSize: 15, flex: 1 },

  regenBtn: { marginTop: 16 },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700' },
  emptySub: { fontSize: 13, textAlign: 'center' },
  genBtn: { marginTop: 12, width: '100%' },

  errorText: { fontSize: 13, textAlign: 'center', marginTop: 12 },
});
