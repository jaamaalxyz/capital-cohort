import { validateExpense, validateIncome } from '../../utils/validation';

// ---------------------------------------------------------------------------
// validateExpense
// ---------------------------------------------------------------------------
describe('validateExpense', () => {
  const validExpense = {
    amount: 5000,
    description: 'Groceries',
    category: 'needs' as const,
  };

  it('returns valid for a correct expense', () => {
    expect(validateExpense(validExpense).isValid).toBe(true);
  });

  it('returns invalid for amount of 0', () => {
    const result = validateExpense({ ...validExpense, amount: 0 });
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/amount/i);
  });

  it('returns invalid for negative amount', () => {
    const result = validateExpense({ ...validExpense, amount: -1 });
    expect(result.isValid).toBe(false);
  });

  it('returns invalid when amount is undefined', () => {
    const result = validateExpense({ ...validExpense, amount: undefined });
    expect(result.isValid).toBe(false);
  });

  it('returns invalid for empty description', () => {
    const result = validateExpense({ ...validExpense, description: '' });
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/description/i);
  });

  it('returns invalid for whitespace-only description', () => {
    const result = validateExpense({ ...validExpense, description: '   ' });
    expect(result.isValid).toBe(false);
  });

  it('returns invalid for description exceeding 100 characters', () => {
    const result = validateExpense({
      ...validExpense,
      description: 'a'.repeat(101),
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/100/);
  });

  it('returns valid for description of exactly 100 characters', () => {
    const result = validateExpense({
      ...validExpense,
      description: 'a'.repeat(100),
    });
    expect(result.isValid).toBe(true);
  });

  it('returns invalid for missing category', () => {
    const result = validateExpense({ ...validExpense, category: undefined });
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/category/i);
  });

  it('returns invalid for unrecognized category value', () => {
    const result = validateExpense({
      ...validExpense,
      category: 'other' as never,
    });
    expect(result.isValid).toBe(false);
  });

  it('returns valid for all three valid categories', () => {
    expect(validateExpense({ ...validExpense, category: 'needs' }).isValid).toBe(true);
    expect(validateExpense({ ...validExpense, category: 'wants' }).isValid).toBe(true);
    expect(validateExpense({ ...validExpense, category: 'savings' }).isValid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateIncome
// ---------------------------------------------------------------------------
describe('validateIncome', () => {
  it('returns valid for a positive income', () => {
    expect(validateIncome(100000).isValid).toBe(true);
  });

  it('returns valid for income of 0', () => {
    expect(validateIncome(0).isValid).toBe(true);
  });

  it('returns invalid for negative income', () => {
    const result = validateIncome(-1);
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/negative/i);
  });

  it('returns invalid for income exceeding 100,000,000', () => {
    const result = validateIncome(100000001);
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/maximum/i);
  });

  it('returns valid for income at the maximum limit', () => {
    expect(validateIncome(100000000).isValid).toBe(true);
  });
});
