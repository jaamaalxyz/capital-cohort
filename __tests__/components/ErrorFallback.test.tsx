import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ErrorFallback } from '../../components/ErrorFallback';
import { ThemeProvider } from '../../context/ThemeContext';

const renderFallback = (props: { onReset: () => void; error?: Error }) =>
  render(
    <ThemeProvider>
      <ErrorFallback {...props} />
    </ThemeProvider>
  );

describe('ErrorFallback', () => {
  it('renders error fallback container', async () => {
    const { findByTestId } = renderFallback({ onReset: jest.fn() });
    expect(await findByTestId('error-fallback')).toBeTruthy();
  });

  it('renders "Try Again" button', async () => {
    const { findByTestId } = renderFallback({ onReset: jest.fn() });
    expect(await findByTestId('error-retry-btn')).toBeTruthy();
  });

  it('calls onReset when Try Again is pressed', async () => {
    const onReset = jest.fn();
    const { findByTestId } = renderFallback({ onReset });
    fireEvent.press(await findByTestId('error-retry-btn'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('shows error message in DEV mode when error prop is provided', async () => {
    const { findByTestId } = renderFallback({
      onReset: jest.fn(),
      error: new Error('Render failed'),
    });
    // __DEV__ is true in Jest environment
    expect(await findByTestId('dev-error-message')).toBeTruthy();
  });

  it('dev error message contains the error text', async () => {
    const { findByTestId } = renderFallback({
      onReset: jest.fn(),
      error: new Error('Something exploded'),
    });
    const el = await findByTestId('dev-error-message');
    expect(el.props.children).toBe('Something exploded');
  });

  it('does not render dev error message when no error prop is given', async () => {
    const { findByTestId, queryByTestId } = renderFallback({ onReset: jest.fn() });
    await findByTestId('error-fallback'); // wait for render
    expect(queryByTestId('dev-error-message')).toBeNull();
  });
});
