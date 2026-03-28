import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilterChip } from '../../components/FilterChip';
import { ThemeProvider } from '../../context/ThemeContext';

const renderFilterChip = (props: any) =>
  render(
    <ThemeProvider>
      <FilterChip {...props} />
    </ThemeProvider>
  );

describe('FilterChip', () => {
  it('renders labels correctly', async () => {
    const { findByText } = renderFilterChip({
      label: 'Needs',
      active: false,
      onPress: () => {},
    });
    expect(await findByText('Needs')).toBeTruthy();
  });

  it('calls onPress when clicked', async () => {
    const onPress = jest.fn();
    const { findByText } = renderFilterChip({
      label: 'Wants',
      active: false,
      onPress,
    });
    
    fireEvent.press(await findByText('Wants'));
    expect(onPress).toHaveBeenCalled();
  });
});
