import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useState, useEffect, createContext, useContext } from 'react';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Auth context and provider
type AuthContextType = {
  user: any | null;
  isLoading: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<any>;
  signUp: (credentials: { email: string; password: string }) => Promise<any>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for active session
    const checkSession = async () => {
      const { data } = await supabaseClient.auth.getSession();
      setUser(data.session?.user || null);
      setIsLoading(false);
      
      // Set up auth state listener
      const { data: authListener } = supabaseClient.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user || null);
        }
      );
      
      return () => {
        authListener.subscription.unsubscribe();
      };
    };
    
    checkSession();
  }, []);

  const signIn = async (credentials: { email: string; password: string }) => {
    const { data, error } = await supabaseClient.auth.signInWithPassword(credentials);
    if (error) throw error;
    return data;
  };

  const signUp = async (credentials: { email: string; password: string }) => {
    const { data, error } = await supabaseClient.auth.signUp(credentials);
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabaseClient.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
