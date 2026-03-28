import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock translation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

class ThrowingClass extends React.Component<{ shouldThrow: boolean }> {
  render() {
    if (this.props.shouldThrow) throw new Error('Render error');
    return <Text>No Error</Text>;
  }
}

describe('Simple ErrorBoundary Test', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('catches render error and shows fallback', async () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider>
        <ErrorBoundary>
          <ThrowingClass shouldThrow={true} />
        </ErrorBoundary>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(queryByTestId('error-fallback')).toBeTruthy();
    });
  });
});
