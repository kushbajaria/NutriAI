import React, { useEffect, useRef } from 'react';
import { Text, Animated, StyleSheet, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING, SHADOW, ACCENT } from '../constants/theme';
import Icon from './Icon';

/**
 * GlassToast — frosted glass notification with slide-in and auto-dismiss.
 */
export default function GlassToast({ message, visible, onDismiss }) {
  const { mode, palette } = useTheme();
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const isError = /fail|error|incorrect|wrong/i.test(message);
  const isSuccess = /logged|posted|saved|complete|hit|deleted|sent|updated/i.test(message);
  const iconName = isError ? 'close-circle' : isSuccess ? 'checkmark-circle' : 'information-circle';
  const iconColor = isError ? ACCENT.red : isSuccess ? ACCENT.primary : ACCENT.blue;

  useEffect(() => {
    if (visible && message) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 200 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(translateY, { toValue: -80, duration: 300, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]).start(() => {
            if (onDismiss) onDismiss();
          });
        }, 2500);
      });
    }
  }, [visible, message]);

  if (!visible || !message) return null;

  return (
    <Animated.View style={[styles.wrapper, { opacity, transform: [{ translateY }] }]}>
      <View style={[styles.toast, { borderColor: palette.glass2Border }]}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={mode === 'dark' ? 'dark' : 'light'}
          blurAmount={24}
          reducedTransparencyFallbackColor={palette.bg1}
        />
        <View style={styles.content}>
          <Icon name={iconName} size={18} color={iconColor} />
          <Text style={[styles.text, { color: palette.textPrimary }]}>{message}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 60,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
