import React from 'react';
import { render } from '@testing-library/react-native';
import { BudgetCard } from '../../components/BudgetCard';
import { ThemeProvider } from '../../context/ThemeContext';
import { CategoryBudget } from '../../types';

const makeBudget = (overrides: Partial<CategoryBudget> = {}): CategoryBudget => ({
  allocated: 100000,
  spent: 40000,
  remaining: 60000,
  percentage: 40,
  isOverBudget: false,
  ...overrides,
});

const renderCard = (props?: Partial<React.ComponentProps<typeof BudgetCard>>) =>
  render(
    <ThemeProvider>
      <BudgetCard
        category="needs"
        budget={makeBudget()}
        currencySymbol="$"
        {...props}
      />
    </ThemeProvider>
  );

describe('BudgetCard — rendering', () => {
  it('renders without crashing', async () => {
    const { findByText } = renderCard();
    // Wait for theme to load; component renders i18n key in uppercase
    expect(await findByText(/CATEGORIES.NEEDS/i)).toBeTruthy();
  });

  it('displays formatted spent amount', async () => {
    const { findByText } = renderCard({ budget: makeBudget({ spent: 50000 }) });
    expect(await findByText('$500.00')).toBeTruthy();
  });

  it('displays formatted allocated amount', async () => {
    const { findByText } = renderCard({ budget: makeBudget({ allocated: 100000 }) });
    expect(await findByText(/\$1,000\.00/)).toBeTruthy();
  });

  it('displays remaining when under budget', async () => {
    const { findByText } = renderCard({
      budget: makeBudget({ remaining: 60000, isOverBudget: false }),
    });
    expect(await findByText(/\$600\.00/)).toBeTruthy();
  });

  it('displays percentage usage', async () => {
    const { findByText } = renderCard({ budget: makeBudget({ percentage: 40 }) });
    expect(await findByText(/40%/)).toBeTruthy();
  });
});

describe('BudgetCard — over budget state', () => {
  it('renders over-budget correctly', async () => {
    const { findByText } = renderCard({
      budget: makeBudget({ isOverBudget: true, remaining: -10000, percentage: 110 }),
    });
    expect(await findByText(/CATEGORIES.NEEDS/i)).toBeTruthy();
  });
});

describe('BudgetCard — categories', () => {
  it('renders for "wants" category', async () => {
    const { findByText } = renderCard({ category: 'wants', budget: makeBudget() });
    expect(await findByText(/CATEGORIES.WANTS/i)).toBeTruthy();
  });

  it('renders for "savings" category', async () => {
    const { findByText } = renderCard({ category: 'savings', budget: makeBudget() });
    expect(await findByText(/CATEGORIES.SAVINGS/i)).toBeTruthy();
  });
});

describe('BudgetCard — interaction', () => {
  it('does not crash when onPress is not provided', async () => {
    const { findByText } = renderCard();
    expect(await findByText(/CATEGORIES.NEEDS/i)).toBeTruthy();
  });

  it('renders with onPress handler provided', async () => {
    const onPress = jest.fn();
    const { findByText } = renderCard({ onPress });
    expect(await findByText(/CATEGORIES.NEEDS/i)).toBeTruthy();
  });
});
