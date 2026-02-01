import en from './locales/en';

// This allows TypeScript to infer the translation keys
export type TranslationKeys = typeof en;

// Extend i18next types for type-safe translations
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: TranslationKeys;
    };
  }
}
