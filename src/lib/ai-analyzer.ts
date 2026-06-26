import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** AIによるメール分析結果 */
export interface EmailAnalysis {
  companyName: string | null;       // 検出された企業名
  category: EmailCategory;          // メールの分類
  detectedDeadline: string | null;  // 検出された期限（ISO日付文字列）
  suggestedStatus: string | null;   // 推奨される選考ステータス
}

/** メールのカテゴリ（AIが自動分類） */
export type EmailCategory =
  | "選考関連"       // ES提出・面接案内・合否連絡
  | "説明会・セミナー" // 説明会・イベントの案内
  | "内定・オファー"   // 内定通知・オファー
  | "スカウト"        // 企業からのスカウトメール
  | "事務連絡"        // マイページ登録完了・パスワード変更等
  | "その他";         // 上記に当てはまらないもの

/**
 * Claude AIを使ってメールの内容を分析する
 * 1通ずつ分析するのではなく、複数メールをまとめて送ることで効率化
 */
export async function analyzeEmails(
  emails: { id: string; subject: string; fromAddress: string; fromName: string | null; snippet: string }[]
): Promise<Map<string, EmailAnalysis>> {
  if (emails.length === 0) return new Map();

  // AIに渡すメール一覧をテキスト化
  const emailList = emails
    .map(
      (e, i) =>
        `【メール${i + 1}】ID: ${e.id}\n件名: ${e.subject}\n送信者: ${e.fromName ?? ""} <${e.fromAddress}>\n本文冒頭: ${e.snippet}`
    )
    .join("\n\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6-20250620",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `あなたは日本の就職活動（新卒採用）に詳しいアシスタントです。
以下のメール一覧を分析して、それぞれのメールについてJSON配列で回答してください。

分析項目:
- companyName: 送信元の企業名（わからなければnull）
- category: "選考関連" | "説明会・セミナー" | "内定・オファー" | "スカウト" | "事務連絡" | "その他"
- detectedDeadline: メール内に返信期限や提出期限があればISO 8601形式で（なければnull）
- suggestedStatus: 就活の選考ステータスとして適切なもの（"未応募" | "応募済み" | "書類選考中" | "面接予定" | "面接済み" | "内定" | "辞退" | "不合格"、わからなければnull）

JSON配列のみを返してください。説明文は不要です。

${emailList}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  try {
    // AIの回答からJSONを抽出（コードブロックで囲まれている場合にも対応）
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return new Map();

    const results: {
      id?: string;
      companyName: string | null;
      category: EmailCategory;
      detectedDeadline: string | null;
      suggestedStatus: string | null;
    }[] = JSON.parse(jsonMatch[0]);

    const map = new Map<string, EmailAnalysis>();
    results.forEach((result, index) => {
      const emailId = result.id ?? emails[index]?.id;
      if (emailId) {
        map.set(emailId, {
          companyName: result.companyName,
          category: result.category,
          detectedDeadline: result.detectedDeadline,
          suggestedStatus: result.suggestedStatus,
        });
      }
    });
    return map;
  } catch {
    console.error("AI分析結果のパースに失敗:", text);
    return new Map();
  }
}
