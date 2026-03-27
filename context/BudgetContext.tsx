import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import {
  BudgetState,
  BudgetAction,
  Expense,
  BudgetSummary,
  LocationPreference,
  RecurringTemplate,
} from '../types';
import { getCurrentMonth } from '../utils/formatters';
import {
  saveIncome,
  loadIncome,
  saveExpenses,
  loadExpenses,
  clearAllData,
  saveCurrency,
  loadCurrency,
  saveLocation,
  loadLocation,
  saveOnboardingCompleted,
  loadOnboardingCompleted,
  saveRecurringTemplates,
  loadRecurringTemplates,
} from '../utils/storage';
import { materializeAllForMonth } from '../utils/recurringExpenses';
import { DEFAULT_CURRENCY } from '../constants/currencies';
import {
  calculateBudgetSummary,
  getExpensesForMonth,
} from '../utils/calculations';

const initialState: BudgetState = {
  monthlyIncome: 0,
  expenses: [],
  currentMonth: getCurrentMonth(),
  isLoading: true,
  currency: DEFAULT_CURRENCY,
  location: undefined,
  onboardingCompleted: false,
  recurringTemplates: [],
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
    case 'RESET_ALL':
      return {
        ...initialState,
        isLoading: false,
        currentMonth: getCurrentMonth(),
      };
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
  resetAll: () => void;
  loadData: (payload: Partial<BudgetState>) => void;
  addRecurringTemplate: (template: RecurringTemplate) => void;
  updateRecurringTemplate: (template: RecurringTemplate) => void;
  deleteRecurringTemplate: (id: string) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [income, expenses, currency, location, onboardingCompleted, recurringTemplates] =
          await Promise.all([
            loadIncome(),
            loadExpenses(),
            loadCurrency(),
            loadLocation(),
            loadOnboardingCompleted(),
            loadRecurringTemplates(),
          ]);
        dispatch({
          type: 'LOAD_DATA',
          payload: {
            monthlyIncome: income,
            expenses,
            currency,
            location,
            onboardingCompleted,
            recurringTemplates,
          },
        });
      } catch (error) {
        console.error('[DEBUG] BudgetProvider: Error loading data:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
    loadData();
  }, []);

  // Save income when it changes
  useEffect(() => {
    if (!state.isLoading) {
      saveIncome(state.monthlyIncome);
    }
  }, [state.monthlyIncome, state.isLoading]);

  // Save expenses when they change
  useEffect(() => {
    if (!state.isLoading) {
      saveExpenses(state.expenses);
    }
  }, [state.expenses, state.isLoading]);

  // Save currency when it changes
  useEffect(() => {
    if (!state.isLoading) {
      saveCurrency(state.currency);
    }
  }, [state.currency, state.isLoading]);

  // Save location when it changes
  useEffect(() => {
    if (!state.isLoading) {
      saveLocation(state.location);
    }
  }, [state.location, state.isLoading]);

  // Save onboarding status when it changes
  useEffect(() => {
    if (!state.isLoading) {
      saveOnboardingCompleted(state.onboardingCompleted);
    }
  }, [state.onboardingCompleted, state.isLoading]);

  // Save recurring templates when they change
  useEffect(() => {
    if (!state.isLoading) {
      saveRecurringTemplates(state.recurringTemplates);
    }
  }, [state.recurringTemplates, state.isLoading]);

  // Materialize recurring templates after load
  useEffect(() => {
    if (!state.isLoading) {
      const { newExpenses, updatedTemplates } = materializeAllForMonth(
        state.recurringTemplates,
        state.currentMonth
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
    () => calculateBudgetSummary(state.monthlyIncome, currentMonthExpenses),
    [state.monthlyIncome, currentMonthExpenses],
  );

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
