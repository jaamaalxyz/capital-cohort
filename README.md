# Capital Cohort

**Personalize money management for all**

A personalize, offline-first React Native mobile app for monthly budgeting, investment and all about your financial tracking following the **50/30/20 rule** of core financial literacy for all guide.

## The 50/30/20 Rule

A popular budgeting framework that divides your after-tax income into three categories:

| Category       | Percentage | Purpose                                                                   |
| -------------- | ---------- | ------------------------------------------------------------------------- |
| 🏠 **Needs**   | 50%        | Essential expenses: rent, utilities, groceries, insurance, transportation |
| 🎮 **Wants**   | 30%        | Non-essentials: entertainment, dining out, hobbies, subscriptions         |
| 💰 **Savings** | 20%        | Savings, investments, emergency fund, debt repayment                      |

## Features

- **Dashboard** - View your monthly budget at a glance with visual progress bars
- **Expense Tracking** - Quickly add expenses categorized as Needs, Wants, or Savings
- **Expense History** - Browse and filter expenses by category
- **Multi-Currency Support** - Choose from 150+ world currencies
- **Month Navigation** - View budgets from previous months
- **Offline-First** - All data stored locally, no internet required
- **No Account Required** - Zero setup friction, start tracking immediately

## Screenshots

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│     Dashboard       │  │     Expenses        │  │     Settings        │
│                     │  │                     │  │                     │
│  January 2024       │  │  [All] [Needs]...   │  │  Monthly Income     │
│                     │  │                     │  │  $ 5,000.00         │
│  Income: $5,000     │  │  Jan 15, 2024       │  │                     │
│  ─────────────────  │  │  🏠 Groceries  $85  │  │  50% → $2,500       │
│                     │  │  🎮 Netflix    $15  │  │  30% → $1,500       │
│  🏠 NEEDS (50%)     │  │                     │  │  20% → $1,000       │
│  ████████░░ $1,850  │  │  Jan 10, 2024       │  │                     │
│  of $2,500          │  │  🏠 Electric   $85  │  │  Currency: $ USD    │
│                     │  │                     │  │                     │
│  🎮 WANTS (30%)     │  └─────────────────────┘  └─────────────────────┘
│  ████░░░░░░ $650    │
│  of $1,500          │
│                     │
│  💰 SAVINGS (20%)   │
│  ██████████ $1,000  │
│  of $1,000 ✓        │
│                [+]  │
└─────────────────────┘
```

## Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (managed workflow)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing)
- **Storage**: [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) for offline-first local persistence
- **State Management**: React Context + useReducer
- **Language**: TypeScript

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/client) app on your phone (for testing on device)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/jaamaalxyz/capital-cohort.git
   cd capital-cohort
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Run on your device:
   - **iOS/Android**: Scan the QR code with Expo Go app
   - **Web**: Press `w` in the terminal
   - **iOS Simulator**: Press `i` (macOS only)
   - **Android Emulator**: Press `a`

## Project Structure

```
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab-based navigation
│   │   ├── _layout.tsx      # Tab navigator configuration
│   │   ├── index.tsx        # Dashboard (Home tab)
│   │   ├── expenses.tsx     # Expense list (Expenses tab)
│   │   └── settings.tsx     # Settings (Settings tab)
│   ├── add-expense.tsx      # Add expense modal
│   ├── _layout.tsx          # Root layout with providers
│   └── +not-found.tsx       # 404 fallback screen
├── components/              # Reusable UI components
│   ├── AmountInput.tsx      # Currency input field
│   ├── BudgetCard.tsx       # Category budget display card
│   ├── CategoryPicker.tsx   # Need/Want/Savings selector
│   ├── ExpenseItem.tsx      # Single expense row
│   └── ProgressBar.tsx      # Visual progress indicator
├── context/                 # React Context providers
│   └── BudgetContext.tsx    # Global budget state management
├── types/                   # TypeScript type definitions
│   └── index.ts             # All app types and interfaces
├── utils/                   # Utility functions
│   ├── calculations.ts      # Budget calculation helpers
│   ├── formatters.ts        # Currency/date formatting
│   ├── storage.ts           # AsyncStorage operations
│   └── validation.ts        # Input validation
├── constants/               # App constants
│   ├── theme.ts             # Colors, spacing, typography
│   └── currencies.ts        # 150+ world currencies
├── docs/                    # Planning documentation
│   ├── ARCHITECTURE.md      # Technical architecture
│   ├── DATA_MODELS.md       # Data structures
│   └── SCREENS.md           # UI wireframes
└── assets/                  # Static assets (icons, images)
```

## Available Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm start`       | Start the Expo development server  |
| `npm run android` | Start and open on Android emulator |
| `npm run ios`     | Start and open on iOS simulator    |
| `npm run web`     | Start and open in web browser      |

## Data Storage

All data is stored locally on your device using AsyncStorage:

| Key                | Description                       |
| ------------------ | --------------------------------- |
| `@budget_income`   | Monthly income amount (in cents)  |
| `@budget_expenses` | Array of all expense records      |
| `@budget_currency` | Selected currency code (ISO 4217) |

Data persists between app sessions and works completely offline.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Inspired by the [50/30/20 budgeting rule](https://www.investopedia.com/ask/answers/022916/what-502030-budget-rule.asp) popularized by Senator Elizabeth Warren
- Built with [Expo](https://expo.dev/) and [React Native](https://reactnative.dev/)
