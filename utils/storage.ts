import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/theme';
import { Expense, RecurringTemplate, ThemeMode } from '../types';
import { DEFAULT_CURRENCY } from '../constants/currencies';
import { logError } from './errorLogger';

export async function saveIncome(income: number): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify(income));
  } catch (error) {
    logError(error as Error, undefined, 'storage.saveIncome');
  }
}

export async function loadIncome(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.INCOME);
    if (!value) return 0;
    const parsed = JSON.parse(value);
    if (typeof parsed !== 'number') {
      logError(new Error('Income storage corrupted'), undefined, 'storage.loadIncome');
      return 0;
    }
    return parsed;
  } catch (error) {
    logError(error as Error, undefined, 'storage.loadIncome');
    return 0;
  }
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (error) {
    logError(error as Error, undefined, 'storage.saveExpenses');
  }
}

export async function loadExpenses(): Promise<Expense[]> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!value) return [];
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      logError(new Error('Expenses storage corrupted'), undefined, 'storage.loadExpenses');
      return [];
    }
    return parsed;
  } catch (error) {
    logError(error as Error, undefined, 'storage.loadExpenses');
    return [];
  }
}

export async function saveCurrency(currency: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
  } catch (error) {
    logError(error as Error, undefined, 'storage.saveCurrency');
  }
}

export async function loadCurrency(): Promise<string> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.CURRENCY);
    return value ?? DEFAULT_CURRENCY;
  } catch (error) {
    logError(error as Error, undefined, 'storage.loadCurrency');
    return DEFAULT_CURRENCY;
  }
}

export async function saveLocation(location: any): Promise<void> {
  try {
    if (location === undefined || location === null) {
      await AsyncStorage.removeItem(STORAGE_KEYS.LOCATION);
    } else {
      await AsyncStorage.setItem(
        STORAGE_KEYS.LOCATION,
        JSON.stringify(location),
      );
    }
  } catch (error) {
    logError(error as Error, undefined, 'storage.saveLocation');
  }
}

export async function loadLocation(): Promise<any> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION);
    return value ? JSON.parse(value) : undefined;
  } catch (error) {
    logError(error as Error, undefined, 'storage.loadLocation');
    return undefined;
  }
}

export async function saveOnboardingCompleted(
  completed: boolean,
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.ONBOARDING_COMPLETED,
      JSON.stringify(completed),
    );
  } catch (error) {
    logError(error as Error, undefined, 'storage.saveOnboarding');
  }
}

export async function loadOnboardingCompleted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    if (!value) return false;
    const parsed = JSON.parse(value);
    if (typeof parsed !== 'boolean') return false;
    return parsed;
  } catch (error) {
    logError(error as Error, undefined, 'storage.loadOnboarding');
    return false;
  }
}

export async function saveRecurringTemplates(templates: RecurringTemplate[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.RECURRING_TEMPLATES, JSON.stringify(templates));
  } catch (error) {
    logError(error as Error, undefined, 'storage.saveRecurringTemplates');
  }
}

export async function loadRecurringTemplates(): Promise<RecurringTemplate[]> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.RECURRING_TEMPLATES);
    if (!value) return [];
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      logError(new Error('Recurring templates storage corrupted'), undefined, 'storage.loadRecurringTemplates');
      return [];
    }
    return parsed;
  } catch (error) {
    logError(error as Error, undefined, 'storage.loadRecurringTemplates');
    return [];
  }
}

export async function saveTheme(theme: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (error) {
    logError(error as Error, undefined, 'storage.saveTheme');
  }
}

export async function loadTheme(): Promise<ThemeMode | null> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    return value as ThemeMode | null;
  } catch (error) {
    logError(error as Error, undefined, 'storage.loadTheme');
    return null;
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.INCOME,
      STORAGE_KEYS.EXPENSES,
      STORAGE_KEYS.CURRENT_MONTH,
      STORAGE_KEYS.CURRENCY,
      STORAGE_KEYS.ONBOARDING_COMPLETED,
      STORAGE_KEYS.LOCATION,
      STORAGE_KEYS.LANGUAGE,
      STORAGE_KEYS.THEME,
      STORAGE_KEYS.RECURRING_TEMPLATES,
    ]);
  } catch (error) {
    logError(error as Error, undefined, 'storage.clearAllData');
  }
}
