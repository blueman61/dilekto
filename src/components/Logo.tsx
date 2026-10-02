export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="5" y="2" width="22" height="28" rx="4" fill="#1f56d6" />
        <path d="M10 10h12M10 15h12M10 20h7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="23" cy="23" r="6" fill="#127a4a" stroke="#fff" strokeWidth="2" />
        <path d="M20.4 23.2l1.8 1.8 3.4-3.6" stroke="#fff" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-xl text-murekkep">Dilekto</span>
    </span>
  );
}
