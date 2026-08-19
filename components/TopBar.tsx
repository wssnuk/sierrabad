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
    <div className="max-w-5xl mx-auto mb-6">
      <div className="h-1 rounded-t-2xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-500" />
      <div className="flex items-center justify-between bg-white rounded-b-2xl shadow-md px-5 py-3.5">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="SierraBad"
            className="h-8 w-auto object-contain"
          />
          <span className="h-6 w-px bg-purple-100" />
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white text-[10px] font-bold tracking-wide shadow-sm shadow-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
            {zone}
          </span>
        </div>
        {backHref && (
          <a
            href={backHref}
            className="group flex items-center gap-1 text-sm text-purple-600 font-semibold hover:text-purple-800 hover:bg-purple-50 pl-2.5 pr-3.5 py-1.5 rounded-full transition-all"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                d="M15 18l-6-6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {backLabel}
          </a>
        )}
      </div>
    </div>
  );
}
