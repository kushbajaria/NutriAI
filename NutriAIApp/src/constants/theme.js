import { Dimensions, Platform } from 'react-native';

export const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const C = {
  // Base — warm neutral charcoal
  black:      '#0C0C0F',
  surface0:   '#121214',
  surface1:   '#1B1B1F',
  surface2:   '#232328',
  surface3:   '#2C2C32',
  surface4:   '#363640',
  border:     '#28282F',
  borderHi:   '#343440',

  // Primary accent — iOS system green
  accent:      '#34C759',
  accentDim:   '#2AA548',
  accentDeep:  '#1A3D24',
  accentBg:    'rgba(52,199,89,0.10)',
  accentBgSm:  'rgba(52,199,89,0.05)',
  accentBgMd:  'rgba(52,199,89,0.15)',

  // Text — clean neutral hierarchy
  textPrimary:   '#F0F0F5',
  textSecondary: '#8A8A9A',
  textTertiary:  '#505060',
  textInverse:   '#FFFFFF',
  textMuted:     '#252530',

  // Semantic macros
  protein:     '#A78BFA',
  proteinBg:   'rgba(167,139,250,0.10)',
  carbs:       '#F5C060',
  carbsBg:     'rgba(245,192,96,0.10)',
  fat:         '#F08050',
  fatBg:       'rgba(240,128,80,0.10)',

  // Other
  blue:     '#6BA4FA',
  blueBg:   'rgba(107,164,250,0.10)',
  red:      '#F07070',
  redBg:    'rgba(240,112,112,0.10)',
  green:    '#34C759',
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
  accent: {
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};
