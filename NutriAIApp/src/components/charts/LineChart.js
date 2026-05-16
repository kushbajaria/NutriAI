import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Line, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

const PADDING = { top: 12, bottom: 28, left: 10, right: 10 };

function buildPath(points) {
  if (points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    // Cubic bezier for smooth curves
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export default function LineChart({
  data = [],
  width: propWidth,
  height = 160,
  color = '#34C759',
  fillGradient = true,
  goalLine,
  xLabels = [],
  style,
}) {
  const [containerWidth, setContainerWidth] = useState(propWidth || 300);
  const chartWidth = containerWidth - PADDING.left - PADDING.right;
  const chartHeight = height - PADDING.top - PADDING.bottom;

  if (data.length === 0) return null;

  // Compute y range
  const values = data.map(d => d.y);
  if (goalLine) values.push(goalLine);
  const yMin = Math.min(...values) * 0.9;
  const yMax = Math.max(...values) * 1.1;
  const yRange = yMax - yMin || 1;

  // Map data to pixel coords
  const points = data.map((d, i) => ({
    x: PADDING.left + (data.length === 1 ? chartWidth / 2 : (i / (data.length - 1)) * chartWidth),
    y: PADDING.top + chartHeight - ((d.y - yMin) / yRange) * chartHeight,
  }));

  const linePath = buildPath(points);

  // Area fill path (close to bottom)
  const areaPath = linePath +
    ` L ${points[points.length - 1].x} ${PADDING.top + chartHeight}` +
    ` L ${points[0].x} ${PADDING.top + chartHeight} Z`;

  // Goal line y position
  const goalY = goalLine
    ? PADDING.top + chartHeight - ((goalLine - yMin) / yRange) * chartHeight
    : null;

  // x-axis label positions
  const labelStep = xLabels.length > 7 ? Math.ceil(xLabels.length / 7) : 1;

  return (
    <View
      style={[s.container, style]}
      onLayout={(e) => !propWidth && setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Svg width={containerWidth} height={height}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.25" />
            <Stop offset="1" stopColor={color} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {/* Area fill */}
        {fillGradient && <Path d={areaPath} fill="url(#areaGrad)" />}

        {/* Goal line */}
        {goalY != null && (
          <Line
            x1={PADDING.left}
            y1={goalY}
            x2={PADDING.left + chartWidth}
            y2={goalY}
            stroke={color}
            strokeWidth={1}
            strokeDasharray="4,4"
            opacity={0.5}
          />
        )}

        {/* Line */}
        <Path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />

        {/* Data points */}
        {points.length <= 14 && points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
        ))}
      </Svg>

      {/* X-axis labels */}
      {xLabels.length > 0 && (
        <View style={s.xLabels}>
          {xLabels.map((label, i) => (
            i % labelStep === 0 ? (
              <Text key={i} style={[s.xLabel, { left: PADDING.left + (i / (xLabels.length - 1 || 1)) * chartWidth - 14 }]}>
                {label}
              </Text>
            ) : null
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { width: '100%' },
  xLabels: { position: 'relative', height: 16, marginTop: -20 },
  xLabel: { position: 'absolute', fontSize: 10, color: '#888', width: 28, textAlign: 'center' },
});
