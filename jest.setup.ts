// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-svg (convert SVG elements to testable RN views/text)
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  const svgEl = (testIDKey = 'testID') =>
    ({ children, testID, ...rest }: any) =>
      React.createElement(View, { testID: testID ?? rest[testIDKey] }, children);

  const SvgText = ({ children, testID }: any) =>
    React.createElement(Text, { testID }, children);

  return {
    __esModule: true,
    default: svgEl(),
    Svg: svgEl(),
    Rect: svgEl(),
    Path: svgEl(),
    Circle: svgEl(),
    G: svgEl(),
    Text: SvgText,
    Defs: svgEl(),
    ClipPath: svgEl(),
  };
});

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

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  cacheDirectory: '/mock-cache/',
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn(() => Promise.resolve('')),
  deleteAsync: jest.fn(() => Promise.resolve()),
  EncodingType: { UTF8: 'utf8', Base64: 'base64' },
}));

// Mock expo-document-picker
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(() =>
    Promise.resolve({ canceled: true, assets: null })
  ),
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
