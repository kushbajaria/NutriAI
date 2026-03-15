import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { PillButton } from '../components/UI';

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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Logo block */}
          <View style={s.logoBlock}>
            <View style={s.logoMark}>
              <Text style={s.logoMarkText}>N</Text>
            </View>
            <View>
              <Text style={s.logoName}>NutriAI</Text>
              <Text style={s.logoSub}>YOUR WELLNESS OS</Text>
            </View>
          </View>

          {/* Headline */}
          <View style={s.headline}>
            <Text style={s.headlineMain}>
              {tab === 'login' ? 'Welcome\nback.' : 'Start your\njourney.'}
            </Text>
            <Text style={s.headlineSub}>
              {tab === 'login'
                ? 'Sign in to continue tracking your progress.'
                : 'Create an account to get personalized guidance.'}
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
              <Text style={s.fieldLabel}>EMAIL</Text>
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
                {tab === 'login' && <TouchableOpacity><Text style={s.forgotText}>Forgot?</Text></TouchableOpacity>}
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

          <PillButton
            label={tab === 'login' ? 'Sign In' : 'Create Account'}
            onPress={handleAuth}
            style={{ marginTop: SPACING.sm }}
          />

          {/* OR divider */}
          <View style={s.orRow}>
            <View style={s.orLine} />
            <Text style={s.orText}>OR</Text>
            <View style={s.orLine} />
          </View>

          {/* Google */}
          <TouchableOpacity style={s.googleBtn} onPress={handleAuth} activeOpacity={0.8}>
            <Text style={s.googleIcon}>G</Text>
            <Text style={s.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Value props */}
          <View style={s.props}>
            {[
              ['🍽️', 'AI meal plans from your pantry'],
              ['💪', 'Personalized workout programming'],
              ['📊', 'Nutrition tracking & insights'],
            ].map(([icon, text]) => (
              <View key={text} style={s.propRow}>
                <Text style={s.propIcon}>{icon}</Text>
                <Text style={s.propText}>{text}</Text>
              </View>
            ))}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.black },
  scroll: { padding: SPACING.lg, paddingTop: SPACING.xl },
  logoBlock: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: SPACING.xxl },
  logoMark: { width: 42, height: 42, borderRadius: RADIUS.md, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  logoMarkText: { fontSize: 22, fontWeight: '900', color: C.textInverse },
  logoName: { fontSize: 18, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.3 },
  logoSub: { fontSize: 9, fontWeight: '700', color: C.textTertiary, letterSpacing: 1.5 },
  headline: { marginBottom: SPACING.xl },
  headlineMain: { fontSize: 44, fontWeight: '900', color: C.textPrimary, lineHeight: 50, letterSpacing: -1.5, marginBottom: 10 },
  headlineSub: { fontSize: 15, color: C.textSecondary, lineHeight: 22 },
  tabRow: { flexDirection: 'row', backgroundColor: C.surface1, borderRadius: RADIUS.md, padding: 4, marginBottom: SPACING.lg, borderWidth: 1, borderColor: C.border },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: RADIUS.sm, alignItems: 'center' },
  tabBtnActive: { backgroundColor: C.surface3 },
  tabBtnText: { fontSize: 14, fontWeight: '600', color: C.textTertiary },
  tabBtnTextActive: { color: C.textPrimary },
  form: { gap: SPACING.md },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 10, fontWeight: '700', color: C.textTertiary, letterSpacing: 1.2 },
  fieldLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgotText: { fontSize: 12, color: C.lime, fontWeight: '600' },
  input: {
    backgroundColor: C.surface1, borderWidth: 1, borderColor: C.border,
    borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 14,
    color: C.textPrimary, fontSize: 15,
  },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: SPACING.md },
  orLine: { flex: 1, height: 1, backgroundColor: C.border },
  orText: { fontSize: 11, fontWeight: '700', color: C.textTertiary, letterSpacing: 1 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.surface1, borderWidth: 1, borderColor: C.borderHi, borderRadius: RADIUS.md, paddingVertical: 14 },
  googleIcon: { fontSize: 18, fontWeight: '900', color: C.textPrimary },
  googleText: { fontSize: 15, fontWeight: '600', color: C.textPrimary },
  props: { marginTop: SPACING.xl, gap: 12, paddingTop: SPACING.lg, borderTopWidth: 1, borderTopColor: C.border },
  propRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  propIcon: { fontSize: 18, width: 28, textAlign: 'center' },
  propText: { fontSize: 13, color: C.textSecondary, fontWeight: '500' },
});
