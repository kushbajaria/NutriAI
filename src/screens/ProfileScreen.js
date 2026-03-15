import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { ScreenHeader, SectionHeader, Badge } from '../components/UI';

export default function ProfileScreen({ navigation }) {
  const { goal, age, height, weight, diet, loggedMeals, setUser } = useApp();

  const signOut = () => { setUser(null); navigation.replace('Auth'); };

  const stats = [
    { val: loggedMeals.length, lbl: 'Meals',     color: C.lime    },
    { val: '3',                lbl: 'Workouts',  color: C.blue    },
    { val: '85%',              lbl: 'Adherence', color: C.protein },
  ];

  const rows = [
    { label: 'Goal',               value: goal,                          badge: true  },
    { label: 'Dietary Preference', value: diet || 'No Restrictions',     badge: false },
    { label: 'Age',                value: age    ? `${age} years`  : '—',badge: false },
    { label: 'Height',             value: height ? `${height} cm`  : '—',badge: false },
    { label: 'Weight',             value: weight ? `${weight} kg`  : '—',badge: false },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScreenHeader title="Profile" subtitle="ACCOUNT" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Avatar block */}
        <View style={s.avatarBlock}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>D</Text>
          </View>
          <Text style={s.name}>Demo User</Text>
          <Text style={s.email}>demo@nutriai.app</Text>
          <View style={s.memberBadge}><Text style={s.memberText}>● ACTIVE MEMBER</Text></View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {stats.map(st => (
            <View key={st.lbl} style={s.statCard}>
              <Text style={[s.statVal, { color: st.color }]}>{st.val}</Text>
              <Text style={s.statLbl}>{st.lbl}</Text>
            </View>
          ))}
        </View>

        {/* Info */}
        <SectionHeader title="YOUR DATA" />
        <View style={s.infoBlock}>
          {rows.map(r => (
            <View key={r.label} style={s.infoRow}>
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
          {['Notifications', 'Units (Metric)', 'Data & Privacy', 'About NutriAI'].map(item => (
            <TouchableOpacity key={item} style={s.settingRow} activeOpacity={0.7}>
              <Text style={s.settingLabel}>{item}</Text>
              <Text style={s.settingArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={s.signOutBtn} onPress={signOut} activeOpacity={0.8}>
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={s.versionText}>NutriAI v1.0.0 · Built at CSUF</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.black },
  scroll: { padding: SPACING.md, paddingBottom: 60 },
  avatarBlock: { alignItems: 'center', paddingVertical: SPACING.xl, borderBottomWidth: 1, borderBottomColor: C.border, marginBottom: SPACING.lg },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  avatarText: { fontSize: 36, fontWeight: '900', color: C.textInverse },
  name: { fontSize: 24, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.5, marginBottom: 4 },
  email: { fontSize: 14, color: C.textSecondary, marginBottom: SPACING.sm },
  memberBadge: { backgroundColor: C.limeGlow, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: C.lime + '30' },
  memberText: { fontSize: 10, fontWeight: '700', color: C.lime, letterSpacing: 1.2 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.lg },
  statCard: { flex: 1, backgroundColor: C.surface1, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  statVal: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  statLbl: { fontSize: 11, color: C.textTertiary, fontWeight: '600', marginTop: 3 },
  infoBlock: { backgroundColor: C.surface1, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: SPACING.lg },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  infoLabel: { fontSize: 14, color: C.textSecondary, fontWeight: '500' },
  infoValue: { fontSize: 14, color: C.textPrimary, fontWeight: '600' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  settingLabel: { fontSize: 15, color: C.textPrimary, fontWeight: '500' },
  settingArrow: { fontSize: 16, color: C.textTertiary },
  signOutBtn: { borderWidth: 1, borderColor: C.red + '40', borderRadius: RADIUS.lg, padding: 16, alignItems: 'center', marginBottom: SPACING.md },
  signOutText: { fontSize: 15, fontWeight: '700', color: C.red },
  versionText: { textAlign: 'center', fontSize: 11, color: C.textTertiary, fontWeight: '500' },
});
