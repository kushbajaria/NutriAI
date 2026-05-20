import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { SPACING, SHADOW } from '../constants/theme';
import Icon from './Icon';

const BTN_RADIUS = 28;
const BTN_HEIGHT = 56;

export default function GradientButton({
  label,
  onPress,
  variant = 'primary',
  gradient,
  icon,
  disabled,
  style,
}) {
  const { palette, gradients, accent } = useTheme();
  const colors = gradient || gradients.primary;

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
        <View style={[styles.btn, { backgroundColor: colors[0] }, SHADOW.accent]}>
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFill, { borderRadius: BTN_RADIUS }]}
          />
          {icon && <Icon name={icon} size={18} color={palette.textInverse} style={styles.icon} />}
          <Text style={[styles.text, { color: palette.textInverse }]}>{label}</Text>
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
          {icon && <Icon name={icon} size={18} color={accent.primary} style={styles.icon} />}
          <Text style={[styles.text, { color: palette.textPrimary }]}>{label}</Text>
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
          {icon && <Icon name={icon} size={18} color={palette.textSecondary} style={styles.icon} />}
          <Text style={[styles.text, { color: palette.textSecondary }]}>{label}</Text>
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
        {icon && <Icon name={icon} size={18} color={accent.red} style={styles.icon} />}
        <Text style={[styles.text, { color: accent.red }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: BTN_HEIGHT,
    borderRadius: BTN_RADIUS,
    paddingHorizontal: SPACING.lg,
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
