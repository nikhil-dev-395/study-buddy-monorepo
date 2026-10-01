import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

const url = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// null until VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set — chat falls
// back to polling (see useMessages.ts) until then.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;
