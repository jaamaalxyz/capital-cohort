import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface TimePickerProps {
  value: string; // HH:MM
  onChange: (time: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const { colors, isDark } = useTheme();

  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: 'transparent',
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '500',
        padding: '6px 12px',
        outline: 'none',
        cursor: 'pointer',
        colorScheme: isDark ? 'dark' : 'light',
      }}
    />
  );
}
