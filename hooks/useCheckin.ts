import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { config } from '../constants/config';

interface Coords {
  latitude: number;
  longitude: number;
}

function haversineDistance(a: Coords, b: Coords): number {
  const R = 6371000; // Earth radius in meters
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function useCheckin(
  locationId: string | undefined,
  locationCoords: Coords | undefined,
  radius: number,
  userCoords: Coords | null,
  qimahPerCheckin: number
) {
  const [canCheckin, setCanCheckin] = useState(false);
  const [lastCheckin, setLastCheckin] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inRange =
    !!userCoords &&
    !!locationCoords &&
    haversineDistance(userCoords, locationCoords) <= radius;

  const cooldownExpired =
    !lastCheckin ||
    Date.now() - new Date(lastCheckin).getTime() >
      config.checkinCooldownHours * 60 * 60 * 1000;

  useEffect(() => {
    setCanCheckin(inRange && cooldownExpired);
  }, [inRange, cooldownExpired]);

  useEffect(() => {
    if (!locationId) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const cutoff = new Date(
        Date.now() - config.checkinCooldownHours * 60 * 60 * 1000
      ).toISOString();
      supabase
        .from('checkins')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('location_id', locationId)
        .gte('created_at', cutoff)
        .order('created_at', { ascending: false })
        .limit(1)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setLastCheckin(data[0].created_at);
          }
        });
    });
  }, [locationId]);

  async function checkin(): Promise<boolean> {
    if (!canCheckin || !locationId || !userCoords || !locationCoords) return false;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase.from('checkins').insert({
        user_id: user.id,
        location_id: locationId,
        qimah_earned: qimahPerCheckin,
      });

      if (error) throw error;

      // Update qimah_balance on the profile
      await supabase.rpc('increment_qimah', {
        user_id: user.id,
        amount: qimahPerCheckin,
      }).then(() => {
        // Insert transaction record
        return supabase.from('transactions').insert({
          user_id: user.id,
          amount: qimahPerCheckin,
          action_type: 'checkin',
          reference_id: locationId,
        });
      });

      setLastCheckin(new Date().toISOString());
      setCanCheckin(false);
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { canCheckin, inRange, lastCheckin, loading, checkin };
}
