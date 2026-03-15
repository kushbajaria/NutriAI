import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING } from '../constants/theme';
import { GOALS, DIETS } from '../constants/data';
import { useApp } from '../context/AppContext';
import { PillButton, ScreenHeader } from '../components/UI';

export default function OnboardScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const { goal, setGoal, age, setAge, height, setHeight, weight, setWeight, setDiet } = useApp();
  const [selDiet, setSelDiet] = useState(0);
  const totalSteps = 2;

  const finish = () => {
    setDiet(DIETS[selDiet]);
    navigation.replace('Main');
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
              <Text style={s.eyebrow}>PERSONALIZE</Text>
              <Text style={s.title}>What's your{'\n'}primary goal?</Text>
              <Text style={s.sub}>We'll tailor your meal plans and workouts around this.</Text>

              <View style={s.goalGrid}>
                {GOALS.map(g => (
                  <TouchableOpacity
                    key={g.label}
                    style={[s.goalCard, goal === g.label && s.goalCardActive]}
                    onPress={() => setGoal(g.label)}
                    activeOpacity={0.8}
                  >
                    <Text style={s.goalEmoji}>{g.icon}</Text>
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
              <Text style={s.eyebrow}>YOUR STATS</Text>
              <Text style={s.title}>Tell us about{'\n'}yourself.</Text>
              <Text style={s.sub}>This helps us calculate your daily targets accurately.</Text>

              <View style={s.fieldGroup}>
                <Text style={s.fieldLabel}>AGE</Text>
                <TextInput style={s.input} placeholder="25" placeholderTextColor={C.textTertiary} value={age} onChangeText={setAge} keyboardType="numeric" />
              </View>

              <View style={s.row}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <Text style={s.fieldLabel}>HEIGHT</Text>
                  <TextInput style={s.input} placeholder="175 cm" placeholderTextColor={C.textTertiary} value={height} onChangeText={setHeight} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <Text style={s.fieldLabel}>WEIGHT</Text>
                  <TextInput style={s.input} placeholder="70 kg" placeholderTextColor={C.textTertiary} value={weight} onChangeText={setWeight} keyboardType="numeric" />
                </View>
              </View>

              <View style={s.fieldGroup}>
                <Text style={s.fieldLabel}>DIETARY PREFERENCE</Text>
                <View style={s.dietGrid}>
                  {DIETS.map((d, i) => (
                    <TouchableOpacity
                      key={d}
                      style={[s.dietChip, selDiet === i && s.dietChipActive]}
                      onPress={() => setSelDiet(i)}
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
                  <PillButton label="Get Started" onPress={finish} />
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
  progressFill: { height: 3, backgroundColor: C.lime, borderRadius: 2 },
  progressText: { fontSize: 12, fontWeight: '700', color: C.textTertiary },
  scroll: { padding: SPACING.lg, paddingTop: SPACING.md, paddingBottom: 40 },
  eyebrow: { fontSize: 10, fontWeight: '700', color: C.lime, letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 38, fontWeight: '900', color: C.textPrimary, lineHeight: 44, letterSpacing: -1.2, marginBottom: 10 },
  sub: { fontSize: 14, color: C.textSecondary, lineHeight: 22, marginBottom: SPACING.xl },
  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: SPACING.xl },
  goalCard: { width: '47%', backgroundColor: C.surface1, borderWidth: 1.5, borderColor: C.border, borderRadius: RADIUS.lg, padding: SPACING.md, position: 'relative' },
  goalCardActive: { borderColor: C.lime, backgroundColor: C.limeGlowSm },
  goalEmoji: { fontSize: 26, marginBottom: 8 },
  goalLabel: { fontSize: 15, fontWeight: '700', color: C.textSecondary, marginBottom: 3 },
  goalLabelActive: { color: C.textPrimary },
  goalDesc: { fontSize: 11, color: C.textTertiary },
  goalCheck: { position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 10, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  goalCheckText: { fontSize: 10, fontWeight: '900', color: C.textInverse },
  fieldGroup: { marginBottom: SPACING.md },
  fieldLabel: { fontSize: 10, fontWeight: '700', color: C.textTertiary, letterSpacing: 1.2, marginBottom: 8 },
  input: { backgroundColor: C.surface1, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 14, color: C.textPrimary, fontSize: 15 },
  row: { flexDirection: 'row', marginBottom: SPACING.md },
  dietGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dietChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface1 },
  dietChipActive: { borderColor: C.lime, backgroundColor: C.limeGlow },
  dietText: { fontSize: 13, color: C.textSecondary, fontWeight: '500' },
  dietTextActive: { color: C.lime, fontWeight: '700' },
  btnRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: SPACING.md },
  backChip: { width: 80, height: 52, borderRadius: RADIUS.full, borderWidth: 1, borderColor: C.borderHi, alignItems: 'center', justifyContent: 'center' },
  backChipText: { fontSize: 14, color: C.textSecondary, fontWeight: '600' },
});
