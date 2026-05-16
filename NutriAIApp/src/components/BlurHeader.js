import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '../context/ThemeContext';
import { SPACING, TYPE } from '../constants/theme';
import Icon from './Icon';

/**
 * BlurHeader — transparent navigation header with blur background on scroll.
 */
export default function BlurHeader({ title, subtitle, onBack, right, scrolled = false }) {
  const { mode, palette, accent } = useTheme();

  return (
    <View style={styles.wrapper}>
      {scrolled && (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={mode === 'dark' ? 'dark' : 'light'}
          blurAmount={16}
          reducedTransparencyFallbackColor={palette.bg0}
        />
      )}
      <View style={[styles.header, scrolled && { borderBottomColor: palette.border, borderBottomWidth: 1 }]}>
        <View style={styles.left}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={[styles.backBtn, { backgroundColor: palette.glass1Bg, borderColor: palette.glass1Border }]} activeOpacity={0.7}>
              <Icon name="chevron-back" size={20} color={accent.primary} />
            </TouchableOpacity>
          )}
          <View>
            {subtitle && <Text style={[styles.subtitle, { color: accent.primary }]}>{subtitle}</Text>}
            <Text style={[TYPE.headline, { color: palette.textPrimary }]}>{title}</Text>
          </View>
        </View>
        {right && <View>{right}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginBottom: 1,
    textTransform: 'uppercase',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
