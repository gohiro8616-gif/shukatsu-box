import {
  ArrowLeft,
  Mail,
  Clock,
  StickyNote,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { DEFAULT_STATUSES } from "@/types";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // TODO: Supabaseから企業データを取得

  return (
    <div className="space-y-6">
      {/* 戻るリンク + 企業名 */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">企業名</h1>
          <p className="text-sm text-gray-500">企業ID: {id}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左カラム: ステータス + メモ */}
        <div className="space-y-6 lg:col-span-1">
          {/* ステータス変更 */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              選考ステータス
            </h2>
            <select className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              {DEFAULT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* メモ */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-yellow-500" />
              <h2 className="text-sm font-semibold text-gray-900">メモ</h2>
            </div>
            <textarea
              className="mt-3 w-full rounded-lg border border-gray-200 p-3 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={5}
              placeholder="面接の感想や注意点をメモ..."
            />
          </div>
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
            <div className="mt-4">
              <p className="text-sm text-gray-400">
                タイムラインイベントはまだありません
              </p>
            </div>
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
              <p className="text-sm text-gray-400">
                この企業からのメールはまだありません
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
