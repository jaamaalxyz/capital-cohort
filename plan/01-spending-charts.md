# Plan 01 — Spending Charts & Reports

**Priority:** P1
**Type:** Feature
**Effort:** 3–4 days
**Depends on:** Plan 00 (test infrastructure)

---

## Overview

Add a **Reports** tab that shows spending trends across months. The feature includes:
- Monthly spending bar chart (needs / wants / savings stacked or grouped)
- Category donut/pie breakdown for the current month
- Month-over-month comparison (last 3 or 6 months)
- Highest spending category badge
- Average daily spend

All chart rendering is done via `react-native-svg` (no heavy charting lib dependency). Data is derived entirely from existing `expenses[]` state — no new storage required.

---

## Dependencies to Install

```bash
# SVG-based charting (compatible with Expo managed workflow)
npx expo install react-native-svg

# No additional charting library — charts are custom SVG components
# This keeps the bundle lean and allows full control over styling/theming
```

---

## New Files

```
app/(tabs)/reports.tsx              # New Reports screen
components/charts/
  BarChart.tsx                      # Monthly grouped bars
  DonutChart.tsx                    # Category percentage donut
  ChartLegend.tsx                   # Reusable legend row
  SpendingInsightCard.tsx           # Stat cards (avg spend, top category)
utils/
  reportCalculations.ts             # Aggregation logic for chart data
types/index.ts                      # Add ReportData, MonthlySnapshot types
__tests__/
  utils/reportCalculations.test.ts
  components/BarChart.test.tsx
  components/DonutChart.test.tsx
  screens/Reports.test.tsx
```

---

## New Types (`types/index.ts` additions)

```ts
export interface MonthlySnapshot {
  month: string;           // YYYY-MM
  needs: number;           // cents spent
  wants: number;
  savings: number;
  total: number;
}

export interface ReportData {
  snapshots: MonthlySnapshot[];   // last N months, oldest first
  currentMonthBreakdown: {
    needs: number;
    wants: number;
    savings: number;
  };
  averageDailySpend: number;      // cents
  topCategory: Category | null;
  totalSpentAllTime: number;
}
```

---

## TDD Cycle 1 — `reportCalculations.ts`

### RED: Write tests first

**`__tests__/utils/reportCalculations.test.ts`**
```ts
import {
  buildMonthlySnapshots,
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

describe('buildMonthlySnapshots', () => {
  it('returns correct totals per month', () => {
    const expenses = [
      makeExpense({ date: '2024-01-10', amount: 5000, category: 'needs' }),
      makeExpense({ date: '2024-01-20', amount: 3000, category: 'wants' }),
      makeExpense({ date: '2024-02-05', amount: 8000, category: 'savings' }),
    ];
    const snapshots = buildMonthlySnapshots(expenses, '2024-01', 2);
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
    });
  });

  it('orders snapshots oldest to newest', () => {
    const expenses = [
      makeExpense({ date: '2024-03-01' }),
      makeExpense({ date: '2024-01-01' }),
    ];
    const snapshots = buildMonthlySnapshots(expenses, '2024-03', 3);
    expect(snapshots[0].month).toBe('2024-01');
    expect(snapshots[2].month).toBe('2024-03');
  });
});

describe('getAverageDailySpend', () => {
  it('divides total spend by days elapsed in month', () => {
    const expenses = [makeExpense({ amount: 3100 })];
    // Jan has 31 days; expense on day 15 → 15 days elapsed
    const avg = getAverageDailySpend(expenses, '2024-01');
    expect(avg).toBeCloseTo(3100 / 31, 0);
  });

  it('returns 0 for empty expenses', () => {
    expect(getAverageDailySpend([], '2024-01')).toBe(0);
  });
});

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
});

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
});
```

### GREEN: Implement `utils/reportCalculations.ts`

```ts
import { Expense, Category, ReportData, MonthlySnapshot } from '../types';

export function buildMonthlySnapshots(
  expenses: Expense[],
  currentMonth: string,
  count: number
): MonthlySnapshot[] {
  // Generate array of YYYY-MM strings going back `count` months from currentMonth
  // For each month, sum expenses by category
}

export function getAverageDailySpend(expenses: Expense[], month: string): number {
  // Sum all expense amounts for month, divide by days in that month
}

export function getTopCategory(expenses: Expense[]): Category | null {
  // Aggregate by category, return key with highest total
}

export function buildReportData(
  expenses: Expense[],
  currentMonth: string,
  monthCount: number
): ReportData {
  // Compose all helper results into ReportData
}
```

### REFACTOR
- Extract `getDaysInMonth(month: string): number` as a pure helper
- Memoize `buildReportData` in the component via `useMemo`

---

## TDD Cycle 2 — `BarChart` Component

### RED

**`__tests__/components/BarChart.test.tsx`**
```tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { BarChart } from '../../components/charts/BarChart';
import { MonthlySnapshot } from '../../types';

const snapshots: MonthlySnapshot[] = [
  { month: '2024-01', needs: 50000, wants: 30000, savings: 20000, total: 100000 },
  { month: '2024-02', needs: 40000, wants: 25000, savings: 15000, total: 80000 },
];

describe('BarChart', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<BarChart data={snapshots} />);
    expect(toJSON()).not.toBeNull();
  });

  it('renders one bar group per snapshot', () => {
    const { getAllByTestId } = render(<BarChart data={snapshots} />);
    expect(getAllByTestId('bar-group')).toHaveLength(2);
  });

  it('renders month label for each snapshot', () => {
    const { getByText } = render(<BarChart data={snapshots} />);
    expect(getByText('Jan')).toBeTruthy();
    expect(getByText('Feb')).toBeTruthy();
  });

  it('renders empty state when data is empty', () => {
    const { getByTestId } = render(<BarChart data={[]} />);
    expect(getByTestId('chart-empty-state')).toBeTruthy();
  });

  it('applies theme colors for each category segment', () => {
    const { getAllByTestId } = render(<BarChart data={snapshots} />);
    const segments = getAllByTestId('bar-segment');
    // Each group has 3 segments (needs/wants/savings)
    expect(segments.length).toBe(6);
  });
});
```

### GREEN: Implement `components/charts/BarChart.tsx`

- Use `react-native-svg` `Rect` elements
- Calculate bar height proportionally from max total in dataset
- Separate `Rect` per category per month with `testID="bar-segment"`
- Wrap each month group in `View testID="bar-group"`
- Show `Text testID="chart-empty-state"` when `data.length === 0`

### REFACTOR
- Extract `normalizeBarHeights(snapshots, maxHeight)` as pure function
- Test that function separately

---

## TDD Cycle 3 — `DonutChart` Component

### RED

**`__tests__/components/DonutChart.test.tsx`**
```tsx
describe('DonutChart', () => {
  it('renders three arc segments for three categories', () => { });
  it('renders total amount in center', () => { });
  it('handles 0% category gracefully (no arc rendered)', () => { });
  it('applies correct colors from theme', () => { });
});
```

### GREEN
- SVG `Path` elements with arc calculations
- Center `Text` showing formatted total
- Each segment has `testID="donut-segment-{category}"`

---

## TDD Cycle 4 — Reports Screen

### RED

**`__tests__/screens/Reports.test.tsx`**
```tsx
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import ReportsScreen from '../../app/(tabs)/reports';
import { BudgetProvider } from '../../context/BudgetContext';

const renderReports = () =>
  render(
    <BudgetProvider>
      <ReportsScreen />
    </BudgetProvider>
  );

describe('Reports screen', () => {
  it('renders heading', async () => {
    const { getByText } = renderReports();
    await waitFor(() => expect(getByText(/reports/i)).toBeTruthy());
  });

  it('shows empty state when no expenses recorded', async () => {
    const { getByTestId } = renderReports();
    await waitFor(() => expect(getByTestId('reports-empty-state')).toBeTruthy());
  });

  it('renders BarChart when expenses exist', async () => {
    // Inject expenses via mock context
  });

  it('shows insight cards (avg spend, top category)', async () => { });
});
```

---

## Navigation Integration

Add to `app/(tabs)/_layout.tsx`:
```tsx
<Tabs.Screen
  name="reports"
  options={{
    title: 'Reports',
    tabBarIcon: ({ color }) => <Text style={{ color }}>📊</Text>,
  }}
/>
```

---

## Acceptance Criteria

- [ ] `reportCalculations.ts` has 100% line coverage
- [ ] `BarChart` renders correct bar count per dataset
- [ ] `DonutChart` handles zero-value categories without crash
- [ ] Reports screen shows empty state with no expenses
- [ ] Reports screen renders charts when data is present
- [ ] Dark mode colors applied correctly to chart segments
- [ ] No new external charting library added

---

## Definition of Done

- All tests green
- Reports tab visible and navigable
- Charts render with real data from BudgetContext
- Tested on both light and dark themes
