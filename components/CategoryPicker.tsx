import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Category } from '../types';
import { SPACING, FONT_SIZE, CATEGORY_CONFIG } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface CategoryPickerProps {
  selected: Category | null;
  onSelect: (category: Category) => void;
}

const categories: Category[] = ['needs', 'wants', 'savings'];

export function CategoryPicker({ selected, onSelect }: CategoryPickerProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const styles = createStyles(colors);

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
                borderColor: colors[category],
                backgroundColor: colors[category] + '10',
              },
            ]}
            onPress={() => onSelect(category)}
          >
            <Text style={styles.icon}>{config.icon}</Text>
            <Text
              style={[styles.label, isSelected && { color: colors[category] }]}
            >
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

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      gap: SPACING.sm,
    },
    option: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: SPACING.md,
      borderWidth: 2,
      borderColor: colors.border,
    },
    icon: {
      fontSize: 24,
      marginBottom: SPACING.xs,
    },
    label: {
      fontSize: FONT_SIZE.h3,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: SPACING.xs,
    },
    description: {
      fontSize: FONT_SIZE.caption,
      color: colors.textSecondary,
    },
  });
