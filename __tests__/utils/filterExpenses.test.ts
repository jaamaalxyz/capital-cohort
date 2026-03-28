import {
  filterByQuery,
  filterByCategories,
  filterByDateRange,
  sortExpenses,
  applyFilters,
} from '../../utils/filterExpenses';
import { Expense, ExpenseFilters, DEFAULT_EXPENSE_FILTERS } from '../../types';

const makeExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: Math.random().toString(),
  amount: 1000,
  description: 'Groceries',
  category: 'needs',
  date: '2024-01-15',
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('filterByQuery', () => {
  it('returns all expenses when query is empty', () => {
    const expenses = [makeExpense(), makeExpense()];
    expect(filterByQuery(expenses, '')).toHaveLength(2);
  });

  it('filters case-insensitively by description', () => {
    const expenses = [
      makeExpense({ description: 'Grocery Store' }),
      makeExpense({ description: 'Netflix' }),
    ];
    expect(filterByQuery(expenses, 'grocery')).toHaveLength(1);
    expect(filterByQuery(expenses, 'NETFLIX')).toHaveLength(1);
  });

  it('returns empty when no description matches query', () => {
    const expenses = [makeExpense({ description: 'Rent' })];
    expect(filterByQuery(expenses, 'coffee')).toHaveLength(0);
  });

  it('trims whitespace from query before matching', () => {
    const expenses = [makeExpense({ description: 'Rent' })];
    expect(filterByQuery(expenses, '  rent  ')).toHaveLength(1);
  });

  it('matches partial description', () => {
    const expenses = [makeExpense({ description: 'Monthly subscription' })];
    expect(filterByQuery(expenses, 'subscr')).toHaveLength(1);
  });
});

describe('filterByCategories', () => {
  it('returns all expenses when categories array is empty', () => {
    const expenses = [
      makeExpense({ category: 'needs' }),
      makeExpense({ category: 'wants' }),
    ];
    expect(filterByCategories(expenses, [])).toHaveLength(2);
  });

  it('returns only expenses matching given categories', () => {
    const expenses = [
      makeExpense({ category: 'needs' }),
      makeExpense({ category: 'wants' }),
      makeExpense({ category: 'savings' }),
    ];
    expect(filterByCategories(expenses, ['needs', 'savings'])).toHaveLength(2);
  });

  it('returns empty when no expense matches selected categories', () => {
    const expenses = [makeExpense({ category: 'wants' })];
    expect(filterByCategories(expenses, ['needs'])).toHaveLength(0);
  });
});

describe('filterByDateRange', () => {
  it('returns all expenses when no date range set', () => {
    const expenses = [makeExpense()];
    expect(filterByDateRange(expenses, undefined, undefined)).toHaveLength(1);
  });

  it('filters expenses on or after dateFrom', () => {
    const expenses = [
      makeExpense({ date: '2024-01-10' }),
      makeExpense({ date: '2024-01-15' }),
      makeExpense({ date: '2024-01-20' }),
    ];
    expect(filterByDateRange(expenses, '2024-01-15', undefined)).toHaveLength(
      2,
    );
  });

  it('filters expenses on or before dateTo', () => {
    const expenses = [
      makeExpense({ date: '2024-01-10' }),
      makeExpense({ date: '2024-01-15' }),
      makeExpense({ date: '2024-01-20' }),
    ];
    expect(filterByDateRange(expenses, undefined, '2024-01-15')).toHaveLength(
      2,
    );
  });

  it('filters expenses within dateFrom and dateTo inclusive', () => {
    const expenses = [
      makeExpense({ date: '2024-01-10' }),
      makeExpense({ date: '2024-01-15' }),
      makeExpense({ date: '2024-01-20' }),
    ];
    expect(
      filterByDateRange(expenses, '2024-01-12', '2024-01-18'),
    ).toHaveLength(1);
  });
});

describe('sortExpenses', () => {
  const expenses = [
    makeExpense({ date: '2024-01-10', amount: 3000 }),
    makeExpense({ date: '2024-01-15', amount: 1000 }),
    makeExpense({ date: '2024-01-05', amount: 5000 }),
  ];

  it('sorts date_desc: newest first', () => {
    const sorted = sortExpenses(expenses, 'date_desc');
    expect(sorted[0].date).toBe('2024-01-15');
  });

  it('sorts date_asc: oldest first', () => {
    const sorted = sortExpenses(expenses, 'date_asc');
    expect(sorted[0].date).toBe('2024-01-05');
  });

  it('sorts amount_desc: highest first', () => {
    const sorted = sortExpenses(expenses, 'amount_desc');
    expect(sorted[0].amount).toBe(5000);
  });

  it('sorts amount_asc: lowest first', () => {
    const sorted = sortExpenses(expenses, 'amount_asc');
    expect(sorted[0].amount).toBe(1000);
  });

  it('does not mutate original array', () => {
    const original = [...expenses];
    sortExpenses(expenses, 'amount_asc');
    expect(expenses[0]).toEqual(original[0]);
  });
});

describe('applyFilters', () => {
  it('returns all expenses with default filters', () => {
    const expenses = [makeExpense(), makeExpense()];
    expect(applyFilters(expenses, DEFAULT_EXPENSE_FILTERS)).toHaveLength(2);
  });

  it('chains all filters correctly', () => {
    const expenses = [
      makeExpense({
        description: 'Rent',
        category: 'needs',
        date: '2024-01-01',
        amount: 50000,
      }),
      makeExpense({
        description: 'Netflix',
        category: 'wants',
        date: '2024-01-10',
        amount: 1500,
      }),
      makeExpense({
        description: 'Savings deposit',
        category: 'savings',
        date: '2024-01-15',
        amount: 20000,
      }),
    ];
    const filters: ExpenseFilters = {
      query: 'e', // matches Rent, Netflix, Savings
      categories: ['needs', 'wants'],
      dateFrom: '2024-01-05',
      dateTo: undefined,
      sortOrder: 'amount_desc',
    };
    const result = applyFilters(expenses, filters);
    // Only Netflix matches: has 'e', is wants, date >= 2024-01-05
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('Netflix');
  });
});
