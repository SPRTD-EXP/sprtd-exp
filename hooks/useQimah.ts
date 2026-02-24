import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useQimah(userId: string | undefined) {
  const [qimahBalance, setQimahBalance] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    supabase
      .from('profiles')
      .select('qimah_balance')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data) setQimahBalance(data.qimah_balance);
      });

    // Realtime subscription
    const channel = supabase
      .channel(`profile-qimah-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const newBalance = (payload.new as { qimah_balance: number }).qimah_balance;
          if (newBalance !== undefined) {
            setQimahBalance(newBalance);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { qimahBalance };
}
