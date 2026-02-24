import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors } from '../../constants/colors';
import { NICHES } from '../../constants/niches';
import { RosterCard } from '../../components/cards/RosterCard';
import { NicheTag } from '../../components/ui/NicheTag';
import { RosterMember } from '../../types';

export default function RosterScreen() {
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNiche, setActiveNiche] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('roster_members')
      .select('*, profile:profiles(*)')
      .eq('active', true)
      .order('joined_at', { ascending: false })
      .then(({ data }) => {
        setRoster((data as RosterMember[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = activeNiche
    ? roster.filter((m) => m.niche === activeNiche)
    : roster;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>THE ROSTER</Text>
      <Text style={styles.sub}>Faces of each niche. Earn your spot.</Text>

      {/* Niche filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <TouchableOpacity
          onPress={() => setActiveNiche(null)}
          style={[styles.filterPill, !activeNiche && styles.filterPillActive]}
        >
          <Text style={[styles.filterText, !activeNiche && styles.filterTextActive]}>
            ALL
          </Text>
        </TouchableOpacity>
        {NICHES.map((n) => (
          <TouchableOpacity
            key={n.id}
            onPress={() => setActiveNiche(activeNiche === n.id ? null : n.id)}
            style={[
              styles.filterPill,
              activeNiche === n.id && { backgroundColor: n.color },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                activeNiche === n.id && styles.filterTextActive,
              ]}
            >
              {n.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>NO ROSTER MEMBERS YET</Text>
          <Text style={styles.emptySub}>
            The roster will be announced at Season 1 launch.
          </Text>
        </View>
      ) : (
        filtered.map((member) => <RosterCard key={member.id} member={member} />)
      )}

      {/* Niche section links */}
      <Text style={styles.sectionTitle}>BROWSE BY NICHE</Text>
      {NICHES.map((n) => (
        <TouchableOpacity
          key={n.id}
          style={[styles.nicheRow, { borderLeftColor: n.color }]}
          onPress={() => router.push(`/roster/${n.id}`)}
        >
          <NicheTag niche={n.id} />
          <Text style={styles.nicheArrow}>→</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 48,
    gap: 12,
  },
  heading: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 2,
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  filterTextActive: {
    color: colors.card,
  },
  loader: { marginTop: 32 },
  emptyState: { alignItems: 'center', gap: 6, marginTop: 24, marginBottom: 12 },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  emptySub: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 8,
    marginBottom: 4,
  },
  nicheRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 14,
    borderLeftWidth: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: colors.border,
    borderBottomColor: colors.border,
    borderRightColor: colors.border,
  },
  nicheArrow: {
    color: colors.accentMuted,
    fontSize: 14,
  },
});
