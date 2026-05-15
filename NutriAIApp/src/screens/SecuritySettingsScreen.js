import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { GlassCard, BlurHeader } from '../components';
import Icon from '../components/Icon';
import { SPACING } from '../constants/theme';

export default function SecuritySettingsScreen({ navigation }) {
  const { mode, palette, accent } = useTheme();

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <BlurHeader title="Security" onBack={() => navigation.goBack()} />

      <View style={s.content}>
        <GlassCard level={2} style={s.card}>
          <View style={[s.iconWrap, { backgroundColor: accent.blue + '15' }]}>
            <Icon name="shield-checkmark" size={32} color={accent.blue} />
          </View>
          <Text style={[s.title, { color: palette.textPrimary }]}>Security Settings</Text>
          <Text style={[s.subtitle, { color: palette.textSecondary }]}>
            Biometric lock, session management, and privacy controls coming soon.
          </Text>
        </GlassCard>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: SPACING.md },
  card: { alignItems: 'center', marginBottom: 20 },
  iconWrap: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '900', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
