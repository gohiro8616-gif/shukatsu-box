import { createClient } from "./server";

/**
 * サーバーコンポーネントで安全にユーザー情報を取得する
 * Supabase未接続時（開発プレビュー）はnullを返す
 */
export async function getUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return { supabase, user };
  } catch {
    const supabase = await createClient();
    return { supabase, user: null };
  }
}
