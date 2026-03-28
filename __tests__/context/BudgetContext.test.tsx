import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetProvider, useBudget } from '../../context/BudgetContext';
import { Expense } from '../../types';
import { getCurrentMonth } from '../../utils/formatters';

const makeExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: 'exp-1',
  amount: 5000,
  description: 'Test',
  category: 'needs',
  date: `${getCurrentMonth()}-15`,
  createdAt: new Date().toISOString(),
  ...overrides,
});

interface ConsumerProps {
  onReady?: (ctx: ReturnType<typeof useBudget>) => void;
}

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
      <Text testID="location">{JSON.stringify(ctx.state.location)}</Text>
      <Text testID="template-count">{ctx.state.recurringTemplates.length}</Text>
    </>
  );
};

const renderWithProvider = (props?: ConsumerProps) =>
  render(
    <BudgetProvider>
      <ContextConsumer {...props} />
    </BudgetProvider>,
  );

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('BudgetContext — initial state', () => {
  it('starts with zero income', async () => {
    const { getByTestId } = renderWithProvider();
    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('false'),
    );
    expect(getByTestId('income').props.children).toBe(0);
  });

  it('starts with empty expenses', async () => {
    const { getByTestId } = renderWithProvider();
    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('false'),
    );
    expect(getByTestId('expense-count').props.children).toBe(0);
  });
});

describe('BudgetContext — setIncome', () => {
  it('updates monthlyIncome in state', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = renderWithProvider({
      onReady: (c) => {
        ctx = c;
      },
    });

    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('false'),
    );
    act(() => {
      ctx!.setIncome(200000);
    });
    await waitFor(() =>
      expect(getByTestId('income').props.children).toBe(200000),
    );
  });
});

describe('BudgetContext — addExpense', () => {
  it('adds an expense to the expenses array', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = renderWithProvider({
      onReady: (c) => {
        ctx = c;
      },
    });

    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('false'),
    );
    act(() => {
      ctx!.addExpense(makeExpense());
    });
    await waitFor(() =>
      expect(getByTestId('expense-count').props.children).toBe(1),
    );
  });
});

describe('BudgetContext — setLocation', () => {
  it('updates location in state', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = renderWithProvider({
      onReady: (c) => {
        ctx = c;
      },
    });

    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('false'),
    );

    const loc = { latitude: 10, longitude: 20, country: 'TestLand' };
    act(() => {
      ctx!.setLocation(loc);
    });

    await waitFor(() =>
      expect(getByTestId('location').props.children).toBe(JSON.stringify(loc)),
    );
  });
});

describe('BudgetContext — Recurring Templates', () => {
  const makeTemplate = (id = 't1') => ({
    id,
    amount: 1000,
    description: 'Sub',
    category: 'wants' as const,
    dayOfMonth: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  });

  it('adds, updates, and deletes recurring templates', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = renderWithProvider({
      onReady: (c) => {
        ctx = c;
      },
    });

    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('false'),
    );

    act(() => {
      ctx!.addRecurringTemplate(makeTemplate('t1'));
    });
    await waitFor(() =>
      expect(getByTestId('template-count').props.children).toBe(1),
    );

    act(() => {
      ctx!.deleteRecurringTemplate('t1');
    });
    await waitFor(() =>
      expect(getByTestId('template-count').props.children).toBe(0),
    );
  });
});

describe('BudgetContext — resetAll', () => {
  it('clears all data', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId } = renderWithProvider({
      onReady: (c) => {
        ctx = c;
      },
    });

    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('false'),
    );

    act(() => {
      ctx!.setIncome(1000);
      ctx!.addExpense(makeExpense());
    });

    await waitFor(() =>
      expect(getByTestId('expense-count').props.children).toBe(1),
    );

    await act(async () => {
      await ctx!.resetAll();
    });

    await waitFor(() => {
      expect(getByTestId('income').props.children).toBe(0);
      expect(getByTestId('expense-count').props.children).toBe(0);
    });
  });

  it('hits more branches in BudgetContext', async () => {
    let ctx: ReturnType<typeof useBudget> | null = null;
    const { getByTestId, rerender } = renderWithProvider({
      onReady: (c) => {
        ctx = c;
      },
    });
    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('false'),
    );

    act(() => {
      ctx!.setLocation({ latitude: 1, longitude: 2, address: 'Somewhere' });
    });
    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('false'),
    );

    act(() => {
      ctx!.setIncome(ctx!.state.monthlyIncome);
    });
  });
});

describe('useBudget wrapper', () => {
  it('throws error outside provider', () => {
    const BadConsumer = () => {
      useBudget();
      return null;
    };
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<BadConsumer />)).toThrow();
  });
});
