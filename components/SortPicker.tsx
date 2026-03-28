import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SortOrder } from '../types';
import { SPACING, FONT_SIZE } from '../constants/theme';

interface SortPickerProps {
  visible: boolean;
  currentOrder: SortOrder;
  onSelect: (order: SortOrder) => void;
  onClose: () => void;
}

const SORT_OPTIONS: { label: string; value: SortOrder }[] = [
  { label: 'Newest First', value: 'date_desc' },
  { label: 'Oldest First', value: 'date_asc' },
  { label: 'Highest Amount', value: 'amount_desc' },
  { label: 'Lowest Amount', value: 'amount_asc' },
];

export function SortPicker({
  visible,
  currentOrder,
  onSelect,
  onClose,
}: SortPickerProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          <Text style={styles.title}>Sort By</Text>
          <ScrollView>
            {SORT_OPTIONS.map((option) => {
              const isActive = currentOrder === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.option, isActive && styles.optionActive]}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                  testID={`sort-option-${option.value}`}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isActive && styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isActive && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: SPACING.lg,
      maxHeight: '50%',
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: SPACING.md,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    optionActive: {
      backgroundColor: colors.needs + '10',
    },
    optionText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    optionTextActive: {
      color: colors.needs,
      fontWeight: '600',
    },
    checkmark: {
      color: colors.needs,
      fontSize: 16,
    },
  });
