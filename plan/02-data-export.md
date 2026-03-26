# Plan 02 — Data Export & Backup

**Priority:** P1
**Type:** Feature
**Effort:** 2 days
**Depends on:** Plan 00 (test infrastructure)

---

## Overview

Allow users to export all their financial data as **CSV** or **JSON** from the Settings screen. This is critical for an offline-first app — users must be able to back up and move their data.

Scope:
- Export current month's expenses as CSV
- Export all expenses as JSON (full backup)
- Share via native OS share sheet (no cloud dependency)
- Import from previously exported JSON (restore backup)

---

## Dependencies to Install

```bash
npx expo install expo-sharing expo-file-system expo-document-picker
```

- `expo-sharing` — native share sheet (no permissions required on iOS/Android)
- `expo-file-system` — write temp file to device cache before sharing
- `expo-document-picker` — pick a JSON backup file for import

---

## New Files

```
utils/
  exportData.ts                   # CSV/JSON generation logic
  importData.ts                   # Parse and validate imported JSON
__tests__/
  utils/exportData.test.ts
  utils/importData.test.ts
  screens/Settings.export.test.tsx
```

---

## New Types (`types/index.ts` additions)

```ts
export interface ExportPayload {
  version: number;           // schema version for future migrations
  exportedAt: string;        // ISO datetime
  currency: string;
  monthlyIncome: number;
  expenses: Expense[];
}

export type ExportFormat = 'csv' | 'json';
```

---

## TDD Cycle 1 — `exportData.ts`

### RED: Write tests first

**`__tests__/utils/exportData.test.ts`**
```ts
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
  });

  it('expenses array in JSON preserves original amounts in cents', () => {
    const expense = makeExpense({ amount: 5050 });
    const payload = JSON.parse(expensesToJSON([expense], 'USD', 100000));
    expect(payload.expenses[0].amount).toBe(5050);
  });

  it('version field is a positive integer', () => {
    const payload = JSON.parse(expensesToJSON([], 'USD', 100000));
    expect(typeof payload.version).toBe('number');
    expect(payload.version).toBeGreaterThan(0);
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
```

### GREEN: Implement `utils/exportData.ts`

```ts
import { Expense, ExportPayload, ExportFormat } from '../types';

const CSV_HEADER = 'date,description,category,amount\n';

function escapeCSVField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function expensesToCSV(expenses: Expense[]): string {
  const rows = expenses.map((e) =>
    [
      e.date,
      escapeCSVField(e.description),
      e.category,
      (e.amount / 100).toFixed(2),
    ].join(',')
  );
  return CSV_HEADER + rows.join('\n');
}

export function expensesToJSON(
  expenses: Expense[],
  currency: string,
  monthlyIncome: number
): string {
  const payload: ExportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    currency,
    monthlyIncome,
    expenses,
  };
  return JSON.stringify(payload, null, 2);
}

export function buildExportFilename(format: ExportFormat, month: string): string {
  return `capital-cohort-${month}.${format}`;
}
```

### REFACTOR
- No external dependencies in this util — pure functions, easy to test
- Consider memoizing large CSV generation if expense count is high

---

## TDD Cycle 2 — `importData.ts`

### RED

**`__tests__/utils/importData.test.ts`**
```ts
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
```

### GREEN: Implement `utils/importData.ts`

```ts
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
  return p as unknown as ExportPayload;
}
```

---

## TDD Cycle 3 — Settings Screen Export Buttons

### RED

**`__tests__/screens/Settings.export.test.tsx`**
```tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as ExpoSharing from 'expo-sharing';
import * as ExpoFileSystem from 'expo-file-system';

jest.mock('expo-sharing', () => ({ shareAsync: jest.fn() }));
jest.mock('expo-file-system', () => ({
  cacheDirectory: '/mock-cache/',
  writeAsStringAsync: jest.fn(),
}));

describe('Settings screen — export', () => {
  it('renders Export CSV button', async () => {
    const { getByTestId } = render(/* Settings with BudgetProvider */);
    await waitFor(() => expect(getByTestId('export-csv-btn')).toBeTruthy());
  });

  it('renders Export JSON button', async () => {
    const { getByTestId } = render(/* ... */);
    await waitFor(() => expect(getByTestId('export-json-btn')).toBeTruthy());
  });

  it('calls expo-sharing when Export CSV is pressed', async () => {
    const { getByTestId } = render(/* ... */);
    fireEvent.press(await waitFor(() => getByTestId('export-csv-btn')));
    await waitFor(() => expect(ExpoSharing.shareAsync).toHaveBeenCalled());
  });

  it('writes file to cacheDirectory before sharing', async () => {
    const { getByTestId } = render(/* ... */);
    fireEvent.press(await waitFor(() => getByTestId('export-json-btn')));
    await waitFor(() => expect(ExpoFileSystem.writeAsStringAsync).toHaveBeenCalled());
  });

  it('shows error alert if sharing fails', async () => {
    (ExpoSharing.shareAsync as jest.Mock).mockRejectedValueOnce(new Error('Share failed'));
    // assert Alert.alert called
  });
});
```

---

## Settings Screen Changes

Add to `app/(tabs)/settings.tsx` an "Export & Backup" section:

```tsx
// Export current month CSV
<TouchableOpacity testID="export-csv-btn" onPress={handleExportCSV}>
  <Text>Export This Month (CSV)</Text>
</TouchableOpacity>

// Export full backup JSON
<TouchableOpacity testID="export-json-btn" onPress={handleExportJSON}>
  <Text>Export All Data (JSON)</Text>
</TouchableOpacity>

// Import from JSON backup
<TouchableOpacity testID="import-json-btn" onPress={handleImportJSON}>
  <Text>Restore from Backup</Text>
</TouchableOpacity>
```

**Import handler flow:**
1. `expo-document-picker` to pick `.json` file
2. Read file contents via `expo-file-system`
3. `parseImportJSON()` — throw on invalid
4. Confirm dialog: "This will replace all current data. Continue?"
5. Dispatch `LOAD_DATA` action into `BudgetContext`

---

## Acceptance Criteria

- [ ] `expensesToCSV` handles all CSV edge cases (commas, quotes, empty array)
- [ ] `expensesToJSON` produces valid JSON with correct schema
- [ ] `parseImportJSON` rejects invalid/missing fields with typed `ImportError`
- [ ] Export CSV triggers native share sheet with `.csv` file
- [ ] Export JSON triggers native share sheet with `.json` file
- [ ] Import restores expenses and income into app state
- [ ] Import shows confirmation dialog before overwriting data
- [ ] Error shown if import file is corrupt

---

## Definition of Done

- All tests green
- Manual share test on iOS simulator and Android emulator
- Import round-trip: export → re-import → state matches original
