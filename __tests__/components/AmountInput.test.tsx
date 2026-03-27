import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AmountInput } from '../../components/AmountInput';
import { ThemeProvider } from '../../context/ThemeContext';

const renderInput = (props: Partial<React.ComponentProps<typeof AmountInput>> = {}) =>
  render(
    <ThemeProvider>
      <AmountInput
        value={0}
        onChangeValue={jest.fn()}
        currencySymbol="$"
        {...props}
      />
    </ThemeProvider>
  );

describe('AmountInput — rendering', () => {
  it('renders without crashing', async () => {
    const { findByText } = renderInput();
    expect(await findByText('$')).toBeTruthy();
  });

  it('renders currency symbol prefix', async () => {
    const { findByText } = renderInput({ currencySymbol: '€' });
    expect(await findByText('€')).toBeTruthy();
  });

  it('shows error text when error prop is provided', async () => {
    const { findByText } = renderInput({ error: 'Amount is required' });
    expect(await findByText('Amount is required')).toBeTruthy();
  });

  it('does not show error text when error prop is absent', async () => {
    const { findByText, queryByText } = renderInput();
    await findByText('$'); // wait for render
    expect(queryByText('Amount is required')).toBeNull();
  });

  it('initializes with value > 0 displayed as decimal', async () => {
    const { findByDisplayValue } = renderInput({ value: 5050 });
    expect(await findByDisplayValue('50.50')).toBeTruthy();
  });

  it('shows empty input when value is 0', async () => {
    const { findByText, queryByDisplayValue } = renderInput({ value: 0 });
    await findByText('$'); // wait for render
    expect(queryByDisplayValue('0.00')).toBeNull();
  });
});

describe('AmountInput — user input', () => {
  it('calls onChangeValue with cents when valid number entered', async () => {
    const onChangeValue = jest.fn();
    const { findByPlaceholderText } = renderInput({ onChangeValue });
    const input = await findByPlaceholderText('amountInput.placeholder');
    fireEvent.changeText(input, '10.50');
    expect(onChangeValue).toHaveBeenCalledWith(1050);
  });

  it('calls onChangeValue with 0 when non-numeric input entered', async () => {
    const onChangeValue = jest.fn();
    const { findByPlaceholderText } = renderInput({ onChangeValue });
    const input = await findByPlaceholderText('amountInput.placeholder');
    fireEvent.changeText(input, 'abc');
    expect(onChangeValue).toHaveBeenCalledWith(0);
  });

  it('strips dollar sign from input, leaving numeric value', async () => {
    const onChangeValue = jest.fn();
    const { findByPlaceholderText } = renderInput({ onChangeValue });
    const input = await findByPlaceholderText('amountInput.placeholder');
    // '$100' → cleaned to '100' → 10000 cents
    fireEvent.changeText(input, '$100');
    expect(onChangeValue).toHaveBeenCalledWith(10000);
  });

  it('limits to 2 decimal places', async () => {
    const onChangeValue = jest.fn();
    const { findByPlaceholderText } = renderInput({ onChangeValue });
    const input = await findByPlaceholderText('amountInput.placeholder');
    fireEvent.changeText(input, '10.999');
    expect(onChangeValue).toHaveBeenCalledWith(1099);
  });
});
