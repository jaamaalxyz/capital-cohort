import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { BudgetProvider } from '../../context/BudgetContext';
import { ThemeProvider } from '../../context/ThemeContext';
import AddRecurringScreen from '../../app/add-recurring';

// Mock Alert
jest.spyOn(Alert, 'alert');

const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <BudgetProvider>{children}</BudgetProvider>
  </ThemeProvider>
);

const renderAddRecurring = () =>
  render(
    <Providers>
      <AddRecurringScreen />
    </Providers>
  );

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('AddRecurring screen — rendering', () => {
  it('renders without crashing', async () => {
    const { findByTestId } = renderAddRecurring();
    expect(await findByTestId('recurring-heading')).toBeTruthy();
  });
});

describe('AddRecurring screen — save logic', () => {
  it('triggers validation when save is pressed with no amount', async () => {
    const { findByTestId } = renderAddRecurring();
    const saveBtn = await findByTestId('recurring-save-btn');
    fireEvent.press(saveBtn);
    expect(Alert.alert).toHaveBeenCalled();
  });
});
