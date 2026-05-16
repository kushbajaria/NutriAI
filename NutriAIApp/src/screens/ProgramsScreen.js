import React from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { GlassCard, GradientButton, BlurHeader } from '../components';
import Icon from '../components/Icon';
import { RADIUS, SPACING } from '../constants/theme';

const PROGRAMS = [
  { name: 'Healthy Habits Kickstart', duration: '4 weeks', icon: 'heart', free: true, desc: 'Build sustainable habits with guided daily challenges.' },
  { name: 'Beginner Fat Loss', duration: '8 weeks', icon: 'flame', free: false, desc: 'Structured plan combining nutrition and training for fat loss.' },
  { name: 'Lean Muscle Building', duration: '12 weeks', icon: 'barbell', free: false, desc: 'Progressive overload program with high-protein meal planning.' },
  { name: 'Cardio Endurance', duration: '6 weeks', icon: 'bicycle', free: false, desc: 'Build stamina with interval training and performance nutrition.' },
];

export default function ProgramsScreen({ navigation }) {
  const { mode, palette, accent, gradients } = useTheme();
  const { isPro } = useSubscription();

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <BlurHeader title="Programs" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {PROGRAMS.map((p, i) => {
          const locked = !p.free && !isPro;
          return (
            <TouchableOpacity
              key={i}
              activeOpacity={0.7}
              onPress={() => {
                if (locked) {
                  navigation.navigate('Paywall');
                } else {
                  navigation.navigate('ProgramDetail', { program: p });
                }
              }}
            >
              <GlassCard level={1} style={s.programCard}>
                <View style={[s.programIcon, { backgroundColor: (locked ? palette.textTertiary : accent.primary) + '15' }]}>
                  <Icon name={p.icon} size={22} color={locked ? palette.textTertiary : accent.primary} />
                </View>
                <View style={s.programInfo}>
                  <Text style={[s.programName, { color: palette.textPrimary }]}>{p.name}</Text>
                  <Text style={[s.programDuration, { color: palette.textTertiary }]}>{p.duration}</Text>
                  <Text style={[s.programDesc, { color: palette.textSecondary }]}>{p.desc}</Text>
                </View>
                {locked ? (
                  <Icon name="lock-closed" size={18} color={palette.textTertiary} />
                ) : p.free ? (
                  <View style={[s.freeBadge, { backgroundColor: accent.primary + '15' }]}>
                    <Text style={[s.freeText, { color: accent.primary }]}>Free</Text>
                  </View>
                ) : (
                  <Icon name="chevron-forward" size={18} color={palette.textTertiary} />
                )}
              </GlassCard>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },
  programCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  programIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  programInfo: { flex: 1 },
  programName: { fontSize: 15, fontWeight: '700' },
  programDuration: { fontSize: 12, marginTop: 1 },
  programDesc: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  freeBadge: { borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 6 },
  freeText: { fontSize: 12, fontWeight: '700' },
});
