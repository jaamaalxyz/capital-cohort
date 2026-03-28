import { renderHook, act } from '@testing-library/react-native';
import { useExpenseFilters } from '../../hooks/useExpenseFilters';

describe('useExpenseFilters', () => {
  it('initializes with default filters', () => {
    const { result } = renderHook(() => useExpenseFilters());
    expect(result.current.filters.query).toBe('');
    expect(result.current.filters.categories).toEqual([]);
    expect(result.current.filters.sortOrder).toBe('date_desc');
  });

  it('setQuery updates query filter', () => {
    const { result } = renderHook(() => useExpenseFilters());
    act(() => result.current.setQuery('rent'));
    expect(result.current.filters.query).toBe('rent');
  });

  it('toggleCategory adds category if not present', () => {
    const { result } = renderHook(() => useExpenseFilters());
    act(() => result.current.toggleCategory('needs'));
    expect(result.current.filters.categories).toContain('needs');
  });

  it('toggleCategory removes category if already present', () => {
    const { result } = renderHook(() => useExpenseFilters());
    act(() => {
      result.current.toggleCategory('needs');
    });
    act(() => {
      result.current.toggleCategory('needs');
    });
    expect(result.current.filters.categories).not.toContain('needs');
  });

  it('setSortOrder updates sort order', () => {
    const { result } = renderHook(() => useExpenseFilters());
    act(() => result.current.setSortOrder('amount_desc'));
    expect(result.current.filters.sortOrder).toBe('amount_desc');
  });

  it('clearFilters resets to defaults', () => {
    const { result } = renderHook(() => useExpenseFilters());
    act(() => result.current.setQuery('test'));
    act(() => result.current.clearFilters());
    expect(result.current.filters.query).toBe('');
  });

  it('activeFilterCount returns 0 for defaults', () => {
    const { result } = renderHook(() => useExpenseFilters());
    expect(result.current.activeFilterCount).toBe(0);
  });

  it('activeFilterCount increments for each active non-default filter', () => {
    const { result } = renderHook(() => useExpenseFilters());
    act(() => result.current.setQuery('rent'));
    act(() => result.current.toggleCategory('needs'));
    expect(result.current.activeFilterCount).toBe(2);
  });
});
