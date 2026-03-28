import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useBudget } from '../context/BudgetContext';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZE } from '../constants/theme';
import { formatCurrency, formatMonth } from '../utils/formatters';
import { getCurrencyByCode } from '../constants/currencies';
import { ScreenContainer } from '../components/ScreenContainer';

export default function DebtsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { state, settleDebt } = useBudget();
  const { colors } = useTheme();

  const styles = createStyles(colors);
  const currencySymbol = getCurrencyByCode(state.currency)?.symbol ?? '$';

  // Group debts by month
  const groupedDebts = state.debtEntries.reduce((groups, debt) => {
    const month = debt.month;
    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push(debt);
    return groups;
  }, {} as Record<string, typeof state.debtEntries>);

  // Sort months descending
  const sortedMonths = Object.keys(groupedDebts).sort((a, b) => b.localeCompare(a));

  const totalOutstanding = state.debtEntries
    .filter((d) => !d.isSettled)
    .reduce((sum, d) => sum + d.amount, 0);

  const totalSettled = state.debtEntries
    .filter((d) => d.isSettled)
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.title}>{t('debts.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{t('debts.outstanding')}</Text>
          <Text style={[styles.statValue, styles.outstandingValue]}>
            {formatCurrency(totalOutstanding, currencySymbol)}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{t('debts.totalSettled')}</Text>
          <Text style={[styles.statValue, styles.settledValue]}>
            {formatCurrency(totalSettled, currencySymbol)}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {state.debtEntries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('debts.noDebts')}</Text>
          </View>
        ) : (
          sortedMonths.map((month) => (
            <View key={month} style={styles.monthSection}>
              <Text style={styles.monthHeader}>{formatMonth(month)}</Text>
              {groupedDebts[month].map((debt) => (
                <View
                  key={debt.id}
                  style={[
                    styles.debtItem,
                    debt.isSettled && styles.debtItemSettled,
                  ]}
                >
                  <View style={styles.debtInfo}>
                    <Text style={[styles.creditor, debt.isSettled && styles.strikethrough]}>
                      {debt.creditor}
                    </Text>
                    <Text style={styles.date}>{debt.date}</Text>
                    {debt.note ? (
                      <Text style={styles.note}>{debt.note}</Text>
                    ) : null}
                  </View>
                  <View style={styles.debtAction}>
                    <Text
                      testID="debt-amount"
                      style={[
                        styles.amount,
                        debt.isSettled ? styles.settledValue : styles.outstandingValue,
                      ]}
                    >
                      {formatCurrency(debt.amount, currencySymbol)}
                    </Text>
                    {!debt.isSettled ? (
                      <Pressable
                        testID="settle-debt-button"
                        style={styles.settleButton}
                        onPress={() => settleDebt(debt.id)}
                      >
                        <Text style={styles.settleButtonText}>
                          {t('debts.markSettled')}
                        </Text>
                      </Pressable>
                    ) : (
                      <View style={styles.settledBadge}>
                        <Text style={styles.settledBadgeText}>
                          {t('debts.settled')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    backButton: {
      padding: SPACING.sm,
    },
    backButtonText: {
      fontSize: 24,
      color: colors.textPrimary,
    },
    title: {
      fontSize: FONT_SIZE.h2,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    placeholder: {
      width: 40,
    },
    statsContainer: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      padding: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statBox: {
      flex: 1,
      alignItems: 'center',
    },
    statLabel: {
      fontSize: FONT_SIZE.caption,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    statValue: {
      fontSize: FONT_SIZE.h3,
      fontWeight: '700',
    },
    outstandingValue: {
      color: colors.error,
    },
    settledValue: {
      color: colors.success,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: SPACING.md,
    },
    emptyContainer: {
      padding: 100,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: FONT_SIZE.body,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    monthSection: {
      marginBottom: SPACING.xl,
    },
    monthHeader: {
      fontSize: FONT_SIZE.body,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: SPACING.sm,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    debtItem: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    debtItemSettled: {
      opacity: 0.6,
      backgroundColor: colors.background,
    },
    debtInfo: {
      flex: 1,
    },
    creditor: {
      fontSize: FONT_SIZE.body,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    strikethrough: {
      textDecorationLine: 'line-through',
    },
    date: {
      fontSize: FONT_SIZE.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    note: {
      fontSize: FONT_SIZE.caption,
      color: colors.textSecondary,
      marginTop: 4,
      fontStyle: 'italic',
    },
    debtAction: {
      alignItems: 'flex-end',
      minWidth: 100,
    },
    amount: {
      fontSize: FONT_SIZE.body,
      fontWeight: '700',
      marginBottom: 8,
    },
    settleButton: {
      backgroundColor: colors.needs,
      paddingHorizontal: SPACING.md,
      paddingVertical: 6,
      borderRadius: 6,
    },
    settleButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    settledBadge: {
      backgroundColor: colors.success + '20',
      paddingHorizontal: SPACING.sm,
      paddingVertical: 4,
      borderRadius: 4,
    },
    settledBadgeText: {
      color: colors.success,
      fontSize: 12,
      fontWeight: '600',
    },
  });
