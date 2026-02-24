import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { RosterMember } from '../../types';
import { colors } from '../../constants/colors';
import { NicheTag } from '../ui/NicheTag';
import { RosterRing } from '../animations/RosterRing';

interface Props {
  member: RosterMember;
}

export function RosterCard({ member }: Props) {
  const profile = member.profile;
  const initials = profile?.username?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/roster/${member.niche}/${profile?.username ?? member.user_id}`)}
      activeOpacity={0.85}
    >
      <View style={styles.avatarWrapper}>
        <RosterRing challenged={member.challenged} size={56}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder]}>
              <Text style={styles.initials}>{initials}</Text>
            </View>
          )}
        </RosterRing>
      </View>
      <View style={styles.info}>
        <Text style={styles.username}>@{profile?.username ?? '—'}</Text>
        {profile?.full_name && (
          <Text style={styles.fullName}>{profile.full_name}</Text>
        )}
        <NicheTag niche={member.niche} size="sm" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 4,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    backgroundColor: colors.background,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.accentMuted,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  username: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  fullName: {
    color: colors.textPrimary,
    fontSize: 13,
  },
});
