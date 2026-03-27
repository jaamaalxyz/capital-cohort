import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetProvider, useBudget } from '../../context/BudgetContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { Expense } from '../../types';
import { getCurrentMonth } from '../../utils/formatters';

const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <BudgetProvider>{children}</BudgetProvider>
  </ThemeProvider>
);

const makeExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: `exp-${Math.random()}`,
  amount: 5000,
  description: 'Integration Test',
  category: 'needs',
  date: `${getCurrentMonth()}-15`,
  createdAt: new Date().toISOString(),
  ...overrides,
});

const StateConsumer = ({
  onReady,
}: {
  onReady: (ctx: ReturnType<typeof useBudget>) => void;
}) => {
  const ctx = useBudget();

  React.useEffect(() => {
    if (!ctx.state.isLoading) {
      onReady(ctx);
    }
  }, [ctx.state.isLoading]);

  return (
    <>
      <Text testID="count">{ctx.state.expenses.length}</Text>
      <Text testID="summary-spent">{ctx.summary.totalSpent}</Text>
    </>
  );
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('Integration — add and view expense', () => {
  it('adding an expense increases expense count', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = render(
      <Providers>
        <StateConsumer onReady={(c) => { ctx = c; }} />
      </Providers>
    );

    // Wait for context to be ready
    await waitFor(() => expect(ctx).not.toBeNull(), { timeout: 3000 });

    act(() => {
      ctx!.addExpense(makeExpense({ id: 'e1', amount: 5000 }));
    });

    await waitFor(() => expect(getByTestId('count').props.children).toBe(1));
  });

  it('total spent reflects added expense amount', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = render(
      <Providers>
        <StateConsumer onReady={(c) => { ctx = c; }} />
      </Providers>
    );

    await waitFor(() => expect(ctx).not.toBeNull(), { timeout: 3000 });

    act(() => {
      ctx!.setIncome(100000);
      ctx!.addExpense(makeExpense({ id: 'e1', amount: 3000 }));
    });

    await waitFor(() => expect(getByTestId('summary-spent').props.children).toBe(3000));
  });

  it('deleting an expense reduces expense count', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = render(
      <Providers>
        <StateConsumer onReady={(c) => { ctx = c; }} />
      </Providers>
    );

    await waitFor(() => expect(ctx).not.toBeNull(), { timeout: 3000 });

    act(() => {
      ctx!.addExpense(makeExpense({ id: 'del-me' }));
      ctx!.addExpense(makeExpense({ id: 'keep-me' }));
    });

    await waitFor(() => expect(getByTestId('count').props.children).toBe(2));

    act(() => {
      ctx!.deleteExpense('del-me');
    });

    await waitFor(() => expect(getByTestId('count').props.children).toBe(1));
  });

  it('expenses from a different month are not counted in summary', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = render(
      <Providers>
        <StateConsumer onReady={(c) => { ctx = c; }} />
      </Providers>
    );

    await waitFor(() => expect(ctx).not.toBeNull(), { timeout: 3000 });

    act(() => {
      ctx!.setIncome(100000);
      ctx!.addExpense(makeExpense({ id: 'past', date: '2020-01-10', amount: 99000 }));
      ctx!.addExpense(makeExpense({ id: 'current', amount: 1000 }));
    });

    await waitFor(() => expect(getByTestId('count').props.children).toBe(2));
    await waitFor(() => expect(getByTestId('summary-spent').props.children).toBe(1000));
  });
});
