export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      
      {/* Outer circle - represents ecosystem */}
      <circle
        cx="20"
        cy="20"
        r="18"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />
      
      {/* Inner network nodes - represents open source collaboration */}
      <circle cx="20" cy="12" r="2.5" fill="url(#logoGradient)" />
      <circle cx="28" cy="20" r="2.5" fill="url(#logoGradient)" />
      <circle cx="20" cy="28" r="2.5" fill="url(#logoGradient)" />
      <circle cx="12" cy="20" r="2.5" fill="url(#logoGradient)" />
      
      {/* Connection lines */}
      <line
        x1="20"
        y1="12"
        x2="28"
        y2="20"
        stroke="url(#logoGradient)"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <line
        x1="28"
        y1="20"
        x2="20"
        y2="28"
        stroke="url(#logoGradient)"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <line
        x1="20"
        y1="28"
        x2="12"
        y2="20"
        stroke="url(#logoGradient)"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <line
        x1="12"
        y1="20"
        x2="20"
        y2="12"
        stroke="url(#logoGradient)"
        strokeWidth="1.5"
        opacity="0.4"
      />
      
      {/* Center "T" for Talent */}
      <path
        d="M 16 18 L 24 18 M 20 18 L 20 26"
        stroke="url(#logoGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Center dot - represents individual talent */}
      <circle cx="20" cy="20" r="1.5" fill="#ffffff" />
    </svg>
  );
}
