import { Expense, BudgetSummary, CategoryBudget, Category, BudgetRule, ExtraIncome } from '../types';

export function getExpensesForMonth(expenses: Expense[], month: string): Expense[] {
  return expenses.filter((e) => e.date.startsWith(month));
}

export function calculateEffectiveIncome(
  baseIncome: number,
  extraIncomes: ExtraIncome[],
  month: string,
): number {
  return (
    baseIncome +
    extraIncomes
      .filter((e) => e.month === month)
      .reduce((sum, e) => sum + e.amount, 0)
  );
}

export function calculateCategoryBudget(
  income: number,
  expenses: Expense[],
  category: Category,
  rule: BudgetRule,
  totalSpent: number
): CategoryBudget {
  const percentage = rule[category] / 100;
  const allocated = Math.round(income * percentage);
  const spent = expenses
    .filter((e) => e.category === category)
    .reduce((sum, e) => sum + e.amount, 0);

  const remaining = allocated - spent;
  const incomeRemaining = income - totalSpent;
  const effectiveRemaining = Math.max(0, Math.min(remaining, incomeRemaining));

  return {
    allocated,
    spent,
    remaining,
    percentage: allocated > 0 ? (spent / allocated) * 100 : 0,
    isOverBudget: spent > allocated,
    effectiveRemaining,
    isIncomeLimited: effectiveRemaining < remaining && effectiveRemaining === incomeRemaining,
  };
}

export function calculateBudgetSummary(
  income: number,
  expenses: Expense[],
  rule: BudgetRule
): BudgetSummary {
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const needs = calculateCategoryBudget(income, expenses, 'needs', rule, totalSpent);
  const wants = calculateCategoryBudget(income, expenses, 'wants', rule, totalSpent);
  const savings = calculateCategoryBudget(income, expenses, 'savings', rule, totalSpent);

  return {
    income,
    totalSpent,
    totalRemaining: income - totalSpent,
    needs,
    wants,
    savings,
  };
}

export function calculateOverflowAmounts(
  amount: number,
  category: Category,
  summary: BudgetSummary,
  effectiveIncome: number,
): { categoryOverflow: number; incomeOverflow: number } {
  const catSummary = summary[category];
  const categoryRemaining = Math.max(0, catSummary.allocated - catSummary.spent);
  const incomeRemaining = Math.max(0, effectiveIncome - summary.totalSpent);

  return {
    categoryOverflow: Math.max(0, amount - categoryRemaining),
    incomeOverflow: Math.max(0, amount - incomeRemaining),
  };
}

export function groupExpensesByDate(
  expenses: Expense[],
  sortByDate = true
): Map<string, Expense[]> {
  const grouped = new Map<string, Expense[]>();

  const target = sortByDate
    ? [...expenses].sort((a, b) => b.date.localeCompare(a.date))
    : expenses;

  target.forEach((expense) => {
    const existing = grouped.get(expense.date) || [];
    grouped.set(expense.date, [...existing, expense]);
  });

  return grouped;
}
