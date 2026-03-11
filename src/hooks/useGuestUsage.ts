import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuth } from '@/providers/auth-provider';
import {
  DAILY_LIMIT,
  getGuestUsage,
  incrementGuestUsage,
} from '@/services/guestUsageLimit';

type GuestUsageState = {
  isGuest: boolean;
  remaining: number;
  limitReached: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  increment: () => Promise<void>;
};

export function useGuestUsage(): GuestUsageState {
  const { user } = useAuth();
  const isGuest = !user;

  const [remaining, setRemaining] = useState(DAILY_LIMIT);
  const [limitReached, setLimitReached] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isGuest) {
      setRemaining(DAILY_LIMIT);
      setLimitReached(false);
      setLoading(false);
      return;
    }
    try {
      const usage = await getGuestUsage();
      setRemaining(usage.remaining);
      setLimitReached(usage.limitReached);
    } finally {
      setLoading(false);
    }
  }, [isGuest]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const increment = useCallback(async () => {
    if (!isGuest) return;
    await incrementGuestUsage();
    await refresh();
  }, [isGuest, refresh]);

  return { isGuest, remaining, limitReached, loading, refresh, increment };
}
