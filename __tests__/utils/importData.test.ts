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
  extraIncomes: [
    {
      id: 'ei1',
      amount: 500,
      description: 'Side gig',
      month: '2024-01',
      date: '2024-01-05',
      createdAt: new Date().toISOString(),
    },
  ],
  debtEntries: [
    {
      id: 'de1',
      amount: 200,
      creditor: 'Bob',
      month: '2024-01',
      date: '2024-01-06',
      createdAt: new Date().toISOString(),
      isSettled: false,
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

  it('throws ImportError if extraIncomes is not an array (v2+)', () => {
    const bad = { ...validPayload, version: 2, extraIncomes: 'not an array' };
    expect(() => parseImportJSON(JSON.stringify(bad))).toThrow(ImportError);
  });

  it('throws ImportError if debtEntries is not an array (v2+)', () => {
    const bad = { ...validPayload, version: 2, debtEntries: {} };
    expect(() => parseImportJSON(JSON.stringify(bad))).toThrow(ImportError);
  });

  it('succeeds for v1 payload missing extraIncomes/debtEntries', () => {
    const v1 = { ...validPayload, version: 1 };
    delete (v1 as any).extraIncomes;
    delete (v1 as any).debtEntries;
    const result = parseImportJSON(JSON.stringify(v1));
    expect(result.extraIncomes).toEqual([]);
    expect(result.debtEntries).toEqual([]);
  });
});
