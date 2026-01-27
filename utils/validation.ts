import { Expense, ValidationResult } from '../types';

export function validateExpense(expense: Partial<Expense>): ValidationResult {
  if (!expense.amount || expense.amount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }

  if (!expense.description?.trim()) {
    return { isValid: false, error: 'Description is required' };
  }

  if (expense.description.length > 100) {
    return { isValid: false, error: 'Description must be under 100 characters' };
  }

  if (!['needs', 'wants', 'savings'].includes(expense.category!)) {
    return { isValid: false, error: 'Please select a category' };
  }

  return { isValid: true };
}

export function validateIncome(income: number): ValidationResult {
  if (income < 0) {
    return { isValid: false, error: 'Income cannot be negative' };
  }

  if (income > 100000000) {
    return { isValid: false, error: 'Income exceeds maximum allowed' };
  }

  return { isValid: true };
}
