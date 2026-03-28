import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SettingsScreen from '../../app/(tabs)/settings';
import { BudgetProvider } from '../../context/BudgetContext';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock translation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Settings — Budget Rules', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  const AppWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>
        <BudgetProvider>
            {children}
        </BudgetProvider>
    </ThemeProvider>
  );

  it('renders the budget rules section', async () => {
    const { getByText } = render(
      <AppWrapper>
        <SettingsScreen />
      </AppWrapper>
    );

    await waitFor(() => {
        expect(getByText(/settings.budgetRules.title/i)).toBeTruthy();
    });
  });

  it('shows preset chips and correctly selects them', async () => {
    const { getByTestId, getByText } = render(
      <AppWrapper>
        <SettingsScreen />
      </AppWrapper>
    );

    // Initial state check
    await waitFor(() => {
        expect(getByText('50/30/20 (Default)')).toBeTruthy();
    });

    // Selecting a different preset
    const balancedChip = getByTestId('preset-chip-60-20-20');
    fireEvent.press(balancedChip);

    // This should change the slider values (we'll check them if we can find labels or by testID)
    // For now we'll verify the "needs" input (or slider) value is updated to 60.
    await waitFor(() => {
        expect(getByTestId('slider-value-needs').props.children).toBe('60%');
    });
  });

  it('save button persists the new budget rule', async () => {
    const { getByTestId, getByText } = render(
      <AppWrapper>
        <SettingsScreen />
      </AppWrapper>
    );

    await waitFor(() => expect(getByTestId('preset-chip-70-20-10')).toBeTruthy());

    // Switch to Frugal
    fireEvent.press(getByTestId('preset-chip-70-20-10'));
    
    // Press Save (if implement a save button, otherwise it's auto-save but the plan suggests a save/update interaction for custom rules usually, or just auto-save)
    // Let's assume auto-save for simplicity of integration unless Plan 06 mentions a save button.
    // Plan 06 says: "save button persists rule and updates context" (line 354)
    // So I should look for a "Save" button or "Update" button in my implementation.
    
    const saveButton = getByTestId('save-budget-rule-btn');
    fireEvent.press(saveButton);

    // Verify it's in AsyncStorage
    await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            '@budget_rule',
            expect.stringContaining('"needs":70')
        );
    });
  });
});
