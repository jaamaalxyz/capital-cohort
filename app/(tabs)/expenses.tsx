import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useBudget } from '../../context/BudgetContext';
import { ExpenseItem } from '../../components/ExpenseItem';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Category, Expense } from '../../types';
import { SPACING, FONT_SIZE, CATEGORY_CONFIG } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { formatDate, formatMonth } from '../../utils/formatters';
import { groupExpensesByDate } from '../../utils/calculations';
import { getCurrencyByCode } from '../../constants/currencies';
import { useExpenseFilters } from '../../hooks/useExpenseFilters';
import { applyFilters } from '../../utils/filterExpenses';
import { SearchBar } from '../../components/SearchBar';
import { FilterChip } from '../../components/FilterChip';
import { SortPicker } from '../../components/SortPicker';

import { ErrorBoundary } from '../../components/ErrorBoundary';

function ExpensesContent() {
  const { t } = useTranslation();
  const { state, currentMonthExpenses, deleteExpense } = useBudget();
  const { colors } = useTheme();
  const [isSortVisible, setIsSortVisible] = useState(false);
  const currencySymbol = getCurrencyByCode(state.currency)?.symbol ?? '$';

  const {
    filters,
    setQuery,
    toggleCategory,
    setSortOrder,
    clearFilters,
    activeFilterCount,
  } = useExpenseFilters();

  const styles = createStyles(colors);

  const filteredExpenses = useMemo(() => {
    return applyFilters(currentMonthExpenses, filters);
  }, [currentMonthExpenses, filters]);

  const groupedExpenses = useMemo(
    () => groupExpensesByDate(filteredExpenses, false),
    [filteredExpenses],
  );

  const handleDelete = (id: string) => {
    Alert.alert(t('expenses.deleteTitle'), t('expenses.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => deleteExpense(id),
      },
    ]);
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

      {/* Search & Action Bar */}
      <View style={styles.actionBar}>
        <SearchBar
          value={filters.query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          placeholder={t('expenses.searchPlaceholder') || 'Search...'}
          style={styles.searchBar}
        />
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setIsSortVisible(true)}
          hitSlop={8}
          testID="sort-btn"
        >
          <Text style={styles.sortIcon}>↕️</Text>
          {filters.sortOrder !== 'date_desc' && (
            <View style={styles.sortBadge} />
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterStrip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {(['needs', 'wants', 'savings'] as Category[]).map((cat) => (
            <FilterChip
              key={cat}
              label={t(`categories.${cat}`)}
              icon={CATEGORY_CONFIG[cat].icon}
              active={filters.categories.includes(cat)}
              onPress={() => toggleCategory(cat)}
              testID={`filter-chip-${cat}`}
            />
          ))}
          {activeFilterCount > 0 && (
            <TouchableOpacity 
              style={styles.clearAll} 
              onPress={clearFilters}
              testID="clear-filters-btn"
            >
              <Text style={styles.clearAllText}>
                {t('expenses.clearFilters') || 'Clear'} ({activeFilterCount})
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Expense List */}
      {currentMonthExpenses.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>{t('expenses.noExpenses')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('expenses.addFirstExpense')}
          </Text>
        </View>
      ) : filteredExpenses.length === 0 ? (
        <View testID="search-no-results" style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>
            {t('expenses.noMatches') || 'No matches found'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {t('expenses.adjustFilters') ||
              'Try adjusting your search or filters.'}
          </Text>
          <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
            <Text style={styles.clearBtnText}>
              {t('expenses.clearFilters') || 'Clear All Filters'}
            </Text>
          </TouchableOpacity>
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

      <SortPicker
        visible={isSortVisible}
        currentOrder={filters.sortOrder}
        onSelect={setSortOrder}
        onClose={() => setIsSortVisible(false)}
      />
    </ScreenContainer>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.sm,
    },
    title: {
      fontSize: FONT_SIZE.h1,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: FONT_SIZE.bodySmall,
      color: colors.textSecondary,
      marginTop: SPACING.xs,
    },
    actionBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      gap: SPACING.sm,
    },
    searchBar: {
      flex: 1,
    },
    sortBtn: {
      width: 48,
      height: 48,
      borderRadius: 10,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sortIcon: {
      fontSize: 20,
    },
    sortBadge: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.needs,
      borderWidth: 1,
      borderColor: colors.card,
    },
    filterStrip: {
      paddingVertical: SPACING.xs,
    },
    filterScroll: {
      paddingHorizontal: SPACING.lg,
      alignItems: 'center',
    },
    clearAll: {
      paddingHorizontal: SPACING.md,
      paddingVertical: 8,
      marginLeft: SPACING.xs,
    },
    clearAllText: {
      fontSize: FONT_SIZE.caption,
      color: colors.needs,
      fontWeight: '600',
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
      color: colors.textSecondary,
      marginBottom: SPACING.sm,
      textTransform: 'uppercase',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.xl,
      marginTop: 40,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: SPACING.md,
    },
    emptyTitle: {
      fontSize: FONT_SIZE.h2,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: SPACING.sm,
    },
    emptySubtitle: {
      fontSize: FONT_SIZE.body,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    clearBtn: {
      marginTop: SPACING.lg,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.md,
      backgroundColor: colors.needs,
      borderRadius: 10,
    },
    clearBtnText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
    },
  });
export default function ExpensesScreen() {
  return (
    <ErrorBoundary context="expenses">
      <ExpensesContent />
    </ErrorBoundary>
  );
}
