import { Mail, Search, Filter } from "lucide-react";

export default function EmailsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">メール一覧</h1>
        <p className="mt-1 text-sm text-gray-500">
          就活関連のメールを企業ごとに自動分類して表示します
        </p>
      </div>

      {/* 検索・フィルターバー */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="企業名・キーワードで検索..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="all">すべて</option>
            <option value="unread">未読のみ</option>
            <option value="read">既読のみ</option>
          </select>
          <select className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="all">全カテゴリ</option>
            <option value="selection">選考関連</option>
            <option value="seminar">説明会・セミナー</option>
            <option value="offer">内定・オファー</option>
            <option value="other">その他</option>
          </select>
        </div>
      </div>

      {/* メールリスト（空状態） */}
      <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-sm ring-1 ring-gray-100">
        <Mail className="h-12 w-12 text-gray-300" />
        <p className="mt-4 text-sm font-medium text-gray-500">
          メールがまだありません
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Googleアカウントを連携すると、就活メールが自動で表示されます
        </p>
      </div>
    </div>
  );
}
