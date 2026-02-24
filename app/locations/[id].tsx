import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useLocation } from '../../hooks/useLocation';
import { useCheckin } from '../../hooks/useCheckin';
import { colors } from '../../constants/colors';
import { Location } from '../../types';
import { NicheTag } from '../../components/ui/NicheTag';
import { DiamondPulse } from '../../components/animations/DiamondPulse';

export default function LocationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const { coords, permissionStatus, requestPermission } = useLocation();

  useEffect(() => {
    if (!id) return;
    supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setLocation(data as Location);
        setLoading(false);
      });
  }, [id]);

  const locationCoords = location
    ? { latitude: Number(location.lat), longitude: Number(location.lng) }
    : undefined;

  const { canCheckin, inRange, lastCheckin, loading: checkinLoading, checkin } =
    useCheckin(id, locationCoords, location?.checkin_radius_meters ?? 150, coords, location?.qimah_per_checkin ?? 50);

  async function handleCheckin() {
    const success = await checkin();
    if (success) {
      Alert.alert('Checked In!', `+${location?.qimah_per_checkin} Qimah earned.`);
    } else {
      Alert.alert('Check-in failed', 'Could not complete check-in. Try again.');
    }
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>Location not found.</Text>
      </View>
    );
  }

  const cooldownInfo = lastCheckin
    ? `Last check-in: ${new Date(lastCheckin).toLocaleDateString()}`
    : null;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <NicheTag niche={location.niche} />
      </View>

      <Text style={styles.name}>{location.business_name}</Text>
      {location.address && (
        <Text style={styles.address}>{location.address}</Text>
      )}

      {/* Info rows */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>CHECK-IN REWARD</Text>
        <Text style={styles.infoValue}>+{location.qimah_per_checkin} QIMAH</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>RANGE</Text>
        <Text style={styles.infoValue}>{location.checkin_radius_meters}m</Text>
      </View>

      {/* Location permission */}
      {permissionStatus !== 'granted' && (
        <View style={styles.permBanner}>
          <Text style={styles.permText}>Enable location to check in</Text>
          <Text style={styles.permLink} onPress={requestPermission}>
            ENABLE →
          </Text>
        </View>
      )}

      {/* Distance indicator */}
      {permissionStatus === 'granted' && (
        <View style={styles.rangeBanner}>
          <View
            style={[
              styles.rangeIndicator,
              inRange ? styles.rangeIn : styles.rangeOut,
            ]}
          />
          <Text style={styles.rangeText}>
            {inRange ? 'IN RANGE — TAP TO CHECK IN' : 'OUT OF RANGE'}
          </Text>
        </View>
      )}

      {/* DiamondPulse check-in button */}
      <View style={styles.checkinSection}>
        <DiamondPulse
          active={canCheckin}
          onPress={handleCheckin}
          disabled={checkinLoading}
        />
        {cooldownInfo && (
          <Text style={styles.cooldownText}>{cooldownInfo}</Text>
        )}
        {lastCheckin && !canCheckin && (
          <Text style={styles.cooldownSub}>Check-in available every 24 hours</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 60,
    gap: 16,
  },
  loader: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { color: colors.textSecondary, fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.3,
    lineHeight: 32,
  },
  address: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  infoValue: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  permBanner: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  permText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  permLink: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  rangeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  rangeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rangeIn: {
    backgroundColor: colors.success,
  },
  rangeOut: {
    backgroundColor: colors.textSecondary,
  },
  rangeText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  checkinSection: {
    alignItems: 'center',
    paddingTop: 32,
    gap: 16,
  },
  cooldownText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  cooldownSub: {
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
