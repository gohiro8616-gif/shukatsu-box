import {
  Clock,
  Building2,
  Mail,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { SyncButton } from "@/components/dashboard/sync-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ステータス別の企業数を取得
  const { data: companies } = await supabase
    .from("companies")
    .select("id, status, deadline, name")
    .eq("user_id", user!.id);

  const statusCounts = {
    応募中: 0,
    面接予定: 0,
    内定: 0,
    不合格: 0,
  };

  const statusMapping: Record<string, keyof typeof statusCounts> = {
    応募済み: "応募中",
    書類選考中: "応募中",
    面接予定: "面接予定",
    面接済み: "面接予定",
    内定: "内定",
    不合格: "不合格",
  };

  companies?.forEach((c) => {
    const key = statusMapping[c.status];
    if (key) statusCounts[key]++;
  });

  const stats = [
    { label: "応募中", count: statusCounts.応募中, color: "bg-blue-500" },
    { label: "面接予定", count: statusCounts.面接予定, color: "bg-yellow-500" },
    { label: "内定", count: statusCounts.内定, color: "bg-green-500" },
    { label: "不合格", count: statusCounts.不合格, color: "bg-gray-400" },
  ];

  // 締切が近い企業（今日から7日以内）
  const now = new Date();
  const oneWeekLater = new Date();
  oneWeekLater.setDate(now.getDate() + 7);

  const upcomingDeadlines = (companies ?? [])
    .filter((c) => {
      if (!c.deadline) return false;
      const d = new Date(c.deadline);
      return d >= now && d <= oneWeekLater;
    })
    .sort(
      (a, b) =>
        new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()
    );

  // 最新メール5件
  const { data: recentEmails } = await supabase
    .from("emails")
    .select("id, subject, from_name, from_address, received_at, is_read, gmail_link")
    .eq("user_id", user!.id)
    .order("received_at", { ascending: false })
    .limit(5);

  const hasEmails = recentEmails && recentEmails.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="mt-1 text-sm text-gray-500">
            就活の全体状況をひと目で確認できます
          </p>
        </div>
        <SyncButton />
      </div>

      {/* ステータス別件数カード */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
          >
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${stat.color}`} />
              <span className="text-sm text-gray-500">{stat.label}</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stat.count}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 締切が近い企業リスト */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              締切が近い企業
            </h2>
          </div>
          <div className="mt-4">
            {upcomingDeadlines.length > 0 ? (
              <ul className="space-y-3">
                {upcomingDeadlines.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/company/${c.id}`}
                      className="flex items-center justify-between rounded-lg border border-orange-100 bg-orange-50 p-3 hover:bg-orange-100"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {c.name}
                      </span>
                      <span className="text-xs text-orange-600">
                        {formatDistanceToNow(new Date(c.deadline!), {
                          addSuffix: true,
                          locale: ja,
                        })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">
                締切が近い企業はまだありません。
                <br />
                メールを取得すると、AIが自動で返信期限を検出します。
              </p>
            )}
          </div>
        </div>

        {/* 最新メールフィード */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                最新メール
              </h2>
            </div>
            <Link
              href="/emails"
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              すべて見る
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4">
            {hasEmails ? (
              <ul className="space-y-2">
                {recentEmails.map((email) => (
                  <li
                    key={email.id}
                    className="flex items-start gap-3 rounded-lg p-2 hover:bg-gray-50"
                  >
                    <div
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        email.is_read ? "bg-gray-300" : "bg-blue-500"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {email.subject}
                      </p>
                      <p className="text-xs text-gray-500">
                        {email.from_name ?? email.from_address}
                      </p>
                    </div>
                    {email.gmail_link && (
                      <a
                        href={email.gmail_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-gray-400 hover:text-blue-500"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">
                まだメールを取得していません。
                <br />
                「メール取得 & AI分析」ボタンを押してください。
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 次のアクション */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            次にやること
          </h2>
        </div>
        <div className="mt-4 space-y-3">
          {!hasEmails && (
            <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                1
              </div>
              <p className="text-sm text-blue-800">
                上部の「メール取得 & AI分析」ボタンを押してメールを取得しましょう
              </p>
            </div>
          )}
          {upcomingDeadlines.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-lg bg-orange-50 p-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
              <p className="text-sm text-orange-800">
                <Link
                  href={`/company/${c.id}`}
                  className="font-medium underline"
                >
                  {c.name}
                </Link>
                の締切が近づいています
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
