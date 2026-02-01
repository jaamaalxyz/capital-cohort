import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useBudget } from '../context/BudgetContext';
import { AmountInput } from '../components/AmountInput';
import { CategoryPicker } from '../components/CategoryPicker';
import { Category, Expense } from '../types';
import { COLORS, SPACING, FONT_SIZE } from '../constants/theme';
import { generateId, getToday, formatDate } from '../utils/formatters';
import { validateExpense } from '../utils/validation';
import { getCurrencyByCode } from '../constants/currencies';

export default function AddExpenseScreen() {
  const router = useRouter();
  const { addExpense, state } = useBudget();
  const currencySymbol = getCurrencyByCode(state.currency)?.symbol ?? '$';

  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [date, setDate] = useState(getToday());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const expense: Partial<Expense> = {
      amount,
      description: description.trim(),
      category: category || undefined,
      date,
    };

    const validation = validateExpense(expense);

    if (!validation.isValid) {
      // Determine which field has the error
      if (!amount || amount <= 0) {
        setErrors({ amount: validation.error || 'Invalid amount' });
      } else if (!description.trim()) {
        setErrors({ description: validation.error || 'Required' });
      } else if (!category) {
        setErrors({ category: validation.error || 'Select a category' });
      }
      return;
    }

    const newExpense: Expense = {
      id: generateId(),
      amount,
      description: description.trim(),
      category: category!,
      date,
      createdAt: new Date().toISOString(),
    };

    addExpense(newExpense);
    router.back();
  };

  const handleClose = () => {
    if (amount > 0 || description.trim()) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleClose} hitSlop={8}>
          <Text style={styles.closeButton}>✕</Text>
        </Pressable>
        <Text style={styles.title}>Add Expense</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount */}
        <View style={styles.field}>
          <Text style={styles.label}>AMOUNT</Text>
          <AmountInput
            value={amount}
            onChangeValue={(value) => {
              setAmount(value);
              setErrors((prev) => ({ ...prev, amount: '' }));
            }}
            currencySymbol={currencySymbol}
            error={errors.amount}
            autoFocus
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>DESCRIPTION</Text>
          <TextInput
            style={[
              styles.textInput,
              errors.description && styles.textInputError,
            ]}
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              setErrors((prev) => ({ ...prev, description: '' }));
            }}
            placeholder="What did you spend on?"
            placeholderTextColor={COLORS.textSecondary}
            maxLength={100}
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.label}>CATEGORY</Text>
          <CategoryPicker
            selected={category}
            onSelect={(cat) => {
              setCategory(cat);
              setErrors((prev) => ({ ...prev, category: '' }));
            }}
          />
          {errors.category && (
            <Text style={styles.errorText}>{errors.category}</Text>
          )}
        </View>

        {/* Date */}
        <View style={styles.field}>
          <Text style={styles.label}>DATE</Text>
          <View style={styles.dateDisplay}>
            <Text style={styles.dateText}>
              {date === getToday() ? `Today (${formatDate(date)})` : formatDate(date)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.submitButtonPressed,
          ]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>ADD EXPENSE</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  title: {
    fontSize: FONT_SIZE.h2,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  field: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZE.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.body,
    color: COLORS.textPrimary,
  },
  textInputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  dateDisplay: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  dateText: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textPrimary,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  submitButton: {
    backgroundColor: COLORS.needs,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  submitButtonPressed: {
    opacity: 0.9,
  },
  submitButtonText: {
    fontSize: FONT_SIZE.body,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
