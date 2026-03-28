import {
  getExpensesForMonth,
  calculateCategoryBudget,
  calculateBudgetSummary,
  groupExpensesByDate,
  calculateEffectiveIncome,
  calculateOverflowAmounts,
} from '../../utils/calculations';
import { Expense, ExtraIncome, Category, BudgetRule } from '../../types';

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

const DEFAULT_RULE = { needs: 50, wants: 30, savings: 20 };

// ---------------------------------------------------------------------------
// calculateCategoryBudget
// ---------------------------------------------------------------------------
describe('calculateCategoryBudget', () => {
  it('calculates correct allocated amount for needs (50%)', () => {
    const result = calculateCategoryBudget(200000, [], 'needs', DEFAULT_RULE, 0);
    expect(result.allocated).toBe(100000);
  });

  it('calculates correct allocated amount for wants (30%)', () => {
    const result = calculateCategoryBudget(200000, [], 'wants', DEFAULT_RULE, 0);
    expect(result.allocated).toBe(60000);
  });

  it('calculates correct allocated amount for savings (20%)', () => {
    const result = calculateCategoryBudget(200000, [], 'savings', DEFAULT_RULE, 0);
    expect(result.allocated).toBe(40000);
  });

  it('calculates correct allocated amount for a custom rule (70/20/10)', () => {
    const customRule = { needs: 70, wants: 20, savings: 10 };
    const needs = calculateCategoryBudget(100000, [], 'needs', customRule, 0);
    const wants = calculateCategoryBudget(100000, [], 'wants', customRule, 0);
    const savings = calculateCategoryBudget(100000, [], 'savings', customRule, 0);

    expect(needs.allocated).toBe(70000);
    expect(wants.allocated).toBe(20000);
    expect(savings.allocated).toBe(10000);
  });

  it('correctly sums spent for the given category', () => {
    const expenses = [
      makeExpense({ amount: 10000, category: 'needs' }),
      makeExpense({ amount: 20000, category: 'needs' }),
      makeExpense({ amount: 5000, category: 'wants' }), // should not count
    ];
    const result = calculateCategoryBudget(200000, expenses, 'needs', DEFAULT_RULE, 30000);
    expect(result.spent).toBe(30000);
  });

  it('calculates remaining correctly when under budget', () => {
    const expenses = [makeExpense({ amount: 30000, category: 'needs' })];
    const result = calculateCategoryBudget(200000, expenses, 'needs', DEFAULT_RULE, 30000);
    expect(result.remaining).toBe(70000);
  });

  it('flags over-budget correctly', () => {
    const expenses = [makeExpense({ amount: 150000, category: 'needs' })];
    const result = calculateCategoryBudget(200000, expenses, 'needs', DEFAULT_RULE, 150000);
    expect(result.isOverBudget).toBe(true);
    expect(result.remaining).toBe(-50000);
  });

  it('calculates percentage of budget used', () => {
    const expenses = [makeExpense({ amount: 50000, category: 'needs' })];
    const result = calculateCategoryBudget(200000, expenses, 'needs', DEFAULT_RULE, 50000);
    // 50000 / 100000 = 50%
    expect(result.percentage).toBeCloseTo(50);
  });

  it('percentage is 0 when income is 0', () => {
    const result = calculateCategoryBudget(0, [], 'needs', DEFAULT_RULE, 0);
    expect(result.percentage).toBe(0);
  });

  it('returns 0 spent and full allocated when no expenses', () => {
    const result = calculateCategoryBudget(100000, [], 'savings', DEFAULT_RULE, 0);
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
    const summary = calculateBudgetSummary(100000, expenses, DEFAULT_RULE);
    expect(summary.totalSpent).toBe(10000);
    expect(summary.totalRemaining).toBe(90000);
  });

  it('totalRemaining is negative when overspent', () => {
    const expenses = [makeExpense({ amount: 150000, category: 'needs' })];
    const summary = calculateBudgetSummary(100000, expenses, DEFAULT_RULE);
    expect(summary.totalRemaining).toBe(-50000);
  });

  it('returns income in summary', () => {
    const summary = calculateBudgetSummary(200000, [], DEFAULT_RULE);
    expect(summary.income).toBe(200000);
  });

  it('returns 0 totalSpent and full income as remaining when no expenses', () => {
    const summary = calculateBudgetSummary(100000, [], DEFAULT_RULE);
    expect(summary.totalSpent).toBe(0);
    expect(summary.totalRemaining).toBe(100000);
  });

  it('summary includes needs, wants, savings breakdowns', () => {
    const summary = calculateBudgetSummary(100000, [], DEFAULT_RULE);
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
// ---------------------------------------------------------------------------
// calculateEffectiveIncome
// ---------------------------------------------------------------------------
describe('calculateEffectiveIncome', () => {
  const rest = {
    date: '2026-03-15',
    description: 'Extra',
    createdAt: new Date().toISOString(),
  };

  it('returns base income when no extra incomes exist', () => {
    expect(calculateEffectiveIncome(1_000_000, [], '2026-03')).toBe(1_000_000);
  });

  it('adds only extra incomes matching the given month', () => {
    const extras: ExtraIncome[] = [
      { id: '1', amount: 50_000, month: '2026-03', ...rest },
      { id: '2', amount: 20_000, month: '2026-02', ...rest }, // different month
    ];
    expect(calculateEffectiveIncome(1_000_000, extras, '2026-03')).toBe(1_050_000);
  });

  it('sums multiple extras in the same month', () => {
    const extras: ExtraIncome[] = [
      { id: '1', amount: 10_000, month: '2026-03', ...rest },
      { id: '2', amount: 25_000, month: '2026-03', ...rest },
    ];
    expect(calculateEffectiveIncome(1_000_000, extras, '2026-03')).toBe(1_035_000);
  });

  it('returns base income when all extras are from other months', () => {
    const extras: ExtraIncome[] = [
      { id: '1', amount: 50_000, month: '2026-01', ...rest },
    ];
    expect(calculateEffectiveIncome(1_000_000, extras, '2026-03')).toBe(1_000_000);
  });
});

// ---------------------------------------------------------------------------
// calculateCategoryBudget — cross-category awareness
// ---------------------------------------------------------------------------
describe('calculateCategoryBudget — cross-category income pool', () => {
  const rule = { needs: 50, wants: 30, savings: 20 };
  const income = 1_000_000; // $10,000

  it('effectiveRemaining equals categoryRemaining when income pool is not exhausted', () => {
    const expenses = [makeExpense({ amount: 100_000, category: 'needs' })];
    const totalSpent = 100_000;
    const result = calculateCategoryBudget(income, expenses, 'needs', rule, totalSpent);
    // allocated = 500,000; spent = 100,000; income remaining = 900,000
    // effectiveRemaining = min(400,000, 900,000) = 400,000
    expect(result.effectiveRemaining).toBe(400_000);
    expect(result.isIncomeLimited).toBe(false);
  });

  it('effectiveRemaining is capped by income pool when other categories overspent', () => {
    const expenses = [makeExpense({ amount: 0, category: 'needs' })];
    const totalSpent = 910_000; // e.g. wants spent 910k
    const result = calculateCategoryBudget(income, expenses, 'needs', rule, totalSpent);
    // allocated = 500,000; spent = 0; income remaining = 90,000
    // effectiveRemaining = min(500,000, 90,000) = 90,000
    expect(result.effectiveRemaining).toBe(90_000);
    expect(result.isIncomeLimited).toBe(true);
  });

  it('effectiveRemaining is 0 when income is fully exhausted by other categories', () => {
    const expenses: Expense[] = [];
    const totalSpent = 1_000_000;
    const result = calculateCategoryBudget(income, expenses, 'savings', rule, totalSpent);
    expect(result.effectiveRemaining).toBe(0);
    expect(result.isIncomeLimited).toBe(true);
  });

  it('isOverBudget remains true when category spent exceeds allocation regardless of income pool', () => {
    const expenses = [makeExpense({ amount: 500_000, category: 'wants' })];
    const totalSpent = 500_000;
    const result = calculateCategoryBudget(income, expenses, 'wants', rule, totalSpent);
    expect(result.isOverBudget).toBe(true);
    expect(result.effectiveRemaining).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// calculateOverflowAmounts
// ---------------------------------------------------------------------------
describe('calculateOverflowAmounts', () => {
  const income = 1_000_000; // $10,000
  const rule: BudgetRule = { needs: 50, wants: 30, savings: 20 };

  const makeSummary = (wantsSpent: number) =>
    calculateBudgetSummary(income, [makeExpense({ amount: wantsSpent, category: 'wants' })], rule);

  it('returns zero overflows when expense fits category and income', () => {
    const summary = makeSummary(0);
    const result = calculateOverflowAmounts(100_000, 'wants', summary, income);
    expect(result.categoryOverflow).toBe(0);
    expect(result.incomeOverflow).toBe(0);
  });

  it('returns categoryOverflow only when exceeds category budget but income covers it', () => {
    const summary = makeSummary(0);
    // wants budget = 300,000; expense = 400,000; income remaining = 1,000,000
    const result = calculateOverflowAmounts(400_000, 'wants', summary, income);
    expect(result.categoryOverflow).toBe(100_000); // 400k - 300k
    expect(result.incomeOverflow).toBe(0);
  });

  it('returns incomeOverflow when expense exceeds total remaining income', () => {
    const summary = makeSummary(200_000); // 200k already spent
    // income remaining = 800,000; expense = 900,000
    const result = calculateOverflowAmounts(900_000, 'wants', summary, income);
    expect(result.incomeOverflow).toBe(100_000); // 900k - 800k
    expect(result.categoryOverflow).toBeGreaterThan(0); // also over category
  });

  it('incomeOverflow is independent of categoryOverflow (both can be > 0)', () => {
    // wants spent 290,000; income remaining = 710,000; expense = 750,000
    const summary = makeSummary(290_000);
    const result = calculateOverflowAmounts(750_000, 'wants', summary, income);
    expect(result.categoryOverflow).toBe(740_000); // 750k - (300k - 290k) = 750k - 10k
    expect(result.incomeOverflow).toBe(40_000); // 750k - 710k
  });

  it('returns 0 for both when expense exactly equals total remaining income', () => {
    const summary = makeSummary(0);
    const result = calculateOverflowAmounts(1_000_000, 'wants', summary, income);
    // categoryOverflow > 0 but incomeOverflow = 0
    expect(result.incomeOverflow).toBe(0);
  });
});
