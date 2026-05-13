import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RADIUS, SPACING } from '../constants/theme';
import { GOALS, DIETS } from '../constants/data';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useTheme } from '../context/ThemeContext';
import { createUserProfile, setPantry } from '../services/firestore';
import { GradientButton, GlassCard } from '../components';
import Icon from '../components/Icon';
import { hapticSelection } from '../utils/haptics';

export default function OnboardScreen() {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useUI();
  const { mode, palette, accent, gradients } = useTheme();

  const [step, setStep]         = useState(1);
  const [goal, setGoal]         = useState('Lose Weight');
  const [age, setAge]           = useState('');
  const [height, setHeight]     = useState('');
  const [weight, setWeight]     = useState('');
  const [selDiet, setSelDiet]   = useState(0);
  const [units, setUnits]       = useState('Imperial');
  const [saving, setSaving]     = useState(false);
  const totalSteps = 2;

  const finish = async () => {
    if (!user) return;

    const ageNum = parseInt(age, 10);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    if (!age || isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      showToast('Please enter a valid age (13-120)');
      return;
    }
    if (!height || isNaN(heightNum) || heightNum <= 0 || heightNum > 300) {
      showToast('Please enter a valid height');
      return;
    }
    if (!weight || isNaN(weightNum) || weightNum <= 0 || weightNum > 1000) {
      showToast('Please enter a valid weight');
      return;
    }

    setSaving(true);
    try {
      await createUserProfile(user.uid, {
        name:   user.displayName || 'User',
        email:  user.email || '',
        goal,
        diet:   DIETS[selDiet],
        age,
        height,
        weight,
        units,
      });
      // Initialize empty pantry
      await setPantry(user.uid, []);
      // Refresh profile in AuthContext — this triggers navigation to Main
      await refreshProfile();
    } catch (err) {
      console.error('Onboard save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Progress bar */}
      <View style={s.progressWrap}>
        <View style={[s.progressTrack, { backgroundColor: palette.bg3 }]}>
          <View style={[s.progressFill, { width: `${(step / totalSteps) * 100}%`, backgroundColor: accent.primary }]} />
        </View>
        <Text style={[s.progressText, { color: palette.textTertiary }]}>{step} / {totalSteps}</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {step === 1 ? (
            <>
              <Text style={[s.eyebrow, { color: accent.primary }]}>Personalize</Text>
              <Text style={[s.title, { color: palette.textPrimary }]}>What's your{'\n'}primary goal?</Text>
              <Text style={[s.sub, { color: palette.textSecondary }]}>We'll tailor your meal plans and workouts around this.</Text>

              <View style={s.goalGrid}>
                {GOALS.map(g => (
                  <View key={g.label} style={s.goalCardWrapper}>
                    <GlassCard
                      level={goal === g.label ? 2 : 1}
                      onPress={() => { hapticSelection(); setGoal(g.label); }}
                      style={goal === g.label ? { borderColor: accent.primary } : undefined}
                    >
                      <Icon name={g.icon} size={26} color={goal === g.label ? accent.primary : palette.textSecondary} />
                      <Text style={[s.goalLabel, { color: goal === g.label ? palette.textPrimary : palette.textSecondary }]}>{g.label}</Text>
                      <Text style={[s.goalDesc, { color: palette.textTertiary }]}>{g.desc}</Text>
                      {goal === g.label && <View style={[s.goalCheck, { backgroundColor: accent.primary }]}><Text style={[s.goalCheckText, { color: palette.textInverse }]}>✓</Text></View>}
                    </GlassCard>
                  </View>
                ))}
              </View>

              <GradientButton label="Continue →" onPress={() => setStep(2)} />
            </>
          ) : (
            <>
              <Text style={[s.eyebrow, { color: accent.primary }]}>Your Stats</Text>
              <Text style={[s.title, { color: palette.textPrimary }]}>Tell us about{'\n'}yourself.</Text>
              <Text style={[s.sub, { color: palette.textSecondary }]}>This helps us calculate your daily targets accurately.</Text>

              <View style={s.fieldGroup}>
                <Text style={[s.fieldLabel, { color: palette.textTertiary }]}>Units</Text>
                <View style={s.unitRow}>
                  {['Imperial', 'Metric'].map(u => (
                    <TouchableOpacity
                      key={u}
                      style={[
                        s.unitChip,
                        { borderColor: palette.border, backgroundColor: palette.bg1 },
                        units === u && { borderColor: accent.primary, backgroundColor: 'rgba(52,199,89,0.05)' },
                      ]}
                      onPress={() => setUnits(u)}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        s.unitText,
                        { color: palette.textSecondary },
                        units === u && { color: accent.primary, fontWeight: '700' },
                      ]}>
                        {u === 'Imperial' ? 'Imperial' : 'Metric'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={s.fieldGroup}>
                <Text style={[s.fieldLabel, { color: palette.textTertiary }]}>Age</Text>
                <TextInput
                  style={[s.input, { backgroundColor: palette.bg1, borderColor: palette.border, color: palette.textPrimary }]}
                  placeholder="25"
                  placeholderTextColor={palette.textTertiary}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                />
              </View>

              <View style={s.row}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <Text style={[s.fieldLabel, { color: palette.textTertiary }]}>Height ({units === 'Imperial' ? 'in' : 'cm'})</Text>
                  <TextInput
                    style={[s.input, { backgroundColor: palette.bg1, borderColor: palette.border, color: palette.textPrimary }]}
                    placeholder={units === 'Imperial' ? '68' : '175'}
                    placeholderTextColor={palette.textTertiary}
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <Text style={[s.fieldLabel, { color: palette.textTertiary }]}>Weight ({units === 'Imperial' ? 'lbs' : 'kg'})</Text>
                  <TextInput
                    style={[s.input, { backgroundColor: palette.bg1, borderColor: palette.border, color: palette.textPrimary }]}
                    placeholder={units === 'Imperial' ? '140' : '65'}
                    placeholderTextColor={palette.textTertiary}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={s.fieldGroup}>
                <Text style={[s.fieldLabel, { color: palette.textTertiary }]}>Dietary Preference</Text>
                <View style={s.dietGrid}>
                  {DIETS.map((d, i) => (
                    <TouchableOpacity
                      key={d}
                      style={[
                        s.dietChip,
                        { borderColor: palette.border, backgroundColor: palette.bg1 },
                        selDiet === i && { borderColor: accent.primary, backgroundColor: accent.primaryBg },
                      ]}
                      onPress={() => { hapticSelection(); setSelDiet(i); }}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        s.dietText,
                        { color: palette.textSecondary },
                        selDiet === i && { color: accent.primary, fontWeight: '700' },
                      ]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={s.btnRow}>
                <TouchableOpacity style={[s.backChip, { borderColor: palette.borderHi }]} onPress={() => setStep(1)}>
                  <Icon name="chevron-back" size={14} color={palette.textSecondary} /><Text style={[s.backChipText, { color: palette.textSecondary }]}>Back</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  {saving ? (
                    <View style={s.savingWrap}>
                      <ActivityIndicator color={accent.primary} />
                      <Text style={[s.savingText, { color: palette.textSecondary }]}>Setting up your profile...</Text>
                    </View>
                  ) : (
                    <GradientButton label="Get Started" onPress={finish} />
                  )}
                </View>
              </View>
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  progressTrack: { flex: 1, height: 3, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 3, borderRadius: 2 },
  progressText: { fontSize: 12, fontWeight: '700' },
  scroll: { padding: SPACING.lg, paddingTop: SPACING.md, paddingBottom: 40 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 38, fontWeight: '900', lineHeight: 44, letterSpacing: -1.2, marginBottom: 10 },
  sub: { fontSize: 14, lineHeight: 22, marginBottom: SPACING.xl },
  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: SPACING.xl },
  goalCardWrapper: { width: '47%' },
  goalEmoji: { fontSize: 26, marginBottom: 8 },
  goalLabel: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  goalDesc: { fontSize: 11 },
  goalCheck: { position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  goalCheckText: { fontSize: 10, fontWeight: '900' },
  fieldGroup: { marginBottom: SPACING.md },
  fieldLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15 },
  row: { flexDirection: 'row', marginBottom: SPACING.md },
  unitRow: { flexDirection: 'row', gap: 10 },
  unitChip: { flex: 1, paddingVertical: 12, borderRadius: RADIUS.md, borderWidth: 1.5, alignItems: 'center' },
  unitText: { fontSize: 14, fontWeight: '600' },
  dietGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dietChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1 },
  dietText: { fontSize: 13, fontWeight: '500' },
  btnRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: SPACING.md },
  backChip: { width: 80, height: 52, borderRadius: RADIUS.full, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 },
  backChipText: { fontSize: 14, fontWeight: '600' },
  savingWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 52 },
  savingText: { fontSize: 14, fontWeight: '600' },
});
