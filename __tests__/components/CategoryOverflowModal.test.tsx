import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CategoryOverflowModal } from '../../components/CategoryOverflowModal';
import { ThemeProvider } from '../../context/ThemeContext';

const renderModal = (props: any) =>
  render(
    <ThemeProvider>
      <CategoryOverflowModal
        visible={true}
        category="needs"
        overspentAmount={5000}
        onClose={jest.fn()}
        onAction={jest.fn()}
        {...props}
      />
    </ThemeProvider>
  );

describe('CategoryOverflowModal', () => {
  it('renders correctly when visible', async () => {
    const { findByText } = renderModal({ overspentAmount: 5000 });
    // Since mock i18n returns the key, we check for keys
    expect(await findByText(/overflow\.categoryTitle/i)).toBeTruthy();
    expect(await findByText(/overflow\.overspentBy/i)).toBeTruthy();
  });

  it('calls onAction with "extra_income" when clicking add income button', async () => {
    const onAction = jest.fn();
    const { findByTestId } = renderModal({ onAction });
    const btn = await findByTestId('action-extra-income');
    fireEvent.press(btn);
    expect(onAction).toHaveBeenCalledWith('extra_income');
  });

  it('calls onAction with "debt" when clicking add to debt button', async () => {
    const onAction = jest.fn();
    const { findByTestId } = renderModal({ onAction });
    const btn = await findByTestId('action-debt');
    fireEvent.press(btn);
    expect(onAction).toHaveBeenCalledWith('debt');
  });

  it('calls onClose when clicking close/cancel', async () => {
    const onClose = jest.fn();
    const { findByTestId } = renderModal({ onClose });
    const btn = await findByTestId('close-modal');
    fireEvent.press(btn);
    expect(onClose).toHaveBeenCalled();
  });
});
