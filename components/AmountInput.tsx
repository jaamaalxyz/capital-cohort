import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../constants/theme';

interface AmountInputProps {
  value: number; // in cents
  onChangeValue: (cents: number) => void;
  error?: string;
  autoFocus?: boolean;
}

export function AmountInput({
  value,
  onChangeValue,
  error,
  autoFocus,
}: AmountInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value > 0) {
      setDisplayValue((value / 100).toFixed(2));
    } else {
      setDisplayValue('');
    }
  }, []);

  const handleChangeText = (text: string) => {
    // Remove non-numeric characters except decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const parts = cleaned.split('.');
    let formatted = parts[0];
    if (parts.length > 1) {
      formatted += '.' + parts[1].slice(0, 2);
    }

    setDisplayValue(formatted);

    // Convert to cents
    const numValue = parseFloat(formatted);
    if (!isNaN(numValue)) {
      onChangeValue(Math.round(numValue * 100));
    } else {
      onChangeValue(0);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <Text style={styles.prefix}>$</Text>
        <TextInput
          style={styles.input}
          value={displayValue}
          onChangeText={handleChangeText}
          placeholder="0.00"
          placeholderTextColor={COLORS.textSecondary}
          keyboardType="decimal-pad"
          autoFocus={autoFocus}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  prefix: {
    fontSize: FONT_SIZE.amountLarge,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZE.amountLarge,
    fontWeight: '600',
    color: COLORS.textPrimary,
    padding: 0,
  },
  errorText: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
});
