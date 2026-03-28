import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveIncome,
  loadIncome,
  saveExpenses,
  loadExpenses,
  saveCurrency,
  loadCurrency,
  saveLocation,
  loadLocation,
  saveOnboardingCompleted,
  loadOnboardingCompleted,
  saveRecurringTemplates,
  loadRecurringTemplates,
  saveTheme,
  loadTheme,
  clearAllData,
} from '../../utils/storage';
import { RecurringTemplate } from '../../types';
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
      JSON.stringify(50000),
    );
  });

  it('returns 0 and does not throw on AsyncStorage error', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
      new Error('Storage error'),
    );
    const loaded = await loadIncome();
    expect(loaded).toBe(0);
  });
});

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
      JSON.stringify(expenses),
    );
  });

  it('returns empty array on storage error', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );
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

describe('saveLocation / loadLocation', () => {
  it('saves and loads a location object', async () => {
    const location = { latitude: 23.8, longitude: 90.4, country: 'Bangladesh' };
    await saveLocation(location);
    const loaded = await loadLocation();
    expect(loaded).toEqual(location);
  });

  it('returns undefined when no location stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const loaded = await loadLocation();
    expect(loaded).toBeUndefined();
  });

  it('removes location from storage when null is saved', async () => {
    await saveLocation(null);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.LOCATION);
  });

  it('removes location from storage when undefined is saved', async () => {
    await saveLocation(undefined);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.LOCATION);
  });

  it('returns undefined on storage error', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );
    const loaded = await loadLocation();
    expect(loaded).toBeUndefined();
  });
});

describe('saveRecurringTemplates / loadRecurringTemplates', () => {
  const makeTemplate = (
    overrides: Partial<RecurringTemplate> = {},
  ): RecurringTemplate => ({
    id: 'tmpl-1',
    amount: 50000,
    description: 'Rent',
    category: 'needs',
    dayOfMonth: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  it('saves and loads recurring templates', async () => {
    const templates = [makeTemplate()];
    await saveRecurringTemplates(templates);
    const loaded = await loadRecurringTemplates();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('tmpl-1');
  });

  it('returns empty array when no templates stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const loaded = await loadRecurringTemplates();
    expect(loaded).toEqual([]);
  });

  it('saves multiple templates', async () => {
    const templates = [makeTemplate({ id: 't1' }), makeTemplate({ id: 't2' })];
    await saveRecurringTemplates(templates);
    const loaded = await loadRecurringTemplates();
    expect(loaded).toHaveLength(2);
  });

  it('returns empty array on storage error', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );
    const loaded = await loadRecurringTemplates();
    expect(loaded).toEqual([]);
  });
});

describe('save functions — error handling', () => {
  it('saveIncome does not throw on storage error', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );
    await expect(saveIncome(1000)).resolves.not.toThrow();
  });

  it('saveExpenses does not throw on storage error', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );
    await expect(saveExpenses([])).resolves.not.toThrow();
  });

  it('saveCurrency does not throw on storage error', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );
    await expect(saveCurrency('USD')).resolves.not.toThrow();
  });

  it('loadCurrency returns default on storage error', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );
    const result = await loadCurrency();
    expect(typeof result).toBe('string');
  });

  it('saveOnboardingCompleted does not throw on storage error', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );
    await expect(saveOnboardingCompleted(true)).resolves.not.toThrow();
  });

  it('loadOnboardingCompleted returns false on storage error', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );
    const result = await loadOnboardingCompleted();
    expect(result).toBe(false);
  });

  it('saveTheme does not throw on storage error', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );
    await expect(saveTheme('dark')).resolves.not.toThrow();
  });

  it('loadTheme returns null on storage error', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );
    const result = await loadTheme();
    expect(result).toBeNull();
  });

  it('clearAllData does not throw on storage error', async () => {
    (AsyncStorage.multiRemove as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );
    await expect(clearAllData()).resolves.not.toThrow();
  });
});

describe('clearAllData', () => {
  it('calls AsyncStorage.multiRemove', async () => {
    await clearAllData();
    expect(AsyncStorage.multiRemove).toHaveBeenCalled();
  });

  it('removes all known storage keys', async () => {
    await clearAllData();
    const removedKeys = (AsyncStorage.multiRemove as jest.Mock).mock
      .calls[0][0];
    expect(removedKeys).toContain(STORAGE_KEYS.INCOME);
    expect(removedKeys).toContain(STORAGE_KEYS.EXPENSES);
    expect(removedKeys).toContain(STORAGE_KEYS.CURRENCY);
    expect(removedKeys).toContain(STORAGE_KEYS.THEME);
  });
});

describe('Storage Resilience', () => {
  it('loadIncome returns 0 when stored value is not a number', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({ bad: 'data' }),
    );
    const result = await loadIncome();
    expect(result).toBe(0);
  });

  it('loadExpenses returns [] when stored value is not an array', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({ not: 'an-array' }),
    );
    const result = await loadExpenses();
    expect(result).toEqual([]);
  });

  it('loadExpenses returns [] when stored value is corrupt JSON', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      'corrupt-json-!@#',
    );
    const result = await loadExpenses();
    expect(result).toEqual([]);
  });

  it('loadRecurringTemplates returns [] when stored value is not an array', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({ bad: 'data' }),
    );
    const result = await loadRecurringTemplates();
    expect(result).toEqual([]);
  });

  it('loadRecurringTemplates returns [] when stored value is corrupt JSON', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('!!!');
    const result = await loadRecurringTemplates();
    expect(result).toEqual([]);
  });

  it('loadLocation returns undefined when stored value is corrupt JSON', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('invalid-json');
    const result = await loadLocation();
    expect(result).toBeUndefined();
  });
});
