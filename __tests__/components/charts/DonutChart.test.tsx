import React from 'react';
import { render } from '@testing-library/react-native';
import { DonutChart } from '../../../components/charts/DonutChart';

const fullBreakdown = { needs: 50000, wants: 30000, savings: 20000 };

describe('DonutChart', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(
      <DonutChart breakdown={fullBreakdown} currency="USD" />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('renders a segment for each non-zero category', () => {
    const { getByTestId } = render(
      <DonutChart breakdown={fullBreakdown} currency="USD" />
    );
    expect(getByTestId('donut-segment-needs')).toBeTruthy();
    expect(getByTestId('donut-segment-wants')).toBeTruthy();
    expect(getByTestId('donut-segment-savings')).toBeTruthy();
  });

  it('renders total amount in center', () => {
    const { getByTestId } = render(
      <DonutChart breakdown={fullBreakdown} currency="USD" />
    );
    expect(getByTestId('donut-total')).toBeTruthy();
  });

  it('does not render segment for a zero-value category', () => {
    const { queryByTestId } = render(
      <DonutChart breakdown={{ needs: 50000, wants: 0, savings: 20000 }} currency="USD" />
    );
    expect(queryByTestId('donut-segment-wants')).toBeNull();
  });

  it('renders all three segments when all categories have spend', () => {
    const { getAllByTestId } = render(
      <DonutChart breakdown={fullBreakdown} currency="USD" />
    );
    // Each segment has testID donut-segment-{category}
    expect(getAllByTestId(/donut-segment/)).toHaveLength(3);
  });

  it('shows empty state when all categories are zero', () => {
    const { getByTestId } = render(
      <DonutChart breakdown={{ needs: 0, wants: 0, savings: 0 }} currency="USD" />
    );
    expect(getByTestId('donut-empty')).toBeTruthy();
  });

  it('does not show empty state when at least one category has spend', () => {
    const { queryByTestId } = render(
      <DonutChart breakdown={{ needs: 5000, wants: 0, savings: 0 }} currency="USD" />
    );
    expect(queryByTestId('donut-empty')).toBeNull();
  });

  it('renders only the populated segment for single-category spend', () => {
    const { getByTestId, queryByTestId } = render(
      <DonutChart breakdown={{ needs: 5000, wants: 0, savings: 0 }} currency="USD" />
    );
    expect(getByTestId('donut-segment-needs')).toBeTruthy();
    expect(queryByTestId('donut-segment-wants')).toBeNull();
    expect(queryByTestId('donut-segment-savings')).toBeNull();
  });
});
