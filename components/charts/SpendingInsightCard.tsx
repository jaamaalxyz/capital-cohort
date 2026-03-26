import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  icon: string;
  label: string;
  value: string;
  testID?: string;
}

export const SpendingInsightCard: React.FC<Props> = ({
  icon,
  label,
  value,
  testID,
}) => (
  <View style={styles.card} testID={testID}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.value} numberOfLines={1}>
      {value}
    </Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    fontSize: 24,
    marginBottom: 6,
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    color: '#757575',
    textAlign: 'center',
  },
});
