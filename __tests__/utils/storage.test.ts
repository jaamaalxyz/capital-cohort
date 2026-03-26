import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveIncome,
  loadIncome,
  saveExpenses,
  loadExpenses,
  saveCurrency,
  loadCurrency,
  saveOnboardingCompleted,
  loadOnboardingCompleted,
  saveTheme,
  loadTheme,
  clearAllData,
} from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/theme';
import { Expense } from '../../types';

const makeExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: 'test-1',
  amount: 5000,
  description: 'Test expense',
  category: 'needs',
  date: '2024-01-15',
  createdAt: new Date().toISOString(),
  ...overrides,
});

beforeEach(() => {
  (AsyncStorage.clear as jest.Mock).mockClear();
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Income
// ---------------------------------------------------------------------------
describe('saveIncome / loadIncome', () => {
  it('saves income and loads it back', async () => {
    await saveIncome(150000);
    const loaded = await loadIncome();
    expect(loaded).toBe(150000);
  });

  it('returns 0 when no income stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const loaded = await loadIncome();
    expect(loaded).toBe(0);
  });

  it('saves income to the correct AsyncStorage key', async () => {
    await saveIncome(50000);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.INCOME,
      JSON.stringify(50000)
    );
  });

  it('returns 0 and does not throw on AsyncStorage error', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
    const loaded = await loadIncome();
    expect(loaded).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------
describe('saveExpenses / loadExpenses', () => {
  it('saves expenses and loads them back', async () => {
    const expenses = [makeExpense()];
    await saveExpenses(expenses);
    const loaded = await loadExpenses();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('test-1');
  });

  it('returns empty array when no expenses stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const loaded = await loadExpenses();
    expect(loaded).toEqual([]);
  });

  it('saves to correct AsyncStorage key', async () => {
    const expenses = [makeExpense()];
    await saveExpenses(expenses);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.EXPENSES,
      JSON.stringify(expenses)
    );
  });

  it('returns empty array on storage error', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const loaded = await loadExpenses();
    expect(loaded).toEqual([]);
  });

  it('saves and loads multiple expenses', async () => {
    const expenses = [
      makeExpense({ id: '1' }),
      makeExpense({ id: '2' }),
      makeExpense({ id: '3' }),
    ];
    await saveExpenses(expenses);
    const loaded = await loadExpenses();
    expect(loaded).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------
describe('saveCurrency / loadCurrency', () => {
  it('saves and loads currency code', async () => {
    await saveCurrency('EUR');
    const loaded = await loadCurrency();
    expect(loaded).toBe('EUR');
  });

  it('returns default currency when none stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const loaded = await loadCurrency();
    expect(typeof loaded).toBe('string');
    expect(loaded.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------
describe('saveOnboardingCompleted / loadOnboardingCompleted', () => {
  it('saves and loads onboarding completed = true', async () => {
    await saveOnboardingCompleted(true);
    const loaded = await loadOnboardingCompleted();
    expect(loaded).toBe(true);
  });

  it('saves and loads onboarding completed = false', async () => {
    await saveOnboardingCompleted(false);
    const loaded = await loadOnboardingCompleted();
    expect(loaded).toBe(false);
  });

  it('returns false when no value stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const loaded = await loadOnboardingCompleted();
    expect(loaded).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------
describe('saveTheme / loadTheme', () => {
  it('saves and loads theme value', async () => {
    await saveTheme('dark');
    const loaded = await loadTheme();
    expect(loaded).toBe('dark');
  });

  it('returns null when no theme stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const loaded = await loadTheme();
    expect(loaded).toBeNull();
  });

  it('stores all valid theme modes', async () => {
    for (const mode of ['auto', 'light', 'dark'] as const) {
      await saveTheme(mode);
      const loaded = await loadTheme();
      expect(loaded).toBe(mode);
    }
  });
});

// ---------------------------------------------------------------------------
// clearAllData
// ---------------------------------------------------------------------------
describe('clearAllData', () => {
  it('calls AsyncStorage.multiRemove', async () => {
    await clearAllData();
    expect(AsyncStorage.multiRemove).toHaveBeenCalled();
  });

  it('removes all known storage keys', async () => {
    await clearAllData();
    const removedKeys = (AsyncStorage.multiRemove as jest.Mock).mock.calls[0][0];
    expect(removedKeys).toContain(STORAGE_KEYS.INCOME);
    expect(removedKeys).toContain(STORAGE_KEYS.EXPENSES);
    expect(removedKeys).toContain(STORAGE_KEYS.CURRENCY);
    expect(removedKeys).toContain(STORAGE_KEYS.THEME);
  });
});
