import {
  Clock,
  Building2,
  Mail,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  // TODO: Supabaseからデータを取得する
  const stats = [
    { label: "応募中", count: 0, color: "bg-blue-500" },
    { label: "面接予定", count: 0, color: "bg-yellow-500" },
    { label: "内定", count: 0, color: "bg-green-500" },
    { label: "不合格", count: 0, color: "bg-gray-400" },
  ];

  return (
    <div className="space-y-6">
      {/* ページタイトル */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="mt-1 text-sm text-gray-500">
          就活の全体状況をひと目で確認できます
        </p>
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
            <p className="text-sm text-gray-400">
              締切が近い企業はまだありません。
              <br />
              メールを取得すると、AIが自動で返信期限を検出します。
            </p>
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
            <p className="text-sm text-gray-400">
              まだメールを取得していません。
              <br />
              設定からGoogleアカウントを連携してください。
            </p>
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
          <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
              1
            </div>
            <p className="text-sm text-blue-800">
              Googleアカウントを連携してメールを取得しましょう
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
