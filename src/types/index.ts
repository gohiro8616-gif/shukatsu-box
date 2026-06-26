// === 企業の選考ステータス（8段階 + カスタム） ===
export const DEFAULT_STATUSES = [
  "未応募",       // まだ応募していない
  "応募済み",     // エントリー完了
  "書類選考中",   // 書類の結果待ち
  "面接予定",     // 面接の日程が決まった
  "面接済み",     // 面接を受けた後
  "内定",         // 合格の連絡が来た
  "辞退",         // 自分から断った
  "不合格",       // 不採用の連絡が来た
] as const;

export type DefaultStatus = (typeof DEFAULT_STATUSES)[number];

// === データベースのテーブル型定義 ===

/** 企業情報 */
export interface Company {
  id: string;
  user_id: string;
  name: string;                    // 企業名
  email_domain: string | null;     // メールのドメイン（例: @recruit.co.jp）
  status: string;                  // 選考ステータス
  deadline: string | null;         // 返信・対応期限
  memo: string | null;             // メモ欄
  created_at: string;
  updated_at: string;
}

/** メール情報 */
export interface Email {
  id: string;
  user_id: string;
  company_id: string | null;       // 紐づく企業（AIまたは手動で判定）
  gmail_id: string;                // GmailでのメールID
  subject: string;                 // 件名
  from_address: string;            // 送信元アドレス
  from_name: string | null;        // 送信者名
  snippet: string | null;          // メール本文の冒頭部分
  received_at: string;             // 受信日時
  is_read: boolean;                // 既読かどうか（Gmailの状態を反映）
  ai_category: string | null;      // AIによる分類カテゴリ
  detected_deadline: string | null; // AIが検出した期限
  gmail_link: string | null;       // Gmailで開くリンク
  created_at: string;
}

/** 選考タイムライン（1つの選考ステップ） */
export interface TimelineEvent {
  id: string;
  company_id: string;
  status: string;                  // そのステップのステータス
  note: string | null;             // ステップに対するメモ
  occurred_at: string;             // 発生日時
  created_at: string;
}

/** カスタムステータス（ユーザーが追加した独自のステータス） */
export interface CustomStatus {
  id: string;
  user_id: string;
  label: string;                   // ステータス名
  color: string;                   // 表示色
  sort_order: number;              // 表示順
}

/** アラート設定 */
export interface AlertSetting {
  id: string;
  user_id: string;
  days_before: number;             // 何日前に通知するか（例: 3, 1）
  enabled: boolean;
}
