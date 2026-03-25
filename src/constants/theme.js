import { Dimensions, Platform } from 'react-native';

export const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const C = {
  // Base
  black:      '#0C0C10',
  surface0:   '#111117',
  surface1:   '#17171E',
  surface2:   '#1D1D26',
  surface3:   '#242430',
  surface4:   '#2B2B3A',
  border:     '#222230',
  borderHi:   '#2D2D3E',
  borderGlow: '#FF7A6522',

  // Accent — warm coral
  lime:       '#FF7A65',
  limeDim:    '#CC5040',
  limeDeep:   '#5C1E14',
  limeGlow:   'rgba(255,122,101,0.14)',
  limeGlowSm: 'rgba(255,122,101,0.07)',
  limeGlowMd: 'rgba(255,122,101,0.20)',

  // Text
  textPrimary:   '#F2F2F8',
  textSecondary: '#858599',
  textTertiary:  '#484862',
  textInverse:   '#0C0C10',
  textMuted:     '#26263A',

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
  overlay:  'rgba(12,12,16,0.88)',
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
    shadowColor: '#FF7A65',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
};
