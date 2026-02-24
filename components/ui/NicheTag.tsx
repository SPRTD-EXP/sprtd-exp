import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getNicheColor, getNicheLabel } from '../../constants/niches';
import { colors } from '../../constants/colors';

interface Props {
  niche: string;
  size?: 'sm' | 'md';
}

export function NicheTag({ niche, size = 'md' }: Props) {
  const bgColor = getNicheColor(niche);
  const label = getNicheLabel(niche);

  return (
    <View style={[styles.tag, { backgroundColor: bgColor }, size === 'sm' && styles.sm]}>
      <Text style={[styles.label, size === 'sm' && styles.labelSm]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  labelSm: {
    fontSize: 9,
    letterSpacing: 1,
  },
});
