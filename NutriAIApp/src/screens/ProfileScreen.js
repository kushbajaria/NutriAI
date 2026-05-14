import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, StatusBar,
  TextInput, KeyboardAvoidingView, Platform, Linking, Share, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RADIUS, SPACING } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useUI } from '../context/UIContext';
import { signOutUser, deleteAccount, reauthenticateWithPassword } from '../services/auth';
import { exportUserData, updateUserProfile } from '../services/firestore';
import { GlassCard, GradientButton, BlurHeader, GlassBottomSheet, Badge } from '../components';
import { SectionHeader, FadeIn } from '../components/UI';
import Icon from '../components/Icon';

const GOALS = ['Lose Weight', 'Build Muscle', 'Stay Healthy', 'Boost Energy'];
const DIETS = ['No Restrictions', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];

const GOAL_ICONS = { 'Lose Weight': 'flame-outline', 'Build Muscle': 'barbell-outline', 'Stay Healthy': 'heart-outline', 'Boost Energy': 'flash-outline' };
const DIET_ICONS = {
  'No Restrictions': 'restaurant-outline', Vegetarian: 'leaf-outline', Vegan: 'leaf-outline',
  'Gluten-Free': 'nutrition-outline', 'Dairy-Free': 'water-outline', Keto: 'fish-outline', Paleo: 'flame-outline',
};

// ── OPTION LIST (goal / diet picker) ──────────────────────────────
function OptionList({ options, selected, iconMap, onSelect }) {
  const { palette, accent } = useTheme();
  return (
    <View style={ps.optionList}>
      {options.map(opt => {
        const active = opt === selected;
        return (
          <TouchableOpacity
            key={opt}
            style={[
              ps.optionRow,
              { backgroundColor: palette.bg1, borderColor: palette.border },
              active && { borderColor: accent.primary, backgroundColor: accent.primaryBg },
            ]}
            onPress={() => onSelect(opt)}
            activeOpacity={0.75}
          >
            <Icon name={iconMap[opt]} size={20} color={active ? accent.primary : palette.textSecondary} />
            <Text style={[ps.optionLabel, { color: palette.textSecondary }, active && { color: palette.textPrimary, fontWeight: '700' }]}>{opt}</Text>
            {active && <View style={[ps.optionCheck, { backgroundColor: accent.primary }]}><Icon name="checkmark" size={14} color={palette.textInverse} /></View>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── NUMBER INPUT SHEET ─────────────────────────────────────────────
function NumberSheet({ visible, onClose, title, placeholder, unit, value, onSave, fieldKey }) {
  const { palette, accent, gradients } = useTheme();
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
    <GlassBottomSheet visible={visible} onClose={onClose} height={250}>
      <Text style={[ps.sheetTitle, { color: palette.textPrimary }]}>{title}</Text>
      <View style={ps.inputRow}>
        <TextInput
          style={[ps.numInput, { backgroundColor: palette.bg1, borderColor: palette.borderHi, color: palette.textPrimary }]}
          value={val}
          onChangeText={setVal}
          keyboardType="numeric"
          placeholder={placeholder}
          placeholderTextColor={palette.textTertiary}
          autoFocus
          maxLength={5}
        />
        {unit ? <Text style={[ps.numUnit, { color: palette.textSecondary }]}>{unit}</Text> : null}
      </View>
      <GradientButton label="Save" onPress={save} gradient={gradients.primary} />
    </GlassBottomSheet>
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

  const { mode, palette, accent, gradients } = useTheme();

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
    } finally {
      setExporting(false);
    }
  };
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (refreshProfile) refreshProfile().finally(() => setRefreshing(false));
    else setTimeout(() => setRefreshing(false), 800);
  }, [refreshProfile]);

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
                      // showToast handled via UI context
                    }
                  }
                },
                'secure-text'
              );
            } else {
              setDeleting(true);
              deleteAccount().catch(err => {
                setDeleting(false);
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
    { val: loggedMeals.length, lbl: 'Meals',    color: accent.primary },
    { val: workoutCount,       lbl: 'Workouts',  color: accent.blue   },
    { val: activeDays > 0 ? `${Math.round((activeDays / 7) * 100)}%` : '—', lbl: 'Active', color: accent.protein },
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
    <SafeAreaView style={[ps.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />

      <BlurHeader title="Profile" onBack={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={ps.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent.primary} />}
      >

        {/* Avatar block */}
        <FadeIn delay={0}>
        <View style={[ps.avatarBlock, { borderBottomColor: palette.border }]}>
          <TouchableOpacity style={[ps.avatarRing, { borderColor: accent.primary + '50' }]} onPress={handlePickPhoto} activeOpacity={0.8}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={ps.avatarImage} />
            ) : (
              <View style={[ps.avatar, { backgroundColor: accent.primary }]}>
                <Text style={[ps.avatarInitial, { color: palette.textInverse }]}>{initial}</Text>
              </View>
            )}
            <View style={[ps.avatarCameraBadge, { backgroundColor: palette.bg3, borderColor: palette.bg0 }]}>
              {photoLoading ? (
                <ActivityIndicator size="small" color={palette.textInverse} />
              ) : (
                <Icon name="camera" size={14} color={palette.textInverse} />
              )}
            </View>
          </TouchableOpacity>
          <Text style={[ps.name, { color: palette.textPrimary }]}>{displayName}</Text>
          <Text style={[ps.email, { color: palette.textSecondary }]}>{user?.email || ''}</Text>
          <View style={[ps.memberPill, { backgroundColor: palette.glass1Bg, borderColor: accent.primary + '30' }]}>
            <Text style={[ps.memberText, { color: accent.primary }]}>Active Member</Text>
          </View>
        </View>
        </FadeIn>

        {/* Stats row */}
        <FadeIn delay={60}>
        <View style={ps.statsRow}>
          {stats.map(st => (
            <GlassCard key={st.lbl} level={1} style={[ps.statCard, { borderColor: st.color + '25' }]}>
              <Text style={[ps.statVal, { color: st.color }]}>{st.val}</Text>
              <Text style={[ps.statLbl, { color: palette.textTertiary }]}>{st.lbl}</Text>
            </GlassCard>
          ))}
        </View>
        </FadeIn>

        {/* Your data — each row is tappable */}
        <FadeIn delay={120}>
        <SectionHeader title="Your Data" />
        <View style={[ps.infoBlock, { backgroundColor: palette.bg1, borderColor: palette.border }]}>
          {dataRows.map((r, i) => (
            <TouchableOpacity
              key={r.key}
              style={[ps.infoRow, { borderBottomColor: palette.border }, i === dataRows.length - 1 && ps.infoRowLast]}
              onPress={() => setActiveSheet(r.key)}
              activeOpacity={0.7}
            >
              <Text style={[ps.infoLabel, { color: palette.textSecondary }]}>{r.label}</Text>
              <View style={ps.infoRight}>
                {r.badge
                  ? <Badge label={r.display} color={accent.primary} />
                  : <Text style={[ps.infoValue, { color: palette.textPrimary }]}>{r.display}</Text>
                }
                <Icon name="chevron-forward" size={16} color={palette.textTertiary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        </FadeIn>

        {/* Settings */}
        <FadeIn delay={180}>
        <SectionHeader title="Settings" />
        <View style={[ps.infoBlock, { backgroundColor: palette.bg1, borderColor: palette.border }]}>

          {/* Units toggle */}
          <TouchableOpacity
            style={[ps.settingRow, { borderBottomColor: palette.border }]}
            onPress={() => setUnits(units === 'Metric' ? 'Imperial' : 'Metric')}
            activeOpacity={0.7}
          >
            <View style={ps.settingLeft}>
              <Icon name="resize-outline" size={18} color={palette.textSecondary} />
              <Text style={[ps.settingLabel, { color: palette.textPrimary }]}>Units</Text>
            </View>
            <View style={ps.unitToggle}>
              <View style={[
                ps.unitChip,
                { borderColor: palette.border, backgroundColor: palette.bg2 },
                units === 'Metric' && { backgroundColor: accent.primaryBg, borderColor: accent.primary },
              ]}>
                <Text style={[ps.unitChipText, { color: palette.textTertiary }, units === 'Metric' && { color: accent.primary }]}>Metric</Text>
              </View>
              <View style={[
                ps.unitChip,
                { borderColor: palette.border, backgroundColor: palette.bg2 },
                units === 'Imperial' && { backgroundColor: accent.primaryBg, borderColor: accent.primary },
              ]}>
                <Text style={[ps.unitChipText, { color: palette.textTertiary }, units === 'Imperial' && { color: accent.primary }]}>Imperial</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Data & Privacy */}
          <TouchableOpacity
            style={[ps.settingRow, { borderBottomColor: palette.border }]}
            onPress={() => setActiveSheet('privacy')}
            activeOpacity={0.7}
          >
            <View style={ps.settingLeft}>
              <Icon name="lock-closed-outline" size={18} color={palette.textSecondary} />
              <Text style={[ps.settingLabel, { color: palette.textPrimary }]}>Data & Privacy</Text>
            </View>
            <Icon name="chevron-forward" size={16} color={palette.textTertiary} />
          </TouchableOpacity>

          {/* Apple Health */}
          <View style={[ps.settingRow, { borderBottomColor: palette.border }]}>
            <View style={ps.settingLeft}>
              <Icon name="heart-outline" size={18} color={palette.textSecondary} />
              <Text style={[ps.settingLabel, { color: palette.textPrimary }]}>Apple Health</Text>
            </View>
            <Text style={[ps.settingStatus, { color: palette.textTertiary }, healthKitEnabled && { color: accent.primary }]}>
              {healthKitEnabled ? 'Connected' : 'Not Available'}
            </Text>
          </View>

          {/* Privacy Policy */}
          <TouchableOpacity
            style={[ps.settingRow, { borderBottomColor: palette.border }]}
            onPress={() => Linking.openURL('https://nutrismart.app/privacy')}
            activeOpacity={0.7}
          >
            <View style={ps.settingLeft}>
              <Icon name="document-text-outline" size={18} color={palette.textSecondary} />
              <Text style={[ps.settingLabel, { color: palette.textPrimary }]}>Privacy Policy</Text>
            </View>
            <Icon name="chevron-forward" size={16} color={palette.textTertiary} />
          </TouchableOpacity>

          {/* Terms of Service */}
          <TouchableOpacity
            style={[ps.settingRow, { borderBottomColor: palette.border }]}
            onPress={() => Linking.openURL('https://nutrismart.app/terms')}
            activeOpacity={0.7}
          >
            <View style={ps.settingLeft}>
              <Icon name="clipboard-outline" size={18} color={palette.textSecondary} />
              <Text style={[ps.settingLabel, { color: palette.textPrimary }]}>Terms of Service</Text>
            </View>
            <Icon name="chevron-forward" size={16} color={palette.textTertiary} />
          </TouchableOpacity>

          {/* About */}
          <TouchableOpacity
            style={[ps.settingRow, ps.infoRowLast, { borderBottomColor: palette.border }]}
            onPress={() => setActiveSheet('about')}
            activeOpacity={0.7}
          >
            <View style={ps.settingLeft}>
              <Icon name="information-circle-outline" size={18} color={palette.textSecondary} />
              <Text style={[ps.settingLabel, { color: palette.textPrimary }]}>About NutriSmart</Text>
            </View>
            <Icon name="chevron-forward" size={16} color={palette.textTertiary} />
          </TouchableOpacity>

        </View>
        </FadeIn>

        {/* Sign out */}
        <FadeIn delay={240}>
        <TouchableOpacity style={[ps.signOutBtn, { borderColor: accent.red + '40', backgroundColor: accent.redBg }]} onPress={signOut} activeOpacity={0.8}>
          <Text style={[ps.signOutText, { color: accent.red }]}>Sign Out</Text>
        </TouchableOpacity>

        {/* Delete account */}
        <TouchableOpacity
          style={[ps.deleteBtn, { borderColor: accent.red + '25' }]}
          onPress={handleDeleteAccount}
          activeOpacity={0.8}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color={accent.red} size="small" />
          ) : (
            <Text style={[ps.deleteText, { color: accent.red + 'AA' }]}>Delete Account</Text>
          )}
        </TouchableOpacity>

        <Text style={[ps.version, { color: palette.textTertiary }]}>NutriSmart v1.0.0</Text>
        </FadeIn>

      </ScrollView>

      {/* ── GOAL PICKER ─────────────────────────────── */}
      <GlassBottomSheet visible={activeSheet === 'goal'} onClose={() => setActiveSheet(null)} height={380}>
        <Text style={[ps.sheetTitle, { color: palette.textPrimary }]}>Your Goal</Text>
        <OptionList
          options={GOALS}
          selected={goal}
          iconMap={GOAL_ICONS}
          onSelect={v => { setGoal(v); setActiveSheet(null); }}
        />
      </GlassBottomSheet>

      {/* ── DIET PICKER ─────────────────────────────── */}
      <GlassBottomSheet visible={activeSheet === 'diet'} onClose={() => setActiveSheet(null)} height={520}>
        <Text style={[ps.sheetTitle, { color: palette.textPrimary }]}>Dietary Preference</Text>
        <OptionList
          options={DIETS}
          selected={diet || 'No Restrictions'}
          iconMap={DIET_ICONS}
          onSelect={v => { setDiet(v); setActiveSheet(null); }}
        />
      </GlassBottomSheet>

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
      <GlassBottomSheet visible={activeSheet === 'privacy'} onClose={() => setActiveSheet(null)} height={500}>
        <Text style={[ps.sheetTitle, { color: palette.textPrimary }]}>Data & Privacy</Text>
        <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
          {[
            { heading: 'Data We Collect', body: 'NutriSmart collects the information you provide — name, email, age, height, weight, dietary preferences, and the meals and workouts you log. This data is stored securely in the cloud and is used solely to personalise your nutrition and fitness recommendations.' },
            { heading: 'How We Use It', body: 'Your data powers meal scoring, goal tracking, and streak calculations. We do not sell, share, or transmit your personal data to third parties.' },
            { heading: 'Your Rights', body: 'You can update or delete your information at any time from your profile settings, including permanently deleting your account and all associated data.' },
            { heading: 'Contact', body: 'Questions? Reach us at privacy@nutrismart.app' },
          ].map(sec => (
            <View key={sec.heading} style={ps.infoSection}>
              <Text style={[ps.infoSecHeading, { color: accent.primary }]}>{sec.heading}</Text>
              <Text style={[ps.infoSecBody, { color: palette.textSecondary }]}>{sec.body}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={[ps.exportBtn, { backgroundColor: palette.bg3, borderColor: accent.primary + '30' }]}
            onPress={handleExportData}
            disabled={exporting}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Export my data"
          >
            {exporting ? (
              <ActivityIndicator color={accent.primary} size="small" />
            ) : (
              <Text style={[ps.exportBtnText, { color: accent.primary }]}>Export My Data</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </GlassBottomSheet>

      {/* ── ABOUT ───────────────────────────────────── */}
      <GlassBottomSheet visible={activeSheet === 'about'} onClose={() => setActiveSheet(null)} height={450}>
        <Text style={[ps.sheetTitle, { color: palette.textPrimary }]}>About NutriSmart</Text>
        <View style={ps.aboutLogoWrap}>
          <View style={[ps.aboutLogo, { backgroundColor: accent.primary }]}>
            <Text style={[ps.aboutLogoText, { color: palette.textInverse }]}>N</Text>
          </View>
          <Text style={[ps.aboutAppName, { color: palette.textPrimary }]}>NutriSmart</Text>
          <Text style={[ps.aboutVersion, { color: palette.textTertiary }]}>Version 1.0.0</Text>
        </View>
        {[
          { heading: 'What is NutriSmart?', body: 'NutriSmart is your nutrition and fitness companion. It generates personalised meal recommendations from your pantry, tracks your macros, and helps you build consistent healthy habits through daily streaks.' },
          { heading: 'How meals are scored', body: 'Each recipe is scored using a combination of pantry match (65%) and goal alignment (35%), so you always see meals you can actually make that fit your current goal.' },
          { heading: 'Built with', body: 'React Native · iOS · Firebase' },
        ].map(sec => (
          <View key={sec.heading} style={ps.infoSection}>
            <Text style={[ps.infoSecHeading, { color: accent.primary }]}>{sec.heading}</Text>
            <Text style={[ps.infoSecBody, { color: palette.textSecondary }]}>{sec.body}</Text>
          </View>
        ))}
      </GlassBottomSheet>

    </SafeAreaView>
  );
}

const ps = StyleSheet.create({
  safe: { flex: 1 },

  scroll: { padding: SPACING.md, paddingBottom: 60 },

  // Avatar
  avatarBlock: {
    alignItems: 'center', paddingVertical: SPACING.xl,
    borderBottomWidth: 1, marginBottom: SPACING.lg,
  },
  avatarRing: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 2,
    padding: 4, marginBottom: SPACING.sm,
  },
  avatar:        { flex: 1, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarImage:   { width: '100%', height: '100%', borderRadius: 40 },
  avatarInitial: { fontSize: 38, fontWeight: '900' },
  avatarCameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  name:          { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
  email:         { fontSize: 14, marginBottom: SPACING.sm },
  memberPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1,
  },
  memberText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.8 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.lg },
  statCard: {
    flex: 1,
    padding: SPACING.md, alignItems: 'center', borderWidth: 1,
  },
  statVal: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  statLbl: { fontSize: 10, fontWeight: '600', marginTop: 3, letterSpacing: 0.3 },

  // Info block
  infoBlock: {
    borderRadius: RADIUS.lg,
    borderWidth: 1, overflow: 'hidden', marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: 15,
    borderBottomWidth: 1,
  },
  infoRowLast:  { borderBottomWidth: 0 },
  infoLabel:    { fontSize: 14, fontWeight: '500', flex: 1 },
  infoRight:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoValue:    { fontSize: 14, fontWeight: '600' },
  settingStatus:   { fontSize: 12, fontWeight: '600' },

  // Settings rows
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '500' },

  // Unit toggle chips
  unitToggle:       { flexDirection: 'row', gap: 4 },
  unitChip:         { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full, borderWidth: 1 },
  unitChipText:     { fontSize: 12, fontWeight: '600' },

  // Sign out
  signOutBtn: {
    borderWidth: 1,
    borderRadius: RADIUS.lg, padding: 16,
    alignItems: 'center', marginBottom: SPACING.md,
  },
  signOutText: { fontSize: 15, fontWeight: '700' },

  // Delete account
  deleteBtn: {
    borderWidth: 1,
    borderRadius: RADIUS.lg, padding: 16,
    alignItems: 'center', marginBottom: SPACING.md,
  },
  deleteText: { fontSize: 14, fontWeight: '600' },

  version: { textAlign: 'center', fontSize: 11, fontWeight: '500' },

  // Sheet title
  sheetTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5, marginBottom: SPACING.md },

  // Option list
  optionList: { gap: 6 },
  optionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: 14,
    borderWidth: 1,
  },
  optionLabel:     { flex: 1, fontSize: 15, fontWeight: '500' },
  optionCheck:     { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },

  // Number input
  inputRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: SPACING.lg },
  numInput: {
    flex: 1, borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md, paddingVertical: 14,
    fontSize: 24, fontWeight: '700',
  },
  numUnit: { fontSize: 18, fontWeight: '700', minWidth: 36 },

  // Info sections (privacy / about)
  infoSection:    { marginBottom: SPACING.md },
  infoSecHeading: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  infoSecBody:    { fontSize: 14, lineHeight: 22 },

  // Export button
  exportBtn: {
    borderRadius: RADIUS.md,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1,
    marginTop: SPACING.sm,
  },
  exportBtnText: { fontSize: 14, fontWeight: '700' },

  // About logo
  aboutLogoWrap: { alignItems: 'center', marginBottom: SPACING.lg },
  aboutLogo: {
    width: 64, height: 64, borderRadius: RADIUS.lg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  aboutLogoText: { fontSize: 32, fontWeight: '900' },
  aboutAppName:  { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  aboutVersion:  { fontSize: 12, marginTop: 4 },
});
