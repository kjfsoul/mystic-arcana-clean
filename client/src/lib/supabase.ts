// client/src/lib/supabaseClient.ts
import {
  createClient,
  Session,
  User,
  AuthChangeEvent,
} from "@supabase/supabase-js";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";

// 1. Environment Variable Validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "CRITICAL: Supabase URL or Anon Key is missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file and accessible to Vite."
  );
}

// 2. Supabase Client Initialization
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 3. Authentication Context and Provider
interface AuthContextType {
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  error: any | null; // To store any auth-related errors
  signInWithEmail: typeof supabase.auth.signInWithPassword; // Expose Supabase methods directly
  signUpWithEmail: typeof supabase.auth.signUp;
  signOut: typeof supabase.auth.signOut;
  // Add other methods like signInWithOAuth if needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Attempt to get the initial session
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession }, error: sessionError }) => {
        if (sessionError) {
          console.error("Error getting initial session:", sessionError);
          setError(sessionError);
        }
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Exception getting initial session:", err);
        setError(err);
        setIsLoading(false);
      });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
        setError(null); // Clear previous errors on new auth state
        // You can also handle specific events like 'PASSWORD_RECOVERY', 'USER_UPDATED' here
      }
    );

    // Cleanup listener on component unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const value = {
    isLoading,
    session,
    user,
    error,
    signInWithEmail: supabase.auth.signInWithPassword,
    signUpWithEmail: supabase.auth.signUp,
    signOut: supabase.auth.signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. Custom `useAuth` Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// 5. Your existing helper functions (can remain, but useAuth hook is often preferred in components)
export const getSession = async (): Promise<Session | null> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Error getting session:", error.message);
    return null;
  }
  return data.session;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const sessionData = await getSession(); // Re-use your getSession
  return sessionData?.user ?? null;
};

export const isAuthenticated = async (): Promise<boolean> => {
  const currentUser = await getCurrentUser();
  return !!currentUser;
};

// Export types for convenience
export type { User, Session };
