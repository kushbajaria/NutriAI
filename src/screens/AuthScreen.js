import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING, SHADOW, SCREEN_W } from '../constants/theme';
import { useApp } from '../context/AppContext';

// Decorative background dots
function BgDecor() {
  return (
    <View style={s.bgDecor} pointerEvents="none">
      <View style={[s.bgCircle, s.bgCircle1]} />
      <View style={[s.bgCircle, s.bgCircle2]} />
      <View style={[s.bgCircle, s.bgCircle3]} />
    </View>
  );
}

export default function AuthScreen({ navigation }) {
  const [tab, setTab]           = useState('login');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { setUser }             = useApp();

  const handleAuth = () => {
    setUser({ name: name || 'Demo User', email: email || 'demo@nutriai.app' });
    navigation.replace(tab === 'login' ? 'Main' : 'Onboard');
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={C.black} />
      <BgDecor />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Logo */}
          <View style={s.logoRow}>
            <View style={s.logoMark}>
              <Text style={s.logoMarkText}>N</Text>
            </View>
            <View>
              <Text style={s.logoName}>NutriAI</Text>
              <Text style={s.logoTagline}>YOUR WELLNESS OS</Text>
            </View>
          </View>

          {/* Hero headline */}
          <View style={s.hero}>
            <Text style={s.heroTitle}>
              {tab === 'login' ? 'Welcome\nback.' : 'Start your\njourney.'}
            </Text>
            <View style={s.heroBadge}>
              <View style={s.heroBadgeDot} />
              <Text style={s.heroBadgeText}>AI-POWERED</Text>
            </View>
            <Text style={s.heroSub}>
              {tab === 'login'
                ? 'Track nutrition, plan meals, and hit your goals.'
                : 'Get personalized AI guidance for your goals.'}
            </Text>
          </View>

          {/* Tab switcher */}
          <View style={s.tabRow}>
            {['login', 'signup'].map(t => (
              <TouchableOpacity
                key={t}
                style={[s.tabBtn, tab === t && s.tabBtnActive]}
                onPress={() => setTab(t)}
                activeOpacity={0.7}
              >
                <Text style={[s.tabBtnText, tab === t && s.tabBtnTextActive]}>
                  {t === 'login' ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Form */}
          <View style={s.form}>
            {tab === 'signup' && (
              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>FULL NAME</Text>
                <TextInput
                  style={s.input}
                  placeholder="Your name"
                  placeholderTextColor={C.textTertiary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={s.input}
                placeholder="you@example.com"
                placeholderTextColor={C.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={s.fieldWrap}>
              <View style={s.fieldLabelRow}>
                <Text style={s.fieldLabel}>PASSWORD</Text>
                {tab === 'login' && (
                  <TouchableOpacity><Text style={s.forgotText}>Forgot?</Text></TouchableOpacity>
                )}
              </View>
              <TextInput
                style={s.input}
                placeholder="••••••••"
                placeholderTextColor={C.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity style={s.ctaBtn} onPress={handleAuth} activeOpacity={0.85}>
            <Text style={s.ctaBtnText}>
              {tab === 'login' ? 'Sign In' : 'Create Account'}
            </Text>
            <View style={s.ctaArrow}>
              <Text style={s.ctaArrowText}>→</Text>
            </View>
          </TouchableOpacity>

          {/* OR divider */}
          <View style={s.orRow}>
            <View style={s.orLine} />
            <Text style={s.orText}>OR</Text>
            <View style={s.orLine} />
          </View>

          {/* Google */}
          <TouchableOpacity style={s.googleBtn} onPress={handleAuth} activeOpacity={0.8}>
            <View style={s.googleIcon}>
              <Text style={s.googleIconText}>G</Text>
            </View>
            <Text style={s.googleText}>Continue with Google</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.black },

  // Background decoration
  bgDecor: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  bgCircle: { position: 'absolute', borderRadius: 999 },
  bgCircle1: {
    width: SCREEN_W * 0.8, height: SCREEN_W * 0.8,
    backgroundColor: C.limeGlowSm,
    top: -SCREEN_W * 0.3, right: -SCREEN_W * 0.2,
    borderWidth: 1, borderColor: C.lime + '10',
  },
  bgCircle2: {
    width: SCREEN_W * 0.5, height: SCREEN_W * 0.5,
    backgroundColor: C.limeGlowSm,
    bottom: SCREEN_W * 0.3, left: -SCREEN_W * 0.2,
    borderWidth: 1, borderColor: C.lime + '08',
  },
  bgCircle3: {
    width: 80, height: 80,
    backgroundColor: C.limeGlow,
    top: 160, left: SCREEN_W * 0.1,
    borderWidth: 1, borderColor: C.lime + '25',
  },

  scroll: { padding: SPACING.lg, paddingTop: SPACING.xl },

  // Logo
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: SPACING.xxl },
  logoMark: {
    width: 44, height: 44, borderRadius: RADIUS.sm,
    backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center',
    ...SHADOW.lime,
  },
  logoMarkText: { fontSize: 24, fontWeight: '900', color: C.textInverse },
  logoName:    { fontSize: 19, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.5 },
  logoTagline: { fontSize: 9, fontWeight: '700', color: C.textTertiary, letterSpacing: 2 },

  // Hero
  hero: { marginBottom: SPACING.xl },
  heroTitle: {
    fontSize: 52, fontWeight: '900', color: C.textPrimary,
    lineHeight: 56, letterSpacing: -2, marginBottom: SPACING.sm,
  },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: C.limeGlow, borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: C.lime + '35',
    marginBottom: SPACING.sm,
  },
  heroBadgeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.lime },
  heroBadgeText: { fontSize: 9, fontWeight: '800', color: C.lime, letterSpacing: 1.5 },
  heroSub: { fontSize: 15, color: C.textSecondary, lineHeight: 22 },

  // Tab switcher
  tabRow: {
    flexDirection: 'row',
    backgroundColor: C.surface1,
    borderRadius: RADIUS.md, padding: 4,
    marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: C.border,
  },
  tabBtn:           { flex: 1, paddingVertical: 11, borderRadius: RADIUS.sm, alignItems: 'center' },
  tabBtnActive:     { backgroundColor: C.surface3, borderWidth: 1, borderColor: C.borderHi },
  tabBtnText:       { fontSize: 14, fontWeight: '600', color: C.textTertiary },
  tabBtnTextActive: { color: C.textPrimary, fontWeight: '700' },

  // Form
  form: { gap: SPACING.md, marginBottom: SPACING.lg },
  fieldWrap: { gap: 7 },
  fieldLabel: { fontSize: 9, fontWeight: '700', color: C.textTertiary, letterSpacing: 1.8 },
  fieldLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgotText: { fontSize: 12, color: C.lime, fontWeight: '600' },
  input: {
    backgroundColor: C.surface1, borderWidth: 1, borderColor: C.border,
    borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 15,
    color: C.textPrimary, fontSize: 15,
  },

  // CTA button
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.lime, borderRadius: RADIUS.full,
    paddingLeft: SPACING.lg, paddingRight: 8, paddingVertical: 8,
    marginBottom: SPACING.md,
    ...SHADOW.lime,
  },
  ctaBtnText: { fontSize: 15, fontWeight: '800', color: C.textInverse },
  ctaArrow: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.black + '25',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaArrowText: { fontSize: 18, color: C.textInverse, fontWeight: '700' },

  // OR
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: SPACING.sm },
  orLine: { flex: 1, height: 1, backgroundColor: C.border },
  orText: { fontSize: 10, fontWeight: '700', color: C.textTertiary, letterSpacing: 1.2 },

  // Google
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    backgroundColor: C.surface1, borderWidth: 1, borderColor: C.borderHi,
    borderRadius: RADIUS.md, paddingVertical: 15,
    marginBottom: SPACING.lg,
  },
  googleIcon: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: C.surface3,
    alignItems: 'center', justifyContent: 'center',
  },
  googleIconText: { fontSize: 14, fontWeight: '900', color: C.textPrimary },
  googleText:     { fontSize: 15, fontWeight: '600', color: C.textPrimary },

  // Feature pills
  featureRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  featurePill: {
    backgroundColor: C.surface2, borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: C.border,
  },
  featurePillText: { fontSize: 12, color: C.textSecondary, fontWeight: '500' },
});
