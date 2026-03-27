import { RecurringTemplate, Expense, ValidationResult } from '../types';
import { generateId } from './formatters';

export function shouldMaterialize(template: RecurringTemplate, month: string): boolean {
  if (!template.isActive) return false;
  if (!template.lastMaterializedMonth) return true;
  return template.lastMaterializedMonth < month;
}

function getLastDayOfMonth(month: string): number {
  const [year, m] = month.split('-').map(Number);
  return new Date(year, m, 0).getDate();
}

export function materializeTemplate(template: RecurringTemplate, month: string): Expense {
  const lastDay = getLastDayOfMonth(month);
  const day = Math.min(template.dayOfMonth, lastDay);
  const paddedDay = String(day).padStart(2, '0');
  return {
    id: generateId(),
    amount: template.amount,
    description: template.description,
    category: template.category,
    date: `${month}-${paddedDay}`,
    createdAt: new Date().toISOString(),
    recurringTemplateId: template.id,
  };
}

export function materializeAllForMonth(
  templates: RecurringTemplate[],
  month: string
): { newExpenses: Expense[]; updatedTemplates: RecurringTemplate[] } {
  const newExpenses: Expense[] = [];
  const updatedTemplates = templates.map((t) => {
    if (!shouldMaterialize(t, month)) return t;
    newExpenses.push(materializeTemplate(t, month));
    return { ...t, lastMaterializedMonth: month };
  });
  return { newExpenses, updatedTemplates };
}

export function validateRecurringTemplate(
  data: Pick<RecurringTemplate, 'amount' | 'description' | 'category' | 'dayOfMonth'>
): ValidationResult {
  if (!data.amount || data.amount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  if (!data.description?.trim()) {
    return { isValid: false, error: 'Description is required' };
  }
  if (data.dayOfMonth < 1 || data.dayOfMonth > 28) {
    return { isValid: false, error: 'Day of month must be between 1 and 28' };
  }
  return { isValid: true };
}
