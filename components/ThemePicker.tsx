import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemeMode } from '../types';
import { useTheme } from '../context/ThemeContext';
import { FONT_SIZE, SPACING } from '../constants/theme';

export function ThemePicker() {
  const { t } = useTranslation();
  const { themeMode, setThemeMode, colors } = useTheme();

  const options: {
    mode: ThemeMode;
    label: string;
    desc: string;
    icon: string;
  }[] = [
    {
      mode: 'auto',
      label: t('settings.themeAuto'),
      desc: t('settings.themeAutoDesc'),
      icon: '🌗',
    },
    {
      mode: 'light',
      label: t('settings.themeLight'),
      desc: '',
      icon: '☀️',
    },
    {
      mode: 'dark',
      label: t('settings.themeDark'),
      desc: '',
      icon: '🌙',
    },
  ];

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = themeMode === option.mode;
        return (
          <TouchableOpacity
            key={option.mode}
            style={[
              styles.option,
              {
                backgroundColor: colors.card,
                borderColor: isSelected ? colors.wants : colors.border,
              },
            ]}
            onPress={() => setThemeMode(option.mode)}
          >
            <Text style={styles.icon}>{option.icon}</Text>
            <View style={styles.textContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>
                {option.label}
              </Text>
              {option.desc ? (
                <Text style={[styles.desc, { color: colors.textSecondary }]}>
                  {option.desc}
                </Text>
              ) : null}
            </View>
            <View
              style={[
                styles.radio,
                {
                  borderColor: isSelected ? colors.wants : colors.border,
                  backgroundColor: isSelected ? colors.wants : 'transparent',
                },
              ]}
            >
              {isSelected && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: FONT_SIZE.body,
    fontWeight: '600',
  },
  desc: {
    fontSize: FONT_SIZE.caption,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
});
