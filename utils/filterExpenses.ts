import { Expense, Category, SortOrder, ExpenseFilters } from '../types';

export function filterByQuery(expenses: Expense[], query: string): Expense[] {
  const q = query.trim().toLowerCase();
  if (!q) return expenses;
  return expenses.filter((e) => e.description.toLowerCase().includes(q));
}

export function filterByCategories(expenses: Expense[], categories: Category[]): Expense[] {
  if (!categories.length) return expenses;
  const set = new Set(categories);
  return expenses.filter((e) => set.has(e.category));
}

export function filterByDateRange(
  expenses: Expense[],
  dateFrom?: string,
  dateTo?: string
): Expense[] {
  return expenses.filter((e) => {
    if (dateFrom && e.date < dateFrom) return false;
    if (dateTo && e.date > dateTo) return false;
    return true;
  });
}

export function sortExpenses(expenses: Expense[], order: SortOrder): Expense[] {
  return [...expenses].sort((a, b) => {
    switch (order) {
      case 'date_desc':
        return b.date.localeCompare(a.date);
      case 'date_asc':
        return a.date.localeCompare(b.date);
      case 'amount_desc':
        return b.amount - a.amount;
      case 'amount_asc':
        return a.amount - b.amount;
      default:
        return 0;
    }
  });
}

export function applyFilters(expenses: Expense[], filters: ExpenseFilters): Expense[] {
  let result = filterByQuery(expenses, filters.query);
  result = filterByCategories(result, filters.categories);
  result = filterByDateRange(result, filters.dateFrom, filters.dateTo);
  result = sortExpenses(result, filters.sortOrder);
  return result;
}

export function getActiveFilterCount(filters: ExpenseFilters): number {
  let count = 0;
  if (filters.query.trim()) count++;
  if (filters.categories.length > 0) count++;
  if (filters.dateFrom) count++;
  if (filters.dateTo) count++;
  if (filters.sortOrder !== 'date_desc') count++;
  return count;
}
