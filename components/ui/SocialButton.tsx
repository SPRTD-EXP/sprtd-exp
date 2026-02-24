import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { colors } from '../../constants/colors';

interface Props {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  loading?: boolean;
  style?: ViewStyle;
}

export function SocialButton({ label, onPress, icon, loading, style }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={[styles.container, loading && styles.disabled, style]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.accent} size="small" />
      ) : (
        <>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={styles.label}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  disabled: {
    opacity: 0.4,
  },
  icon: {
    marginRight: 10,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
