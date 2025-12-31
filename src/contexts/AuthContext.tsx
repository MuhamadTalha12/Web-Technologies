import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getAuthToken, setAuthToken } from '@/lib/api';

type UserRole = 'customer' | 'provider' | 'admin';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
}

interface AuthContextType {
  user: { id: string; email: string } | null;
  session: null;
  profile: Profile | null;
  roles: UserRole[];
  isLoading: boolean;
  isProvider: boolean;
  isCustomer: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [session] = useState<null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  type AuthResponse = {
    token?: string;
    user: { id: string; email: string };
    roles: UserRole[];
    profile: Profile;
  };

  const refreshProfile = async () => {
    if (!getAuthToken()) return;
    try {
      const data = await api<AuthResponse>('/auth/me', { method: 'GET', auth: true });
      setUser({ id: data.user.id, email: data.user.email });
      setProfile(data.profile);
      setRoles(data.roles || []);
    } catch {
      setAuthToken(null);
      setUser(null);
      setProfile(null);
      setRoles([]);
    }
  };

  useEffect(() => {
    (async () => {
      await refreshProfile();
      setIsLoading(false);
    })();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    const data = await api<AuthResponse>('/auth/register', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, password, fullName, role }),
    });

    if (data.token) setAuthToken(data.token);
    setUser({ id: data.user.id, email: data.user.email });
    setProfile(data.profile);
    setRoles(data.roles || []);
  };

  const signIn = async (email: string, password: string) => {
    const data = await api<AuthResponse>('/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, password }),
    });

    if (data.token) setAuthToken(data.token);
    setUser({ id: data.user.id, email: data.user.email });
    setProfile(data.profile);
    setRoles(data.roles || []);
  };

  const signOut = async () => {
    setAuthToken(null);
    setUser(null);
    setProfile(null);
    setRoles([]);
  };

  const isProvider = roles.includes('provider');
  const isCustomer = roles.includes('customer') || roles.length === 0;
  const isAdmin = roles.includes('admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        isLoading,
        isProvider,
        isCustomer,
        isAdmin,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
