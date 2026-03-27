import React from 'react';
import { Text } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetProvider, useBudget } from '../../context/BudgetContext';
import { STORAGE_KEYS } from '../../constants/theme';
import { RecurringTemplate } from '../../types';
import { getCurrentMonth } from '../../utils/formatters';

// Mock ThemeContext
jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: require('../../constants/theme').LIGHT_COLORS,
    isDark: false,
    themeMode: 'light',
    effectiveTheme: 'light',
    setThemeMode: jest.fn(),
  }),
}));

const currentMonth = getCurrentMonth();

const makeTemplate = (overrides: Partial<RecurringTemplate> = {}): RecurringTemplate => ({
  id: 'tmpl-1',
  amount: 50000,
  description: 'Rent',
  category: 'needs',
  dayOfMonth: 1,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

// Renders live state directly — re-renders on every state change
function ExpenseCountDisplay() {
  const { state } = useBudget();
  if (state.isLoading) return <Text testID="loading">loading</Text>;
  return (
    <Text testID="expense-count">{state.expenses.length}</Text>
  );
}

function HasRecurringDisplay() {
  const { state } = useBudget();
  if (state.isLoading) return <Text testID="loading">loading</Text>;
  const has = state.expenses.some((e) => e.recurringTemplateId === 'tmpl-1');
  return <Text testID="has-recurring">{has ? 'yes' : 'no'}</Text>;
}

beforeEach(async () => {
  await AsyncStorage.clear();
  await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, JSON.stringify(true));
});

describe('Recurring expense materialization', () => {
  it('auto-creates expenses from active templates on load', async () => {
    const templates = [makeTemplate({ lastMaterializedMonth: undefined })];
    await AsyncStorage.setItem(STORAGE_KEYS.RECURRING_TEMPLATES, JSON.stringify(templates));

    const { getByTestId } = render(
      <BudgetProvider>
        <HasRecurringDisplay />
      </BudgetProvider>
    );

    await waitFor(() => expect(getByTestId('has-recurring').props.children).toBe('yes'), { timeout: 4000 });
  });

  it('does not duplicate expenses if already materialized this month', async () => {
    const templates = [makeTemplate({ lastMaterializedMonth: currentMonth })];
    await AsyncStorage.setItem(STORAGE_KEYS.RECURRING_TEMPLATES, JSON.stringify(templates));

    const { getByTestId } = render(
      <BudgetProvider>
        <ExpenseCountDisplay />
      </BudgetProvider>
    );

    await waitFor(() => expect(getByTestId('expense-count')).toBeTruthy(), { timeout: 4000 });
    // Give extra time to ensure no materialization runs
    await new Promise((r) => setTimeout(r, 500));
    expect(getByTestId('expense-count').props.children).toBe(0);
  });

  it('does not materialize for inactive templates', async () => {
    const templates = [makeTemplate({ isActive: false })];
    await AsyncStorage.setItem(STORAGE_KEYS.RECURRING_TEMPLATES, JSON.stringify(templates));

    const { getByTestId } = render(
      <BudgetProvider>
        <ExpenseCountDisplay />
      </BudgetProvider>
    );

    await waitFor(() => expect(getByTestId('expense-count')).toBeTruthy(), { timeout: 4000 });
    await new Promise((r) => setTimeout(r, 500));
    expect(getByTestId('expense-count').props.children).toBe(0);
  });
});
