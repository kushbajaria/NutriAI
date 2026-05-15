import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RADIUS, SPACING } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { GlassCard, GradientButton, BlurHeader, GlassBottomSheet, Badge } from '../components';
import Icon from '../components/Icon';

const FILTERS = ['All', 'High Protein', 'Quick', 'Vegetarian', 'Meal Prep', 'Clean Eating'];

export default function FoodSearchScreen({ navigation }) {
  const { pantry, logMeal, recipes, recipesLoaded } = useApp();
  const { mode, palette, accent, gradients } = useTheme();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCal, setCustomCal] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customMealTime, setCustomMealTime] = useState(null);

  const results = useMemo(() => {
    let list = recipes;

    // Tag filter
    if (filter !== 'All') {
      list = list.filter(r => r.tag === filter);
    }

    // Text search — fuzzy match on name, ingredients, tag
    const q = query.trim().toLowerCase();
    if (q.length > 0) {
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.tag.toLowerCase().includes(q) ||
        r.ingredients.some(ing => ing.includes(q))
      );
    }

    // Add pantry match info
    return list.map(r => {
      const matched = r.ingredients.filter(i => pantry.includes(i));
      return { ...r, matchCount: matched.length, canMake: matched.length === r.ingredients.length };
    });
  }, [query, filter, pantry, recipes]);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />

      <BlurHeader title="Find Recipes" onBack={() => navigation.goBack()} />

      {/* Search bar */}
      <View style={[s.searchWrap, { backgroundColor: palette.bg2, borderColor: palette.border }]}>
        <Icon name="search-outline" size={18} color={palette.textTertiary} />
        <TextInput
          style={[s.searchInput, { color: palette.textPrimary }]}
          placeholder="Search by name or ingredient..."
          placeholderTextColor={palette.textTertiary}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Icon name="close-circle" size={18} color={palette.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[
              s.filterChip,
              { borderColor: palette.border, backgroundColor: palette.glass1Bg },
              filter === f && { borderColor: accent.primary, backgroundColor: accent.primaryBg },
            ]}
            onPress={() => setFilter(f)}
            activeOpacity={0.7}
          >
            <Text style={[
              s.filterText,
              { color: palette.textSecondary },
              filter === f && { color: accent.primary, fontWeight: '700' },
            ]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[s.resultCount, { color: palette.textTertiary }]}>{results.length} recipe{results.length !== 1 ? 's' : ''}</Text>

        {results.map(r => (
          <TouchableOpacity
            key={r.id}
            style={[s.card, { backgroundColor: palette.bg1, borderColor: palette.border }]}
            onPress={() => navigation.navigate('Recipe', { recipe: r })}
            activeOpacity={0.8}
          >
            <View style={[s.cardIcon, { backgroundColor: palette.bg3 }]}>
              <Icon name={r.icon} size={24} color={accent.primary} />
            </View>
            <View style={s.cardBody}>
              <View style={s.cardTop}>
                <Text style={[s.cardName, { color: palette.textPrimary }]} numberOfLines={1}>{r.name}</Text>
                <Badge label={r.tag} color={accent.primary} />
              </View>
              <View style={s.cardMeta}>
                <Text style={[s.metaText, { color: palette.textSecondary }]}>{r.cal} cal</Text>
                <Text style={[s.metaDot, { color: palette.textTertiary }]}>·</Text>
                <Text style={[s.metaText, { color: palette.textSecondary }]}>{r.protein}g protein</Text>
                <Text style={[s.metaDot, { color: palette.textTertiary }]}>·</Text>
                <Text style={[s.metaText, { color: palette.textSecondary }]}>{r.prepTime + r.cookTime}m</Text>
              </View>
              {r.matchCount > 0 && (
                <Text style={[s.pantryMatch, { color: accent.primary }, r.canMake && { color: accent.green }]}>
                  {r.canMake ? 'All ingredients available' : `${r.matchCount}/${r.ingredients.length} in pantry`}
                </Text>
              )}
            </View>
            <Icon name="chevron-forward" size={18} color={palette.textTertiary} />
          </TouchableOpacity>
        ))}

        {results.length === 0 && (
          <View style={s.emptyState}>
            <Icon name="search-outline" size={40} color={palette.textTertiary} />
            <Text style={[s.emptyText, { color: palette.textSecondary }]}>No recipes found</Text>
            <Text style={[s.emptySub, { color: palette.textTertiary }]}>Try a different search or filter</Text>
          </View>
        )}
      </ScrollView>

      {/* Custom food FAB */}
      <TouchableOpacity
        style={[s.fab, { backgroundColor: accent.primary }]}
        onPress={() => setShowCustom(true)}
        activeOpacity={0.85}
        accessibilityLabel="Add custom food"
      >
        <Icon name="create-outline" size={22} color={palette.textInverse} />
      </TouchableOpacity>

      {/* Custom food entry bottom sheet */}
      <GlassBottomSheet visible={showCustom} onClose={() => setShowCustom(false)} height={520}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Text style={[s.modalTitle, { color: palette.textPrimary }]}>Log Custom Food</Text>

          <View style={s.inputGroup}>
            <Text style={[s.inputLabel, { color: palette.textTertiary }]}>Food name</Text>
            <TextInput
              style={[s.input, { backgroundColor: palette.bg2, borderColor: palette.border, color: palette.textPrimary }]}
              value={customName}
              onChangeText={setCustomName}
              placeholder="e.g. Chicken Breast"
              placeholderTextColor={palette.textTertiary}
            />
          </View>

          <View style={s.inputRow}>
            <View style={[s.inputGroup, { flex: 1 }]}>
              <Text style={[s.inputLabel, { color: palette.textTertiary }]}>Calories</Text>
              <TextInput
                style={[s.input, { backgroundColor: palette.bg2, borderColor: palette.border, color: palette.textPrimary }]}
                value={customCal}
                onChangeText={setCustomCal}
                placeholder="0"
                placeholderTextColor={palette.textTertiary}
                keyboardType="numeric"
              />
            </View>
            <View style={[s.inputGroup, { flex: 1 }]}>
              <Text style={[s.inputLabel, { color: palette.textTertiary }]}>Protein (g)</Text>
              <TextInput
                style={[s.input, { backgroundColor: palette.bg2, borderColor: palette.border, color: palette.textPrimary }]}
                value={customProtein}
                onChangeText={setCustomProtein}
                placeholder="0"
                placeholderTextColor={palette.textTertiary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={s.inputRow}>
            <View style={[s.inputGroup, { flex: 1 }]}>
              <Text style={[s.inputLabel, { color: palette.textTertiary }]}>Carbs (g)</Text>
              <TextInput
                style={[s.input, { backgroundColor: palette.bg2, borderColor: palette.border, color: palette.textPrimary }]}
                value={customCarbs}
                onChangeText={setCustomCarbs}
                placeholder="0"
                placeholderTextColor={palette.textTertiary}
                keyboardType="numeric"
              />
            </View>
            <View style={[s.inputGroup, { flex: 1 }]}>
              <Text style={[s.inputLabel, { color: palette.textTertiary }]}>Fat (g)</Text>
              <TextInput
                style={[s.input, { backgroundColor: palette.bg2, borderColor: palette.border, color: palette.textPrimary }]}
                value={customFat}
                onChangeText={setCustomFat}
                placeholder="0"
                placeholderTextColor={palette.textTertiary}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Meal time selection */}
          <Text style={[s.inputLabel, { color: palette.textTertiary, marginTop: 8 }]}>Meal time</Text>
          <View style={s.mealTimeRow}>
            {[
              { key: 'breakfast', label: 'Breakfast', icon: 'sunny-outline' },
              { key: 'lunch', label: 'Lunch', icon: 'restaurant-outline' },
              { key: 'dinner', label: 'Dinner', icon: 'moon-outline' },
              { key: 'snack', label: 'Snack', icon: 'cafe-outline' },
            ].map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  s.mealTimeChip,
                  { borderColor: palette.border, backgroundColor: palette.bg2 },
                  customMealTime === opt.key && { borderColor: accent.primary, backgroundColor: accent.primaryBg },
                ]}
                onPress={() => setCustomMealTime(opt.key)}
                activeOpacity={0.7}
              >
                <Icon name={opt.icon} size={14} color={customMealTime === opt.key ? accent.primary : palette.textTertiary} />
                <Text style={[s.mealTimeChipText, { color: palette.textTertiary }, customMealTime === opt.key && { color: accent.primary }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <GradientButton
            label="Log Food"
            onPress={() => {
              logMeal({
                id: `custom_${Date.now()}`,
                name: customName.trim(),
                cal: parseInt(customCal, 10) || 0,
                protein: parseInt(customProtein, 10) || 0,
                carbs: parseInt(customCarbs, 10) || 0,
                fat: parseInt(customFat, 10) || 0,
                icon: 'nutrition-outline',
                tag: 'Custom',
              }, customMealTime);
              setShowCustom(false);
              setCustomName(''); setCustomCal(''); setCustomProtein(''); setCustomCarbs(''); setCustomFat(''); setCustomMealTime(null);
              navigation.goBack();
            }}
            disabled={!customName.trim() || !customCal}
            gradient={gradients.primary}
          />
        </KeyboardAvoidingView>
      </GlassBottomSheet>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: SPACING.md, marginTop: SPACING.sm,
    borderWidth: 1,
    borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 12,
  },
  searchInput: { flex: 1, fontSize: 15 },

  filterScroll: { maxHeight: 48 },
  filterContent: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: 8, flexDirection: 'row' },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: '500' },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },
  resultCount: { fontSize: 12, fontWeight: '600', marginBottom: SPACING.sm },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: RADIUS.lg,
    padding: 14, marginBottom: 8,
    borderWidth: 1,
  },
  cardIcon: {
    width: 48, height: 48, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardName: { fontSize: 15, fontWeight: '700', flex: 1 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12 },
  metaDot: { fontSize: 12 },
  pantryMatch: { fontSize: 11, fontWeight: '600' },

  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700' },
  emptySub: { fontSize: 13 },

  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },

  // Modal content
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: SPACING.md },

  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, letterSpacing: 0.3 },
  input: {
    borderWidth: 1,
    borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15,
  },
  inputRow: { flexDirection: 'row', gap: 10 },

  mealTimeRow: { flexDirection: 'row', gap: 8, marginTop: 6, marginBottom: SPACING.md },
  mealTimeChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 10, borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  mealTimeChipText: { fontSize: 11, fontWeight: '600' },
});
