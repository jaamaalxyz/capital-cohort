# Plan 03 — Recurring Expenses

**Priority:** P2
**Type:** Feature
**Effort:** 3–4 days
**Depends on:** Plan 00 (test infrastructure)

---

## Overview

Allow users to define **recurring expense templates** that automatically generate expense entries each month. Common use cases: rent, subscriptions (Netflix, gym), loan repayments.

Scope:
- Create a recurring expense template (amount, description, category, day of month)
- Templates auto-materialize as expenses at app startup for the current month
- Manage (edit/delete) recurring templates from a dedicated screen or settings section
- Visual indicator on expense items that originated from a recurring template

---

## Dependencies to Install

```bash
# No new dependencies required
# Uses existing AsyncStorage, BudgetContext, and expo-router
```

---

## New Files

```
app/
  recurring.tsx                        # Manage recurring templates screen
  add-recurring.tsx                    # Modal to create/edit template
components/
  RecurringItem.tsx                    # Template row (edit/delete)
utils/
  recurringExpenses.ts                 # Template → Expense materialization logic
constants/theme.ts                     # Add STORAGE_KEYS.RECURRING_TEMPLATES
types/index.ts                         # Add RecurringTemplate type
context/BudgetContext.tsx              # Handle recurring materialization on load
__tests__/
  utils/recurringExpenses.test.ts
  components/RecurringItem.test.tsx
  screens/Recurring.test.tsx
  integration/recurring-materialization.test.tsx
```

---

## New Types (`types/index.ts` additions)

```ts
export interface RecurringTemplate {
  id: string;             // UUID v4
  amount: number;         // cents
  description: string;
  category: Category;
  dayOfMonth: number;     // 1–28 (cap at 28 to handle Feb)
  isActive: boolean;
  createdAt: string;      // ISO datetime
  lastMaterializedMonth?: string;  // YYYY-MM — tracks last auto-creation
}

// Expense gains an optional link back to its template
// Extend existing Expense interface:
// recurringTemplateId?: string;
```

Update `Expense` in `types/index.ts`:
```ts
export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: Category;
  date: string;
  createdAt: string;
  recurringTemplateId?: string;   // NEW — links to source template
}
```

---

## New Storage Key

Add to `constants/theme.ts` `STORAGE_KEYS`:
```ts
RECURRING_TEMPLATES: '@budget_recurring_templates',
```

---

## TDD Cycle 1 — `recurringExpenses.ts`

### RED: Write tests first

**`__tests__/utils/recurringExpenses.test.ts`**
```ts
import {
  shouldMaterialize,
  materializeTemplate,
  materializeAllForMonth,
  validateRecurringTemplate,
} from '../../utils/recurringExpenses';
import { RecurringTemplate, Expense } from '../../types';

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
      makeTemplate({ id: '1', lastMaterializedMonth: '2024-01' }),  // already done
      makeTemplate({ id: '2', lastMaterializedMonth: undefined }),    // needs materialization
    ];
    const { newExpenses, updatedTemplates } = materializeAllForMonth(templates, '2024-02');
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
    const { newExpenses, updatedTemplates } = materializeAllForMonth(templates, '2024-02');
    expect(newExpenses).toHaveLength(0);
  });

  it('skips inactive templates', () => {
    const templates = [makeTemplate({ isActive: false })];
    const { newExpenses } = materializeAllForMonth(templates, '2024-02');
    expect(newExpenses).toHaveLength(0);
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
});
```

### GREEN: Implement `utils/recurringExpenses.ts`

```ts
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
  if (!data.amount || data.amount <= 0) return { isValid: false, error: 'Amount must be greater than 0' };
  if (!data.description?.trim()) return { isValid: false, error: 'Description is required' };
  if (data.dayOfMonth < 1 || data.dayOfMonth > 28) {
    return { isValid: false, error: 'Day of month must be between 1 and 28' };
  }
  return { isValid: true };
}
```

### REFACTOR
- Extract `getLastDayOfMonth` to `utils/formatters.ts` as it's broadly useful
- Add test for leap year: Feb 2024 has 29 days, Feb 2023 has 28

---

## TDD Cycle 2 — BudgetContext Integration

### State Changes

Add to `BudgetState`:
```ts
recurringTemplates: RecurringTemplate[];
```

Add actions to `BudgetAction`:
```ts
| { type: 'ADD_RECURRING_TEMPLATE'; payload: RecurringTemplate }
| { type: 'UPDATE_RECURRING_TEMPLATE'; payload: RecurringTemplate }
| { type: 'DELETE_RECURRING_TEMPLATE'; payload: string }
| { type: 'MATERIALIZE_RECURRING'; payload: { expenses: Expense[]; templates: RecurringTemplate[] } }
```

### Materialization Hook in BudgetContext

On app load (after `LOAD_DATA`), call `materializeAllForMonth`:
```ts
useEffect(() => {
  if (!state.isLoading) {
    const { newExpenses, updatedTemplates } = materializeAllForMonth(
      state.recurringTemplates,
      state.currentMonth
    );
    if (newExpenses.length > 0) {
      dispatch({ type: 'MATERIALIZE_RECURRING', payload: { expenses: newExpenses, templates: updatedTemplates } });
    }
  }
}, [state.isLoading, state.currentMonth]);
```

### RED

**`__tests__/integration/recurring-materialization.test.tsx`**
```tsx
describe('Recurring expense materialization', () => {
  it('auto-creates expenses from active templates on load', async () => {
    // Mock AsyncStorage with a template in RECURRING_TEMPLATES key
    // Render BudgetProvider
    // Assert expense with recurringTemplateId appears in state
  });

  it('does not duplicate expenses if already materialized this month', async () => {
    // Template with lastMaterializedMonth = current month
    // Load app
    // expenses length should not increase
  });

  it('does not materialize for inactive templates', async () => { });
});
```

---

## TDD Cycle 3 — RecurringItem Component

### RED

**`__tests__/components/RecurringItem.test.tsx`**
```tsx
describe('RecurringItem', () => {
  it('renders template description and amount', () => { });
  it('renders day of month', () => { });
  it('renders category icon', () => { });
  it('calls onEdit when edit button pressed', () => { });
  it('calls onDelete when delete button pressed', () => { });
  it('shows inactive badge when isActive is false', () => { });
});
```

---

## TDD Cycle 4 — Recurring Screen

### RED

**`__tests__/screens/Recurring.test.tsx`**
```tsx
describe('Recurring screen', () => {
  it('renders empty state when no templates exist', () => { });
  it('renders list of templates when they exist', () => { });
  it('navigates to add-recurring modal on FAB press', () => { });
  it('deletes template with confirmation dialog', () => { });
  it('shows recurring badge on expense items sourced from template', () => { });
});
```

---

## UI: Recurring Badge on Expense Items

In `components/ExpenseItem.tsx`, when `expense.recurringTemplateId` is set, show a small `↻` badge beside the description.

---

## Navigation Integration

Add recurring screen to settings section or as a modal:
```tsx
// In app/_layout.tsx Stack:
<Stack.Screen
  name="recurring"
  options={{ presentation: 'card', title: 'Recurring Expenses' }}
/>
<Stack.Screen
  name="add-recurring"
  options={{ presentation: 'modal', title: 'Add Recurring' }}
/>
```

Add link from Settings screen: "Manage Recurring Expenses →"

---

## Acceptance Criteria

- [ ] `shouldMaterialize` correctly guards against duplicate materialization
- [ ] `materializeTemplate` caps day at last day of short months
- [ ] `materializeAllForMonth` returns updated templates with `lastMaterializedMonth`
- [ ] `validateRecurringTemplate` rejects dayOfMonth > 28
- [ ] On app startup, active templates auto-create expenses for current month
- [ ] Duplicate materialization is prevented (idempotent)
- [ ] Expense items from recurring templates show visual indicator
- [ ] Templates can be created, edited, toggled active/inactive, deleted
- [ ] Deletion of template does NOT delete previously materialized expenses

---

## Definition of Done

- All unit and integration tests green
- Round-trip: create template → close app → reopen → expense appears automatically
- No duplicate expenses on repeated app loads
