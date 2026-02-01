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
} from 'react-native';
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

export default function SettingsScreen() {
  const { state, setIncome, setCurrency, resetAll } = useBudget();
  const [incomeValue, setIncomeValue] = useState(state.monthlyIncome);
  const [currencyPickerVisible, setCurrencyPickerVisible] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');

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

  const handleIncomeChange = (value: number) => {
    setIncomeValue(value);
    setIncome(value);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all your expenses and reset your income. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetAll();
            setIncomeValue(0);
          },
        },
      ],
    );
  };

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      setCurrency(currency.code);
      setCurrencyPickerVisible(false);
      setCurrencySearch('');
    },
    [setCurrency],
  );

  const openCurrencyPicker = () => {
    setCurrencySearch('');
    setCurrencyPickerVisible(true);
  };

  const closeCurrencyPicker = () => {
    setCurrencyPickerVisible(false);
    setCurrencySearch('');
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
            <Text style={styles.title}>Settings</Text>
          </View>

          {/* Income Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MONTHLY INCOME</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.label}>Enter your monthly income</Text>
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
              <Text style={styles.sectionTitle}>BUDGET BREAKDOWN</Text>
              <View style={styles.breakdownCard}>
                <Text style={styles.breakdownIntro}>
                  Your income will be split as:
                </Text>

                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLeft}>
                    <View
                      style={[
                        styles.breakdownDot,
                        { backgroundColor: COLORS.needs },
                      ]}
                    />
                    <Text style={styles.breakdownLabel}>50% → Needs</Text>
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
                    <Text style={styles.breakdownLabel}>30% → Wants</Text>
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
                    <Text style={styles.breakdownLabel}>20% → Savings</Text>
                  </View>
                  <Text style={styles.breakdownValue}>
                    {formatAmount(savingsAllocation)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Currency Section - Static View */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CURRENCY</Text>
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

          {/* Budget Rule Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>THE 50/30/20 RULE</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                A simple budgeting rule that divides your after-tax income into
                three categories:
              </Text>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleEmoji}>🏠</Text>
                <Text style={styles.ruleText}>
                  <Text style={styles.ruleBold}>50% Needs:</Text> Essential
                  expenses you must pay
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleEmoji}>🎮</Text>
                <Text style={styles.ruleText}>
                  <Text style={styles.ruleBold}>30% Wants:</Text> Non-essential
                  spending for fun
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleEmoji}>💰</Text>
                <Text style={styles.ruleText}>
                  <Text style={styles.ruleBold}>20% Savings:</Text> Building
                  your financial future
                </Text>
              </View>
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, styles.dangerTitle]}>
              DANGER ZONE
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.resetButton,
                pressed && styles.resetButtonPressed,
              ]}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Reset All Data</Text>
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
            <Text style={styles.modalTitle}>Select Currency</Text>
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
              placeholder="Search currencies..."
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
                <Text style={styles.emptyText}>No currencies found</Text>
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
  // Currency Display (Static View)
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
