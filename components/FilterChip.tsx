import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZE } from '../constants/theme';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: string;
  testID?: string;
}

export function FilterChip({
  label,
  active,
  onPress,
  icon,
  testID,
}: FilterChipProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors, active);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}
      testID={testID}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors: any, active: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: active ? colors.needs : colors.card,
      borderWidth: 1,
      borderColor: active ? colors.needs : colors.border,
      marginRight: SPACING.xs,
      marginBottom: SPACING.xs,
    },
    icon: {
      fontSize: 14,
      marginRight: 4,
    },
    label: {
      fontSize: FONT_SIZE.caption,
      fontWeight: active ? '600' : '400',
      color: active ? '#fff' : colors.textSecondary,
    },
  });
