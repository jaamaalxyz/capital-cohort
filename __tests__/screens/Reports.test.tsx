import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReportsScreen from '../../app/(tabs)/reports';
import { BudgetProvider } from '../../context/BudgetContext';
import { Expense } from '../../types';
import { STORAGE_KEYS } from '../../constants/theme';

// Mock ThemeContext so we don't need ThemeProvider
jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: require('../../constants/theme').LIGHT_COLORS,
    isDark: false,
    themeMode: 'light',
    effectiveTheme: 'light',
    setThemeMode: jest.fn(),
  }),
}));

// Build a YYYY-MM-DD date string in the current month
const now = new Date();
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const todayStr = `${currentMonth}-${String(now.getDate()).padStart(2, '0')}`;

const makeExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: Math.random().toString(),
  amount: 5000,
  description: 'Test',
  category: 'needs',
  date: todayStr,
  createdAt: new Date().toISOString(),
  ...overrides,
});

const renderReports = () =>
  render(
    <BudgetProvider>
      <ReportsScreen />
    </BudgetProvider>
  );

beforeEach(async () => {
  await AsyncStorage.clear();
});

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
describe('Reports screen — empty state', () => {
  it('renders the Reports heading', async () => {
    const { getByText } = renderReports();
    await waitFor(() => expect(getByText('Reports')).toBeTruthy());
  });

  it('shows empty state when no expenses recorded', async () => {
    const { getByTestId } = renderReports();
    await waitFor(() =>
      expect(getByTestId('reports-empty-state')).toBeTruthy()
    );
  });

  it('does not show charts when there are no expenses', async () => {
    const { queryByTestId } = renderReports();
    await waitFor(() => expect(queryByTestId('reports-bar-chart')).toBeNull());
  });
});

// ---------------------------------------------------------------------------
// With expenses
// ---------------------------------------------------------------------------
describe('Reports screen — with expenses', () => {
  beforeEach(async () => {
    const expenses = [
      makeExpense({ amount: 50000, category: 'needs' }),
      makeExpense({ amount: 30000, category: 'wants' }),
      makeExpense({ amount: 20000, category: 'savings' }),
    ];
    await AsyncStorage.setItem(
      STORAGE_KEYS.EXPENSES,
      JSON.stringify(expenses)
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.ONBOARDING_COMPLETED,
      JSON.stringify(true)
    );
  });

  it('does not show empty state when expenses exist', async () => {
    const { queryByTestId } = renderReports();
    await waitFor(() =>
      expect(queryByTestId('reports-empty-state')).toBeNull()
    );
  });

  it('renders bar chart when expenses exist', async () => {
    const { getByTestId } = renderReports();
    await waitFor(() =>
      expect(getByTestId('reports-bar-chart')).toBeTruthy()
    );
  });

  it('renders donut chart when expenses exist', async () => {
    const { getByTestId } = renderReports();
    await waitFor(() =>
      expect(getByTestId('reports-donut-chart')).toBeTruthy()
    );
  });

  it('renders average daily spend insight card', async () => {
    const { getByTestId } = renderReports();
    await waitFor(() =>
      expect(getByTestId('avg-daily-spend-card')).toBeTruthy()
    );
  });

  it('renders top category insight card', async () => {
    const { getByTestId } = renderReports();
    await waitFor(() =>
      expect(getByTestId('top-category-card')).toBeTruthy()
    );
  });

  it('renders legend rows for each category', async () => {
    const { getByTestId } = renderReports();
    await waitFor(() => {
      expect(getByTestId('legend-needs')).toBeTruthy();
      expect(getByTestId('legend-wants')).toBeTruthy();
      expect(getByTestId('legend-savings')).toBeTruthy();
    });
  });
});
