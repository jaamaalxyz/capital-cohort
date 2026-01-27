import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import { BudgetState, BudgetAction, Expense, BudgetSummary } from '../types';
import { getCurrentMonth } from '../utils/formatters';
import {
  saveIncome,
  loadIncome,
  saveExpenses,
  loadExpenses,
  clearAllData,
} from '../utils/storage';
import {
  calculateBudgetSummary,
  getExpensesForMonth,
} from '../utils/calculations';

const initialState: BudgetState = {
  monthlyIncome: 0,
  expenses: [],
  currentMonth: getCurrentMonth(),
  isLoading: true,
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
    case 'RESET_ALL':
      return { ...initialState, isLoading: false, currentMonth: getCurrentMonth() };
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
  resetAll: () => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      const [income, expenses] = await Promise.all([
        loadIncome(),
        loadExpenses(),
      ]);
      dispatch({
        type: 'LOAD_DATA',
        payload: { monthlyIncome: income, expenses },
      });
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

  const currentMonthExpenses = useMemo(
    () => getExpensesForMonth(state.expenses, state.currentMonth),
    [state.expenses, state.currentMonth]
  );

  const summary = useMemo(
    () => calculateBudgetSummary(state.monthlyIncome, currentMonthExpenses),
    [state.monthlyIncome, currentMonthExpenses]
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

  const resetAll = async () => {
    await clearAllData();
    dispatch({ type: 'RESET_ALL' });
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
        resetAll,
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
