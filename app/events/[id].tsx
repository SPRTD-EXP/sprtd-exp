import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../constants/colors';
import { getNicheColor } from '../../constants/niches';
import { Event, EventParticipant } from '../../types';
import { NicheTag } from '../../components/ui/NicheTag';
import { DiamondButton } from '../../components/ui/DiamondButton';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    async function load() {
      const [eventRes, countRes] = await Promise.all([
        supabase
          .from('events')
          .select('*, location:locations(*), host:profiles(username, full_name)')
          .eq('id', id)
          .single(),
        supabase
          .from('event_participants')
          .select('id', { count: 'exact', head: true })
          .eq('event_id', id),
      ]);

      setEvent(eventRes.data as Event);
      setParticipantCount(countRes.count ?? 0);
      setLoading(false);

      // Check if user is registered
      if (user) {
        const { data } = await supabase
          .from('event_participants')
          .select('id')
          .eq('event_id', id)
          .eq('user_id', user.id)
          .single();
        setRegistered(!!data);
      }
    }
    if (id) load();
  }, [id, user]);

  async function handleRegister() {
    if (!user || !event) return;
    setRegistering(true);
    const { error } = await supabase
      .from('event_participants')
      .insert({ event_id: event.id, user_id: user.id });
    setRegistering(false);

    if (error) {
      Alert.alert('Error', 'Could not register for this event.');
    } else {
      setRegistered(true);
      setParticipantCount((c) => c + 1);
    }
  }

  async function handleUnregister() {
    if (!user || !event) return;
    Alert.alert('Leave Event', 'Are you sure you want to unregister?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unregister',
        style: 'destructive',
        onPress: async () => {
          setRegistering(true);
          await supabase
            .from('event_participants')
            .delete()
            .eq('event_id', event.id)
            .eq('user_id', user.id);
          setRegistering(false);
          setRegistered(false);
          setParticipantCount((c) => Math.max(0, c - 1));
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>Event not found.</Text>
      </View>
    );
  }

  const nicheColor = getNicheColor(event.niche);
  const date = new Date(event.date);
  const isFull =
    event.max_participants !== null && participantCount >= event.max_participants;
  const isPast = event.status === 'completed';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Niche bar */}
      <View style={[styles.nicheBar, { backgroundColor: nicheColor }]} />

      {/* Header */}
      <View style={styles.header}>
        <NicheTag niche={event.niche} />
        {event.status === 'live' && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>LIVE NOW</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{event.title}</Text>

      {/* Date/Time */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>DATE</Text>
        <Text style={styles.infoValue}>
          {date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>TIME</Text>
        <Text style={styles.infoValue}>
          {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      {/* Location */}
      {event.location && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>LOCATION</Text>
          <Text style={styles.infoValue}>{(event.location as any).business_name}</Text>
        </View>
      )}

      {/* Host */}
      {event.host && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>HOST</Text>
          <Text style={styles.infoValue}>@{(event.host as any).username}</Text>
        </View>
      )}

      {/* Season */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>SEASON</Text>
        <Text style={styles.infoValue}>
          {event.season === 0 ? 'PRESEASON' : `SEASON ${event.season}`}
        </Text>
      </View>

      {/* Qimah rewards */}
      <View style={styles.rewardsSection}>
        <Text style={styles.rewardsTitle}>QIMAH REWARDS</Text>
        <View style={styles.rewardsRow}>
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardAmount}>+{event.qimah_participation}</Text>
            <Text style={styles.rewardLabel}>PARTICIPATION</Text>
          </View>
          <View style={[styles.rewardBadge, styles.rewardWinner]}>
            <Text style={[styles.rewardAmount, styles.rewardAmountGold]}>
              +{event.qimah_winner}
            </Text>
            <Text style={styles.rewardLabel}>WIN</Text>
          </View>
        </View>
      </View>

      {/* Participants */}
      <View style={styles.participantBar}>
        <Text style={styles.participantText}>
          {participantCount}
          {event.max_participants ? ` / ${event.max_participants}` : ''} REGISTERED
        </Text>
        {isFull && <Text style={styles.fullText}>FULL</Text>}
      </View>

      {/* CTA */}
      {!isPast && (
        registered ? (
          <View style={styles.ctaSection}>
            <View style={styles.registeredBadge}>
              <Text style={styles.registeredText}>◆ REGISTERED</Text>
            </View>
            <DiamondButton
              label="UNREGISTER"
              onPress={handleUnregister}
              variant="outline"
              loading={registering}
              style={styles.unregBtn}
            />
          </View>
        ) : (
          <DiamondButton
            label={isFull ? 'EVENT FULL' : `JOIN EVENT (+${event.qimah_participation} QIM)`}
            onPress={handleRegister}
            loading={registering}
            disabled={isFull}
            style={styles.cta}
          />
        )
      )}

      {isPast && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>EVENT COMPLETED</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 48 },
  loader: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { color: colors.textSecondary, fontSize: 14 },
  nicheBar: { height: 4 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    paddingBottom: 8,
  },
  liveBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  liveText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
    paddingHorizontal: 16,
    marginBottom: 20,
    lineHeight: 30,
  },
  infoRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    gap: 16,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    width: 80,
    paddingTop: 2,
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  rewardsSection: {
    margin: 16,
    gap: 12,
  },
  rewardsTitle: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rewardBadge: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  rewardWinner: {
    borderColor: colors.accent + '60',
  },
  rewardAmount: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  rewardAmountGold: {
    color: colors.accent,
  },
  rewardLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  participantBar: {
    marginHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  fullText: {
    color: colors.error,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cta: { marginHorizontal: 16 },
  ctaSection: { gap: 10, paddingHorizontal: 16 },
  registeredBadge: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  registeredText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  unregBtn: {},
  completedBadge: {
    marginHorizontal: 16,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  completedText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
