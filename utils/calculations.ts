import { Expense, BudgetSummary, CategoryBudget, Category, BudgetRule } from '../types';

export function getExpensesForMonth(expenses: Expense[], month: string): Expense[] {
  return expenses.filter((e) => e.date.startsWith(month));
}

export function calculateCategoryBudget(
  income: number,
  expenses: Expense[],
  category: Category,
  rule: BudgetRule
): CategoryBudget {
  const percentage = rule[category] / 100;
  const allocated = Math.round(income * percentage);
  const spent = expenses
    .filter((e) => e.category === category)
    .reduce((sum, e) => sum + e.amount, 0);

  return {
    allocated,
    spent,
    remaining: allocated - spent,
    percentage: allocated > 0 ? (spent / allocated) * 100 : 0,
    isOverBudget: spent > allocated,
  };
}

export function calculateBudgetSummary(
  income: number,
  expenses: Expense[],
  rule: BudgetRule
): BudgetSummary {
  const needs = calculateCategoryBudget(income, expenses, 'needs', rule);
  const wants = calculateCategoryBudget(income, expenses, 'wants', rule);
  const savings = calculateCategoryBudget(income, expenses, 'savings', rule);

  const totalSpent = needs.spent + wants.spent + savings.spent;

  return {
    income,
    totalSpent,
    totalRemaining: income - totalSpent,
    needs,
    wants,
    savings,
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
