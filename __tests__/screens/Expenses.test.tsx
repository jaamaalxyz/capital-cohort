import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetProvider, useBudget } from '../../context/BudgetContext';
import { ThemeProvider } from '../../context/ThemeContext';
import ExpensesScreen from '../../app/(tabs)/expenses';
import { Expense } from '../../types';
import { getCurrentMonth } from '../../utils/formatters';

const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <BudgetProvider>{children}</BudgetProvider>
  </ThemeProvider>
);

const renderExpenses = () =>
  render(
    <Providers>
      <ExpensesScreen />
    </Providers>
  );

const makeExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: Math.random().toString(),
  amount: 5000,
  description: 'Test Expense',
  category: 'needs',
  date: `${getCurrentMonth()}-15`,
  createdAt: new Date().toISOString(),
  ...overrides,
});

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('Expenses screen — empty state', () => {
  it('renders without crashing', async () => {
    const { toJSON } = renderExpenses();
    await waitFor(() => expect(toJSON()).not.toBeNull());
  });

  it('shows empty state message when no expenses exist', async () => {
    const { findByText } = renderExpenses();
    expect(await findByText('expenses.noExpenses')).toBeTruthy();
  });

  it('shows search bar', async () => {
    const { findByPlaceholderText } = renderExpenses();
    expect(await findByPlaceholderText('expenses.searchPlaceholder')).toBeTruthy();
  });

  it('shows all category filter options', async () => {
    const { findByText } = renderExpenses();
    expect(await findByText('categories.needs')).toBeTruthy();
    expect(await findByText('categories.wants')).toBeTruthy();
    expect(await findByText('categories.savings')).toBeTruthy();
  });
});

describe('Expenses screen — with expenses', () => {
  it('renders expense list when expenses exist in current month', async () => {
    const expense = makeExpense({ description: 'Rent Payment' });
    await AsyncStorage.setItem('@budget_expenses', JSON.stringify([expense]));

    const { findByText } = renderExpenses();
    expect(await findByText('Rent Payment')).toBeTruthy();
  });

  it('shows expense description in the list', async () => {
    const expense = makeExpense({ description: 'Grocery Store' });
    await AsyncStorage.setItem('@budget_expenses', JSON.stringify([expense]));

    const { findByText } = renderExpenses();
    expect(await findByText('Grocery Store')).toBeTruthy();
  });
});

describe('Expenses screen — filter interaction', () => {
  it('tapping "needs" filter does not crash', async () => {
    const { findByText } = renderExpenses();
    const needsPill = await findByText('categories.needs');
    expect(() => fireEvent.press(needsPill)).not.toThrow();
  });
});
