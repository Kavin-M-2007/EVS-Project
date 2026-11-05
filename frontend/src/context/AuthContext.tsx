import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api, getStoredToken, getStoredUser, setStoredToken, setStoredUser, clearStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
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

  useEffect(() => {
    async function verifyAuth() {
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
    verifyAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
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

  const logout = () => {
    clearStoredToken();
    setUser(null);
    setToken(null);
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

