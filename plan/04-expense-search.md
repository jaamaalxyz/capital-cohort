# Plan 04 — Expense Search & Advanced Filtering

**Priority:** P1
**Type:** Feature / UX Enhancement
**Effort:** 1.5–2 days
**Depends on:** Plan 00 (test infrastructure)

---

## Overview

The current expenses screen only supports filtering by category. This plan adds:
- Full-text search by description (real-time, debounced)
- Filter by date range (from / to)
- Sort options: newest first, oldest first, highest amount, lowest amount
- Active filter summary chip strip
- Clear all filters button

All filtering is client-side — no network calls, no new storage.

---

## Dependencies to Install

```bash
# No new dependencies required
# All logic is pure TypeScript + existing React Native components
```

---

## New Files

```
utils/
  filterExpenses.ts                # Pure filter/sort/search logic
hooks/
  useExpenseFilters.ts             # Filter state management hook
components/
  SearchBar.tsx                    # Debounced text input
  FilterChip.tsx                   # Active filter tag with remove button
  SortPicker.tsx                   # Sort order selector bottom sheet
__tests__/
  utils/filterExpenses.test.ts
  hooks/useExpenseFilters.test.tsx
  components/SearchBar.test.tsx
  components/FilterChip.test.tsx
  screens/Expenses.search.test.tsx
```

---

## New Types (`types/index.ts` additions)

```ts
export type SortOrder =
  | 'date_desc'    // newest first (default)
  | 'date_asc'     // oldest first
  | 'amount_desc'  // highest first
  | 'amount_asc';  // lowest first

export interface ExpenseFilters {
  query: string;             // free-text search
  categories: Category[];    // empty = show all
  dateFrom?: string;         // YYYY-MM-DD
  dateTo?: string;           // YYYY-MM-DD
  sortOrder: SortOrder;
}

export const DEFAULT_EXPENSE_FILTERS: ExpenseFilters = {
  query: '',
  categories: [],
  dateFrom: undefined,
  dateTo: undefined,
  sortOrder: 'date_desc',
};
```

---

## TDD Cycle 1 — `filterExpenses.ts`

### RED: Write tests first

**`__tests__/utils/filterExpenses.test.ts`**
```ts
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

// --- filterByQuery ---
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

// --- filterByCategories ---
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

// --- filterByDateRange ---
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
    expect(filterByDateRange(expenses, '2024-01-15', undefined)).toHaveLength(2);
  });

  it('filters expenses on or before dateTo', () => {
    const expenses = [
      makeExpense({ date: '2024-01-10' }),
      makeExpense({ date: '2024-01-15' }),
      makeExpense({ date: '2024-01-20' }),
    ];
    expect(filterByDateRange(expenses, undefined, '2024-01-15')).toHaveLength(2);
  });

  it('filters expenses within dateFrom and dateTo inclusive', () => {
    const expenses = [
      makeExpense({ date: '2024-01-10' }),
      makeExpense({ date: '2024-01-15' }),
      makeExpense({ date: '2024-01-20' }),
    ];
    expect(filterByDateRange(expenses, '2024-01-12', '2024-01-18')).toHaveLength(1);
  });
});

// --- sortExpenses ---
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

// --- applyFilters ---
describe('applyFilters', () => {
  it('returns all expenses with default filters', () => {
    const expenses = [makeExpense(), makeExpense()];
    expect(applyFilters(expenses, DEFAULT_EXPENSE_FILTERS)).toHaveLength(2);
  });

  it('chains all filters correctly', () => {
    const expenses = [
      makeExpense({ description: 'Rent', category: 'needs', date: '2024-01-01', amount: 50000 }),
      makeExpense({ description: 'Netflix', category: 'wants', date: '2024-01-10', amount: 1500 }),
      makeExpense({ description: 'Savings deposit', category: 'savings', date: '2024-01-15', amount: 20000 }),
    ];
    const filters: ExpenseFilters = {
      query: 'e',                  // matches Rent, Netflix, Savings
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
```

### GREEN: Implement `utils/filterExpenses.ts`

```ts
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
      case 'date_desc': return b.date.localeCompare(a.date);
      case 'date_asc':  return a.date.localeCompare(b.date);
      case 'amount_desc': return b.amount - a.amount;
      case 'amount_asc':  return a.amount - b.amount;
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
```

### REFACTOR
- `applyFilters` is a pipeline — easy to add more filter steps
- Add `getActiveFilterCount(filters: ExpenseFilters): number` for badge on filter button

---

## TDD Cycle 2 — `useExpenseFilters` Hook

### RED

**`__tests__/hooks/useExpenseFilters.test.tsx`**
```tsx
import { renderHook, act } from '@testing-library/react-native';
import { useExpenseFilters } from '../../hooks/useExpenseFilters';

describe('useExpenseFilters', () => {
  it('initializes with default filters', () => {
    const { result } = renderHook(() => useExpenseFilters());
    expect(result.current.filters.query).toBe('');
    expect(result.current.filters.categories).toEqual([]);
    expect(result.current.filters.sortOrder).toBe('date_desc');
  });

  it('setQuery updates query filter', () => {
    const { result } = renderHook(() => useExpenseFilters());
    act(() => result.current.setQuery('rent'));
    expect(result.current.filters.query).toBe('rent');
  });

  it('toggleCategory adds category if not present', () => {
    const { result } = renderHook(() => useExpenseFilters());
    act(() => result.current.toggleCategory('needs'));
    expect(result.current.filters.categories).toContain('needs');
  });

  it('toggleCategory removes category if already present', () => {
    const { result } = renderHook(() => useExpenseFilters());
    act(() => result.current.toggleCategory('needs'));
    act(() => result.current.toggleCategory('needs'));
    expect(result.current.filters.categories).not.toContain('needs');
  });

  it('setSortOrder updates sort order', () => {
    const { result } = renderHook(() => useExpenseFilters());
    act(() => result.current.setSortOrder('amount_desc'));
    expect(result.current.filters.sortOrder).toBe('amount_desc');
  });

  it('clearFilters resets to defaults', () => {
    const { result } = renderHook(() => useExpenseFilters());
    act(() => result.current.setQuery('test'));
    act(() => result.current.clearFilters());
    expect(result.current.filters.query).toBe('');
  });

  it('activeFilterCount returns 0 for defaults', () => {
    const { result } = renderHook(() => useExpenseFilters());
    expect(result.current.activeFilterCount).toBe(0);
  });

  it('activeFilterCount increments for each active non-default filter', () => {
    const { result } = renderHook(() => useExpenseFilters());
    act(() => result.current.setQuery('rent'));
    act(() => result.current.toggleCategory('needs'));
    expect(result.current.activeFilterCount).toBe(2);
  });
});
```

---

## TDD Cycle 3 — SearchBar Component

### RED

**`__tests__/components/SearchBar.test.tsx`**
```tsx
describe('SearchBar', () => {
  it('renders a text input', () => { });
  it('calls onChangeText on input change', () => { });
  it('shows clear button when value is non-empty', () => { });
  it('hides clear button when value is empty', () => { });
  it('calls onClear when clear button pressed', () => { });
  it('has accessible placeholder text', () => { });
});
```

---

## Expenses Screen Changes (`app/(tabs)/expenses.tsx`)

Replace existing category filter with full filter toolbar:

```tsx
// At top of list, above expense items:
<SearchBar
  value={filters.query}
  onChangeText={setQuery}
  onClear={() => setQuery('')}
  placeholder="Search expenses..."
  testID="expense-search-bar"
/>

<View style={styles.filterRow}>
  {/* Category chips */}
  {['needs', 'wants', 'savings'].map((cat) => (
    <FilterChip
      key={cat}
      label={cat}
      active={filters.categories.includes(cat as Category)}
      onPress={() => toggleCategory(cat as Category)}
    />
  ))}

  {/* Sort button */}
  <TouchableOpacity testID="sort-btn" onPress={() => setShowSort(true)}>
    <Text>Sort</Text>
  </TouchableOpacity>

  {/* Clear all — only when filters active */}
  {activeFilterCount > 0 && (
    <TouchableOpacity testID="clear-filters-btn" onPress={clearFilters}>
      <Text>Clear ({activeFilterCount})</Text>
    </TouchableOpacity>
  )}
</View>
```

**Debouncing:** Wrap `setQuery` in a 250ms debounce inside `SearchBar` to avoid filtering on every keystroke.

---

## TDD Cycle 4 — Expenses Screen Integration

### RED

**`__tests__/screens/Expenses.search.test.tsx`**
```tsx
describe('Expenses screen — search and filter', () => {
  it('renders search bar', async () => { });

  it('filters list when search query is typed', async () => {
    // Type 'rent' into search bar
    // Assert only rent expenses are shown
  });

  it('shows "no results" state when search matches nothing', async () => { });

  it('clears search when clear button tapped', async () => { });

  it('category filter and search work together', async () => { });

  it('sort by amount_desc shows highest expense first', async () => { });

  it('activeFilterCount badge shows on filter button', async () => { });
});
```

---

## Acceptance Criteria

- [ ] `filterByQuery` is case-insensitive and trims whitespace
- [ ] `filterByCategories` with empty array returns all (no filter applied)
- [ ] `filterByDateRange` inclusive on both ends
- [ ] `sortExpenses` does not mutate original array
- [ ] `applyFilters` correctly chains all four operations
- [ ] `useExpenseFilters` hook tracks active filter count
- [ ] Search bar debounces at 250ms
- [ ] Category filter chips work alongside search
- [ ] "Clear filters" button visible only when filters are active
- [ ] Empty state message distinct from "no expenses this month"

---

## Definition of Done

- All tests green
- Search, category filter, and sort work together simultaneously
- Filter state is local to the screen (not persisted to storage)
- No performance regression on 500+ expenses (pure function pipeline)
