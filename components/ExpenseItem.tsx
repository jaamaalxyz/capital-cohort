import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Expense } from '../types';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  CATEGORY_CONFIG,
} from '../constants/theme';
import { formatCurrency } from '../utils/formatters';

interface ExpenseItemProps {
  expense: Expense;
  currencySymbol?: string;
  onDelete?: (id: string) => void;
}

export function ExpenseItem({
  expense,
  currencySymbol = '$',
  onDelete,
}: ExpenseItemProps) {
  const { t } = useTranslation();
  const config = CATEGORY_CONFIG[expense.category];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.left}>
          <Text style={styles.icon}>{config.icon}</Text>
          <View style={styles.details}>
            <Text style={styles.description} numberOfLines={1}>
              {expense.description}
            </Text>
            <Text style={[styles.category, { color: config.color }]}>
              {t(`categories.${expense.category}`)}
            </Text>
          </View>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount}>
            {formatCurrency(expense.amount, currencySymbol)}
          </Text>
          {onDelete && (
            <Pressable
              onPress={() => onDelete(expense.id)}
              hitSlop={8}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>×</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  category: {
    fontSize: FONT_SIZE.caption,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: FONT_SIZE.amount,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  deleteButton: {
    marginLeft: SPACING.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 20,
    color: COLORS.error,
    fontWeight: '300',
    lineHeight: 22,
  },
});
