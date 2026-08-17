export default function LastEditedBadge({
  name,
  at,
}: {
  name: string | null;
  at: Date | null;
}) {
  if (!name || !at) return null;

  const timeLabel = new Date(at).toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold">
      แก้ไขล่าสุดโดย {name} · {timeLabel}
    </span>
  );
}
