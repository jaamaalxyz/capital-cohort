import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Category } from '../../types';
import { LIGHT_COLORS } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';

const SIZE = 200;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = SIZE * 0.38;
const INNER_R = SIZE * 0.22;

const CATEGORY_COLORS: Record<Category, string> = {
  needs: LIGHT_COLORS.needs,
  wants: LIGHT_COLORS.wants,
  savings: LIGHT_COLORS.savings,
};

interface Breakdown {
  needs: number;
  wants: number;
  savings: number;
}

interface Props {
  breakdown: Breakdown;
  currency: string;
  size?: number;
}

/** Builds an SVG arc path for a donut segment. */
function describeArc(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number
): string {
  // Clamp full-circle to avoid degenerate arc
  const angle = Math.min(endAngle - startAngle, 2 * Math.PI - 0.001);
  const end = startAngle + angle;

  const x1 = cx + outerR * Math.cos(startAngle);
  const y1 = cy + outerR * Math.sin(startAngle);
  const x2 = cx + outerR * Math.cos(end);
  const y2 = cy + outerR * Math.sin(end);
  const ix1 = cx + innerR * Math.cos(end);
  const iy1 = cy + innerR * Math.sin(end);
  const ix2 = cx + innerR * Math.cos(startAngle);
  const iy2 = cy + innerR * Math.sin(startAngle);
  const large = angle > Math.PI ? 1 : 0;

  return [
    `M ${x1} ${y1}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2}`,
    `L ${ix1} ${iy1}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2}`,
    'Z',
  ].join(' ');
}

export const DonutChart: React.FC<Props> = ({
  breakdown,
  currency,
  size = SIZE,
}) => {
  const total = breakdown.needs + breakdown.wants + breakdown.savings;

  if (total === 0) {
    return (
      <View testID="donut-empty" style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No spending this month</Text>
      </View>
    );
  }

  const allSegments: { category: Category; amount: number }[] = [
    { category: 'needs', amount: breakdown.needs },
    { category: 'wants', amount: breakdown.wants },
    { category: 'savings', amount: breakdown.savings },
  ];
  const segments = allSegments.filter((s) => s.amount > 0);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.38;
  const innerR = size * 0.22;

  let currentAngle = -Math.PI / 2;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {segments.map(({ category, amount }) => {
          const portion = amount / total;
          const endAngle = currentAngle + portion * 2 * Math.PI;
          const d = describeArc(cx, cy, outerR, innerR, currentAngle, endAngle);
          currentAngle = endAngle;
          return (
            <Path
              key={category}
              testID={`donut-segment-${category}`}
              d={d}
              fill={CATEGORY_COLORS[category]}
            />
          );
        })}
      </Svg>
      <View style={[styles.centerLabel, { top: cy - 16, left: cx - 40, width: 80 }]}>
        <Text testID="donut-total" style={styles.totalText} numberOfLines={1}>
          {formatCurrency(total, currency)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'relative',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
  },
  emptyContainer: {
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#757575',
    fontSize: 14,
  },
});
