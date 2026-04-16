import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Image,
  Modal, TextInput, KeyboardAvoidingView, Platform, Linking, Share, ActivityIndicator, Alert,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { useUI } from '../context/UIContext';
import { signOutUser, deleteAccount, reauthenticateWithPassword } from '../services/auth';
import { exportUserData, updateUserProfile } from '../services/firestore';
import { Badge, SectionHeader } from '../components/UI';
import Icon from '../components/Icon';

const GOALS = ['Lose Weight', 'Build Muscle', 'Stay Healthy', 'Boost Energy'];
const DIETS = ['No Restrictions', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];

const GOAL_ICONS = { 'Lose Weight': 'flame-outline', 'Build Muscle': 'barbell-outline', 'Stay Healthy': 'heart-outline', 'Boost Energy': 'flash-outline' };
const DIET_ICONS = {
  'No Restrictions': 'restaurant-outline', Vegetarian: 'leaf-outline', Vegan: 'leaf-outline',
  'Gluten-Free': 'nutrition-outline', 'Dairy-Free': 'water-outline', Keto: 'fish-outline', Paleo: 'flame-outline',
};

// ── BOTTOM SHEET WRAPPER ───────────────────────────────────────────
function Sheet({ visible, onClose, title, children }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={ps.overlay} activeOpacity={1} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
          <TouchableOpacity style={ps.sheet} activeOpacity={1}>
            <View style={ps.sheetHandle} />
            <Text style={ps.sheetTitle}>{title}</Text>
            {children}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

// ── OPTION LIST (goal / diet picker) ──────────────────────────────
function OptionList({ options, selected, iconMap, onSelect }) {
  return (
    <View style={ps.optionList}>
      {options.map(opt => {
        const active = opt === selected;
        return (
          <TouchableOpacity
            key={opt}
            style={[ps.optionRow, active && ps.optionRowActive]}
            onPress={() => onSelect(opt)}
            activeOpacity={0.75}
          >
            <Icon name={iconMap[opt]} size={20} color={active ? C.accent : C.textSecondary} />
            <Text style={[ps.optionLabel, active && ps.optionLabelActive]}>{opt}</Text>
            {active && <View style={ps.optionCheck}><Text style={ps.optionCheckMark}>✓</Text></View>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── NUMBER INPUT SHEET ─────────────────────────────────────────────
function NumberSheet({ visible, onClose, title, placeholder, unit, value, onSave, fieldKey }) {
  const [val, setVal] = useState(value || '');
  const { showToast } = useUI();
  const save = () => {
    const num = parseFloat(val);
    if (!val || isNaN(num) || num <= 0) {
      showToast('Please enter a valid number');
      return;
    }
    if (fieldKey === 'age' && (num < 13 || num > 120)) {
      showToast('Age must be between 13 and 120');
      return;
    }
    if (fieldKey === 'height' && num > 300) {
      showToast('Please enter a valid height');
      return;
    }
    if (fieldKey === 'weight' && num > 1000) {
      showToast('Please enter a valid weight');
      return;
    }
    if (fieldKey === 'calGoal' && (num < 800 || num > 10000)) {
      showToast('Calorie goal must be 800-10,000');
      return;
    }
    onSave(val);
    onClose();
  };
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View style={ps.inputRow}>
        <TextInput
          style={ps.numInput}
          value={val}
          onChangeText={setVal}
          keyboardType="numeric"
          placeholder={placeholder}
          placeholderTextColor={C.textTertiary}
          autoFocus
          maxLength={5}
        />
        {unit ? <Text style={ps.numUnit}>{unit}</Text> : null}
      </View>
      <TouchableOpacity style={ps.saveBtn} onPress={save} activeOpacity={0.85}>
        <Text style={ps.saveBtnText}>Save</Text>
      </TouchableOpacity>
    </Sheet>
  );
}

// ── MAIN SCREEN ────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const {
    goal, setGoal,
    age,  setAge,
    height, setHeight,
    weight, setWeight,
    diet, setDiet,
    units, setUnits,
    calGoal, setCalGoal,
    loggedMeals, completedWorkouts, user, profile, refreshProfile,
    healthKitEnabled,
  } = useApp();

  const profilePhoto = profile?.profilePhoto || null;

  const [activeSheet, setActiveSheet] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  const handlePickPhoto = useCallback(() => {
    Alert.alert('Profile Photo', 'Choose a source', [
      {
        text: 'Camera',
        onPress: () => pickImage(launchCamera),
      },
      {
        text: 'Photo Library',
        onPress: () => pickImage(launchImageLibrary),
      },
      profilePhoto ? {
        text: 'Remove Photo',
        style: 'destructive',
        onPress: async () => {
          if (!user?.uid) return;
          setPhotoLoading(true);
          try {
            await updateUserProfile(user.uid, { profilePhoto: null });
            await refreshProfile();
          } catch {} finally { setPhotoLoading(false); }
        },
      } : null,
      { text: 'Cancel', style: 'cancel' },
    ].filter(Boolean));
  }, [profilePhoto, user?.uid, refreshProfile]);

  const pickImage = useCallback(async (launcher) => {
    try {
      const result = await launcher({
        mediaType: 'photo',
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.7,
        includeBase64: true,
      });
      if (result.didCancel || !result.assets?.[0]?.base64) return;
      const base64 = `data:${result.assets[0].type || 'image/jpeg'};base64,${result.assets[0].base64}`;
      if (!user?.uid) return;
      setPhotoLoading(true);
      await updateUserProfile(user.uid, { profilePhoto: base64 });
      await refreshProfile();
    } catch (err) {
      console.warn('Photo pick error:', err.message);
    } finally {
      setPhotoLoading(false);
    }
  }, [user?.uid, refreshProfile]);

  const signOut = async () => {
    try { await signOutUser(); } catch (e) { console.warn('Sign out error:', e); }
  };

  const handleExportData = async () => {
    if (!user?.uid || exporting) return;
    setExporting(true);
    try {
      const data = await exportUserData(user.uid);
      const json = JSON.stringify(data, null, 2);
      await Share.share({ message: json, title: 'NutriSmart Data Export' });
    } catch (err) {
      console.warn('Export failed:', err.message);
      showToast('Failed to export data. Try again.');
    } finally {
      setExporting(false);
    }
  };
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // For email/password users, prompt for password re-auth
            const currentUser = require('@react-native-firebase/auth').default().currentUser;
            const isEmailUser = currentUser?.providerData?.some(p => p.providerId === 'password');

            if (isEmailUser) {
              Alert.prompt(
                'Confirm Password',
                'Enter your password to confirm account deletion.',
                async (password) => {
                  if (!password) return;
                  setDeleting(true);
                  try {
                    await reauthenticateWithPassword(password);
                    await deleteAccount();
                  } catch (err) {
                    setDeleting(false);
                    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                      showToast('Incorrect password.');
                    } else {
                      showToast('Failed to delete account. Try again.');
                    }
                  }
                },
                'secure-text'
              );
            } else {
              // Google/Apple users — Firebase may require recent auth
              setDeleting(true);
              deleteAccount().catch(err => {
                setDeleting(false);
                if (err.code === 'auth/requires-recent-login') {
                  showToast('Please sign out and sign back in, then try again.');
                } else {
                  showToast('Failed to delete account. Try again.');
                }
              });
            }
          },
        },
      ]
    );
  };

  const displayName = user?.displayName || user?.name || 'User';
  const firstName   = displayName.split(' ')[0];
  const initial     = firstName[0]?.toUpperCase();

  const workoutCount = completedWorkouts?.length || 0;
  // Calculate active days in last 7 days
  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toDateString();
  });
  const activeDays = new Set([
    ...loggedMeals.filter(m => last7.includes(m.date)).map(m => m.date),
    ...completedWorkouts.filter(w => last7.includes(w.date)).map(w => w.date),
  ]).size;
  const stats = [
    { val: loggedMeals.length, lbl: 'Meals',    color: C.accent    },
    { val: workoutCount,       lbl: 'Workouts',  color: C.blue    },
    { val: activeDays > 0 ? `${Math.round((activeDays / 7) * 100)}%` : '—', lbl: 'Active', color: C.protein },
  ];

  const dataRows = [
    { key: 'goal',    label: 'Goal',               display: goal,                       badge: true  },
    { key: 'diet',    label: 'Dietary Preference',  display: diet || 'No Restrictions',  badge: false },
    { key: 'calGoal', label: 'Daily Calorie Goal',  display: `${calGoal} kcal`,          badge: false },
    { key: 'age',     label: 'Age',                 display: age    ? `${age} yrs`   : '—', badge: false },
    { key: 'height',  label: 'Height',              display: height ? `${height} ${units === 'Metric' ? 'cm' : 'in'}`   : '—', badge: false },
    { key: 'weight',  label: 'Weight',              display: weight ? `${weight} ${units === 'Metric' ? 'kg' : 'lbs'}` : '—', badge: false },
  ];

  return (
    <SafeAreaView style={ps.safe} edges={['top']}>

      {/* Header */}
      <View style={ps.header}>
        <TouchableOpacity style={ps.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={ps.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={ps.headerTitle}>Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ps.scroll}>

        {/* Avatar block */}
        <View style={ps.avatarBlock}>
          <TouchableOpacity style={ps.avatarRing} onPress={handlePickPhoto} activeOpacity={0.8}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={ps.avatarImage} />
            ) : (
              <View style={ps.avatar}>
                <Text style={ps.avatarInitial}>{initial}</Text>
              </View>
            )}
            <View style={ps.avatarCameraBadge}>
              {photoLoading ? (
                <ActivityIndicator size="small" color={C.textInverse} />
              ) : (
                <Icon name="camera" size={14} color={C.textInverse} />
              )}
            </View>
          </TouchableOpacity>
          <Text style={ps.name}>{displayName}</Text>
          <Text style={ps.email}>{user?.email || ''}</Text>
          <View style={ps.memberPill}>
            <Text style={ps.memberText}>Active Member</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={ps.statsRow}>
          {stats.map(st => (
            <View key={st.lbl} style={[ps.statCard, { borderColor: st.color + '25' }]}>
              <Text style={[ps.statVal, { color: st.color }]}>{st.val}</Text>
              <Text style={ps.statLbl}>{st.lbl}</Text>
            </View>
          ))}
        </View>

        {/* Your data — each row is tappable */}
        <SectionHeader title="Your Data" />
        <View style={ps.infoBlock}>
          {dataRows.map((r, i) => (
            <TouchableOpacity
              key={r.key}
              style={[ps.infoRow, i === dataRows.length - 1 && ps.infoRowLast]}
              onPress={() => setActiveSheet(r.key)}
              activeOpacity={0.7}
            >
              <Text style={ps.infoLabel}>{r.label}</Text>
              <View style={ps.infoRight}>
                {r.badge
                  ? <Badge label={r.display} color={C.accent} />
                  : <Text style={ps.infoValue}>{r.display}</Text>
                }
                <Text style={ps.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings */}
        <SectionHeader title="Settings" />
        <View style={ps.infoBlock}>

          {/* Units toggle */}
          <TouchableOpacity
            style={ps.settingRow}
            onPress={() => setUnits(units === 'Metric' ? 'Imperial' : 'Metric')}
            activeOpacity={0.7}
          >
            <View style={ps.settingLeft}>
              <Icon name="resize-outline" size={18} color={C.textSecondary} />
              <Text style={ps.settingLabel}>Units</Text>
            </View>
            <View style={ps.unitToggle}>
              <View style={[ps.unitChip, units === 'Metric' && ps.unitChipActive]}>
                <Text style={[ps.unitChipText, units === 'Metric' && ps.unitChipTextActive]}>Metric</Text>
              </View>
              <View style={[ps.unitChip, units === 'Imperial' && ps.unitChipActive]}>
                <Text style={[ps.unitChipText, units === 'Imperial' && ps.unitChipTextActive]}>Imperial</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Data & Privacy */}
          <TouchableOpacity
            style={ps.settingRow}
            onPress={() => setActiveSheet('privacy')}
            activeOpacity={0.7}
          >
            <View style={ps.settingLeft}>
              <Icon name="lock-closed-outline" size={18} color={C.textSecondary} />
              <Text style={ps.settingLabel}>Data & Privacy</Text>
            </View>
            <Text style={ps.chevron}>›</Text>
          </TouchableOpacity>

          {/* Apple Health */}
          <View style={ps.settingRow}>
            <View style={ps.settingLeft}>
              <Icon name="heart-outline" size={18} color={C.textSecondary} />
              <Text style={ps.settingLabel}>Apple Health</Text>
            </View>
            <Text style={[ps.settingStatus, healthKitEnabled && ps.settingStatusOn]}>
              {healthKitEnabled ? 'Connected' : 'Not Available'}
            </Text>
          </View>

          {/* Privacy Policy */}
          <TouchableOpacity
            style={ps.settingRow}
            onPress={() => Linking.openURL('https://nutrismart.app/privacy')}
            activeOpacity={0.7}
          >
            <View style={ps.settingLeft}>
              <Icon name="document-text-outline" size={18} color={C.textSecondary} />
              <Text style={ps.settingLabel}>Privacy Policy</Text>
            </View>
            <Text style={ps.chevron}>›</Text>
          </TouchableOpacity>

          {/* Terms of Service */}
          <TouchableOpacity
            style={ps.settingRow}
            onPress={() => Linking.openURL('https://nutrismart.app/terms')}
            activeOpacity={0.7}
          >
            <View style={ps.settingLeft}>
              <Icon name="clipboard-outline" size={18} color={C.textSecondary} />
              <Text style={ps.settingLabel}>Terms of Service</Text>
            </View>
            <Text style={ps.chevron}>›</Text>
          </TouchableOpacity>

          {/* About */}
          <TouchableOpacity
            style={[ps.settingRow, ps.infoRowLast]}
            onPress={() => setActiveSheet('about')}
            activeOpacity={0.7}
          >
            <View style={ps.settingLeft}>
              <Icon name="information-circle-outline" size={18} color={C.textSecondary} />
              <Text style={ps.settingLabel}>About NutriSmart</Text>
            </View>
            <Text style={ps.chevron}>›</Text>
          </TouchableOpacity>

        </View>

        {/* Sign out */}
        <TouchableOpacity style={ps.signOutBtn} onPress={signOut} activeOpacity={0.8}>
          <Text style={ps.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Delete account */}
        <TouchableOpacity
          style={ps.deleteBtn}
          onPress={handleDeleteAccount}
          activeOpacity={0.8}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color={C.red} size="small" />
          ) : (
            <Text style={ps.deleteText}>Delete Account</Text>
          )}
        </TouchableOpacity>

        <Text style={ps.version}>NutriSmart v1.0.0</Text>

      </ScrollView>

      {/* ── GOAL PICKER ─────────────────────────────── */}
      <Sheet visible={activeSheet === 'goal'} onClose={() => setActiveSheet(null)} title="Your Goal">
        <OptionList
          options={GOALS}
          selected={goal}
          iconMap={GOAL_ICONS}
          onSelect={v => { setGoal(v); setActiveSheet(null); }}
        />
      </Sheet>

      {/* ── DIET PICKER ─────────────────────────────── */}
      <Sheet visible={activeSheet === 'diet'} onClose={() => setActiveSheet(null)} title="Dietary Preference">
        <OptionList
          options={DIETS}
          selected={diet || 'No Restrictions'}
          iconMap={DIET_ICONS}
          onSelect={v => { setDiet(v); setActiveSheet(null); }}
        />
      </Sheet>

      {/* ── CALORIE GOAL ─────────────────────────────── */}
      <NumberSheet
        visible={activeSheet === 'calGoal'}
        onClose={() => setActiveSheet(null)}
        title="Daily Calorie Goal"
        placeholder="e.g. 2200"
        unit="kcal"
        value={String(calGoal)}
        onSave={setCalGoal}
        fieldKey="calGoal"
      />

      {/* ── AGE ─────────────────────────────────────── */}
      <NumberSheet
        visible={activeSheet === 'age'}
        onClose={() => setActiveSheet(null)}
        title="Your Age"
        placeholder="e.g. 25"
        unit="yrs"
        value={age}
        onSave={setAge}
        fieldKey="age"
      />

      {/* ── HEIGHT ──────────────────────────────────── */}
      <NumberSheet
        visible={activeSheet === 'height'}
        onClose={() => setActiveSheet(null)}
        title="Your Height"
        placeholder={units === 'Metric' ? 'e.g. 175' : 'e.g. 69'}
        unit={units === 'Metric' ? 'cm' : 'in'}
        value={height}
        onSave={setHeight}
        fieldKey="height"
      />

      {/* ── WEIGHT ──────────────────────────────────── */}
      <NumberSheet
        visible={activeSheet === 'weight'}
        onClose={() => setActiveSheet(null)}
        title="Your Weight"
        placeholder={units === 'Metric' ? 'e.g. 70' : 'e.g. 154'}
        unit={units === 'Metric' ? 'kg' : 'lbs'}
        value={weight}
        onSave={setWeight}
        fieldKey="weight"
      />

      {/* ── DATA & PRIVACY ──────────────────────────── */}
      <Sheet visible={activeSheet === 'privacy'} onClose={() => setActiveSheet(null)} title="Data & Privacy">
        <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
          {[
            { heading: 'Data We Collect', body: 'NutriSmart collects the information you provide — name, email, age, height, weight, dietary preferences, and the meals and workouts you log. This data is stored securely in the cloud and is used solely to personalise your nutrition and fitness recommendations.' },
            { heading: 'How We Use It', body: 'Your data powers meal scoring, goal tracking, and streak calculations. We do not sell, share, or transmit your personal data to third parties.' },
            { heading: 'Your Rights', body: 'You can update or delete your information at any time from your profile settings, including permanently deleting your account and all associated data.' },
            { heading: 'Contact', body: 'Questions? Reach us at privacy@nutrismart.app' },
          ].map(sec => (
            <View key={sec.heading} style={ps.infoSection}>
              <Text style={ps.infoSecHeading}>{sec.heading}</Text>
              <Text style={ps.infoSecBody}>{sec.body}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={ps.exportBtn}
            onPress={handleExportData}
            disabled={exporting}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Export my data"
          >
            {exporting ? (
              <ActivityIndicator color={C.accent} size="small" />
            ) : (
              <Text style={ps.exportBtnText}>Export My Data</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </Sheet>

      {/* ── ABOUT ───────────────────────────────────── */}
      <Sheet visible={activeSheet === 'about'} onClose={() => setActiveSheet(null)} title="About NutriSmart">
        <View style={ps.aboutLogoWrap}>
          <View style={ps.aboutLogo}>
            <Text style={ps.aboutLogoText}>N</Text>
          </View>
          <Text style={ps.aboutAppName}>NutriSmart</Text>
          <Text style={ps.aboutVersion}>Version 1.0.0</Text>
        </View>
        {[
          { heading: 'What is NutriSmart?', body: 'NutriSmart is your nutrition and fitness companion. It generates personalised meal recommendations from your pantry, tracks your macros, and helps you build consistent healthy habits through daily streaks.' },
          { heading: 'How meals are scored', body: 'Each recipe is scored using a combination of pantry match (65%) and goal alignment (35%), so you always see meals you can actually make that fit your current goal.' },
          { heading: 'Built with', body: 'React Native · iOS · Firebase' },
        ].map(sec => (
          <View key={sec.heading} style={ps.infoSection}>
            <Text style={ps.infoSecHeading}>{sec.heading}</Text>
            <Text style={ps.infoSecBody}>{sec.body}</Text>
          </View>
        ))}
      </Sheet>

    </SafeAreaView>
  );
}

const ps = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.black },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.borderHi, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 18, color: C.accent, marginTop: -1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.textPrimary },

  scroll: { padding: SPACING.md, paddingBottom: 60 },

  // Avatar
  avatarBlock: {
    alignItems: 'center', paddingVertical: SPACING.xl,
    borderBottomWidth: 1, borderBottomColor: C.border, marginBottom: SPACING.lg,
  },
  avatarRing: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 2, borderColor: C.accent + '50',
    padding: 4, marginBottom: SPACING.sm, ...SHADOW.accent,
  },
  avatar:        { flex: 1, borderRadius: 40, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  avatarImage:   { width: '100%', height: '100%', borderRadius: 40 },
  avatarInitial: { fontSize: 38, fontWeight: '900', color: C.textInverse },
  avatarCameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.surface3, borderWidth: 2, borderColor: C.black,
    alignItems: 'center', justifyContent: 'center',
  },
  name:          { fontSize: 24, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.5, marginBottom: 4 },
  email:         { fontSize: 14, color: C.textSecondary, marginBottom: SPACING.sm },
  memberPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.accentBg, borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: C.accent + '30',
  },
  memberText: { fontSize: 9, fontWeight: '800', color: C.accent, letterSpacing: 1.8 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.lg },
  statCard: {
    flex: 1, backgroundColor: C.surface1, borderRadius: RADIUS.lg,
    padding: SPACING.md, alignItems: 'center', borderWidth: 1,
  },
  statVal: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  statLbl: { fontSize: 10, color: C.textTertiary, fontWeight: '600', marginTop: 3, letterSpacing: 0.3 },

  // Info block
  infoBlock: {
    backgroundColor: C.surface1, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: 15,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  infoRowLast:  { borderBottomWidth: 0 },
  infoLabel:    { fontSize: 14, color: C.textSecondary, fontWeight: '500', flex: 1 },
  infoRight:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoValue:    { fontSize: 14, color: C.textPrimary, fontWeight: '600' },
  chevron:      { fontSize: 22, color: C.textTertiary, fontWeight: '300' },
  settingStatus:   { fontSize: 12, fontWeight: '600', color: C.textTertiary },
  settingStatusOn: { color: C.accent },

  // Settings rows
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  settingLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  settingIcon:  { fontSize: 18 },
  settingLabel: { fontSize: 15, color: C.textPrimary, fontWeight: '500' },

  // Unit toggle chips
  unitToggle:       { flexDirection: 'row', gap: 4 },
  unitChip:         { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface2 },
  unitChipActive:   { backgroundColor: C.accentBg, borderColor: C.accent },
  unitChipText:     { fontSize: 12, color: C.textTertiary, fontWeight: '600' },
  unitChipTextActive: { color: C.accent },

  // Sign out
  signOutBtn: {
    borderWidth: 1, borderColor: C.red + '40',
    borderRadius: RADIUS.lg, padding: 16,
    alignItems: 'center', marginBottom: SPACING.md,
    backgroundColor: C.redBg,
  },
  signOutText: { fontSize: 15, fontWeight: '700', color: C.red },

  // Delete account
  deleteBtn: {
    borderWidth: 1, borderColor: C.red + '25',
    borderRadius: RADIUS.lg, padding: 16,
    alignItems: 'center', marginBottom: SPACING.md,
  },
  deleteText: { fontSize: 14, fontWeight: '600', color: C.red + 'AA' },

  version:     { textAlign: 'center', fontSize: 11, color: C.textTertiary, fontWeight: '500' },

  // Bottom sheet
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.surface0,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    borderWidth: 1, borderColor: C.border,
    padding: SPACING.lg, paddingBottom: 44,
  },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: C.surface3,
    borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.lg,
  },
  sheetTitle: { fontSize: 22, fontWeight: '900', color: C.textPrimary, letterSpacing: -0.5, marginBottom: SPACING.md },

  // Option list
  optionList: { gap: 6 },
  optionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surface1, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: 14,
    borderWidth: 1, borderColor: C.border,
  },
  optionRowActive: { borderColor: C.accent, backgroundColor: C.accentBgSm },
  optionEmoji:     { fontSize: 20 },
  optionLabel:     { flex: 1, fontSize: 15, color: C.textSecondary, fontWeight: '500' },
  optionLabelActive: { color: C.textPrimary, fontWeight: '700' },
  optionCheck:     { width: 22, height: 22, borderRadius: 11, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  optionCheckMark: { fontSize: 12, color: C.textInverse, fontWeight: '900' },

  // Number input
  inputRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: SPACING.lg },
  numInput: {
    flex: 1, backgroundColor: C.surface1, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: C.borderHi,
    paddingHorizontal: SPACING.md, paddingVertical: 14,
    fontSize: 24, fontWeight: '700', color: C.textPrimary,
  },
  numUnit:  { fontSize: 18, fontWeight: '700', color: C.textSecondary, minWidth: 36 },
  saveBtn: {
    backgroundColor: C.accent, borderRadius: RADIUS.full,
    paddingVertical: 15, alignItems: 'center', ...SHADOW.accent,
  },
  saveBtnText: { fontSize: 15, fontWeight: '800', color: C.textInverse },

  // Info sections (privacy / about)
  infoSection:    { marginBottom: SPACING.md },
  infoSecHeading: { fontSize: 13, fontWeight: '800', color: C.accent, letterSpacing: 0.5, marginBottom: 6 },
  infoSecBody:    { fontSize: 14, color: C.textSecondary, lineHeight: 22 },

  // Export button
  exportBtn: {
    backgroundColor: C.surface3, borderRadius: RADIUS.md,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: C.accent + '30',
    marginTop: SPACING.sm,
  },
  exportBtnText: { fontSize: 14, fontWeight: '700', color: C.accent },

  // About logo
  aboutLogoWrap: { alignItems: 'center', marginBottom: SPACING.lg },
  aboutLogo: {
    width: 64, height: 64, borderRadius: RADIUS.lg,
    backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center',
    marginBottom: 10, ...SHADOW.accent,
  },
  aboutLogoText: { fontSize: 32, fontWeight: '900', color: C.textInverse },
  aboutAppName:  { fontSize: 22, fontWeight: '900', color: C.textPrimary, letterSpacing: -0.5 },
  aboutVersion:  { fontSize: 12, color: C.textTertiary, marginTop: 4 },
});
