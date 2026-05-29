import { SCORE_LABEL, SCORE_ICON } from "@/app/data";

export function ScoreRow({ k, v, compact = false }: { k: string; v: number; compact?: boolean }) {
  return (
    <div className="score-row" data-compact={compact}>
      <span className="score-label"><span className="score-icon">{SCORE_ICON[k]}</span>{SCORE_LABEL[k]}</span>
      <span className="score-track"><span className="score-fill" style={{ width: `${v}%` }} /></span>
      <span className="score-val">{v}</span>
    </div>
  );
}

export function ScoreBars({ scores, compact = false }: { scores: Record<string, number>; compact?: boolean }) {
  return (
    <div className="score-bars" data-compact={compact}>
      {Object.keys(scores).map((k) => <ScoreRow key={k} k={k} v={scores[k]} compact={compact} />)}
    </div>
  );
}

export function ScoreRing({ value, size = 56 }: { value: number; size?: number }) {
  const c = 2 * Math.PI * 22;
  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 56 56" width={size} height={size}>
        <circle cx="28" cy="28" r="22" stroke="rgba(0,0,0,.08)" strokeWidth="4" fill="none" />
        <circle cx="28" cy="28" r="22" stroke="var(--forest)" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform="rotate(-90 28 28)" />
      </svg>
      <div className="score-ring-val">{value}</div>
    </div>
  );
}
