import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { GlassCard, GradientButton, BlurHeader } from '../components';
import Icon from '../components/Icon';
import { SPACING, RADIUS } from '../constants/theme';

// Program week content (static for now — could be moved to Firestore later)
const PROGRAM_WEEKS = {
  'Healthy Habits Kickstart': [
    { week: 1, title: 'Foundation', tasks: ['Log 3 meals daily', 'Drink 8 glasses of water', 'Walk 20 minutes'] },
    { week: 2, title: 'Building Consistency', tasks: ['Hit calorie target 5/7 days', 'Try 2 new recipes', 'Add one workout'] },
    { week: 3, title: 'Momentum', tasks: ['Track all macros', 'Meal prep Sunday', 'Exercise 3x this week'] },
    { week: 4, title: 'Lifestyle', tasks: ['Maintain streak 7 days', 'Review weekly insights', 'Set next month goals'] },
  ],
  'Beginner Fat Loss': [
    { week: 1, title: 'Calorie Awareness', tasks: ['Log everything you eat', 'Calculate your TDEE', 'Set 500 cal deficit'] },
    { week: 2, title: 'Protein Priority', tasks: ['Hit protein goal daily', 'Prep high-protein snacks', 'Reduce liquid calories'] },
    { week: 3, title: 'Movement', tasks: ['3 workouts this week', 'Walk 10k steps daily', 'Active recovery day'] },
    { week: 4, title: 'Habits', tasks: ['No eating after 8pm', 'Meal prep 4 days', 'Weigh in twice'] },
    { week: 5, title: 'Plateau Prep', tasks: ['Adjust calories if needed', 'Try HIIT workout', 'Track body measurements'] },
    { week: 6, title: 'Consistency', tasks: ['Maintain deficit 6/7 days', 'Cook all meals at home', '4 workouts'] },
    { week: 7, title: 'Push Phase', tasks: ['Increase workout intensity', 'Hit all macro targets', 'No cheat meals'] },
    { week: 8, title: 'Sustain', tasks: ['Plan maintenance calories', 'Celebrate progress', 'Set next phase goals'] },
  ],
  'Lean Muscle Building': [
    { week: 1, title: 'Surplus Setup', tasks: ['Calculate 300 cal surplus', 'Plan protein at 1g/lb', 'Start training log'] },
    { week: 2, title: 'Progressive Overload', tasks: ['Add weight or reps each session', 'Eat 4+ meals daily', 'Sleep 7+ hours'] },
    { week: 3, title: 'Volume', tasks: ['Hit each muscle 2x/week', 'Pre/post workout nutrition', 'Track all lifts'] },
    { week: 4, title: 'Recovery', tasks: ['Deload week - reduce volume 40%', 'Focus on mobility', 'Assess progress photos'] },
  ],
  'Cardio Endurance': [
    { week: 1, title: 'Base Building', tasks: ['3 easy runs (20 min)', 'Heart rate zone 2 focus', 'Stretch post-workout'] },
    { week: 2, title: 'Duration', tasks: ['Extend one run to 30 min', 'Add swimming or cycling', 'Fuel with carbs'] },
    { week: 3, title: 'Intervals', tasks: ['Add 1 interval session', 'Tempo run 25 min', 'Rest day between hard days'] },
    { week: 4, title: 'Endurance', tasks: ['Long run 40 min', '4 sessions total', 'Race pace practice'] },
    { week: 5, title: 'Peak', tasks: ['5 sessions this week', 'One long effort 45+ min', 'Reduce volume before test'] },
    { week: 6, title: 'Test & Celebrate', tasks: ['Time trial or event', 'Recovery week', 'Plan next block'] },
  ],
};

export default function ProgramDetailScreen({ navigation, route }) {
  const { mode, palette, accent, gradients } = useTheme();
  const { isPro } = useSubscription();
  const program = route?.params?.program;
  const [expandedWeek, setExpandedWeek] = useState(0);

  const weeks = PROGRAM_WEEKS[program?.name] || [];

  // ── Premium gate for non-free programs ──────────────────────────
  if (!program?.free && !isPro) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
        <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
        <BlurHeader title={program?.name || 'Program'} onBack={() => navigation.goBack()} />
        <View style={s.gateContent}>
          <GlassCard level={2} style={s.gateCard}>
            <View style={[s.iconWrap, { backgroundColor: accent.primary + '15' }]}>
              <Icon name={program?.icon || 'list'} size={32} color={accent.primary} />
            </View>
            <Text style={[s.gateTitle, { color: palette.textPrimary }]}>{program?.name}</Text>
            <Text style={[s.gateSub, { color: palette.textSecondary }]}>{program?.desc}</Text>
          </GlassCard>
          <GradientButton
            label="Unlock with Pro"
            gradient={gradients.premium}
            icon="sparkles"
            onPress={() => navigation.navigate('Paywall')}
            style={s.gateCta}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <BlurHeader title={program?.name || 'Program'} onBack={() => navigation.goBack()} />

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Program header */}
        <GlassCard level={1} style={s.headerCard}>
          <View style={[s.iconWrap, { backgroundColor: accent.primary + '15' }]}>
            <Icon name={program?.icon || 'list'} size={28} color={accent.primary} />
          </View>
          <Text style={[s.programDesc, { color: palette.textSecondary }]}>{program?.desc}</Text>
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <Icon name="time-outline" size={14} color={palette.textTertiary} />
              <Text style={[s.metaText, { color: palette.textTertiary }]}>{program?.duration}</Text>
            </View>
            <View style={s.metaItem}>
              <Icon name="calendar-outline" size={14} color={palette.textTertiary} />
              <Text style={[s.metaText, { color: palette.textTertiary }]}>{weeks.length} weeks</Text>
            </View>
          </View>
        </GlassCard>

        {/* Week cards */}
        {weeks.map((week, i) => (
          <TouchableOpacity
            key={i}
            activeOpacity={0.8}
            onPress={() => setExpandedWeek(expandedWeek === i ? -1 : i)}
          >
            <GlassCard level={1} style={s.weekCard}>
              <View style={s.weekHeader}>
                <View style={s.weekLeft}>
                  <View style={[s.weekBadge, { backgroundColor: accent.primaryBg }]}>
                    <Text style={[s.weekBadgeText, { color: accent.primary }]}>W{week.week}</Text>
                  </View>
                  <Text style={[s.weekTitle, { color: palette.textPrimary }]}>{week.title}</Text>
                </View>
                <Icon
                  name={expandedWeek === i ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={palette.textTertiary}
                />
              </View>

              {expandedWeek === i && (
                <View style={s.taskList}>
                  {week.tasks.map((task, ti) => (
                    <View key={ti} style={s.taskItem}>
                      <Icon name="ellipse-outline" size={12} color={palette.textTertiary} />
                      <Text style={[s.taskText, { color: palette.textSecondary }]}>{task}</Text>
                    </View>
                  ))}
                </View>
              )}
            </GlassCard>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },

  gateContent: { flex: 1, justifyContent: 'center', padding: SPACING.md },
  gateCard: { alignItems: 'center', marginBottom: 20 },
  iconWrap: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  gateTitle: { fontSize: 22, fontWeight: '900', marginBottom: 8 },
  gateSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  gateCta: { marginTop: 4 },

  headerCard: { alignItems: 'center', marginBottom: SPACING.md },
  programDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 12 },
  metaRow: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontWeight: '500' },

  weekCard: { marginBottom: 8 },
  weekHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  weekLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  weekBadge: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  weekBadgeText: { fontSize: 12, fontWeight: '800' },
  weekTitle: { fontSize: 15, fontWeight: '700' },

  taskList: { marginTop: 12, paddingLeft: 42, gap: 8 },
  taskItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  taskText: { fontSize: 14, lineHeight: 19 },
});
