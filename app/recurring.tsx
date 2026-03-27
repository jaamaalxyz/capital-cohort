import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useBudget } from '../context/BudgetContext';
import { useTheme } from '../context/ThemeContext';
import { RecurringItem } from '../components/RecurringItem';
import { RecurringTemplate } from '../types';
import { SPACING, FONT_SIZE } from '../constants/theme';
import { getCurrencyByCode } from '../constants/currencies';

export default function RecurringScreen() {
  const { state, deleteRecurringTemplate } = useBudget();
  const { colors } = useTheme();
  const router = useRouter();
  const styles = createStyles(colors);

  const currencySymbol = getCurrencyByCode(state.currency)?.symbol ?? '$';

  const handleEdit = (template: RecurringTemplate) => {
    router.push({ pathname: '/add-recurring', params: { id: template.id } } as any);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Recurring',
      'Remove this recurring expense template? Past expenses will not be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteRecurringTemplate(id),
        },
      ]
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.textPrimary }]}>Recurring</Text>

      {state.recurringTemplates.length === 0 ? (
        <View testID="recurring-empty-state" style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔁</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No recurring expenses</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Add recurring templates to auto-log monthly expenses like rent or subscriptions.
          </Text>
        </View>
      ) : (
        <ScrollView
          testID="recurring-list"
          style={styles.list}
          contentContainerStyle={styles.listContent}
        >
          {state.recurringTemplates.map((template) => (
            <RecurringItem
              key={template.id}
              template={template}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currencySymbol={currencySymbol}
            />
          ))}
        </ScrollView>
      )}

      <Pressable
        testID="recurring-fab"
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push('/add-recurring')}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    heading: {
      fontSize: 28,
      fontWeight: '700',
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.lg,
      paddingBottom: SPACING.sm,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: SPACING.lg,
      paddingBottom: 100,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
    },
    emptyIcon: {
      fontSize: 56,
      marginBottom: SPACING.md,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: SPACING.sm,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 15,
      textAlign: 'center',
      lineHeight: 22,
    },
    fab: {
      position: 'absolute',
      right: SPACING.lg,
      bottom: SPACING.xl,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.needs,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    fabPressed: {
      opacity: 0.85,
    },
    fabText: {
      fontSize: 28,
      color: '#fff',
      fontWeight: '300',
      lineHeight: 32,
    },
  });
