import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetProvider } from '../../context/BudgetContext';
import { ThemeProvider } from '../../context/ThemeContext';
import AddExpenseScreen from '../../app/add-expense';

const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <BudgetProvider>{children}</BudgetProvider>
  </ThemeProvider>
);

const renderAddExpense = () =>
  render(
    <Providers>
      <AddExpenseScreen />
    </Providers>
  );

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('AddExpense screen — rendering', () => {
  it('renders without crashing', async () => {
    const { findByText } = renderAddExpense();
    expect(await findByText('addExpense.title')).toBeTruthy();
  });

  it('shows screen title', async () => {
    const { findByText } = renderAddExpense();
    expect(await findByText('addExpense.title')).toBeTruthy();
  });

  it('shows amount field label', async () => {
    const { findByText } = renderAddExpense();
    expect(await findByText('addExpense.amount')).toBeTruthy();
  });

  it('shows description field label', async () => {
    const { findByText } = renderAddExpense();
    expect(await findByText('addExpense.description')).toBeTruthy();
  });

  it('shows category field label', async () => {
    const { findByText } = renderAddExpense();
    expect(await findByText('addExpense.category')).toBeTruthy();
  });

  it('shows add button', async () => {
    const { findByText } = renderAddExpense();
    expect(await findByText('addExpense.addButton')).toBeTruthy();
  });

  it('shows close button', async () => {
    const { findByText } = renderAddExpense();
    expect(await findByText('✕')).toBeTruthy();
  });

  it('shows category picker with all three options', async () => {
    const { findByText } = renderAddExpense();
    // i18n mock returns key: t('categories.needs').toUpperCase() = 'CATEGORIES.NEEDS'
    expect(await findByText('CATEGORIES.NEEDS')).toBeTruthy();
    expect(await findByText('CATEGORIES.WANTS')).toBeTruthy();
    expect(await findByText('CATEGORIES.SAVINGS')).toBeTruthy();
  });
});

describe('AddExpense screen — validation', () => {
  it('shows amount error when submitted with no amount', async () => {
    const { findByText } = renderAddExpense();
    const addBtn = await findByText('addExpense.addButton');
    fireEvent.press(addBtn);
    expect(await findByText('addExpense.invalidAmount')).toBeTruthy();
  });
});

describe('AddExpense screen — close button', () => {
  it('calls router.back when close pressed with no data entered', async () => {
    const mockBack = require('expo-router').useRouter().back;
    mockBack.mockClear();
    const { findByText } = renderAddExpense();
    fireEvent.press(await findByText('✕'));
    expect(mockBack).toHaveBeenCalled();
  });
});
