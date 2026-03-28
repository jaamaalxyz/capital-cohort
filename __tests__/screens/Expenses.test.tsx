import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetProvider } from '../../context/BudgetContext';
import { ThemeProvider } from '../../context/ThemeContext';
import ExpensesScreen from '../../app/(tabs)/expenses';
import { Expense } from '../../types';
import { getCurrentMonth, formatMonth } from '../../utils/formatters';

const currentMonth = getCurrentMonth();

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

const makeExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: Math.random().toString(),
  amount: 5000,
  description: 'Test Expense',
  category: 'needs',
  date: `${currentMonth}-15`,
  createdAt: new Date().toISOString(),
  ...overrides,
});

const mockExpenses: Expense[] = [
  makeExpense({ id: '1', description: 'Coffee', category: 'wants', amount: 1000, date: `${currentMonth}-15` }),
  makeExpense({ id: '2', description: 'Internet', category: 'needs', amount: 5000, date: `${currentMonth}-10` }),
  makeExpense({ id: '3', description: 'Rent', category: 'needs', amount: 100000, date: `${currentMonth}-01` }),
  makeExpense({ id: '4', description: 'Savings Deposit', category: 'savings', amount: 20000, date: `${currentMonth}-20` }),
];

beforeEach(async () => {
  await AsyncStorage.clear();
  await AsyncStorage.setItem('@budget_expenses', JSON.stringify(mockExpenses));
});

describe('Expenses screen', () => {
  describe('Rendering and Setup', () => {
    it('renders without crashing', async () => {
      const { toJSON } = renderExpenses();
      await waitFor(() => expect(toJSON()).not.toBeNull());
    });

    it('shows current month title correctly', async () => {
      const { findByText } = renderExpenses();
      const formatted = formatMonth(currentMonth);
      expect(await findByText(new RegExp(formatted, 'i'))).toBeTruthy();
    });

    it('shows the initial list of expenses', async () => {
      const { findByText } = renderExpenses();
      expect(await findByText('Coffee')).toBeTruthy();
      expect(await findByText('Internet')).toBeTruthy();
      expect(await findByText('Rent')).toBeTruthy();
    });
  });

  describe('Search Functionality', () => {
    it('filters list when search query is typed', async () => {
      const { findByPlaceholderText, queryByText, findByText } = renderExpenses();
      
      const searchInput = await findByPlaceholderText(/search/i);
      fireEvent.changeText(searchInput, 'internet');
      
      await waitFor(() => {
        expect(queryByText('Coffee')).toBeNull();
        expect(queryByText('Internet')).toBeTruthy();
      });
    });

    it('shows empty search state when no results found', async () => {
      const { findByPlaceholderText, findByText } = renderExpenses();
      
      const searchInput = await findByPlaceholderText(/search/i);
      fireEvent.changeText(searchInput, 'non-existent-item');
      
      expect(await findByText(/expenses.noMatches/i)).toBeTruthy();
    });

    it('clears search results when clearing search input via value change', async () => {
      const { findByPlaceholderText, findByText, queryByText } = renderExpenses();
      
      const searchInput = await findByPlaceholderText(/search/i);
      
      // Type 'coffee'
      fireEvent.changeText(searchInput, 'coffee');
      await waitFor(() => expect(queryByText('Internet')).toBeNull());
      
      // Clear input
      fireEvent.changeText(searchInput, '');
      await waitFor(() => expect(queryByText('Internet')).toBeTruthy());
    });
  });

  describe('Category Filtering', () => {
    it('filters list when category is toggled', async () => {
      const { findByText, queryByText, findByTestId } = renderExpenses();
      
      // Toggle 'needs'
      const needsChip = await findByTestId('filter-chip-needs');
      fireEvent.press(needsChip);
      
      await waitFor(() => {
        expect(queryByText('Coffee')).toBeNull(); // Coffee is 'wants'
        expect(queryByText('Internet')).toBeTruthy(); // Internet is 'needs'
      });
    });

    it('shows multiple categories when multiple chips are active', async () => {
      const { queryByText, findByTestId } = renderExpenses();
      
      // Activate 'needs' and 'wants'
      const needsChip = await findByTestId('filter-chip-needs');
      const wantsChip = await findByTestId('filter-chip-wants');
      fireEvent.press(needsChip);
      fireEvent.press(wantsChip);
      
      await waitFor(() => {
        expect(queryByText('Internet')).toBeTruthy(); // needs
        expect(queryByText('Coffee')).toBeTruthy();   // wants
        expect(queryByText('Savings Deposit')).toBeNull(); // savings
      });
    });
  });

  describe('Clear All Filters', () => {
    it('shows "Clear Filters" button only when filters are active', async () => {
      const { queryByText, findByTestId, findByText } = renderExpenses();
      
      // Clear button should not be part of original render (no filters active)
      expect(queryByText(/clearFilters/i)).toBeNull();
      
      // Apply a filter
      const needsChip = await findByTestId('filter-chip-needs');
      fireEvent.press(needsChip);
      
      expect(await findByText(/clearFilters/i)).toBeTruthy();
    });

    it('clears all filters when "Clear Filters" is pressed', async () => {
      const { findByPlaceholderText, findByTestId, findByText, queryByText } = renderExpenses();
      
      // Apply search and category filters
      const searchInput = await findByPlaceholderText(/search/i);
      fireEvent.changeText(searchInput, 'Int');
      const wantsChip = await findByTestId('filter-chip-wants');
      fireEvent.press(wantsChip);
      
      // Initially should show nothing (No 'Int' matches 'Wants')
      await waitFor(() => expect(queryByText('Internet')).toBeNull());
      
      // Press Clear All
      const clearBtn = await findByTestId('clear-filters-btn');
      fireEvent.press(clearBtn);
      
      // All items should return
      await waitFor(() => {
         expect(queryByText('Coffee')).toBeTruthy();
         expect(queryByText('Internet')).toBeTruthy();
         expect(queryByText('Rent')).toBeTruthy();
      });
    });
  });

  describe('Sorting Integration', () => {
    it('sorts expenses by amount: Highest Amount (desc)', async () => {
      const { findByTestId, queryAllByText } = renderExpenses();
      
      // Open sort picker
      const sortBtn = await findByTestId('sort-btn');
      fireEvent.press(sortBtn);
      
      // Select Highest Amount
      const option = await findByTestId('sort-option-amount_desc');
      fireEvent.press(option);
      
      await waitFor(() => {
        const items = queryAllByText(/Coffee|Internet|Rent|Savings Deposit/i);
        // Order should be: Rent ($1000), Savings Deposit ($200), Internet ($50), Coffee ($10)
        expect(items[0].props.children).toBe('Rent');
        expect(items[1].props.children).toBe('Savings Deposit');
        expect(items[2].props.children).toBe('Internet');
        expect(items[3].props.children).toBe('Coffee');
      });
    });

    it('sorts expenses by amount: Lowest Amount (asc)', async () => {
      const { findByTestId, queryAllByText } = renderExpenses();
      
      const sortBtn = await findByTestId('sort-btn');
      fireEvent.press(sortBtn);
      const option = await findByTestId('sort-option-amount_asc');
      fireEvent.press(option);
      
      await waitFor(() => {
        const items = queryAllByText(/Coffee|Internet|Rent|Savings Deposit/i);
        // Order should be: Coffee ($10), Internet ($50), Savings Deposit ($200), Rent ($1000)
        expect(items[0].props.children).toBe('Coffee');
        expect(items[1].props.children).toBe('Internet');
        expect(items[2].props.children).toBe('Savings Deposit');
        expect(items[3].props.children).toBe('Rent');
      });
    });

    it('sorts expenses by date: Oldest First (asc)', async () => {
      const { findByTestId, queryAllByText } = renderExpenses();
      
      const sortBtn = await findByTestId('sort-btn');
      fireEvent.press(sortBtn);
      const option = await findByTestId('sort-option-date_asc');
      fireEvent.press(option);
      
      await waitFor(() => {
        const items = queryAllByText(/Coffee|Internet|Rent|Savings Deposit/i);
        // Date order: Rent (01), Internet (10), Coffee (15), Savings (20)
        expect(items[0].props.children).toBe('Rent');
        expect(items[1].props.children).toBe('Internet');
        expect(items[2].props.children).toBe('Coffee');
        expect(items[3].props.children).toBe('Savings Deposit');
      });
    });
  });
});
