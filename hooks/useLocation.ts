import { useEffect, useState } from 'react';
import * as ExpoLocation from 'expo-location';

interface Coords {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function requestPermission() {
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    setPermissionStatus(status);
    if (status === 'granted') {
      await getCurrentLocation();
    }
  }

  async function getCurrentLocation() {
    try {
      const loc = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });
      setCoords({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (e) {
      setError('Could not get location');
    }
  }

  useEffect(() => {
    ExpoLocation.getForegroundPermissionsAsync().then(({ status }) => {
      setPermissionStatus(status);
      if (status === 'granted') {
        getCurrentLocation();
      }
    });
  }, []);

  return { coords, permissionStatus, error, requestPermission };
}
