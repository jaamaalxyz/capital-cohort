import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useMemo,
  ReactNode,
} from 'react';
import { Platform } from 'react-native';
import {
  BudgetState,
  BudgetAction,
  Expense,
  BudgetSummary,
  LocationPreference,
  RecurringTemplate,
  BudgetRule,
  NotificationPreferences,
  Category,
  ExtraIncome,
  DebtEntry,
  ThemeMode,
} from '../types';
import {
  saveIncome,
  loadIncome,
  saveExpenses,
  loadExpenses,
  saveCurrency,
  loadCurrency,
  saveLocation,
  loadLocation,
  saveOnboardingCompleted,
  loadOnboardingCompleted,
  saveRecurringTemplates,
  loadRecurringTemplates,
  saveTheme,
  loadTheme,
  saveBudgetRule,
  loadBudgetRule,
  loadNotificationPrefs,
  saveNotificationPrefs,
  saveExtraIncomes,
  loadExtraIncomes,
  saveDebtEntries,
  loadDebtEntries,
  clearAllData,
} from '../utils/storage';
import { logError } from '../utils/errorLogger';
import { DEFAULT_NOTIFICATION_PREFS } from '../types';
import { DEFAULT_BUDGET_RULE } from '../constants/budgetPresets';
import { DEFAULT_CURRENCY } from '../constants/currencies';
import { materializeAllForMonth } from '../utils/recurringExpenses';
import { calculateBudgetSummary, getExpensesForMonth } from '../utils/calculations';
import {
  scheduleOverBudgetAlert,
  scheduleDailyReminder,
  cancelDailyReminder,
} from '../utils/notifications';
import { getCurrentMonth } from '../utils/formatters';

const initialState: BudgetState = {
  monthlyIncome: 0,
  expenses: [],
  currentMonth: getCurrentMonth(),
  isLoading: true,
  currency: DEFAULT_CURRENCY,
  location: undefined,
  onboardingCompleted: false,
  recurringTemplates: [],
  budgetRule: DEFAULT_BUDGET_RULE,
  notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
  extraIncomes: [],
  debtEntries: [],
};

function budgetReducer(state: BudgetState, action: BudgetAction): BudgetState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_INCOME':
      return { ...state, monthlyIncome: action.payload };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.payload),
      };
    case 'LOAD_DATA':
      return { ...state, ...action.payload, isLoading: false };
    case 'SET_MONTH':
      return { ...state, currentMonth: action.payload };
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload };
    case 'SET_LOCATION':
      return { ...state, location: action.payload };
    case 'COMPLETE_ONBOARDING':
      return { ...state, onboardingCompleted: true };
    case 'ADD_RECURRING_TEMPLATE':
      return { ...state, recurringTemplates: [...state.recurringTemplates, action.payload] };
    case 'UPDATE_RECURRING_TEMPLATE':
      return {
        ...state,
        recurringTemplates: state.recurringTemplates.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_RECURRING_TEMPLATE':
      return {
        ...state,
        recurringTemplates: state.recurringTemplates.filter((t) => t.id !== action.payload),
      };
    case 'MATERIALIZE_RECURRING':
      return {
        ...state,
        expenses: [...state.expenses, ...action.payload.expenses],
        recurringTemplates: action.payload.templates,
      };
    case 'SET_BUDGET_RULE':
      return { ...state, budgetRule: action.payload };
    case 'SET_NOTIFICATION_PREFS':
      return { ...state, notificationPrefs: action.payload };
    case 'ADD_EXTRA_INCOME': {
      const newState = {
        ...state,
        extraIncomes: [...state.extraIncomes, action.payload],
      };
      saveExtraIncomes(newState.extraIncomes);
      return newState;
    }
    case 'REMOVE_EXTRA_INCOME': {
      const newState = {
        ...state,
        extraIncomes: state.extraIncomes.filter((i) => i.id !== action.payload),
      };
      saveExtraIncomes(newState.extraIncomes);
      return newState;
    }
    case 'ADD_DEBT_ENTRY': {
      const newState = {
        ...state,
        debtEntries: [...state.debtEntries, action.payload],
      };
      saveDebtEntries(newState.debtEntries);
      return newState;
    }
    case 'SETTLE_DEBT': {
      const newState = {
        ...state,
        debtEntries: state.debtEntries.map((d) =>
          d.id === action.payload ? { ...d, isSettled: true } : d
        ),
      };
      saveDebtEntries(newState.debtEntries);
      return newState;
    }
    case 'REMOVE_DEBT_ENTRY': {
      const newState = {
        ...state,
        debtEntries: state.debtEntries.filter((d) => d.id !== action.payload),
      };
      saveDebtEntries(newState.debtEntries);
      return newState;
    }
    case 'IMPORT_EXTRA_INCOMES':
      return { ...state, extraIncomes: action.payload };
    case 'IMPORT_DEBT_ENTRIES':
      return { ...state, debtEntries: action.payload };
    case 'RESET_ALL':
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

interface BudgetContextType {
  state: BudgetState;
  summary: BudgetSummary;
  currentMonthExpenses: Expense[];
  setIncome: (income: number) => void;
  addExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  setMonth: (month: string) => void;
  setCurrency: (currency: string) => void;
  setLocation: (location: LocationPreference | undefined) => void;
  completeOnboarding: () => void;
  resetAll: () => Promise<void>;
  loadData: (payload: Partial<BudgetState>) => void;
  addRecurringTemplate: (template: RecurringTemplate) => void;
  updateRecurringTemplate: (template: RecurringTemplate) => void;
  deleteRecurringTemplate: (id: string) => void;
  setBudgetRule: (rule: BudgetRule) => void;
  setNotificationPrefs: (prefs: NotificationPreferences) => void;
  addExtraIncome: (income: ExtraIncome) => void;
  deleteExtraIncome: (id: string) => void;
  addDebtEntry: (entry: DebtEntry) => void;
  settleDebt: (id: string) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  const webReminderIdRef = useRef<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        const [
          income,
          expenses,
          currency,
          onboarding,
          location,
          templates,
          rule,
          extraIncomes,
          debtEntries,
          notificationPrefs,
        ] = await Promise.all([
          loadIncome(),
          loadExpenses(),
          loadCurrency(),
          loadOnboardingCompleted(),
          loadLocation(),
          loadRecurringTemplates(),
          loadBudgetRule(),
          loadExtraIncomes(),
          loadDebtEntries(),
          loadNotificationPrefs(),
        ]);
        dispatch({
          type: 'LOAD_DATA',
          payload: {
            monthlyIncome: income,
            expenses,
            currency,
            onboardingCompleted: onboarding,
            location,
            recurringTemplates: templates,
            budgetRule: rule,
            extraIncomes,
            debtEntries,
            notificationPrefs,
          },
        });
      } catch (error) {
        logError(error as Error, undefined, 'BudgetProvider');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!state.isLoading) {
      saveIncome(state.monthlyIncome);
    }
  }, [state.monthlyIncome, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) {
      saveExpenses(state.expenses);
    }
  }, [state.expenses, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) {
      saveCurrency(state.currency);
    }
  }, [state.currency, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) {
      saveLocation(state.location);
    }
  }, [state.location, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) {
      saveOnboardingCompleted(state.onboardingCompleted);
    }
  }, [state.onboardingCompleted, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) {
      saveRecurringTemplates(state.recurringTemplates);
    }
  }, [state.recurringTemplates, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) {
      saveBudgetRule(state.budgetRule);
    }
  }, [state.budgetRule, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) {
      saveNotificationPrefs(state.notificationPrefs);
    }
  }, [state.notificationPrefs, state.isLoading]);

  useEffect(() => {
    if (Platform.OS !== 'web' || state.isLoading) return;
    if (webReminderIdRef.current) {
      cancelDailyReminder(webReminderIdRef.current);
      webReminderIdRef.current = '';
    }
    if (state.notificationPrefs.dailyReminder) {
      scheduleDailyReminder(state.notificationPrefs.dailyReminderTime).then((id) => {
        webReminderIdRef.current = id;
      });
    }
  }, [state.isLoading, state.notificationPrefs.dailyReminder, state.notificationPrefs.dailyReminderTime]);

  useEffect(() => {
    if (!state.isLoading) {
      const { newExpenses, updatedTemplates } = materializeAllForMonth(
        state.recurringTemplates,
        state.currentMonth,
      );
      if (newExpenses.length > 0) {
        dispatch({
          type: 'MATERIALIZE_RECURRING',
          payload: { expenses: newExpenses, templates: updatedTemplates },
        });
      }
    }
  }, [state.isLoading, state.currentMonth]);

  const currentMonthExpenses = useMemo(
    () => getExpensesForMonth(state.expenses, state.currentMonth),
    [state.expenses, state.currentMonth],
  );

  const summary = useMemo(
    () => calculateBudgetSummary(state.monthlyIncome, currentMonthExpenses, state.budgetRule),
    [state.monthlyIncome, currentMonthExpenses, state.budgetRule],
  );

  useEffect(() => {
    if (!state.isLoading && state.notificationPrefs.overBudgetAlerts) {
      const categories: Category[] = ['needs', 'wants', 'savings'];
      const updatedPrefs = { ...state.notificationPrefs };
      let hasChanges = false;

      categories.forEach((cat) => {
        const catSummary = summary[cat];
        if (catSummary.isOverBudget) {
          if (state.notificationPrefs.lastOverBudgetAt[cat] !== state.currentMonth) {
            scheduleOverBudgetAlert(
              cat,
              Math.abs(catSummary.remaining),
              state.currency
            );
            updatedPrefs.lastOverBudgetAt[cat] = state.currentMonth;
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        dispatch({ type: 'SET_NOTIFICATION_PREFS', payload: updatedPrefs });
      }
    }
  }, [state.expenses, state.isLoading, state.notificationPrefs.overBudgetAlerts, state.currentMonth, summary, state.currency]);

  const setIncome = (income: number) => {
    dispatch({ type: 'SET_INCOME', payload: income });
  };

  const addExpense = (expense: Expense) => {
    dispatch({ type: 'ADD_EXPENSE', payload: expense });
  };

  const deleteExpense = (id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  };

  const setMonth = (month: string) => {
    dispatch({ type: 'SET_MONTH', payload: month });
  };

  const setCurrency = (currency: string) => {
    dispatch({ type: 'SET_CURRENCY', payload: currency });
  };

  const setLocation = (location: LocationPreference | undefined) => {
    dispatch({ type: 'SET_LOCATION', payload: location });
  };

  const completeOnboarding = () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  };

  const resetAll = async () => {
    await clearAllData();
    dispatch({ type: 'RESET_ALL' });
  };

  const loadData = (payload: Partial<BudgetState>) => {
    dispatch({ type: 'LOAD_DATA', payload });
  };

  const addRecurringTemplate = (template: RecurringTemplate) => {
    dispatch({ type: 'ADD_RECURRING_TEMPLATE', payload: template });
  };

  const updateRecurringTemplate = (template: RecurringTemplate) => {
    dispatch({ type: 'UPDATE_RECURRING_TEMPLATE', payload: template });
  };

  const deleteRecurringTemplate = (id: string) => {
    dispatch({ type: 'DELETE_RECURRING_TEMPLATE', payload: id });
  };

  const setBudgetRule = (rule: BudgetRule) => dispatch({ type: 'SET_BUDGET_RULE', payload: rule });
  const setNotificationPrefs = (prefs: NotificationPreferences) => dispatch({ type: 'SET_NOTIFICATION_PREFS', payload: prefs });
  const addExtraIncome = (income: ExtraIncome) => dispatch({ type: 'ADD_EXTRA_INCOME', payload: income });
  const deleteExtraIncome = (id: string) => dispatch({ type: 'REMOVE_EXTRA_INCOME', payload: id });
  const addDebtEntry = (entry: DebtEntry) => dispatch({ type: 'ADD_DEBT_ENTRY', payload: entry });
  const settleDebt = (id: string) => dispatch({ type: 'SETTLE_DEBT', payload: id });

  return (
    <BudgetContext.Provider
      value={{
        state,
        summary,
        currentMonthExpenses,
        setIncome,
        addExpense,
        deleteExpense,
        setMonth,
        setCurrency,
        setLocation,
        completeOnboarding,
        resetAll,
        loadData,
        addRecurringTemplate,
        updateRecurringTemplate,
        deleteRecurringTemplate,
        setBudgetRule,
        setNotificationPrefs,
        addExtraIncome,
        deleteExtraIncome,
        addDebtEntry,
        settleDebt,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}
