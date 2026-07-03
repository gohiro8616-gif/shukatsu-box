import { TimelineEvent } from "@/types";

const STATUS_DOT_COLORS: Record<string, string> = {
  未応募: "bg-gray-400",
  応募済み: "bg-blue-500",
  書類選考中: "bg-indigo-500",
  面接予定: "bg-yellow-500",
  面接済み: "bg-purple-500",
  内定: "bg-green-500",
  辞退: "bg-orange-500",
  不合格: "bg-red-500",
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="mt-4 flex flex-col items-center py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <div className="h-3 w-3 rounded-full bg-gray-300" />
        </div>
        <p className="mt-3 text-sm font-medium text-gray-500">
          タイムラインイベントはまだありません
        </p>
        <p className="mt-1 text-xs text-gray-500">
          ステータスを変更すると自動で記録されます
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <ol className="relative ml-3 border-l-2 border-gray-200">
        {events.map((event) => (
          <li key={event.id} className="mb-6 ml-6 last:mb-0">
            <span
              className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${
                STATUS_DOT_COLORS[event.status] ?? "bg-gray-400"
              }`}
            />
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {event.status}
                </span>
                <time className="text-xs text-gray-500">
                  {new Date(event.occurred_at).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              </div>
              {event.note && (
                <p className="mt-1 text-xs text-gray-500">{event.note}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
