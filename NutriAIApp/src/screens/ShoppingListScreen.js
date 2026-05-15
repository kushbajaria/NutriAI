import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { GlassCard, GradientButton, BlurHeader } from '../components';
import Icon from '../components/Icon';
import { SPACING } from '../constants/theme';

export default function ShoppingListScreen({ navigation }) {
  const { mode, palette, accent, gradients } = useTheme();
  const { isPro } = useSubscription();

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <BlurHeader title="Shopping List" onBack={() => navigation.goBack()} />

      <View style={s.content}>
        <GlassCard level={2} style={s.card}>
          <View style={[s.iconWrap, { backgroundColor: accent.primary + '15' }]}>
            <Icon name="cart" size={32} color={accent.primary} />
          </View>
          <Text style={[s.title, { color: palette.textPrimary }]}>Shopping List</Text>
          <Text style={[s.subtitle, { color: palette.textSecondary }]}>
            Auto-generated shopping lists from your weekly meal plan.
          </Text>
        </GlassCard>
        {!isPro && (
          <GradientButton
            label="Unlock with Pro"
            gradient={gradients.premium}
            icon="sparkles"
            onPress={() => navigation.navigate('Paywall')}
            style={s.cta}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: SPACING.md },
  card: { alignItems: 'center', marginBottom: 20 },
  iconWrap: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '900', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  cta: { marginTop: 4 },
});
