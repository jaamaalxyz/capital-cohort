import { ExportPayload, Expense } from '../types';

export class ImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImportError';
  }
}

const VALID_CATEGORIES = new Set(['needs', 'wants', 'savings']);

function validateExpense(e: unknown, index: number): Expense {
  if (typeof e !== 'object' || e === null) {
    throw new ImportError(`Expense at index ${index} is not an object`);
  }
  const exp = e as Record<string, unknown>;
  const required = ['id', 'amount', 'description', 'category', 'date', 'createdAt'];
  for (const key of required) {
    if (!(key in exp)) throw new ImportError(`Expense missing field: ${key}`);
  }
  if (typeof exp.amount !== 'number') throw new ImportError('Expense amount must be a number');
  if (!VALID_CATEGORIES.has(exp.category as string)) {
    throw new ImportError(`Invalid category: ${exp.category}`);
  }
  return exp as unknown as Expense;
}

export function parseImportJSON(raw: string): ExportPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ImportError('Invalid JSON format');
  }
  if (typeof parsed !== 'object' || parsed === null) throw new ImportError('Root must be object');
  const p = parsed as Record<string, unknown>;
  if (!('version' in p)) throw new ImportError('Missing version field');
  if (!Array.isArray(p.expenses)) throw new ImportError('expenses must be an array');
  p.expenses = p.expenses.map((e, i) => validateExpense(e, i));

  // Handle version 2+ fields
  if (p.version && (p.version as number) >= 2) {
    if (!('extraIncomes' in p) || !Array.isArray(p.extraIncomes)) {
      throw new ImportError('extraIncomes must be an array');
    }
    if (!('debtEntries' in p) || !Array.isArray(p.debtEntries)) {
      throw new ImportError('debtEntries must be an array');
    }
  } else {
    // Backward compatibility for v1
    p.extraIncomes = [];
    p.debtEntries = [];
  }

  return p as unknown as ExportPayload;
}
