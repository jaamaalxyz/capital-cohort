import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoSharing from 'expo-sharing';
import * as ExpoFileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import SettingsScreen from '../../app/(tabs)/settings';
import { BudgetProvider } from '../../context/BudgetContext';
import { STORAGE_KEYS } from '../../constants/theme';

// Mock ThemeContext
jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: require('../../constants/theme').LIGHT_COLORS,
    isDark: false,
    themeMode: 'light',
    effectiveTheme: 'light',
    setThemeMode: jest.fn(),
  }),
}));

// Mock ThemePicker to avoid deeper render
jest.mock('../../components/ThemePicker', () => ({
  ThemePicker: () => null,
}));

// Mock ScreenContainer
jest.mock('../../components/ScreenContainer', () => ({
  ScreenContainer: ({ children }: { children: React.ReactNode }) => children,
}));

const renderSettings = () =>
  render(
    <BudgetProvider>
      <SettingsScreen />
    </BudgetProvider>
  );

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  await AsyncStorage.setItem(
    STORAGE_KEYS.ONBOARDING_COMPLETED,
    JSON.stringify(true)
  );
});

describe('Settings screen — export & backup', () => {
  it('renders Export CSV button', async () => {
    const { getByTestId } = renderSettings();
    await waitFor(() => expect(getByTestId('export-csv-btn')).toBeTruthy());
  });

  it('renders Export JSON button', async () => {
    const { getByTestId } = renderSettings();
    await waitFor(() => expect(getByTestId('export-json-btn')).toBeTruthy());
  });

  it('renders Import JSON button', async () => {
    const { getByTestId } = renderSettings();
    await waitFor(() => expect(getByTestId('import-json-btn')).toBeTruthy());
  });

  it('calls writeAsStringAsync and shareAsync when Export CSV is pressed', async () => {
    const { getByTestId } = renderSettings();
    const btn = await waitFor(() => getByTestId('export-csv-btn'));
    fireEvent.press(btn);
    await waitFor(() => {
      expect(ExpoFileSystem.writeAsStringAsync).toHaveBeenCalled();
      expect(ExpoSharing.shareAsync).toHaveBeenCalled();
    });
  });

  it('calls writeAsStringAsync and shareAsync when Export JSON is pressed', async () => {
    const { getByTestId } = renderSettings();
    const btn = await waitFor(() => getByTestId('export-json-btn'));
    fireEvent.press(btn);
    await waitFor(() => {
      expect(ExpoFileSystem.writeAsStringAsync).toHaveBeenCalled();
      expect(ExpoSharing.shareAsync).toHaveBeenCalled();
    });
  });

  it('calls getDocumentAsync when Import JSON is pressed', async () => {
    const { getByTestId } = renderSettings();
    const btn = await waitFor(() => getByTestId('import-json-btn'));
    fireEvent.press(btn);
    await waitFor(() => {
      expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
    });
  });
});
