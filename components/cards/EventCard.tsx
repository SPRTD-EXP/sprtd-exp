import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Event } from '../../types';
import { colors } from '../../constants/colors';
import { getNicheColor } from '../../constants/niches';
import { NicheTag } from '../ui/NicheTag';

interface Props {
  event: Event;
  compact?: boolean;
}

export function EventCard({ event, compact }: Props) {
  const nicheColor = getNicheColor(event.niche);
  const date = new Date(event.date);
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.compact]}
      onPress={() => router.push(`/events/${event.id}`)}
      activeOpacity={0.85}
    >
      <View style={[styles.nicheBorder, { backgroundColor: nicheColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <NicheTag niche={event.niche} size="sm" />
          {event.status === 'live' && (
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
        <Text style={styles.date}>{dateStr}</Text>
        <View style={styles.footer}>
          <View style={styles.qimahBadge}>
            <Text style={styles.qimahText}>+{event.qimah_participation} QIM</Text>
          </View>
          {event.qimah_winner > 0 && (
            <View style={[styles.qimahBadge, styles.winnerBadge]}>
              <Text style={styles.qimahText}>WIN +{event.qimah_winner}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  compact: {
    width: 220,
    marginBottom: 0,
    marginRight: 12,
  },
  nicheBorder: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  liveText: {
    color: colors.textPrimary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  date: {
    color: colors.textSecondary,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  qimahBadge: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  winnerBadge: {
    borderColor: colors.accentMuted,
  },
  qimahText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
