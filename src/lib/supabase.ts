import { createClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = envUrl && envUrl.startsWith('http');
const isValidKey = envKey && envKey.length > 20 && !envKey.includes('your_');

const supabaseUrl = isValidUrl ? envUrl : '';
const supabaseAnonKey = isValidKey ? envKey : '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
