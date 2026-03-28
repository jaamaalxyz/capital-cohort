import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetProvider, useBudget } from '../../context/BudgetContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { calculateCategoryBudget } from '../../utils/calculations';
import { BudgetRule } from '../../types';

const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <BudgetProvider>{children}</BudgetProvider>
  </ThemeProvider>
);

const StateConsumer = ({
  onReady,
}: {
  onReady: (ctx: ReturnType<typeof useBudget>) => void;
}) => {
  const ctx = useBudget();
  if (!ctx.state.isLoading) {
    onReady(ctx);
  }
  return null;
};

describe('Custom budget rule — dashboard integration', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('calculateCategoryBudget uses rule percentages, not hardcoded 50/30/20', () => {
    const rule: BudgetRule = { needs: 70, wants: 20, savings: 10 };
    const result = calculateCategoryBudget(100000, [], 'needs', rule, 0);
    expect(result.allocated).toBe(70000);
  });

  it('calculateCategoryBudget respects all three categories of a custom rule', () => {
    const rule: BudgetRule = { needs: 70, wants: 20, savings: 10 };
    const needs = calculateCategoryBudget(100000, [], 'needs', rule, 0);
    const wants = calculateCategoryBudget(100000, [], 'wants', rule, 0);
    const savings = calculateCategoryBudget(100000, [], 'savings', rule, 0);
    expect(needs.allocated).toBe(70000);
    expect(wants.allocated).toBe(20000);
    expect(savings.allocated).toBe(10000);
  });

  it('summary reflects custom rule after setBudgetRule is called', async () => {
    let capturedCtx: ReturnType<typeof useBudget> | null = null;

    render(
      <Providers>
        <StateConsumer onReady={(ctx) => { capturedCtx = ctx; }} />
      </Providers>
    );

    await waitFor(() => expect(capturedCtx?.state.isLoading).toBe(false));

    // Set income and a 70/20/10 rule
    await act(async () => {
      capturedCtx!.setIncome(100000);
      capturedCtx!.setBudgetRule({ needs: 70, wants: 20, savings: 10 });
    });

    await waitFor(() => {
      expect(capturedCtx!.summary.needs.allocated).toBe(70000);
      expect(capturedCtx!.summary.wants.allocated).toBe(20000);
      expect(capturedCtx!.summary.savings.allocated).toBe(10000);
    });
  });

  it('changing rule re-computes summary immediately without reload', async () => {
    let capturedCtx: ReturnType<typeof useBudget> | null = null;

    render(
      <Providers>
        <StateConsumer onReady={(ctx) => { capturedCtx = ctx; }} />
      </Providers>
    );

    await waitFor(() => expect(capturedCtx?.state.isLoading).toBe(false));

    await act(async () => {
      capturedCtx!.setIncome(200000);
      capturedCtx!.setBudgetRule({ needs: 50, wants: 30, savings: 20 });
    });

    await waitFor(() => expect(capturedCtx!.summary.needs.allocated).toBe(100000));

    // Switch to 60/20/20
    await act(async () => {
      capturedCtx!.setBudgetRule({ needs: 60, wants: 20, savings: 20 });
    });

    await waitFor(() => {
      expect(capturedCtx!.summary.needs.allocated).toBe(120000);
      expect(capturedCtx!.summary.wants.allocated).toBe(40000);
      expect(capturedCtx!.summary.savings.allocated).toBe(40000);
    });
  });

  it('budget rule persists to AsyncStorage when set', async () => {
    let capturedCtx: ReturnType<typeof useBudget> | null = null;

    render(
      <Providers>
        <StateConsumer onReady={(ctx) => { capturedCtx = ctx; }} />
      </Providers>
    );

    await waitFor(() => expect(capturedCtx?.state.isLoading).toBe(false));

    await act(async () => {
      capturedCtx!.setBudgetRule({ needs: 70, wants: 20, savings: 10 });
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@budget_rule',
        expect.stringContaining('"needs":70')
      );
    });
  });
});
