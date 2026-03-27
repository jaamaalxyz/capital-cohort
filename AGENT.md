# AGENT.md — Capital Cohort

> **Pitch**: The professional-grade template trusted by authors to launch their books as premium web and mobile apps.
> **App tagline**: Personalize money management for all.

---

## What This Is

Offline-first React Native / Expo budgeting app implementing the **50/30/20 rule**:
- 50% → Needs · 30% → Wants · 20% → Savings

No backend. No auth. All data is local (AsyncStorage).

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React Native + Expo ~54 (managed workflow) |
| Navigation | Expo Router v6 (file-based) |
| State | React Context + useReducer (`BudgetContext`) |
| Persistence | AsyncStorage (all data local) |
| Language | TypeScript |
| i18n | i18next + react-i18next (EN + BN locales) |
| Charts | react-native-svg (custom chart components) |
| Tests | Jest + jest-expo + @testing-library/react-native |

---

## Project Layout

```
app/                    # Screens — Expo Router auto-registers
  _layout.tsx           # Root layout: BudgetProvider + SafeAreaProvider + onboarding gate
  onboarding.tsx        # First-run onboarding flow
  add-expense.tsx       # Modal: add one-time expense
  add-recurring.tsx     # Modal: add recurring template
  recurring.tsx         # Manage recurring templates
  (tabs)/
    _layout.tsx         # Tab bar config
    index.tsx           # Dashboard (budget overview + BudgetCards)
    expenses.tsx        # Expense list with month filter
    reports.tsx         # Spending trends / charts
    settings.tsx        # Income, currency, language, theme, location, export/import, reset

components/             # Reusable UI
  BudgetCard.tsx        # Category card with progress bar
  ExpenseItem.tsx       # Single expense row (swipe-to-delete)
  RecurringItem.tsx     # Recurring template row
  AmountInput.tsx       # Currency-aware number input
  CategoryPicker.tsx    # needs/wants/savings selector
  ProgressBar.tsx       # Visual progress ring/bar
  ScreenContainer.tsx   # Common screen wrapper
  ThemePicker.tsx       # Light / dark / auto selector
  charts/               # SVG chart components

context/
  BudgetContext.tsx     # Single source of truth — see State section
  ThemeContext.tsx      # Light/dark/auto theme switching

types/index.ts          # All TypeScript interfaces (canonical reference)

constants/
  theme.ts              # COLORS (light+dark), SPACING, FONT_SIZE, CATEGORY_CONFIG, STORAGE_KEYS
  currencies.ts         # Currency list + DEFAULT_CURRENCY

utils/
  storage.ts            # AsyncStorage CRUD (keyed by STORAGE_KEYS)
  calculations.ts       # calculateBudgetSummary, getExpensesForMonth
  formatters.ts         # formatCurrency, formatDate, getCurrentMonth, generateId (UUID v4)
  validation.ts         # validateExpense, validateIncome → ValidationResult
  recurringExpenses.ts  # materializeAllForMonth (auto-create expenses from templates)
  reportCalculations.ts # MonthlySnapshot, ReportData aggregation
  exportData.ts         # JSON / CSV export (ExportPayload)
  importData.ts         # Import from exported file
  localization.ts       # i18n helpers, locale detection

i18n/
  index.ts              # i18next init
  locales/en.ts         # English strings
  locales/bn.ts         # Bengali strings

__tests__/              # Mirrors src structure
  components/ context/ integration/ screens/ utils/
```

---

## Core Data Model (`types/index.ts`)

```ts
type Category = 'needs' | 'wants' | 'savings';

interface Expense {
  id: string;           // UUID v4
  amount: number;       // CENTS (integer) — never floats
  description: string;
  category: Category;
  date: string;         // 'YYYY-MM-DD'
  createdAt: string;    // ISO datetime
  recurringTemplateId?: string;
}

interface RecurringTemplate {
  id: string;
  amount: number;       // cents
  description: string;
  category: Category;
  dayOfMonth: number;   // 1–28
  isActive: boolean;
  createdAt: string;
  lastMaterializedMonth?: string; // 'YYYY-MM'
}

interface BudgetState {
  monthlyIncome: number;          // cents
  expenses: Expense[];
  currentMonth: string;           // 'YYYY-MM'
  isLoading: boolean;
  currency: string;               // ISO 4217 (e.g. 'USD')
  location?: LocationPreference;
  onboardingCompleted: boolean;
  recurringTemplates: RecurringTemplate[];
}
```

---

## State Management

**Single context**: `useBudget()` from `context/BudgetContext.tsx`

Available actions (dispatch via typed action objects):
`SET_INCOME` · `ADD_EXPENSE` · `DELETE_EXPENSE` · `SET_MONTH` · `SET_CURRENCY` · `SET_LOCATION` · `COMPLETE_ONBOARDING` · `RESET_ALL` · `ADD_RECURRING_TEMPLATE` · `UPDATE_RECURRING_TEMPLATE` · `DELETE_RECURRING_TEMPLATE` · `MATERIALIZE_RECURRING` · `LOAD_DATA` · `SET_LOADING`

Exposed context API:
```ts
{ state, summary, currentMonthExpenses,
  setIncome, addExpense, deleteExpense, setMonth, setCurrency,
  setLocation, completeOnboarding, resetAll, loadData,
  addRecurringTemplate, updateRecurringTemplate, deleteRecurringTemplate }
```

Persistence: each state slice is saved via dedicated `useEffect` (income, expenses, currency, location, onboarding, recurringTemplates). On mount, all slices are loaded in parallel via `Promise.all`.

Recurring materialization runs automatically after `isLoading` becomes `false` and on `currentMonth` change.

---

## Key Conventions

| Rule | Detail |
|---|---|
| Money | Always **cents** (integer). Display via `formatCurrency()` |
| Dates | `date` field is `YYYY-MM-DD`; `createdAt` is full ISO string |
| Month | `YYYY-MM` string (e.g. `"2025-01"`) |
| IDs | UUID v4, generated client-side via `generateId()` in `utils/formatters.ts` |
| Styling | React Native `StyleSheet` only — no external UI lib |
| Theme | Read colors from `ThemeContext` (`useTheme()`), not from `constants/theme.ts` directly |
| Storage keys | Always use `STORAGE_KEYS` constants from `constants/theme.ts` |
| Expenses vs month | An expense belongs to the month of its `date` field, **not** `createdAt` |

---

## How To Add Things

### New Screen
1. Create file in `app/` — Expo Router auto-registers routes
2. Tab screens → `app/(tabs)/`; update `(tabs)/_layout.tsx`
3. Modals → `app/` root; add `<Stack.Screen>` in `app/_layout.tsx`

### New Component
1. Create in `components/`
2. Import theme via `useTheme()` from `context/ThemeContext.tsx`
3. Type props with TypeScript interface

### New State Field
1. Add to `BudgetState` in `types/index.ts`
2. Add action type to `BudgetAction` union in `types/index.ts`
3. Handle in `budgetReducer` in `context/BudgetContext.tsx`
4. Add persistence: key in `STORAGE_KEYS`, save/load in `utils/storage.ts`, wire `useEffect` in `BudgetContext`

### New i18n String
1. Add key to `i18n/locales/en.ts`
2. Mirror key in `i18n/locales/bn.ts`
3. Use `useTranslation()` hook in component

---

## Dev Commands

```bash
npm start           # Expo dev server
npm run ios         # iOS simulator
npm run android     # Android emulator
npm run web         # Web browser

npm test            # Run all tests
npm run test:watch  # Watch mode
npm run test:coverage
npx tsc --noEmit    # Type check
```

---

## Constraints & Gotchas

- **Offline only** — no network calls, no backend, no auth
- **No future months** — month navigation is capped at current month
- **Amounts in cents** — always convert before display; never store floats
- **Recurring templates** cap `dayOfMonth` at 28 to handle February
- `recurringTemplateId` on an `Expense` links it back to its source template
- `lastMaterializedMonth` on a template prevents double-materialization
- `expo-document-picker`, `expo-file-system`, `expo-sharing` power export/import in Settings
- `expo-location` used for location preference (optional, no tracking)
