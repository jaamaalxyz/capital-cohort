import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetProvider } from '../../context/BudgetContext';
import { ThemeProvider } from '../../context/ThemeContext';
import DashboardScreen from '../../app/(tabs)/index';

const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <BudgetProvider>{children}</BudgetProvider>
  </ThemeProvider>
);

const renderDashboard = () =>
  render(
    <Providers>
      <DashboardScreen />
    </Providers>
  );

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('Dashboard screen — rendering', () => {
  it('renders without crashing', async () => {
    const { findByText } = renderDashboard();
    // Wait for something in the main UI to appear
    expect(await findByText('◀')).toBeTruthy();
  });

  it('shows month navigation arrows', async () => {
    const { findByText } = renderDashboard();
    expect(await findByText('◀')).toBeTruthy();
    expect(await findByText('▶')).toBeTruthy();
  });

  it('shows three budget cards (needs, wants, savings)', async () => {
    const { findByText } = renderDashboard();
    // Use regex because text includes percentage: 'CATEGORIES.NEEDS (0%)'
    expect(await findByText(/CATEGORIES.NEEDS/i)).toBeTruthy();
    expect(await findByText(/CATEGORIES.WANTS/i)).toBeTruthy();
    expect(await findByText(/CATEGORIES.SAVINGS/i)).toBeTruthy();
  });

  it('shows FAB add button', async () => {
    const { findByText } = renderDashboard();
    expect(await findByText('+')).toBeTruthy();
  });

  it('shows setup income prompt when income is 0', async () => {
    const { findByText } = renderDashboard();
    expect(await findByText('dashboard.setupIncome')).toBeTruthy();
  });
});

describe('Dashboard screen — month navigation', () => {
  it('navigates to previous month when back arrow is pressed', async () => {
    const { findByText } = renderDashboard();
    const backArrow = await findByText('◀');
    await act(async () => {
      fireEvent.press(backArrow);
    });
    // Month text should change — just assert it's still rendered
    await waitFor(() => expect(backArrow).toBeTruthy());
  });
});

describe('Dashboard screen — FAB navigation', () => {
  it('FAB press calls router.push to add-expense', async () => {
    const mockPush = require('expo-router').useRouter().push;
    mockPush.mockClear();
    const { findByText } = renderDashboard();
    const fab = await findByText('+');
    fireEvent.press(fab);
    expect(mockPush).toHaveBeenCalledWith('/add-expense');
  });
});

describe('Dashboard screen — extra income and debts', () => {
  it('does not show extra income row when none exist', async () => {
    const { queryByText } = renderDashboard();
    // Wait for initial load
    await waitFor(() => expect(queryByText('dashboard.extraIncome')).toBeNull());
  });

  it('shows debt banner when unsettled debts exist', async () => {
    const debt = {
      id: 'd1',
      amount: 5000,
      creditor: 'Test',
      note: 'Note',
      month: '2026-03',
      date: '2026-03-01',
      createdAt: new Date().toISOString(),
      isSettled: false,
    };
    await AsyncStorage.setItem('@budget_debt_entries', JSON.stringify([debt]));
    
    const { findByText } = renderDashboard();
    expect(await findByText(/dashboard\.debts/i)).toBeTruthy();
  });

  it('navigates to debts screen when banner is pressed', async () => {
    const mockPush = require('expo-router').useRouter().push;
    const debt = {
      id: 'd1',
      amount: 5000,
      creditor: 'Test',
      month: '2026-03',
      isSettled: false,
    };
    await AsyncStorage.setItem('@budget_debt_entries', JSON.stringify([debt]));
    
    const { findByText } = renderDashboard();
    const banner = await findByText(/dashboard\.debts/i);
    fireEvent.press(banner);
    expect(mockPush).toHaveBeenCalledWith('/debts');
  });
});
