import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING } from '../constants/theme';

/**
 * GlassCard — frosted glass card with 3 elevation levels.
 *
 * Props:
 *   level    — 1 (surface), 2 (elevated), 3 (floating). Default 1.
 *   onPress  — if provided, card becomes touchable.
 *   style    — additional styles.
 *   children — card contents.
 */
export default function GlassCard({ level = 1, onPress, style, children }) {
  const { mode, palette, blur } = useTheme();

  const bgColor = palette[`glass${level}Bg`];
  const borderColor = palette[`glass${level}Border`];
  const blurAmount = level === 1 ? blur.surface : level === 2 ? blur.elevated : blur.floating;

  const cardStyle = [
    styles.card,
    {
      borderColor,
      backgroundColor: bgColor,
    },
    level === 3 && {
      shadowColor: palette.shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: palette.shadowOpacity,
      shadowRadius: 32,
      elevation: 10,
    },
    style,
  ];

  const content = (
    <View style={cardStyle}>
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType={mode === 'dark' ? 'dark' : 'light'}
        blurAmount={blurAmount}
        reducedTransparencyFallbackColor={palette.bg1}
      />
      <View style={styles.inner}>
        {children}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75} accessibilityRole="button">
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inner: {
    padding: SPACING.md,
  },
});
