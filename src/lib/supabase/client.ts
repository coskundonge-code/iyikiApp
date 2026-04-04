import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a dummy client that won't crash during SSG/build
    return {
      from: () => ({
        select: () => ({ eq: () => ({ single: () => ({ data: null, error: { message: 'No Supabase config' } }), order: () => ({ data: [], error: null }), or: () => ({ order: () => ({ data: [], error: null }) }), limit: () => ({ data: [], error: null }) }), order: () => ({ data: [], error: null, limit: () => ({ data: [], error: null }) }), single: () => ({ data: null, error: { message: 'No config' } }), data: [], error: null }),
        insert: () => ({ select: () => ({ single: () => ({ data: null, error: { message: 'No config' } }) }) }),
        update: () => ({ eq: () => ({ data: null, error: { message: 'No config' } }) }),
        delete: () => ({ eq: () => ({ data: null, error: { message: 'No config' } }) }),
      }),
      rpc: () => ({ data: null, error: { message: 'No config' } }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithOtp: () => Promise.resolve({ data: null, error: null }),
        verifyOtp: () => Promise.resolve({ data: null, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(url, key);
}
