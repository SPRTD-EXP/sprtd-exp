import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useQimah } from '../../hooks/useQimah';
import { colors } from '../../constants/colors';
import { HaybahItem } from '../../types';

export default function HaybahScreen() {
  const { user } = useAuth();
  const { qimahBalance } = useQimah(user?.id);
  const [items, setItems] = useState<HaybahItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('haybah_items')
      .select('*')
      .eq('active', true)
      .order('qimah_required', { ascending: true })
      .then(({ data }) => {
        setItems((data as HaybahItem[]) ?? []);
        setLoading(false);
      });
  }, []);

  function renderItem({ item }: { item: HaybahItem }) {
    const canUnlock = qimahBalance >= item.qimah_required;
    const remaining = item.quantity_remaining;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/haybah/${item.id}`)}
        activeOpacity={0.85}
      >
        {/* Image placeholder */}
        <View style={[styles.imageArea, canUnlock && styles.imageAreaUnlockable]}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.image} />
          ) : (
            <Text style={styles.imagePlaceholder}>◆</Text>
          )}
          {canUnlock && (
            <View style={styles.unlockBadge}>
              <Text style={styles.unlockBadgeText}>UNLOCKABLE</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
          )}
          <View style={styles.footer}>
            <View style={[styles.qimahReq, canUnlock && styles.qimahReqMet]}>
              <Text style={[styles.qimahReqText, canUnlock && styles.qimahReqTextMet]}>
                {item.qimah_required.toLocaleString()} QIM
              </Text>
            </View>
            <Text style={styles.quantity}>
              {remaining > 0 ? `${remaining} LEFT` : 'SOLD OUT'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.heading}>HAYBAH</Text>
        <Text style={styles.sub}>Exclusive drops. Earned, not bought.</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>YOUR QIMAH</Text>
          <Text style={styles.balanceValue}>{qimahBalance.toLocaleString()}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>NO DROPS YET</Text>
          <Text style={styles.emptySub}>
            HAYBAH drops are announced each season. Keep earning Qimah.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  heading: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 4,
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
    marginBottom: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.accent + '40',
  },
  balanceLabel: {
    color: colors.accentMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  balanceValue: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '800',
  },
  list: {
    padding: 12,
    paddingBottom: 48,
  },
  row: {
    gap: 10,
    marginBottom: 10,
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageArea: {
    height: 120,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageAreaUnlockable: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    color: colors.border,
    fontSize: 36,
  },
  unlockBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  unlockBadgeText: {
    color: colors.card,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  info: {
    padding: 10,
    gap: 6,
  },
  itemName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  itemDesc: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  qimahReq: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
  },
  qimahReqMet: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '20',
  },
  qimahReqText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  qimahReqTextMet: {
    color: colors.accent,
  },
  quantity: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loader: { marginTop: 48 },
  emptyState: { alignItems: 'center', gap: 8, marginTop: 48, paddingHorizontal: 32 },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  emptySub: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
