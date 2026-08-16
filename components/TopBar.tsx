export default function TopBar({
  zone,
  backHref,
  backLabel = "กลับ",
}: {
  zone: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="max-w-5xl mx-auto flex items-center justify-between bg-white rounded-2xl shadow-md px-5 py-3.5 mb-6">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="SierraBad" className="h-6 w-auto object-contain" />
        <span className="h-5 w-px bg-purple-100" />
        <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-600 text-[10px] font-bold tracking-wide">
          {zone}
        </span>
      </div>
      {backHref && (
        <a
          href={backHref}
          className="text-sm text-purple-600 font-semibold hover:text-purple-800 transition-colors"
        >
          ← {backLabel}
        </a>
      )}
    </div>
  );
}
