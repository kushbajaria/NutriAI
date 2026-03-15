import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ActivityIndicator,
} from 'react-native';
import { C, RADIUS, SPACING } from '../constants/theme';

// ── PILL BUTTON ──────────────────────────────────────────────────
export function PillButton({ label, onPress, variant = 'primary', style, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.pillBtn,
        variant === 'primary' && styles.pillBtnPrimary,
        variant === 'secondary' && styles.pillBtnSecondary,
        variant === 'ghost' && styles.pillBtnGhost,
        disabled && styles.pillBtnDisabled,
        style,
      ]}
    >
      <Text style={[
        styles.pillBtnText,
        variant === 'primary' && styles.pillBtnTextPrimary,
        variant === 'secondary' && styles.pillBtnTextSecondary,
        variant === 'ghost' && styles.pillBtnTextGhost,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ── BADGE ──────────────────────────────────────────────────────
export function Badge({ label, color = C.lime }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '18', borderColor: color + '30' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

// ── PROGRESS BAR ──────────────────────────────────────────────
export function ProgressBar({ value, max, color = C.lime, height = 3 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <View style={[styles.progressTrack, { height }]}>
      <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color, height }]} />
    </View>
  );
}

// ── SECTION HEADER ──────────────────────────────────────────────
export function SectionHeader({ title, action, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionHeaderAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── MACRO CHIP ──────────────────────────────────────────────────
export function MacroChip({ value, unit, label, color }) {
  return (
    <View style={styles.macroChip}>
      <Text style={[styles.macroChipVal, { color }]}>{value}<Text style={styles.macroChipUnit}>{unit}</Text></Text>
      <Text style={styles.macroChipLabel}>{label}</Text>
    </View>
  );
}

// ── CARD ──────────────────────────────────────────────────────
export function Card({ children, style, onPress }) {
  if (onPress) {
    return (
      <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.75}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

// ── DIVIDER ──────────────────────────────────────────────────────
export function Divider({ label }) {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      {label && <Text style={styles.dividerLabel}>{label}</Text>}
      {label && <View style={styles.dividerLine} />}
    </View>
  );
}

// ── SCREEN HEADER ──────────────────────────────────────────────
export function ScreenHeader({ title, subtitle, onBack, right }) {
  return (
    <View style={styles.screenHeader}>
      <View style={styles.screenHeaderLeft}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
        )}
        <View>
          {subtitle && <Text style={styles.screenHeaderSub}>{subtitle}</Text>}
          <Text style={styles.screenHeaderTitle}>{title}</Text>
        </View>
      </View>
      {right && <View>{right}</View>}
    </View>
  );
}

// ── TOAST ──────────────────────────────────────────────────────
export function Toast({ message }) {
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [message]);

  return (
    <Animated.View style={[styles.toast, { opacity }]}>
      <View style={styles.toastDot} />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Pill Button
  pillBtn: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  pillBtnPrimary: { backgroundColor: C.lime },
  pillBtnSecondary: { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border },
  pillBtnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.borderHi },
  pillBtnDisabled: { opacity: 0.4 },
  pillBtnText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  pillBtnTextPrimary: { color: C.textInverse },
  pillBtnTextSecondary: { color: C.textPrimary },
  pillBtnTextGhost: { color: C.textSecondary },

  // Badge
  badge: { borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },

  // Progress
  progressTrack: { backgroundColor: C.surface3, borderRadius: RADIUS.full, overflow: 'hidden', width: '100%' },
  progressFill: { borderRadius: RADIUS.full },

  // Section Header
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sectionHeaderText: { fontSize: 11, fontWeight: '700', color: C.textTertiary, letterSpacing: 1.2 },
  sectionHeaderAction: { fontSize: 13, color: C.lime, fontWeight: '600' },

  // Macro Chip
  macroChip: { flex: 1, backgroundColor: C.surface2, borderRadius: RADIUS.md, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  macroChipVal: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  macroChipUnit: { fontSize: 12, fontWeight: '600' },
  macroChipLabel: { fontSize: 11, color: C.textTertiary, marginTop: 3, fontWeight: '500' },

  // Card
  card: { backgroundColor: C.surface1, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: C.border },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: SPACING.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerLabel: { fontSize: 12, color: C.textTertiary },

  // Screen Header
  screenHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: C.border },
  screenHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  screenHeaderSub: { fontSize: 11, color: C.lime, fontWeight: '700', letterSpacing: 1, marginBottom: 1 },
  screenHeaderTitle: { fontSize: 20, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.3 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 18, color: C.lime, marginTop: -1 },

  // Toast
  toast: { position: 'absolute', bottom: 100, alignSelf: 'center', backgroundColor: C.surface2, borderRadius: RADIUS.full, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, borderColor: C.lime + '40', flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 999 },
  toastDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.lime },
  toastText: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
});
