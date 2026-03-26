import { getDefaultsByCountry, DEFAULT_CONFIG } from '../../utils/localization';

describe('getDefaultsByCountry', () => {
  // --- Bangladesh ---
  it('returns BDT + Bengali for country code BD', () => {
    const result = getDefaultsByCountry('BD');
    expect(result.currency).toBe('BDT');
    expect(result.language).toBe('bn');
  });

  it('returns BDT + Bengali for country name Bangladesh (case-insensitive)', () => {
    const result = getDefaultsByCountry('bangladesh');
    expect(result.currency).toBe('BDT');
    expect(result.language).toBe('bn');
  });

  // --- USA ---
  it('returns USD + English for US', () => {
    const result = getDefaultsByCountry('US');
    expect(result.currency).toBe('USD');
    expect(result.language).toBe('en');
  });

  it('returns USD + English for "United States"', () => {
    const result = getDefaultsByCountry('United States');
    expect(result.currency).toBe('USD');
    expect(result.language).toBe('en');
  });

  // --- UK ---
  it('returns GBP + English for GB', () => {
    const result = getDefaultsByCountry('GB');
    expect(result.currency).toBe('GBP');
  });

  // --- India ---
  it('returns INR + English for India', () => {
    const result = getDefaultsByCountry('IN');
    expect(result.currency).toBe('INR');
    expect(result.language).toBe('en');
  });

  // --- Australia ---
  it('returns AUD + English for AU', () => {
    const result = getDefaultsByCountry('AU');
    expect(result.currency).toBe('AUD');
  });

  // --- Fallback ---
  it('returns default config for unknown country', () => {
    const result = getDefaultsByCountry('ZZ');
    expect(result).toEqual(DEFAULT_CONFIG);
  });

  it('returns default config for undefined input', () => {
    const result = getDefaultsByCountry(undefined);
    expect(result).toEqual(DEFAULT_CONFIG);
  });

  it('returns default config for empty string', () => {
    const result = getDefaultsByCountry('');
    expect(result).toEqual(DEFAULT_CONFIG);
  });

  // --- Case and whitespace normalization ---
  it('handles leading and trailing whitespace', () => {
    const result = getDefaultsByCountry('  BD  ');
    expect(result.currency).toBe('BDT');
  });

  it('is case-insensitive for country codes', () => {
    const result = getDefaultsByCountry('us');
    expect(result.currency).toBe('USD');
  });

  // --- Middle East ---
  it('returns AED for UAE', () => {
    const result = getDefaultsByCountry('AE');
    expect(result.currency).toBe('AED');
  });

  // --- Africa ---
  it('returns ZAR for South Africa', () => {
    const result = getDefaultsByCountry('ZA');
    expect(result.currency).toBe('ZAR');
  });
});
