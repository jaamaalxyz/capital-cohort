import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetProvider } from '../../context/BudgetContext';
import { ThemeProvider } from '../../context/ThemeContext';
import DebtsScreen from '../../app/debts';

const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <BudgetProvider>{children}</BudgetProvider>
  </ThemeProvider>
);

const renderDebts = () =>
  render(
    <Providers>
      <DebtsScreen />
    </Providers>
  );

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('Debts screen', () => {
  it('renders without crashing and shows empty state', async () => {
    const { findByText } = renderDebts();
    expect(await findByText(/debts\.noDebts/i)).toBeTruthy();
  });

  it('renders debt entries and handles settlement', async () => {
    const debt = {
      id: 'd1',
      amount: 5000,
      creditor: 'Test Creditor',
      note: 'Test Note',
      month: '2026-03',
      date: '2026-03-01',
      createdAt: new Date().toISOString(),
      isSettled: false,
    };
    await AsyncStorage.setItem('@budget_currency', 'USD');
    await AsyncStorage.setItem('@budget_debt_entries', JSON.stringify([debt]));

    const { findByText, findByTestId } = renderDebts();
    
    // Check creditor name
    expect(await findByText('Test Creditor')).toBeTruthy();
    
    // Check amount (formatted) — use testID to be very stable
    expect(await findByTestId('debt-amount')).toBeTruthy();
    
    // Press Mark Settled
    const settleBtn = await findByText('debts.markSettled');
    fireEvent.press(settleBtn);
    
    // Button should disappear or change to "Settled"
    await waitFor(async () => {
      expect(await findByText('debts.settled')).toBeTruthy();
    });
  });
});
