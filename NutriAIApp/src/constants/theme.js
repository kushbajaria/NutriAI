import { Dimensions, Platform } from 'react-native';

export const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const C = {
  // Base — deep neutral charcoal
  black:      '#0E0E12',
  surface0:   '#131318',
  surface1:   '#1A1A22',
  surface2:   '#21212C',
  surface3:   '#292936',
  surface4:   '#313140',
  border:     '#272735',
  borderHi:   '#323242',
  borderGlow: 'rgba(124,143,250,0.18)',

  // Accent — soft indigo / periwinkle
  lime:       '#7C8FFA',
  limeDim:    '#5A6ED8',
  limeDeep:   '#1C2260',
  limeGlow:   'rgba(124,143,250,0.12)',
  limeGlowSm: 'rgba(124,143,250,0.06)',
  limeGlowMd: 'rgba(124,143,250,0.18)',

  // Text — cool neutral hierarchy
  textPrimary:   '#F0F0F8',
  textSecondary: '#8888A8',
  textTertiary:  '#4A4A64',
  textInverse:   '#FFFFFF',
  textMuted:     '#252538',

  // Semantic macros — muted pastels
  protein:     '#A78BFA',
  proteinGlow: 'rgba(167,139,250,0.12)',
  carbs:       '#F5C060',
  carbsGlow:   'rgba(245,192,96,0.12)',
  fat:         '#F08050',
  fatGlow:     'rgba(240,128,80,0.12)',

  // Other
  blue:     '#6BA4FA',
  blueGlow: 'rgba(107,164,250,0.12)',
  red:      '#F07070',
  redGlow:  'rgba(240,112,112,0.12)',
  green:    '#52C87A',
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
    shadowColor: '#7C8FFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
};
