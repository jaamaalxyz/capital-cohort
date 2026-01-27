import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface ProgressBarProps {
  percentage: number;
  color: string;
  isOverBudget?: boolean;
}

export function ProgressBar({ percentage, color, isOverBudget }: ProgressBarProps) {
  const fillWidth = Math.min(percentage, 100);
  const barColor = isOverBudget ? COLORS.overBudget : color;

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        <View
          style={[
            styles.fill,
            { width: `${fillWidth}%`, backgroundColor: barColor },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  background: {
    height: 8,
    backgroundColor: COLORS.progressBackground,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
