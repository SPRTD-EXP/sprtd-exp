import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { colors } from '../../constants/colors';
import { NICHES, getNicheColor } from '../../constants/niches';
import { EventCard } from '../../components/cards/EventCard';
import { Event } from '../../types';

const ALL_FILTER = 'all';

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(ALL_FILTER);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let query = supabase
        .from('events')
        .select('*, location:locations(business_name, address), host:profiles(username, full_name)')
        .order('date', { ascending: true });

      if (filter !== ALL_FILTER) {
        query = query.eq('niche', filter);
      }

      const { data, error } = await query;
      if (!error) setEvents((data as Event[]) ?? []);
      setLoading(false);
    }
    load();
  }, [filter]);

  const filters = [ALL_FILTER, ...NICHES.map((n) => n.id)];

  return (
    <View style={styles.screen}>
      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filterBar}
      >
        {filters.map((f) => {
          const isActive = filter === f;
          const bgColor = f === ALL_FILTER ? colors.accent : getNicheColor(f);
          const label = f === ALL_FILTER ? 'ALL' : f.toUpperCase();
          return (
            <TouchableOpacity
              key={f}
              style={[
                styles.pill,
                isActive && { backgroundColor: bgColor },
                !isActive && styles.pillInactive,
              ]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Event list */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>NO EVENTS</Text>
            <Text style={styles.emptySub}>
              {filter === ALL_FILTER
                ? 'Events are announced each season.'
                : `No ${filter.toUpperCase()} events scheduled yet.`}
            </Text>
          </View>
        ) : (
          events.map((event) => <EventCard key={event.id} event={event} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexGrow: 0,
  },
  filters: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
  },
  pillInactive: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  pillTextActive: {
    color: colors.card,
  },
  list: {
    padding: 16,
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 8,
  },
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
