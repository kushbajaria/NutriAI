import { Dimensions, Platform } from 'react-native';

export const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const C = {
  // Base
  black:      '#080C08',
  surface0:   '#0E130E',
  surface1:   '#141A14',
  surface2:   '#1A221A',
  surface3:   '#202A20',
  border:     '#1E281E',
  borderHi:   '#2A382A',

  // Accent — electric lime
  lime:       '#A8FF3E',
  limeDim:    '#7ACC2A',
  limeDeep:   '#3D6612',
  limeGlow:   'rgba(168,255,62,0.12)',
  limeGlowSm: 'rgba(168,255,62,0.06)',

  // Text
  textPrimary:   '#EFF5EF',
  textSecondary: '#7A9478',
  textTertiary:  '#4A644A',
  textInverse:   '#080C08',

  // Semantic
  protein:  '#C084FC',
  carbs:    '#FCD34D',
  fat:      '#FB923C',
  blue:     '#60A5FA',
  red:      '#F87171',
  green:    '#4ADE80',
};

export const FONT = {
  // Use system fonts — no loading issues, still looks premium
  black:       Platform.OS === 'ios' ? 'System' : 'sans-serif-black',
  bold:        Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
  semibold:    Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  regular:     Platform.OS === 'ios' ? 'System' : 'sans-serif',
  mono:        Platform.OS === 'ios' ? 'Menlo' : 'monospace',
};

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
