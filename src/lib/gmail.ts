import { google } from "googleapis";

/**
 * Googleのアクセストークンを使ってGmail APIクライアントを作成する
 * アクセストークン = Googleにログインした時にもらえる「通行証」のようなもの
 */
function createGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth });
}

/** Gmail APIから取得したメール1通分のデータ */
export interface GmailMessage {
  gmailId: string;
  subject: string;
  fromAddress: string;
  fromName: string | null;
  snippet: string;
  receivedAt: string;
  isRead: boolean;
  gmailLink: string;
}

/**
 * ヘッダー（メールの付属情報）から特定の項目を取り出す
 * 例: "Subject"を指定すると件名が取れる
 */
function getHeader(
  headers: { name?: string | null; value?: string | null }[],
  name: string
): string {
  return headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

/**
 * "送信者名 <email@example.com>" の形式から名前とアドレスを分離する
 */
function parseFrom(from: string): { name: string | null; address: string } {
  const match = from.match(/^(.+?)\s*<(.+?)>$/);
  if (match) {
    return { name: match[1].replace(/"/g, "").trim(), address: match[2] };
  }
  return { name: null, address: from };
}

/**
 * Gmailからメール一覧を取得する
 * @param accessToken - GoogleログインのアクセスToken
 * @param maxResults - 取得する最大件数（デフォルト100件）
 * @param afterDate - この日付以降のメールを取得（ISO形式の文字列）
 */
export async function fetchGmailMessages(
  accessToken: string,
  maxResults: number = 100,
  afterDate?: string
): Promise<GmailMessage[]> {
  const gmail = createGmailClient(accessToken);

  // 検索クエリを組み立て（Gmailの検索構文を使用）
  let query = "category:primary"; // メインの受信トレイのみ
  if (afterDate) {
    const date = new Date(afterDate);
    const formatted = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    query += ` after:${formatted}`;
  }

  // メールIDの一覧を取得（中身はまだ入っていない）
  const listResponse = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    q: query,
  });

  const messageIds = listResponse.data.messages ?? [];
  if (messageIds.length === 0) return [];

  // 各メールの詳細を並列で取得（高速化のため同時にリクエスト）
  const messages = await Promise.all(
    messageIds.map(async (msg) => {
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "Date"],
      });

      const headers = detail.data.payload?.headers ?? [];
      const from = getHeader(headers, "From");
      const parsed = parseFrom(from);
      const labelIds = detail.data.labelIds ?? [];

      return {
        gmailId: msg.id!,
        subject: getHeader(headers, "Subject") || "(件名なし)",
        fromAddress: parsed.address,
        fromName: parsed.name,
        snippet: detail.data.snippet ?? "",
        receivedAt: new Date(
          parseInt(detail.data.internalDate ?? "0")
        ).toISOString(),
        isRead: !labelIds.includes("UNREAD"),
        gmailLink: `https://mail.google.com/mail/u/0/#inbox/${msg.id}`,
      } satisfies GmailMessage;
    })
  );

  return messages;
}
