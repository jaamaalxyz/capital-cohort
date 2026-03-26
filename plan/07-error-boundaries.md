# Plan 07 — Error Boundaries & App Resilience

**Priority:** P1
**Type:** Infrastructure / Reliability
**Effort:** 1 day
**Depends on:** Plan 00 (test infrastructure)

---

## Overview

The app has no error boundaries. If any component throws during render, the entire app crashes with a blank screen. This plan adds:
- Root `ErrorBoundary` class component wrapping the entire app
- Screen-level boundaries for each tab (isolate failures to one tab)
- AsyncStorage failure recovery (corrupt data gracefully reset)
- Error logging utility (structured console output, extensible to remote logging)
- User-facing "Something went wrong" fallback screen with recovery action

---

## Dependencies to Install

```bash
# No new dependencies — React Error Boundaries are built-in class components
# Optional: add expo-updates for restart capability
npx expo install expo-updates
```

---

## New Files

```
components/
  ErrorBoundary.tsx              # Reusable class-based error boundary
  ErrorFallback.tsx              # User-facing error UI
utils/
  errorLogger.ts                 # Structured error logging
__tests__/
  components/ErrorBoundary.test.tsx
  components/ErrorFallback.test.tsx
  utils/errorLogger.test.ts
```

---

## New Types (`types/index.ts` additions)

```ts
export interface AppError {
  message: string;
  componentStack?: string;
  timestamp: string;
  context?: string;    // e.g., 'dashboard', 'add-expense'
}
```

---

## TDD Cycle 1 — `errorLogger.ts`

### RED: Write tests first

**`__tests__/utils/errorLogger.test.ts`**
```ts
import { logError, formatError, createAppError } from '../../utils/errorLogger';
import { AppError } from '../../types';

describe('createAppError', () => {
  it('returns AppError shape from Error object', () => {
    const error = new Error('Test error');
    const appError = createAppError(error);
    expect(appError).toHaveProperty('message', 'Test error');
    expect(appError).toHaveProperty('timestamp');
    expect(typeof appError.timestamp).toBe('string');
  });

  it('accepts optional context string', () => {
    const appError = createAppError(new Error('oops'), undefined, 'dashboard');
    expect(appError.context).toBe('dashboard');
  });

  it('timestamp is a valid ISO string', () => {
    const appError = createAppError(new Error('test'));
    expect(() => new Date(appError.timestamp)).not.toThrow();
    expect(new Date(appError.timestamp).getTime()).not.toBeNaN();
  });

  it('handles non-Error objects gracefully', () => {
    const appError = createAppError('something weird happened' as unknown as Error);
    expect(appError.message).toMatch(/something weird/i);
  });
});

describe('formatError', () => {
  it('returns readable string with message and timestamp', () => {
    const appError: AppError = {
      message: 'Test error',
      timestamp: '2024-01-15T10:00:00.000Z',
      context: 'settings',
    };
    const formatted = formatError(appError);
    expect(formatted).toContain('Test error');
    expect(formatted).toContain('2024-01-15');
    expect(formatted).toContain('settings');
  });

  it('handles missing context gracefully', () => {
    const appError: AppError = { message: 'error', timestamp: new Date().toISOString() };
    expect(() => formatError(appError)).not.toThrow();
  });
});

describe('logError', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('calls console.error with formatted error', () => {
    const error = new Error('something failed');
    logError(error);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('does not throw even when error is malformed', () => {
    expect(() => logError(null as unknown as Error)).not.toThrow();
  });

  it('includes context in log output when provided', () => {
    const error = new Error('context error');
    logError(error, undefined, 'expenses-screen');
    const callArg = consoleSpy.mock.calls[0][0] as string;
    expect(callArg).toContain('expenses-screen');
  });
});
```

### GREEN: Implement `utils/errorLogger.ts`

```ts
import { AppError } from '../types';

export function createAppError(
  error: Error,
  componentStack?: string,
  context?: string
): AppError {
  const message = error instanceof Error ? error.message : String(error);
  return {
    message,
    componentStack,
    timestamp: new Date().toISOString(),
    context,
  };
}

export function formatError(appError: AppError): string {
  const contextPart = appError.context ? ` [${appError.context}]` : '';
  const date = new Date(appError.timestamp).toLocaleString();
  return `[${date}]${contextPart} ${appError.message}`;
}

export function logError(
  error: Error,
  componentStack?: string,
  context?: string
): void {
  try {
    const appError = createAppError(error, componentStack, context);
    console.error('[Capital Cohort Error]', formatError(appError));
    if (componentStack) {
      console.error('Component stack:', componentStack);
    }
  } catch {
    // Prevent error logger from crashing the app
    console.error('[Capital Cohort] Error logger itself failed');
  }
}
```

---

## TDD Cycle 2 — `ErrorBoundary` Component

React Error Boundaries must be class components. Testing requires simulating a component throw.

### Test Helper

```tsx
// __tests__/helpers/ThrowingComponent.tsx
import React from 'react';

interface Props { shouldThrow: boolean; }

export const ThrowingComponent: React.FC<Props> = ({ shouldThrow }) => {
  if (shouldThrow) throw new Error('Test render error');
  return null;
};
```

### RED

**`__tests__/components/ErrorBoundary.test.tsx`**
```tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { ThrowingComponent } from '../helpers/ThrowingComponent';

// Suppress expected console.error output during error boundary tests
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Normal content</Text>
      </ErrorBoundary>
    );
    expect(getByText('Normal content')).toBeTruthy();
  });

  it('renders fallback UI when child throws', () => {
    const { getByTestId } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(getByTestId('error-fallback')).toBeTruthy();
  });

  it('renders custom fallback when provided via prop', () => {
    const CustomFallback = () => <Text testID="custom-fallback">Custom!</Text>;
    const { getByTestId } = render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(getByTestId('custom-fallback')).toBeTruthy();
  });

  it('calls onError prop when child throws', () => {
    const onError = jest.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('does not call onError when no error occurs', () => {
    const onError = jest.fn();
    render(
      <ErrorBoundary onError={onError}>
        <Text>OK</Text>
      </ErrorBoundary>
    );
    expect(onError).not.toHaveBeenCalled();
  });

  it('recovers when reset() is called', () => {
    // Render with throw, press retry, render without throw
    // Note: this requires the reset to re-render children
  });
});
```

### GREEN: Implement `components/ErrorBoundary.tsx`

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';
import { logError } from '../utils/errorLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  context?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logError(error, info.componentStack ?? undefined, this.props.context);
    this.props.onError?.(error, info);
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <ErrorFallback onReset={this.reset} error={this.state.error} />
      );
    }
    return this.props.children;
  }
}
```

---

## TDD Cycle 3 — `ErrorFallback` Component

### RED

**`__tests__/components/ErrorFallback.test.tsx`**
```tsx
describe('ErrorFallback', () => {
  it('renders error fallback container', () => {
    const { getByTestId } = render(<ErrorFallback onReset={jest.fn()} />);
    expect(getByTestId('error-fallback')).toBeTruthy();
  });

  it('renders "Try Again" button', () => {
    const { getByTestId } = render(<ErrorFallback onReset={jest.fn()} />);
    expect(getByTestId('error-retry-btn')).toBeTruthy();
  });

  it('calls onReset when Try Again pressed', () => {
    const onReset = jest.fn();
    const { getByTestId } = render(<ErrorFallback onReset={onReset} />);
    fireEvent.press(getByTestId('error-retry-btn'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('shows error message when error prop provided', () => {
    const { getByText } = render(
      <ErrorFallback onReset={jest.fn()} error={new Error('Render failed')} />
    );
    expect(getByText(/render failed/i)).toBeTruthy();
  });

  it('does not show raw error in production (only friendly message)', () => {
    // Assert no stack trace shown to user
  });
});
```

### GREEN: Implement `components/ErrorFallback.tsx`

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Props {
  onReset: () => void;
  error?: Error;
}

export const ErrorFallback: React.FC<Props> = ({ onReset, error }) => {
  const { colors } = useTheme();

  return (
    <View testID="error-fallback" style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.emoji]}>⚠️</Text>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Something went wrong</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        An unexpected error occurred. Your data is safe.
      </Text>
      {__DEV__ && error && (
        <Text style={[styles.devError, { color: colors.error }]} testID="dev-error-message">
          {error.message}
        </Text>
      )}
      <TouchableOpacity
        testID="error-retry-btn"
        style={[styles.button, { backgroundColor: colors.needs }]}
        onPress={onReset}
      >
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};
```

---

## Integration: Wrapping the App

### Root Layout (`app/_layout.tsx`)

```tsx
<ErrorBoundary context="root">
  <BudgetProvider>
    <ThemeProvider>
      <SafeAreaProvider>
        <Stack>
          {/* ... */}
        </Stack>
      </SafeAreaProvider>
    </ThemeProvider>
  </BudgetProvider>
</ErrorBoundary>
```

### Tab-Level Boundaries (`app/(tabs)/_layout.tsx`)

Wrap each screen render in a boundary:
```tsx
<ErrorBoundary context="dashboard" key="dashboard-boundary">
  <DashboardScreen />
</ErrorBoundary>
```

Or apply via a `withErrorBoundary` HOC per screen file.

---

## AsyncStorage Failure Recovery

In `utils/storage.ts`, all `loadX()` functions should already have try/catch. Verify and add where missing:

```ts
export async function loadExpenses(): Promise<Expense[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      logError(new Error('Expenses storage corrupted — resetting'), undefined, 'storage');
      await AsyncStorage.removeItem(STORAGE_KEYS.EXPENSES);
      return [];
    }
    return parsed;
  } catch (error) {
    logError(error as Error, undefined, 'storage.loadExpenses');
    return [];
  }
}
```

**Test for storage resilience:**
```ts
describe('loadExpenses — resilience', () => {
  it('returns empty array when stored value is not an array', async () => {
    AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify({ invalid: true }));
    const result = await loadExpenses();
    expect(result).toEqual([]);
  });

  it('returns empty array when stored value is corrupt JSON', async () => {
    AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, 'not-json{{{');
    const result = await loadExpenses();
    expect(result).toEqual([]);
  });
});
```

---

## Acceptance Criteria

- [ ] `logError` never throws — safe to call from anywhere
- [ ] `createAppError` handles non-Error objects
- [ ] `ErrorBoundary` renders fallback when child throws
- [ ] `ErrorBoundary` calls `onError` callback with error and component stack
- [ ] `ErrorFallback` renders `testID="error-fallback"` for test targeting
- [ ] `ErrorFallback` "Try Again" button calls `onReset`
- [ ] Dev-only error message shown in `__DEV__` mode
- [ ] Root layout wrapped with `ErrorBoundary`
- [ ] Each tab screen wrapped with its own `ErrorBoundary`
- [ ] `loadExpenses` and `loadIncome` return safe defaults on corrupt data

---

## Definition of Done

- All tests green
- App does not show blank screen on any component render error
- Fallback UI with "Try Again" visible and functional
- Corrupt AsyncStorage does not crash app on startup
