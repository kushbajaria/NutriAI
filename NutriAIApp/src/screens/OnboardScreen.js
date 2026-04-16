import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING } from '../constants/theme';
import { GOALS, DIETS } from '../constants/data';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { createUserProfile, setPantry } from '../services/firestore';
import { PillButton } from '../components/UI';
import Icon from '../components/Icon';
import { hapticSelection } from '../utils/haptics';

export default function OnboardScreen() {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useUI();

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
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={C.black} />

      {/* Progress bar */}
      <View style={s.progressWrap}>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${(step / totalSteps) * 100}%` }]} />
        </View>
        <Text style={s.progressText}>{step} / {totalSteps}</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {step === 1 ? (
            <>
              <Text style={s.eyebrow}>Personalize</Text>
              <Text style={s.title}>What's your{'\n'}primary goal?</Text>
              <Text style={s.sub}>We'll tailor your meal plans and workouts around this.</Text>

              <View style={s.goalGrid}>
                {GOALS.map(g => (
                  <TouchableOpacity
                    key={g.label}
                    style={[s.goalCard, goal === g.label && s.goalCardActive]}
                    onPress={() => { hapticSelection(); setGoal(g.label); }}
                    activeOpacity={0.8}
                  >
                    <Icon name={g.icon} size={26} color={goal === g.label ? C.accent : C.textSecondary} />
                    <Text style={[s.goalLabel, goal === g.label && s.goalLabelActive]}>{g.label}</Text>
                    <Text style={s.goalDesc}>{g.desc}</Text>
                    {goal === g.label && <View style={s.goalCheck}><Text style={s.goalCheckText}>✓</Text></View>}
                  </TouchableOpacity>
                ))}
              </View>

              <PillButton label="Continue →" onPress={() => setStep(2)} />
            </>
          ) : (
            <>
              <Text style={s.eyebrow}>Your Stats</Text>
              <Text style={s.title}>Tell us about{'\n'}yourself.</Text>
              <Text style={s.sub}>This helps us calculate your daily targets accurately.</Text>

              <View style={s.fieldGroup}>
                <Text style={s.fieldLabel}>Units</Text>
                <View style={s.unitRow}>
                  {['Imperial', 'Metric'].map(u => (
                    <TouchableOpacity
                      key={u}
                      style={[s.unitChip, units === u && s.unitChipActive]}
                      onPress={() => setUnits(u)}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.unitText, units === u && s.unitTextActive]}>
                        {u === 'Imperial' ? 'Imperial' : 'Metric'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={s.fieldGroup}>
                <Text style={s.fieldLabel}>Age</Text>
                <TextInput style={s.input} placeholder="25" placeholderTextColor={C.textTertiary} value={age} onChangeText={setAge} keyboardType="numeric" />
              </View>

              <View style={s.row}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <Text style={s.fieldLabel}>Height ({units === 'Imperial' ? 'in' : 'cm'})</Text>
                  <TextInput style={s.input} placeholder={units === 'Imperial' ? '68' : '175'} placeholderTextColor={C.textTertiary} value={height} onChangeText={setHeight} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <Text style={s.fieldLabel}>Weight ({units === 'Imperial' ? 'lbs' : 'kg'})</Text>
                  <TextInput style={s.input} placeholder={units === 'Imperial' ? '140' : '65'} placeholderTextColor={C.textTertiary} value={weight} onChangeText={setWeight} keyboardType="numeric" />
                </View>
              </View>

              <View style={s.fieldGroup}>
                <Text style={s.fieldLabel}>Dietary Preference</Text>
                <View style={s.dietGrid}>
                  {DIETS.map((d, i) => (
                    <TouchableOpacity
                      key={d}
                      style={[s.dietChip, selDiet === i && s.dietChipActive]}
                      onPress={() => { hapticSelection(); setSelDiet(i); }}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.dietText, selDiet === i && s.dietTextActive]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={s.btnRow}>
                <TouchableOpacity style={s.backChip} onPress={() => setStep(1)}>
                  <Text style={s.backChipText}>← Back</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  {saving ? (
                    <View style={s.savingWrap}>
                      <ActivityIndicator color={C.accent} />
                      <Text style={s.savingText}>Setting up your profile...</Text>
                    </View>
                  ) : (
                    <PillButton label="Get Started" onPress={finish} />
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
  safe: { flex: 1, backgroundColor: C.black },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  progressTrack: { flex: 1, height: 3, backgroundColor: C.surface3, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 3, backgroundColor: C.accent, borderRadius: 2 },
  progressText: { fontSize: 12, fontWeight: '700', color: C.textTertiary },
  scroll: { padding: SPACING.lg, paddingTop: SPACING.md, paddingBottom: 40 },
  eyebrow: { fontSize: 10, fontWeight: '700', color: C.accent, letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 38, fontWeight: '900', color: C.textPrimary, lineHeight: 44, letterSpacing: -1.2, marginBottom: 10 },
  sub: { fontSize: 14, color: C.textSecondary, lineHeight: 22, marginBottom: SPACING.xl },
  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: SPACING.xl },
  goalCard: { width: '47%', backgroundColor: C.surface1, borderWidth: 1.5, borderColor: C.border, borderRadius: RADIUS.lg, padding: SPACING.md, position: 'relative' },
  goalCardActive: { borderColor: C.accent, backgroundColor: C.accentBgSm },
  goalEmoji: { fontSize: 26, marginBottom: 8 },
  goalLabel: { fontSize: 15, fontWeight: '700', color: C.textSecondary, marginBottom: 3 },
  goalLabelActive: { color: C.textPrimary },
  goalDesc: { fontSize: 11, color: C.textTertiary },
  goalCheck: { position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 10, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  goalCheckText: { fontSize: 10, fontWeight: '900', color: C.textInverse },
  fieldGroup: { marginBottom: SPACING.md },
  fieldLabel: { fontSize: 10, fontWeight: '700', color: C.textTertiary, letterSpacing: 1.2, marginBottom: 8 },
  input: { backgroundColor: C.surface1, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 14, color: C.textPrimary, fontSize: 15 },
  row: { flexDirection: 'row', marginBottom: SPACING.md },
  unitRow: { flexDirection: 'row', gap: 10 },
  unitChip: { flex: 1, paddingVertical: 12, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.surface1, alignItems: 'center' },
  unitChipActive: { borderColor: C.accent, backgroundColor: C.accentBgSm },
  unitText: { fontSize: 14, color: C.textSecondary, fontWeight: '600' },
  unitTextActive: { color: C.accent, fontWeight: '700' },
  dietGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dietChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface1 },
  dietChipActive: { borderColor: C.accent, backgroundColor: C.accentBg },
  dietText: { fontSize: 13, color: C.textSecondary, fontWeight: '500' },
  dietTextActive: { color: C.accent, fontWeight: '700' },
  btnRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: SPACING.md },
  backChip: { width: 80, height: 52, borderRadius: RADIUS.full, borderWidth: 1, borderColor: C.borderHi, alignItems: 'center', justifyContent: 'center' },
  backChipText: { fontSize: 14, color: C.textSecondary, fontWeight: '600' },
  savingWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 52 },
  savingText: { fontSize: 14, color: C.textSecondary, fontWeight: '600' },
});
