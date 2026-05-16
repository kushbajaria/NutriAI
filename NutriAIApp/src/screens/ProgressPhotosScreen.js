import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { GlassCard, GradientButton, BlurHeader } from '../components';
import Icon from '../components/Icon';
import { SPACING, RADIUS } from '../constants/theme';

export default function ProgressPhotosScreen({ navigation }) {
  const { mode, palette, accent, gradients } = useTheme();
  const { isPro } = useSubscription();
  const [photos, setPhotos] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState([]);

  const addPhoto = useCallback(() => {
    Alert.alert('Add Progress Photo', 'Choose a source', [
      {
        text: 'Camera',
        onPress: () => {
          launchCamera({ mediaType: 'photo', quality: 0.8, maxWidth: 1200 }, (response) => {
            if (response.assets?.[0]?.uri) {
              setPhotos(prev => [{ uri: response.assets[0].uri, date: new Date().toLocaleDateString() }, ...prev]);
            }
          });
        },
      },
      {
        text: 'Photo Library',
        onPress: () => {
          launchImageLibrary({ mediaType: 'photo', quality: 0.8, maxWidth: 1200 }, (response) => {
            if (response.assets?.[0]?.uri) {
              setPhotos(prev => [{ uri: response.assets[0].uri, date: new Date().toLocaleDateString() }, ...prev]);
            }
          });
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, []);

  const toggleSelect = (index) => {
    setSelected(prev => {
      if (prev.includes(index)) return prev.filter(i => i !== index);
      if (prev.length >= 2) return [prev[1], index]; // max 2 for comparison
      return [...prev, index];
    });
  };

  // ── Premium gate ────────────────────────────────────────────────
  if (!isPro) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
        <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
        <BlurHeader title="Progress Photos" onBack={() => navigation.goBack()} />
        <View style={s.gateContent}>
          <GlassCard level={2} style={s.gateCard}>
            <View style={[s.iconWrap, { backgroundColor: accent.primary + '15' }]}>
              <Icon name="camera" size={32} color={accent.primary} />
            </View>
            <Text style={[s.gateTitle, { color: palette.textPrimary }]}>Progress Photos</Text>
            <Text style={[s.gateSub, { color: palette.textSecondary }]}>
              Track your transformation with side-by-side photo comparisons over time.
            </Text>
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
      <BlurHeader
        title="Progress Photos"
        onBack={() => navigation.goBack()}
        right={photos.length >= 2 ? (
          <TouchableOpacity onPress={() => { setCompareMode(!compareMode); setSelected([]); }}>
            <Text style={[s.compareBtn, { color: accent.primary }]}>
              {compareMode ? 'Done' : 'Compare'}
            </Text>
          </TouchableOpacity>
        ) : null}
      />

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Comparison view */}
        {compareMode && selected.length === 2 && (
          <GlassCard level={1} style={s.compareCard}>
            <Text style={[s.compareTitle, { color: palette.textPrimary }]}>Side by Side</Text>
            <View style={s.compareRow}>
              <View style={s.compareItem}>
                <Image source={{ uri: photos[selected[0]].uri }} style={s.compareImg} />
                <Text style={[s.compareDate, { color: palette.textTertiary }]}>{photos[selected[0]].date}</Text>
              </View>
              <View style={s.compareItem}>
                <Image source={{ uri: photos[selected[1]].uri }} style={s.compareImg} />
                <Text style={[s.compareDate, { color: palette.textTertiary }]}>{photos[selected[1]].date}</Text>
              </View>
            </View>
          </GlassCard>
        )}

        {compareMode && selected.length < 2 && (
          <Text style={[s.compareHint, { color: palette.textTertiary }]}>
            Select 2 photos to compare
          </Text>
        )}

        {/* Photo grid */}
        {photos.length > 0 ? (
          <View style={s.grid}>
            {photos.map((photo, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  s.photoWrap,
                  compareMode && selected.includes(i) && { borderColor: accent.primary, borderWidth: 3 },
                ]}
                onPress={() => compareMode ? toggleSelect(i) : null}
                activeOpacity={compareMode ? 0.7 : 1}
              >
                <Image source={{ uri: photo.uri }} style={s.photo} />
                <Text style={[s.photoDate, { color: palette.textTertiary }]}>{photo.date}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={s.emptyWrap}>
            <Icon name="camera-outline" size={40} color={palette.textTertiary} />
            <Text style={[s.emptyText, { color: palette.textSecondary }]}>No photos yet</Text>
            <Text style={[s.emptySub, { color: palette.textTertiary }]}>
              Take your first progress photo to start tracking your transformation.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add photo FAB */}
      <TouchableOpacity
        style={[s.fab, { backgroundColor: accent.primary }]}
        onPress={addPhoto}
        activeOpacity={0.85}
      >
        <Icon name="camera" size={22} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 80 },

  gateContent: { flex: 1, justifyContent: 'center', padding: SPACING.md },
  gateCard: { alignItems: 'center', marginBottom: 20 },
  iconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  gateTitle: { fontSize: 22, fontWeight: '900', marginBottom: 8 },
  gateSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  gateCta: { marginTop: 4 },

  compareBtn: { fontSize: 15, fontWeight: '700' },

  compareCard: { marginBottom: SPACING.md },
  compareTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  compareRow: { flexDirection: 'row', gap: 8 },
  compareItem: { flex: 1, alignItems: 'center', gap: 4 },
  compareImg: { width: '100%', aspectRatio: 3 / 4, borderRadius: RADIUS.md },
  compareDate: { fontSize: 11, fontWeight: '600' },
  compareHint: { fontSize: 13, textAlign: 'center', marginBottom: SPACING.md },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoWrap: { width: '48%', borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: 4, borderWidth: 0, borderColor: 'transparent' },
  photo: { width: '100%', aspectRatio: 3 / 4, borderRadius: RADIUS.md },
  photoDate: { fontSize: 11, fontWeight: '600', marginTop: 4, textAlign: 'center' },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700' },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 19 },

  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
});
