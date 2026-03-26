import { parseImportJSON, ImportError } from '../../utils/importData';

const validPayload = {
  version: 1,
  exportedAt: new Date().toISOString(),
  currency: 'USD',
  monthlyIncome: 100000,
  expenses: [
    {
      id: 'abc',
      amount: 1000,
      description: 'Test',
      category: 'needs',
      date: '2024-01-01',
      createdAt: new Date().toISOString(),
    },
  ],
};

describe('parseImportJSON', () => {
  it('returns parsed payload for valid JSON', () => {
    const result = parseImportJSON(JSON.stringify(validPayload));
    expect(result.expenses).toHaveLength(1);
    expect(result.currency).toBe('USD');
  });

  it('throws ImportError for malformed JSON', () => {
    expect(() => parseImportJSON('not json')).toThrow(ImportError);
  });

  it('throws ImportError if version field is missing', () => {
    const bad = { ...validPayload };
    delete (bad as any).version;
    expect(() => parseImportJSON(JSON.stringify(bad))).toThrow(ImportError);
  });

  it('throws ImportError if expenses is not an array', () => {
    const bad = { ...validPayload, expenses: null };
    expect(() => parseImportJSON(JSON.stringify(bad))).toThrow(ImportError);
  });

  it('throws ImportError if an expense is missing required fields', () => {
    const badExpense = { id: 'x', amount: 100 }; // missing description, category, date
    const bad = { ...validPayload, expenses: [badExpense] };
    expect(() => parseImportJSON(JSON.stringify(bad))).toThrow(ImportError);
  });

  it('throws ImportError if expense amount is not a number', () => {
    const badExpense = { ...validPayload.expenses[0], amount: 'hundred' };
    const bad = { ...validPayload, expenses: [badExpense] };
    expect(() => parseImportJSON(JSON.stringify(bad))).toThrow(ImportError);
  });

  it('throws ImportError for invalid category value', () => {
    const badExpense = { ...validPayload.expenses[0], category: 'other' };
    const bad = { ...validPayload, expenses: [badExpense] };
    expect(() => parseImportJSON(JSON.stringify(bad))).toThrow(ImportError);
  });
});
