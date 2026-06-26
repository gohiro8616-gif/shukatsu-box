"use client";

import { useState, useCallback } from "react";
import { StickyNote, Save, Check } from "lucide-react";
import { DEFAULT_STATUSES } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface CompanyControlsProps {
  companyId: string;
  initialStatus: string;
  initialMemo: string;
}

const STATUS_COLORS: Record<string, string> = {
  未応募: "bg-gray-100 text-gray-700",
  応募済み: "bg-blue-100 text-blue-700",
  書類選考中: "bg-indigo-100 text-indigo-700",
  面接予定: "bg-yellow-100 text-yellow-700",
  面接済み: "bg-purple-100 text-purple-700",
  内定: "bg-green-100 text-green-700",
  辞退: "bg-orange-100 text-orange-700",
  不合格: "bg-red-100 text-red-700",
};

export function CompanyControls({
  companyId,
  initialStatus,
  initialMemo,
}: CompanyControlsProps) {
  const [status, setStatus] = useState(initialStatus);
  const [memo, setMemo] = useState(initialMemo);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const supabase = createClient();

  const handleStatusChange = useCallback(
    async (newStatus: string) => {
      if (statusUpdating || newStatus === status) return;
      setStatusUpdating(true);
      setStatus(newStatus);

      const { error } = await supabase
        .from("companies")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", companyId);

      if (!error) {
        await supabase.from("timeline_events").insert({
          company_id: companyId,
          status: newStatus,
          note: `ステータスを「${newStatus}」に変更`,
        });
      }
      setStatusUpdating(false);
    },
    [companyId, status, statusUpdating, supabase]
  );

  const handleSaveMemo = useCallback(async () => {
    setSaving(true);
    await supabase
      .from("companies")
      .update({ memo, updated_at: new Date().toISOString() })
      .eq("id", companyId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [companyId, memo, supabase]);

  return (
    <>
      {/* ステータス変更 */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">選考ステータス</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEFAULT_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                status === s
                  ? `${STATUS_COLORS[s] ?? "bg-gray-100 text-gray-700"} ring-2 ring-offset-1 ring-current`
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* メモ */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-yellow-500" />
            <h2 className="text-sm font-semibold text-gray-900">メモ</h2>
          </div>
          <button
            onClick={handleSaveMemo}
            disabled={saving}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50"
          >
            {saved ? (
              <>
                <Check className="h-3.5 w-3.5" />
                保存済み
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                {saving ? "保存中..." : "保存"}
              </>
            )}
          </button>
        </div>
        <textarea
          className="mt-3 w-full rounded-lg border border-gray-200 p-3 text-sm placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={6}
          placeholder="面接の感想や注意点をメモ..."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>
    </>
  );
}
