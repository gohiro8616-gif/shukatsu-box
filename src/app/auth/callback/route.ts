import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Google認証後のコールバック処理
 * Googleログイン成功後、SupabaseがこのURLにリダイレクトしてくる
 * 認証コードをセッションに変換し、ダッシュボードへ転送する
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // エラー時はトップページへ戻す
  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}
