// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({ coords: { latitude: 23.8, longitude: 90.4 } })
  ),
  reverseGeocodeAsync: jest.fn(() =>
    Promise.resolve([{ country: 'Bangladesh', city: 'Dhaka' }])
  ),
}));

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en', regionCode: 'US' }]),
  locale: 'en-US',
  locales: [{ languageCode: 'en', regionCode: 'US' }],
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  useSegments: jest.fn(() => []),
  usePathname: jest.fn(() => '/'),
  Link: 'Link',
  Redirect: 'Redirect',
  Stack: { Screen: 'Screen' },
  Tabs: { Screen: 'Screen' },
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: jest.fn(), language: 'en' },
  }),
  initReactI18next: { type: '3rdParty', init: jest.fn() },
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock i18next
jest.mock('i18next', () => ({
  default: {
    language: 'en',
    use: jest.fn().mockReturnThis(),
    init: jest.fn(() => Promise.resolve()),
    changeLanguage: jest.fn(() => Promise.resolve()),
    t: (key: string) => key,
  },
}));

// Silence noisy act() warnings during tests
const originalConsoleError = console.error;
global.console.error = (...args: unknown[]) => {
  const msg = args[0];
  if (
    typeof msg === 'string' &&
    (msg.includes('act(') || msg.includes('ReactDOM.render'))
  ) {
    return;
  }
  originalConsoleError(...args);
};
