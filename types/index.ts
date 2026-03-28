export enum AppLanguage {
  EN = 'en',
  BN = 'bn',
}

export type LanguageCode = 'en' | 'bn';

export type ThemeMode = 'auto' | 'dark' | 'light';

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
  recurringTemplateId?: string; // links to source RecurringTemplate
}

export interface RecurringTemplate {
  id: string;             // UUID v4
  amount: number;         // cents
  description: string;
  category: Category;
  dayOfMonth: number;     // 1–28 (capped to handle Feb)
  isActive: boolean;
  createdAt: string;      // ISO datetime
  lastMaterializedMonth?: string; // YYYY-MM — tracks last auto-creation
}

export interface CategoryConfig {
  label: string;
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
  recurringTemplates: RecurringTemplate[];
  budgetRule: BudgetRule;
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
  | { type: 'RESET_ALL' }
  | { type: 'ADD_RECURRING_TEMPLATE'; payload: RecurringTemplate }
  | { type: 'UPDATE_RECURRING_TEMPLATE'; payload: RecurringTemplate }
  | { type: 'DELETE_RECURRING_TEMPLATE'; payload: string }
  | { type: 'MATERIALIZE_RECURRING'; payload: { expenses: Expense[]; templates: RecurringTemplate[] } }
  | { type: 'SET_BUDGET_RULE'; payload: BudgetRule };

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface MonthlySnapshot {
  month: string;    // YYYY-MM
  needs: number;    // cents spent
  wants: number;
  savings: number;
  total: number;
}

export interface ReportData {
  snapshots: MonthlySnapshot[];   // last N months, oldest first
  currentMonthBreakdown: {
    needs: number;
    wants: number;
    savings: number;
  };
  averageDailySpend: number;      // cents
  topCategory: Category | null;
  totalSpentAllTime: number;
}

export interface ExportPayload {
  version: number;        // schema version for future migrations
  exportedAt: string;     // ISO datetime
  currency: string;
  monthlyIncome: number;
  expenses: Expense[];
}

export type ExportFormat = 'csv' | 'json';

export type SortOrder =
  | 'date_desc'    // newest first (default)
  | 'date_asc'     // oldest first
  | 'amount_desc'  // highest first
  | 'amount_asc';  // lowest first

export interface ExpenseFilters {
  query: string;             // free-text search
  categories: Category[];    // empty = show all
  dateFrom?: string;         // YYYY-MM-DD
  dateTo?: string;           // YYYY-MM-DD
  sortOrder: SortOrder;
}

export const DEFAULT_EXPENSE_FILTERS: ExpenseFilters = {
  query: '',
  categories: [],
  dateFrom: undefined,
  dateTo: undefined,
  sortOrder: 'date_desc',
};

export interface AppError {
  message: string;
  componentStack?: string;
  timestamp: string;
  context?: string; // e.g., 'dashboard', 'add-expense'
}

export interface BudgetRule {
  needs: number; // integer percentage, e.g., 50
  wants: number; // e.g., 30
  savings: number; // e.g., 20
}

export type BudgetPresetKey = '50-30-20' | '70-20-10' | '60-20-20' | 'custom';

export interface BudgetPreset {
  key: BudgetPresetKey;
  label: string;
  rule: BudgetRule;
}
