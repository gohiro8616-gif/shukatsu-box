import { createBrowserClient } from "@supabase/ssr";

/**
 * ブラウザ側（クライアント）で使うSupabase接続
 * ページのJavaScriptから直接データベースにアクセスする時に使う
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
