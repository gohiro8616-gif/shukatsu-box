import {
  ArrowLeft,
  Mail,
  Clock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { getUser } from "@/lib/supabase/safe-auth";
import { notFound } from "next/navigation";
import { CompanyControls } from "@/components/company/company-controls";
import { Timeline } from "@/components/company/timeline";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await getUser();

  let company = null;
  let timeline: any[] = [];
  let emails: any[] = [];

  if (user) {
    const { data } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!data) return notFound();
    company = data;

    const [timelineRes, emailsRes] = await Promise.all([
      supabase
        .from("timeline_events")
        .select("*")
        .eq("company_id", id)
        .order("occurred_at", { ascending: false }),
      supabase
        .from("emails")
        .select("id, subject, from_name, from_address, received_at, is_read, gmail_link, snippet")
        .eq("company_id", id)
        .order("received_at", { ascending: false })
        .limit(20),
    ]);

    timeline = timelineRes.data ?? [];
    emails = emailsRes.data ?? [];
  }

  return (
    <div className="space-y-6">
      {/* 戻るリンク + 企業名 */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {company?.name ?? "企業名"}
          </h1>
          {company?.email_domain && (
            <p className="text-sm text-gray-500">@{company.email_domain}</p>
          )}
        </div>
        {company?.deadline && (
          <span className="ml-auto rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
            締切: {new Date(company.deadline).toLocaleDateString("ja-JP")}
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左カラム: ステータス + メモ */}
        <div className="space-y-6 lg:col-span-1">
          <CompanyControls
            companyId={id}
            initialStatus={company?.status ?? "未応募"}
            initialMemo={company?.memo ?? ""}
          />
        </div>

        {/* 右カラム: タイムライン + メール履歴 */}
        <div className="space-y-6 lg:col-span-2">
          {/* 選考タイムライン */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-900">
                選考タイムライン
              </h2>
            </div>
            <Timeline events={timeline} />
          </div>

          {/* メール履歴 */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-green-500" />
              <h2 className="text-sm font-semibold text-gray-900">
                メール履歴
              </h2>
            </div>
            <div className="mt-4">
              {emails.length > 0 ? (
                <ul className="space-y-3">
                  {emails.map((email: any) => (
                    <li
                      key={email.id}
                      className="flex items-start gap-3 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                    >
                      <div
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          email.is_read ? "bg-gray-300" : "bg-blue-500"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {email.subject}
                        </p>
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
                          className="shrink-0 text-gray-400 transition-colors hover:text-blue-500"
                          title="Gmailで開く"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  この企業からのメールはまだありません
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
