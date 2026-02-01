import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useBudget } from '../../context/BudgetContext';
import { ExpenseItem } from '../../components/ExpenseItem';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Category, Expense } from '../../types';
import { COLORS, SPACING, FONT_SIZE, CATEGORY_CONFIG } from '../../constants/theme';
import { formatDate, formatMonth } from '../../utils/formatters';
import { groupExpensesByDate } from '../../utils/calculations';
import { getCurrencyByCode } from '../../constants/currencies';

type Filter = 'all' | Category;

export default function ExpensesScreen() {
  const { t } = useTranslation();
  const { state, currentMonthExpenses, deleteExpense } = useBudget();
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const currencySymbol = getCurrencyByCode(state.currency)?.symbol ?? '$';

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t('expenses.filterAll') },
    { key: 'needs', label: t('categories.needs') },
    { key: 'wants', label: t('categories.wants') },
    { key: 'savings', label: t('categories.savings') },
  ];

  const filteredExpenses = useMemo(() => {
    if (activeFilter === 'all') {
      return currentMonthExpenses;
    }
    return currentMonthExpenses.filter((e) => e.category === activeFilter);
  }, [currentMonthExpenses, activeFilter]);

  const groupedExpenses = useMemo(
    () => groupExpensesByDate(filteredExpenses),
    [filteredExpenses]
  );

  const handleDelete = (id: string) => {
    Alert.alert(
      t('expenses.deleteTitle'),
      t('expenses.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteExpense(id),
        },
      ]
    );
  };

  const renderDateSection = ({ item }: { item: [string, Expense[]] }) => {
    const [date, expenses] = item;
    return (
      <View style={styles.dateSection}>
        <Text style={styles.dateHeader}>{formatDate(date)}</Text>
        {expenses.map((expense) => (
          <ExpenseItem
            key={expense.id}
            expense={expense}
            currencySymbol={currencySymbol}
            onDelete={handleDelete}
          />
        ))}
      </View>
    );
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('expenses.title')}</Text>
        <Text style={styles.subtitle}>{formatMonth(state.currentMonth)}</Text>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;
          const color =
            filter.key === 'all'
              ? COLORS.textPrimary
              : CATEGORY_CONFIG[filter.key].color;

          return (
            <Pressable
              key={filter.key}
              style={[
                styles.filterPill,
                isActive && { backgroundColor: color, borderColor: color },
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  isActive && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>{t('expenses.noExpenses')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('expenses.addFirstExpense')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={Array.from(groupedExpenses.entries())}
          renderItem={renderDateSection}
          keyExtractor={([date]) => date}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.h1,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZE.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  filterPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterText: {
    fontSize: FONT_SIZE.bodySmall,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  dateSection: {
    marginTop: SPACING.md,
  },
  dateHeader: {
    fontSize: FONT_SIZE.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.h2,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
