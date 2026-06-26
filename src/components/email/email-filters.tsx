"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function EmailFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/emails?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="企業名・キーワードで検索..."
          defaultValue={searchParams.get("q") ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParam("q", e.currentTarget.value);
            }
          }}
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-2">
        <select
          defaultValue={searchParams.get("read") ?? "all"}
          onChange={(e) => updateParam("read", e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">すべて</option>
          <option value="unread">未読のみ</option>
          <option value="read">既読のみ</option>
        </select>
        <select
          defaultValue={searchParams.get("category") ?? "all"}
          onChange={(e) => updateParam("category", e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">全カテゴリ</option>
          <option value="選考関連">選考関連</option>
          <option value="説明会・セミナー">説明会・セミナー</option>
          <option value="内定・オファー">内定・オファー</option>
          <option value="スカウト">スカウト</option>
          <option value="事務連絡">事務連絡</option>
          <option value="その他">その他</option>
        </select>
      </div>
    </div>
  );
}
