import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RADIUS, SPACING, SHADOW } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { GradientButton } from '../components';
import { signUp, signIn, signInWithGoogle, signInWithApple, resetPassword } from '../services/auth';

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
  const { mode, palette, accent, gradients } = useTheme();

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

  const handleAppleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithApple();
    } catch (err) {
      if (err.code !== 'ERR_REQUEST_CANCELED') {
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
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Logo */}
          <View style={s.logoRow}>
            <View style={[s.logoMark, { backgroundColor: accent.primary }]}>
              <Text style={[s.logoMarkText, { color: palette.textInverse }]}>N</Text>
            </View>
            <View>
              <Text style={[s.logoName, { color: palette.textPrimary }]}>NutriSmart</Text>
              <Text style={[s.logoTagline, { color: palette.textTertiary }]}>Your Wellness OS</Text>
            </View>
          </View>

          {/* Hero headline */}
          <View style={s.hero}>
            <Text style={[s.heroTitle, { color: palette.textPrimary }]}>
              {tab === 'login' ? 'Welcome\nback.' : 'Start your\njourney.'}
            </Text>
            <Text style={[s.heroSub, { color: palette.textSecondary }]}>
              {tab === 'login'
                ? 'Track nutrition, plan meals, and hit your goals.'
                : 'Get personalized guidance tailored to your goals.'}
            </Text>
          </View>

          {/* Tab switcher */}
          <View style={[s.tabRow, { backgroundColor: palette.bg1, borderColor: palette.border }]}>
            {['login', 'signup'].map(t => (
              <TouchableOpacity
                key={t}
                style={[
                  s.tabBtn,
                  tab === t && [s.tabBtnActive, { backgroundColor: palette.bg3, borderColor: palette.borderHi }],
                ]}
                onPress={() => { setTab(t); setError(''); }}
                activeOpacity={0.7}
              >
                <Text style={[s.tabBtnText, { color: palette.textTertiary }, tab === t && { color: palette.textPrimary, fontWeight: '700' }]}>
                  {t === 'login' ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Error message */}
          {error ? (
            <View style={[s.errorBox, { backgroundColor: accent.red + '18', borderColor: accent.red + '30' }]}>
              <Text style={[s.errorText, { color: accent.red }]}>{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={s.form}>
            {tab === 'signup' && (
              <View style={s.fieldWrap}>
                <Text style={[s.fieldLabel, { color: palette.textTertiary }]}>Full name</Text>
                <TextInput
                  style={[s.input, { backgroundColor: palette.bg1, borderColor: palette.border, color: palette.textPrimary }]}
                  placeholder="Your name"
                  placeholderTextColor={palette.textTertiary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            )}

            <View style={s.fieldWrap}>
              <Text style={[s.fieldLabel, { color: palette.textTertiary }]}>Email</Text>
              <TextInput
                style={[s.input, { backgroundColor: palette.bg1, borderColor: palette.border, color: palette.textPrimary }]}
                placeholder="you@example.com"
                placeholderTextColor={palette.textTertiary}
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
                <Text style={[s.fieldLabel, { color: palette.textTertiary }]}>Password</Text>
                {tab === 'login' && (
                  <TouchableOpacity onPress={handleForgotPassword}>
                    <Text style={[s.forgotText, { color: accent.primary }]}>Forgot?</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={[s.input, { backgroundColor: palette.bg1, borderColor: palette.border, color: palette.textPrimary }]}
                placeholder="••••••••"
                placeholderTextColor={palette.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
          </View>

          {/* CTA */}
          <GradientButton
            label={tab === 'login' ? 'Sign In  →' : 'Create Account  →'}
            onPress={handleAuth}
            disabled={loading}
          />

          {/* OR divider */}
          <View style={s.orRow}>
            <View style={[s.orLine, { backgroundColor: palette.border }]} />
            <Text style={[s.orText, { color: palette.textTertiary }]}>OR</Text>
            <View style={[s.orLine, { backgroundColor: palette.border }]} />
          </View>

          {/* Apple */}
          <TouchableOpacity
            style={s.appleBtn}
            onPress={handleAppleSignIn}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={s.appleIcon}>{'\uF8FF'}</Text>
            <Text style={s.appleText}>Continue with Apple</Text>
          </TouchableOpacity>

          {/* Google */}
          <TouchableOpacity
            style={[s.googleBtn, { backgroundColor: palette.glass1Bg, borderColor: palette.glass1Border }]}
            onPress={handleGoogleSignIn}
            activeOpacity={0.8}
            disabled={loading}
          >
            <View style={[s.googleIcon, { backgroundColor: palette.bg3 }]}>
              <Text style={[s.googleIconText, { color: palette.textPrimary }]}>G</Text>
            </View>
            <Text style={[s.googleText, { color: palette.textPrimary }]}>Continue with Google</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  scroll: { padding: SPACING.lg, paddingTop: SPACING.xl },

  // Logo
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: SPACING.xxl },
  logoMark: {
    width: 44, height: 44, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOW.accent,
  },
  logoMarkText: { fontSize: 24, fontWeight: '900' },
  logoName:    { fontSize: 19, fontWeight: '800', letterSpacing: -0.5 },
  logoTagline: { fontSize: 9, fontWeight: '700', letterSpacing: 2 },

  // Hero
  hero: { marginBottom: SPACING.xl },
  heroTitle: {
    fontSize: 52, fontWeight: '900',
    lineHeight: 56, letterSpacing: -2, marginBottom: SPACING.sm,
  },
  heroSub: { fontSize: 15, lineHeight: 22 },

  // Tab switcher
  tabRow: {
    flexDirection: 'row',
    borderRadius: RADIUS.md, padding: 4,
    marginBottom: SPACING.lg,
    borderWidth: 1,
  },
  tabBtn:       { flex: 1, paddingVertical: 11, borderRadius: RADIUS.sm, alignItems: 'center' },
  tabBtnActive: { borderWidth: 1 },
  tabBtnText:   { fontSize: 14, fontWeight: '600' },

  // Error
  errorBox: {
    borderRadius: RADIUS.md,
    padding: 12, marginBottom: SPACING.md,
    borderWidth: 1,
  },
  errorText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

  // Form
  form: { gap: SPACING.md, marginBottom: SPACING.lg },
  fieldWrap: { gap: 7 },
  fieldLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1.8 },
  fieldLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgotText: { fontSize: 12, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 15,
    fontSize: 15,
  },

  // OR
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: SPACING.sm },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },

  // Apple (brand compliance: always white bg, black text)
  appleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#FFFFFF', borderRadius: RADIUS.md, paddingVertical: 15,
    marginBottom: 10,
  },
  appleIcon: { fontSize: 20, color: '#000000' },
  appleText: { fontSize: 15, fontWeight: '600', color: '#000000' },

  // Google
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    borderWidth: 1,
    borderRadius: RADIUS.md, paddingVertical: 15,
    marginBottom: SPACING.lg,
  },
  googleIcon: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  googleIconText: { fontSize: 14, fontWeight: '900' },
  googleText:     { fontSize: 15, fontWeight: '600' },
});
