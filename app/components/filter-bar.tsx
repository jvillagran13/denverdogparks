"use client";

export function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button className="chip" data-active={active} onClick={onClick}><span className="chip-check">{active ? "✓" : "+"}</span>{label}</button>;
}

export function SelectChip({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="chip chip-select">
      {label}:
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <span className="chip-caret">▾</span>
    </label>
  );
}
