import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface Props {
  balance: number;
  label?: string;
}

export function QimahCard({ balance, label = 'QIMAH' }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.balance}>{balance.toLocaleString()}</Text>
      <View style={styles.divider} />
      <Text style={styles.sub}>YOUR EARNED VALUE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent + '40',
  },
  label: {
    color: colors.accentMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  balance: {
    color: colors.accent,
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 4,
  },
  divider: {
    width: 32,
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2,
  },
});
