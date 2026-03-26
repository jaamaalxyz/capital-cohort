import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { MonthlySnapshot } from '../../types';
import { LIGHT_COLORS } from '../../constants/theme';

const MONTH_ABBREVS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const CHART_HEIGHT = 160;
const BAR_WIDTH = 32;
const GROUP_WIDTH = 48;

interface Props {
  data: MonthlySnapshot[];
  height?: number;
}

export const BarChart: React.FC<Props> = ({ data, height = CHART_HEIGHT }) => {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text testID="chart-empty-state" style={styles.emptyText}>
          No data to display
        </Text>
      </View>
    );
  }

  const maxTotal = Math.max(...data.map((s) => s.total), 1);

  return (
    <View style={styles.container}>
      <View style={styles.barsRow}>
        {data.map((snapshot) => {
          const monthIndex = parseInt(snapshot.month.split('-')[1], 10) - 1;
          const label = MONTH_ABBREVS[monthIndex];

          const needsH = Math.round((snapshot.needs / maxTotal) * height);
          const wantsH = Math.round((snapshot.wants / maxTotal) * height);
          const savingsH = Math.round((snapshot.savings / maxTotal) * height);

          return (
            <View key={snapshot.month} style={styles.group} testID="bar-group">
              <Svg width={BAR_WIDTH} height={height}>
                {/* savings: topmost segment */}
                <Rect
                  testID="bar-segment"
                  x={0}
                  y={height - needsH - wantsH - savingsH}
                  width={BAR_WIDTH}
                  height={savingsH}
                  fill={LIGHT_COLORS.savings}
                />
                {/* wants: middle segment */}
                <Rect
                  testID="bar-segment"
                  x={0}
                  y={height - needsH - wantsH}
                  width={BAR_WIDTH}
                  height={wantsH}
                  fill={LIGHT_COLORS.wants}
                />
                {/* needs: bottom segment */}
                <Rect
                  testID="bar-segment"
                  x={0}
                  y={height - needsH}
                  width={BAR_WIDTH}
                  height={needsH}
                  fill={LIGHT_COLORS.needs}
                />
              </Svg>
              <Text style={styles.label}>{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  group: {
    width: GROUP_WIDTH,
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    color: '#757575',
    marginTop: 4,
  },
  emptyContainer: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#757575',
    fontSize: 14,
  },
});
