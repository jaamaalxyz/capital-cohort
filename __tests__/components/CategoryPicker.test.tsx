import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CategoryPicker } from '../../components/CategoryPicker';
import { ThemeProvider } from '../../context/ThemeContext';

const renderPicker = (
  selected: 'needs' | 'wants' | 'savings' | null = null,
  onSelect = jest.fn()
) =>
  render(
    <ThemeProvider>
      <CategoryPicker selected={selected} onSelect={onSelect} />
    </ThemeProvider>
  );

describe('CategoryPicker — rendering', () => {
  it('renders without crashing', async () => {
    const { findByTestId } = renderPicker();
    expect(await findByTestId('category-picker-container')).toBeTruthy();
  });

  it('renders all three category options', async () => {
    const { findByText } = renderPicker();
    // i18n mock returns key as-is → t('categories.needs').toUpperCase() = 'CATEGORIES.NEEDS'
    expect(await findByText('CATEGORIES.NEEDS')).toBeTruthy();
    expect(await findByText('CATEGORIES.WANTS')).toBeTruthy();
    expect(await findByText('CATEGORIES.SAVINGS')).toBeTruthy();
  });

  it('renders lowercase category keys are not visible', async () => {
    const { queryByText } = renderPicker();
    await new Promise((r) => setTimeout(r, 100));
    expect(queryByText('needs')).toBeNull();
  });
});

describe('CategoryPicker — selection', () => {
  it('calls onSelect with "needs" when needs option is pressed', async () => {
    const onSelect = jest.fn();
    const { findByText } = renderPicker(null, onSelect);
    fireEvent.press(await findByText('CATEGORIES.NEEDS'));
    expect(onSelect).toHaveBeenCalledWith('needs');
  });

  it('calls onSelect with "wants" when wants option is pressed', async () => {
    const onSelect = jest.fn();
    const { findByText } = renderPicker(null, onSelect);
    fireEvent.press(await findByText('CATEGORIES.WANTS'));
    expect(onSelect).toHaveBeenCalledWith('wants');
  });

  it('calls onSelect with "savings" when savings option is pressed', async () => {
    const onSelect = jest.fn();
    const { findByText } = renderPicker(null, onSelect);
    fireEvent.press(await findByText('CATEGORIES.SAVINGS'));
    expect(onSelect).toHaveBeenCalledWith('savings');
  });

  it('renders correctly with a pre-selected category', async () => {
    const { findByText } = renderPicker('needs');
    expect(await findByText('CATEGORIES.NEEDS')).toBeTruthy();
  });

  it('renders with no selection (null) without crashing', async () => {
    const { findByText } = renderPicker(null);
    expect(await findByText('CATEGORIES.NEEDS')).toBeTruthy();
  });
});
