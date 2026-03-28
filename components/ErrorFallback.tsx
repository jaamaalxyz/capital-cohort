import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZE } from '../constants/theme';

interface ErrorFallbackProps {
  onReset: () => void;
  error?: Error;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ onReset, error }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View testID="error-fallback" style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {t('errors.somethingWentWrong') || 'Something went wrong'}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {t('errors.unexpectedError') || 'An unexpected error occurred. Your data is safe.'}
      </Text>
      
      {__DEV__ && error && (
        <View style={styles.devContainer}>
          <Text style={[styles.devTitle, { color: colors.error }]}>Development Context:</Text>
          <Text style={[styles.devError, { color: colors.error }]} testID="dev-error-message">
            {error.message}
          </Text>
        </View>
      )}

      <TouchableOpacity
        testID="error-retry-btn"
        style={[styles.button, { backgroundColor: colors.needs }]}
        onPress={onReset}
      >
        <Text style={styles.buttonText}>{t('common.tryAgain') || 'Try Again'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.h2,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.body,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  devContainer: {
    padding: SPACING.md,
    backgroundColor: '#ff000010',
    borderRadius: 8,
    width: '100%',
    marginBottom: SPACING.xl,
  },
  devTitle: {
    fontSize: FONT_SIZE.caption,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  devError: {
    fontSize: FONT_SIZE.caption,
    fontFamily: 'monospace',
  },
  button: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.body,
    fontWeight: '600',
  },
});
