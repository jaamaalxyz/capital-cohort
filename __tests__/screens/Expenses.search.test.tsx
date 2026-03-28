import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetProvider } from '../../context/BudgetContext';
import { ThemeProvider } from '../../context/ThemeContext';
import ExpensesScreen from '../../app/(tabs)/expenses';
import { Expense } from '../../types';

const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

const mockExpenses: Expense[] = [
  {
    id: '1',
    amount: 1000,
    description: 'Coffee',
    category: 'wants',
    date: `${currentMonth}-15`,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    amount: 5000,
    description: 'Internet',
    category: 'needs',
    date: `${currentMonth}-10`,
    createdAt: new Date().toISOString(),
  },
];

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

beforeEach(async () => {
  await AsyncStorage.clear();
  await AsyncStorage.setItem('@budget_expenses', JSON.stringify(mockExpenses));
  jest.clearAllMocks();
});

describe('Expenses screen — search and filtering', () => {
  it('filters list when search query is typed', async () => {
    const { findByPlaceholderText, queryByText, findByText } = renderExpenses();
    
    // Initial state: both expenses visible
    expect(await findByText('Coffee')).toBeTruthy();
    expect(await findByText('Internet')).toBeTruthy();

    const searchInput = await findByPlaceholderText(/search/i);
    
    // Type 'internet'
    fireEvent.changeText(searchInput, 'internet');
    
    // Wait for the list to filter (using wait for because of possible debounce or sync state update)
    await waitFor(() => {
      expect(queryByText('Coffee')).toBeNull();
      expect(queryByText('Internet')).toBeTruthy();
    });
  });

  it('filters list when category is toggled', async () => {
    const { findByText, queryByText, findByTestId } = renderExpenses();
    
    expect(await findByText('Coffee')).toBeTruthy();
    expect(await findByText('Internet')).toBeTruthy();

    // Toggle 'needs'
    const needsChip = await findByTestId('filter-chip-needs');
    fireEvent.press(needsChip);
    
    await waitFor(() => {
      expect(queryByText('Coffee')).toBeNull();
      expect(queryByText('Internet')).toBeTruthy();
    });
  });

  it('shows empty search state when no results found', async () => {
    const { findByPlaceholderText, findByText } = renderExpenses();
    
    const searchInput = await findByPlaceholderText(/searchPlaceholder/i);
    fireEvent.changeText(searchInput, 'non-existent');
    
    expect(await findByText(/expenses.noMatches/i)).toBeTruthy();
  });
});
