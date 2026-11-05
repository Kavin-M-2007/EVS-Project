import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { api, getStoredToken, getStoredUser, setStoredToken, setStoredUser, clearStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
  updateUserContext: (user: User) => void;
  hasRole: (roles: UserRole[]) => boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isCollector: boolean;
  isMonitor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to fetch user profile from Supabase profiles table
  const fetchSupabaseProfile = async (authUserId: string, fallbackEmail: string, meta: any): Promise<User> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, municipalities(name)')
        .eq('id', authUserId)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          email: data.email || fallbackEmail,
          full_name: data.full_name || meta?.full_name || 'User',
          employee_id: data.employee_id || meta?.employee_id || 'EMP-001',
          role: (data.role as UserRole) || (meta?.role as UserRole) || 'GARBAGE_COLLECTOR',
          municipality_id: data.municipality_id,
          municipality_name: data.municipalities?.name || meta?.municipality_name || 'Peelamedu Zone',
          assigned_area: data.assigned_sector_id ? 'Assigned Sector' : meta?.assigned_area || null,
          phone_number: data.phone_number,
          avatar_url: data.avatar_url,
          status: data.status || 'ACTIVE',
          created_at: data.created_at || new Date().toISOString(),
          last_login: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('Could not query public.profiles table from Supabase:', err);
    }

    // Fallback to auth metadata if table not yet seeded or accessible
    const metaRole = (meta?.role as UserRole) || 'GARBAGE_COLLECTOR';
    return {
      id: authUserId,
      email: fallbackEmail,
      full_name: meta?.full_name || fallbackEmail.split('@')[0],
      employee_id: meta?.employee_id || 'EMP-001',
      role: metaRole,
      municipality_id: meta?.municipality_id || (metaRole === 'SUPER_ADMIN' ? null : 1),
      municipality_name: meta?.municipality_name || (metaRole === 'SUPER_ADMIN' ? 'All Municipalities' : 'Coimbatore Municipal Corporation (CCMC)'),
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
    };
  };

  useEffect(() => {
    let authSubscription: { unsubscribe: () => void } | null = null;

    if (isSupabaseConfigured) {
      // Listen for Supabase auth state changes (sign-in, token refresh, sign-out)
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session) {
            const profile = await fetchSupabaseProfile(
              session.user.id,
              session.user.email || '',
              session.user.user_metadata
            );
            setUser(profile);
            setToken(session.access_token);
            setStoredToken(session.access_token);
            setStoredUser(profile);
          }
        } else if (event === 'SIGNED_OUT') {
          clearStoredToken();
          setUser(null);
          setToken(null);
        }
      });
      authSubscription = listener.subscription;
    }

    async function initSession() {
      if (isSupabaseConfigured) {
        try {
          // Check active Supabase session
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session && !error) {
            const profile = await fetchSupabaseProfile(
              session.user.id,
              session.user.email || '',
              session.user.user_metadata
            );
            setUser(profile);
            setToken(session.access_token);
            setStoredToken(session.access_token);
            setStoredUser(profile);
          } else {
            // Check stored backend token fallback
            const storedTok = getStoredToken();
            if (storedTok) {
              try {
                const me = await api.getMe();
                setUser(me);
                setStoredUser(me);
              } catch {
                clearStoredToken();
                setUser(null);
                setToken(null);
              }
            }
          }
        } catch (e) {
          console.error('Session init error:', e);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Supabase not yet configured, verify standard backend auth
        const storedTok = getStoredToken();
        if (storedTok) {
          try {
            const me = await api.getMe();
            setUser(me);
            setStoredUser(me);
          } catch {
            clearStoredToken();
            setUser(null);
            setToken(null);
          }
        }
        setIsLoading(false);
      }
    }

    initSession();

    return () => {
      authSubscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        // Try genuine Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (!error && data?.session) {
          const profile = await fetchSupabaseProfile(
            data.user.id,
            data.user.email || email,
            data.user.user_metadata
          );
          setStoredToken(data.session.access_token);
          setStoredUser(profile);
          setToken(data.session.access_token);
          setUser(profile);
          return profile;
        }

        // If Supabase auth user does not exist yet (e.g. migration not run in SQL editor),
        // fallback to backend login seamlessly
        if (error && error.message.includes('Invalid login credentials')) {
          try {
            const resp = await api.login(email, password);
            setStoredToken(resp.access_token);
            setStoredUser(resp.user);
            setToken(resp.access_token);
            setUser(resp.user);
            return resp.user;
          } catch {
            throw new Error(error.message);
          }
        } else if (error) {
          throw new Error(error.message);
        }
      }

      // Default to backend login
      const resp = await api.login(email, password);
      setStoredToken(resp.access_token);
      setStoredUser(resp.user);
      setToken(resp.access_token);
      setUser(resp.user);
      return resp.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Supabase signout notice:', e);
    } finally {
      clearStoredToken();
      setUser(null);
      setToken(null);
    }
  };

  const forgotPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase project credentials not configured.');
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?reset=true`,
    });
    if (error) throw new Error(error.message);
  };

  const resetPassword = async (newPassword: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase project credentials not configured.');
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  };

  const updateUserContext = (updated: User) => {
    setUser(updated);
    setStoredUser(updated);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdmin = user?.role === 'ADMIN';
  const isCollector = user?.role === 'GARBAGE_COLLECTOR';
  const isMonitor = user?.role === 'MUNICIPALITY_MONITOR';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        forgotPassword,
        resetPassword,
        updateUserContext,
        hasRole,
        isSuperAdmin,
        isAdmin,
        isCollector,
        isMonitor,
      }}
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
