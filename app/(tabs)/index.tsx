import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useBudget } from '../../context/BudgetContext';
import { BudgetCard } from '../../components/BudgetCard';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SPACING, FONT_SIZE } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import {
  formatCurrency,
  formatMonth,
  getPreviousMonth,
  getNextMonth,
  getCurrentMonth,
} from '../../utils/formatters';
import { getCurrencyByCode } from '../../constants/currencies';

import { ErrorBoundary } from '../../components/ErrorBoundary';

function DashboardContent() {
  const router = useRouter();
  const { t } = useTranslation();
  const { state, summary, setMonth } = useBudget();
  const { colors } = useTheme();

  const styles = createStyles(colors);

  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.needs} />
      </View>
    );
  }

  const isCurrentMonth = state.currentMonth === getCurrentMonth();
  const currencySymbol = getCurrencyByCode(state.currency)?.symbol ?? '$';

  const monthlyExtraIncome = state.extraIncomes
    .filter((e) => e.month === state.currentMonth)
    .reduce((sum, e) => sum + e.amount, 0);

  const outstandingDebt = state.debtEntries
    .filter((d) => !d.isSettled)
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Debt Banner */}
        {outstandingDebt > 0 && (
          <Pressable
            style={styles.debtBanner}
            onPress={() => router.push('/debts')}
          >
            <Text style={styles.debtBannerText}>
              ⚠️ {t('dashboard.debts')}: {formatCurrency(outstandingDebt, currencySymbol)}
            </Text>
            <Text style={styles.debtBannerLink}>→</Text>
          </Pressable>
        )}

        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <Pressable
            onPress={() => setMonth(getPreviousMonth(state.currentMonth))}
            hitSlop={8}
          >
            <Text style={styles.monthArrow}>◀</Text>
          </Pressable>
          <Text style={styles.monthText}>
            {formatMonth(state.currentMonth)}
          </Text>
          <Pressable
            onPress={() => setMonth(getNextMonth(state.currentMonth))}
            hitSlop={8}
            disabled={isCurrentMonth}
          >
            <Text
              style={[styles.monthArrow, isCurrentMonth && styles.disabled]}
            >
              ▶
            </Text>
          </Pressable>
        </View>

        {/* Income Display */}
        <View style={styles.incomeSection}>
          <Text style={styles.incomeLabel}>{t('dashboard.monthlyIncome')}</Text>
          <Text style={styles.incomeAmount}>
            {formatCurrency(state.monthlyIncome, currencySymbol)}
          </Text>
          {monthlyExtraIncome > 0 && (
            <View style={styles.extraIncomeRow}>
              <Text style={styles.extraIncomeLabel}>
                + {t('dashboard.extraIncome')}: {formatCurrency(monthlyExtraIncome, currencySymbol)}
              </Text>
            </View>
          )}
          {state.monthlyIncome === 0 && (
            <Pressable
              onPress={() => router.push('/(tabs)/settings')}
              style={styles.setupButton}
            >
              <Text style={styles.setupButtonText}>
                {t('dashboard.setupIncome')}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Budget Cards */}
        <BudgetCard
          category="needs"
          budget={summary.needs}
          rulePercentage={state.budgetRule.needs}
          currencySymbol={currencySymbol}
        />
        <BudgetCard
          category="wants"
          budget={summary.wants}
          rulePercentage={state.budgetRule.wants}
          currencySymbol={currencySymbol}
        />
        <BudgetCard
          category="savings"
          budget={summary.savings}
          rulePercentage={state.budgetRule.savings}
          currencySymbol={currencySymbol}
        />

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('dashboard.totalSpent')}</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(summary.totalSpent, currencySymbol)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('dashboard.remaining')}</Text>
            <Text
              style={[
                styles.summaryValue,
                summary.totalRemaining < 0 && styles.negative,
              ]}
            >
              {formatCurrency(summary.totalRemaining, currencySymbol)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push('/add-expense')}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: SPACING.lg,
      paddingBottom: 100,
    },
    monthSelector: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.lg,
    },
    monthArrow: {
      fontSize: 18,
      color: colors.textPrimary,
      paddingHorizontal: SPACING.md,
    },
    disabled: {
      color: colors.border,
    },
    monthText: {
      fontSize: FONT_SIZE.h2,
      fontWeight: '600',
      color: colors.textPrimary,
      minWidth: 180,
      textAlign: 'center',
    },
    incomeSection: {
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    incomeLabel: {
      fontSize: FONT_SIZE.body,
      color: colors.textSecondary,
      marginBottom: SPACING.xs,
    },
    incomeAmount: {
      fontSize: FONT_SIZE.amountLarge,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    setupButton: {
      marginTop: SPACING.sm,
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.md,
    },
    setupButtonText: {
      fontSize: FONT_SIZE.body,
      color: colors.needs,
      fontWeight: '500',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: SPACING.lg,
    },
    summaryCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: SPACING.md,
      marginTop: SPACING.sm,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: SPACING.xs,
    },
    summaryLabel: {
      fontSize: FONT_SIZE.body,
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: FONT_SIZE.amount,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    negative: {
      color: colors.error,
    },
    fab: {
      position: 'absolute',
      bottom: SPACING.lg,
      right: SPACING.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.needs,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    fabPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.95 }],
    },
    fabText: {
      fontSize: 32,
      color: '#FFFFFF',
      fontWeight: '300',
      lineHeight: 34,
    },
    debtBanner: {
      backgroundColor: colors.wants + '20',
      padding: SPACING.md,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.wants + '40',
    },
    debtBannerText: {
      color: colors.wants,
      fontWeight: '600',
      fontSize: FONT_SIZE.body,
    },
    debtBannerLink: {
      color: colors.wants,
      fontSize: 20,
      fontWeight: '700',
    },
    extraIncomeRow: {
      marginTop: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      paddingVertical: 2,
      backgroundColor: colors.savings + '15',
      borderRadius: 6,
    },
    extraIncomeLabel: {
      fontSize: FONT_SIZE.caption,
      color: colors.success,
      fontWeight: '600',
    },
  });
export default function DashboardScreen() {
  return (
    <ErrorBoundary context="dashboard">
      <DashboardContent />
    </ErrorBoundary>
  );
}
