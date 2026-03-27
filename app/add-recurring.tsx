import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBudget } from '../context/BudgetContext';
import { useTheme } from '../context/ThemeContext';
import { CategoryPicker } from '../components/CategoryPicker';
import { AmountInput } from '../components/AmountInput';
import { Category, RecurringTemplate } from '../types';
import { SPACING, FONT_SIZE } from '../constants/theme';
import { generateId } from '../utils/formatters';
import { validateRecurringTemplate } from '../utils/recurringExpenses';
import { getCurrencyByCode } from '../constants/currencies';

export default function AddRecurringScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { state, addRecurringTemplate, updateRecurringTemplate } = useBudget();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const currencySymbol = getCurrencyByCode(state.currency)?.symbol ?? '$';
  const existing = id ? state.recurringTemplates.find((t) => t.id === id) : null;

  const [amount, setAmount] = useState(existing?.amount ?? 0);
  const [description, setDescription] = useState(existing?.description ?? '');
  const [category, setCategory] = useState<Category>(existing?.category ?? 'needs');
  const [dayOfMonth, setDayOfMonth] = useState(String(existing?.dayOfMonth ?? 1));

  const handleSave = () => {
    const day = parseInt(dayOfMonth, 10);
    const validation = validateRecurringTemplate({ amount, description, category, dayOfMonth: day });
    if (!validation.isValid) {
      Alert.alert('Invalid Input', validation.error);
      return;
    }

    if (existing) {
      updateRecurringTemplate({ ...existing, amount, description, category, dayOfMonth: day });
    } else {
      const template: RecurringTemplate = {
        id: generateId(),
        amount,
        description,
        category,
        dayOfMonth: day,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      addRecurringTemplate(template);
    }
    router.back();
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text testID="recurring-heading" style={[styles.heading, { color: colors.textPrimary }]}>
        {existing ? 'Edit Recurring' : 'Add Recurring'}
      </Text>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Amount</Text>
        <AmountInput
          value={amount}
          onChangeValue={setAmount}
          currencySymbol={currencySymbol}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
        <TextInput
          testID="recurring-description-input"
          style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.card }]}
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. Rent, Netflix, Gym"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
        <CategoryPicker selected={category} onSelect={setCategory} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Day of Month (1–28)</Text>
        <TextInput
          testID="recurring-day-input"
          style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.card }]}
          value={dayOfMonth}
          onChangeText={setDayOfMonth}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="1"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <Pressable
        testID="recurring-save-btn"
        style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.needs }, pressed && styles.saveBtnPressed]}
        onPress={handleSave}
      >
        <Text style={styles.saveBtnText}>{existing ? 'Update' : 'Add'} Recurring Expense</Text>
      </Pressable>
    </ScrollView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    screen: { flex: 1 },
    content: { padding: SPACING.lg, paddingBottom: 40 },
    heading: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: SPACING.lg,
    },
    section: { marginBottom: SPACING.lg },
    label: {
      fontSize: FONT_SIZE.caption,
      fontWeight: '600',
      marginBottom: SPACING.sm,
      letterSpacing: 0.5,
    },
    input: {
      borderWidth: 1,
      borderRadius: 10,
      padding: SPACING.md,
      fontSize: FONT_SIZE.body,
    },
    saveBtn: {
      borderRadius: 12,
      padding: SPACING.md,
      alignItems: 'center',
      marginTop: SPACING.sm,
    },
    saveBtnPressed: { opacity: 0.85 },
    saveBtnText: {
      fontSize: FONT_SIZE.body,
      fontWeight: '700',
      color: '#fff',
    },
  });
