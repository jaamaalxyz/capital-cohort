import {
  expensesToCSV,
  expensesToJSON,
  buildExportFilename,
} from '../../utils/exportData';
import { Expense } from '../../types';

const makeExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: 'abc-123',
  amount: 5050,
  description: 'Groceries',
  category: 'needs',
  date: '2024-01-15',
  createdAt: '2024-01-15T10:00:00.000Z',
  ...overrides,
});

describe('expensesToCSV', () => {
  it('includes header row', () => {
    const csv = expensesToCSV([]);
    const firstLine = csv.split('\n')[0];
    expect(firstLine).toContain('date');
    expect(firstLine).toContain('description');
    expect(firstLine).toContain('category');
    expect(firstLine).toContain('amount');
  });

  it('converts cents to decimal in CSV output', () => {
    const csv = expensesToCSV([makeExpense({ amount: 5050 })]);
    expect(csv).toContain('50.50');
  });

  it('wraps description in quotes if it contains a comma', () => {
    const csv = expensesToCSV([makeExpense({ description: 'Rent, utilities' })]);
    expect(csv).toContain('"Rent, utilities"');
  });

  it('escapes double quotes inside descriptions', () => {
    const csv = expensesToCSV([makeExpense({ description: 'He said "hello"' })]);
    expect(csv).toContain('"He said ""hello"""');
  });

  it('returns only header row for empty expenses array', () => {
    const lines = expensesToCSV([]).split('\n').filter(Boolean);
    expect(lines).toHaveLength(1);
  });

  it('each expense maps to exactly one data row', () => {
    const expenses = [makeExpense(), makeExpense({ id: '2' })];
    const lines = expensesToCSV(expenses).split('\n').filter(Boolean);
    expect(lines).toHaveLength(3); // header + 2 rows
  });
});

describe('expensesToJSON', () => {
  it('returns valid JSON string', () => {
    const json = expensesToJSON([], 'USD', 100000);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('payload contains all required top-level keys', () => {
    const payload = JSON.parse(expensesToJSON([], 'USD', 100000));
    expect(payload).toHaveProperty('version');
    expect(payload).toHaveProperty('exportedAt');
    expect(payload).toHaveProperty('currency');
    expect(payload).toHaveProperty('monthlyIncome');
    expect(payload).toHaveProperty('expenses');
    expect(payload).toHaveProperty('extraIncomes');
    expect(payload).toHaveProperty('debtEntries');
  });

  it('expenses array in JSON preserves original amounts in cents', () => {
    const expense = makeExpense({ amount: 5050 });
    const payload = JSON.parse(expensesToJSON([expense], 'USD', 100000));
    expect(payload.expenses[0].amount).toBe(5050);
  });

  it('version field is 2', () => {
    const payload = JSON.parse(expensesToJSON([], 'USD', 100000));
    expect(payload.version).toBe(2);
  });
});

describe('buildExportFilename', () => {
  it('returns filename with format and month', () => {
    const name = buildExportFilename('csv', '2024-01');
    expect(name).toMatch(/2024-01/);
    expect(name).toMatch(/\.csv$/);
  });

  it('returns .json extension for json format', () => {
    const name = buildExportFilename('json', '2024-01');
    expect(name).toMatch(/\.json$/);
  });

  it('includes "capital-cohort" prefix for identification', () => {
    const name = buildExportFilename('csv', '2024-01');
    expect(name.toLowerCase()).toContain('capital-cohort');
  });
});
