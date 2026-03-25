import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Badge, SectionHeader, GlowDot } from '../components/UI';

const SETTINGS = ['Notifications', 'Units (Metric)', 'Data & Privacy', 'About NutriAI'];

export default function ProfileScreen({ navigation }) {
  const { goal, age, height, weight, diet, loggedMeals, user, setUser } = useApp();
  const signOut = () => { setUser(null); navigation.replace('Auth'); };

  const firstName = user?.name?.split(' ')[0] || 'User';
  const initial   = firstName[0]?.toUpperCase();

  const stats = [
    { val: loggedMeals.length, lbl: 'Meals',     color: C.lime    },
    { val: '3',                lbl: 'Workouts',   color: C.blue    },
    { val: '85%',              lbl: 'Adherence',  color: C.protein },
  ];

  const dataRows = [
    { label: 'Goal',               value: goal,                       badge: true  },
    { label: 'Dietary Preference', value: diet || 'No Restrictions',  badge: false },
    { label: 'Age',                value: age    ? `${age} yrs`  : '—', badge: false },
    { label: 'Height',             value: height ? `${height} cm` : '—', badge: false },
    { label: 'Weight',             value: weight ? `${weight} kg` : '—', badge: false },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Avatar block */}
        <View style={s.avatarBlock}>
          {/* Decorative ring behind avatar */}
          <View style={s.avatarRing}>
            <View style={s.avatar}>
              <Text style={s.avatarInitial}>{initial}</Text>
            </View>
          </View>
          <Text style={s.name}>{user?.name || 'Demo User'}</Text>
          <Text style={s.email}>{user?.email || 'demo@nutriai.app'}</Text>
          <View style={s.memberPill}>
            <GlowDot size={5} />
            <Text style={s.memberText}>ACTIVE MEMBER</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          {stats.map(st => (
            <View key={st.lbl} style={[s.statCard, { borderColor: st.color + '25' }]}>
              <Text style={[s.statVal, { color: st.color }]}>{st.val}</Text>
              <Text style={s.statLbl}>{st.lbl}</Text>
            </View>
          ))}
        </View>

        {/* Your data */}
        <SectionHeader title="YOUR DATA" />
        <View style={s.infoBlock}>
          {dataRows.map((r, i) => (
            <View key={r.label} style={[s.infoRow, i === dataRows.length - 1 && s.infoRowLast]}>
              <Text style={s.infoLabel}>{r.label}</Text>
              {r.badge
                ? <Badge label={r.value} color={C.lime} />
                : <Text style={s.infoValue}>{r.value}</Text>
              }
            </View>
          ))}
        </View>

        {/* Settings */}
        <SectionHeader title="SETTINGS" />
        <View style={s.infoBlock}>
          {SETTINGS.map((item, i) => (
            <TouchableOpacity
              key={item}
              style={[s.settingRow, i === SETTINGS.length - 1 && s.infoRowLast]}
              activeOpacity={0.7}
            >
              <Text style={s.settingLabel}>{item}</Text>
              <Text style={s.settingArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={s.signOutBtn} onPress={signOut} activeOpacity={0.8}>
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={s.version}>NutriAI v1.0.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.black },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.borderHi, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 18, color: C.lime, marginTop: -1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.textPrimary },

  scroll: { padding: SPACING.md, paddingBottom: 60 },

  // Avatar
  avatarBlock: {
    alignItems: 'center', paddingVertical: SPACING.xl,
    borderBottomWidth: 1, borderBottomColor: C.border, marginBottom: SPACING.lg,
  },
  avatarRing: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 2, borderColor: C.lime + '50',
    padding: 4, marginBottom: SPACING.sm,
    ...SHADOW.lime,
  },
  avatar: {
    flex: 1, borderRadius: 40,
    backgroundColor: C.lime,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontSize: 38, fontWeight: '900', color: C.textInverse },
  name:  { fontSize: 24, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.5, marginBottom: 4 },
  email: { fontSize: 14, color: C.textSecondary, marginBottom: SPACING.sm },
  memberPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.limeGlow, borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: C.lime + '30',
  },
  memberText: { fontSize: 9, fontWeight: '800', color: C.lime, letterSpacing: 1.8 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.lg },
  statCard: {
    flex: 1, backgroundColor: C.surface1, borderRadius: RADIUS.lg,
    padding: SPACING.md, alignItems: 'center',
    borderWidth: 1,
  },
  statVal: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  statLbl: { fontSize: 10, color: C.textTertiary, fontWeight: '600', marginTop: 3, letterSpacing: 0.3 },

  // Info block
  infoBlock: {
    backgroundColor: C.surface1, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: C.border,
    overflow: 'hidden', marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: 15,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel: { fontSize: 14, color: C.textSecondary, fontWeight: '500' },
  infoValue: { fontSize: 14, color: C.textPrimary, fontWeight: '600' },

  // Settings
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: 17,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  settingLabel: { fontSize: 15, color: C.textPrimary, fontWeight: '500' },
  settingArrow: { fontSize: 22, color: C.textTertiary, fontWeight: '300' },

  // Sign out
  signOutBtn: {
    borderWidth: 1, borderColor: C.red + '40',
    borderRadius: RADIUS.lg, padding: 16,
    alignItems: 'center', marginBottom: SPACING.md,
    backgroundColor: C.redGlow,
  },
  signOutText: { fontSize: 15, fontWeight: '700', color: C.red },
  version:     { textAlign: 'center', fontSize: 11, color: C.textTertiary, fontWeight: '500' },
});
