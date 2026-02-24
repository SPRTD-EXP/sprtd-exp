import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { colors } from '../../../constants/colors';
import { getNicheColor, getNicheLabel } from '../../../constants/niches';
import { RosterRing } from '../../../components/animations/RosterRing';
import { NicheTag } from '../../../components/ui/NicheTag';
import { RosterMember } from '../../../types';

export default function RosterMemberScreen() {
  const { niche, member: memberParam } = useLocalSearchParams<{
    niche: string;
    member: string;
  }>();
  const [rosterMember, setRosterMember] = useState<RosterMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberParam) return;
    supabase
      .from('roster_members')
      .select('*, profile:profiles(*)')
      .eq('niche', niche)
      .then(({ data }) => {
        const found = (data as RosterMember[])?.find(
          (m) => m.profile?.username === memberParam || m.user_id === memberParam
        );
        setRosterMember(found ?? null);
        setLoading(false);
      });
  }, [niche, memberParam]);

  const nicheColor = niche ? getNicheColor(niche) : colors.card;
  const profile = rosterMember?.profile;

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!rosterMember) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>Roster member not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Niche header */}
      <View style={[styles.nicheBar, { backgroundColor: nicheColor }]}>
        <Text style={styles.nicheLabel}>{getNicheLabel(niche ?? '')}</Text>
      </View>

      {/* Avatar + Identity */}
      <View style={styles.profile}>
        <RosterRing challenged={rosterMember.challenged} size={80}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.initials}>
              {profile?.username?.slice(0, 2).toUpperCase() ?? '??'}
            </Text>
          </View>
        </RosterRing>
        <Text style={styles.username}>@{profile?.username ?? '—'}</Text>
        {profile?.full_name && (
          <Text style={styles.fullName}>{profile.full_name}</Text>
        )}
        <NicheTag niche={rosterMember.niche} />
      </View>

      {/* Status */}
      <View style={styles.statusRow}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusLabel}>STATUS</Text>
          <Text style={[styles.statusValue, rosterMember.challenged && styles.challenged]}>
            {rosterMember.challenged ? 'CHALLENGED' : 'ACTIVE'}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusLabel}>JOINED</Text>
          <Text style={styles.statusValue}>
            {new Date(rosterMember.joined_at).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>

      {rosterMember.challenged && (
        <View style={styles.challengedBanner}>
          <Text style={styles.challengedText}>
            ◈ THIS SPOT IS BEING CHALLENGED
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 60 },
  loader: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { color: colors.textSecondary, fontSize: 14 },
  nicheBar: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  nicheLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3,
  },
  profile: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: colors.card,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.accentMuted,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
  },
  username: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fullName: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statusBadge: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  statusValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  challenged: {
    color: colors.error,
  },
  challengedBanner: {
    marginHorizontal: 16,
    backgroundColor: colors.error + '20',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error + '60',
  },
  challengedText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
