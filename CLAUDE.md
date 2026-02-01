# CLAUDE.md

This file provides context for Claude Code (AI assistant) when working on this project.

## Project Overview

**Capital Cohort** - Personalize money management for all.

A personalize, offline-first React Native mobile app for monthly budgeting, investment and all about your financial tracking following the **50/30/20 rule** of core financial literacy for all guide:

- 50% for Needs (essentials)
- 30% for Wants (non-essentials)
- 20% for Savings

## Tech Stack

- **React Native** with **Expo** (managed workflow)
- **Expo Router** for file-based navigation
- **AsyncStorage** for local data persistence
- **React Context + useReducer** for state management
- **TypeScript** for type safety

## Key Files & Architecture

### Entry Points

- `app/_layout.tsx` - Root layout, wraps app with BudgetProvider and SafeAreaProvider
- `app/(tabs)/_layout.tsx` - Tab navigator configuration

### State Management

- `context/BudgetContext.tsx` - Global state with reducer pattern
  - Manages: `monthlyIncome`, `expenses[]`, `currentMonth`, `isLoading`
  - Provides: `setIncome()`, `addExpense()`, `deleteExpense()`, `setMonth()`, `resetAll()`
  - Auto-persists to AsyncStorage on state changes

### Data Types

- `types/index.ts` - All TypeScript interfaces
  - `Expense`: id, amount (cents), description, category, date, createdAt
  - `Category`: 'needs' | 'wants' | 'savings'
  - `BudgetSummary`: calculated budget breakdown

### Screens

- `app/(tabs)/index.tsx` - Dashboard with budget overview
- `app/(tabs)/expenses.tsx` - Expense list with filtering
- `app/(tabs)/settings.tsx` - Income configuration
- `app/add-expense.tsx` - Modal for adding expenses

### Components

- `components/BudgetCard.tsx` - Category budget display with progress bar
- `components/ExpenseItem.tsx` - Single expense row with delete
- `components/AmountInput.tsx` - Currency input field
- `components/CategoryPicker.tsx` - Category selection cards
- `components/ProgressBar.tsx` - Visual budget consumption

### Utilities

- `utils/storage.ts` - AsyncStorage CRUD operations
- `utils/calculations.ts` - Budget math (category totals, summaries)
- `utils/formatters.ts` - Currency/date formatting, ID generation
- `utils/validation.ts` - Input validation for expenses/income

### Constants

- `constants/theme.ts` - Colors, spacing, fonts, category config

## Common Tasks

### Adding a New Screen

1. Create file in `app/` directory (Expo Router auto-registers)
2. For tabs: add to `app/(tabs)/` and update `_layout.tsx`
3. For modals: add to `app/` root and configure in `app/_layout.tsx`

### Adding a New Component

1. Create in `components/` directory
2. Import theme constants from `constants/theme.ts`
3. Use TypeScript interfaces for props

### Modifying State

1. Add action type to `BudgetAction` in `types/index.ts`
2. Handle in reducer in `context/BudgetContext.tsx`
3. Expose via context value if needed by components

### Adding Storage

1. Add key to `STORAGE_KEYS` in `constants/theme.ts`
2. Add save/load functions in `utils/storage.ts`
3. Wire up persistence in `BudgetContext.tsx` useEffect

## Code Conventions

- **Amounts**: Stored in cents (integer) to avoid floating-point issues
- **Dates**: ISO strings (YYYY-MM-DD for dates, full ISO for timestamps)
- **Month format**: YYYY-MM string (e.g., "2024-01")
- **IDs**: UUID v4 format generated client-side
- **Styling**: React Native StyleSheet, no external UI library
- **State**: React Context + useReducer, no Redux/MobX

## Testing Commands

```bash
# Type check
npx tsc --noEmit

# Start development server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web
```

## Important Notes

- App is **offline-first** - all data local, no backend
- **No authentication** - zero friction onboarding
- Amounts displayed as currency but stored as **cents** (integer)
- Month navigation limited to current month (can't go to future)
- Expenses belong to the month of their `date` field, not `createdAt`

## File Structure Summary

```
app/                 # Screens (Expo Router)
components/          # Reusable UI components
context/             # React Context providers
types/               # TypeScript definitions
utils/               # Helper functions
constants/           # Theme, config
docs/                # Planning documents
assets/              # Images, icons
```
