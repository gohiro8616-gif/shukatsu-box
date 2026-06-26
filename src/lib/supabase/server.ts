import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * サーバー側で使うSupabase接続
 * API Routes（サーバー処理）やServer Components（サーバーで描画するページ）で使う
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
            // Server Component内ではCookieの書き込みができないため無視する
          }
        },
      },
    }
  );
}
