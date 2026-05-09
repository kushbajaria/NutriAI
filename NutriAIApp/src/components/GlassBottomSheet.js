import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING } from '../constants/theme';

const SCREEN_H = Dimensions.get('window').height;

/**
 * GlassBottomSheet — frosted glass modal sheet with spring animation.
 */
export default function GlassBottomSheet({ visible, onClose, height = 400, children }) {
  const { mode, palette } = useTheme();
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SCREEN_H,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity, backgroundColor: palette.overlay }]} />
      </TouchableWithoutFeedback>
      <Animated.View style={[styles.sheet, { height, transform: [{ translateY }], borderColor: palette.glass2Border }]}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={mode === 'dark' ? 'dark' : 'light'}
          blurAmount={24}
          reducedTransparencyFallbackColor={palette.bg1}
        />
        <View style={styles.handleRow}>
          <View style={[styles.handle, { backgroundColor: palette.textTertiary }]} />
        </View>
        <View style={styles.content}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    opacity: 0.4,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
});
