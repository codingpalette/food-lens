import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { getSupabaseClient, isSupabaseConfigured } from '@/services/supabase/client';

type AuthContextValue = {
  initialized: boolean;
  isConfigured: boolean;
  session: Session | null;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue>({
  initialized: false,
  isConfigured: false,
  session: null,
  user: null,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [initialized, setInitialized] = useState(!isSupabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return;
      }

      setSession(data.session);
      setInitialized(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setInitialized(true);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = {
    initialized,
    isConfigured: isSupabaseConfigured,
    session,
    user: session?.user ?? null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
