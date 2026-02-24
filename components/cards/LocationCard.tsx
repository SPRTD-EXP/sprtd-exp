import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Location } from '../../types';
import { colors } from '../../constants/colors';
import { NicheTag } from '../ui/NicheTag';

interface Props {
  location: Location;
}

export function LocationCard({ location }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/locations/${location.id}`)}
      activeOpacity={0.85}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <NicheTag niche={location.niche} size="sm" />
          <Text style={styles.name}>{location.business_name}</Text>
          {location.address && (
            <Text style={styles.address} numberOfLines={1}>{location.address}</Text>
          )}
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>+{location.qimah_per_checkin}</Text>
          <Text style={styles.badgeLabel}>QIM</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 5,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  address: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '800',
  },
  badgeLabel: {
    color: colors.accentMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
