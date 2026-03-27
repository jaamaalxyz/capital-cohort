import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressBar } from '../../components/ProgressBar';
import { ThemeProvider } from '../../context/ThemeContext';

const renderBar = (props: Partial<React.ComponentProps<typeof ProgressBar>> = {}) =>
  render(
    <ThemeProvider>
      <ProgressBar percentage={50} color="#4CAF50" {...props} />
    </ThemeProvider>
  );

describe('ProgressBar — rendering', () => {
  it('renders with 50% without crashing', async () => {
    const { findByTestId } = renderBar({ percentage: 50 });
    // This waits for the ThemeProvider to load and the component to appear
    expect(await findByTestId('progress-bar')).toBeTruthy();
  });

  it('renders with 0% without crashing', async () => {
    const { findByTestId } = renderBar({ percentage: 0 });
    expect(await findByTestId('progress-bar')).toBeTruthy();
  });

  it('renders with 100% without crashing', async () => {
    const { findByTestId } = renderBar({ percentage: 100 });
    expect(await findByTestId('progress-bar')).toBeTruthy();
  });

  it('renders with over-budget percentage (> 100) without crashing', async () => {
    const { findByTestId } = renderBar({ percentage: 150 });
    expect(await findByTestId('progress-bar')).toBeTruthy();
  });

  it('renders with isOverBudget=false without crashing', async () => {
    const { findByTestId } = renderBar({ isOverBudget: false, percentage: 50 });
    expect(await findByTestId('progress-bar')).toBeTruthy();
  });

  it('renders with isOverBudget=true without crashing', async () => {
    const { findByTestId } = renderBar({ isOverBudget: true, percentage: 110 });
    expect(await findByTestId('progress-bar')).toBeTruthy();
  });

  it('accepts a custom color prop', async () => {
    const { findByTestId } = renderBar({ color: '#FF5722', percentage: 75 });
    expect(await findByTestId('progress-bar')).toBeTruthy();
  });
});
