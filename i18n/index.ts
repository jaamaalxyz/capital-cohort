import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import en from './locales/en';
import bn from './locales/bn';
import { STORAGE_KEYS } from '../constants/theme';
import { AppLanguage, LanguageCode } from '../types';

export const resources = {
  [AppLanguage.EN]: { translation: en },
  [AppLanguage.BN]: { translation: bn },
} as const;

export const supportedLanguages = [
  { code: AppLanguage.EN, name: 'English', nativeName: 'English' },
  { code: AppLanguage.BN, name: 'Bengali', nativeName: 'বাংলা' },
] as const;

const getDeviceLanguage = (): LanguageCode => {
  const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'en';
  const isSupported = supportedLanguages.some(
    (lang) => lang.code === deviceLocale,
  );
  return isSupported ? (deviceLocale as LanguageCode) : 'en';
};

const initI18n = async () => {
  let savedLanguage: string | null = null;

  try {
    savedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
  } catch (error) {
    console.error('Error loading language preference:', error);
  }

  const language = savedLanguage ?? getDeviceLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

  return i18n;
};

export const changeLanguage = async (language: LanguageCode) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

export const getCurrentLanguage = (): LanguageCode => {
  return (i18n.language as LanguageCode) ?? 'en';
};

export { initI18n };
export default i18n;
