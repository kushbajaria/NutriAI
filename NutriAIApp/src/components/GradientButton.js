import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING, SHADOW } from '../constants/theme';
import Icon from './Icon';

/**
 * GradientButton — primary CTA with gradient fill, or glass secondary variant.
 *
 * Props:
 *   label     — button text
 *   onPress   — press handler
 *   variant   — 'primary' (gradient), 'secondary' (glass), 'ghost', 'danger'
 *   gradient  — array of color stops (default: GRADIENTS.primary)
 *   icon      — optional Ionicons name (rendered left of label)
 *   disabled  — disables button
 *   style     — additional styles
 */
export default function GradientButton({
  label,
  onPress,
  variant = 'primary',
  gradient,
  icon,
  disabled,
  style,
}) {
  const { mode, palette, gradients, accent } = useTheme();
  const colors = gradient || gradients.primary;

  const inner = (iconColor, textColor) => (
    <View style={styles.inner}>
      {icon && <Icon name={icon} size={18} color={iconColor} style={styles.icon} />}
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!disabled }}
        style={[disabled && styles.disabled, style]}
      >
        <View style={[styles.btnWrap, SHADOW.accent]}>
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            {inner(palette.textInverse, palette.textInverse)}
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!disabled }}
        style={[disabled && styles.disabled, style]}
      >
        <View style={[styles.btn, styles.glassBg, { borderColor: palette.glass2Border, backgroundColor: palette.glass2Bg }]}>
          {inner(accent.primary, palette.textPrimary)}
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'ghost') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!disabled }}
        style={[disabled && styles.disabled, style]}
      >
        <View style={[styles.btn, { borderColor: palette.borderHi, borderWidth: 1, backgroundColor: 'transparent' }]}>
          {inner(palette.textSecondary, palette.textSecondary)}
        </View>
      </TouchableOpacity>
    );
  }

  // danger
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={[disabled && styles.disabled, style]}
    >
      <View style={[styles.btn, { borderColor: accent.red + '40', borderWidth: 1, backgroundColor: accent.redBg }]}>
        {inner(accent.red, accent.red)}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btnWrap: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  gradient: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 16,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 16,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassBg: {
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  icon: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.35,
  },
});
