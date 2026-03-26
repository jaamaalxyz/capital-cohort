const i18n = {
  language: 'en',
  use: jest.fn().mockReturnThis(),
  init: jest.fn(() => Promise.resolve()),
  changeLanguage: jest.fn(() => Promise.resolve()),
  t: (key: string) => key,
};

export default i18n;
export const changeLanguage = jest.fn();
export const getCurrentLanguage = jest.fn(() => 'en');
export const initI18n = jest.fn(() => Promise.resolve(i18n));
export const resources = {};
export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
];
