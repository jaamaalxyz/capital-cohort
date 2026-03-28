import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RecurringItem } from '../../components/RecurringItem';
import { RecurringTemplate } from '../../types';

jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: require('../../constants/theme').LIGHT_COLORS,
    isDark: false,
  }),
}));

const makeTemplate = (
  overrides: Partial<RecurringTemplate> = {},
): RecurringTemplate => ({
  id: 'tmpl-1',
  amount: 50000,
  description: 'Rent',
  category: 'needs',
  dayOfMonth: 1,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('RecurringItem', () => {
  it('renders template description', () => {
    const { getByText } = render(
      <RecurringItem
        template={makeTemplate()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(getByText('Rent')).toBeTruthy();
  });

  it('renders formatted amount', () => {
    const { getByTestId } = render(
      <RecurringItem
        template={makeTemplate({ amount: 50000 })}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(getByTestId('recurring-amount')).toBeTruthy();
  });

  it('renders day of month', () => {
    const { getByTestId } = render(
      <RecurringItem
        template={makeTemplate({ dayOfMonth: 15 })}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(getByTestId('recurring-day')).toBeTruthy();
  });

  it('renders category icon', () => {
    const { getByTestId } = render(
      <RecurringItem
        template={makeTemplate({ category: 'needs' })}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(getByTestId('recurring-icon')).toBeTruthy();
  });

  it('calls onEdit when edit button pressed', () => {
    const onEdit = jest.fn();
    const { getByTestId } = render(
      <RecurringItem
        template={makeTemplate()}
        onEdit={onEdit}
        onDelete={jest.fn()}
      />,
    );
    fireEvent.press(getByTestId('recurring-edit-btn'));
    expect(onEdit).toHaveBeenCalledWith(makeTemplate());
  });

  it('calls onDelete when delete button pressed', () => {
    const onDelete = jest.fn();
    const { getByTestId } = render(
      <RecurringItem
        template={makeTemplate({ id: 'tmpl-1' })}
        onEdit={jest.fn()}
        onDelete={onDelete}
      />,
    );
    fireEvent.press(getByTestId('recurring-delete-btn'));
    expect(onDelete).toHaveBeenCalledWith('tmpl-1');
  });

  it('shows inactive badge when isActive is false', () => {
    const { getByTestId } = render(
      <RecurringItem
        template={makeTemplate({ isActive: false })}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(getByTestId('recurring-inactive-badge')).toBeTruthy();
  });

  it('does not show inactive badge when isActive is true', () => {
    const { queryByTestId } = render(
      <RecurringItem
        template={makeTemplate({ isActive: true })}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(queryByTestId('recurring-inactive-badge')).toBeNull();
  });
});
