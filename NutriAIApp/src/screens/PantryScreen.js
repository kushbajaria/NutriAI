import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RADIUS, SPACING } from '../constants/theme';
import { COMMON_INGREDIENTS } from '../constants/data';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { GradientButton } from '../components';
import { SectionHeader } from '../components/UI';
import Icon from '../components/Icon';
import { hapticSelection } from '../utils/haptics';

export default function PantryScreen({ navigation }) {
  const { pantry, setPantry } = useApp();
  const { mode, palette, accent } = useTheme();
  const [input, setInput] = useState('');

  const add = (value) => {
    const v = (value || input).trim().toLowerCase();
    if (v && !pantry.includes(v)) { hapticSelection(); setPantry([...pantry, v]); }
    setInput('');
  };
  const remove    = item => { hapticSelection(); setPantry(pantry.filter(p => p !== item)); };
  const addCommon = item => { if (!pantry.includes(item)) { hapticSelection(); setPantry([...pantry, item]); } };
  const available = COMMON_INGREDIENTS.filter(c => !pantry.includes(c));

  // Autocomplete suggestions filtered by input
  const suggestions = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (q.length < 1) return [];
    return COMMON_INGREDIENTS
      .filter(c => c.includes(q) && !pantry.includes(c))
      .slice(0, 6);
  }, [input, pantry]);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[s.header, { borderBottomColor: palette.border }]}>
        <Text style={[s.headerTitle, { color: palette.textPrimary }]}>Pantry</Text>
        <View style={[s.countBadge, { backgroundColor: accent.primaryBg, borderColor: accent.primary + '30' }]}>
          <Text style={[s.countVal, { color: accent.primary }]}>{pantry.length}</Text>
          <Text style={[s.countLbl, { color: accent.primaryDim }]}>items</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Search / add row */}
          <View style={s.addRow}>
            <TextInput
              style={[s.addInput, { backgroundColor: palette.bg2, borderColor: palette.border, color: palette.textPrimary }]}
              placeholder="Add an ingredient..."
              placeholderTextColor={palette.textTertiary}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => add()}
              returnKeyType="done"
            />
            <TouchableOpacity style={[s.addBtn, { backgroundColor: accent.primary }]} onPress={() => add()} activeOpacity={0.8}>
              <Text style={[s.addBtnText, { color: palette.textInverse }]}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Autocomplete dropdown */}
          {suggestions.length > 0 && (
            <View style={[s.dropdown, { backgroundColor: palette.bg2, borderColor: palette.border }]}>
              {suggestions.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[s.dropdownItem, { borderBottomColor: palette.border }]}
                  onPress={() => add(item)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.dropdownPlus, { color: accent.primary }]}>+</Text>
                  <Text style={[s.dropdownText, { color: palette.textPrimary }]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Current pantry */}
          <SectionHeader title={`Your Pantry · ${pantry.length} items`} />
          {pantry.length === 0 ? (
            <View style={[s.emptyState, { backgroundColor: palette.bg1, borderColor: palette.border }]}>
              <Icon name="basket-outline" size={40} color={palette.textTertiary} />
              <Text style={[s.emptyText, { color: palette.textSecondary }]}>Your pantry is empty</Text>
              <Text style={[s.emptySub, { color: palette.textTertiary }]}>Add ingredients to get smart meal suggestions</Text>
            </View>
          ) : (
            <View style={s.tagCloud}>
              {pantry.map(item => (
                <View key={item} style={[s.tag, { backgroundColor: accent.primaryBg, borderColor: accent.primary }]}>
                  <Text style={[s.tagText, { color: accent.primary }]}>{item}</Text>
                  <TouchableOpacity
                    onPress={() => remove(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                  >
                    <Text style={[s.tagX, { color: accent.primary }]}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Quick add */}
          <SectionHeader title="Quick Add" />
          <View style={s.tagCloud}>
            {available.map(item => (
              <TouchableOpacity
                key={item}
                style={[s.commonTag, { backgroundColor: palette.glass1Bg, borderColor: palette.glass1Border }]}
                onPress={() => addCommon(item)}
                activeOpacity={0.7}
              >
                <Text style={[s.commonPlus, { color: accent.primary }]}>+</Text>
                <Text style={[s.commonText, { color: palette.textSecondary }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Generate CTA */}
          <GradientButton
            label="Generate Meals from Pantry"
            onPress={() => navigation.navigate('MealsTab', { screen: 'MealsList' })}
            style={{ marginTop: SPACING.sm }}
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  eyebrowRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  eyebrow:     { fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  headerTitle: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  countBadge: {
    borderRadius: RADIUS.md,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1,
    alignItems: 'center', marginTop: 4,
  },
  countVal: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  countLbl: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  scroll:        { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },

  // Add row
  addRow:  { flexDirection: 'row', gap: 10, marginBottom: 8 },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15,
  },
  addBtn: {
    width: 50,
    borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { fontSize: 24, fontWeight: '700', marginTop: -2 },

  // Dropdown
  dropdown: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dropdownPlus: { fontSize: 14, fontWeight: '900' },
  dropdownText: { fontSize: 14, fontWeight: '500' },

  // Empty state
  emptyState: {
    alignItems: 'center', paddingVertical: SPACING.xxl,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  emptyIcon: { fontSize: 40, marginBottom: SPACING.sm },
  emptyText: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptySub:  { fontSize: 13, textAlign: 'center', paddingHorizontal: SPACING.lg },

  // Tag cloud
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.lg },
  tag: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.full, paddingLeft: 14, paddingRight: 10, paddingVertical: 8, gap: 8,
  },
  tagText: { fontSize: 13, fontWeight: '500' },
  tagX:    { fontSize: 18, lineHeight: 18 },

  commonTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1,
    borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 8,
  },
  commonPlus: { fontSize: 14, fontWeight: '900' },
  commonText: { fontSize: 13, fontWeight: '500' },
});
