import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BudgetRulePresets } from '../../components/BudgetRulePresets';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock translation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('BudgetRulePresets', () => {
  const onSelect = jest.fn();

  beforeEach(() => {
    onSelect.mockClear();
  });

  it('renders all preset options', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <BudgetRulePresets selectedPresetKey="50-30-20" onSelect={onSelect} />
      </ThemeProvider>
    );

    // Initial render of ThemeProvider might be null (isLoading)
    await waitFor(() => {
        expect(getByText('50/30/20 (Default)')).toBeTruthy();
        expect(getByText('70/20/10 (Frugal)')).toBeTruthy();
        expect(getByText('60/20/20 (Balanced)')).toBeTruthy();
    });
  });

  it('calls onSelect with correct rule when a preset is tapped', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <BudgetRulePresets selectedPresetKey="50-30-20" onSelect={onSelect} />
      </ThemeProvider>
    );

    await waitFor(() => expect(getByTestId('preset-chip-70-20-10')).toBeTruthy());

    const frugalChip = getByTestId('preset-chip-70-20-10');
    fireEvent.press(frugalChip);

    expect(onSelect).toHaveBeenCalledWith({ needs: 70, wants: 20, savings: 10 });
  });

  it('shows a custom label when selectedPresetKey is "custom"', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <BudgetRulePresets selectedPresetKey="custom" onSelect={onSelect} />
      </ThemeProvider>
    );
    await waitFor(() => {
        expect(getByText(/settings.budgetRules.custom/i)).toBeTruthy();
    });
  });
});
