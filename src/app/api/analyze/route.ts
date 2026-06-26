import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeEmails } from "@/lib/ai-analyzer";

/**
 * POST /api/analyze
 * 未分析のメールをClaude AIで分析し、企業分類・期限検出を行う
 *
 * 処理の流れ:
 * 1. まだAI分析していないメールを取得
 * 2. Claude APIでまとめて分析
 * 3. 分析結果をemailsテーブルに反映
 * 4. 新しい企業が見つかればcompaniesテーブルに追加
 */
export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  // まだAI分析していないメール（ai_categoryがnull）を取得
  const { data: unanalyzed, error } = await supabase
    .from("emails")
    .select("id, subject, from_address, from_name, snippet")
    .eq("user_id", user.id)
    .is("ai_category", null)
    .order("received_at", { ascending: false })
    .limit(20); // APIコスト抑制のため20件ずつ

  if (error) {
    return NextResponse.json({ error: "メールの取得に失敗しました。" }, { status: 500 });
  }

  if (!unanalyzed || unanalyzed.length === 0) {
    return NextResponse.json({ analyzed: 0, message: "分析するメールがありません。" });
  }

  // Claude AIで分析
  const analysisMap = await analyzeEmails(
    unanalyzed.map((e) => ({
      id: e.id,
      subject: e.subject,
      fromAddress: e.from_address,
      fromName: e.from_name,
      snippet: e.snippet,
    }))
  );

  let analyzedCount = 0;
  let companiesCreated = 0;

  for (const email of unanalyzed) {
    const analysis = analysisMap.get(email.id);
    if (!analysis) continue;

    // メールのAI分析結果を保存
    await supabase
      .from("emails")
      .update({
        ai_category: analysis.category,
        detected_deadline: analysis.detectedDeadline,
      })
      .eq("id", email.id);

    analyzedCount++;

    // 企業名が検出された場合、企業テーブルに追加（重複チェック付き）
    if (analysis.companyName) {
      const domain = email.from_address.split("@")[1] ?? null;

      // 同じ企業名またはドメインの企業が既にあるか確認
      const { data: existing } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", user.id)
        .or(`name.eq.${analysis.companyName},email_domain.eq.${domain}`)
        .limit(1);

      if (!existing || existing.length === 0) {
        // 新しい企業を登録
        const { data: newCompany } = await supabase
          .from("companies")
          .insert({
            user_id: user.id,
            name: analysis.companyName,
            email_domain: domain,
            status: analysis.suggestedStatus ?? "未応募",
            deadline: analysis.detectedDeadline,
          })
          .select("id")
          .single();

        if (newCompany) {
          // メールと企業を紐付け
          await supabase
            .from("emails")
            .update({ company_id: newCompany.id })
            .eq("id", email.id);

          // タイムラインに初回イベントを追加
          await supabase.from("timeline_events").insert({
            company_id: newCompany.id,
            status: analysis.suggestedStatus ?? "未応募",
            note: `${analysis.category}のメールから自動検出`,
          });

          companiesCreated++;
        }
      } else {
        // 既存企業にメールを紐付け
        await supabase
          .from("emails")
          .update({ company_id: existing[0].id })
          .eq("id", email.id);
      }
    }
  }

  return NextResponse.json({
    analyzed: analyzedCount,
    companiesCreated,
    message: `${analyzedCount}件のメールを分析し、${companiesCreated}社の企業を新しく検出しました。`,
  });
}
