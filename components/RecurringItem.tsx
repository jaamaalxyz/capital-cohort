import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { RecurringTemplate } from '../types';
import { SPACING, FONT_SIZE, CATEGORY_CONFIG } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatters';

interface Props {
  template: RecurringTemplate;
  onEdit: (template: RecurringTemplate) => void;
  onDelete: (id: string) => void;
  currencySymbol?: string;
}

export function RecurringItem({ template, onEdit, onDelete, currencySymbol = '$' }: Props) {
  const { colors } = useTheme();
  const config = CATEGORY_CONFIG[template.category];
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text testID="recurring-icon" style={styles.icon}>{config.icon}</Text>
      <View style={styles.details}>
        <View style={styles.titleRow}>
          <Text style={styles.description} numberOfLines={1}>{template.description}</Text>
          {!template.isActive && (
            <View testID="recurring-inactive-badge" style={styles.inactiveBadge}>
              <Text style={styles.inactiveBadgeText}>Paused</Text>
            </View>
          )}
        </View>
        <Text testID="recurring-day" style={styles.subtitle}>
          Every month on day {template.dayOfMonth}
        </Text>
      </View>
      <View style={styles.right}>
        <Text testID="recurring-amount" style={[styles.amount, { color: colors[template.category] }]}>
          {formatCurrency(template.amount, currencySymbol)}
        </Text>
        <View style={styles.actions}>
          <Pressable
            testID="recurring-edit-btn"
            onPress={() => onEdit(template)}
            hitSlop={8}
            style={styles.actionBtn}
          >
            <Text style={styles.editText}>✎</Text>
          </Pressable>
          <Pressable
            testID="recurring-delete-btn"
            onPress={() => onDelete(template.id)}
            hitSlop={8}
            style={styles.actionBtn}
          >
            <Text style={styles.deleteText}>×</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
    },
    icon: {
      fontSize: 24,
      marginRight: SPACING.sm,
    },
    details: {
      flex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    description: {
      fontSize: FONT_SIZE.body,
      fontWeight: '500',
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: FONT_SIZE.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    inactiveBadge: {
      backgroundColor: colors.textSecondary + '25',
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    inactiveBadgeText: {
      fontSize: 10,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    right: {
      alignItems: 'flex-end',
    },
    amount: {
      fontSize: FONT_SIZE.body,
      fontWeight: '700',
    },
    actions: {
      flexDirection: 'row',
      gap: 4,
      marginTop: 4,
    },
    actionBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    editText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    deleteText: {
      fontSize: 20,
      color: colors.error,
      fontWeight: '300',
      lineHeight: 22,
    },
  });
