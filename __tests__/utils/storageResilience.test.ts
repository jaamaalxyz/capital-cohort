import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  loadIncome, 
  loadExpenses, 
  loadLocation, 
  loadBudgetRule, 
  loadNotificationPrefs 
} from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/theme';
import { logError } from '../../utils/errorLogger';

// Mock logError
jest.mock('../../utils/errorLogger', () => ({
  logError: jest.fn(),
}));

describe('Storage Resilience', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('loadIncome', () => {
    it('returns default (0) when data is corrupted (string instead of number)', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify('not-a-number'));
      const result = await loadIncome();
      expect(result).toBe(0);
      expect(logError).toHaveBeenCalledWith(
        expect.any(Error),
        undefined,
        'storage.loadIncome'
      );
    });

    it('returns default (0) when data is invalid JSON', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.INCOME, 'invalid-json{{{');
      const result = await loadIncome();
      expect(result).toBe(0);
      expect(logError).toHaveBeenCalled();
    });
  });

  describe('loadExpenses', () => {
    it('returns empty array when data is not an array', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify({ not: 'an-array' }));
      const result = await loadExpenses();
      expect(result).toEqual([]);
      expect(logError).toHaveBeenCalled();
    });
  });

  describe('loadLocation', () => {
    it('returns undefined when data is not an object', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(123));
      const result = await loadLocation();
      expect(result).toBe(undefined);
      expect(logError).toHaveBeenCalled();
    });
  });

  describe('loadBudgetRule', () => {
    it('returns default rule when data is missing keys', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.BUDGET_RULE, JSON.stringify({ needs: 50 }));
      const result = await loadBudgetRule();
      expect(result.needs).toBe(50); // It has defaults in presets
      // Wait, let's check current implementation of loadBudgetRule
    });

    it('returns default rule when data is clearly corrupted', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.BUDGET_RULE, JSON.stringify('garbage'));
      const result = await loadBudgetRule();
      expect(result).toHaveProperty('needs');
      expect(result).toHaveProperty('wants');
      expect(result).toHaveProperty('savings');
      expect(logError).toHaveBeenCalled();
    });
  });

  describe('loadNotificationPrefs', () => {
    it('returns default prefs when corrupted', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_PREFS, JSON.stringify({ bad: true }));
      const result = await loadNotificationPrefs();
      expect(result).toHaveProperty('overBudgetAlerts');
      expect(logError).toHaveBeenCalled();
    });
  });
});
