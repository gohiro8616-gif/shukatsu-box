"use client";

import { Shield, Bell, Tag, Trash2, Plus, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<{ id: string; days_before: number; enabled: boolean }[]>([]);
  const [customStatuses, setCustomStatuses] = useState<{ id: string; label: string; color: string }[]>([]);
  const [newStatusLabel, setNewStatusLabel] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("#6366F1");
  const [showAddStatus, setShowAddStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // 初期データ読み込み
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setIsConnected(true);
      setUserEmail(user.email ?? null);

      const [alertsRes, statusesRes] = await Promise.all([
        supabase.from("alert_settings").select("*").eq("user_id", user.id).order("days_before", { ascending: false }),
        supabase.from("custom_statuses").select("*").eq("user_id", user.id).order("sort_order"),
      ]);

      if (alertsRes.data && alertsRes.data.length > 0) {
        setAlerts(alertsRes.data);
      } else {
        // 初回: デフォルトのアラート設定を作成（3日前・1日前）
        const defaults = [
          { user_id: user.id, days_before: 3, enabled: true },
          { user_id: user.id, days_before: 1, enabled: true },
        ];
        const { data } = await supabase.from("alert_settings").insert(defaults).select();
        if (data) setAlerts(data);
      }

      if (statusesRes.data) setCustomStatuses(statusesRes.data);
    }
    load();
  }, [supabase]);

  // アラートのON/OFF切り替え
  const toggleAlert = useCallback(async (id: string, enabled: boolean) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, enabled } : a)));
    await supabase.from("alert_settings").update({ enabled }).eq("id", id);
  }, [supabase]);

  // カスタムステータス追加
  const addCustomStatus = useCallback(async () => {
    if (!newStatusLabel.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("custom_statuses")
      .insert({
        user_id: user.id,
        label: newStatusLabel.trim(),
        color: newStatusColor,
        sort_order: customStatuses.length,
      })
      .select()
      .single();

    if (data) {
      setCustomStatuses((prev) => [...prev, data]);
      setNewStatusLabel("");
      setShowAddStatus(false);
    }
  }, [newStatusLabel, newStatusColor, customStatuses.length, supabase]);

  // カスタムステータス削除
  const removeCustomStatus = useCallback(async (id: string) => {
    await supabase.from("custom_statuses").delete().eq("id", id);
    setCustomStatuses((prev) => prev.filter((s) => s.id !== id));
  }, [supabase]);

  // Google連携解除
  const handleDisconnect = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/");
  }, [supabase, router]);

  // アカウント削除
  const handleDeleteAccount = useCallback(async () => {
    if (deleteInput !== "削除") return;
    setDeleting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 全データ削除（RLSにより自分のデータのみ）
    await Promise.all([
      supabase.from("emails").delete().eq("user_id", user.id),
      supabase.from("companies").delete().eq("user_id", user.id),
      supabase.from("alert_settings").delete().eq("user_id", user.id),
      supabase.from("custom_statuses").delete().eq("user_id", user.id),
    ]);

    await supabase.auth.signOut();
    router.push("/");
  }, [deleteInput, supabase, router]);

  const COLOR_OPTIONS = [
    { value: "#6366F1", label: "紫" },
    { value: "#3B82F6", label: "青" },
    { value: "#10B981", label: "緑" },
    { value: "#F59E0B", label: "黄" },
    { value: "#EF4444", label: "赤" },
    { value: "#EC4899", label: "ピンク" },
    { value: "#6B7280", label: "グレー" },
  ];

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
            <p className="text-sm font-medium text-green-800">
              {isConnected ? "連携済み" : "未連携"}
            </p>
            <p className="text-xs text-green-600">
              {userEmail
                ? `${userEmail} でログイン中`
                : "Gmailのメールを読み取り専用でアクセスしています"}
            </p>
          </div>
          <button
            onClick={handleDisconnect}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          >
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
          {alerts.map((alert) => (
            <label
              key={alert.id}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <span className="text-sm text-gray-700">
                {alert.days_before}日前にリマインド
              </span>
              <input
                type="checkbox"
                checked={alert.enabled}
                onChange={(e) => toggleAlert(alert.id, e.target.checked)}
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

        {/* 既存のカスタムステータス一覧 */}
        {customStatuses.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {customStatuses.map((status) => (
              <div
                key={status.id}
                className="flex items-center gap-1.5 rounded-full py-1 pl-3 pr-1.5"
                style={{ backgroundColor: status.color + "20", color: status.color }}
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: status.color }}
                />
                <span className="text-xs font-medium">{status.label}</span>
                <button
                  onClick={() => removeCustomStatus(status.id)}
                  className="rounded-full p-0.5 transition-colors hover:bg-black/10"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 追加フォーム */}
        <div className="mt-4">
          {showAddStatus ? (
            <div className="space-y-3 rounded-lg border border-gray-200 p-4">
              <input
                type="text"
                value={newStatusLabel}
                onChange={(e) => setNewStatusLabel(e.target.value)}
                placeholder="ステータス名（例: 最終面接）"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                onKeyDown={(e) => e.key === "Enter" && addCustomStatus()}
              />
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewStatusColor(color.value)}
                    className={`h-7 w-7 rounded-full transition-transform ${
                      newStatusColor === color.value ? "scale-110 ring-2 ring-offset-1" : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addCustomStatus}
                  disabled={!newStatusLabel.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
                >
                  追加
                </button>
                <button
                  onClick={() => {
                    setShowAddStatus(false);
                    setNewStatusLabel("");
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddStatus(true)}
              className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600"
            >
              <Plus className="h-4 w-4" />
              カスタムステータスを追加
            </button>
          )}
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
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              アカウントを削除
            </button>
          ) : (
            <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                本当に削除しますか？確認のため「削除」と入力してください。
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="削除"
                className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== "削除" || deleting}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-40"
                >
                  {deleting ? "削除中..." : "完全に削除する"}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteInput("");
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
