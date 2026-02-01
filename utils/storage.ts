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

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.INCOME,
      STORAGE_KEYS.EXPENSES,
      STORAGE_KEYS.CURRENT_MONTH,
      STORAGE_KEYS.CURRENCY,
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
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
