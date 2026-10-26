import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Admin } from '../types/database.types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  adminProfile: Admin | null;
  isLoading: boolean;
  isAdmin: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  enableDemoMode: (founderName?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_FOUNDER: Admin = {
  id: 'founder-001',
  user_id: 'user-founder-001',
  name: 'VS Founder',
  email: 'founder@vsstudio.com',
  created_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminProfile, setAdminProfile] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('vs_studio_demo_mode') === 'true';
  });

  const checkAdminStatus = async (userId: string, email: string): Promise<Admin | null> => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error verifying admin table:', error);
        return null;
      }
      return data as Admin | null;
    } catch (err) {
      console.error('Admin check failed:', err);
      return null;
    }
  };

  useEffect(() => {
    if (isDemoMode) {
      setAdminProfile(DEMO_FOUNDER);
      setIsLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const admin = await checkAdminStatus(session.user.id, session.user.email || '');
        if (admin) {
          setAdminProfile(admin);
        } else {
          // If logged in user is not an admin, deny access
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setAdminProfile(null);
        }
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const admin = await checkAdminStatus(session.user.id, session.user.email || '');
        if (admin) {
          setAdminProfile(admin);
        } else {
          await supabase.auth.signOut();
          setUser(null);
          setAdminProfile(null);
        }
      } else {
        setAdminProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isDemoMode]);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      if (!isSupabaseConfigured) {
        // Automatically switch to demo mode if credentials are unconfigured
        enableDemoMode();
        return { error: null };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      if (data.user) {
        const admin = await checkAdminStatus(data.user.id, data.user.email || '');
        if (!admin) {
          await supabase.auth.signOut();
          return {
            error: new Error(
              'Access denied. This account is not authorized as a VS Studio founder admin.'
            ),
          };
        }
        setAdminProfile(admin);
      }

      return { error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Login failed');
      return { error };
    }
  };

  const signOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem('vs_studio_demo_mode');
      setIsDemoMode(false);
      setAdminProfile(null);
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAdminProfile(null);
  };

  const enableDemoMode = (founderName = 'Sanjay (Founder)') => {
    localStorage.setItem('vs_studio_demo_mode', 'true');
    setIsDemoMode(true);
    setAdminProfile({
      ...DEMO_FOUNDER,
      name: founderName,
    });
    setIsLoading(false);
  };

  const isAdmin = Boolean(adminProfile || isDemoMode);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        adminProfile,
        isLoading,
        isAdmin,
        isDemoMode,
        signIn,
        signOut,
        enableDemoMode,
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
