import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { GlassCard, GradientButton } from '../components';
import Icon from '../components/Icon';
import { RADIUS, SPACING } from '../constants/theme';
import { hapticSelection } from '../utils/haptics';

const FEATURES = [
  { icon: 'sparkles', label: 'AI Coach', desc: 'Personal nutrition & fitness guidance 24/7' },
  { icon: 'calendar', label: 'Meal Plans', desc: 'Weekly AI-generated plans from 200+ recipes' },
  { icon: 'barbell', label: 'Programs', desc: 'Structured 4–12 week guided journeys' },
  { icon: 'analytics', label: 'Analytics', desc: 'Trends, insights & body composition tracking' },
  { icon: 'camera', label: 'Progress Photos', desc: 'Side-by-side comparison with timeline' },
];

export default function PaywallScreen({ navigation }) {
  const { mode, palette, accent, gradients } = useTheme();
  const { offerings, purchase, restore, loading } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [purchasing, setPurchasing] = useState(false);

  const packages = offerings?.availablePackages || [];
  const monthlyPkg = packages.find(p => p.packageType === 'MONTHLY');
  const annualPkg = packages.find(p => p.packageType === 'ANNUAL');

  const handlePurchase = async () => {
    const pkg = selectedPlan === 'annual' ? annualPkg : monthlyPkg;
    if (!pkg) return;
    setPurchasing(true);
    try {
      await purchase(pkg);
      navigation.goBack();
    } catch (e) {
      if (!e.userCancelled) {
        Alert.alert('Purchase Failed', e.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    try {
      const info = await restore();
      if (info?.entitlements?.active?.pro?.isActive) {
        navigation.goBack();
      } else {
        Alert.alert('No Purchases Found', 'We couldn\'t find any active subscriptions to restore.');
      }
    } catch (e) {
      Alert.alert('Restore Failed', e.message || 'Something went wrong.');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <View style={[s.container, { backgroundColor: palette.bg0 }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Close button */}
      <SafeAreaView edges={['top']} style={s.closeWrap}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[s.closeBtn, { backgroundColor: palette.glass1Bg }]}
          activeOpacity={0.7}
        >
          <Icon name="close" size={22} color={palette.textPrimary} />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={gradients.premium}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroBadge}
        >
          <Icon name="diamond" size={32} color="#FFFFFF" />
        </LinearGradient>
        <Text style={[s.heroTitle, { color: palette.textPrimary }]}>Unlock NutriSmart Pro</Text>
        <Text style={[s.heroSub, { color: palette.textSecondary }]}>
          Your personal AI nutritionist & trainer
        </Text>

        {/* Feature list */}
        <GlassCard level={1} style={s.featuresCard}>
          {FEATURES.map((f, i) => (
            <View key={i} style={[s.featureRow, i < FEATURES.length - 1 && { borderBottomWidth: 1, borderBottomColor: palette.border }]}>
              <View style={[s.featureIcon, { backgroundColor: accent.premium + '15' }]}>
                <Icon name={f.icon} size={18} color={accent.premium} />
              </View>
              <View style={s.featureText}>
                <Text style={[s.featureLabel, { color: palette.textPrimary }]}>{f.label}</Text>
                <Text style={[s.featureDesc, { color: palette.textTertiary }]}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </GlassCard>

        {/* Plan selector */}
        <View style={s.plans}>
          <PlanCard
            label="Annual"
            price="$99.99/yr"
            perMonth="$8.33/mo"
            badge="Save 36%"
            selected={selectedPlan === 'annual'}
            onPress={() => { hapticSelection(); setSelectedPlan('annual'); }}
            palette={palette}
            accent={accent}
            gradients={gradients}
          />
          <PlanCard
            label="Monthly"
            price="$12.99/mo"
            selected={selectedPlan === 'monthly'}
            onPress={() => { hapticSelection(); setSelectedPlan('monthly'); }}
            palette={palette}
            accent={accent}
            gradients={gradients}
          />
        </View>

        {/* CTA */}
        {loading ? (
          <ActivityIndicator color={accent.premium} style={{ marginVertical: 20 }} />
        ) : (
          <GradientButton
            label={purchasing ? 'Processing...' : 'Start 7-Day Free Trial'}
            gradient={gradients.premium}
            onPress={handlePurchase}
            disabled={purchasing || (!monthlyPkg && !annualPkg && packages.length === 0)}
            icon="sparkles"
            style={s.cta}
          />
        )}

        {/* Restore */}
        <TouchableOpacity onPress={handleRestore} disabled={purchasing} style={s.restoreBtn}>
          <Text style={[s.restoreText, { color: palette.textTertiary }]}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Legal */}
        <Text style={[s.legal, { color: palette.textTertiary }]}>
          Payment will be charged to your Apple ID account at the confirmation of purchase.
          Subscription automatically renews unless it is canceled at least 24 hours before the
          end of the current period. Your account will be charged for renewal within 24 hours
          prior to the end of the current period. You can manage and cancel your subscriptions
          by going to your account settings on the App Store after purchase.
        </Text>
      </ScrollView>
    </View>
  );
}

function PlanCard({ label, price, perMonth, badge, selected, onPress, palette, accent, gradients }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        s.planCard,
        {
          backgroundColor: palette.glass1Bg,
          borderColor: selected ? accent.premium : palette.border,
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      {badge && (
        <LinearGradient
          colors={gradients.premium}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.planBadge}
        >
          <Text style={s.planBadgeText}>{badge}</Text>
        </LinearGradient>
      )}
      <View style={s.planContent}>
        <Text style={[s.planLabel, { color: palette.textPrimary }]}>{label}</Text>
        <Text style={[s.planPrice, { color: selected ? accent.premium : palette.textPrimary }]}>{price}</Text>
        {perMonth && <Text style={[s.planPer, { color: palette.textTertiary }]}>{perMonth}</Text>}
      </View>
      <View style={[s.planRadio, { borderColor: selected ? accent.premium : palette.textTertiary }]}>
        {selected && <View style={[s.planRadioDot, { backgroundColor: accent.premium }]} />}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  closeWrap: { position: 'absolute', top: 0, right: 16, zIndex: 10 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 8,
  },
  scrollContent: { paddingHorizontal: SPACING.md, paddingTop: 80, paddingBottom: 40, alignItems: 'center' },

  // Hero
  heroBadge: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5, marginBottom: 6 },
  heroSub: { fontSize: 15, fontWeight: '500', marginBottom: 24 },

  // Features
  featuresCard: { width: '100%', marginBottom: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  featureIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureLabel: { fontSize: 14, fontWeight: '700' },
  featureDesc: { fontSize: 12, marginTop: 1 },

  // Plans
  plans: { width: '100%', gap: 10, marginBottom: 20 },
  planCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: RADIUS.lg, padding: 16,
    overflow: 'hidden',
  },
  planBadge: {
    position: 'absolute', top: 0, right: 0,
    borderBottomLeftRadius: RADIUS.md,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  planBadgeText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
  planContent: { flex: 1 },
  planLabel: { fontSize: 14, fontWeight: '700' },
  planPrice: { fontSize: 20, fontWeight: '900', marginTop: 2 },
  planPer: { fontSize: 12, marginTop: 1 },
  planRadio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  planRadioDot: { width: 12, height: 12, borderRadius: 6 },

  // CTA
  cta: { width: '100%', marginBottom: 12 },
  restoreBtn: { paddingVertical: 8 },
  restoreText: { fontSize: 13, fontWeight: '600' },

  // Legal
  legal: { fontSize: 11, textAlign: 'center', lineHeight: 16, marginTop: 16, paddingHorizontal: 8 },
});
