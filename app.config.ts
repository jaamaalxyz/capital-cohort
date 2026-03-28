import { ConfigContext, ExpoConfig } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';

const APP_NAME = IS_DEV ? 'CC (Dev)' : 'Capital Cohort';
const BUNDLE_ID = IS_DEV
  ? 'com.jaamaalxyz.capitalcohort.dev'
  : 'com.jaamaalxyz.capitalcohort';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: APP_NAME,
  description: 'Personalize money management for all',
  slug: 'capital-cohort',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  scheme: IS_DEV ? 'capital-cohort-dev' : 'capital-cohort',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#4CAF50',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: BUNDLE_ID,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSLocationWhenInUseUsageDescription:
        'We use your location to provide localized insights and currency suggestions.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundImage: './assets/adaptive-icon-background.png',
      monochromeImage: './assets/adaptive-icon-monochrome.png',
    },
    package: BUNDLE_ID,
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-localization',
    [
      'expo-dev-client',
      {
        launchMode: 'most-recent',
      },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow Capital Cohort to use your location.',
      },
    ],
    'expo-sharing',
    '@react-native-community/datetimepicker',
    [
      'expo-notifications',
      {
        icon: './assets/adaptive-icon-monochrome.png',
        color: '#4CAF50',
      },
    ],
  ],
  owner: 'jaamaalxyz',
  extra: {
    eas: {
      projectId: 'cc521750-c682-4111-8b9c-71596e457f85',
    },
  },
});
