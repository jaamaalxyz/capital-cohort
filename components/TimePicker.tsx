import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { FONT_SIZE, SPACING } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface TimePickerProps {
  value: string; // HH:MM
  onChange: (time: string) => void;
}

function timeStringToDate(time: string): Date {
  const [hour, minute] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

function dateToTimeString(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const { colors, isDark } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const date = timeStringToDate(value);

  const handleChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) onChange(dateToTimeString(selected));
  };

  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={date}
        mode="time"
        display="compact"
        themeVariant={isDark ? 'dark' : 'light'}
        onChange={handleChange}
      />
    );
  }

  // Android — show value as pressable, open picker on tap
  return (
    <View>
      <Pressable
        onPress={() => setShowPicker(true)}
        style={[styles.androidButton, { borderColor: colors.border, backgroundColor: colors.card }]}
      >
        <Text style={[styles.androidButtonText, { color: colors.textPrimary }]}>{value}</Text>
      </Pressable>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display="default"
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  androidButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  androidButtonText: {
    fontSize: FONT_SIZE.body,
    fontWeight: '500',
  },
});
