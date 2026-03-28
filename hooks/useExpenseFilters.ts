import { useState, useCallback, useMemo } from 'react';
import { ExpenseFilters, DEFAULT_EXPENSE_FILTERS, Category, SortOrder } from '../types';
import { getActiveFilterCount } from '../utils/filterExpenses';

export function useExpenseFilters() {
  const [filters, setFilters] = useState<ExpenseFilters>(DEFAULT_EXPENSE_FILTERS);

  const setQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, query }));
  }, []);

  const toggleCategory = useCallback((category: Category) => {
    setFilters((prev) => {
      const alreadyHas = prev.categories.includes(category);
      if (alreadyHas) {
        return {
          ...prev,
          categories: prev.categories.filter((c) => c !== category),
        };
      }
      return {
        ...prev,
        categories: [...prev.categories, category],
      };
    });
  }, []);

  const setDateRange = useCallback((from?: string, to?: string) => {
    setFilters((prev) => ({ ...prev, dateFrom: from, dateTo: to }));
  }, []);

  const setSortOrder = useCallback((sortOrder: SortOrder) => {
    setFilters((prev) => ({ ...prev, sortOrder }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_EXPENSE_FILTERS);
  }, []);

  const activeFilterCount = useMemo(() => getActiveFilterCount(filters), [filters]);

  return {
    filters,
    setQuery,
    toggleCategory,
    setDateRange,
    setSortOrder,
    clearFilters,
    activeFilterCount,
  };
}
