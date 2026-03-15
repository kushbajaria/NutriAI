import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING } from '../constants/theme';
import { COMMON_INGREDIENTS } from '../constants/data';
import { useApp } from '../context/AppContext';
import { ScreenHeader, SectionHeader, PillButton } from '../components/UI';

export default function PantryScreen({ navigation }) {
  const { pantry, setPantry } = useApp();
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim().toLowerCase();
    if (v && !pantry.includes(v)) { setPantry([...pantry, v]); setInput(''); }
  };
  const remove = item => setPantry(pantry.filter(p => p !== item));
  const addCommon = item => { if (!pantry.includes(item)) setPantry([...pantry, item]); };
  const available = COMMON_INGREDIENTS.filter(c => !pantry.includes(c)).slice(0, 14);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScreenHeader
        title="Pantry"
        subtitle="MANAGE"
        onBack={() => navigation.goBack()}
        right={<View style={s.countBadge}><Text style={s.countText}>{pantry.length}</Text></View>}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Search/add */}
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
              <Text style={s.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Current pantry */}
          <SectionHeader title={`YOUR PANTRY · ${pantry.length} ITEMS`} />
          <View style={s.tagCloud}>
            {pantry.map(item => (
              <View key={item} style={s.tag}>
                <Text style={s.tagText}>{item}</Text>
                <TouchableOpacity onPress={() => remove(item)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
                  <Text style={s.tagX}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Common */}
          <SectionHeader title="QUICK ADD" />
          <View style={s.tagCloud}>
            {available.map(item => (
              <TouchableOpacity key={item} style={s.commonTag} onPress={() => addCommon(item)} activeOpacity={0.7}>
                <Text style={s.commonPlus}>+</Text>
                <Text style={s.commonText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <PillButton
            label="Generate Meals from Pantry →"
            onPress={() => navigation.navigate('Meals')}
            style={{ marginTop: SPACING.md }}
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.black },
  countBadge: { backgroundColor: C.limeGlow, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: C.lime + '30' },
  countText: { fontSize: 13, fontWeight: '800', color: C.lime },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.lg },
  addInput: { flex: 1, backgroundColor: C.surface1, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 13, color: C.textPrimary, fontSize: 15 },
  addBtn: { backgroundColor: C.lime, borderRadius: RADIUS.md, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 14, fontWeight: '800', color: C.textInverse },
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.lg },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface2, borderWidth: 1, borderColor: C.borderHi, borderRadius: RADIUS.full, paddingLeft: 12, paddingRight: 8, paddingVertical: 7, gap: 6 },
  tagText: { fontSize: 13, color: C.textPrimary, fontWeight: '500' },
  tagX: { fontSize: 18, color: C.textTertiary, lineHeight: 18, marginTop: -1 },
  commonTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.surface1, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 7 },
  commonPlus: { fontSize: 14, fontWeight: '900', color: C.lime },
  commonText: { fontSize: 13, color: C.textSecondary, fontWeight: '500' },
});
