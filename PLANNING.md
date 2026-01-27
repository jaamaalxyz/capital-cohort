# Budget Tracker App - Planning Document

## Overview

A simple, offline-first mobile app for personal monthly budget tracking following the **50/30/20 rule**:
- **50%** for Needs (essentials: rent, utilities, groceries, insurance)
- **30%** for Wants (non-essentials: entertainment, dining out, hobbies)
- **20%** for Savings (savings, investments, debt repayment)

## Tech Stack

- **Framework**: React Native with Expo (managed workflow)
- **Navigation**: Expo Router (file-based routing)
- **Storage**: AsyncStorage for offline-first local data persistence
- **State Management**: React Context + useReducer (simple, no external deps)
- **UI**: Custom components with React Native StyleSheet (no UI library)
- **Language**: TypeScript

## Core Features

### MVP (Phase 1)

1. **Monthly Income Setup**
   - Set total monthly income
   - Auto-calculate 50/30/20 budget allocation
   - View allocated amounts for each category

2. **Expense Tracking**
   - Add expenses with amount, description, date
   - Categorize as Need, Want, or Savings
   - Quick expense entry from home screen

3. **Budget Overview Dashboard**
   - Current month summary
   - Visual progress bars for each category (spent vs allocated)
   - Remaining budget per category
   - Total spent vs total income

4. **Expense History**
   - List of all expenses for current month
   - Filter by category (Needs/Wants/Savings)
   - Delete expense functionality

### Future Enhancements (Phase 2+)

- Monthly history and comparison
- Custom category percentages
- Expense editing
- Data export (CSV)
- Recurring expenses
- Budget alerts/notifications
- Charts and analytics
- Multiple income sources
- Dark mode support

## Design Principles

1. **Simplicity First**: Minimal UI, essential features only
2. **Offline First**: All data stored locally, no internet required
3. **Fast Entry**: Add expenses in under 5 seconds
4. **Clear Visibility**: Budget status always visible at a glance
5. **No Account Required**: Zero setup friction

## Project Timeline

### Phase 1 - MVP
1. Project setup and folder structure
2. Data models and storage layer
3. Home/Dashboard screen
4. Add expense flow
5. Expense list screen
6. Income setup screen
7. Testing and polish

## File Structure

```
/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab-based navigation
│   │   ├── _layout.tsx      # Tab layout configuration
│   │   ├── index.tsx        # Dashboard/Home screen
│   │   ├── expenses.tsx     # Expense list screen
│   │   └── settings.tsx     # Settings/Income screen
│   ├── add-expense.tsx      # Modal: Add new expense
│   ├── _layout.tsx          # Root layout
│   └── +not-found.tsx       # 404 screen
├── components/              # Reusable UI components
│   ├── BudgetCard.tsx       # Category budget display
│   ├── ExpenseItem.tsx      # Single expense row
│   ├── ProgressBar.tsx      # Visual progress indicator
│   ├── AmountInput.tsx      # Currency input field
│   └── CategoryPicker.tsx   # Need/Want/Savings selector
├── context/                 # React Context providers
│   └── BudgetContext.tsx    # Global budget state
├── hooks/                   # Custom React hooks
│   ├── useBudget.ts         # Budget calculations
│   └── useStorage.ts        # AsyncStorage wrapper
├── utils/                   # Utility functions
│   ├── storage.ts           # AsyncStorage operations
│   ├── calculations.ts      # Budget math helpers
│   └── formatters.ts        # Currency/date formatting
├── types/                   # TypeScript definitions
│   └── index.ts             # All type definitions
├── constants/               # App constants
│   └── theme.ts             # Colors, spacing, typography
└── assets/                  # Static assets
    └── images/              # App icons
```

## Success Metrics

- App loads in < 1 second
- Add expense in < 5 taps
- Zero crashes on basic usage
- Works completely offline
- Bundle size < 10MB
