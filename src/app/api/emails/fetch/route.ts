import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchGmailMessages } from "@/lib/gmail";

/**
 * POST /api/emails/fetch
 * Gmailからメールを取得してSupabaseに保存するAPIエンドポイント
 *
 * 処理の流れ:
 * 1. ログインユーザーのGoogleアクセストークンを取得
 * 2. Gmail APIでメール一覧を取得
 * 3. Supabaseのemailsテーブルに保存（重複は無視）
 */
export async function POST() {
  const supabase = await createClient();

  // ログイン中のユーザー情報を取得
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "ログインが必要です。再度ログインしてください。" },
      { status: 401 }
    );
  }

  // Googleのアクセストークン（Gmail APIへの通行証）を取得
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.provider_token;
  if (!accessToken) {
    return NextResponse.json(
      {
        error:
          "Googleとの連携が切れています。設定画面から再連携してください。",
      },
      { status: 401 }
    );
  }

  try {
    // 初回は6ヶ月前からのメールを取得
    const { data: existingEmails } = await supabase
      .from("emails")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    const isFirstFetch = !existingEmails || existingEmails.length === 0;

    let afterDate: string | undefined;
    if (isFirstFetch) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      afterDate = sixMonthsAgo.toISOString();
    } else {
      // 2回目以降は直近7日分だけ取得（差分更新）
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      afterDate = oneWeekAgo.toISOString();
    }

    const maxResults = isFirstFetch ? 200 : 50;
    const messages = await fetchGmailMessages(accessToken, maxResults, afterDate);

    if (messages.length === 0) {
      return NextResponse.json({ imported: 0, message: "新しいメールはありませんでした。" });
    }

    // Supabaseに保存（upsert = 既にあれば更新、なければ挿入）
    const rows = messages.map((msg) => ({
      user_id: user.id,
      gmail_id: msg.gmailId,
      subject: msg.subject,
      from_address: msg.fromAddress,
      from_name: msg.fromName,
      snippet: msg.snippet,
      received_at: msg.receivedAt,
      is_read: msg.isRead,
      gmail_link: msg.gmailLink,
    }));

    const { error: upsertError } = await supabase
      .from("emails")
      .upsert(rows, { onConflict: "gmail_id,user_id", ignoreDuplicates: false });

    if (upsertError) {
      console.error("メール保存エラー:", upsertError);
      return NextResponse.json(
        { error: "メールの保存に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imported: messages.length,
      message: `${messages.length}件のメールを取得しました。`,
    });
  } catch (err) {
    console.error("Gmail取得エラー:", err);
    return NextResponse.json(
      { error: "メールの取得に失敗しました。Googleとの連携を確認してください。" },
      { status: 500 }
    );
  }
}
