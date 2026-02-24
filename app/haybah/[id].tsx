import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useQimah } from '../../hooks/useQimah';
import { colors } from '../../constants/colors';
import { HaybahItem } from '../../types';
import { KufiyahWeave } from '../../components/animations/KufiyahWeave';
import { DiamondButton } from '../../components/ui/DiamondButton';

export default function HaybahItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { qimahBalance } = useQimah(user?.id);
  const [item, setItem] = useState<HaybahItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyUnlocked, setAlreadyUnlocked] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      const [itemRes, unlockRes] = await Promise.all([
        supabase.from('haybah_items').select('*').eq('id', id).single(),
        user
          ? supabase
              .from('haybah_unlocks')
              .select('id')
              .eq('item_id', id)
              .eq('user_id', user.id)
              .single()
          : Promise.resolve({ data: null }),
      ]);
      setItem(itemRes.data as HaybahItem);
      setAlreadyUnlocked(!!unlockRes.data);
      setLoading(false);
    }
    load();
  }, [id, user]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>Item not found.</Text>
      </View>
    );
  }

  const progress = Math.min(qimahBalance / item.qimah_required, 1);
  const canUnlock = qimahBalance >= item.qimah_required && item.quantity_remaining > 0;
  const qimahNeeded = Math.max(0, item.qimah_required - qimahBalance);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Item image */}
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>◆</Text>
        </View>
      )}

      <View style={styles.body}>
        {/* Name + season */}
        <View style={styles.nameRow}>
          <Text style={styles.name}>{item.name}</Text>
          {item.season !== null && (
            <Text style={styles.season}>
              {item.season === 0 ? 'PRESEASON' : `S${item.season}`}
            </Text>
          )}
        </View>

        {item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}

        {/* KufiyahWeave progress */}
        <View style={styles.weaveSection}>
          <Text style={styles.weaveLabel}>
            {progress >= 1 ? 'QIMAH THRESHOLD MET' : `${qimahBalance.toLocaleString()} / ${item.qimah_required.toLocaleString()} QIMAH`}
          </Text>
          <KufiyahWeave progress={progress} size={200} />
          {progress < 1 && (
            <Text style={styles.weaveNeeded}>
              {qimahNeeded.toLocaleString()} more Qimah needed
            </Text>
          )}
        </View>

        {/* Quantity */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>QUANTITY REMAINING</Text>
          <Text style={[styles.infoValue, item.quantity_remaining === 0 && styles.soldOut]}>
            {item.quantity_remaining === 0 ? 'SOLD OUT' : `${item.quantity_remaining} / ${item.quantity_total}`}
          </Text>
        </View>

        {/* Unlock CTA */}
        {alreadyUnlocked ? (
          <View style={styles.unlockedBadge}>
            <Text style={styles.unlockedText}>◆ ALREADY UNLOCKED</Text>
          </View>
        ) : item.quantity_remaining === 0 ? (
          <View style={styles.soldOutBadge}>
            <Text style={styles.soldOutBadgeText}>SOLD OUT</Text>
          </View>
        ) : (
          <DiamondButton
            label={canUnlock ? `UNLOCK — ${item.qimah_required.toLocaleString()} QIM` : `NEED ${qimahNeeded.toLocaleString()} MORE QIM`}
            onPress={() => {}}
            disabled={!canUnlock}
            style={styles.cta}
          />
        )}

        {!alreadyUnlocked && !canUnlock && item.quantity_remaining > 0 && (
          <Text style={styles.comingSoonNote}>
            Unlock flow available at launch. Earn Qimah through events and check-ins.
          </Text>
        )}
      </View>
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
  image: {
    width: '100%',
    height: 260,
    backgroundColor: colors.card,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  imagePlaceholderText: {
    color: colors.border,
    fontSize: 60,
  },
  body: {
    padding: 20,
    gap: 20,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
    flex: 1,
  },
  season: {
    color: colors.accentMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    paddingTop: 4,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  weaveSection: {
    alignItems: 'center',
    gap: 10,
  },
  weaveLabel: {
    color: colors.accentMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  weaveNeeded: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  soldOut: {
    color: colors.error,
  },
  cta: {},
  unlockedBadge: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  unlockedText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  soldOutBadge: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  soldOutBadgeText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
  },
  comingSoonNote: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: -8,
  },
});
