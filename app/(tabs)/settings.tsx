import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  FlatList,
  Modal,
  ListRenderItem,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useBudget } from '../../context/BudgetContext';
import { AmountInput } from '../../components/AmountInput';
import { ScreenContainer } from '../../components/ScreenContainer';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  CATEGORY_CONFIG,
} from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';
import {
  CURRENCIES,
  getCurrencyByCode,
  Currency,
} from '../../constants/currencies';
import {
  supportedLanguages,
  changeLanguage,
  getCurrentLanguage,
  LanguageCode,
} from '../../i18n';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { state, setIncome, setCurrency, setLocation, resetAll } = useBudget();
  const [incomeValue, setIncomeValue] = useState(state.monthlyIncome);
  const [isLocating, setIsLocating] = useState(false);
  const [currencyPickerVisible, setCurrencyPickerVisible] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [languagePickerVisible, setLanguagePickerVisible] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  const [currentLang, setCurrentLang] =
    useState<LanguageCode>(getCurrentLanguage());

  useEffect(() => {
    setIncomeValue(state.monthlyIncome);
  }, [state.monthlyIncome]);

  const currentCurrency = getCurrencyByCode(state.currency);
  const currencySymbol = currentCurrency?.symbol ?? '$';

  const filteredCurrencies = useMemo(() => {
    const search = currencySearch.trim().toLowerCase();

    if (!search) {
      return CURRENCIES;
    }

    return CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(search) ||
        c.name.toLowerCase().includes(search) ||
        c.symbol.includes(search),
    );
  }, [currencySearch]);

  const filteredLanguages = useMemo(() => {
    const search = languageSearch.trim().toLowerCase();

    if (!search) {
      return supportedLanguages;
    }

    return supportedLanguages.filter(
      (l) =>
        l.code.toLowerCase().includes(search) ||
        l.name.toLowerCase().includes(search) ||
        l.nativeName.toLowerCase().includes(search),
    );
  }, [languageSearch]);

  const handleIncomeChange = (value: number) => {
    setIncomeValue(value);
    setIncome(value);
  };

  const handleReset = () => {
    Alert.alert(t('settings.resetTitle'), t('settings.resetMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.reset'),
        style: 'destructive',
        onPress: () => {
          resetAll();
          setIncomeValue(0);
          router.replace('/onboarding');
        },
      },
    ]);
  };

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      setCurrency(currency.code);
      setCurrencyPickerVisible(false);
      setCurrencySearch('');
    },
    [setCurrency],
  );

  const handleLanguageChange = async (langCode: LanguageCode) => {
    await changeLanguage(langCode);
    setCurrentLang(langCode);
  };

  const handleGetLocation = async () => {
    setIsLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please enable location permissions in settings.',
        );
        setIsLocating(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address?.name || undefined,
        city: address?.city || undefined,
        country: address?.country || undefined,
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not get your location.');
    } finally {
      setIsLocating(false);
    }
  };

  const openCurrencyPicker = () => {
    setCurrencySearch('');
    setCurrencyPickerVisible(true);
  };

  const closeCurrencyPicker = () => {
    setCurrencyPickerVisible(false);
    setCurrencySearch('');
  };

  const openLanguagePicker = () => {
    setLanguageSearch('');
    setLanguagePickerVisible(true);
  };

  const closeLanguagePicker = () => {
    setLanguagePickerVisible(false);
    setLanguageSearch('');
  };

  const needsAllocation = Math.round(
    incomeValue * CATEGORY_CONFIG.needs.percentage,
  );
  const wantsAllocation = Math.round(
    incomeValue * CATEGORY_CONFIG.wants.percentage,
  );
  const savingsAllocation = Math.round(
    incomeValue * CATEGORY_CONFIG.savings.percentage,
  );

  const formatAmount = (cents: number) => formatCurrency(cents, currencySymbol);

  const renderCurrencyItem: ListRenderItem<Currency> = useCallback(
    ({ item }) => {
      const isSelected = state.currency === item.code;
      return (
        <Pressable
          style={[
            styles.currencyItem,
            isSelected && styles.currencyItemSelected,
          ]}
          onPress={() => handleCurrencySelect(item)}
        >
          <Text style={styles.currencyItemSymbol}>{item.symbol}</Text>
          <View style={styles.currencyItemInfo}>
            <Text style={styles.currencyItemCode}>{item.code}</Text>
            <Text style={styles.currencyItemName}>{item.name}</Text>
          </View>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </Pressable>
      );
    },
    [state.currency, handleCurrencySelect],
  );

  const renderLanguageItem: ListRenderItem<
    (typeof supportedLanguages)[number]
  > = useCallback(
    ({ item }) => {
      const isSelected = currentLang === item.code;
      return (
        <Pressable
          style={[
            styles.currencyItem,
            isSelected && styles.currencyItemSelected,
          ]}
          onPress={() => {
            handleLanguageChange(item.code as LanguageCode);
            closeLanguagePicker();
          }}
        >
          <View style={styles.currencyItemInfo}>
            <Text style={styles.currencyItemCode}>{item.nativeName}</Text>
            <Text style={styles.currencyItemName}>{item.name}</Text>
          </View>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </Pressable>
      );
    },
    [currentLang],
  );

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('settings.title')}</Text>
          </View>

          {/* Income Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('settings.monthlyIncome')}
            </Text>
            <View style={styles.sectionContent}>
              <Text style={styles.label}>{t('settings.enterIncome')}</Text>
              <AmountInput
                value={incomeValue}
                onChangeValue={handleIncomeChange}
                currencySymbol={currencySymbol}
              />
            </View>
          </View>

          {/* Budget Breakdown */}
          {incomeValue > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('settings.budgetBreakdown')}
              </Text>
              <View style={styles.breakdownCard}>
                <Text style={styles.breakdownIntro}>
                  {t('settings.incomeSplitAs')}
                </Text>

                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLeft}>
                    <View
                      style={[
                        styles.breakdownDot,
                        { backgroundColor: COLORS.needs },
                      ]}
                    />
                    <Text style={styles.breakdownLabel}>
                      {t('settings.needsPercent')}
                    </Text>
                  </View>
                  <Text style={styles.breakdownValue}>
                    {formatAmount(needsAllocation)}
                  </Text>
                </View>

                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLeft}>
                    <View
                      style={[
                        styles.breakdownDot,
                        { backgroundColor: COLORS.wants },
                      ]}
                    />
                    <Text style={styles.breakdownLabel}>
                      {t('settings.wantsPercent')}
                    </Text>
                  </View>
                  <Text style={styles.breakdownValue}>
                    {formatAmount(wantsAllocation)}
                  </Text>
                </View>

                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLeft}>
                    <View
                      style={[
                        styles.breakdownDot,
                        { backgroundColor: COLORS.savings },
                      ]}
                    />
                    <Text style={styles.breakdownLabel}>
                      {t('settings.savingsPercent')}
                    </Text>
                  </View>
                  <Text style={styles.breakdownValue}>
                    {formatAmount(savingsAllocation)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Currency Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.currency')}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.currencyDisplay,
                pressed && styles.currencyDisplayPressed,
              ]}
              onPress={openCurrencyPicker}
            >
              <View style={styles.currencyDisplayLeft}>
                <Text style={styles.currencyDisplayText}>
                  {currentCurrency?.symbol} {currentCurrency?.code}
                </Text>
                <Text style={styles.currencyDisplayName}>
                  {currentCurrency?.name}
                </Text>
              </View>
              <Text style={styles.editIcon}>✎</Text>
            </Pressable>
          </View>

          {/* Language Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.currencyDisplay,
                pressed && styles.currencyDisplayPressed,
              ]}
              onPress={openLanguagePicker}
            >
              <View style={styles.currencyDisplayLeft}>
                <Text style={styles.currencyDisplayText}>
                  {
                    supportedLanguages.find((l) => l.code === currentLang)
                      ?.nativeName
                  }
                </Text>
                <Text style={styles.currencyDisplayName}>
                  {supportedLanguages.find((l) => l.code === currentLang)?.name}
                </Text>
              </View>
              <Text style={styles.editIcon}>✎</Text>
            </Pressable>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.location')}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.currencyDisplay,
                pressed && styles.currencyDisplayPressed,
                isLocating && styles.disabled,
              ]}
              onPress={handleGetLocation}
              disabled={isLocating}
            >
              <View style={styles.currencyDisplayLeft}>
                {state.location ? (
                  <>
                    <Text style={styles.currencyDisplayText}>
                      📍 {state.location.city}, {state.location.country}
                    </Text>
                    <Text style={styles.currencyDisplayName}>
                      {state.location.address || t('settings.updateLocation')}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.currencyDisplayText}>
                      {t('settings.noLocation')}
                    </Text>
                    <Text style={styles.currencyDisplayName}>
                      {t('settings.allowLocation')}
                    </Text>
                  </>
                )}
              </View>
              {isLocating ? (
                <ActivityIndicator size="small" color={COLORS.needs} />
              ) : (
                <Text style={styles.editIcon}>✎</Text>
              )}
            </Pressable>
          </View>

          {/* Budget Rule Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.rule503020')}</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                {t('settings.ruleDescription')}
              </Text>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleEmoji}>🏠</Text>
                <Text style={styles.ruleText}>
                  <Text style={styles.ruleBold}>{t('settings.needsRule')}</Text>{' '}
                  {t('settings.needsRuleDesc')}
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleEmoji}>🎮</Text>
                <Text style={styles.ruleText}>
                  <Text style={styles.ruleBold}>{t('settings.wantsRule')}</Text>{' '}
                  {t('settings.wantsRuleDesc')}
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleEmoji}>💰</Text>
                <Text style={styles.ruleText}>
                  <Text style={styles.ruleBold}>
                    {t('settings.savingsRule')}
                  </Text>{' '}
                  {t('settings.savingsRuleDesc')}
                </Text>
              </View>
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, styles.dangerTitle]}>
              {t('settings.dangerZone')}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.resetButton,
                pressed && styles.resetButtonPressed,
              ]}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>
                {t('settings.resetAllData')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Currency Picker Modal */}
      <Modal
        visible={currencyPickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeCurrencyPicker}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t('settings.selectCurrency')}
            </Text>
            <Pressable onPress={closeCurrencyPicker} hitSlop={8}>
              <Text style={styles.modalClose}>✕</Text>
            </Pressable>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={currencySearch}
              onChangeText={setCurrencySearch}
              placeholder={t('settings.searchCurrencies')}
              placeholderTextColor={COLORS.textSecondary}
              autoFocus
            />
          </View>

          {/* Currency List */}
          <FlatList
            data={filteredCurrencies}
            renderItem={renderCurrencyItem}
            keyExtractor={(item) => item.code}
            contentContainerStyle={styles.currencyListContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {t('settings.noCurrenciesFound')}
                </Text>
              </View>
            }
          />
        </View>
      </Modal>
      {/* Language Picker Modal */}
      <Modal
        visible={languagePickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeLanguagePicker}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t('settings.selectLanguage')}
            </Text>
            <Pressable onPress={closeLanguagePicker} hitSlop={8}>
              <Text style={styles.modalClose}>✕</Text>
            </Pressable>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={languageSearch}
              onChangeText={setLanguageSearch}
              placeholder={t('settings.searchLanguages')}
              placeholderTextColor={COLORS.textSecondary}
              autoFocus
            />
          </View>

          {/* Language List */}
          <FlatList
            data={filteredLanguages}
            renderItem={renderLanguageItem}
            keyExtractor={(item) => item.code}
            contentContainerStyle={styles.currencyListContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {t('settings.noLanguagesFound')}
                </Text>
              </View>
            }
          />
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.h1,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  breakdownCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
  },
  breakdownIntro: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  breakdownLabel: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textPrimary,
  },
  breakdownValue: {
    fontSize: FONT_SIZE.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  // Currency Display
  currencyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
  },
  currencyDisplayPressed: {
    opacity: 0.7,
  },
  currencyDisplayLeft: {
    flex: 1,
  },
  currencyDisplayText: {
    fontSize: FONT_SIZE.h2,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  currencyDisplayName: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  editIcon: {
    fontSize: FONT_SIZE.h2,
    color: COLORS.textSecondary,
    transform: [{ rotate: '90deg' }],
  },
  disabled: {
    opacity: 0.6,
  },
  // Language Section
  languageContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
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
  // Info Card
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
  },
  infoText: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  ruleEmoji: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  ruleText: {
    flex: 1,
    fontSize: FONT_SIZE.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  ruleBold: {
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  dangerTitle: {
    color: COLORS.error,
  },
  resetButton: {
    backgroundColor: COLORS.error + '15',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  resetButtonPressed: {
    backgroundColor: COLORS.error + '25',
  },
  resetButtonText: {
    fontSize: FONT_SIZE.body,
    fontWeight: '600',
    color: COLORS.error,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  modalTitle: {
    fontSize: FONT_SIZE.h2,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalClose: {
    fontSize: 24,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
  },
  searchInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.body,
    color: COLORS.textPrimary,
  },
  currencyListContent: {
    paddingVertical: SPACING.sm,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.card,
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
  checkmark: {
    fontSize: FONT_SIZE.h2,
    color: COLORS.needs,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.lg,
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
