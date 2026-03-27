import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RecurringScreen from '../../app/recurring';
import { BudgetProvider } from '../../context/BudgetContext';
import { STORAGE_KEYS } from '../../constants/theme';
import { RecurringTemplate } from '../../types';

jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: require('../../constants/theme').LIGHT_COLORS,
    isDark: false,
  }),
}));

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));

const makeTemplate = (overrides: Partial<RecurringTemplate> = {}): RecurringTemplate => ({
  id: 'tmpl-1',
  amount: 50000,
  description: 'Rent',
  category: 'needs',
  dayOfMonth: 1,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const renderRecurring = () =>
  render(
    <BudgetProvider>
      <RecurringScreen />
    </BudgetProvider>
  );

beforeEach(async () => {
  await AsyncStorage.clear();
  mockPush.mockClear();
  await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, JSON.stringify(true));
});

describe('Recurring screen', () => {
  it('renders empty state when no templates exist', async () => {
    const { getByTestId } = renderRecurring();
    await waitFor(() => expect(getByTestId('recurring-empty-state')).toBeTruthy());
  });

  it('renders list of templates when they exist', async () => {
    const templates = [makeTemplate()];
    await AsyncStorage.setItem(STORAGE_KEYS.RECURRING_TEMPLATES, JSON.stringify(templates));
    const { getByTestId } = renderRecurring();
    await waitFor(() => expect(getByTestId('recurring-list')).toBeTruthy());
  });

  it('navigates to add-recurring modal on FAB press', async () => {
    const { getByTestId } = renderRecurring();
    const fab = await waitFor(() => getByTestId('recurring-fab'));
    fireEvent.press(fab);
    expect(mockPush).toHaveBeenCalledWith('/add-recurring');
  });

  it('renders the screen heading', async () => {
    const { getByText } = renderRecurring();
    await waitFor(() => expect(getByText('Recurring')).toBeTruthy());
  });
});
