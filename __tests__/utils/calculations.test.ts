import {
  getExpensesForMonth,
  calculateCategoryBudget,
  calculateBudgetSummary,
  groupExpensesByDate,
} from '../../utils/calculations';
import { Expense } from '../../types';

const makeExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: '1',
  amount: 1000,
  description: 'Test',
  category: 'needs',
  date: '2024-01-15',
  createdAt: new Date().toISOString(),
  ...overrides,
});

// ---------------------------------------------------------------------------
// getExpensesForMonth
// ---------------------------------------------------------------------------
describe('getExpensesForMonth', () => {
  it('returns only expenses for the given month', () => {
    const expenses = [
      makeExpense({ date: '2024-01-10' }),
      makeExpense({ date: '2024-01-25' }),
      makeExpense({ date: '2024-02-01' }),
    ];
    expect(getExpensesForMonth(expenses, '2024-01')).toHaveLength(2);
  });

  it('returns empty array when no expenses match', () => {
    expect(getExpensesForMonth([], '2024-01')).toEqual([]);
  });

  it('returns empty array when expenses are from a different month', () => {
    const expenses = [makeExpense({ date: '2024-02-10' })];
    expect(getExpensesForMonth(expenses, '2024-01')).toHaveLength(0);
  });

  it('returns all expenses when all belong to the same month', () => {
    const expenses = [
      makeExpense({ id: '1', date: '2024-01-01' }),
      makeExpense({ id: '2', date: '2024-01-15' }),
      makeExpense({ id: '3', date: '2024-01-31' }),
    ];
    expect(getExpensesForMonth(expenses, '2024-01')).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// calculateCategoryBudget
// ---------------------------------------------------------------------------
describe('calculateCategoryBudget', () => {
  it('calculates correct allocated amount for needs (50%)', () => {
    const result = calculateCategoryBudget(200000, [], 'needs');
    expect(result.allocated).toBe(100000);
  });

  it('calculates correct allocated amount for wants (30%)', () => {
    const result = calculateCategoryBudget(200000, [], 'wants');
    expect(result.allocated).toBe(60000);
  });

  it('calculates correct allocated amount for savings (20%)', () => {
    const result = calculateCategoryBudget(200000, [], 'savings');
    expect(result.allocated).toBe(40000);
  });

  it('correctly sums spent for the given category', () => {
    const expenses = [
      makeExpense({ amount: 10000, category: 'needs' }),
      makeExpense({ amount: 20000, category: 'needs' }),
      makeExpense({ amount: 5000, category: 'wants' }), // should not count
    ];
    const result = calculateCategoryBudget(200000, expenses, 'needs');
    expect(result.spent).toBe(30000);
  });

  it('calculates remaining correctly when under budget', () => {
    const expenses = [makeExpense({ amount: 30000, category: 'needs' })];
    const result = calculateCategoryBudget(200000, expenses, 'needs');
    expect(result.remaining).toBe(70000);
  });

  it('flags over-budget correctly', () => {
    const expenses = [makeExpense({ amount: 150000, category: 'needs' })];
    const result = calculateCategoryBudget(200000, expenses, 'needs');
    expect(result.isOverBudget).toBe(true);
    expect(result.remaining).toBe(-50000);
  });

  it('calculates percentage of budget used', () => {
    const expenses = [makeExpense({ amount: 50000, category: 'needs' })];
    const result = calculateCategoryBudget(200000, expenses, 'needs');
    // 50000 / 100000 = 50%
    expect(result.percentage).toBeCloseTo(50);
  });

  it('percentage is 0 when income is 0', () => {
    const result = calculateCategoryBudget(0, [], 'needs');
    expect(result.percentage).toBe(0);
  });

  it('returns 0 spent and full allocated when no expenses', () => {
    const result = calculateCategoryBudget(100000, [], 'savings');
    expect(result.spent).toBe(0);
    expect(result.allocated).toBe(20000);
    expect(result.isOverBudget).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// calculateBudgetSummary
// ---------------------------------------------------------------------------
describe('calculateBudgetSummary', () => {
  it('totalSpent is sum of all category spending', () => {
    const expenses = [
      makeExpense({ amount: 5000, category: 'needs' }),
      makeExpense({ amount: 3000, category: 'wants' }),
      makeExpense({ amount: 2000, category: 'savings' }),
    ];
    const summary = calculateBudgetSummary(100000, expenses);
    expect(summary.totalSpent).toBe(10000);
    expect(summary.totalRemaining).toBe(90000);
  });

  it('totalRemaining is negative when overspent', () => {
    const expenses = [makeExpense({ amount: 150000, category: 'needs' })];
    const summary = calculateBudgetSummary(100000, expenses);
    expect(summary.totalRemaining).toBe(-50000);
  });

  it('returns income in summary', () => {
    const summary = calculateBudgetSummary(200000, []);
    expect(summary.income).toBe(200000);
  });

  it('returns 0 totalSpent and full income as remaining when no expenses', () => {
    const summary = calculateBudgetSummary(100000, []);
    expect(summary.totalSpent).toBe(0);
    expect(summary.totalRemaining).toBe(100000);
  });

  it('summary includes needs, wants, savings breakdowns', () => {
    const summary = calculateBudgetSummary(100000, []);
    expect(summary).toHaveProperty('needs');
    expect(summary).toHaveProperty('wants');
    expect(summary).toHaveProperty('savings');
  });
});

// ---------------------------------------------------------------------------
// groupExpensesByDate
// ---------------------------------------------------------------------------
describe('groupExpensesByDate', () => {
  it('groups expenses by date', () => {
    const expenses = [
      makeExpense({ id: '1', date: '2024-01-10' }),
      makeExpense({ id: '2', date: '2024-01-10' }),
      makeExpense({ id: '3', date: '2024-01-12' }),
    ];
    const grouped = groupExpensesByDate(expenses);
    expect(grouped.get('2024-01-10')).toHaveLength(2);
    expect(grouped.get('2024-01-12')).toHaveLength(1);
  });

  it('orders dates descending (newest first)', () => {
    const expenses = [
      makeExpense({ id: '1', date: '2024-01-10' }),
      makeExpense({ id: '2', date: '2024-01-12' }),
      makeExpense({ id: '3', date: '2024-01-05' }),
    ];
    const grouped = groupExpensesByDate(expenses);
    const keys = [...grouped.keys()];
    expect(keys[0]).toBe('2024-01-12');
    expect(keys[1]).toBe('2024-01-10');
    expect(keys[2]).toBe('2024-01-05');
  });

  it('returns an empty Map for empty expenses', () => {
    const grouped = groupExpensesByDate([]);
    expect(grouped.size).toBe(0);
  });

  it('returns single entry for single expense', () => {
    const expenses = [makeExpense({ date: '2024-01-15' })];
    const grouped = groupExpensesByDate(expenses);
    expect(grouped.size).toBe(1);
    expect(grouped.get('2024-01-15')).toHaveLength(1);
  });
});
