import {
  buildMonthlySnapshots,
  getDaysInMonth,
  getAverageDailySpend,
  getTopCategory,
  buildReportData,
} from '../../utils/reportCalculations';
import { Expense } from '../../types';

const makeExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: Math.random().toString(),
  amount: 1000,
  description: 'Test',
  category: 'needs',
  date: '2024-01-15',
  createdAt: new Date().toISOString(),
  ...overrides,
});

// ---------------------------------------------------------------------------
// getDaysInMonth
// ---------------------------------------------------------------------------
describe('getDaysInMonth', () => {
  it('returns 31 for January', () => {
    expect(getDaysInMonth('2024-01')).toBe(31);
  });

  it('returns 29 for February in a leap year', () => {
    expect(getDaysInMonth('2024-02')).toBe(29);
  });

  it('returns 28 for February in a non-leap year', () => {
    expect(getDaysInMonth('2023-02')).toBe(28);
  });

  it('returns 30 for April', () => {
    expect(getDaysInMonth('2024-04')).toBe(30);
  });

  it('returns 31 for December', () => {
    expect(getDaysInMonth('2024-12')).toBe(31);
  });
});

// ---------------------------------------------------------------------------
// buildMonthlySnapshots
// ---------------------------------------------------------------------------
describe('buildMonthlySnapshots', () => {
  it('returns correct totals per month', () => {
    const expenses = [
      makeExpense({ date: '2024-01-10', amount: 5000, category: 'needs' }),
      makeExpense({ date: '2024-01-20', amount: 3000, category: 'wants' }),
      makeExpense({ date: '2024-02-05', amount: 8000, category: 'savings' }),
    ];
    // currentMonth='2024-02', count=2 → windows: ['2024-01', '2024-02']
    const snapshots = buildMonthlySnapshots(expenses, '2024-02', 2);
    expect(snapshots).toHaveLength(2);
    expect(snapshots[0].month).toBe('2024-01');
    expect(snapshots[0].needs).toBe(5000);
    expect(snapshots[0].wants).toBe(3000);
    expect(snapshots[0].total).toBe(8000);
    expect(snapshots[1].month).toBe('2024-02');
    expect(snapshots[1].savings).toBe(8000);
  });

  it('returns zero-value snapshot for months with no expenses', () => {
    const snapshots = buildMonthlySnapshots([], '2024-03', 3);
    expect(snapshots).toHaveLength(3);
    snapshots.forEach((s) => {
      expect(s.needs).toBe(0);
      expect(s.wants).toBe(0);
      expect(s.savings).toBe(0);
      expect(s.total).toBe(0);
    });
  });

  it('orders snapshots oldest to newest', () => {
    const expenses = [
      makeExpense({ date: '2024-03-01' }),
      makeExpense({ date: '2024-01-01' }),
    ];
    const snapshots = buildMonthlySnapshots(expenses, '2024-03', 3);
    expect(snapshots[0].month).toBe('2024-01');
    expect(snapshots[1].month).toBe('2024-02');
    expect(snapshots[2].month).toBe('2024-03');
  });

  it('returns exactly count snapshots', () => {
    const snapshots = buildMonthlySnapshots([], '2024-06', 6);
    expect(snapshots).toHaveLength(6);
  });

  it('handles month wrap-around (Dec → Jan)', () => {
    const snapshots = buildMonthlySnapshots([], '2024-01', 2);
    expect(snapshots[0].month).toBe('2023-12');
    expect(snapshots[1].month).toBe('2024-01');
  });

  it('total equals sum of needs + wants + savings per snapshot', () => {
    const expenses = [
      makeExpense({ date: '2024-01-01', amount: 1000, category: 'needs' }),
      makeExpense({ date: '2024-01-02', amount: 2000, category: 'wants' }),
      makeExpense({ date: '2024-01-03', amount: 3000, category: 'savings' }),
    ];
    const [snap] = buildMonthlySnapshots(expenses, '2024-01', 1);
    expect(snap.total).toBe(snap.needs + snap.wants + snap.savings);
  });
});

// ---------------------------------------------------------------------------
// getAverageDailySpend
// ---------------------------------------------------------------------------
describe('getAverageDailySpend', () => {
  it('divides total spend by days in month', () => {
    const expenses = [makeExpense({ amount: 3100, date: '2024-01-15' })];
    // Jan has 31 days
    const avg = getAverageDailySpend(expenses, '2024-01');
    expect(avg).toBeCloseTo(3100 / 31, 0);
  });

  it('returns 0 for empty expenses', () => {
    expect(getAverageDailySpend([], '2024-01')).toBe(0);
  });

  it('only counts expenses from the given month', () => {
    const expenses = [
      makeExpense({ amount: 3100, date: '2024-01-10' }),
      makeExpense({ amount: 9999, date: '2024-02-10' }), // different month
    ];
    const avg = getAverageDailySpend(expenses, '2024-01');
    expect(avg).toBeCloseTo(3100 / 31, 0);
  });

  it('sums multiple expenses in the month before dividing', () => {
    const expenses = [
      makeExpense({ amount: 1000, date: '2024-01-01' }),
      makeExpense({ amount: 2000, date: '2024-01-15' }),
    ];
    const avg = getAverageDailySpend(expenses, '2024-01');
    expect(avg).toBeCloseTo(3000 / 31, 0);
  });
});

// ---------------------------------------------------------------------------
// getTopCategory
// ---------------------------------------------------------------------------
describe('getTopCategory', () => {
  it('returns the category with highest spending', () => {
    const expenses = [
      makeExpense({ amount: 5000, category: 'needs' }),
      makeExpense({ amount: 8000, category: 'wants' }),
      makeExpense({ amount: 2000, category: 'savings' }),
    ];
    expect(getTopCategory(expenses)).toBe('wants');
  });

  it('returns null for empty expenses', () => {
    expect(getTopCategory([])).toBeNull();
  });

  it('handles tie by returning first in needs > wants > savings order', () => {
    const expenses = [
      makeExpense({ amount: 5000, category: 'needs' }),
      makeExpense({ amount: 5000, category: 'wants' }),
    ];
    expect(getTopCategory(expenses)).toBe('needs');
  });

  it('returns the only populated category', () => {
    const expenses = [makeExpense({ amount: 5000, category: 'savings' })];
    expect(getTopCategory(expenses)).toBe('savings');
  });

  it('aggregates multiple expenses per category', () => {
    const expenses = [
      makeExpense({ amount: 1000, category: 'needs' }),
      makeExpense({ amount: 1000, category: 'needs' }),
      makeExpense({ amount: 1500, category: 'wants' }),
    ];
    // needs = 2000, wants = 1500
    expect(getTopCategory(expenses)).toBe('needs');
  });
});

// ---------------------------------------------------------------------------
// buildReportData
// ---------------------------------------------------------------------------
describe('buildReportData', () => {
  it('assembles full ReportData shape', () => {
    const expenses = [makeExpense({ amount: 1000, category: 'needs' })];
    const data = buildReportData(expenses, '2024-01', 3);
    expect(data).toHaveProperty('snapshots');
    expect(data).toHaveProperty('currentMonthBreakdown');
    expect(data).toHaveProperty('averageDailySpend');
    expect(data).toHaveProperty('topCategory');
    expect(data).toHaveProperty('totalSpentAllTime');
  });

  it('totalSpentAllTime sums all expenses regardless of month', () => {
    const expenses = [
      makeExpense({ amount: 1000, date: '2023-12-01' }),
      makeExpense({ amount: 2000, date: '2024-01-01' }),
    ];
    const data = buildReportData(expenses, '2024-01', 3);
    expect(data.totalSpentAllTime).toBe(3000);
  });

  it('snapshots count equals monthCount', () => {
    const data = buildReportData([], '2024-06', 6);
    expect(data.snapshots).toHaveLength(6);
  });

  it('currentMonthBreakdown reflects only current month expenses', () => {
    const expenses = [
      makeExpense({ amount: 5000, category: 'needs', date: '2024-01-10' }),
      makeExpense({ amount: 9999, category: 'needs', date: '2023-12-01' }), // prev month
    ];
    const data = buildReportData(expenses, '2024-01', 3);
    expect(data.currentMonthBreakdown.needs).toBe(5000);
  });

  it('topCategory reflects only current month expenses', () => {
    const expenses = [
      makeExpense({ amount: 9999, category: 'wants', date: '2023-12-01' }), // prev month
      makeExpense({ amount: 5000, category: 'needs', date: '2024-01-01' }),
    ];
    const data = buildReportData(expenses, '2024-01', 3);
    expect(data.topCategory).toBe('needs');
  });
});
