import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZE } from '../constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  style?: ViewStyle;
  testID?: string;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search...',
  style,
  testID,
}: SearchBarProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [localValue, setLocalValue] = React.useState(value);

  // Sync with value prop if it changes externally (e.g. onClear)
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChangeText(localValue);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [localValue, onChangeText, value]);

  const handleClear = () => {
    setLocalValue('');
    onClear?.();
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        style={[styles.input, { color: colors.textPrimary }]}
        value={localValue}
        onChangeText={setLocalValue}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary + '80'}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {localValue.length > 0 && onClear && (
        <TouchableOpacity
          onPress={handleClear}
          testID="search-clear-btn"
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.clearIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingHorizontal: SPACING.md,
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
    },
    icon: {
      fontSize: 16,
      marginRight: SPACING.sm,
    },
    input: {
      flex: 1,
      fontSize: FONT_SIZE.body,
      height: '100%',
    },
    clearButton: {
      padding: 4,
    },
    clearIcon: {
      fontSize: 16,
      color: colors.textSecondary,
    },
  });
