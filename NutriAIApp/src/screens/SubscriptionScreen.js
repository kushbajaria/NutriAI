import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { GlassCard, BlurHeader, GradientButton } from '../components';
import Icon from '../components/Icon';
import { RADIUS, SPACING } from '../constants/theme';

export default function SubscriptionScreen({ navigation }) {
  const { mode, palette, accent, gradients } = useTheme();
  const { isPro, isTrialing, expiresAt, restore, customerInfo } = useSubscription();

  const handleManage = () => {
    Linking.openURL('https://apps.apple.com/account/subscriptions');
  };

  const handleRestore = async () => {
    try {
      const info = await restore();
      if (info?.entitlements?.active?.pro?.isActive) {
        Alert.alert('Restored', 'Your subscription has been restored successfully.');
      } else {
        Alert.alert('No Purchases Found', 'We couldn\'t find any active subscriptions to restore.');
      }
    } catch (e) {
      Alert.alert('Restore Failed', e.message || 'Something went wrong.');
    }
  };

  const statusLabel = isTrialing ? 'Free Trial' : isPro ? 'Active' : 'Free';
  const statusColor = isPro || isTrialing ? accent.primary : palette.textTertiary;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <BlurHeader title="Subscription" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status card */}
        <GlassCard level={2} style={s.statusCard}>
          <LinearGradient
            colors={isPro ? gradients.premium : [palette.bg2, palette.bg2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.statusBadge}
          >
            <Icon name={isPro ? 'diamond' : 'lock-closed'} size={24} color={isPro ? '#FFFFFF' : palette.textTertiary} />
          </LinearGradient>

          <Text style={[s.planName, { color: palette.textPrimary }]}>
            {isPro ? 'NutriSmart Pro' : 'NutriSmart Free'}
          </Text>

          <View style={[s.statusPill, { backgroundColor: statusColor + '15' }]}>
            <Text style={[s.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>

          {expiresAt && (
            <Text style={[s.expiresText, { color: palette.textTertiary }]}>
              {isTrialing ? 'Trial ends' : 'Renews'} {expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
          )}
        </GlassCard>

        {/* Actions */}
        {isPro ? (
          <GlassCard level={1} style={s.actionsCard}>
            <TouchableOpacity style={s.actionRow} onPress={handleManage} activeOpacity={0.7}>
              <Icon name="settings-outline" size={20} color={palette.textPrimary} />
              <Text style={[s.actionLabel, { color: palette.textPrimary }]}>Manage Subscription</Text>
              <Icon name="chevron-forward" size={18} color={palette.textTertiary} />
            </TouchableOpacity>
            <View style={[s.divider, { backgroundColor: palette.border }]} />
            <TouchableOpacity style={s.actionRow} onPress={handleRestore} activeOpacity={0.7}>
              <Icon name="refresh-outline" size={20} color={palette.textPrimary} />
              <Text style={[s.actionLabel, { color: palette.textPrimary }]}>Restore Purchases</Text>
              <Icon name="chevron-forward" size={18} color={palette.textTertiary} />
            </TouchableOpacity>
          </GlassCard>
        ) : (
          <>
            <GradientButton
              label="Upgrade to Pro"
              gradient={gradients.premium}
              icon="sparkles"
              onPress={() => navigation.navigate('Paywall')}
              style={s.upgradeCta}
            />
            <TouchableOpacity onPress={handleRestore} style={s.restoreBtn}>
              <Text style={[s.restoreText, { color: palette.textTertiary }]}>Restore Purchases</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40, alignItems: 'center' },

  // Status card
  statusCard: { alignItems: 'center', marginBottom: 20 },
  statusBadge: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  planName: { fontSize: 22, fontWeight: '900', letterSpacing: -0.3, marginBottom: 8 },
  statusPill: { borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 8 },
  statusText: { fontSize: 13, fontWeight: '700' },
  expiresText: { fontSize: 12 },

  // Actions
  actionsCard: { width: '100%' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  actionLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  divider: { height: 1 },

  // Upgrade
  upgradeCta: { width: '100%', marginBottom: 12 },
  restoreBtn: { paddingVertical: 8 },
  restoreText: { fontSize: 13, fontWeight: '600' },
});
