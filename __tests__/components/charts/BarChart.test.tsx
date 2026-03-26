import React from 'react';
import { render } from '@testing-library/react-native';
import { BarChart } from '../../../components/charts/BarChart';
import { MonthlySnapshot } from '../../../types';

const snapshots: MonthlySnapshot[] = [
  { month: '2024-01', needs: 50000, wants: 30000, savings: 20000, total: 100000 },
  { month: '2024-02', needs: 40000, wants: 25000, savings: 15000, total: 80000 },
];

describe('BarChart', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<BarChart data={snapshots} />);
    expect(toJSON()).not.toBeNull();
  });

  it('renders one bar group per snapshot', () => {
    const { getAllByTestId } = render(<BarChart data={snapshots} />);
    expect(getAllByTestId('bar-group')).toHaveLength(2);
  });

  it('renders month label for each snapshot', () => {
    const { getByText } = render(<BarChart data={snapshots} />);
    expect(getByText('Jan')).toBeTruthy();
    expect(getByText('Feb')).toBeTruthy();
  });

  it('renders empty state when data is empty', () => {
    const { getByTestId } = render(<BarChart data={[]} />);
    expect(getByTestId('chart-empty-state')).toBeTruthy();
  });

  it('renders 3 bar segments per group (needs/wants/savings)', () => {
    const { getAllByTestId } = render(<BarChart data={snapshots} />);
    expect(getAllByTestId('bar-segment')).toHaveLength(6);
  });

  it('renders single group for single snapshot', () => {
    const single = [snapshots[0]];
    const { getAllByTestId } = render(<BarChart data={single} />);
    expect(getAllByTestId('bar-group')).toHaveLength(1);
    expect(getAllByTestId('bar-segment')).toHaveLength(3);
  });

  it('does not render empty state when data is present', () => {
    const { queryByTestId } = render(<BarChart data={snapshots} />);
    expect(queryByTestId('chart-empty-state')).toBeNull();
  });

  it('renders correct abbreviated month labels', () => {
    const data: MonthlySnapshot[] = [
      { month: '2024-06', needs: 1000, wants: 0, savings: 0, total: 1000 },
      { month: '2024-12', needs: 1000, wants: 0, savings: 0, total: 1000 },
    ];
    const { getByText } = render(<BarChart data={data} />);
    expect(getByText('Jun')).toBeTruthy();
    expect(getByText('Dec')).toBeTruthy();
  });
});
