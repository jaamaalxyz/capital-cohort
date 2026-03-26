import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useBudget } from '../../context/BudgetContext';
import { useTheme } from '../../context/ThemeContext';
import { buildReportData } from '../../utils/reportCalculations';
import { formatCurrency } from '../../utils/formatters';
import { CATEGORY_CONFIG } from '../../constants/theme';
import { BarChart } from '../../components/charts/BarChart';
import { DonutChart } from '../../components/charts/DonutChart';
import { ChartLegend } from '../../components/charts/ChartLegend';
import { SpendingInsightCard } from '../../components/charts/SpendingInsightCard';

const MONTHS_TO_SHOW = 6;

export default function ReportsScreen() {
  const { state } = useBudget();
  const { colors } = useTheme();

  const reportData = useMemo(
    () => buildReportData(state.expenses, state.currentMonth, MONTHS_TO_SHOW),
    [state.expenses, state.currentMonth]
  );

  const hasExpenses = state.expenses.length > 0;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <Text style={[styles.heading, { color: colors.textPrimary }]}>
        Reports
      </Text>

      {!hasExpenses ? (
        /* ── Empty state ── */
        <View testID="reports-empty-state" style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            No data yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Start tracking expenses to see your spending reports here.
          </Text>
        </View>
      ) : (
        <>
          {/* ── Insight cards ── */}
          <View style={styles.insightRow}>
            <SpendingInsightCard
              testID="avg-daily-spend-card"
              icon="📅"
              label="Avg Daily Spend"
              value={formatCurrency(reportData.averageDailySpend, state.currency)}
            />
            {reportData.topCategory && (
              <SpendingInsightCard
                testID="top-category-card"
                icon={CATEGORY_CONFIG[reportData.topCategory].icon}
                label="Top Category"
                value={CATEGORY_CONFIG[reportData.topCategory].label}
              />
            )}
          </View>

          {/* ── Bar chart ── */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Monthly Spending
          </Text>
          <View
            testID="reports-bar-chart"
            style={[styles.chartCard, { backgroundColor: colors.card }]}
          >
            <BarChart data={reportData.snapshots} />
          </View>

          {/* ── Donut chart ── */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            This Month
          </Text>
          <View
            testID="reports-donut-chart"
            style={[styles.chartCard, { backgroundColor: colors.card }]}
          >
            <DonutChart
              breakdown={reportData.currentMonthBreakdown}
              currency={state.currency}
            />

            {/* Legend */}
            <ChartLegend
              color={colors.needs}
              label="Needs"
              amount={reportData.currentMonthBreakdown.needs}
              currency={state.currency}
            />
            <ChartLegend
              color={colors.wants}
              label="Wants"
              amount={reportData.currentMonthBreakdown.wants}
              currency={state.currency}
            />
            <ChartLegend
              color={colors.savings}
              label="Savings"
              amount={reportData.currentMonthBreakdown.savings}
              currency={state.currency}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  insightRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  chartCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
