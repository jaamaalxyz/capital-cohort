import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemePicker } from '../../components/ThemePicker';
import { ThemeProvider } from '../../context/ThemeContext';

const renderThemePicker = () =>
  render(
    <ThemeProvider>
      <ThemePicker />
    </ThemeProvider>
  );

describe('ThemePicker — rendering', () => {
  it('renders all three theme options', async () => {
    const { findByText } = renderThemePicker();
    expect(await findByText('settings.themeLight')).toBeTruthy();
    expect(await findByText('settings.themeDark')).toBeTruthy();
    expect(await findByText('settings.themeAuto')).toBeTruthy();
  });

  it('can select a different theme', async () => {
    const { findByText } = renderThemePicker();
    const darkBtn = await findByText('settings.themeDark');
    fireEvent.press(darkBtn);
  });
});
