"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * メール取得 & AI分析を実行するボタン
 * 1. Gmail APIでメールを取得（/api/emails/fetch）
 * 2. Claude AIでメールを分析（/api/analyze）
 * 3. ページをリロードして結果を反映
 */
export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSync = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Step 1: メール取得
      const fetchRes = await fetch("/api/emails/fetch", { method: "POST" });
      const fetchData = await fetchRes.json();

      if (!fetchRes.ok) {
        setMessage(fetchData.error ?? "メール取得に失敗しました");
        return;
      }

      // Step 2: AI分析
      const analyzeRes = await fetch("/api/analyze", { method: "POST" });
      const analyzeData = await analyzeRes.json();

      if (!analyzeRes.ok) {
        setMessage(
          `メール${fetchData.imported}件取得済み。${analyzeData.error ?? "AI分析に失敗しました。"}`
        );
        return;
      }

      setMessage(
        `${fetchData.imported}件取得、${analyzeData.analyzed}件分析、${analyzeData.companiesCreated}社検出`
      );

      // ページのデータを最新に更新
      router.refresh();
    } catch {
      setMessage("通信エラーが発生しました。再度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {message && (
        <span className="text-xs text-gray-500">{message}</span>
      )}
      <button
        onClick={handleSync}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "処理中..." : "メール取得 & AI分析"}
      </button>
    </div>
  );
}
