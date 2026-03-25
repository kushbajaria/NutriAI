import { Dimensions, Platform } from 'react-native';

export const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const C = {
  // Base
  black:      '#060A06',
  surface0:   '#0C110C',
  surface1:   '#121812',
  surface2:   '#182018',
  surface3:   '#1E281E',
  surface4:   '#243024',
  border:     '#1C261C',
  borderHi:   '#283828',
  borderGlow: '#A8FF3E22',

  // Accent — electric lime
  lime:       '#A8FF3E',
  limeDim:    '#7ACC2A',
  limeDeep:   '#3D6612',
  limeGlow:   'rgba(168,255,62,0.14)',
  limeGlowSm: 'rgba(168,255,62,0.07)',
  limeGlowMd: 'rgba(168,255,62,0.20)',

  // Text
  textPrimary:   '#F0F7F0',
  textSecondary: '#7A9478',
  textTertiary:  '#445444',
  textInverse:   '#060A06',
  textMuted:     '#2E3E2E',

  // Semantic macros
  protein:     '#C084FC',
  proteinGlow: 'rgba(192,132,252,0.15)',
  carbs:       '#FBBF24',
  carbsGlow:   'rgba(251,191,36,0.15)',
  fat:         '#F97316',
  fatGlow:     'rgba(249,115,22,0.15)',

  // Other
  blue:     '#60A5FA',
  blueGlow: 'rgba(96,165,250,0.15)',
  red:      '#F87171',
  redGlow:  'rgba(248,113,113,0.15)',
  green:    '#4ADE80',
};

export const FONT = {
  black:    Platform.OS === 'ios' ? 'System' : 'sans-serif-black',
  bold:     Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
  semibold: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  regular:  Platform.OS === 'ios' ? 'System' : 'sans-serif',
  mono:     Platform.OS === 'ios' ? 'Menlo' : 'monospace',
};

export const RADIUS = {
  xs:   6,
  sm:   10,
  md:   16,
  lg:   22,
  xl:   30,
  xxl:  40,
  full: 999,
};

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  lime: {
    shadowColor: '#A8FF3E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
};
