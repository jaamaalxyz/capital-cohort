import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ProgressBarProps {
  percentage: number;
  color: string;
  isOverBudget?: boolean;
}

export function ProgressBar({
  percentage,
  color,
  isOverBudget,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const fillWidth = Math.min(percentage, 100);
  const barColor = isOverBudget ? colors.overBudget : color;

  const styles = createStyles(colors);

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

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    background: {
      height: 8,
      backgroundColor: colors.progressBackground,
      borderRadius: 4,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: 4,
    },
  });
