# Plan 06 — Customizable Budget Rules

**Priority:** P2
**Type:** Feature
**Effort:** 2 days
**Depends on:** Plan 00 (test infrastructure)

---

## Overview

The app is hardcoded to 50/30/20. Real users have different financial situations:
- Someone paying off debt may want 50/20/30 (more savings)
- A student may need 70/20/10

This plan allows users to configure custom percentage splits from the Settings screen, with:
- Three sliders (needs / wants / savings) that always sum to 100%
- Preset options: 50/30/20 (default), 70/20/10, 60/20/20, custom
- Validation: must sum to exactly 100%, each must be ≥ 5%
- Changes immediately re-render the Dashboard budget cards
- Rule persisted to AsyncStorage

---

## Dependencies to Install

```bash
npx expo install @react-native-community/slider
```

> Alternatively: build a custom slider using `PanResponder` to avoid native module overhead. Recommended for simpler dependency graph — see "Custom Slider" note below.

---

## New Files

```
utils/
  budgetRules.ts                   # Validation and preset logic
components/
  BudgetRuleSlider.tsx             # Tri-slider component
  BudgetRulePresets.tsx            # Preset option chips
constants/
  budgetPresets.ts                 # Named preset configurations
types/index.ts                     # Add BudgetRule, BudgetPreset types
context/BudgetContext.tsx          # Handle SET_BUDGET_RULE action
__tests__/
  utils/budgetRules.test.ts
  components/BudgetRuleSlider.test.tsx
  components/BudgetRulePresets.test.tsx
  screens/Settings.budgetRule.test.tsx
  integration/custom-rule-dashboard.test.tsx
```

---

## New Types (`types/index.ts` additions)

```ts
export interface BudgetRule {
  needs: number;     // integer percentage, e.g., 50
  wants: number;     // e.g., 30
  savings: number;   // e.g., 20
}

export type BudgetPresetKey = '50-30-20' | '70-20-10' | '60-20-20' | 'custom';

export interface BudgetPreset {
  key: BudgetPresetKey;
  label: string;
  rule: BudgetRule;
}
```

---

## New Constants (`constants/budgetPresets.ts`)

```ts
import { BudgetPreset } from '../types';

export const BUDGET_PRESETS: BudgetPreset[] = [
  { key: '50-30-20', label: '50/30/20 (Default)', rule: { needs: 50, wants: 30, savings: 20 } },
  { key: '70-20-10', label: '70/20/10 (Frugal)',  rule: { needs: 70, wants: 20, savings: 10 } },
  { key: '60-20-20', label: '60/20/20 (Balanced)', rule: { needs: 60, wants: 20, savings: 20 } },
];

export const DEFAULT_BUDGET_RULE: BudgetRule = { needs: 50, wants: 30, savings: 20 };
```

---

## TDD Cycle 1 — `budgetRules.ts`

### RED: Write tests first

**`__tests__/utils/budgetRules.test.ts`**
```ts
import {
  validateBudgetRule,
  ruleTotal,
  adjustThirdCategory,
  detectPreset,
  ruleToPercentages,
} from '../../utils/budgetRules';
import { BudgetRule } from '../../types';

describe('ruleTotal', () => {
  it('sums needs + wants + savings', () => {
    expect(ruleTotal({ needs: 50, wants: 30, savings: 20 })).toBe(100);
  });

  it('returns non-100 total for invalid rule', () => {
    expect(ruleTotal({ needs: 50, wants: 30, savings: 25 })).toBe(105);
  });
});

describe('validateBudgetRule', () => {
  it('returns valid for 50/30/20', () => {
    const result = validateBudgetRule({ needs: 50, wants: 30, savings: 20 });
    expect(result.isValid).toBe(true);
  });

  it('returns invalid when total is not 100', () => {
    const result = validateBudgetRule({ needs: 50, wants: 30, savings: 25 });
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/100/);
  });

  it('returns invalid when any category is below 5', () => {
    const result = validateBudgetRule({ needs: 90, wants: 7, savings: 3 });
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/minimum.*5/i);
  });

  it('returns invalid when any category is above 90', () => {
    const result = validateBudgetRule({ needs: 91, wants: 5, savings: 4 });
    expect(result.isValid).toBe(false);
  });

  it('accepts rule where each category is exactly 5 when others balance', () => {
    const result = validateBudgetRule({ needs: 90, wants: 5, savings: 5 });
    expect(result.isValid).toBe(true);
  });
});

describe('adjustThirdCategory', () => {
  // When user drags needs or wants slider, auto-adjust savings to keep total = 100
  it('adjusts savings when needs and wants are changed', () => {
    const result = adjustThirdCategory({ needs: 60, wants: 30, savings: 10 }, 'savings');
    // needs + wants = 90, so savings = 10 → already 100, no change needed
    expect(result.savings).toBe(10);
  });

  it('recalculates the locked category to make total 100', () => {
    // User set needs=55, wants=30; savings should become 15
    const result = adjustThirdCategory({ needs: 55, wants: 30, savings: 0 }, 'savings');
    expect(result.savings).toBe(15);
    expect(result.needs + result.wants + result.savings).toBe(100);
  });

  it('floors adjusted category at minimum 5', () => {
    // needs=90, wants=10 → savings would be 0, floor to 5, adjust wants
    const result = adjustThirdCategory({ needs: 90, wants: 10, savings: 0 }, 'savings');
    expect(result.savings).toBeGreaterThanOrEqual(5);
  });
});

describe('detectPreset', () => {
  it('returns preset key for known preset', () => {
    expect(detectPreset({ needs: 50, wants: 30, savings: 20 })).toBe('50-30-20');
    expect(detectPreset({ needs: 70, wants: 20, savings: 10 })).toBe('70-20-10');
  });

  it('returns "custom" for non-preset rule', () => {
    expect(detectPreset({ needs: 55, wants: 25, savings: 20 })).toBe('custom');
  });
});

describe('ruleToPercentages', () => {
  it('converts integer rule to decimal percentages for calculation', () => {
    const result = ruleToPercentages({ needs: 50, wants: 30, savings: 20 });
    expect(result.needs).toBeCloseTo(0.5);
    expect(result.wants).toBeCloseTo(0.3);
    expect(result.savings).toBeCloseTo(0.2);
  });
});
```

### GREEN: Implement `utils/budgetRules.ts`

```ts
import { BudgetRule, BudgetPresetKey, ValidationResult } from '../types';
import { BUDGET_PRESETS } from '../constants/budgetPresets';

export function ruleTotal(rule: BudgetRule): number {
  return rule.needs + rule.wants + rule.savings;
}

export function validateBudgetRule(rule: BudgetRule): ValidationResult {
  if (ruleTotal(rule) !== 100) {
    return { isValid: false, error: 'Percentages must sum to 100%' };
  }
  const min = 5;
  if (rule.needs < min || rule.wants < min || rule.savings < min) {
    return { isValid: false, error: `Minimum percentage per category is ${min}%` };
  }
  if (rule.needs > 90 || rule.wants > 90 || rule.savings > 90) {
    return { isValid: false, error: 'Maximum percentage per category is 90%' };
  }
  return { isValid: true };
}

export function adjustThirdCategory(
  rule: BudgetRule,
  lockedKey: keyof BudgetRule
): BudgetRule {
  const others = (['needs', 'wants', 'savings'] as (keyof BudgetRule)[])
    .filter((k) => k !== lockedKey);
  const othersTotal = others.reduce((s, k) => s + rule[k], 0);
  const adjusted = Math.max(100 - othersTotal, 5);
  return { ...rule, [lockedKey]: adjusted };
}

export function detectPreset(rule: BudgetRule): BudgetPresetKey {
  const match = BUDGET_PRESETS.find(
    (p) => p.rule.needs === rule.needs && p.rule.wants === rule.wants && p.rule.savings === rule.savings
  );
  return match ? match.key : 'custom';
}

export function ruleToPercentages(rule: BudgetRule): { needs: number; wants: number; savings: number } {
  return {
    needs: rule.needs / 100,
    wants: rule.wants / 100,
    savings: rule.savings / 100,
  };
}
```

### REFACTOR
- `adjustThirdCategory` should be tested with property-based thinking (always sums to 100)
- Consider adding `clampToBounds(value, min, max)` helper

---

## TDD Cycle 2 — BudgetContext & Calculations Integration

### State Changes

Add to `BudgetState`:
```ts
budgetRule: BudgetRule;   // default: { needs: 50, wants: 30, savings: 20 }
```

Add action:
```ts
| { type: 'SET_BUDGET_RULE'; payload: BudgetRule }
```

### Update `CATEGORY_CONFIG` usage in `calculateCategoryBudget`

Instead of reading hardcoded `config.percentage` from `CATEGORY_CONFIG`, pass in the budget rule:

```ts
export function calculateCategoryBudget(
  income: number,
  expenses: Expense[],
  category: Category,
  rule: BudgetRule   // NEW parameter
): CategoryBudget {
  const percentage = rule[category] / 100;
  ...
}
```

> **Migration:** Update all call sites in `BudgetContext.tsx` to pass `state.budgetRule`.

### RED

**`__tests__/integration/custom-rule-dashboard.test.tsx`**
```tsx
describe('Custom budget rule — dashboard integration', () => {
  it('BudgetCard shows correct allocated amount with 70/20/10 rule', async () => {
    // Set income to 100000 cents
    // Set rule to { needs: 70, wants: 20, savings: 10 }
    // Render Dashboard
    // Assert needs card shows allocated = 70000 ($700.00)
  });

  it('changing rule re-renders dashboard cards with new allocations', async () => { });

  it('calculateCategoryBudget uses rule percentages, not hardcoded 50/30/20', () => {
    const result = calculateCategoryBudget(100000, [], 'needs', { needs: 70, wants: 20, savings: 10 });
    expect(result.allocated).toBe(70000);
  });
});
```

---

## TDD Cycle 3 — `BudgetRulePresets` Component

### RED

**`__tests__/components/BudgetRulePresets.test.tsx`**
```tsx
describe('BudgetRulePresets', () => {
  it('renders all preset options', () => {
    const { getByText } = render(<BudgetRulePresets selected="50-30-20" onSelect={jest.fn()} />);
    expect(getByText('50/30/20 (Default)')).toBeTruthy();
    expect(getByText('70/20/10 (Frugal)')).toBeTruthy();
  });

  it('highlights the currently selected preset', () => {
    const { getByTestId } = render(
      <BudgetRulePresets selected="70-20-10" onSelect={jest.fn()} />
    );
    expect(getByTestId('preset-70-20-10')).toHaveStyle({ borderWidth: 2 });
  });

  it('calls onSelect with preset rule when preset tapped', () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <BudgetRulePresets selected="50-30-20" onSelect={onSelect} />
    );
    fireEvent.press(getByTestId('preset-70-20-10'));
    expect(onSelect).toHaveBeenCalledWith({ needs: 70, wants: 20, savings: 10 });
  });

  it('shows "Custom" label when no preset matches current rule', () => {
    const { getByText } = render(
      <BudgetRulePresets selected="custom" onSelect={jest.fn()} />
    );
    expect(getByText(/custom/i)).toBeTruthy();
  });
});
```

---

## TDD Cycle 4 — Settings Screen Budget Rule Section

### RED

**`__tests__/screens/Settings.budgetRule.test.tsx`**
```tsx
describe('Settings — budget rule', () => {
  it('renders current rule percentages', async () => { });
  it('renders preset chips', async () => { });
  it('selecting preset updates slider values', async () => { });
  it('shows validation error when percentages do not sum to 100', async () => { });
  it('save button is disabled when rule is invalid', async () => { });
  it('save button persists rule and updates context', async () => { });
  it('dashboard reflects new rule after saving', async () => { });
});
```

---

## Storage

Add to `constants/theme.ts` `STORAGE_KEYS`:
```ts
BUDGET_RULE: '@budget_rule',
```

Add to `utils/storage.ts`:
```ts
export async function saveBudgetRule(rule: BudgetRule): Promise<void> { }
export async function loadBudgetRule(): Promise<BudgetRule> { }
```

---

## Backward Compatibility

On `LOAD_DATA`, if `budgetRule` is missing from storage (first launch after update), default to `{ needs: 50, wants: 30, savings: 20 }`. This is transparent to existing users.

---

## Acceptance Criteria

- [ ] `validateBudgetRule` rejects rules that don't sum to 100
- [ ] `validateBudgetRule` rejects any category below 5%
- [ ] `adjustThirdCategory` always produces a total of 100
- [ ] `calculateCategoryBudget` uses rule percentages (not `CATEGORY_CONFIG`)
- [ ] Dashboard cards reflect custom rule immediately after saving
- [ ] Preset chips auto-select when rule matches a known preset
- [ ] Custom label shown when no preset matches
- [ ] Budget rule persists across app restarts
- [ ] Existing users without saved rule default to 50/30/20 (no crash)

---

## Definition of Done

- All tests green
- Round-trip: set custom rule → restart app → rule still applies
- Dashboard cards show correct allocations for custom rule
