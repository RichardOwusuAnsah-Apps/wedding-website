import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (uses the public anon key).
 * Safe for Client Components — RLS limits public writes to
 * rsvps.insert and guestbook.insert.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
