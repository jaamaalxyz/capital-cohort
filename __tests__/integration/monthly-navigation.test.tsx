import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetProvider, useBudget } from '../../context/BudgetContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { Expense } from '../../types';
import { getCurrentMonth, getPreviousMonth } from '../../utils/formatters';

const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <BudgetProvider>{children}</BudgetProvider>
  </ThemeProvider>
);

const makeExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: `exp-${Math.random()}`,
  amount: 5000,
  description: 'Test',
  category: 'needs',
  date: `${getCurrentMonth()}-15`,
  createdAt: new Date().toISOString(),
  ...overrides,
});

const MonthConsumer = ({
  onReady,
}: {
  onReady: (ctx: ReturnType<typeof useBudget>) => void;
}) => {
  const ctx = useBudget();
  const calledRef = React.useRef(false);

  React.useEffect(() => {
    if (!ctx.state.isLoading && !calledRef.current) {
      calledRef.current = true;
      onReady(ctx);
    }
  }, [ctx.state.isLoading]);

  return (
    <>
      <Text testID="current-month">{ctx.state.currentMonth}</Text>
      <Text testID="month-expenses">{ctx.currentMonthExpenses.length}</Text>
      <Text testID="month-spent">{ctx.summary.totalSpent}</Text>
    </>
  );
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('Integration — monthly navigation', () => {
  it('starts on the current month', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = render(
      <Providers>
        <MonthConsumer onReady={(c) => { ctx = c; }} />
      </Providers>
    );

    await waitFor(() =>
      expect(getByTestId('current-month').props.children).toBe(getCurrentMonth())
    );
  });

  it('setMonth changes the current month', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = render(
      <Providers>
        <MonthConsumer onReady={(c) => { ctx = c; }} />
      </Providers>
    );

    await waitFor(() =>
      expect(getByTestId('current-month').props.children).toBe(getCurrentMonth())
    );

    const prevMonth = getPreviousMonth(getCurrentMonth());
    act(() => { ctx!.setMonth(prevMonth); });

    await waitFor(() =>
      expect(getByTestId('current-month').props.children).toBe(prevMonth)
    );
  });

  it('currentMonthExpenses only shows expenses from the selected month', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = render(
      <Providers>
        <MonthConsumer onReady={(c) => { ctx = c; }} />
      </Providers>
    );

    await waitFor(() =>
      expect(getByTestId('month-expenses').props.children).toBe(0)
    );

    const prevMonth = getPreviousMonth(getCurrentMonth());

    act(() => {
      // Add one expense for current month, one for previous
      ctx!.addExpense(makeExpense({ id: 'curr', date: `${getCurrentMonth()}-10` }));
      ctx!.addExpense(makeExpense({ id: 'prev', date: `${prevMonth}-10` }));
    });

    // On current month — should see only 1
    await waitFor(() =>
      expect(getByTestId('month-expenses').props.children).toBe(1)
    );

    // Navigate to previous month — should see only 1
    act(() => { ctx!.setMonth(prevMonth); });

    await waitFor(() =>
      expect(getByTestId('month-expenses').props.children).toBe(1)
    );
  });

  it('summary totalSpent is 0 for a month with no expenses', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = render(
      <Providers>
        <MonthConsumer onReady={(c) => { ctx = c; }} />
      </Providers>
    );

    await waitFor(() =>
      expect(getByTestId('month-spent').props.children).toBe(0)
    );

    const prevMonth = getPreviousMonth(getCurrentMonth());
    act(() => { ctx!.setMonth(prevMonth); });

    await waitFor(() =>
      expect(getByTestId('month-spent').props.children).toBe(0)
    );
  });

  it('navigating to a different month and back restores original expenses', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = render(
      <Providers>
        <MonthConsumer onReady={(c) => { ctx = c; }} />
      </Providers>
    );

    await waitFor(() =>
      expect(getByTestId('month-expenses').props.children).toBe(0)
    );

    act(() => {
      ctx!.addExpense(makeExpense({ id: 'e1' }));
      ctx!.addExpense(makeExpense({ id: 'e2' }));
    });

    await waitFor(() =>
      expect(getByTestId('month-expenses').props.children).toBe(2)
    );

    // Navigate away
    const prev = getPreviousMonth(getCurrentMonth());
    act(() => { ctx!.setMonth(prev); });
    await waitFor(() =>
      expect(getByTestId('month-expenses').props.children).toBe(0)
    );

    // Navigate back
    act(() => { ctx!.setMonth(getCurrentMonth()); });
    await waitFor(() =>
      expect(getByTestId('month-expenses').props.children).toBe(2)
    );
  });
});
