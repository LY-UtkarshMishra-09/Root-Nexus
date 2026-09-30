import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder')
);

// Graceful Supabase client singleton; returns null if env vars are unconfigured
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Checks connectivity to the Supabase Cloud backend
 * @returns {Promise<{ online: boolean, latencyMs: number, error: string|null }>}
 */
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      online: false,
      configured: false,
      latencyMs: 0,
      error: 'Supabase credentials not configured in environment (running in local-offline mode).',
    };
  }

  const start = Date.now();
  try {
    const { error } = await supabase.from('todos').select('id').limit(1);
    const latencyMs = Date.now() - start;

    if (error && error.code !== 'PGRST116') {
      return { online: false, configured: true, latencyMs, error: error.message };
    }

    return { online: true, configured: true, latencyMs, error: null };
  } catch (err) {
    return {
      online: false,
      configured: true,
      latencyMs: Date.now() - start,
      error: err.message,
    };
  }
}

