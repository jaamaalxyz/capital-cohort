import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetProvider, useBudget } from '../../context/BudgetContext';
import { Expense } from '../../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const makeExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: 'exp-1',
  amount: 5000,
  description: 'Test',
  category: 'needs',
  date: '2024-01-15',
  createdAt: new Date().toISOString(),
  ...overrides,
});

interface ConsumerProps {
  onReady?: (ctx: ReturnType<typeof useBudget>) => void;
}

/** Exposes context values via testIDs for assertions */
const ContextConsumer: React.FC<ConsumerProps> = ({ onReady }) => {
  const ctx = useBudget();
  const calledRef = React.useRef(false);

  React.useEffect(() => {
    if (!ctx.state.isLoading && !calledRef.current) {
      calledRef.current = true;
      onReady?.(ctx);
    }
  }, [ctx.state.isLoading]);

  return (
    <>
      <Text testID="income">{ctx.state.monthlyIncome}</Text>
      <Text testID="expense-count">{ctx.state.expenses.length}</Text>
      <Text testID="currency">{ctx.state.currency}</Text>
      <Text testID="month">{ctx.state.currentMonth}</Text>
      <Text testID="onboarding">{String(ctx.state.onboardingCompleted)}</Text>
      <Text testID="loading">{String(ctx.state.isLoading)}</Text>
    </>
  );
};

const renderWithProvider = (props?: ConsumerProps) =>
  render(
    <BudgetProvider>
      <ContextConsumer {...props} />
    </BudgetProvider>
  );

beforeEach(async () => {
  await AsyncStorage.clear();
});

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------
describe('BudgetContext — initial state', () => {
  it('starts with zero income', async () => {
    const { getByTestId } = renderWithProvider();
    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('false')
    );
    expect(getByTestId('income').props.children).toBe(0);
  });

  it('starts with empty expenses', async () => {
    const { getByTestId } = renderWithProvider();
    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('false')
    );
    expect(getByTestId('expense-count').props.children).toBe(0);
  });

  it('starts with onboarding not completed', async () => {
    const { getByTestId } = renderWithProvider();
    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('false')
    );
    expect(getByTestId('onboarding').props.children).toBe('false');
  });

  it('sets isLoading to false after data loads', async () => {
    const { getByTestId } = renderWithProvider();
    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('false')
    );
  });
});

// ---------------------------------------------------------------------------
// setIncome
// ---------------------------------------------------------------------------
describe('BudgetContext — setIncome', () => {
  it('updates monthlyIncome in state', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = renderWithProvider({
      onReady: (c) => { ctx = c; },
    });

    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('false')
    );

    act(() => { ctx!.setIncome(200000); });

    await waitFor(() =>
      expect(getByTestId('income').props.children).toBe(200000)
    );
  });
});

// ---------------------------------------------------------------------------
// addExpense
// ---------------------------------------------------------------------------
describe('BudgetContext — addExpense', () => {
  it('adds an expense to the expenses array', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = renderWithProvider({
      onReady: (c) => { ctx = c; },
    });

    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('false')
    );

    act(() => { ctx!.addExpense(makeExpense()); });

    await waitFor(() =>
      expect(getByTestId('expense-count').props.children).toBe(1)
    );
  });

  it('increases expense count with each addition', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = renderWithProvider({
      onReady: (c) => { ctx = c; },
    });

    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('false')
    );

    act(() => { ctx!.addExpense(makeExpense({ id: '1' })); });
    act(() => { ctx!.addExpense(makeExpense({ id: '2' })); });

    await waitFor(() =>
      expect(getByTestId('expense-count').props.children).toBe(2)
    );
  });
});

// ---------------------------------------------------------------------------
// deleteExpense
// ---------------------------------------------------------------------------
describe('BudgetContext — deleteExpense', () => {
  it('removes an expense by id', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = renderWithProvider({
      onReady: (c) => { ctx = c; },
    });

    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('false')
    );

    act(() => { ctx!.addExpense(makeExpense({ id: 'del-me' })); });
    await waitFor(() =>
      expect(getByTestId('expense-count').props.children).toBe(1)
    );

    act(() => { ctx!.deleteExpense('del-me'); });
    await waitFor(() =>
      expect(getByTestId('expense-count').props.children).toBe(0)
    );
  });

  it('does not remove other expenses when deleting by id', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = renderWithProvider({
      onReady: (c) => { ctx = c; },
    });

    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('false')
    );

    act(() => {
      ctx!.addExpense(makeExpense({ id: 'keep-me' }));
      ctx!.addExpense(makeExpense({ id: 'del-me' }));
    });
    await waitFor(() =>
      expect(getByTestId('expense-count').props.children).toBe(2)
    );

    act(() => { ctx!.deleteExpense('del-me'); });
    await waitFor(() =>
      expect(getByTestId('expense-count').props.children).toBe(1)
    );
  });
});

// ---------------------------------------------------------------------------
// setCurrency
// ---------------------------------------------------------------------------
describe('BudgetContext — setCurrency', () => {
  it('updates currency in state', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = renderWithProvider({
      onReady: (c) => { ctx = c; },
    });

    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('false')
    );

    act(() => { ctx!.setCurrency('EUR'); });

    await waitFor(() =>
      expect(getByTestId('currency').props.children).toBe('EUR')
    );
  });
});

// ---------------------------------------------------------------------------
// completeOnboarding
// ---------------------------------------------------------------------------
describe('BudgetContext — completeOnboarding', () => {
  it('sets onboardingCompleted to true', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = renderWithProvider({
      onReady: (c) => { ctx = c; },
    });

    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('false')
    );

    act(() => { ctx!.completeOnboarding(); });

    await waitFor(() =>
      expect(getByTestId('onboarding').props.children).toBe('true')
    );
  });
});

// ---------------------------------------------------------------------------
// resetAll
// ---------------------------------------------------------------------------
describe('BudgetContext — resetAll', () => {
  it('clears income and expenses', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = renderWithProvider({
      onReady: (c) => { ctx = c; },
    });

    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('false')
    );

    act(() => {
      ctx!.setIncome(100000);
      ctx!.addExpense(makeExpense());
    });
    await waitFor(() =>
      expect(getByTestId('expense-count').props.children).toBe(1)
    );

    await act(async () => { await ctx!.resetAll(); });

    await waitFor(() => {
      expect(getByTestId('income').props.children).toBe(0);
      expect(getByTestId('expense-count').props.children).toBe(0);
    });
  });
});

// ---------------------------------------------------------------------------
// useBudget outside provider
// ---------------------------------------------------------------------------
describe('useBudget', () => {
  it('throws when used outside BudgetProvider', () => {
    const BadConsumer = () => {
      useBudget();
      return null;
    };
    // Suppress expected error output
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<BadConsumer />)).toThrow(
      'useBudget must be used within a BudgetProvider'
    );
    jest.restoreAllMocks();
  });
});
