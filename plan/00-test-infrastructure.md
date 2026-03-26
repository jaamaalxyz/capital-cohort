# Plan 00 — Test Infrastructure Setup

**Priority:** P0 — Must be done before all other plans
**Type:** Infrastructure
**Effort:** 1–2 days

---

## Overview

No tests exist in the project. This plan establishes the full testing foundation: Jest, React Native Testing Library (RNTL), mocks for Expo modules, and conventions for the entire test suite. Every subsequent plan depends on this being in place.

---

## Dependencies to Install

```bash
# Core test runner
npm install --save-dev jest jest-expo

# React Native Testing Library
npm install --save-dev @testing-library/react-native @testing-library/jest-native

# Mocking helpers
npm install --save-dev @react-native-async-storage/async-storage
# (already in deps — add mock only)

# Type support
npm install --save-dev @types/jest
```

---

## Configuration Files

### `jest.config.js`
```js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterFramework: ['@testing-library/jest-native/extend-expect'],
  setupFiles: ['./jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'utils/**/*.ts',
    'context/**/*.tsx',
    'components/**/*.tsx',
    'app/**/*.tsx',
    '!**/__tests__/**',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### `jest.setup.ts`
```ts
import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({ coords: { latitude: 23.8, longitude: 90.4 } })
  ),
  reverseGeocodeAsync: jest.fn(() =>
    Promise.resolve([{ country: 'Bangladesh', city: 'Dhaka' }])
  ),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() })),
  useLocalSearchParams: jest.fn(() => ({})),
  Link: 'Link',
  Stack: { Screen: 'Screen' },
  Tabs: { Screen: 'Screen' },
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { changeLanguage: jest.fn() } }),
  initReactI18next: { type: '3rdParty', init: jest.fn() },
}));

// Silence act() warnings in tests
global.console.error = jest.fn((msg) => {
  if (!msg.includes('act(')) console.error(msg);
});
```

---

## Test Folder Structure

```
__tests__/
  utils/
    calculations.test.ts
    formatters.test.ts
    validation.test.ts
    storage.test.ts
    localization.test.ts
  context/
    BudgetContext.test.tsx
    ThemeContext.test.tsx
  components/
    BudgetCard.test.tsx
    ExpenseItem.test.tsx
    AmountInput.test.tsx
    CategoryPicker.test.tsx
    ProgressBar.test.tsx
  screens/
    Dashboard.test.tsx
    Expenses.test.tsx
    Settings.test.tsx
    AddExpense.test.tsx
    Onboarding.test.tsx
  integration/
    add-and-view-expense.test.tsx
    monthly-navigation.test.tsx
```

---

## TDD Cycle 1 — Utility Tests (Red → Green → Refactor)

### RED: Write failing tests first

**`__tests__/utils/calculations.test.ts`**
```ts
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
});

describe('calculateCategoryBudget', () => {
  it('calculates correct allocated amount for needs (50%)', () => {
    const result = calculateCategoryBudget(200000, [], 'needs');
    expect(result.allocated).toBe(100000);
  });

  it('flags over-budget correctly', () => {
    const expenses = [makeExpense({ amount: 150000, category: 'needs' })];
    const result = calculateCategoryBudget(200000, expenses, 'needs');
    expect(result.isOverBudget).toBe(true);
    expect(result.remaining).toBe(-50000);
  });

  it('percentage is 0 when income is 0', () => {
    const result = calculateCategoryBudget(0, [], 'needs');
    expect(result.percentage).toBe(0);
  });
});

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
});

describe('groupExpensesByDate', () => {
  it('groups expenses by date in descending order', () => {
    const expenses = [
      makeExpense({ date: '2024-01-10' }),
      makeExpense({ date: '2024-01-12' }),
      makeExpense({ date: '2024-01-10', id: '2' }),
    ];
    const grouped = groupExpensesByDate(expenses);
    const keys = [...grouped.keys()];
    expect(keys[0]).toBe('2024-01-12');
    expect(grouped.get('2024-01-10')).toHaveLength(2);
  });
});
```

### GREEN: Tests should pass against existing implementation (no changes needed for utils)

### REFACTOR: After green, add edge case coverage for:
- Zero income
- Negative amounts (validation should prevent, but guard in calc)
- Expenses from multiple months in summary

---

## TDD Cycle 2 — Context Tests

### RED

**`__tests__/context/BudgetContext.test.tsx`**
```tsx
import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { BudgetProvider, useBudget } from '../../context/BudgetContext';

const TestConsumer = () => {
  const { state, setIncome, addExpense } = useBudget();
  return (
    <>
      <Text testID="income">{state.monthlyIncome}</Text>
      <Text testID="expense-count">{state.expenses.length}</Text>
    </>
  );
};

const renderWithProvider = () =>
  render(
    <BudgetProvider>
      <TestConsumer />
    </BudgetProvider>
  );

describe('BudgetContext', () => {
  it('initializes with zero income', async () => {
    const { getByTestId } = renderWithProvider();
    await waitFor(() => expect(getByTestId('income').props.children).toBe(0));
  });

  it('setIncome updates income in state', async () => {
    // ...
  });

  it('addExpense adds to expenses array', async () => {
    // ...
  });

  it('deleteExpense removes by id', async () => {
    // ...
  });

  it('resetAll clears income and expenses', async () => {
    // ...
  });
});
```

---

## npm Scripts to Add

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:ci": "jest --ci --coverage --forceExit"
}
```

---

## Acceptance Criteria

- [ ] `npm test` runs without error
- [ ] All utility functions (`calculations`, `formatters`, `validation`) have ≥ 80% coverage
- [ ] `BudgetContext` reducer actions are all tested
- [ ] AsyncStorage mock prevents real I/O in tests
- [ ] CI-ready: `npm run test:ci` exits cleanly with coverage report

---

## Definition of Done

- Jest config checked into repo
- `jest.setup.ts` with all Expo mocks
- At least one passing test per utility file
- Coverage baseline established
- `package.json` scripts updated
