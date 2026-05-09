import { Dimensions, Platform } from 'react-native';

export const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── DARK PALETTE ─────────────────────────────────────────────────
const DARK = {
  bg0:        '#0C0C1A',
  bg1:        '#161628',
  bg2:        '#1E1E35',
  bg3:        '#2A2A45',
  border:     'rgba(255,255,255,0.08)',
  borderHi:   'rgba(255,255,255,0.12)',
  textPrimary:   '#F0F0F5',
  textSecondary: '#8A8A9A',
  textTertiary:  '#505060',
  textInverse:   '#FFFFFF',
  glass1Bg:       'rgba(255,255,255,0.06)',
  glass1Border:   'rgba(255,255,255,0.08)',
  glass2Bg:       'rgba(255,255,255,0.10)',
  glass2Border:   'rgba(255,255,255,0.12)',
  glass3Bg:       'rgba(255,255,255,0.15)',
  glass3Border:   'rgba(255,255,255,0.18)',
  shadowColor:    '#000',
  shadowOpacity:  0.3,
  overlay:        'rgba(0,0,0,0.5)',
  shimmer:        'rgba(255,255,255,0.06)',
};

const LIGHT = {
  bg0:        '#FFFFFF',
  bg1:        '#F2F2F7',
  bg2:        '#E8E8F0',
  bg3:        '#D8D8E5',
  border:     'rgba(0,0,0,0.06)',
  borderHi:   'rgba(0,0,0,0.10)',
  textPrimary:   '#1C1C2E',
  textSecondary: '#6B6B80',
  textTertiary:  '#9999AA',
  textInverse:   '#FFFFFF',
  glass1Bg:       'rgba(255,255,255,0.70)',
  glass1Border:   'rgba(255,255,255,0.50)',
  glass2Bg:       'rgba(255,255,255,0.80)',
  glass2Border:   'rgba(255,255,255,0.60)',
  glass3Bg:       'rgba(255,255,255,0.90)',
  glass3Border:   'rgba(255,255,255,0.70)',
  shadowColor:    '#000',
  shadowOpacity:  0.08,
  overlay:        'rgba(0,0,0,0.3)',
  shimmer:        'rgba(0,0,0,0.04)',
};

export const ACCENT = {
  primary:      '#34C759',
  primaryEnd:   '#00C9A7',
  primaryDim:   '#2AA548',
  primaryBg:    'rgba(52,199,89,0.10)',
  premium:      '#A78BFA',
  premiumMid:   '#818CF8',
  premiumEnd:   '#6366F1',
  premiumBg:    'rgba(167,139,250,0.10)',
  energy:       '#F97316',
  energyMid:    '#F59E0B',
  energyEnd:    '#FBBF24',
  energyBg:     'rgba(249,115,22,0.10)',
  intensity:    '#EC4899',
  intensityMid: '#F43F5E',
  intensityEnd: '#EF4444',
  intensityBg:  'rgba(236,72,153,0.10)',
  hydration:    '#06B6D4',
  hydrationMid: '#3B82F6',
  hydrationEnd: '#6366F1',
  hydrationBg:  'rgba(6,182,212,0.10)',
  protein:    '#A78BFA',
  proteinEnd: '#C084FC',
  proteinBg:  'rgba(167,139,250,0.10)',
  carbs:      '#F5C060',
  carbsEnd:   '#FBBF24',
  carbsBg:    'rgba(245,192,96,0.10)',
  fat:        '#F08050',
  fatEnd:     '#F97316',
  fatBg:      'rgba(240,128,80,0.10)',
  blue:       '#6BA4FA',
  blueBg:     'rgba(107,164,250,0.10)',
  red:        '#F07070',
  redBg:      'rgba(240,112,112,0.10)',
  green:      '#34C759',
};

export const GRADIENTS = {
  primary:    ['#34C759', '#30D158', '#00C9A7'],
  premium:    ['#A78BFA', '#818CF8', '#6366F1'],
  energy:     ['#F97316', '#F59E0B', '#FBBF24'],
  intensity:  ['#EC4899', '#F43F5E', '#EF4444'],
  hydration:  ['#06B6D4', '#3B82F6', '#6366F1'],
  protein:    ['#A78BFA', '#C084FC'],
  carbs:      ['#F5C060', '#FBBF24'],
  fat:        ['#F08050', '#F97316'],
};

export const BLUR = {
  surface:  16,
  elevated: 24,
  floating: 32,
};

export const FONT = {
  black:    Platform.OS === 'ios' ? 'System' : 'sans-serif-black',
  bold:     Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
  semibold: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  regular:  Platform.OS === 'ios' ? 'System' : 'sans-serif',
  mono:     Platform.OS === 'ios' ? 'Menlo' : 'monospace',
};

export const TYPE = {
  display:  { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  headline: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  subhead:  { fontSize: 17, fontWeight: '600', letterSpacing: 0 },
  body:     { fontSize: 15, fontWeight: '400', letterSpacing: 0.1 },
  caption:  { fontSize: 13, fontWeight: '400', letterSpacing: 0.2 },
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

export function getTheme(mode) {
  return mode === 'dark' ? DARK : LIGHT;
}

// Backward compat — legacy C export maps to dark palette + shared accents
export const C = {
  black:      DARK.bg0,
  surface0:   DARK.bg0,
  surface1:   DARK.bg1,
  surface2:   DARK.bg2,
  surface3:   DARK.bg3,
  surface4:   DARK.bg3,
  border:     DARK.border,
  borderHi:   DARK.borderHi,
  textPrimary:   DARK.textPrimary,
  textSecondary: DARK.textSecondary,
  textTertiary:  DARK.textTertiary,
  textInverse:   DARK.textInverse,
  textMuted:     '#252530',
  accent:     ACCENT.primary,
  accentDim:  ACCENT.primaryDim,
  accentDeep: '#1A3D24',
  accentBg:   ACCENT.primaryBg,
  accentBgSm: 'rgba(52,199,89,0.05)',
  accentBgMd: 'rgba(52,199,89,0.15)',
  protein:   ACCENT.protein,
  proteinBg: ACCENT.proteinBg,
  carbs:     ACCENT.carbs,
  carbsBg:   ACCENT.carbsBg,
  fat:       ACCENT.fat,
  fatBg:     ACCENT.fatBg,
  blue:    ACCENT.blue,
  blueBg:  ACCENT.blueBg,
  red:     ACCENT.red,
  redBg:   ACCENT.redBg,
  green:   ACCENT.green,
};
