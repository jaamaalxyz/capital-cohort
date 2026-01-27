# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (Screens)                    │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │Dashboard│  │ Expenses │  │ Settings │  │Add Expense│ │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
└───────┼────────────┼────────────┼─────────────┼────────┘
        │            │            │             │
        ▼            ▼            ▼             ▼
┌─────────────────────────────────────────────────────────┐
│              Component Layer (Reusable UI)               │
│  BudgetCard | ProgressBar | ExpenseItem | CategoryPicker│
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  State Layer (Context)                   │
│                    BudgetContext                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ State: income, expenses[], currentMonth         │   │
│  │ Actions: setIncome, addExpense, deleteExpense   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Storage Layer                           │
│                   AsyncStorage                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Keys: @budget_income, @budget_expenses          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Navigation Structure

Using Expo Router (file-based routing):

```
app/
├── _layout.tsx          → Root Stack Navigator
├── (tabs)/
│   ├── _layout.tsx      → Bottom Tab Navigator
│   ├── index.tsx        → Tab 1: Dashboard (Home)
│   ├── expenses.tsx     → Tab 2: Expense List
│   └── settings.tsx     → Tab 3: Settings
├── add-expense.tsx      → Modal Screen (presented over tabs)
└── +not-found.tsx       → 404 fallback
```

### Navigation Flow

```
┌──────────────────────────────────────────┐
│              Root Stack                   │
│  ┌────────────────────────────────────┐  │
│  │          Tab Navigator              │  │
│  │  ┌──────┐ ┌────────┐ ┌──────────┐ │  │
│  │  │ Home │ │Expenses│ │ Settings │ │  │
│  │  └──────┘ └────────┘ └──────────┘ │  │
│  └────────────────────────────────────┘  │
│                    │                      │
│                    │ (modal)              │
│                    ▼                      │
│  ┌────────────────────────────────────┐  │
│  │          Add Expense               │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

## State Management

### BudgetContext Structure

```typescript
interface BudgetState {
  monthlyIncome: number;
  expenses: Expense[];
  currentMonth: string; // YYYY-MM format
  isLoading: boolean;
}

type BudgetAction =
  | { type: 'SET_INCOME'; payload: number }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'LOAD_DATA'; payload: BudgetState }
  | { type: 'SET_MONTH'; payload: string };
```

### Data Flow

1. **App Start**: Load saved data from AsyncStorage → Dispatch LOAD_DATA
2. **User Action**: UI triggers action → Reducer updates state → Effect saves to AsyncStorage
3. **Read**: Components subscribe to context → Re-render on state change

## Storage Strategy

### AsyncStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `@budget_income` | `number` | Monthly income amount |
| `@budget_expenses` | `Expense[]` | All expense records |
| `@budget_month` | `string` | Current active month |

### Data Persistence

```typescript
// Save pattern (on every state change)
useEffect(() => {
  AsyncStorage.setItem('@budget_income', JSON.stringify(state.income));
}, [state.income]);

// Load pattern (on app start)
useEffect(() => {
  const loadData = async () => {
    const income = await AsyncStorage.getItem('@budget_income');
    dispatch({ type: 'LOAD_DATA', payload: JSON.parse(income) });
  };
  loadData();
}, []);
```

## Component Hierarchy

```
App
└── BudgetProvider
    └── RootLayout
        └── TabLayout
            ├── DashboardScreen
            │   ├── MonthSelector
            │   ├── IncomeDisplay
            │   ├── BudgetCard (Needs - 50%)
            │   │   └── ProgressBar
            │   ├── BudgetCard (Wants - 30%)
            │   │   └── ProgressBar
            │   ├── BudgetCard (Savings - 20%)
            │   │   └── ProgressBar
            │   └── AddExpenseButton (FAB)
            │
            ├── ExpensesScreen
            │   ├── CategoryFilter
            │   ├── ExpenseList
            │   │   └── ExpenseItem (multiple)
            │   └── EmptyState
            │
            └── SettingsScreen
                ├── IncomeInput
                └── ResetButton
```

## Error Handling

1. **Storage Errors**: Wrap AsyncStorage calls in try-catch, show user-friendly message
2. **Invalid Input**: Validate before saving (positive numbers, non-empty strings)
3. **Empty State**: Show helpful onboarding when no data exists

## Performance Considerations

1. **Memoization**: Use `useMemo` for expensive calculations (totals, percentages)
2. **List Optimization**: Use `FlatList` with `keyExtractor` for expense lists
3. **Lazy Loading**: Only load current month's data initially
4. **Debounced Saves**: Don't save to storage on every keystroke
