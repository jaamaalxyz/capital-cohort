import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';
import { File } from 'expo-file-system';
import { BudgetProvider } from '../../context/BudgetContext';
import { ThemeProvider } from '../../context/ThemeContext';
import SettingsScreen from '../../app/(tabs)/settings';

const alertSpy = jest.spyOn(Alert, 'alert');

const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <BudgetProvider>{children}</BudgetProvider>
  </ThemeProvider>
);

const renderSettings = () =>
  render(
    <Providers>
      <SettingsScreen />
    </Providers>,
  );

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('Settings screen — functional tests', () => {
  it('renders correctly', async () => {
    const { findByText } = renderSettings();
    expect(await findByText('settings.title')).toBeTruthy();
  });

  it('updates income when amount is changed', async () => {
    const { findByText, getByPlaceholderText, findByDisplayValue } =
      renderSettings();
    await findByText('settings.title');

    // Initial value is '' since state.monthlyIncome is 0
    const input = getByPlaceholderText('amountInput.placeholder');
    fireEvent.changeText(input, '1000.50');
    // It might be formatted back to '1000.5' by the useEffect
    expect(await findByDisplayValue(/1000/)).toBeTruthy();
  });

  it('opens and filters currency picker', async () => {
    const { findByText, getByTestId, getAllByText } = renderSettings();
    await findByText('settings.title');

    const openBtn = getByTestId('currency-picker-btn');
    fireEvent.press(openBtn);

    const searchInput = getByTestId('currency-search-input');

    // Filter by 'USD'
    fireEvent.changeText(searchInput, 'USD');
    expect(getAllByText('USD').length).toBeGreaterThan(0);

    // Select USD
    fireEvent.press(getAllByText('USD')[0]);
    // Just verify the press happened
  });

  it('opens and filters language picker', async () => {
    const { findByText, getByTestId, getAllByText } = renderSettings();
    await findByText('settings.title');

    const openBtn = getByTestId('language-picker-btn');
    fireEvent.press(openBtn);

    const searchInput = getByTestId('language-search-input');

    // Filter by 'English'
    fireEvent.changeText(searchInput, 'English');
    expect(getAllByText('English').length).toBeGreaterThan(0);

    // Select language
    fireEvent.press(getAllByText('English')[0]);
  });

  it('handles location retrieval success', async () => {
    const { findByText, getByTestId } = renderSettings();
    await findByText('settings.title');
    fireEvent.press(getByTestId('location-btn'));

    expect(await findByText(/Dhaka/i)).toBeTruthy();
  });

  it('handles location retrieval permission denied', async () => {
    (
      Location.requestForegroundPermissionsAsync as jest.Mock
    ).mockResolvedValueOnce({ status: 'denied' });
    const { findByText, getByTestId } = renderSettings();
    await findByText('settings.title');
    fireEvent.press(getByTestId('location-btn'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Permission Denied',
        expect.any(String),
      );
    });
  });

  it('handles location retrieval error', async () => {
    // Silence expected console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValueOnce(
      new Error('GPS Failed'),
    );
    const { findByText, getByTestId } = renderSettings();
    await findByText('settings.title');
    fireEvent.press(getByTestId('location-btn'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error', expect.any(String));
    });
    
    consoleSpy.mockRestore();
  });

  it('exports CSV file', async () => {
    const { findByText, getByTestId } = renderSettings();
    await findByText('settings.title');
    const btn = getByTestId('export-csv-btn');
    fireEvent.press(btn);

    await waitFor(() => {
      expect(Sharing.shareAsync).toHaveBeenCalled();
    });
  });

  it('exports JSON file', async () => {
    const { findByText, getByTestId } = renderSettings();
    await findByText('settings.title');
    const btn = getByTestId('export-json-btn');
    fireEvent.press(btn);

    await waitFor(() => {
      expect(Sharing.shareAsync).toHaveBeenCalled();
    });
  });

  it('handles export failure', async () => {
    // Silence expected console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (Sharing.shareAsync as jest.Mock).mockRejectedValueOnce(
      new Error('Share failed'),
    );
    const { findByText, getByTestId } = renderSettings();
    await findByText('settings.title');
    const btn = getByTestId('export-csv-btn');
    fireEvent.press(btn);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Export Failed',
        expect.any(String),
      );
    });

    consoleSpy.mockRestore();
  });

  it('handles JSON import success', async () => {
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'mock-uri', name: 'backup.json' }],
    });
    // @ts-ignore
    File.prototype.text.mockResolvedValueOnce(
      JSON.stringify({
        expenses: [],
        monthlyIncome: 2000,
        currency: 'USD',
        version: 1,
      }),
    );

    const { findByText, getByTestId } = renderSettings();
    await findByText('settings.title');
    fireEvent.press(getByTestId('import-json-btn'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Restore Backup',
        expect.any(String),
        expect.any(Array),
      );
    });

    // Trigger the Restore button in the alert
    const restoreAction = alertSpy.mock.calls[0][2]?.find(
      (b) => b.text === 'Restore',
    );
    act(() => {
      restoreAction?.onPress?.();
    });
  });

  it('handles JSON import failure (invalid file)', async () => {
    // Silence expected console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'mock-uri', name: 'bad.json' }],
    });
    // @ts-ignore
    File.prototype.text.mockResolvedValueOnce('not-json');

    const { findByText, getByTestId } = renderSettings();
    await findByText('settings.title');
    fireEvent.press(getByTestId('import-json-btn'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Import Failed',
        expect.any(String),
      );
    });

    consoleSpy.mockRestore();
  });

  it('handles data reset', async () => {
    const { findByText, getByTestId } = renderSettings();
    await findByText('settings.title');
    fireEvent.press(getByTestId('reset-all-btn'));

    expect(alertSpy).toHaveBeenCalledWith(
      'settings.resetTitle',
      'settings.resetMessage',
      expect.any(Array),
    );

    const confirmAction = alertSpy.mock.calls[0][2]?.find(
      (b) => b.text === 'common.reset',
    );
    act(() => {
      confirmAction?.onPress?.();
    });

    expect(await AsyncStorage.getItem('@budget_income')).toBeNull();
  });
});
