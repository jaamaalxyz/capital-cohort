import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SearchBar } from '../../components/SearchBar';
import { ThemeProvider } from '../../context/ThemeContext';

const renderSearchBar = (props: any) =>
  render(
    <ThemeProvider>
      <SearchBar {...props} />
    </ThemeProvider>
  );

describe('SearchBar', () => {
  it('renders a text input with the correct placeholder', async () => {
    const { findByPlaceholderText } = renderSearchBar({
      value: '',
      onChangeText: () => {},
      placeholder: 'Search context',
    });
    expect(await findByPlaceholderText('Search context')).toBeTruthy();
  });

  it('calls onChangeText on input change', async () => {
    const onChangeText = jest.fn();
    const { findByPlaceholderText } = renderSearchBar({
      value: '',
      onChangeText,
      placeholder: 'Search',
    });

    const input = await findByPlaceholderText('Search');
    fireEvent.changeText(input, 'coffee');
    
    // SearchBar has a 250ms debounce
    await waitFor(() => {
      expect(onChangeText).toHaveBeenCalledWith('coffee');
    });
  });

  it('shows clear button when value is non-empty', async () => {
    const { findByTestId } = renderSearchBar({
      value: 'rent',
      onChangeText: () => {},
      onClear: () => {},
    });
    expect(await findByTestId('search-clear-btn')).toBeTruthy();
  });

  it('hides clear button when value is empty', async () => {
    const { queryByTestId, findByPlaceholderText } = renderSearchBar({
      value: '',
      onChangeText: () => {},
      onClear: () => {},
      placeholder: 'Search',
    });
    
    // Wait for something in the UI first to ensure loading is done
    await findByPlaceholderText('Search');
    expect(queryByTestId('search-clear-btn')).toBeNull();
  });

  it('calls onClear when clear button pressed', async () => {
    const onClear = jest.fn();
    const { findByTestId } = renderSearchBar({
      value: 'rent',
      onChangeText: () => {},
      onClear,
    });

    fireEvent.press(await findByTestId('search-clear-btn'));
    expect(onClear).toHaveBeenCalled();
  });
});
