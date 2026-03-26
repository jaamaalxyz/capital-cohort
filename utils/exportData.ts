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
