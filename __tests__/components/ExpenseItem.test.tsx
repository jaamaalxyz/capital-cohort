import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ExpenseItem } from '../../components/ExpenseItem';
import { ThemeProvider } from '../../context/ThemeContext';
import { Expense } from '../../types';

const makeExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: 'exp-1',
  amount: 5050,
  description: 'Groceries',
  category: 'needs',
  date: '2024-01-15',
  createdAt: new Date().toISOString(),
  ...overrides,
});

const renderItem = (
  expense: Expense = makeExpense(),
  onDelete?: (id: string) => void
) =>
  render(
    <ThemeProvider>
      <ExpenseItem expense={expense} currencySymbol="$" onDelete={onDelete} />
    </ThemeProvider>
  );

describe('ExpenseItem — rendering', () => {
  it('renders without crashing', async () => {
    const { findByText } = renderItem();
    expect(await findByText('Groceries')).toBeTruthy();
  });

  it('displays description', async () => {
    const { findByText } = renderItem(makeExpense({ description: 'Netflix' }));
    expect(await findByText('Netflix')).toBeTruthy();
  });

  it('displays formatted amount', async () => {
    const { findByText } = renderItem(makeExpense({ amount: 5050 }));
    expect(await findByText('$50.50')).toBeTruthy();
  });

  it('renders for "wants" category', async () => {
    const { findByText } = renderItem(makeExpense({ category: 'wants', description: 'Streaming' }));
    expect(await findByText('Streaming')).toBeTruthy();
  });

  it('renders for "savings" category', async () => {
    const { findByText } = renderItem(makeExpense({ category: 'savings', description: 'Deposit' }));
    expect(await findByText('Deposit')).toBeTruthy();
  });
});

describe('ExpenseItem — recurring badge', () => {
  it('shows recurring badge when recurringTemplateId is set', async () => {
    const { findByTestId } = renderItem(
      makeExpense({ recurringTemplateId: 'tmpl-1' })
    );
    expect(await findByTestId('recurring-badge')).toBeTruthy();
  });

  it('does not show recurring badge when recurringTemplateId is absent', async () => {
    const { findByText, queryByTestId } = renderItem(makeExpense());
    await findByText('Groceries'); // wait for render
    expect(queryByTestId('recurring-badge')).toBeNull();
  });
});

describe('ExpenseItem — delete button', () => {
  it('shows delete button when onDelete is provided', async () => {
    const { findByText } = renderItem(makeExpense(), jest.fn());
    expect(await findByText('×')).toBeTruthy();
  });

  it('does not show delete button when onDelete is not provided', async () => {
    const { findByText, queryByText } = renderItem(makeExpense());
    await findByText('Groceries'); // wait for render
    expect(queryByText('×')).toBeNull();
  });

  it('calls onDelete with expense id when delete button is pressed', async () => {
    const onDelete = jest.fn();
    const expense = makeExpense({ id: 'del-123' });
    const { findByText } = renderItem(expense, onDelete);
    fireEvent.press(await findByText('×'));
    expect(onDelete).toHaveBeenCalledWith('del-123');
  });
});
