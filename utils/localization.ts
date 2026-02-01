import { LanguageCode, AppLanguage, CountryConfig } from '../types';

/**
 * Default configuration used for unsupported regions or empty inputs
 */
export const DEFAULT_CONFIG: CountryConfig = {
  language: AppLanguage.EN,
  currency: 'USD',
};

/**
 * Mapping of country codes and names to their preferred language and currency.
 * Using ISO Alpha-2 codes and normalized names as keys.
 */
const COUNTRY_MAP: Record<string, CountryConfig> = {
  // Asia
  BD: { language: AppLanguage.BN, currency: 'BDT' },
  BANGLADESH: { language: AppLanguage.BN, currency: 'BDT' },
  IN: { language: AppLanguage.EN, currency: 'INR' },
  INDIA: { language: AppLanguage.EN, currency: 'INR' },
  PK: { language: AppLanguage.EN, currency: 'PKR' },
  PAKISTAN: { language: AppLanguage.EN, currency: 'PKR' },
  LK: { language: AppLanguage.EN, currency: 'LKR' },
  SRI_LANKA: { language: AppLanguage.EN, currency: 'LKR' },
  SG: { language: AppLanguage.EN, currency: 'SGD' },
  SINGAPORE: { language: AppLanguage.EN, currency: 'SGD' },
  MY: { language: AppLanguage.EN, currency: 'MYR' },
  MALAYSIA: { language: AppLanguage.EN, currency: 'MYR' },
  ID: { language: AppLanguage.EN, currency: 'IDR' },
  INDONESIA: { language: AppLanguage.EN, currency: 'IDR' },
  TH: { language: AppLanguage.EN, currency: 'THB' },
  THAILAND: { language: AppLanguage.EN, currency: 'THB' },
  VN: { language: AppLanguage.EN, currency: 'VND' },
  VIETNAM: { language: AppLanguage.EN, currency: 'VND' },
  PH: { language: AppLanguage.EN, currency: 'PHP' },
  PHILIPPINES: { language: AppLanguage.EN, currency: 'PHP' },

  // Americas
  US: { language: AppLanguage.EN, currency: 'USD' },
  USA: { language: AppLanguage.EN, currency: 'USD' },
  UNITED_STATES: { language: AppLanguage.EN, currency: 'USD' },
  CA: { language: AppLanguage.EN, currency: 'CAD' },
  CANADA: { language: AppLanguage.EN, currency: 'CAD' },
  BR: { language: AppLanguage.EN, currency: 'BRL' },
  BRAZIL: { language: AppLanguage.EN, currency: 'BRL' },
  MX: { language: AppLanguage.EN, currency: 'MXN' },
  MEXICO: { language: AppLanguage.EN, currency: 'MXN' },

  // Europe
  GB: { language: AppLanguage.EN, currency: 'GBP' },
  UK: { language: AppLanguage.EN, currency: 'GBP' },
  UNITED_KINGDOM: { language: AppLanguage.EN, currency: 'GBP' },
  DE: { language: AppLanguage.EN, currency: 'EUR' },
  GERMANY: { language: AppLanguage.EN, currency: 'EUR' },
  FR: { language: AppLanguage.EN, currency: 'EUR' },
  FRANCE: { language: AppLanguage.EN, currency: 'EUR' },
  IT: { language: AppLanguage.EN, currency: 'EUR' },
  ITALY: { language: AppLanguage.EN, currency: 'EUR' },
  ES: { language: AppLanguage.EN, currency: 'EUR' },
  SPAIN: { language: AppLanguage.EN, currency: 'EUR' },
  NL: { language: AppLanguage.EN, currency: 'EUR' },
  NETHERLANDS: { language: AppLanguage.EN, currency: 'EUR' },
  CH: { language: AppLanguage.EN, currency: 'CHF' },
  SWITZERLAND: { language: AppLanguage.EN, currency: 'CHF' },

  // Oceania
  AU: { language: AppLanguage.EN, currency: 'AUD' },
  AUSTRALIA: { language: AppLanguage.EN, currency: 'AUD' },
  NZ: { language: AppLanguage.EN, currency: 'NZD' },
  NEW_ZEALAND: { language: AppLanguage.EN, currency: 'NZD' },

  // Africa
  ZA: { language: AppLanguage.EN, currency: 'ZAR' },
  SOUTH_AFRICA: { language: AppLanguage.EN, currency: 'ZAR' },
  NG: { language: AppLanguage.EN, currency: 'NGN' },
  NIGERIA: { language: AppLanguage.EN, currency: 'NGN' },
  KE: { language: AppLanguage.EN, currency: 'KES' },
  KENYA: { language: AppLanguage.EN, currency: 'KES' },
  EG: { language: AppLanguage.EN, currency: 'EGP' },
  EGYPT: { language: AppLanguage.EN, currency: 'EGP' },

  // Middle East
  AE: { language: AppLanguage.EN, currency: 'AED' },
  UNITED_ARAB_EMIRATES: { language: AppLanguage.EN, currency: 'AED' },
  SA: { language: AppLanguage.EN, currency: 'SAR' },
  SAUDI_ARABIA: { language: AppLanguage.EN, currency: 'SAR' },
  TR: { language: AppLanguage.EN, currency: 'TRY' },
  TURKEY: { language: AppLanguage.EN, currency: 'TRY' },
};

/**
 * Returns default localization settings based on a country code or name.
 * Normalizes input to match map keys (e.g. "United States" -> "UNITED_STATES").
 *
 * @param countryIdentifier - The country code or name from reverse geocoding
 * @returns {CountryConfig} The default language and currency code
 */
export function getDefaultsByCountry(
  countryIdentifier?: string,
): CountryConfig {
  if (!countryIdentifier) {
    return DEFAULT_CONFIG;
  }

  const normalizedKey = countryIdentifier
    .toUpperCase()
    .trim()
    .replace(/\s+/g, '_');

  return COUNTRY_MAP[normalizedKey] || DEFAULT_CONFIG;
}
