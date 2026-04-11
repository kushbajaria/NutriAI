import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated,
} from 'react-native';
import { C, RADIUS, SPACING, SHADOW } from '../constants/theme';

// ── DOTTED RING ────────────────────────────────────────────────────
// Beautiful dotted progress ring — unique to NutriSmart
export function DottedRing({ value, max, size = 200, color = C.lime, children, accessibilityLabel: customLabel }) {
  const pct = Math.min(1, Math.max(0, value / max));
  const NUM_DOTS = 48;
  const filled = Math.floor(pct * NUM_DOTS);
  const partialIdx = filled;
  const partialOpacity = (pct * NUM_DOTS) - filled;
  const DOT_W = 4;
  const DOT_H = 10;
  const RADIUS_RING = size / 2 - DOT_H / 2 - 4;

  return (
    <View style={{ width: size, height: size }} accessible accessibilityLabel={customLabel || `${value} of ${max}`}>
      {Array.from({ length: NUM_DOTS }).map((_, i) => {
        const angle = (i / NUM_DOTS) * 2 * Math.PI - Math.PI / 2;
        const cx = size / 2 + RADIUS_RING * Math.cos(angle);
        const cy = size / 2 + RADIUS_RING * Math.sin(angle);
        const deg = (i / NUM_DOTS) * 360 - 90;
        const isActive = i < filled;
        const isPartial = i === partialIdx;

        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: cx - DOT_W / 2,
              top: cy - DOT_H / 2,
              width: DOT_W,
              height: DOT_H,
              borderRadius: DOT_W / 2,
              backgroundColor: isActive ? color : isPartial ? color : C.surface3,
              opacity: isPartial ? Math.max(0.15, partialOpacity) : isActive ? 1 : 0.25,
              transform: [{ rotate: `${deg + 90}deg` }],
            }}
          />
        );
      })}
      <View style={{
        position: 'absolute',
        top: DOT_H + 8, left: DOT_H + 8,
        right: DOT_H + 8, bottom: DOT_H + 8,
        alignItems: 'center', justifyContent: 'center',
      }}>
        {children}
      </View>
    </View>
  );
}

// ── MACRO ARC BAR ─────────────────────────────────────────────────
export function MacroArcBar({ value, max, color, label, unit = 'g' }) {
  const pct = Math.min(1, Math.max(0, value / max));
  const NUM = 20;
  const filled = Math.floor(pct * NUM);

  return (
    <View style={styles.macroArcWrap}>
      <View style={styles.macroArcDots}>
        {Array.from({ length: NUM }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.macroArcDot,
              { backgroundColor: i < filled ? color : C.surface3, opacity: i < filled ? 1 : 0.3 }
            ]}
          />
        ))}
      </View>
      <View style={styles.macroArcInfo}>
        <Text style={[styles.macroArcVal, { color }]}>{value}<Text style={styles.macroArcUnit}>{unit}</Text></Text>
        <Text style={styles.macroArcLabel}>{label}</Text>
      </View>
    </View>
  );
}

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
export function Badge({ label, color = C.lime }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '18', borderColor: color + '35' }]} accessible accessibilityLabel={label}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

// ── PROGRESS BAR ──────────────────────────────────────────────────
export function ProgressBar({ value, max, color = C.lime, height = 3 }) {
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
export function Card({ children, style, onPress, glow }) {
  const cardStyle = [
    styles.card,
    glow && styles.cardGlow,
    style,
  ];
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
export function StatPill({ icon, value, label, color = C.lime }) {
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

// ── GLOW DOT ──────────────────────────────────────────────────────
export function GlowDot({ color = C.lime, size = 8 }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color,
      shadowColor: color, shadowOpacity: 0.8, shadowRadius: 4,
      elevation: 2,
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
      <GlowDot />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Macro Arc Bar
  macroArcWrap: { flex: 1, backgroundColor: C.surface2, borderRadius: RADIUS.md, padding: 12, borderWidth: 1, borderColor: C.border },
  macroArcDots: { flexDirection: 'row', gap: 2, marginBottom: 8, flexWrap: 'wrap' },
  macroArcDot: { width: 3, height: 6, borderRadius: 2 },
  macroArcInfo: { alignItems: 'center' },
  macroArcVal: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  macroArcUnit: { fontSize: 11, fontWeight: '600' },
  macroArcLabel: { fontSize: 10, color: C.textTertiary, fontWeight: '600', marginTop: 2 },

  // Pill Button
  pillBtn: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  pillBtnPrimary: { backgroundColor: C.lime, ...SHADOW.lime },
  pillBtnSecondary: { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.borderHi },
  pillBtnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.borderHi },
  pillBtnDanger: { backgroundColor: C.redGlow, borderWidth: 1, borderColor: C.red + '40' },
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

  // Section Header
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sectionHeaderText: { fontSize: 10, fontWeight: '700', color: C.textTertiary, letterSpacing: 1.5 },
  sectionHeaderAction: { fontSize: 12, color: C.lime, fontWeight: '600', letterSpacing: 0.3 },

  // Macro Chip
  macroChip: { flex: 1, borderRadius: RADIUS.md, padding: 12, alignItems: 'center', borderWidth: 1, gap: 4 },
  macroChipDot: { width: 5, height: 5, borderRadius: 3, marginBottom: 2 },
  macroChipVal: { fontSize: 19, fontWeight: '800', letterSpacing: -0.5 },
  macroChipUnit: { fontSize: 11, fontWeight: '600' },
  macroChipLabel: { fontSize: 10, color: C.textTertiary, fontWeight: '600' },

  // Card
  card: { backgroundColor: C.surface1, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: C.border },
  cardGlow: { borderColor: C.lime + '35', ...SHADOW.lime },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: SPACING.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerLabel: { fontSize: 11, color: C.textTertiary, fontWeight: '600', letterSpacing: 0.8 },

  // Screen Header
  screenHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: C.border },
  screenHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  screenHeaderSub: { fontSize: 9, color: C.lime, fontWeight: '700', letterSpacing: 1.8, marginBottom: 1 },
  screenHeaderTitle: { fontSize: 22, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.5 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.borderHi, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 18, color: C.lime, marginTop: -1 },

  // Stat Pill
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.surface2, borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  statPillIcon: { fontSize: 16 },
  statPillValue: { fontSize: 14, fontWeight: '800', letterSpacing: -0.3 },
  statPillLabel: { fontSize: 10, color: C.textTertiary, fontWeight: '600' },

  // Toast
  toast: { position: 'absolute', bottom: 110, alignSelf: 'center', backgroundColor: C.surface2, borderRadius: RADIUS.full, paddingHorizontal: 22, paddingVertical: 13, borderWidth: 1, borderColor: C.lime + '45', flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 999, ...SHADOW.lime },
  toastText: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
});
