import { BudgetPreset, BudgetRule } from '../types';

export const BUDGET_PRESETS: BudgetPreset[] = [
  { 
    key: '50-30-20', 
    label: '50/30/20 (Default)', 
    rule: { needs: 50, wants: 30, savings: 20 } 
  },
  { 
    key: '70-20-10', 
    label: '70/20/10 (Frugal)',  
    rule: { needs: 70, wants: 20, savings: 10 } 
  },
  { 
    key: '60-20-20', 
    label: '60/20/20 (Balanced)', 
    rule: { needs: 60, wants: 20, savings: 20 } 
  },
];

export const DEFAULT_BUDGET_RULE: BudgetRule = { 
  needs: 50, 
  wants: 30, 
  savings: 20 
};
