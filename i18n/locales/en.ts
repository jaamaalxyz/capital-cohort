export default {
  // Common
  common: {
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    reset: 'Reset',
    discard: 'Discard',
    today: 'Today',
    of: 'of',
  },

  // Tab Navigation
  tabs: {
    home: 'Home',
    expenses: 'Expenses',
    settings: 'Settings',
  },

  // Dashboard Screen
  dashboard: {
    monthlyIncome: 'Monthly Income',
    setupIncome: 'Set up your income →',
    totalSpent: 'Total Spent',
    remaining: 'Remaining',
  },

  // Expenses Screen
  expenses: {
    title: 'Expenses',
    filterAll: 'All',
    noExpenses: 'No expenses yet',
    addFirstExpense: 'Add your first expense\nfrom the Home screen',
    deleteTitle: 'Delete Expense',
    deleteMessage: 'Are you sure you want to delete this expense?',
  },

  // Settings Screen
  settings: {
    title: 'Settings',
    monthlyIncome: 'MONTHLY INCOME',
    enterIncome: 'Enter your monthly income',
    budgetBreakdown: 'BUDGET BREAKDOWN',
    incomeSplitAs: 'Your income will be split as:',
    needsPercent: '50% → Needs',
    wantsPercent: '30% → Wants',
    savingsPercent: '20% → Savings',
    currency: 'CURRENCY',
    language: 'LANGUAGE',
    rule503020: 'THE 50/30/20 RULE',
    ruleDescription:
      'A simple budgeting rule that divides your after-tax income into three categories:',
    needsRule: '50% Needs:',
    needsRuleDesc: 'Essential expenses you must pay',
    wantsRule: '30% Wants:',
    wantsRuleDesc: 'Non-essential spending for fun',
    savingsRule: '20% Savings:',
    savingsRuleDesc: 'Building your financial future',
    dangerZone: 'DANGER ZONE',
    resetAllData: 'Reset All Data',
    resetTitle: 'Reset All Data',
    resetMessage:
      'This will delete all your expenses and reset your income. This action cannot be undone.',
    selectCurrency: 'Select Currency',
    searchCurrencies: 'Search currencies...',
    noCurrenciesFound: 'No currencies found',
    selectLanguage: 'Select Language',
    searchLanguages: 'Search languages...',
    noLanguagesFound: 'No languages found',
  },

  // Add Expense Screen
  addExpense: {
    title: 'Add Expense',
    amount: 'AMOUNT',
    description: 'DESCRIPTION',
    descriptionPlaceholder: 'What did you spend on?',
    category: 'CATEGORY',
    date: 'DATE',
    addButton: 'ADD EXPENSE',
    invalidAmount: 'Invalid amount',
    required: 'Required',
    selectCategory: 'Select a category',
    discardTitle: 'Discard Changes?',
    discardMessage:
      'You have unsaved changes. Are you sure you want to discard them?',
    keepEditing: 'Keep Editing',
  },

  // Budget Card
  budgetCard: {
    remaining: 'Remaining:',
  },

  // Categories
  categories: {
    needs: 'Needs',
    wants: 'Wants',
    savings: 'Savings',
    needsDescription: 'Essentials: rent, utilities, groceries, insurance',
    wantsDescription: 'Non-essentials: entertainment, dining out, hobbies',
    savingsDescription: 'Savings, investments, emergency fund',
  },

  // Amount Input
  amountInput: {
    placeholder: '0.00',
  },

  // Not Found Screen
  notFound: {
    title: 'Page Not Found',
    subtitle: "The page you're looking for doesn't exist.",
    goHome: 'Go to Home',
  },
} as const;
