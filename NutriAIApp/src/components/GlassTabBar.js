import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING, SHADOW } from '../constants/theme';
import Icon from './Icon';

/**
 * GlassTabBar — floating frosted glass tab bar for bottom navigation.
 * Custom tabBar component for Tab.Navigator's `tabBar` prop.
 */
export default function GlassTabBar({ state, descriptors, navigation }) {
  const { mode, palette, gradients } = useTheme();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.bar, { borderColor: palette.glass2Border }]}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={mode === 'dark' ? 'dark' : 'light'}
          blurAmount={24}
          reducedTransparencyFallbackColor={palette.bg1}
        />
        <View style={styles.tabs}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const isCenter = options.tabBarIsCenter;

            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const iconName = options.tabBarIconName || 'ellipse';
            const label = options.tabBarLabel || options.title || route.name;

            if (isCenter) {
              return (
                <TouchableOpacity key={route.key} onPress={onPress} style={styles.centerTab} activeOpacity={0.8} accessibilityRole="tab" accessibilityState={{ selected: isFocused }} accessibilityLabel={label}>
                  <LinearGradient colors={gradients.premium} style={styles.centerIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Icon name={iconName} size={24} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.labelCenter, isFocused && styles.labelFocused]}>{label}</Text>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity key={route.key} onPress={onPress} style={styles.tab} activeOpacity={0.7} accessibilityRole="tab" accessibilityState={{ selected: isFocused }} accessibilityLabel={label}>
                <Icon name={isFocused ? iconName : `${iconName}-outline`} size={22} color={isFocused ? palette.textPrimary : palette.textTertiary} />
                <Text style={[styles.label, { color: isFocused ? palette.textPrimary : palette.textTertiary }]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    paddingBottom: 34,
  },
  bar: {
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOW.lg,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: SPACING.sm,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 4,
  },
  centerTab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -20,
    gap: 4,
  },
  centerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
  labelCenter: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A78BFA',
  },
  labelFocused: {
    color: '#A78BFA',
  },
});
