import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';

const PADDING = { top: 8, bottom: 28, left: 10, right: 10 };
const BAR_RADIUS = 4;
const BAR_GAP = 0.3; // fraction of bar width as gap

export default function BarChart({
  data = [],
  width: propWidth,
  height = 140,
  barColor = '#34C759',
  stacked = false,
  stackColors = [],
  goalLine,
  xLabels = [],
  style,
}) {
  const [containerWidth, setContainerWidth] = useState(propWidth || 300);
  const chartWidth = containerWidth - PADDING.left - PADDING.right;
  const chartHeight = height - PADDING.top - PADDING.bottom;

  if (data.length === 0) return null;

  // For stacked: data = [{ values: [v1, v2, v3], label }]
  // For simple: data = [{ value, label }]

  let maxVal;
  if (stacked) {
    maxVal = Math.max(...data.map(d => d.values.reduce((a, v) => a + v, 0)), 1);
  } else {
    maxVal = Math.max(...data.map(d => d.value), 1);
  }
  if (goalLine) maxVal = Math.max(maxVal, goalLine);
  maxVal *= 1.1; // breathing room

  const barWidth = chartWidth / data.length;
  const actualBarWidth = barWidth * (1 - BAR_GAP);

  const goalY = goalLine
    ? PADDING.top + chartHeight - (goalLine / maxVal) * chartHeight
    : null;

  const labelStep = data.length > 10 ? Math.ceil(data.length / 7) : 1;

  return (
    <View
      style={[s.container, style]}
      onLayout={(e) => !propWidth && setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Svg width={containerWidth} height={height}>
        {/* Goal line */}
        {goalY != null && (
          <Line
            x1={PADDING.left}
            y1={goalY}
            x2={PADDING.left + chartWidth}
            y2={goalY}
            stroke={barColor}
            strokeWidth={1}
            strokeDasharray="4,4"
            opacity={0.5}
          />
        )}

        {/* Bars */}
        {data.map((d, i) => {
          const x = PADDING.left + i * barWidth + (barWidth - actualBarWidth) / 2;

          if (stacked && d.values) {
            let yOffset = 0;
            const total = d.values.reduce((a, v) => a + v, 0);
            const totalHeight = (total / maxVal) * chartHeight;

            return d.values.map((val, si) => {
              const segHeight = total > 0 ? (val / total) * totalHeight : 0;
              const y = PADDING.top + chartHeight - yOffset - segHeight;
              yOffset += segHeight;
              const isTop = si === d.values.length - 1 || yOffset >= totalHeight;
              return (
                <Rect
                  key={`${i}-${si}`}
                  x={x}
                  y={y}
                  width={actualBarWidth}
                  height={Math.max(segHeight, 0)}
                  rx={isTop ? BAR_RADIUS : 0}
                  ry={isTop ? BAR_RADIUS : 0}
                  fill={stackColors[si] || barColor}
                  opacity={0.85}
                />
              );
            });
          }

          const barH = (d.value / maxVal) * chartHeight;
          return (
            <Rect
              key={i}
              x={x}
              y={PADDING.top + chartHeight - barH}
              width={actualBarWidth}
              height={Math.max(barH, 0)}
              rx={BAR_RADIUS}
              ry={BAR_RADIUS}
              fill={d.color || barColor}
              opacity={0.85}
            />
          );
        })}
      </Svg>

      {/* X-axis labels */}
      {xLabels.length > 0 && (
        <View style={s.xLabels}>
          {xLabels.map((label, i) => (
            i % labelStep === 0 ? (
              <Text key={i} style={[s.xLabel, { left: PADDING.left + i * barWidth + barWidth / 2 - 14 }]}>
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
  xLabel: { position: 'absolute', fontSize: 11, color: '#888', width: 30, textAlign: 'center' },
});
