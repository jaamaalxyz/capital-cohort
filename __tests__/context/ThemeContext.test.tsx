import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';

const ThemeConsumer = () => {
  const { themeMode, effectiveTheme, isDark, colors } = useTheme();
  return (
    <>
      <Text testID="theme-mode">{themeMode}</Text>
      <Text testID="effective-theme">{effectiveTheme}</Text>
      <Text testID="is-dark">{String(isDark)}</Text>
      <Text testID="has-colors">{colors ? 'yes' : 'no'}</Text>
    </>
  );
};

const renderWithProvider = () =>
  render(
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>,
  );

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('ThemeProvider — initial state', () => {
  it('renders children after loading', async () => {
    const { getByTestId } = renderWithProvider();
    await waitFor(() => expect(getByTestId('theme-mode')).toBeTruthy());
  });

  it('defaults to "auto" mode when no saved theme', async () => {
    const { getByTestId } = renderWithProvider();
    await waitFor(() =>
      expect(getByTestId('theme-mode').props.children).toBe('auto'),
    );
  });

  it('provides a colors object', async () => {
    const { getByTestId } = renderWithProvider();
    await waitFor(() =>
      expect(getByTestId('has-colors').props.children).toBe('yes'),
    );
  });

  it('effective theme is light or dark string', async () => {
    const { getByTestId } = renderWithProvider();
    await waitFor(() => {
      const val = getByTestId('effective-theme').props.children;
      expect(['light', 'dark']).toContain(val);
    });
  });
});

describe('ThemeProvider — saved theme', () => {
  it('loads saved "dark" theme from storage', async () => {
    await AsyncStorage.setItem('@budget_theme', 'dark');
    const { getByTestId } = renderWithProvider();
    await waitFor(() =>
      expect(getByTestId('theme-mode').props.children).toBe('dark'),
    );
  });

  it('loads saved "light" theme from storage', async () => {
    await AsyncStorage.setItem('@budget_theme', 'light');
    const { getByTestId } = renderWithProvider();
    await waitFor(() =>
      expect(getByTestId('theme-mode').props.children).toBe('light'),
    );
  });
});

describe('ThemeProvider — setThemeMode', () => {
  it('updates themeMode and persists to storage', async () => {
    let themeCtx: ReturnType<typeof useTheme> | null = null;

    const Capture = () => {
      themeCtx = useTheme();
      return <Text testID="mode">{themeCtx.themeMode}</Text>;
    };

    const { getByTestId } = render(
      <ThemeProvider>
        <Capture />
      </ThemeProvider>,
    );

    await waitFor(() => expect(getByTestId('mode')).toBeTruthy());

    await act(async () => {
      await themeCtx!.setThemeMode('dark');
    });

    await waitFor(() =>
      expect(getByTestId('mode').props.children).toBe('dark'),
    );

    const stored = await AsyncStorage.getItem('@budget_theme');
    expect(stored).toBe('dark');
  });
});

describe('useTheme', () => {
  it('throws when used outside ThemeProvider', () => {
    const BadConsumer = () => {
      useTheme();
      return null;
    };
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<BadConsumer />)).toThrow(
      'useTheme must be used within a ThemeProvider',
    );
    jest.restoreAllMocks();
  });
});
