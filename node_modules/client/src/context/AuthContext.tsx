import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { api, ApiUser } from '../api/client';

interface AuthContextType {
  user: ApiUser | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Sync the Supabase user with our backend database and get the app user profile.
   */
  const syncUser = useCallback(async (accessToken: string, name?: string) => {
    try {
      const response = await api.post(
        '/auth/sync',
        name ? { name } : {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
      }
    } catch {
      // If sync fails, try /me instead
      try {
        const meResponse = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (meResponse.data.success && meResponse.data.user) {
          setUser(meResponse.data.user);
        }
      } catch {
        setUser(null);
      }
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.access_token) {
        await syncUser(currentSession.access_token);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, [syncUser]);

  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setSupabaseUser(initialSession?.user ?? null);

      if (initialSession?.access_token) {
        syncUser(initialSession.access_token).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setSupabaseUser(newSession?.user ?? null);

        if (newSession?.access_token) {
          await syncUser(newSession.access_token);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [syncUser]);

  /**
   * Set up an Axios interceptor to automatically attach the Supabase access token.
   */
  useEffect(() => {
    const interceptor = api.interceptors.request.use(async (config) => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.access_token) {
        config.headers.Authorization = `Bearer ${currentSession.access_token}`;
      }
      return config;
    });

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // If sign-up returns a session immediately (email confirmation disabled),
    // sync the user with our backend
    if (data.session?.access_token) {
      await syncUser(data.session.access_token, name);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, supabaseUser, session, loading, login, signUp, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
