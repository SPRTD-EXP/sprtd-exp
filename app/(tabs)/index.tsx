import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useQimah } from '../../hooks/useQimah';
import { colors } from '../../constants/colors';
import { config } from '../../constants/config';
import { QimahCard } from '../../components/cards/QimahCard';
import { KufiyahWeave } from '../../components/animations/KufiyahWeave';
import { EventCard } from '../../components/cards/EventCard';
import { Event, Transaction } from '../../types';

const ACTION_LABELS: Record<string, string> = {
  event_win: 'Event Win',
  event_participation: 'Event Entry',
  purchase: 'Purchase',
  checkin: 'Location Check-in',
  haybah_unlock: 'HAYBAH Unlock',
  roster_challenge: 'Roster Challenge',
  roster_apply: 'Roster Application',
  nomination: 'Nomination',
};

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const { qimahBalance } = useQimah(user?.id);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Nearest HAYBAH threshold progress
  const nextThreshold =
    config.haybahThresholds.find((t) => t > qimahBalance) ??
    config.haybahThresholds[config.haybahThresholds.length - 1];
  const prevThreshold =
    config.haybahThresholds
      .slice()
      .reverse()
      .find((t) => t <= qimahBalance) ?? 0;
  const weaveProgress =
    nextThreshold === prevThreshold
      ? 1
      : (qimahBalance - prevThreshold) / (nextThreshold - prevThreshold);

  useEffect(() => {
    async function loadData() {
      const [eventsRes, txRes] = await Promise.all([
        supabase
          .from('events')
          .select('*, location:locations(business_name, address)')
          .in('status', ['upcoming', 'live'])
          .order('date', { ascending: true })
          .limit(6),
        user
          ? supabase
              .from('transactions')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(5)
          : Promise.resolve({ data: [] }),
      ]);
      setUpcomingEvents((eventsRes.data as Event[]) ?? []);
      setTransactions((txRes.data as Transaction[]) ?? []);
      setLoading(false);
    }
    loadData();
  }, [user]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.username}>@{profile?.username ?? '—'}</Text>
      </View>

      {/* Qimah Card */}
      <QimahCard balance={qimahBalance} />

      {/* KufiyahWeave */}
      <View style={styles.weaveSection}>
        <Text style={styles.sectionLabel}>
          {qimahBalance >= nextThreshold ? 'HAYBAH READY' : `${nextThreshold - qimahBalance} QIM TO HAYBAH`}
        </Text>
        <KufiyahWeave progress={Math.min(weaveProgress, 1)} size={220} />
        <TouchableOpacity onPress={() => router.push('/haybah')}>
          <Text style={styles.haybahLink}>VIEW HAYBAH DROPS →</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>UPCOMING EVENTS</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/events')}>
            <Text style={styles.seeAll}>SEE ALL</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator color={colors.accent} />
        ) : upcomingEvents.length === 0 ? (
          <Text style={styles.empty}>No upcoming events yet.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} compact />
            ))}
          </ScrollView>
        )}
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
        {transactions.length === 0 ? (
          <Text style={styles.empty}>No activity yet. Participate to earn Qimah.</Text>
        ) : (
          transactions.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View>
                <Text style={styles.txAction}>
                  {ACTION_LABELS[tx.action_type] ?? tx.action_type}
                </Text>
                <Text style={styles.txDate}>
                  {new Date(tx.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  tx.amount > 0 ? styles.earn : styles.spend,
                ]}
              >
                {tx.amount > 0 ? '+' : ''}{tx.amount}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
  },
  username: {
    color: colors.accentMuted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  weaveSection: {
    alignItems: 'center',
    gap: 12,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  haybahLink: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  seeAll: {
    color: colors.accentMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  txAction: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  txDate: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  earn: {
    color: colors.success,
  },
  spend: {
    color: colors.error,
  },
});
