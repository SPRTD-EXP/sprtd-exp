import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors } from '../../constants/colors';
import { getNicheColor, getNicheLabel } from '../../constants/niches';
import { RosterCard } from '../../components/cards/RosterCard';
import { RosterMember } from '../../types';

export default function NicheRosterScreen() {
  const { niche } = useLocalSearchParams<{ niche: string }>();
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!niche) return;
    supabase
      .from('roster_members')
      .select('*, profile:profiles(*)')
      .eq('niche', niche)
      .eq('active', true)
      .then(({ data }) => {
        setRoster((data as RosterMember[]) ?? []);
        setLoading(false);
      });
  }, [niche]);

  const nicheColor = niche ? getNicheColor(niche) : colors.card;
  const nicheLabel = niche ? getNicheLabel(niche) : '';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.niche, { backgroundColor: nicheColor }]}>
        <Text style={styles.nicheLabel}>{nicheLabel}</Text>
        <Text style={styles.nicheSub}>ROSTER</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : roster.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>NO ROSTER MEMBERS</Text>
          <Text style={styles.emptySub}>
            The {nicheLabel.toLowerCase()} roster will be announced at Season 1.
          </Text>
        </View>
      ) : (
        roster.map((member) => <RosterCard key={member.id} member={member} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    gap: 10,
  },
  niche: {
    padding: 20,
    marginHorizontal: -16,
    marginBottom: 8,
    alignItems: 'center',
  },
  nicheLabel: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 3,
  },
  nicheSub: {
    color: colors.textPrimary + 'aa',
    fontSize: 11,
    letterSpacing: 3,
    marginTop: 2,
  },
  loader: { marginTop: 32 },
  emptyState: { alignItems: 'center', gap: 8, marginTop: 32 },
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
    lineHeight: 20,
  },
});
