import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ProgressBar } from './ProgressBar';
import { CategoryBudget, Category } from '../types';
import { SPACING, FONT_SIZE, CATEGORY_CONFIG } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatters';

interface BudgetCardProps {
  category: Category;
  budget: CategoryBudget;
  currencySymbol?: string;
  onPress?: () => void;
}

export function BudgetCard({
  category,
  budget,
  currencySymbol = '$',
  onPress,
}: BudgetCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const config = CATEGORY_CONFIG[category];

  const styles = createStyles(colors);
  const percentageDisplay = Math.round(budget.percentage);

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={styles.label}>
          {t(`categories.${category}`).toUpperCase()} (
          {Math.round(config.percentage * 100)}%)
        </Text>
      </View>

      <View style={styles.progressSection}>
        <ProgressBar
          percentage={budget.percentage}
          color={colors[category]}
          isOverBudget={budget.isOverBudget}
        />
        <View style={styles.amountRow}>
          <Text
            style={[styles.spent, budget.isOverBudget && styles.overBudget]}
          >
            {formatCurrency(budget.spent, currencySymbol)}
          </Text>
          <Text style={styles.allocated}>
            {t('common.of')} {formatCurrency(budget.allocated, currencySymbol)}{' '}
            ({percentageDisplay}%)
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.remainingLabel}>{t('budgetCard.remaining')}</Text>
        <Text
          style={[
            styles.remainingAmount,
            budget.isOverBudget && styles.overBudget,
          ]}
        >
          {formatCurrency(budget.remaining, currencySymbol)}
          {budget.remaining >= 0 && !budget.isOverBudget && ' ✓'}
        </Text>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    pressed: {
      opacity: 0.9,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    icon: {
      fontSize: 20,
      marginRight: SPACING.sm,
    },
    label: {
      fontSize: FONT_SIZE.h3,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    progressSection: {
      marginBottom: SPACING.sm,
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginTop: SPACING.xs,
    },
    spent: {
      fontSize: FONT_SIZE.amount,
      fontWeight: '600',
      color: colors.textPrimary,
      marginRight: SPACING.xs,
    },
    allocated: {
      fontSize: FONT_SIZE.bodySmall,
      color: colors.textSecondary,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    remainingLabel: {
      fontSize: FONT_SIZE.bodySmall,
      color: colors.textSecondary,
    },
    remainingAmount: {
      fontSize: FONT_SIZE.body,
      fontWeight: '500',
      color: colors.success,
    },
    overBudget: {
      color: colors.overBudget,
    },
  });
