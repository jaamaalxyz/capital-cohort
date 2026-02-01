import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useBudget } from '../../context/BudgetContext';
import { AmountInput } from '../../components/AmountInput';
import { ScreenContainer } from '../../components/ScreenContainer';
import { COLORS, SPACING, FONT_SIZE, CATEGORY_CONFIG } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';

export default function SettingsScreen() {
  const { state, setIncome, resetAll } = useBudget();
  const [incomeValue, setIncomeValue] = useState(state.monthlyIncome);

  useEffect(() => {
    setIncomeValue(state.monthlyIncome);
  }, [state.monthlyIncome]);

  const handleIncomeChange = (value: number) => {
    setIncomeValue(value);
    setIncome(value);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all your expenses and reset your income. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetAll();
            setIncomeValue(0);
          },
        },
      ]
    );
  };

  const needsAllocation = Math.round(incomeValue * CATEGORY_CONFIG.needs.percentage);
  const wantsAllocation = Math.round(incomeValue * CATEGORY_CONFIG.wants.percentage);
  const savingsAllocation = Math.round(incomeValue * CATEGORY_CONFIG.savings.percentage);

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
          </View>

          {/* Income Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MONTHLY INCOME</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.label}>Enter your monthly income</Text>
              <AmountInput
                value={incomeValue}
                onChangeValue={handleIncomeChange}
              />
            </View>
          </View>

          {/* Budget Breakdown */}
          {incomeValue > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>BUDGET BREAKDOWN</Text>
              <View style={styles.breakdownCard}>
                <Text style={styles.breakdownIntro}>
                  Your income will be split as:
                </Text>

                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLeft}>
                    <View
                      style={[
                        styles.breakdownDot,
                        { backgroundColor: COLORS.needs },
                      ]}
                    />
                    <Text style={styles.breakdownLabel}>50% → Needs</Text>
                  </View>
                  <Text style={styles.breakdownValue}>
                    {formatCurrency(needsAllocation)}
                  </Text>
                </View>

                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLeft}>
                    <View
                      style={[
                        styles.breakdownDot,
                        { backgroundColor: COLORS.wants },
                      ]}
                    />
                    <Text style={styles.breakdownLabel}>30% → Wants</Text>
                  </View>
                  <Text style={styles.breakdownValue}>
                    {formatCurrency(wantsAllocation)}
                  </Text>
                </View>

                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLeft}>
                    <View
                      style={[
                        styles.breakdownDot,
                        { backgroundColor: COLORS.savings },
                      ]}
                    />
                    <Text style={styles.breakdownLabel}>20% → Savings</Text>
                  </View>
                  <Text style={styles.breakdownValue}>
                    {formatCurrency(savingsAllocation)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Budget Rule Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>THE 50/30/20 RULE</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                A simple budgeting rule that divides your after-tax income into
                three categories:
              </Text>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleEmoji}>🏠</Text>
                <Text style={styles.ruleText}>
                  <Text style={styles.ruleBold}>50% Needs:</Text> Essential
                  expenses you must pay
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleEmoji}>🎮</Text>
                <Text style={styles.ruleText}>
                  <Text style={styles.ruleBold}>30% Wants:</Text> Non-essential
                  spending for fun
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleEmoji}>💰</Text>
                <Text style={styles.ruleText}>
                  <Text style={styles.ruleBold}>20% Savings:</Text> Building your
                  financial future
                </Text>
              </View>
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, styles.dangerTitle]}>
              DANGER ZONE
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.resetButton,
                pressed && styles.resetButtonPressed,
              ]}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Reset All Data</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.h1,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  breakdownCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
  },
  breakdownIntro: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  breakdownLabel: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textPrimary,
  },
  breakdownValue: {
    fontSize: FONT_SIZE.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
  },
  infoText: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  ruleEmoji: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  ruleText: {
    flex: 1,
    fontSize: FONT_SIZE.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  ruleBold: {
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  dangerTitle: {
    color: COLORS.error,
  },
  resetButton: {
    backgroundColor: COLORS.error + '15',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  resetButtonPressed: {
    backgroundColor: COLORS.error + '25',
  },
  resetButtonText: {
    fontSize: FONT_SIZE.body,
    fontWeight: '600',
    color: COLORS.error,
  },
});
