import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING, SHADOW, SCREEN_W } from '../constants/theme';
import { signUp, signIn, signInWithGoogle, resetPassword } from '../services/auth';

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

// Map Firebase error codes to user-friendly messages
function getAuthErrorMessage(code) {
  switch (code) {
    case 'auth/email-already-in-use':     return 'This email is already registered. Try signing in.';
    case 'auth/invalid-email':            return 'Please enter a valid email address.';
    case 'auth/weak-password':            return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':           return 'No account found with this email.';
    case 'auth/wrong-password':           return 'Incorrect password. Try again.';
    case 'auth/invalid-credential':       return 'Invalid email or password. Please try again.';
    case 'auth/too-many-requests':        return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':   return 'Network error. Check your connection.';
    default:                              return 'Something went wrong. Please try again.';
  }
}

export default function AuthScreen({ navigation }) {
  const [tab, setTab]           = useState('login');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleAuth = async () => {
    setError('');

    // Basic validation
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!password.trim()) { setError('Password is required.'); return; }
    if (tab === 'signup' && !name.trim()) { setError('Name is required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      if (tab === 'login') {
        await signIn(email.trim(), password);
        // Navigation is handled by App.js auth state listener
      } else {
        await signUp(email.trim(), password, name.trim());
        // New user — App.js will detect no profile and show Onboard
      }
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      // Navigation handled by auth state listener
    } catch (err) {
      if (err.code !== 'SIGN_IN_CANCELLED') {
        setError(getAuthErrorMessage(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert('Enter your email', 'Type your email address above, then tap Forgot.');
      return;
    }
    resetPassword(email.trim())
      .then(() => Alert.alert('Email sent', 'Check your inbox for a password reset link.'))
      .catch(err => Alert.alert('Error', getAuthErrorMessage(err.code)));
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
              <Text style={s.logoName}>NutriSmart</Text>
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
              <Text style={s.heroBadgeText}>SMART NUTRITION</Text>
            </View>
            <Text style={s.heroSub}>
              {tab === 'login'
                ? 'Track nutrition, plan meals, and hit your goals.'
                : 'Get personalized guidance tailored to your goals.'}
            </Text>
          </View>

          {/* Tab switcher */}
          <View style={s.tabRow}>
            {['login', 'signup'].map(t => (
              <TouchableOpacity
                key={t}
                style={[s.tabBtn, tab === t && s.tabBtnActive]}
                onPress={() => { setTab(t); setError(''); }}
                activeOpacity={0.7}
              >
                <Text style={[s.tabBtnText, tab === t && s.tabBtnTextActive]}>
                  {t === 'login' ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Error message */}
          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

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
                  editable={!loading}
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
                editable={!loading}
              />
            </View>

            <View style={s.fieldWrap}>
              <View style={s.fieldLabelRow}>
                <Text style={s.fieldLabel}>PASSWORD</Text>
                {tab === 'login' && (
                  <TouchableOpacity onPress={handleForgotPassword}>
                    <Text style={s.forgotText}>Forgot?</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={s.input}
                placeholder="••••••••"
                placeholderTextColor={C.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[s.ctaBtn, loading && s.ctaBtnDisabled]}
            onPress={handleAuth}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={C.textInverse} style={{ flex: 1 }} />
            ) : (
              <>
                <Text style={s.ctaBtnText}>
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                </Text>
                <View style={s.ctaArrow}>
                  <Text style={s.ctaArrowText}>→</Text>
                </View>
              </>
            )}
          </TouchableOpacity>

          {/* OR divider */}
          <View style={s.orRow}>
            <View style={s.orLine} />
            <Text style={s.orText}>OR</Text>
            <View style={s.orLine} />
          </View>

          {/* Google */}
          <TouchableOpacity
            style={s.googleBtn}
            onPress={handleGoogleSignIn}
            activeOpacity={0.8}
            disabled={loading}
          >
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

  // Error
  errorBox: {
    backgroundColor: C.red + '18', borderRadius: RADIUS.md,
    padding: 12, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: C.red + '30',
  },
  errorText: { fontSize: 13, color: C.red, fontWeight: '600', textAlign: 'center' },

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
    minHeight: 60,
    ...SHADOW.lime,
  },
  ctaBtnDisabled: { opacity: 0.7 },
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
});
