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
  effectiveRemaining: number; // min(allocated - spent, income - totalSpent), floor 0
  isIncomeLimited: boolean; // true when income pool — not category budget — is the binding constraint
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
  notificationPrefs: NotificationPreferences;
  extraIncomes: ExtraIncome[];  // all months; filter by currentMonth at use site
  debtEntries: DebtEntry[];     // all months
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
  | { type: 'SET_BUDGET_RULE'; payload: BudgetRule }
  | { type: 'SET_NOTIFICATION_PREFS'; payload: NotificationPreferences }
  | { type: 'ADD_EXTRA_INCOME'; payload: ExtraIncome }
  | { type: 'REMOVE_EXTRA_INCOME'; payload: string }   // id
  | { type: 'ADD_DEBT_ENTRY'; payload: DebtEntry }
  | { type: 'REMOVE_DEBT_ENTRY'; payload: string }      // id
  | { type: 'SETTLE_DEBT'; payload: string }            // id → isSettled = true
  | { type: 'IMPORT_EXTRA_INCOMES'; payload: ExtraIncome[] }
  | { type: 'IMPORT_DEBT_ENTRIES'; payload: DebtEntry[] };

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
  extraIncomes: ExtraIncome[];
  debtEntries: DebtEntry[];
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

export interface NotificationPreferences {
  overBudgetAlerts: boolean; // default: true
  dailyReminder: boolean; // default: false
  dailyReminderTime: string; // HH:MM 24h, default: '20:00'
  weeklyDigest: boolean; // default: false
  monthEndSummary: boolean; // default: true
  lastOverBudgetAt: Record<Category, string>; // YYYY-MM to throttle alerts
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  overBudgetAlerts: true,
  dailyReminder: false,
  dailyReminderTime: '20:00',
  weeklyDigest: false,
  monthEndSummary: true,
  lastOverBudgetAt: { needs: '', wants: '', savings: '' },
};

export interface ExtraIncome {
  id: string; // UUID v4
  amount: number; // cents
  description: string; // e.g. "Bonus", "Gift from family"
  month: string; // YYYY-MM
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO timestamp
}

export interface DebtEntry {
  id: string; // UUID v4
  amount: number; // cents — the borrowed amount
  creditor: string; // who the money was borrowed from
  note: string; // optional free-text note
  month: string; // YYYY-MM — month the debt was incurred
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO timestamp
  isSettled: boolean; // default false; toggled by SETTLE_DEBT action
}
