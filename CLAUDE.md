# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Capital Cohort** - Personalize money management for all.

An offline-first React Native mobile app for monthly budgeting following the **50/30/20 rule**:

- 50% for Needs (essentials)
- 30% for Wants (non-essentials)
- 20% for Savings

Budget rules are customizable — three presets (50/30/20, 70/20/10, 60/20/20) or fully custom, must sum to 100%.

## Tech Stack

- **React Native** with **Expo** (managed workflow)
- **Expo Router** for file-based navigation
- **AsyncStorage** for local data persistence
- **React Context + useReducer** for state management
- **TypeScript** for type safety
- **i18next** for localization (English + Bengali)

## Key Files & Architecture

### Entry Points

- `app/_layout.tsx` - Root layout; initializes i18n, wraps app with `I18nextProvider`, `ThemeProvider`, `BudgetProvider`, `SafeAreaProvider`; handles onboarding redirect; wraps `AppContent` in `ErrorBoundary`
- `app/(tabs)/_layout.tsx` - Tab navigator (Home, Expenses, Reports, Settings)

### State Management

- `context/BudgetContext.tsx` - Global state with reducer pattern
  - Manages: income, expenses, currentMonth, currency, location, recurringTemplates, budgetRule, notificationPrefs, onboardingCompleted
  - Auto-persists every slice to AsyncStorage via individual useEffects (one per state key)
  - Materializes recurring templates when month changes or on first load
  - Triggers `scheduleOverBudgetAlert` when a category goes over budget (throttled per category/month via `lastOverBudgetAt`)
- `context/ThemeContext.tsx` - Light/dark/auto theme, persisted to AsyncStorage

### Data Types

- `types/index.ts` - All TypeScript interfaces
  - `Expense`: id, amount (cents), description, category, date, createdAt, recurringTemplateId?
  - `Category`: `'needs' | 'wants' | 'savings'`
  - `BudgetRule`: `{ needs: number, wants: number, savings: number }` — percentages summing to 100
  - `RecurringTemplate`: recurring expense definition with dayOfMonth, isActive, lastMaterializedMonth
  - `NotificationPreferences`: over-budget alerts, daily reminder, weekly digest, month-end summary, lastOverBudgetAt throttle map
  - `LocationPreference`: latitude, longitude, address, city, country

### Utilities

- `utils/storage.ts` - AsyncStorage CRUD; all `loadX()` return safe defaults on corruption and call `logError`
- `utils/calculations.ts` - Budget math; `calculateCategoryBudget` accepts a `BudgetRule` parameter
- `utils/notifications.ts` - Expo Notifications wrapper (over-budget alerts, daily reminder, weekly digest, month-end summary)
- `utils/notificationMessages.ts` - Pure message builders for all notification types
- `utils/recurringExpenses.ts` - Materialize recurring templates into expenses; handles month-end day capping (Feb 28/29 etc.)
- `utils/budgetRules.ts` - Validate/detect/adjust budget rules; `adjustThirdCategory` keeps total at 100%
- `utils/filterExpenses.ts` - Client-side filter/search/sort pipeline for Expenses screen
- `utils/reportCalculations.ts` - Monthly snapshots, average daily spend, top category
- `utils/exportData.ts` / `utils/importData.ts` - CSV and JSON backup/restore
- `utils/errorLogger.ts` - Safe error logging (self-protected against recursive crashes)
- `hooks/useExpenseFilters.ts` - Filter state hook for the Expenses screen

### Constants

- `constants/theme.ts` - Colors (light/dark), spacing, fonts, category config, `STORAGE_KEYS`
- `constants/budgetPresets.ts` - `BUDGET_PRESETS`, `DEFAULT_BUDGET_RULE`
- `constants/currencies.ts` - 150+ currencies; `getCurrencyByCode(code)`

## Code Conventions

- **Amounts**: Stored in cents (integer) to avoid floating-point issues
- **Dates**: ISO strings (`YYYY-MM-DD` for dates, full ISO for timestamps)
- **Month format**: `YYYY-MM` string (e.g., `"2024-01"`)
- **IDs**: UUID v4 format generated client-side via `generateId()`
- **Styling**: React Native `StyleSheet`, no external UI library; theme colors via `useTheme()`
- **State**: React Context + useReducer only — no Redux/MobX

## Modifying State

1. Add action type to `BudgetAction` in `types/index.ts`
2. Handle in reducer in `context/BudgetContext.tsx`
3. Add storage key to `STORAGE_KEYS` in `constants/theme.ts` if persistence needed
4. Add `saveX`/`loadX` in `utils/storage.ts` with try/catch + `logError` + safe default
5. Wire up a persistence `useEffect` in `BudgetContext.tsx`
6. Expose dispatcher via context value

## Testing Commands

```bash
# Type check (no output = success)
npx tsc --noEmit

# Run all tests (non-interactive)
npm test -- --watchAll=false

# Run a single test file
npm test -- --watchAll=false __tests__/utils/storage.test.ts

# Run with coverage
npm run test:coverage

# Start development server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web
```

## Testing Conventions

- Coverage threshold: **80%** (branches, functions, lines, statements)
- Test files mirror source structure under `__tests__/`: `utils/`, `components/`, `screens/`, `hooks/`, `integration/`, `context/`
- Integration tests render a full `BudgetProvider` tree — see `__tests__/integration/` for patterns
- All Expo module mocks live in `jest.setup.ts`; add new mocks there when introducing new Expo SDK usage

### expo-notifications mock gotcha

`jest.setup.ts` must mock **both** `AndroidImportance` and `AndroidNotificationPriority` (they are separate enums).
`SchedulableTriggerInputTypes` must include `DATE` — omitting it causes `undefined` errors in tests.
`DailyTriggerInput` and `WeeklyTriggerInput` have **no `repeats` field**; `DateTriggerInput` requires an explicit `type` field.

## Important Notes

- App is **offline-first** — all data local, no backend
- **No authentication** — zero friction onboarding
- Amounts displayed as currency but stored as **cents** (integer)
- Expenses belong to the month of their `date` field, not `createdAt`
- `ExpenseItem` shows a `↻` badge when `expense.recurringTemplateId` is set

## Environment Quirks

- `head` is not the standard Unix utility on this machine — piping `| head -n N` will fail. Use `tail` or avoid the pipe.
- `npx tsc --noEmit` prints **nothing** on success (zero output = clean).
