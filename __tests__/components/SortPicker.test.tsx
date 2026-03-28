import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SortPicker } from '../../components/SortPicker';
import { ThemeProvider } from '../../context/ThemeContext';

const renderSortPicker = (props: any) =>
  render(
    <ThemeProvider>
      <SortPicker {...props} />
    </ThemeProvider>
  );

describe('SortPicker', () => {
  it('renders correctly when visible', async () => {
    const { findByText } = renderSortPicker({
      visible: true,
      currentOrder: 'date_desc',
      onSelect: () => {},
      onClose: () => {},
    });
    // Checks for a localized string if we use translations, but for now we expect title
    expect(await findByText('Sort By')).toBeTruthy();
  });

  it('calls onSelect with new order when option pressed', async () => {
    const onSelect = jest.fn();
    const { findByText } = renderSortPicker({
      visible: true,
      currentOrder: 'date_desc',
      onSelect,
      onClose: () => {},
    });
    
    const option = await findByText('Highest Amount');
    fireEvent.press(option);
    expect(onSelect).toHaveBeenCalledWith('amount_desc');
  });
});
