export function CourtIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 12h18M12 4v16" strokeLinecap="round" />
    </svg>
  );
}

export function ShuttleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3 8 10l4 11 4-11-4-7Z" strokeLinejoin="round" />
      <path d="M8 10h8" />
      <path d="M9.4 6.5h5.2" strokeWidth="1.3" />
    </svg>
  );
}

export function TagIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8">
      <path d="M12.5 4H6a2 2 0 0 0-2 2v6.5a2 2 0 0 0 .59 1.41l7.5 7.5a2 2 0 0 0 2.82 0l6.5-6.5a2 2 0 0 0 0-2.82l-7.5-7.5A2 2 0 0 0 12.5 4Z" strokeLinejoin="round" />
      <circle cx="8.5" cy="8.5" r="1.2" />
    </svg>
  );
}

export function PeopleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" />
      <path d="M2.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" strokeLinecap="round" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6" strokeLinecap="round" />
      <path d="M18 14.3c2.3.6 4 2.6 4 5.7" strokeLinecap="round" />
    </svg>
  );
}

export function PencilIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20h9" strokeLinecap="round" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinejoin="round" />
    </svg>
  );
}

export function CoinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v9M9.3 9.3c0-1.1 1.2-1.9 2.7-1.9s2.7.9 2.7 2c0 2.6-5.4 1.4-5.4 4 0 1.1 1.2 2 2.7 2s2.7-.8 2.7-1.9" strokeLinecap="round" />
    </svg>
  );
}

export function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
      <path d="m5 12 5 5 9-11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ScaleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v18M7 21h10" strokeLinecap="round" />
      <path d="M5 7 3 12a2.5 2.5 0 0 0 5 0L6 7Z" strokeLinejoin="round" />
      <path d="M19 7l-2 5a2.5 2.5 0 0 0 5 0l-2-5Z" strokeLinejoin="round" />
      <path d="M3 7h18M12 3 6 7M12 3l6 4" strokeLinecap="round" />
    </svg>
  );
}
