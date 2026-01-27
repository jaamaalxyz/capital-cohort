import { Expense, BudgetSummary, CategoryBudget, Category } from '../types';
import { CATEGORY_CONFIG } from '../constants/theme';

export function getExpensesForMonth(expenses: Expense[], month: string): Expense[] {
  return expenses.filter((e) => e.date.startsWith(month));
}

export function calculateCategoryBudget(
  income: number,
  expenses: Expense[],
  category: Category
): CategoryBudget {
  const config = CATEGORY_CONFIG[category];
  const allocated = Math.round(income * config.percentage);
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
  expenses: Expense[]
): BudgetSummary {
  const needs = calculateCategoryBudget(income, expenses, 'needs');
  const wants = calculateCategoryBudget(income, expenses, 'wants');
  const savings = calculateCategoryBudget(income, expenses, 'savings');

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

export function groupExpensesByDate(expenses: Expense[]): Map<string, Expense[]> {
  const grouped = new Map<string, Expense[]>();

  const sorted = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  sorted.forEach((expense) => {
    const existing = grouped.get(expense.date) || [];
    grouped.set(expense.date, [...existing, expense]);
  });

  return grouped;
}
