import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UserProfile } from '../types/index.js';
import { api, getAuthToken, getCachedUser } from '../services/api.js';

export interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (payload: {
    username: string;
    password: string;
    confirmPassword?: string;
    displayName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserProfile | null>(() => getCachedUser());
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [isLoading, setIsLoading] = useState(true);

  // Validate or restore session on initial mount
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      const storedToken = getAuthToken();
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await api.getMe();
        if (isMounted) {
          setUser(currentUser);
          setToken(getAuthToken());
        }
      } catch (err) {
        console.warn('Session verification failed, clearing credentials:', err);
        if (isMounted) {
          setUser(null);
          setToken(null);
          queryClient.clear();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, [queryClient]);

  const login = useCallback(
    async (credentials: { username: string; password: string }) => {
      // Clear any prior cache before loading new user data
      queryClient.clear();
      const res = await api.login(credentials);
      setUser(res.user);
      setToken(res.token);
    },
    [queryClient]
  );

  const register = useCallback(
    async (payload: {
      username: string;
      password: string;
      confirmPassword?: string;
      displayName?: string;
    }) => {
      queryClient.clear();
      const res = await api.register(payload);
      setUser(res.user);
      setToken(res.token);
    },
    [queryClient]
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setToken(null);
      // Evict all user-specific queries and data from memory
      queryClient.clear();
    }
  }, [queryClient]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
