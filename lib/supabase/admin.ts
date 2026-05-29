import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// A cookie-free Supabase client for data fetching in server components,
// generateStaticParams, and generateMetadata — contexts where cookies()
// is not available.
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
