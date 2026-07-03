import { Mail, ExternalLink } from "lucide-react";
import { Suspense } from "react";
import { getUser } from "@/lib/supabase/safe-auth";
import { EmailFilters } from "@/components/email/email-filters";
import type { Email } from "@/types";

/** このページで表示するメールの項目（一覧表示に必要な分だけ取得） */
type EmailListItem = Pick<
  Email,
  "id" | "subject" | "from_name" | "from_address" | "snippet" | "received_at" | "is_read" | "ai_category" | "gmail_link" | "company_id"
>;

export default async function EmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; read?: string; category?: string }>;
}) {
  const params = await searchParams;
  const { supabase, user } = await getUser();

  let emails: EmailListItem[] | null = null;

  if (user) {
    let query = supabase
      .from("emails")
      .select("id, subject, from_name, from_address, snippet, received_at, is_read, ai_category, gmail_link, company_id")
      .eq("user_id", user.id)
      .order("received_at", { ascending: false })
      .limit(50);

    if (params.read === "unread") query = query.eq("is_read", false);
    if (params.read === "read") query = query.eq("is_read", true);
    if (params.category && params.category !== "all") {
      query = query.eq("ai_category", params.category);
    }
    if (params.q) {
      query = query.or(
        `subject.ilike.%${params.q}%,from_name.ilike.%${params.q}%,from_address.ilike.%${params.q}%`
      );
    }

    const result = await query;
    emails = result.data;
  }
  const hasEmails = !!emails && emails.length > 0;

  const categoryColors: Record<string, string> = {
    選考関連: "bg-blue-100 text-blue-700",
    "説明会・セミナー": "bg-purple-100 text-purple-700",
    "内定・オファー": "bg-green-100 text-green-700",
    スカウト: "bg-yellow-100 text-yellow-700",
    事務連絡: "bg-gray-100 text-gray-700",
    その他: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">メール一覧</h1>
        <p className="mt-1 text-sm text-gray-500">
          就活関連のメールを企業ごとに自動分類して表示します
        </p>
      </div>

      <Suspense fallback={<div className="h-12 rounded-lg bg-gray-100 animate-pulse" />}>
        <EmailFilters />
      </Suspense>

      {hasEmails ? (
        <div className="divide-y divide-gray-100 rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          {emails!.map((email) => (
            <div
              key={email.id}
              className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50"
            >
              <div
                className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                  email.is_read ? "bg-gray-300" : "bg-blue-500"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={`truncate text-sm ${
                      email.is_read
                        ? "text-gray-600"
                        : "font-semibold text-gray-900"
                    }`}
                  >
                    {email.subject}
                  </p>
                  {email.ai_category && (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        categoryColors[email.ai_category] ?? categoryColors["その他"]
                      }`}
                    >
                      {email.ai_category}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  {email.from_name ?? email.from_address}
                  <span className="mx-1">·</span>
                  {new Date(email.received_at).toLocaleDateString("ja-JP")}
                </p>
                {email.snippet && (
                  <p className="mt-1 truncate text-xs text-gray-400">
                    {email.snippet}
                  </p>
                )}
              </div>
              {email.gmail_link && (
                <a
                  href={email.gmail_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 shrink-0 text-gray-400 hover:text-blue-500"
                  title="Gmailで開く"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-sm ring-1 ring-gray-100">
          <Mail className="h-12 w-12 text-gray-300" />
          <p className="mt-4 text-sm font-medium text-gray-500">
            メールがまだありません
          </p>
          <p className="mt-1 text-xs text-gray-500">
            ダッシュボードの「メール取得 & AI分析」ボタンを押してください
          </p>
        </div>
      )}
    </div>
  );
}
