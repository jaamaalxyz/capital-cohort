import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/theme';
import { Expense } from '../types';
import { DEFAULT_CURRENCY } from '../constants/currencies';

export async function saveIncome(income: number): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify(income));
  } catch (error) {
    console.error('Error saving income:', error);
  }
}

export async function loadIncome(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.INCOME);
    return value ? JSON.parse(value) : 0;
  } catch (error) {
    console.error('Error loading income:', error);
    return 0;
  }
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (error) {
    console.error('Error saving expenses:', error);
  }
}

export async function loadExpenses(): Promise<Expense[]> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.error('Error loading expenses:', error);
    return [];
  }
}

export async function saveCurrency(currency: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
  } catch (error) {
    console.error('Error saving currency:', error);
  }
}

export async function loadCurrency(): Promise<string> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.CURRENCY);
    return value ?? DEFAULT_CURRENCY;
  } catch (error) {
    console.error('Error loading currency:', error);
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
    console.error('Error saving location:', error);
  }
}

export async function loadLocation(): Promise<any> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION);
    return value ? JSON.parse(value) : undefined;
  } catch (error) {
    console.error('Error loading location:', error);
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
    console.error('Error saving onboarding status:', error);
  }
}

export async function loadOnboardingCompleted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return value ? JSON.parse(value) : false;
  } catch (error) {
    console.error('Error loading onboarding status:', error);
    return false;
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
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}
