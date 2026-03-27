import {
  shouldMaterialize,
  materializeTemplate,
  materializeAllForMonth,
  validateRecurringTemplate,
} from '../../utils/recurringExpenses';
import { RecurringTemplate } from '../../types';

const makeTemplate = (overrides: Partial<RecurringTemplate> = {}): RecurringTemplate => ({
  id: 'tmpl-1',
  amount: 50000,
  description: 'Rent',
  category: 'needs',
  dayOfMonth: 1,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('shouldMaterialize', () => {
  it('returns true if template has never been materialized', () => {
    const template = makeTemplate({ lastMaterializedMonth: undefined });
    expect(shouldMaterialize(template, '2024-02')).toBe(true);
  });

  it('returns true if last materialized month is earlier than target month', () => {
    const template = makeTemplate({ lastMaterializedMonth: '2024-01' });
    expect(shouldMaterialize(template, '2024-02')).toBe(true);
  });

  it('returns false if already materialized for target month', () => {
    const template = makeTemplate({ lastMaterializedMonth: '2024-02' });
    expect(shouldMaterialize(template, '2024-02')).toBe(false);
  });

  it('returns false if template is inactive', () => {
    const template = makeTemplate({ isActive: false, lastMaterializedMonth: undefined });
    expect(shouldMaterialize(template, '2024-02')).toBe(false);
  });
});

describe('materializeTemplate', () => {
  it('returns an Expense with the correct date for the given month', () => {
    const template = makeTemplate({ dayOfMonth: 5 });
    const expense = materializeTemplate(template, '2024-03');
    expect(expense.date).toBe('2024-03-05');
  });

  it('caps day to last day of month for short months', () => {
    const template = makeTemplate({ dayOfMonth: 31 });
    const expense = materializeTemplate(template, '2024-02'); // Feb 2024 = 29 days
    expect(expense.date).toBe('2024-02-29');
  });

  it('caps day correctly for non-leap February', () => {
    const template = makeTemplate({ dayOfMonth: 31 });
    const expense = materializeTemplate(template, '2023-02'); // Feb 2023 = 28 days
    expect(expense.date).toBe('2023-02-28');
  });

  it('copies amount, description, category from template', () => {
    const template = makeTemplate({ amount: 50000, description: 'Rent', category: 'needs' });
    const expense = materializeTemplate(template, '2024-01');
    expect(expense.amount).toBe(50000);
    expect(expense.description).toBe('Rent');
    expect(expense.category).toBe('needs');
  });

  it('sets recurringTemplateId to the template id', () => {
    const template = makeTemplate({ id: 'tmpl-abc' });
    const expense = materializeTemplate(template, '2024-01');
    expect(expense.recurringTemplateId).toBe('tmpl-abc');
  });

  it('generates a unique id for the expense (not the template id)', () => {
    const template = makeTemplate({ id: 'tmpl-abc' });
    const expense = materializeTemplate(template, '2024-01');
    expect(expense.id).not.toBe('tmpl-abc');
  });
});

describe('materializeAllForMonth', () => {
  it('returns materialized expenses only for templates that need materialization', () => {
    const templates = [
      makeTemplate({ id: '1', lastMaterializedMonth: '2024-02' }), // already done for this month
      makeTemplate({ id: '2', lastMaterializedMonth: undefined }),   // needs materialization
    ];
    const { newExpenses } = materializeAllForMonth(templates, '2024-02');
    expect(newExpenses).toHaveLength(1);
    expect(newExpenses[0].recurringTemplateId).toBe('2');
  });

  it('updates lastMaterializedMonth on processed templates', () => {
    const templates = [makeTemplate({ id: '1', lastMaterializedMonth: undefined })];
    const { updatedTemplates } = materializeAllForMonth(templates, '2024-02');
    expect(updatedTemplates[0].lastMaterializedMonth).toBe('2024-02');
  });

  it('returns empty arrays when all templates already materialized', () => {
    const templates = [makeTemplate({ lastMaterializedMonth: '2024-02' })];
    const { newExpenses } = materializeAllForMonth(templates, '2024-02');
    expect(newExpenses).toHaveLength(0);
  });

  it('skips inactive templates', () => {
    const templates = [makeTemplate({ isActive: false })];
    const { newExpenses } = materializeAllForMonth(templates, '2024-02');
    expect(newExpenses).toHaveLength(0);
  });

  it('does not mutate original templates array', () => {
    const templates = [makeTemplate({ id: '1', lastMaterializedMonth: undefined })];
    materializeAllForMonth(templates, '2024-02');
    expect(templates[0].lastMaterializedMonth).toBeUndefined();
  });
});

describe('validateRecurringTemplate', () => {
  it('returns valid for correct template data', () => {
    const result = validateRecurringTemplate({
      amount: 5000,
      description: 'Gym',
      category: 'wants',
      dayOfMonth: 15,
    });
    expect(result.isValid).toBe(true);
  });

  it('returns invalid for amount of 0', () => {
    const result = validateRecurringTemplate({ amount: 0, description: 'X', category: 'needs', dayOfMonth: 1 });
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/amount/i);
  });

  it('returns invalid for empty description', () => {
    const result = validateRecurringTemplate({ amount: 1000, description: '', category: 'needs', dayOfMonth: 1 });
    expect(result.isValid).toBe(false);
  });

  it('returns invalid for dayOfMonth < 1', () => {
    const result = validateRecurringTemplate({ amount: 1000, description: 'X', category: 'needs', dayOfMonth: 0 });
    expect(result.isValid).toBe(false);
  });

  it('returns invalid for dayOfMonth > 28', () => {
    const result = validateRecurringTemplate({ amount: 1000, description: 'X', category: 'needs', dayOfMonth: 29 });
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/28/);
  });

  it('returns valid for dayOfMonth exactly 28', () => {
    const result = validateRecurringTemplate({ amount: 1000, description: 'X', category: 'needs', dayOfMonth: 28 });
    expect(result.isValid).toBe(true);
  });
});
