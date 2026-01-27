import { CategoryConfig } from '../types';

export const COLORS = {
  // Category colors
  needs: '#4CAF50',
  wants: '#2196F3',
  savings: '#9C27B0',

  // UI colors
  background: '#F5F5F5',
  card: '#FFFFFF',
  textPrimary: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
  error: '#F44336',
  success: '#4CAF50',

  // Progress bar
  progressBackground: '#E0E0E0',
  overBudget: '#F44336',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const FONT_SIZE = {
  h1: 24,
  h2: 20,
  h3: 16,
  body: 16,
  bodySmall: 14,
  caption: 12,
  amountLarge: 32,
  amount: 18,
};

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  needs: {
    label: 'Needs',
    percentage: 0.5,
    color: COLORS.needs,
    icon: '🏠',
    description: 'Essentials: rent, utilities, groceries, insurance',
  },
  wants: {
    label: 'Wants',
    percentage: 0.3,
    color: COLORS.wants,
    icon: '🎮',
    description: 'Non-essentials: entertainment, dining out, hobbies',
  },
  savings: {
    label: 'Savings',
    percentage: 0.2,
    color: COLORS.savings,
    icon: '💰',
    description: 'Savings, investments, emergency fund',
  },
};

export const STORAGE_KEYS = {
  INCOME: '@budget_income',
  EXPENSES: '@budget_expenses',
  CURRENT_MONTH: '@budget_current_month',
} as const;
