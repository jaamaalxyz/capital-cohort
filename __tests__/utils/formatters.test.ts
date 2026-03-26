import {
  parseCurrency,
  getCurrentMonth,
  getToday,
  generateId,
  getPreviousMonth,
  getNextMonth,
  formatCurrency,
} from '../../utils/formatters';

// ---------------------------------------------------------------------------
// formatCurrency
// ---------------------------------------------------------------------------
describe('formatCurrency', () => {
  it('converts cents to decimal string with symbol', () => {
    const result = formatCurrency(5050, '$');
    expect(result).toContain('50.50');
    expect(result).toContain('$');
  });

  it('formats 0 cents as zero value', () => {
    const result = formatCurrency(0, '$');
    expect(result).toContain('0.00');
  });

  it('uses default $ symbol when none provided', () => {
    const result = formatCurrency(1000);
    expect(result).toContain('$');
  });

  it('handles large amounts', () => {
    const result = formatCurrency(1000000, '$');
    expect(result).toContain('10,000.00');
  });
});

// ---------------------------------------------------------------------------
// parseCurrency
// ---------------------------------------------------------------------------
describe('parseCurrency', () => {
  it('converts decimal string to cents', () => {
    expect(parseCurrency('10.50')).toBe(1050);
  });

  it('handles whole number strings', () => {
    expect(parseCurrency('100')).toBe(10000);
  });

  it('strips non-numeric characters', () => {
    expect(parseCurrency('$50.00')).toBe(5000);
  });

  it('returns 0 for empty string', () => {
    expect(parseCurrency('')).toBe(0);
  });

  it('returns 0 for non-numeric string', () => {
    expect(parseCurrency('abc')).toBe(0);
  });

  it('rounds to nearest cent', () => {
    expect(parseCurrency('10.999')).toBe(1100);
  });
});

// ---------------------------------------------------------------------------
// getCurrentMonth
// ---------------------------------------------------------------------------
describe('getCurrentMonth', () => {
  it('returns string in YYYY-MM format', () => {
    const month = getCurrentMonth();
    expect(month).toMatch(/^\d{4}-\d{2}$/);
  });

  it('returns the actual current year', () => {
    const month = getCurrentMonth();
    const year = new Date().getFullYear();
    expect(month.startsWith(String(year))).toBe(true);
  });

  it('pads single-digit months with a zero', () => {
    // Mock Date to return January
    const RealDate = global.Date;
    jest
      .spyOn(global, 'Date')
      .mockImplementationOnce(() => new RealDate('2024-01-15'));
    const month = getCurrentMonth();
    expect(month).toBe('2024-01');
    jest.restoreAllMocks();
  });
});

// ---------------------------------------------------------------------------
// getToday
// ---------------------------------------------------------------------------
describe('getToday', () => {
  it('returns string in YYYY-MM-DD format', () => {
    const today = getToday();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns the actual current date', () => {
    const today = getToday();
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(today).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// generateId
// ---------------------------------------------------------------------------
describe('generateId', () => {
  it('returns a UUID v4 formatted string', () => {
    const id = generateId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it('generates unique IDs on each call', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});

// ---------------------------------------------------------------------------
// getPreviousMonth
// ---------------------------------------------------------------------------
describe('getPreviousMonth', () => {
  it('returns the month before the given month', () => {
    expect(getPreviousMonth('2024-03')).toBe('2024-02');
  });

  it('wraps from January to December of the previous year', () => {
    expect(getPreviousMonth('2024-01')).toBe('2023-12');
  });

  it('returns result in YYYY-MM format', () => {
    expect(getPreviousMonth('2024-06')).toMatch(/^\d{4}-\d{2}$/);
  });
});

// ---------------------------------------------------------------------------
// getNextMonth
// ---------------------------------------------------------------------------
describe('getNextMonth', () => {
  it('returns the month after the given month', () => {
    expect(getNextMonth('2024-03')).toBe('2024-04');
  });

  it('wraps from December to January of the next year', () => {
    expect(getNextMonth('2023-12')).toBe('2024-01');
  });

  it('pads single-digit months', () => {
    expect(getNextMonth('2024-08')).toBe('2024-09');
  });

  it('returns result in YYYY-MM format', () => {
    expect(getNextMonth('2024-06')).toMatch(/^\d{4}-\d{2}$/);
  });
});
