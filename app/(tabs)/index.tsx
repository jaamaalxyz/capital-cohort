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
import { useBudget } from '../../context/BudgetContext';
import { BudgetCard } from '../../components/BudgetCard';
import { ScreenContainer } from '../../components/ScreenContainer';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';
import {
  formatCurrency,
  formatMonth,
  getPreviousMonth,
  getNextMonth,
  getCurrentMonth,
} from '../../utils/formatters';

export default function DashboardScreen() {
  const router = useRouter();
  const { state, summary, setMonth } = useBudget();

  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.needs} />
      </View>
    );
  }

  const isCurrentMonth = state.currentMonth === getCurrentMonth();

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
          <Text style={styles.incomeLabel}>Monthly Income</Text>
          <Text style={styles.incomeAmount}>
            {formatCurrency(state.monthlyIncome)}
          </Text>
          {state.monthlyIncome === 0 && (
            <Pressable
              onPress={() => router.push('/(tabs)/settings')}
              style={styles.setupButton}
            >
              <Text style={styles.setupButtonText}>Set up your income →</Text>
            </Pressable>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Budget Cards */}
        <BudgetCard category="needs" budget={summary.needs} />
        <BudgetCard category="wants" budget={summary.wants} />
        <BudgetCard category="savings" budget={summary.savings} />

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(summary.totalSpent)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Remaining</Text>
            <Text
              style={[
                styles.summaryValue,
                summary.totalRemaining < 0 && styles.negative,
              ]}
            >
              {formatCurrency(summary.totalRemaining)}
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
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
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
  },
  disabled: {
    color: COLORS.border,
  },
  monthText: {
    fontSize: FONT_SIZE.h2,
    fontWeight: '600',
    color: COLORS.textPrimary,
    minWidth: 180,
    textAlign: 'center',
  },
  incomeSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  incomeLabel: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  incomeAmount: {
    fontSize: FONT_SIZE.amountLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  setupButton: {
    marginTop: SPACING.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  setupButtonText: {
    fontSize: FONT_SIZE.body,
    color: COLORS.needs,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
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
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONT_SIZE.amount,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  negative: {
    color: COLORS.error,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.needs,
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
});
