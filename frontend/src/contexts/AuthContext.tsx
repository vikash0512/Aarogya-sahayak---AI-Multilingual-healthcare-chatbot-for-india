import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { apiFetch } from '../api';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  role: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // We already hydrate initial state via getSession() above.
        if (_event === 'INITIAL_SESSION') {
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchRole(session.user);
        } else {
          setRole(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (sessionUser?: User | null) => {
    try {
      const data = await apiFetch('/auth/me/');
      if (data && data.role) {
        setRole(data.role);
      } else {
        const metaRole =
          (sessionUser as any)?.app_metadata?.role ||
          (sessionUser as any)?.user_metadata?.role ||
          null;
        setRole(metaRole);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      // Keep known role if available; avoid defaulting to patient on transient API/network errors.
      setRole((currentRole) => currentRole ?? null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
