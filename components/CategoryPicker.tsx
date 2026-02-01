import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Category } from '../types';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  CATEGORY_CONFIG,
} from '../constants/theme';

interface CategoryPickerProps {
  selected: Category | null;
  onSelect: (category: Category) => void;
}

const categories: Category[] = ['needs', 'wants', 'savings'];

export function CategoryPicker({ selected, onSelect }: CategoryPickerProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {categories.map((category) => {
        const config = CATEGORY_CONFIG[category];
        const isSelected = selected === category;

        return (
          <Pressable
            key={category}
            style={[
              styles.option,
              isSelected && {
                borderColor: config.color,
                backgroundColor: config.color + '10',
              },
            ]}
            onPress={() => onSelect(category)}
          >
            <Text style={styles.icon}>{config.icon}</Text>
            <Text style={[styles.label, isSelected && { color: config.color }]}>
              {t(`categories.${category}`).toUpperCase()}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {t(`categories.${category}Description`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  option: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  icon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZE.h3,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textSecondary,
  },
});
