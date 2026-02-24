import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { supabase } from '../../lib/supabase';
import { useLocation } from '../../hooks/useLocation';
import { colors } from '../../constants/colors';
import { getNicheColor } from '../../constants/niches';
import { LocationCard } from '../../components/cards/LocationCard';
import { Location } from '../../types';

const { height } = Dimensions.get('window');

export default function LocationsScreen() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const { coords, permissionStatus, requestPermission } = useLocation();

  useEffect(() => {
    supabase
      .from('locations')
      .select('*')
      .eq('active', true)
      .then(({ data }) => {
        setLocations((data as Location[]) ?? []);
        setLoading(false);
      });
  }, []);

  const initialRegion = {
    latitude: coords?.latitude ?? 33.8938,
    longitude: coords?.longitude ?? 35.5018, // Beirut default
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  return (
    <View style={styles.screen}>
      {/* Map */}
      {permissionStatus === 'denied' ? (
        <View style={[styles.mapPlaceholder, { height: height * 0.4 }]}>
          <Text style={styles.permText}>LOCATION ACCESS DENIED</Text>
          <TouchableOpacity onPress={requestPermission} style={styles.permBtn}>
            <Text style={styles.permBtnText}>ENABLE LOCATION</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <MapView
          style={[styles.map, { height: height * 0.4 }]}
          provider={PROVIDER_DEFAULT}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton
          customMapStyle={mapStyle}
        >
          {locations.map((loc) => (
            <Marker
              key={loc.id}
              coordinate={{ latitude: Number(loc.lat), longitude: Number(loc.lng) }}
              title={loc.business_name}
              description={loc.niche}
              pinColor={getNicheColor(loc.niche)}
            />
          ))}
        </MapView>
      )}

      {/* Location list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>PARTNER LOCATIONS</Text>
        {loading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : locations.length === 0 ? (
          <Text style={styles.empty}>No partner locations yet.</Text>
        ) : (
          locations.map((loc) => <LocationCard key={loc.id} location={loc} />)
        )}
      </ScrollView>
    </View>
  );
}

const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#2E2B23' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8C8C87' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#2E2B23' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#3f3b31' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1A1A2E' }] },
];

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    width: '100%',
  },
  mapPlaceholder: {
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  permText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  permBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  permBtnText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 4,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  loader: {
    marginTop: 24,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
