import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  FlatList,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { changeLanguage, supportedLanguages } from '../i18n';
import { useBudget } from '../context/BudgetContext';
import { COLORS, SPACING, FONT_SIZE } from '../constants/theme';
import { CURRENCIES, getCurrencyByCode } from '../constants/currencies';
import { ScreenContainer } from '../components/ScreenContainer';
import { AmountInput } from '../components/AmountInput';
import { getDefaultsByCountry } from '../utils/localization';
import { LanguageCode, Currency } from '../types';

export default function OnboardingScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { state, setIncome, setCurrency, setLocation, completeOnboarding } =
    useBudget();

  const [step, setStep] = useState(0); // 0: Welcome, 1: Location, 2: Language, 3: Currency, 4: Income, 5: Summary
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currencySearch, setCurrencySearch] = useState('');

  // Temporary onboarding state
  const [tempData, setTempData] = useState({
    location: null as any,
    language: i18n.language as LanguageCode,
    currency: 'USD',
    income: 0, // in cents
  });

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Final Step: Commit everything
      setCurrency(tempData.currency);
      setLocation(tempData.location);
      setIncome(tempData.income);
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleGetLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission denied');
        setIsLocating(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const detectedLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address?.name || undefined,
        city: address?.city || undefined,
        district: address?.district || undefined,
        region: address?.region || undefined,
        country: address?.country || undefined,
      };

      const defaults = getDefaultsByCountry(address?.country || undefined);

      setTempData((prev) => ({
        ...prev,
        location: detectedLocation,
        language: defaults.language as LanguageCode,
        currency: defaults.currency,
      }));

      // Update actual language immediately so subsequent steps are translated
      await changeLanguage(defaults.language as LanguageCode);

      handleNext();
    } catch (error) {
      console.error(error);
      setLocationError('Error getting location');
    } finally {
      setIsLocating(false);
    }
  };

  const Progress = () => (
    <View style={styles.progressContainer}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[
            styles.progressDot,
            step >= i && styles.progressDotActive,
            step === i && styles.progressDotSelected,
          ]}
        />
      ))}
    </View>
  );

  const StepHeader = ({
    title,
    subtitle,
  }: {
    title: string;
    subtitle: string;
  }) => (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );

  const renderWelcome = () => (
    <View style={styles.content}>
      <StepHeader
        title={t('onboarding.welcome')}
        subtitle={t('onboarding.welcomeSubtitle')}
      />
      <View style={styles.welcomeImageContainer}>
        <View style={styles.welcomeCircle}>
          <Text style={styles.welcomeEmoji}>🚀</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Pressable style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>
            {t('onboarding.continue')}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const renderLocation = () => (
    <View style={styles.content}>
      <StepHeader
        title={t('onboarding.locationTitle')}
        subtitle={t('onboarding.locationSubtitle')}
      />
      <View style={styles.illustrationContainer}>
        <View style={styles.welcomeCircle}>
          <Text style={styles.illustrationEmoji}>🏠</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.primaryButton, isLocating && styles.disabled]}
          onPress={handleGetLocation}
          disabled={isLocating}
        >
          {isLocating ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {t('onboarding.allowLocation')}
            </Text>
          )}
        </Pressable>

        <Pressable style={styles.ghostButton} onPress={handleNext}>
          <Text style={styles.ghostButtonText}>
            {t('onboarding.skipLocation')}
          </Text>
        </Pressable>

        {locationError && <Text style={styles.errorText}>{locationError}</Text>}
      </View>
    </View>
  );

  const renderLanguage = () => (
    <View style={styles.content}>
      <StepHeader
        title={t('onboarding.languageTitle')}
        subtitle={t('onboarding.languageSubtitle')}
      />
      <View style={styles.listContainer}>
        {supportedLanguages.map((lang) => (
          <Pressable
            key={lang.code}
            style={[
              styles.languageOption,
              tempData.language === lang.code && styles.languageOptionSelected,
            ]}
            onPress={async () => {
              setTempData((prev) => ({
                ...prev,
                language: lang.code as LanguageCode,
              }));
              await changeLanguage(lang.code as LanguageCode);
            }}
          >
            <View style={styles.languageInfo}>
              <Text
                style={[
                  styles.languageName,
                  tempData.language === lang.code &&
                    styles.languageNameSelected,
                ]}
              >
                {lang.nativeName}
              </Text>
              <Text style={styles.languageCode}>{lang.name}</Text>
            </View>
            {tempData.language === lang.code && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </Pressable>
        ))}
      </View>
      <View style={styles.footer}>
        <Pressable style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>
            {t('onboarding.continue')}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const renderCurrency = () => {
    const filteredCurrencies = CURRENCIES.filter(
      (curr) =>
        curr.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
        curr.code.toLowerCase().includes(currencySearch.toLowerCase()),
    );

    return (
      <View style={styles.content}>
        <StepHeader
          title={t('onboarding.currencyTitle')}
          subtitle={t('onboarding.currencySubtitle')}
        />

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('settings.searchCurrencies')}
            value={currencySearch}
            onChangeText={setCurrencySearch}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        <FlatList
          data={filteredCurrencies}
          keyExtractor={(item) => item.code}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.currencyItem,
                tempData.currency === item.code && styles.currencyItemSelected,
              ]}
              onPress={() =>
                setTempData((prev) => ({ ...prev, currency: item.code }))
              }
            >
              <Text style={styles.currencyItemSymbol}>{item.symbol}</Text>
              <View style={styles.currencyItemInfo}>
                <Text style={styles.currencyItemCode}>{item.code}</Text>
                <Text style={styles.currencyItemName}>{item.name}</Text>
              </View>
              {tempData.currency === item.code && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {t('settings.noCurrenciesFound')}
              </Text>
            </View>
          }
        />
        <View style={styles.footer}>
          <Pressable style={styles.primaryButton} onPress={handleNext}>
            <Text style={styles.primaryButtonText}>
              {t('onboarding.continue')}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderIncome = () => {
    const currency = getCurrencyByCode(tempData.currency);
    return (
      <View style={styles.content}>
        <StepHeader
          title={t('onboarding.incomeTitle')}
          subtitle={t('onboarding.incomeSubtitle')}
        />
        <View style={styles.incomeContainer}>
          <AmountInput
            value={tempData.income}
            onChangeValue={(cents) =>
              setTempData((prev) => ({ ...prev, income: cents }))
            }
            currencySymbol={currency?.symbol}
            autoFocus
          />
        </View>

        <View style={styles.footer}>
          <Pressable
            style={[
              styles.primaryButton,
              tempData.income <= 0 && styles.disabled,
            ]}
            onPress={handleNext}
            disabled={tempData.income <= 0}
          >
            <Text style={styles.primaryButtonText}>
              {t('onboarding.continue')}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderSummary = () => {
    const currency = getCurrencyByCode(tempData.currency);
    const lang = supportedLanguages.find((l) => l.code === tempData.language);

    return (
      <View style={styles.content}>
        <StepHeader
          title={t('onboarding.allSet')}
          subtitle={t('onboarding.allSetSubtitle')}
        />

        <View style={styles.summaryContainer}>
          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>{t('settings.location')}</Text>
            <View style={styles.currencyDisplay}>
              <View style={styles.currencyDisplayLeft}>
                <Text style={styles.currencyDisplayText}>
                  📍{' '}
                  {tempData.location
                    ? [
                        tempData.location.city,
                        tempData.location.district,
                        tempData.location.region,
                        tempData.location.country,
                      ]
                        .filter((val) => val && val !== 'undefined')
                        .join(', ')
                    : t('settings.noLocation')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>{t('settings.language')}</Text>
            <View style={styles.currencyDisplay}>
              <View style={styles.currencyDisplayLeft}>
                <Text style={styles.currencyDisplayText}>
                  {lang?.nativeName}
                </Text>
                <Text style={styles.currencyDisplayName}>{lang?.name}</Text>
              </View>
            </View>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>{t('settings.currency')}</Text>
            <View style={styles.currencyDisplay}>
              <View style={styles.currencyDisplayLeft}>
                <Text style={styles.currencyDisplayText}>
                  {currency?.symbol} {currency?.code}
                </Text>
                <Text style={styles.currencyDisplayName}>{currency?.name}</Text>
              </View>
            </View>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>
              {t('dashboard.monthlyIncome')}
            </Text>
            <View style={styles.currencyDisplay}>
              <View style={styles.currencyDisplayLeft}>
                <Text style={styles.currencyDisplayText}>
                  {currency?.symbol}
                  {(tempData.income / 100).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.primaryButton} onPress={handleNext}>
            <Text style={styles.primaryButtonText}>
              {t('onboarding.getStarted')}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.navBar}>
          {step > 0 ? (
            <Pressable style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>
                ← {t('onboarding.back')}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.backButton} />
          )}
          <Progress />
          <View style={styles.backButton} />
        </View>

        <View style={styles.stepContainer}>
          {step === 0 && renderWelcome()}
          {step === 1 && renderLocation()}
          {step === 2 && renderLanguage()}
          {step === 3 && renderCurrency()}
          {step === 4 && renderIncome()}
          {step === 5 && renderSummary()}
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    width: 60,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.needs,
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    marginHorizontal: 3,
  },
  progressDotActive: {
    backgroundColor: COLORS.needs,
  },
  progressDotSelected: {
    width: 12,
    backgroundColor: COLORS.needs,
  },
  stepContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZE.h1,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  welcomeImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xl,
  },
  welcomeCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeEmoji: {
    fontSize: 100,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xl,
  },
  illustrationEmoji: {
    fontSize: 100,
  },
  footer: {
    paddingVertical: SPACING.xl,
    marginTop: 'auto',
  },
  primaryButton: {
    backgroundColor: COLORS.needs,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.body,
    fontWeight: '600',
  },
  ghostButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  ghostButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.body,
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.6,
  },
  // Reused styles from Settings
  listContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  languageOptionSelected: {
    backgroundColor: COLORS.needs + '15',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: FONT_SIZE.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  languageNameSelected: {
    color: COLORS.needs,
  },
  languageCode: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  checkmark: {
    fontSize: FONT_SIZE.h2,
    color: COLORS.needs,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  currencyItemSelected: {
    backgroundColor: COLORS.needs + '15',
  },
  currencyItemSymbol: {
    fontSize: FONT_SIZE.h2,
    fontWeight: '600',
    color: COLORS.textPrimary,
    width: 40,
    textAlign: 'center',
  },
  currencyItemInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  currencyItemCode: {
    fontSize: FONT_SIZE.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  currencyItemName: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textSecondary,
  },
  incomeContainer: {
    marginTop: SPACING.md,
  },
  summaryContainer: {
    flex: 1,
  },
  summarySection: {
    marginBottom: SPACING.md,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  currencyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currencyDisplayLeft: {
    flex: 1,
  },
  currencyDisplayText: {
    fontSize: FONT_SIZE.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  currencyDisplayName: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.caption,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  searchContainer: {
    marginBottom: SPACING.md,
  },
  searchInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.body,
    color: COLORS.textPrimary,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
  },
});
