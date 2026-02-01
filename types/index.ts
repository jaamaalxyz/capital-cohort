export enum AppLanguage {
  EN = 'en',
  BN = 'bn',
}

export type LanguageCode = 'en' | 'bn';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export type Category = 'needs' | 'wants' | 'savings';

export interface Expense {
  id: string;
  amount: number; // stored in cents
  description: string;
  category: Category;
  date: string; // YYYY-MM-DD format
  createdAt: string; // ISO datetime string
}

export interface CategoryConfig {
  label: string;
  percentage: number;
  color: string;
  icon: string;
  description: string;
}

export interface CategoryBudget {
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

export interface BudgetSummary {
  income: number;
  totalSpent: number;
  totalRemaining: number;
  needs: CategoryBudget;
  wants: CategoryBudget;
  savings: CategoryBudget;
}

export interface LocationPreference {
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  district?: string;
  region?: string;
  country?: string;
}

export interface CountryConfig {
  language: LanguageCode;
  currency: string;
}

export interface BudgetState {
  monthlyIncome: number;
  expenses: Expense[];
  currentMonth: string; // YYYY-MM format
  isLoading: boolean;
  currency: string; // ISO 4217 currency code (e.g., 'USD')
  location?: LocationPreference;
  onboardingCompleted: boolean;
}

export type BudgetAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INCOME'; payload: number }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'LOAD_DATA'; payload: Partial<BudgetState> }
  | { type: 'SET_MONTH'; payload: string }
  | { type: 'SET_CURRENCY'; payload: string }
  | { type: 'SET_LOCATION'; payload: LocationPreference | undefined }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'RESET_ALL' };

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}
