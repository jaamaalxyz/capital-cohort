import React from 'react';
import { 
  ScrollView, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View 
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZE } from '../constants/theme';
import { BUDGET_PRESETS } from '../constants/budgetPresets';
import { BudgetPresetKey, BudgetRule } from '../types';

interface Props {
  selectedPresetKey: BudgetPresetKey;
  onSelect: (rule: BudgetRule) => void;
}

export const BudgetRulePresets: React.FC<Props> = ({ selectedPresetKey, onSelect }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {BUDGET_PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset.key}
            testID={`preset-chip-${preset.key}`}
            onPress={() => onSelect(preset.rule)}
            style={[
              styles.chip,
              { 
                backgroundColor: colors.card,
                borderColor: selectedPresetKey === preset.key ? colors.needs : colors.border
              }
            ]}
          >
            <Text 
              style={[
                styles.chipLabel,
                { color: selectedPresetKey === preset.key ? colors.needs : colors.textPrimary }
              ]}
            >
              {preset.label}
            </Text>
          </TouchableOpacity>
        ))}

        {selectedPresetKey === 'custom' && (
          <View 
            style={[
              styles.chip, 
              styles.customChip,
              { 
                backgroundColor: colors.needs + '15',
                borderColor: colors.needs
              }
            ]}
          >
            <Text style={[styles.chipLabel, { color: colors.needs }]}>
              {t('settings.budgetRules.custom')}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  chip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customChip: {
    borderStyle: 'dashed',
  },
  chipLabel: {
    fontSize: FONT_SIZE.bodySmall,
    fontWeight: '600',
  },
});
