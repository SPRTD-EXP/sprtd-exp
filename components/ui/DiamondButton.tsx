import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../constants/colors';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function DiamondButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: Props) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.container,
        isPrimary && styles.primary,
        isOutline && styles.outline,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.card : colors.accent} size="small" />
      ) : (
        <Text
          style={[
            styles.label,
            isPrimary && styles.labelPrimary,
            isOutline && styles.labelOutline,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '0deg' }],
  },
  primary: {
    backgroundColor: colors.accent,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  labelPrimary: {
    color: colors.card,
  },
  labelOutline: {
    color: colors.accent,
  },
});
