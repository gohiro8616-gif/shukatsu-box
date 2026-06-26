"use client";

import { Shield, Bell, Tag, Trash2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="mt-1 text-sm text-gray-500">
          アカウントやアラートの設定を管理します
        </p>
      </div>

      {/* Google連携 */}
      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Google連携管理
          </h2>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Googleアカウントとの連携状態を確認・管理します
        </p>
        <div className="mt-4 flex items-center justify-between rounded-lg bg-green-50 p-4">
          <div>
            <p className="text-sm font-medium text-green-800">連携済み</p>
            <p className="text-xs text-green-600">
              Gmailのメールを読み取り専用でアクセスしています
            </p>
          </div>
          <button className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
            連携解除
          </button>
        </div>
      </section>

      {/* アラート設定 */}
      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-gray-900">アラート設定</h2>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          締切前にリマインドする日数を設定します
        </p>
        <div className="mt-4 space-y-3">
          {[3, 1].map((days) => (
            <label
              key={days}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
            >
              <span className="text-sm text-gray-700">
                {days}日前にリマインド
              </span>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          ))}
        </div>
      </section>

      {/* カスタムステータス */}
      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            カスタムステータス
          </h2>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          デフォルトの8段階に加えて、独自のステータスを追加できます
        </p>
        <div className="mt-4">
          <button className="rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600">
            + カスタムステータスを追加
          </button>
        </div>
      </section>

      {/* アカウント削除 */}
      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            アカウント退会・データ削除
          </h2>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          アカウントを削除すると、すべてのデータが完全に消去されます。この操作は元に戻せません。
        </p>
        <div className="mt-4">
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
            アカウントを削除
          </button>
        </div>
      </section>
    </div>
  );
}
