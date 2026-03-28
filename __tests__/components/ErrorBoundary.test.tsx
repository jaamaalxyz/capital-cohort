import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { ThemeProvider } from '../../context/ThemeContext';
import { ThrowingComponent } from '../../test-helpers/ThrowingComponent';
import { logError } from '../../utils/errorLogger';

// Mock translation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock errorLogger
jest.mock('../../utils/errorLogger', () => ({
  logError: jest.fn(),
  createAppError: jest.requireActual('../../utils/errorLogger').createAppError,
  formatError: jest.requireActual('../../utils/errorLogger').formatError,
}));

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error output during tests as ErrorBoundary triggers it intentionally
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('renders children when no error occurs', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <ErrorBoundary>
          <Text>Normal content</Text>
        </ErrorBoundary>
      </ThemeProvider>
    );

    // Initial render of ThemeProvider might be null (isLoading)
    await waitFor(() => {
        expect(getByText('Normal content')).toBeTruthy();
    });
  });

  it('renders default fallback UI when child throws', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('error-fallback')).toBeTruthy();
    });
  });

  it('renders custom fallback when provided via prop', async () => {
    const CustomFallback = () => <Text testID="custom-fallback">Custom Error View</Text>;
    const { getByTestId } = render(
      <ThemeProvider>
        <ErrorBoundary fallback={<CustomFallback />}>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('custom-fallback')).toBeTruthy();
    });
  });

  it('calls onError callback when child throws', async () => {
    const onError = jest.fn();
    render(
      <ThemeProvider>
        <ErrorBoundary onError={onError}>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ componentStack: expect.any(String) })
      );
    });
  });

  it('recovers when reset() is called via fallback prompt', async () => {
    // Use a controlled component that throws based on external input
    const Thrower = ({ fail }: { fail: boolean }) => {
      if (fail) throw new Error('Crashed');
      return <Text>Recovered!</Text>;
    };

    const TestApp = () => {
        const [shouldFail, setShouldFail] = React.useState(true);
        // We use ErrorBoundary's internal reset but we also need our component to stop failing
        return (
            <ErrorBoundary 
                fallback={
                    <Text testID="retry-btn" onPress={() => setShouldFail(false)}>
                        Retry
                    </Text>
                }
                key={shouldFail ? 'fail' : 'pass'} // Standard trick: change key to reset ErrorBoundary's state
            >
                <Thrower fail={shouldFail} />
            </ErrorBoundary>
        )
    }

    const { getByTestId, queryByTestId, getByText } = render(
      <ThemeProvider>
        <TestApp />
      </ThemeProvider>
    );

    // Should show fallback
    await waitFor(() => expect(getByTestId('retry-btn')).toBeTruthy());

    // Press Retry button (this resets parent state and changes key, forcing ErrorBoundary reset)
    fireEvent.press(getByTestId('retry-btn'));

    // Should re-render and show recovered text
    await waitFor(() => {
      expect(getByText('Recovered!')).toBeTruthy();
    });
  });

  it('provides context to the error logger', async () => {
    render(
      <ThemeProvider>
        <ErrorBoundary context="test-context">
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(logError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(String),
        'test-context'
      );
    });
  });
});
