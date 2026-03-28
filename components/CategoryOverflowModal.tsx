import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { Category } from '../types';
import { SPACING, FONT_SIZE, CATEGORY_CONFIG } from '../constants/theme';

interface CategoryOverflowModalProps {
  visible: boolean;
  category: Category;
  overspentAmount: number;
  onClose: () => void;
  onAction: (action: 'extra_income' | 'debt' | 'adjust') => void;
}

export function CategoryOverflowModal({
  visible,
  category,
  overspentAmount,
  onClose,
  onAction,
}: CategoryOverflowModalProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const formattedAmount = (overspentAmount / 100).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD', // Symbol is enough for UI, we use USD as default for localestring
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      testID="category-overflow-modal"
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.icon}>{CATEGORY_CONFIG[category].icon}</Text>
            <View>
              <Text style={styles.title}>{t('overflow.categoryTitle') || 'Category Overflow'}</Text>
              <Text style={styles.subtitle}>
                {t('overflow.overspentBy', { amount: formattedAmount }) || `You overspent by ${formattedAmount}`}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.savings + '20' }]}
              onPress={() => onAction('extra_income')}
              testID="action-extra-income"
            >
              <Text style={styles.actionEmoji}>💰</Text>
              <View>
                <Text style={[styles.actionTitle, { color: colors.savings }]}>
                  {t('overflow.addExtraIncome') || 'Add Extra Income'}
                </Text>
                <Text style={styles.actionDesc}>
                  {t('overflow.addExtraIncomeDesc') || 'Cover this with one-time income'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.wants + '20' }]}
              onPress={() => onAction('debt')}
              testID="action-debt"
            >
              <Text style={styles.actionEmoji}>🤝</Text>
              <View>
                <Text style={[styles.actionTitle, { color: colors.wants }]}>
                  {t('overflow.addToDebt') || 'Add to Debt'}
                </Text>
                <Text style={styles.actionDesc}>
                  {t('overflow.addToDebtDesc') || 'Track this as money you owe'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              testID="close-modal"
            >
              <Text style={styles.closeBtnText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      padding: SPACING.xl,
    },
    container: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: SPACING.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.xl,
      gap: SPACING.md,
    },
    icon: {
      fontSize: 40,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    actions: {
      gap: SPACING.md,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.lg,
      borderRadius: 12,
      gap: SPACING.md,
    },
    actionEmoji: {
      fontSize: 24,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: '700',
    },
    actionDesc: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    closeBtn: {
      marginTop: SPACING.sm,
      padding: SPACING.md,
      alignItems: 'center',
    },
    closeBtnText: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: '600',
    },
  });
