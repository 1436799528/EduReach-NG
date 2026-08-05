import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Supabase JS client requires the JWT-format anon key (starts with "eyJ")
// The new sb_publishable_ format is NOT yet supported by @supabase/ssr
export function isSupabaseConfigured(): boolean {
  return (
    supabaseUrl.length > 10 &&
    !supabaseUrl.includes("placeholder") &&
    supabaseKey.startsWith("eyJ") // Only JWT keys work with the JS client
  );
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component — ignore
        }
      },
    },
  });
}
