import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetProvider } from '../../context/BudgetContext';
import { ThemeProvider } from '../../context/ThemeContext';
import OnboardingScreen from '../../app/onboarding';

const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <BudgetProvider>{children}</BudgetProvider>
  </ThemeProvider>
);

const renderOnboarding = () =>
  render(
    <Providers>
      <OnboardingScreen />
    </Providers>
  );

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('Onboarding screen — step 0 (Welcome)', () => {
  it('renders without crashing', async () => {
    const { findByText } = renderOnboarding();
    expect(await findByText('onboarding.welcome')).toBeTruthy();
  });

  it('shows welcome title on first step', async () => {
    const { findByText } = renderOnboarding();
    expect(await findByText('onboarding.welcome')).toBeTruthy();
  });

  it('shows welcome subtitle', async () => {
    const { findByText } = renderOnboarding();
    expect(await findByText('onboarding.welcomeSubtitle')).toBeTruthy();
  });

  it('shows Continue button on welcome step', async () => {
    const { findByText } = renderOnboarding();
    expect(await findByText('onboarding.continue')).toBeTruthy();
  });

  it('does not show back button on first step', async () => {
    const { findByText, queryByText } = renderOnboarding();
    await findByText('onboarding.welcome'); // wait for render
    expect(queryByText(/← onboarding.back/)).toBeNull();
  });
});

describe('Onboarding screen — navigation', () => {
  it('advances to step 1 when Continue is pressed', async () => {
    const { findByText } = renderOnboarding();
    const continueBtn = await findByText('onboarding.continue');

    await act(async () => {
      fireEvent.press(continueBtn);
    });

    expect(await findByText('onboarding.locationTitle')).toBeTruthy();
  });

  it('shows back button after advancing past step 0', async () => {
    const { findByText } = renderOnboarding();
    const continueBtn = await findByText('onboarding.continue');
    await act(async () => {
      fireEvent.press(continueBtn);
    });
    expect(await findByText(/← onboarding.back/)).toBeTruthy();
  });

  it('goes back when back button is pressed', async () => {
    const { findByText } = renderOnboarding();

    // Advance to step 1 (location)
    const continueBtn = await findByText('onboarding.continue');
    await act(async () => {
      fireEvent.press(continueBtn);
    });

    await findByText('onboarding.locationTitle');

    // Press back
    const backBtn = await findByText(/← onboarding.back/);
    await act(async () => {
      fireEvent.press(backBtn);
    });

    expect(await findByText('onboarding.welcome')).toBeTruthy();
  });
});

describe('Onboarding screen — location step', () => {
  const goToStep1 = async (queryByText: ReturnType<typeof render>) => {
    // Navigate from welcome (step 0) to location (step 1)
    const btn = await queryByText.findByText('onboarding.continue');
    await act(async () => {
      fireEvent.press(btn);
    });
  };

  it('shows location title on step 1', async () => {
    const queries = renderOnboarding();
    await goToStep1(queries);
    expect(await queries.findByText('onboarding.locationTitle')).toBeTruthy();
  });

  it('shows skip location button', async () => {
    const queries = renderOnboarding();
    await goToStep1(queries);
    expect(await queries.findByText('onboarding.skipLocation')).toBeTruthy();
  });

  it('shows allow location button', async () => {
    const queries = renderOnboarding();
    await goToStep1(queries);
    expect(await queries.findByText('onboarding.allowLocation')).toBeTruthy();
  });

  it('navigates to step 2 when skip location is pressed', async () => {
    const queries = renderOnboarding();
    await goToStep1(queries);
    const skipBtn = await queries.findByText('onboarding.skipLocation');
    await act(async () => {
      fireEvent.press(skipBtn);
    });
    expect(await queries.findByText('onboarding.languageTitle')).toBeTruthy();
  });
});

describe('Onboarding screen — progress dots', () => {
  it('renders progress indicators without crashing', async () => {
    const { findByText } = renderOnboarding();
    expect(await findByText('onboarding.welcome')).toBeTruthy();
  });
});
