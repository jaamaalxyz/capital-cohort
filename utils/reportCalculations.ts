import { Expense, Category, ReportData, MonthlySnapshot } from '../types';

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/** Returns the number of days in a YYYY-MM month string. */
export function getDaysInMonth(month: string): number {
  const [year, m] = month.split('-').map(Number);
  return new Date(year, m, 0).getDate();
}

/** Subtracts n months from a YYYY-MM string, returns YYYY-MM. */
function subtractMonths(month: string, n: number): string {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year, m - 1 - n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Exported calculation functions
// ---------------------------------------------------------------------------

/**
 * Returns `count` monthly snapshots ending at `currentMonth` (inclusive),
 * ordered oldest → newest.
 */
export function buildMonthlySnapshots(
  expenses: Expense[],
  currentMonth: string,
  count: number
): MonthlySnapshot[] {
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    months.push(subtractMonths(currentMonth, i));
  }

  return months.map((month) => {
    const monthExpenses = expenses.filter((e) => e.date.startsWith(month));
    const needs = monthExpenses
      .filter((e) => e.category === 'needs')
      .reduce((s, e) => s + e.amount, 0);
    const wants = monthExpenses
      .filter((e) => e.category === 'wants')
      .reduce((s, e) => s + e.amount, 0);
    const savings = monthExpenses
      .filter((e) => e.category === 'savings')
      .reduce((s, e) => s + e.amount, 0);
    return { month, needs, wants, savings, total: needs + wants + savings };
  });
}

/**
 * Average daily spend in cents for the given month.
 * Divides total spend by the number of days in the month.
 */
export function getAverageDailySpend(expenses: Expense[], month: string): number {
  const monthExpenses = expenses.filter((e) => e.date.startsWith(month));
  if (monthExpenses.length === 0) return 0;
  const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
  return Math.round(total / getDaysInMonth(month));
}

/**
 * Returns the category with the highest total spend.
 * Breaks ties in needs → wants → savings order.
 * Returns null for an empty expenses array.
 */
export function getTopCategory(expenses: Expense[]): Category | null {
  if (expenses.length === 0) return null;
  const totals: Record<Category, number> = { needs: 0, wants: 0, savings: 0 };
  expenses.forEach((e) => {
    totals[e.category] += e.amount;
  });
  const order: Category[] = ['needs', 'wants', 'savings'];
  return order.reduce((top, cat) => (totals[cat] > totals[top] ? cat : top));
}

/** Builds the full ReportData structure for the Reports screen. */
export function buildReportData(
  expenses: Expense[],
  currentMonth: string,
  monthCount: number
): ReportData {
  const snapshots = buildMonthlySnapshots(expenses, currentMonth, monthCount);
  const currentMonthExpenses = expenses.filter((e) =>
    e.date.startsWith(currentMonth)
  );

  const currentMonthBreakdown = {
    needs: currentMonthExpenses
      .filter((e) => e.category === 'needs')
      .reduce((s, e) => s + e.amount, 0),
    wants: currentMonthExpenses
      .filter((e) => e.category === 'wants')
      .reduce((s, e) => s + e.amount, 0),
    savings: currentMonthExpenses
      .filter((e) => e.category === 'savings')
      .reduce((s, e) => s + e.amount, 0),
  };

  return {
    snapshots,
    currentMonthBreakdown,
    averageDailySpend: getAverageDailySpend(currentMonthExpenses, currentMonth),
    topCategory: getTopCategory(currentMonthExpenses),
    totalSpentAllTime: expenses.reduce((s, e) => s + e.amount, 0),
  };
}
