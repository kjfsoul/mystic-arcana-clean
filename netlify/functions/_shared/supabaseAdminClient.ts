import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseServiceKey) {
  // This log won't be visible to the client, but good for Netlify logs
  console.error("Supabase URL or Service Role Key is missing for admin client.");
  // Depending on the function, you might throw or handle this to return a 500
}

// Note: It's often better to initialize the client within each function
// or ensure env vars are checked at the start of each function invocation.
// This is a shared helper to create it.
export const createSupabaseAdminClient = (): SupabaseClient | null => {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null; 
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

// Helper function to check if a user has premium access
export const isPremiumUser = async (userId: string): Promise<boolean> => {
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    if (!supabaseAdmin) return false;
    
    const { data, error } = await supabaseAdmin
      .from('user_subscriptions')
      .select('is_active, expires_at')
      .eq('user_id', userId)
      .single();
      
    if (error || !data) return false;
    
    // Check if subscription is active and not expired
    return data.is_active && new Date(data.expires_at) > new Date();
  } catch (err) {
    console.error('Error checking premium status:', err);
    return false;
  }
};

// Helper function to verify admin client is working
export const verifyAdminConnection = async (): Promise<boolean> => {
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    if (!supabaseAdmin) return false;
    
    const { data, error } = await supabaseAdmin
      .from('tarot_cards')
      .select('count', { count: 'exact' })
      .limit(1);
      
    return !error;
  } catch (err) {
    console.error('Failed to verify admin connection:', err);
    return false;
  }
};