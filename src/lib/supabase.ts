import { createClient, SupabaseClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = envUrl && envUrl.startsWith('http');
const isValidKey = envKey && envKey.length > 20 && !envKey.includes('your_');

const supabaseUrl = isValidUrl ? envUrl : '';
const supabaseAnonKey = isValidKey ? envKey : '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Only create a real client when credentials are present.
// When not configured, the exported `supabase` is still a valid SupabaseClient
// instance (required by types), but callers should check `isSupabaseConfigured`
// before issuing queries.
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : createClient(
      'https://placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

if (!isSupabaseConfigured) {
  console.warn(
    '[Nexia] Supabase is not configured. Running in local-only mode. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable sync.'
  );
}
