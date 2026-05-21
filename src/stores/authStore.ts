import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;
  guestMode: boolean;

  setSession: (session: Session | null) => void;
  setGuestMode: (guest: boolean) => void;
  signOut: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  loading: true,
  initialized: false,
  guestMode: false,

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      loading: false,
      ...(session ? { guestMode: false } : {}),
    });
  },

  setGuestMode: (guest) => {
    set({ guestMode: guest });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      session: null,
      user: null,
      guestMode: true,
      loading: false,
    });
  },

  initialize: () => {
    const state = get();
    if (state.initialized) return;

    supabase.auth.onAuthStateChange((_event, session) => {
      get().setSession(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      get().setSession(session);
      set({ initialized: true, loading: false });
    });
  },
}));