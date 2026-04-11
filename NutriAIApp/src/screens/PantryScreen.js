import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { COMMON_INGREDIENTS } from '../constants/data';
import { useApp } from '../context/AppContext';
import { SectionHeader, GlowDot, PillButton } from '../components/UI';
import { hapticSelection } from '../utils/haptics';

export default function PantryScreen({ navigation }) {
  const { pantry, setPantry } = useApp();
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim().toLowerCase();
    if (v && !pantry.includes(v)) { hapticSelection(); setPantry([...pantry, v]); setInput(''); }
  };
  const remove    = item => { hapticSelection(); setPantry(pantry.filter(p => p !== item)); };
  const addCommon = item => { if (!pantry.includes(item)) { hapticSelection(); setPantry([...pantry, item]); } };
  const available = COMMON_INGREDIENTS.filter(c => !pantry.includes(c)).slice(0, 14);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      {/* Header */}
      <View style={s.header}>
        <View>
          <View style={s.eyebrowRow}>
            <GlowDot size={6} />
            <Text style={s.eyebrow}>MANAGE</Text>
          </View>
          <Text style={s.headerTitle}>Pantry</Text>
        </View>
        <View style={s.countBadge}>
          <Text style={s.countVal}>{pantry.length}</Text>
          <Text style={s.countLbl}>items</Text>
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
              style={s.addInput}
              placeholder="Add an ingredient..."
              placeholderTextColor={C.textTertiary}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={add}
              returnKeyType="done"
            />
            <TouchableOpacity style={s.addBtn} onPress={add} activeOpacity={0.8}>
              <Text style={s.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Current pantry */}
          <SectionHeader title={`YOUR PANTRY · ${pantry.length} ITEMS`} />
          {pantry.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyIcon}>🛒</Text>
              <Text style={s.emptyText}>Your pantry is empty</Text>
              <Text style={s.emptySub}>Add ingredients to get smart meal suggestions</Text>
            </View>
          ) : (
            <View style={s.tagCloud}>
              {pantry.map(item => (
                <View key={item} style={s.tag}>
                  <Text style={s.tagText}>{item}</Text>
                  <TouchableOpacity
                    onPress={() => remove(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                  >
                    <Text style={s.tagX}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Quick add */}
          <SectionHeader title="QUICK ADD" />
          <View style={s.tagCloud}>
            {available.map(item => (
              <TouchableOpacity
                key={item}
                style={s.commonTag}
                onPress={() => addCommon(item)}
                activeOpacity={0.7}
              >
                <Text style={s.commonPlus}>+</Text>
                <Text style={s.commonText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Generate CTA */}
          <PillButton
            label="Generate Meals from Pantry"
            onPress={() => navigation.navigate('Meals')}
            style={{ marginTop: SPACING.sm }}
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.black },

  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  eyebrowRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  eyebrow:     { fontSize: 9, fontWeight: '700', color: C.lime, letterSpacing: 2 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: C.textPrimary, letterSpacing: -0.5 },
  countBadge: {
    backgroundColor: C.limeGlow, borderRadius: RADIUS.md,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: C.lime + '30',
    alignItems: 'center', marginTop: 4,
  },
  countVal: { fontSize: 20, fontWeight: '900', color: C.lime, letterSpacing: -0.5 },
  countLbl: { fontSize: 9, fontWeight: '700', color: C.limeDim, letterSpacing: 0.5 },

  scroll:        { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },

  // Add row
  addRow:  { flexDirection: 'row', gap: 10, marginBottom: SPACING.lg },
  addInput: {
    flex: 1, backgroundColor: C.surface1,
    borderWidth: 1, borderColor: C.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16, paddingVertical: 14,
    color: C.textPrimary, fontSize: 15,
  },
  addBtn: {
    width: 50, backgroundColor: C.lime,
    borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOW.lime,
  },
  addBtnText: { fontSize: 24, fontWeight: '700', color: C.textInverse, marginTop: -2 },

  // Empty state
  emptyState: {
    alignItems: 'center', paddingVertical: SPACING.xxl,
    backgroundColor: C.surface1, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: C.border,
    marginBottom: SPACING.lg,
  },
  emptyIcon: { fontSize: 40, marginBottom: SPACING.sm },
  emptyText: { fontSize: 16, fontWeight: '700', color: C.textSecondary, marginBottom: 4 },
  emptySub:  { fontSize: 13, color: C.textTertiary, textAlign: 'center', paddingHorizontal: SPACING.lg },

  // Tag cloud
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.lg },
  tag: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface2, borderWidth: 1, borderColor: C.borderHi,
    borderRadius: RADIUS.full, paddingLeft: 14, paddingRight: 10, paddingVertical: 8, gap: 8,
  },
  tagText: { fontSize: 13, color: C.textPrimary, fontWeight: '500' },
  tagX:    { fontSize: 18, color: C.textTertiary, lineHeight: 18 },

  commonTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.surface1, borderWidth: 1, borderColor: C.border,
    borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 8,
  },
  commonPlus: { fontSize: 14, fontWeight: '900', color: C.lime },
  commonText: { fontSize: 13, color: C.textSecondary, fontWeight: '500' },
});
