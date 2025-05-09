import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseServiceKey) {
  // This log won't be visible to the client, but good for Netlify logs
  console.error(
    "Supabase URL or Service Role Key is missing for admin client."
  );
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
