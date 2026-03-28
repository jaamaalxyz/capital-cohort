import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetProvider } from '../../context/BudgetContext';
import { ThemeProvider } from '../../context/ThemeContext';
import AddExpenseScreen from '../../app/add-expense';
import { getCurrentMonth } from '../../utils/formatters';

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
    const { findByText, debug } = renderAddExpense();
    debug();
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

describe('AddExpense screen — overflow detection', () => {
  it('shows CategoryOverflowModal when category limit is exceeded', async () => {
    // Setup: Income 1000. 
    // Needs allocation (50%) = 500.
    // Existing needs expense = 450.
    // New expense = 100. Total = 550.
    const income = 100000; // 1000.00
    const currentMonth = getCurrentMonth();
    const existingExpense = {
      id: 'e1',
      amount: 45000,
      description: 'Rent',
      category: 'needs',
      date: `${currentMonth}-01`,
      createdAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem('@budget_income', income.toString());
    await AsyncStorage.setItem('@budget_expenses', JSON.stringify([existingExpense]));
    
    const { findByText, findByPlaceholderText, findByTestId, getByTestId } = renderAddExpense();
    
    // Wait for internal load (Category picker means it's ready)
    await findByText('CATEGORIES.NEEDS');
    
    // Fill form
    const amountInput = await findByPlaceholderText('amountInput.placeholder');
    fireEvent.changeText(amountInput, '100'); 
    
    const descInput = await findByPlaceholderText('addExpense.descriptionPlaceholder');
    fireEvent.changeText(descInput, 'Big Groceries');
    
    const needsBtn = getByTestId('category-picker-option-needs');
    fireEvent.press(needsBtn);
    
    const addBtn = await findByText('addExpense.addButton');
    fireEvent.press(addBtn);
    
    // Should show overflow modal
    expect(await findByTestId('category-overflow-modal')).toBeTruthy();
  });

  it('shows IncomeOverflowModal when total income is exceeded', async () => {
    // Setup: Income 1000.
    // Existing expenses = 950. Adding 100 => 1050 (Overflow 50)
    const income = 100000;
    const currentMonth = getCurrentMonth();
    const existingExpense = {
      id: 'e1',
      amount: 95000,
      description: 'Big Bill',
      category: 'needs',
      date: `${currentMonth}-01`,
      createdAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem('@budget_income', income.toString());
    await AsyncStorage.setItem('@budget_expenses', JSON.stringify([existingExpense]));
    
    const { findByText, findByPlaceholderText, findByTestId, getByTestId } = renderAddExpense();
    
    // Wait for load
    await findByText('CATEGORIES.NEEDS');
    
    const amountInput = await findByPlaceholderText('amountInput.placeholder');
    fireEvent.changeText(amountInput, '1000'); // 1000.00 = 100,000 cents. Definitely overflow.
    
    const descInput = await findByPlaceholderText('addExpense.descriptionPlaceholder');
    fireEvent.changeText(descInput, 'Massive Shopping');
    
    // Select savings instead of needs to vary the test
    const savingsBtn = getByTestId('category-picker-option-savings');
    fireEvent.press(savingsBtn);
    
    const addBtn = await findByText('addExpense.addButton');
    fireEvent.press(addBtn);
    
    // Should show overflow modal (i18n mock returns the key)
    expect(await findByText('overflow.incomeTitle')).toBeTruthy();
  });
});
