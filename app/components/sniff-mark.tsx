export function SniffMark({ size = 28, color = "var(--ink)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M8 22 C 8 14, 14 10, 18 12 C 22 14, 24 14, 26 12 L 26 18 C 26 22, 22 24, 18 24 C 14 24, 10 24, 8 22 Z" fill={color} />
      <circle cx="22" cy="16" r="1.3" fill="var(--paper)" />
      <path d="M24 20 q1.5 -1 3 0" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M26.5 19 q1.8 -.5 3 .5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity=".6" />
    </svg>
  );
}

export function Wordmark({ tagline = true }: { tagline?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <SniffMark />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ fontFamily: "var(--serif)", fontSize: 24, letterSpacing: "-.01em", color: "var(--ink)" }}>Sniff</span>
        {tagline && (
          <span style={{ fontSize: 9.5, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--stone)", marginTop: 2 }}>
            Denver Edition
          </span>
        )}
      </div>
    </div>
  );
}
