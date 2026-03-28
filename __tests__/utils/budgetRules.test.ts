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
    expect(result.error).toMatch(/maximum.*90/i);
  });

  it('accepts rule where each category is exactly 5 when others balance', () => {
    const result = validateBudgetRule({ needs: 90, wants: 5, savings: 5 });
    expect(result.isValid).toBe(true);
  });
});

describe('adjustThirdCategory', () => {
  // When user drags needs or wants slider, auto-adjust savings to keep total = 100
  it('does not change values if they already sum to 100', () => {
    const result = adjustThirdCategory({ needs: 60, wants: 30, savings: 10 }, 'savings');
    expect(result.savings).toBe(10);
  });

  it('recalculates the locked category to make total 100', () => {
    // User set needs=55, wants=30; savings should become 15
    const result = adjustThirdCategory({ needs: 55, wants: 30, savings: 0 }, 'savings');
    expect(result.savings).toBe(15);
    expect(result.needs + result.wants + result.savings).toBe(100);
  });

  it('floors adjusted category at minimum 5', () => {
    // needs=96, wants=2 → savings would be 2, floor to 5, and adjust wants
    const result = adjustThirdCategory({ needs: 96, wants: 2, savings: 0 }, 'savings');
    expect(result.savings).toBe(5);
    // Note: total might not be 100 if we just floor; 
    // real-world reactive sliders usually handle this by pushing other categories.
    // We will verify the implementation's strategy.
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
