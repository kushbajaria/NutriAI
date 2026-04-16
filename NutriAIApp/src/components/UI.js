import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { C, RADIUS, SPACING, SHADOW } from '../constants/theme';

// ── CIRCULAR PROGRESS ─────────────────────────────────────────────
// Clean SVG ring — replaces DottedRing
export function CircularProgress({ value, max, size = 200, color = C.accent, strokeWidth = 6, children, accessibilityLabel: customLabel }) {
  const pct = Math.min(1, Math.max(0, value / max));
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference * (1 - pct);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessible accessibilityLabel={customLabel || `${value} of ${max}`}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={C.surface3}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Fill */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

// Keep DottedRing as alias for backward compat during migration
export const DottedRing = CircularProgress;

// ── PILL BUTTON ───────────────────────────────────────────────────
export function PillButton({ label, onPress, variant = 'primary', style, disabled, icon }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={[
        styles.pillBtn,
        variant === 'primary'   && styles.pillBtnPrimary,
        variant === 'secondary' && styles.pillBtnSecondary,
        variant === 'ghost'     && styles.pillBtnGhost,
        variant === 'danger'    && styles.pillBtnDanger,
        disabled && styles.pillBtnDisabled,
        style,
      ]}
    >
      {icon && <Text style={styles.pillBtnIcon}>{icon}</Text>}
      <Text style={[
        styles.pillBtnText,
        variant === 'primary'   && styles.pillBtnTextPrimary,
        variant === 'secondary' && styles.pillBtnTextSecondary,
        variant === 'ghost'     && styles.pillBtnTextGhost,
        variant === 'danger'    && styles.pillBtnTextDanger,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ── BADGE ──────────────────────────────────────────────────────────
export function Badge({ label, color = C.accent }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '18', borderColor: color + '35' }]} accessible accessibilityLabel={label}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

// ── PROGRESS BAR ──────────────────────────────────────────────────
export function ProgressBar({ value, max, color = C.accent, height = 3 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <View style={[styles.progressTrack, { height }]}>
      <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color, height }]} />
    </View>
  );
}

// ── SECTION HEADER ────────────────────────────────────────────────
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

// ── MACRO CHIP ────────────────────────────────────────────────────
export function MacroChip({ value, unit, label, color }) {
  return (
    <View style={[styles.macroChip, { borderColor: color + '30', backgroundColor: color + '0D' }]} accessible accessibilityLabel={`${label}: ${value}${unit}`}>
      <View style={[styles.macroChipDot, { backgroundColor: color }]} />
      <Text style={[styles.macroChipVal, { color }]}>
        {value}<Text style={styles.macroChipUnit}>{unit}</Text>
      </Text>
      <Text style={styles.macroChipLabel}>{label}</Text>
    </View>
  );
}

// ── CARD ──────────────────────────────────────────────────────────
export function Card({ children, style, onPress }) {
  const cardStyle = [styles.card, style];
  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.75}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

// ── DIVIDER ───────────────────────────────────────────────────────
export function Divider({ label }) {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      {label && <Text style={styles.dividerLabel}>{label}</Text>}
      {label && <View style={styles.dividerLine} />}
    </View>
  );
}

// ── SCREEN HEADER ─────────────────────────────────────────────────
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

// ── STAT PILL ─────────────────────────────────────────────────────
export function StatPill({ icon, value, label, color = C.accent }) {
  return (
    <View style={[styles.statPill, { borderColor: color + '25' }]}>
      <Text style={styles.statPillIcon}>{icon}</Text>
      <View>
        <Text style={[styles.statPillValue, { color }]}>{value}</Text>
        <Text style={styles.statPillLabel}>{label}</Text>
      </View>
    </View>
  );
}

// ── GLOW DOT (simplified — just a solid accent dot) ───────────────
export function GlowDot({ color = C.accent, size = 8 }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color,
    }} />
  );
}

// ── TOAST ──────────────────────────────────────────────────────────
export function Toast({ message }) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 20, duration: 300, useNativeDriver: true }),
        ]).start();
      }, 1800);
    });
  }, [message]);

  return (
    <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }] }]}>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Pill Button
  pillBtn: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  pillBtnPrimary: { backgroundColor: C.accent, ...SHADOW.accent },
  pillBtnSecondary: { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.borderHi },
  pillBtnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.borderHi },
  pillBtnDanger: { backgroundColor: C.redBg, borderWidth: 1, borderColor: C.red + '40' },
  pillBtnDisabled: { opacity: 0.35 },
  pillBtnIcon: { fontSize: 16 },
  pillBtnText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.1 },
  pillBtnTextPrimary: { color: C.textInverse },
  pillBtnTextSecondary: { color: C.textPrimary },
  pillBtnTextGhost: { color: C.textSecondary },
  pillBtnTextDanger: { color: C.red },

  // Badge
  badge: { borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  // Progress
  progressTrack: { backgroundColor: C.surface3, borderRadius: RADIUS.full, overflow: 'hidden', width: '100%' },
  progressFill: { borderRadius: RADIUS.full },

  // Section Header — normal case, slightly larger
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sectionHeaderText: { fontSize: 13, fontWeight: '600', color: C.textSecondary, letterSpacing: 0.2 },
  sectionHeaderAction: { fontSize: 13, color: C.accent, fontWeight: '600' },

  // Macro Chip
  macroChip: { flex: 1, borderRadius: RADIUS.md, padding: 12, alignItems: 'center', borderWidth: 1, gap: 4 },
  macroChipDot: { width: 5, height: 5, borderRadius: 3, marginBottom: 2 },
  macroChipVal: { fontSize: 19, fontWeight: '800', letterSpacing: -0.5 },
  macroChipUnit: { fontSize: 11, fontWeight: '600' },
  macroChipLabel: { fontSize: 10, color: C.textTertiary, fontWeight: '600' },

  // Card
  card: { backgroundColor: C.surface1, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: C.border },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: SPACING.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerLabel: { fontSize: 11, color: C.textTertiary, fontWeight: '600', letterSpacing: 0.8 },

  // Screen Header
  screenHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: C.border },
  screenHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  screenHeaderSub: { fontSize: 9, color: C.accent, fontWeight: '700', letterSpacing: 1.8, marginBottom: 1 },
  screenHeaderTitle: { fontSize: 22, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.5 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.borderHi, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 18, color: C.accent, marginTop: -1 },

  // Stat Pill
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.surface2, borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  statPillIcon: { fontSize: 16 },
  statPillValue: { fontSize: 14, fontWeight: '800', letterSpacing: -0.3 },
  statPillLabel: { fontSize: 10, color: C.textTertiary, fontWeight: '600' },

  // Toast — clean, no glow
  toast: { position: 'absolute', bottom: 110, alignSelf: 'center', backgroundColor: C.surface2, borderRadius: RADIUS.full, paddingHorizontal: 22, paddingVertical: 13, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 999, ...SHADOW.sm },
  toastText: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
});
