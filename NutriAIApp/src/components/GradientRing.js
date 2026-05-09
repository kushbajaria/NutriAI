import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

/**
 * GradientRing — circular progress with gradient stroke and optional glow.
 */
export default function GradientRing({
  value,
  max,
  size = 200,
  strokeWidth = 8,
  gradient,
  trackColor,
  children,
}) {
  const { palette, gradients } = useTheme();
  const colors = gradient || gradients.primary;
  const track = trackColor || palette.bg3;

  const pct = Math.min(1, Math.max(0, value / max));
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference * (1 - pct);

  const gradId = `ring-grad-${size}-${colors[0]}`;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessible accessibilityLabel={`${value} of ${max}`}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <SvgGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            {colors.map((color, i) => (
              <Stop key={i} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={color} />
            ))}
          </SvgGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={track}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}
