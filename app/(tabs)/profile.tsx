import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useQimah } from '../../hooks/useQimah';
import { supabase } from '../../lib/supabase';
import { colors } from '../../constants/colors';
import { Transaction } from '../../types';
import { RosterRing } from '../../components/animations/RosterRing';

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

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const { qimahBalance } = useQimah(user?.id);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setTransactions((data as Transaction[]) ?? []);
        setLoadingTx(false);
      });
  }, [user]);

  function confirmSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }

  const initials = profile?.username?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar + Info */}
      <View style={styles.profileSection}>
        {profile?.role === 'roster' ? (
          <RosterRing challenged={false} size={72}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.initials}>{initials}</Text>
            </View>
          </RosterRing>
        ) : (
          <View style={[styles.avatarPlaceholder, styles.avatarLarge]}>
            <Text style={[styles.initials, styles.initialsLarge]}>{initials}</Text>
          </View>
        )}

        <View style={styles.nameBlock}>
          <Text style={styles.username}>@{profile?.username ?? '—'}</Text>
          {profile?.full_name ? (
            <Text style={styles.fullName}>{profile.full_name}</Text>
          ) : null}
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {(profile?.role ?? 'community').toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Qimah Balance */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>QIMAH BALANCE</Text>
        <Text style={styles.balance}>{qimahBalance.toLocaleString()}</Text>
      </View>

      {/* Quick links */}
      <View style={styles.quickLinks}>
        <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/haybah')}>
          <Text style={styles.quickLinkText}>HAYBAH DROPS</Text>
          <Text style={styles.quickLinkArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/roster')}>
          <Text style={styles.quickLinkText}>ROSTER</Text>
          <Text style={styles.quickLinkArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TRANSACTION HISTORY</Text>
        {loadingTx ? (
          <ActivityIndicator color={colors.accent} />
        ) : transactions.length === 0 ? (
          <Text style={styles.empty}>No transactions yet.</Text>
        ) : (
          transactions.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View style={styles.txInfo}>
                <Text style={styles.txAction}>
                  {ACTION_LABELS[tx.action_type] ?? tx.action_type}
                </Text>
                <Text style={styles.txDate}>
                  {new Date(tx.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
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

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={confirmSignOut}>
        <Text style={styles.signOutText}>SIGN OUT</Text>
      </TouchableOpacity>
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
    paddingTop: 24,
    paddingBottom: 48,
    gap: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    backgroundColor: colors.card,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarLarge: {
    width: 72,
    height: 72,
  },
  initials: {
    color: colors.accentMuted,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  initialsLarge: {
    fontSize: 24,
  },
  nameBlock: {
    flex: 1,
    gap: 4,
  },
  username: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fullName: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  roleBadge: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  roleText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  balanceCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent + '40',
  },
  balanceLabel: {
    color: colors.accentMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  balance: {
    color: colors.accent,
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 4,
  },
  quickLinks: {
    gap: 2,
  },
  quickLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 2,
  },
  quickLinkText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  quickLinkArrow: {
    color: colors.accentMuted,
    fontSize: 14,
  },
  section: {
    gap: 0,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  txInfo: {
    flex: 1,
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
  signOutBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.error + '60',
    borderRadius: 8,
  },
  signOutText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
