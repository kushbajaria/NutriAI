import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING } from '../constants/theme';
import { RECIPES } from '../constants/data';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/UI';
import Icon from '../components/Icon';

const FILTERS = ['All', 'High Protein', 'Quick', 'Vegetarian', 'Meal Prep', 'Clean Eating'];

export default function FoodSearchScreen({ navigation }) {
  const { pantry } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const results = useMemo(() => {
    let list = RECIPES;

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
  }, [query, filter, pantry]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.black} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} accessibilityLabel="Go back">
          <Icon name="chevron-back" size={22} color={C.accent} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Find Recipes</Text>
      </View>

      {/* Search bar */}
      <View style={s.searchWrap}>
        <Icon name="search-outline" size={18} color={C.textTertiary} />
        <TextInput
          style={s.searchInput}
          placeholder="Search by name or ingredient..."
          placeholderTextColor={C.textTertiary}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Icon name="close-circle" size={18} color={C.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[s.filterChip, filter === f && s.filterChipActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.7}
          >
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={s.resultCount}>{results.length} recipe{results.length !== 1 ? 's' : ''}</Text>

        {results.map(r => (
          <TouchableOpacity
            key={r.id}
            style={s.card}
            onPress={() => navigation.navigate('Recipe', { recipe: r })}
            activeOpacity={0.8}
          >
            <View style={s.cardIcon}>
              <Icon name={r.icon} size={24} color={C.accent} />
            </View>
            <View style={s.cardBody}>
              <View style={s.cardTop}>
                <Text style={s.cardName} numberOfLines={1}>{r.name}</Text>
                <Badge label={r.tag} color={C.accent} />
              </View>
              <View style={s.cardMeta}>
                <Text style={s.metaText}>{r.cal} cal</Text>
                <Text style={s.metaDot}>·</Text>
                <Text style={s.metaText}>{r.protein}g protein</Text>
                <Text style={s.metaDot}>·</Text>
                <Text style={s.metaText}>{r.prepTime + r.cookTime}m</Text>
              </View>
              {r.matchCount > 0 && (
                <Text style={[s.pantryMatch, r.canMake && { color: C.green }]}>
                  {r.canMake ? 'All ingredients available' : `${r.matchCount}/${r.ingredients.length} in pantry`}
                </Text>
              )}
            </View>
            <Icon name="chevron-forward" size={18} color={C.textTertiary} />
          </TouchableOpacity>
        ))}

        {results.length === 0 && (
          <View style={s.emptyState}>
            <Icon name="search-outline" size={40} color={C.textTertiary} />
            <Text style={s.emptyText}>No recipes found</Text>
            <Text style={s.emptySub}>Try a different search or filter</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.black },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.surface2, borderWidth: 1, borderColor: C.borderHi,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.5 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: SPACING.md, marginTop: SPACING.sm,
    backgroundColor: C.surface1, borderWidth: 1, borderColor: C.border,
    borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: C.textPrimary },

  filterScroll: { maxHeight: 48 },
  filterContent: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: 8, flexDirection: 'row' },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: C.border,
    backgroundColor: C.surface1,
  },
  filterChipActive: { borderColor: C.accent, backgroundColor: C.accentBgSm },
  filterText: { fontSize: 13, color: C.textSecondary, fontWeight: '500' },
  filterTextActive: { color: C.accent, fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },
  resultCount: { fontSize: 12, color: C.textTertiary, fontWeight: '600', marginBottom: SPACING.sm },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surface1, borderRadius: RADIUS.lg,
    padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: C.border,
  },
  cardIcon: {
    width: 48, height: 48, borderRadius: RADIUS.md,
    backgroundColor: C.surface3, alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardName: { fontSize: 15, fontWeight: '700', color: C.textPrimary, flex: 1 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: C.textSecondary },
  metaDot: { fontSize: 12, color: C.textTertiary },
  pantryMatch: { fontSize: 11, color: C.accent, fontWeight: '600' },

  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: C.textSecondary },
  emptySub: { fontSize: 13, color: C.textTertiary },
});
