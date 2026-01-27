# Data Models

## Core Types

### Category

```typescript
type Category = 'needs' | 'wants' | 'savings';

const CATEGORY_CONFIG = {
  needs: {
    label: 'Needs',
    percentage: 0.5,
    color: '#4CAF50',    // Green
    description: 'Essential expenses: rent, utilities, groceries, insurance, transportation',
  },
  wants: {
    label: 'Wants',
    percentage: 0.3,
    color: '#2196F3',    // Blue
    description: 'Non-essential: entertainment, dining out, hobbies, subscriptions',
  },
  savings: {
    label: 'Savings',
    percentage: 0.2,
    color: '#9C27B0',    // Purple
    description: 'Savings, investments, emergency fund, debt extra payments',
  },
} as const;
```

### Expense

```typescript
interface Expense {
  id: string;           // UUID v4
  amount: number;       // Positive number, stored in cents to avoid floating point issues
  description: string;  // Brief description (max 100 chars)
  category: Category;   // 'needs' | 'wants' | 'savings'
  date: string;         // ISO date string (YYYY-MM-DD)
  createdAt: string;    // ISO datetime string
}

// Example:
const expense: Expense = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  amount: 5000,         // $50.00 in cents
  description: 'Grocery shopping',
  category: 'needs',
  date: '2024-01-15',
  createdAt: '2024-01-15T10:30:00.000Z',
};
```

### Budget State

```typescript
interface BudgetState {
  monthlyIncome: number;      // Monthly income in cents
  expenses: Expense[];        // All expenses (all months)
  currentMonth: string;       // Active month in YYYY-MM format
  isLoading: boolean;         // True during initial data load
}

// Initial state:
const initialState: BudgetState = {
  monthlyIncome: 0,
  expenses: [],
  currentMonth: '2024-01',   // Derived from current date
  isLoading: true,
};
```

### Budget Summary (Calculated)

```typescript
interface CategoryBudget {
  allocated: number;    // Budget for this category (income * percentage)
  spent: number;        // Sum of expenses in this category
  remaining: number;    // allocated - spent
  percentage: number;   // spent / allocated * 100
  isOverBudget: boolean;
}

interface BudgetSummary {
  income: number;
  totalSpent: number;
  totalRemaining: number;
  needs: CategoryBudget;
  wants: CategoryBudget;
  savings: CategoryBudget;
}

// Example calculation:
function calculateBudget(income: number, expenses: Expense[]): BudgetSummary {
  const needsSpent = expenses
    .filter(e => e.category === 'needs')
    .reduce((sum, e) => sum + e.amount, 0);

  const needsAllocated = income * 0.5;

  return {
    income,
    totalSpent: /* sum all categories */,
    totalRemaining: income - totalSpent,
    needs: {
      allocated: needsAllocated,
      spent: needsSpent,
      remaining: needsAllocated - needsSpent,
      percentage: (needsSpent / needsAllocated) * 100,
      isOverBudget: needsSpent > needsAllocated,
    },
    // ... wants, savings
  };
}
```

## Storage Schema

### AsyncStorage Keys

```typescript
const STORAGE_KEYS = {
  INCOME: '@budget_income',
  EXPENSES: '@budget_expenses',
  CURRENT_MONTH: '@budget_current_month',
} as const;
```

### Stored Data Format

```typescript
// @budget_income
type StoredIncome = number; // Income in cents
// Example: 500000 (represents $5,000.00)

// @budget_expenses
type StoredExpenses = Expense[];
// Example: [{ id: '...', amount: 5000, ... }, ...]

// @budget_current_month
type StoredMonth = string; // YYYY-MM format
// Example: '2024-01'
```

## Context Actions

```typescript
type BudgetAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INCOME'; payload: number }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }  // expense ID
  | { type: 'LOAD_DATA'; payload: Partial<BudgetState> }
  | { type: 'SET_MONTH'; payload: string }
  | { type: 'RESET_ALL' };
```

## Utility Functions

```typescript
// Generate unique ID
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Get current month string
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Filter expenses by month
function getExpensesForMonth(expenses: Expense[], month: string): Expense[] {
  return expenses.filter(e => e.date.startsWith(month));
}

// Format cents to currency string
function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Parse currency string to cents
function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  return Math.round(parseFloat(cleaned) * 100) || 0;
}
```

## Validation Rules

```typescript
interface ValidationResult {
  isValid: boolean;
  error?: string;
}

function validateExpense(expense: Partial<Expense>): ValidationResult {
  if (!expense.amount || expense.amount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }

  if (!expense.description?.trim()) {
    return { isValid: false, error: 'Description is required' };
  }

  if (expense.description.length > 100) {
    return { isValid: false, error: 'Description must be under 100 characters' };
  }

  if (!['needs', 'wants', 'savings'].includes(expense.category!)) {
    return { isValid: false, error: 'Invalid category' };
  }

  return { isValid: true };
}

function validateIncome(income: number): ValidationResult {
  if (income < 0) {
    return { isValid: false, error: 'Income cannot be negative' };
  }

  if (income > 100000000) { // $1,000,000 max
    return { isValid: false, error: 'Income exceeds maximum allowed' };
  }

  return { isValid: true };
}
```

## Sample Data

```typescript
const sampleExpenses: Expense[] = [
  {
    id: '1',
    amount: 150000,  // $1,500
    description: 'Monthly rent',
    category: 'needs',
    date: '2024-01-01',
    createdAt: '2024-01-01T09:00:00.000Z',
  },
  {
    id: '2',
    amount: 8500,    // $85
    description: 'Electric bill',
    category: 'needs',
    date: '2024-01-05',
    createdAt: '2024-01-05T14:30:00.000Z',
  },
  {
    id: '3',
    amount: 4500,    // $45
    description: 'Netflix + Spotify',
    category: 'wants',
    date: '2024-01-01',
    createdAt: '2024-01-01T10:00:00.000Z',
  },
  {
    id: '4',
    amount: 50000,   // $500
    description: 'Savings transfer',
    category: 'savings',
    date: '2024-01-01',
    createdAt: '2024-01-01T11:00:00.000Z',
  },
];
```
