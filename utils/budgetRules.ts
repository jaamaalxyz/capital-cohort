import { BudgetRule, BudgetPresetKey, ValidationResult } from '../types';
import { BUDGET_PRESETS } from '../constants/budgetPresets';

/**
 * Sums needs + wants + savings percentages.
 */
export function ruleTotal(rule: BudgetRule): number {
  return rule.needs + rule.wants + rule.savings;
}

/**
 * Validates that a budget rule sums to exactly 100% and 
 * each category is between 5% and 90%.
 */
export function validateBudgetRule(rule: BudgetRule): ValidationResult {
  if (ruleTotal(rule) !== 100) {
    return { isValid: false, error: 'Budget percentages must sum to 100%' };
  }
  
  const MIN = 5;
  const MAX = 90;
  
  if (rule.needs > MAX || rule.wants > MAX || rule.savings > MAX) {
    return { isValid: false, error: `Maximum percentage per category is ${MAX}%` };
  }

  if (rule.needs < MIN || rule.wants < MIN || rule.savings < MIN) {
    return { isValid: false, error: `Minimum percentage per category is ${MIN}%` };
  }
  
  return { isValid: true };
}

/**
 * Recalculates the locked category to make the total exactly 100%.
 * Use this when another category's value is changed to maintain the invariant.
 */
export function adjustThirdCategory(
  rule: BudgetRule,
  lockedKey: keyof BudgetRule
): BudgetRule {
  const others = (['needs', 'wants', 'savings'] as (keyof BudgetRule)[])
    .filter((k) => k !== lockedKey);
  
  const othersTotal = others.reduce((s, k) => s + rule[k], 0);
  
  // Try to set the locked category to the remainder
  const remainder = 100 - othersTotal;
  
  // Ensure we don't go below the floor
  const adjusted = Math.max(remainder, 5);
  
  return { ...rule, [lockedKey]: adjusted };
}

/**
 * Checks if the given rule matches any predefined preset.
 * Returns 'custom' if no match is found.
 */
export function detectPreset(rule: BudgetRule): BudgetPresetKey {
  const match = BUDGET_PRESETS.find(
    (p) => 
      p.rule.needs === rule.needs && 
      p.rule.wants === rule.wants && 
      p.rule.savings === rule.savings
  );
  return match ? match.key : 'custom';
}

/**
 * Converts integer percentages (50, 30, 20) to decimal percentages (0.5, 0.3, 0.2).
 */
export function ruleToPercentages(rule: BudgetRule): { needs: number; wants: number; savings: number } {
  return {
    needs: rule.needs / 100,
    wants: rule.wants / 100,
    savings: rule.savings / 100,
  };
}
