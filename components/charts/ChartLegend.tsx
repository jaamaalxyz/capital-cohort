import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  color: string;
  label: string;
  amount: number;
  currency: string;
}

export const ChartLegend: React.FC<Props> = ({ color, label, amount, currency }) => (
  <View style={styles.row} testID={`legend-${label.toLowerCase()}`}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.amount}>{formatCurrency(amount, currency)}</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: '#212121',
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
});
