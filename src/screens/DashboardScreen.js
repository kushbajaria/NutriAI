import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Modal, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { ProgressBar, Badge, MacroChip, SectionHeader, Card } from '../components/UI';
import { RECIPES } from '../constants/data';

function StatRing({ label, value, max, unit, color, onPress }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <TouchableOpacity style={ds.ringCard} onPress={onPress} activeOpacity={0.75}>
      <View style={ds.ringTop}>
        <Text style={[ds.ringValue, { color }]}>{value}</Text>
        <Text style={ds.ringMax}>/{max}{unit}</Text>
      </View>
      <ProgressBar value={value} max={max} color={color} height={4} />
      <Text style={ds.ringLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function MealDetailModal({ visible, onClose, type, data }) {
  const { loggedMeals, totalCals, totalProtein, totalCarbs, totalFat } = useApp();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={ds.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={ds.sheet} activeOpacity={1}>
          <View style={ds.sheetHandle} />

          {type === 'calories' && (
            <>
              <Text style={ds.sheetTitle}>Calorie Breakdown</Text>
              <View style={ds.bigNumRow}>
                <Text style={[ds.bigNum, { color: C.lime }]}>{totalCals}</Text>
                <Text style={ds.bigNumSub}> / 2200 kcal today</Text>
              </View>
              <View style={[ds.macroRow, { marginBottom: SPACING.lg }]}>
                <MacroChip value={totalProtein} unit="g" label="Protein" color={C.protein} />
                <MacroChip value={totalCarbs}   unit="g" label="Carbs"   color={C.carbs}   />
                <MacroChip value={totalFat}     unit="g" label="Fat"     color={C.fat}      />
              </View>
              <SectionHeader title="MEALS LOGGED" />
              {loggedMeals.map((m, i) => (
                <View key={i} style={ds.mealRow}>
                  <Text style={ds.mealEmoji}>{m.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={ds.mealName}>{m.name}</Text>
                    <Text style={ds.mealMacros}>P {m.protein}g · C {m.carbs}g · F {m.fat}g</Text>
                  </View>
                  <Text style={[ds.mealCal, { color: C.lime }]}>{m.cal}</Text>
                </View>
              ))}
            </>
          )}

          {type === 'workouts' && (
            <>
              <Text style={ds.sheetTitle}>Today's Workouts</Text>
              <View style={ds.macroRow}>
                <MacroChip value="285" unit="" label="Cal Burned" color={C.lime}    />
                <MacroChip value="45"  unit=""  label="Min Active" color={C.blue}   />
                <MacroChip value="8"   unit=""  label="Exercises"  color={C.protein} />
              </View>
              {[
                { name: 'Morning Strength', tag: 'Upper Body', done: true,  time: '6:30 AM' },
                { name: 'Evening Cardio',   tag: 'Cardio',     done: false, time: '6:00 PM' },
              ].map(w => (
                <View key={w.name} style={ds.workoutRow}>
                  <View style={[ds.workoutDot, { backgroundColor: w.done ? C.lime : C.surface3, borderColor: w.done ? C.lime : C.borderHi }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={ds.workoutName}>{w.name}</Text>
                    <Text style={ds.workoutTime}>{w.time}</Text>
                  </View>
                  <Badge label={w.tag} color={w.done ? C.lime : C.textSecondary} />
                </View>
              ))}
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export default function DashboardScreen({ navigation }) {
  const { totalCals, totalProtein, loggedMeals, goal, user } = useApp();
  const [modal, setModal] = useState(null);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <SafeAreaView style={ds.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.black} />

      {/* Header */}
      <View style={ds.header}>
        <View>
          <Text style={ds.headerDate}>{today.toUpperCase()}</Text>
          <Text style={ds.headerGreet}>Hey, {firstName} 👋</Text>
        </View>
        <TouchableOpacity style={ds.avatarBtn} onPress={() => navigation.navigate('Profile')} activeOpacity={0.8}>
          <Text style={ds.avatarText}>{firstName[0]?.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ds.scroll}>

        {/* Goal banner */}
        <View style={ds.goalBanner}>
          <Text style={ds.goalBannerEmoji}>
            {goal === 'Lose Weight' ? '🔥' : goal === 'Build Muscle' ? '💪' : goal === 'Stay Healthy' ? '🧘' : '⚡'}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={ds.goalBannerLabel}>CURRENT GOAL</Text>
            <Text style={ds.goalBannerGoal}>{goal}</Text>
          </View>
          <Badge label="Active" color={C.lime} />
        </View>

        {/* Stat rings */}
        <SectionHeader title="TODAY'S RINGS" action="All Stats" onAction={() => setModal('calories')} />
        <View style={ds.ringRow}>
          <StatRing label="Calories"  value={totalCals}    max={2200} unit=""  color={C.lime}    onPress={() => setModal('calories')} />
          <StatRing label="Protein"   value={totalProtein} max={120}  unit="g" color={C.protein} onPress={() => setModal('calories')} />
          <StatRing label="Workouts"  value={1}            max={2}    unit=""  color={C.blue}    onPress={() => setModal('workouts')} />
        </View>

        {/* Quick actions */}
        <SectionHeader title="QUICK ACTIONS" />
        <View style={ds.qaGrid}>
          {[
            { icon: '🥫', label: 'Pantry',  sub: `${loggedMeals.length > 0 ? '22 items' : 'Empty'}`,         screen: 'Pantry'  },
            { icon: '🍽️', label: 'Meals',   sub: `${loggedMeals.length} logged`,    screen: 'Meals'   },
            { icon: '💪', label: 'Workout', sub: '1 of 2 done',                     screen: 'Workout' },
          ].map(q => (
            <TouchableOpacity key={q.label} style={ds.qaCard} onPress={() => navigation.navigate(q.screen)} activeOpacity={0.75}>
              <Text style={ds.qaIcon}>{q.icon}</Text>
              <Text style={ds.qaLabel}>{q.label}</Text>
              <Text style={ds.qaSub}>{q.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weekly summary */}
        <SectionHeader title="WEEKLY SUMMARY" />
        <View style={ds.summaryCard}>
          <View style={ds.summaryGrid}>
            {[
              { val: loggedMeals.length, lbl: 'Meals',    color: C.lime    },
              { val: '3',               lbl: 'Workouts', color: C.blue    },
              { val: '85%',             lbl: 'Adherence',color: C.protein },
              { val: '1.2k',            lbl: 'Cal Burned',color: C.carbs  },
            ].map(s => (
              <View key={s.lbl} style={ds.summaryItem}>
                <Text style={[ds.summaryVal, { color: s.color }]}>{s.val}</Text>
                <Text style={ds.summaryLbl}>{s.lbl}</Text>
              </View>
            ))}
          </View>
          <View style={ds.summaryBarRow}>
            {[100, 80, 60, 90, 70, 85, 40].map((h, i) => (
              <View key={i} style={ds.barWrap}>
                <View style={[ds.bar, { height: h * 0.4, backgroundColor: i === 6 ? C.surface3 : C.lime, opacity: i === 6 ? 0.3 : i < 4 ? 1 : 0.6 }]} />
                <Text style={ds.barDay}>{['M','T','W','T','F','S','S'][i]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Suggested meal */}
        <SectionHeader title="SUGGESTED NEXT MEAL" action="See All" onAction={() => navigation.navigate('Meals')} />
        {RECIPES.slice(1, 2).map(r => (
          <TouchableOpacity key={r.id} style={ds.suggestCard} onPress={() => navigation.navigate('Recipe', { recipe: r })} activeOpacity={0.8}>
            <View style={ds.suggestLeft}>
              <Text style={ds.suggestEmoji}>{r.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Badge label={r.tag} color={C.lime} />
              <Text style={ds.suggestName}>{r.name}</Text>
              <Text style={ds.suggestMeta}>{r.cal} cal · {r.protein}g protein · {r.prepTime + r.cookTime} min</Text>
            </View>
            <Text style={ds.suggestArrow}>→</Text>
          </TouchableOpacity>
        ))}

      </ScrollView>

      <MealDetailModal visible={!!modal} onClose={() => setModal(null)} type={modal} />
    </SafeAreaView>
  );
}

const ds = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.black },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: C.border },
  headerDate: { fontSize: 10, fontWeight: '700', color: C.textTertiary, letterSpacing: 1.2, marginBottom: 2 },
  headerGreet: { fontSize: 22, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.5 },
  avatarBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '900', color: C.textInverse },
  scroll: { padding: SPACING.md, paddingBottom: 100 },
  goalBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface1, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: C.border },
  goalBannerEmoji: { fontSize: 24 },
  goalBannerLabel: { fontSize: 9, fontWeight: '700', color: C.textTertiary, letterSpacing: 1.2, marginBottom: 2 },
  goalBannerGoal: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
  ringRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.lg },
  ringCard: { flex: 1, backgroundColor: C.surface1, borderRadius: RADIUS.lg, padding: 12, borderWidth: 1, borderColor: C.border, gap: 6 },
  ringTop: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  ringValue: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  ringMax: { fontSize: 11, color: C.textTertiary, fontWeight: '600' },
  ringLabel: { fontSize: 10, color: C.textTertiary, fontWeight: '600', letterSpacing: 0.5 },
  qaGrid: { flexDirection: 'row', gap: 8, marginBottom: SPACING.lg },
  qaCard: { flex: 1, backgroundColor: C.surface1, borderRadius: RADIUS.lg, padding: 14, borderWidth: 1, borderColor: C.border, gap: 4 },
  qaIcon: { fontSize: 22, marginBottom: 2 },
  qaLabel: { fontSize: 13, fontWeight: '700', color: C.textPrimary },
  qaSub: { fontSize: 11, color: C.textTertiary },
  summaryCard: { backgroundColor: C.surface1, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: C.border, marginBottom: SPACING.lg },
  summaryGrid: { flexDirection: 'row', marginBottom: SPACING.md },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  summaryLbl: { fontSize: 10, color: C.textTertiary, fontWeight: '600', marginTop: 2 },
  summaryBarRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-end', height: 50 },
  barWrap: { flex: 1, alignItems: 'center', gap: 4 },
  bar: { width: '100%', borderRadius: 3, minHeight: 4 },
  barDay: { fontSize: 9, color: C.textTertiary, fontWeight: '600' },
  suggestCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.surface1, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: C.border, marginBottom: SPACING.lg },
  suggestLeft: { width: 52, height: 52, borderRadius: RADIUS.md, backgroundColor: C.surface3, alignItems: 'center', justifyContent: 'center' },
  suggestEmoji: { fontSize: 28 },
  suggestName: { fontSize: 16, fontWeight: '700', color: C.textPrimary, marginTop: 4, marginBottom: 3 },
  suggestMeta: { fontSize: 12, color: C.textSecondary },
  suggestArrow: { fontSize: 18, color: C.textTertiary },
  // modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.surface0, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: C.border, padding: SPACING.lg, paddingBottom: 40, maxHeight: '80%' },
  sheetHandle: { width: 36, height: 4, backgroundColor: C.surface3, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.lg },
  sheetTitle: { fontSize: 24, fontWeight: '900', color: C.textPrimary, letterSpacing: -0.5, marginBottom: SPACING.sm },
  bigNumRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: SPACING.md },
  bigNum: { fontSize: 48, fontWeight: '900', letterSpacing: -2 },
  bigNumSub: { fontSize: 14, color: C.textSecondary, marginLeft: 4 },
  macroRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.md },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface1, borderRadius: RADIUS.md, padding: 12, marginBottom: 8 },
  mealEmoji: { fontSize: 24 },
  mealName: { fontSize: 14, fontWeight: '600', color: C.textPrimary, marginBottom: 2 },
  mealMacros: { fontSize: 11, color: C.textTertiary },
  mealCal: { fontSize: 16, fontWeight: '800' },
  workoutRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface1, borderRadius: RADIUS.md, padding: 14, marginBottom: 8 },
  workoutDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  workoutName: { fontSize: 14, fontWeight: '600', color: C.textPrimary, marginBottom: 2 },
  workoutTime: { fontSize: 11, color: C.textTertiary },
});
