"use client";

import Link from "next/link";
import { useAppState } from "./providers";
import type { Park } from "@/app/data";

export default function CompareTray({ parks }: { parks: Park[] }) {
  const { compareIds, setCompareIds } = useAppState();

  if (compareIds.length === 0) return null;

  const selected = compareIds.map((id) => parks.find((p) => p.id === id)).filter(Boolean) as Park[];

  return (
    <div className="compare-tray">
      <div className="compare-tray-inner">
        <div className="compare-tray-thumbs">
          {selected.map((p, i) => <div key={p.id} className="compare-tray-thumb" style={{ background: p.image, zIndex: 10 - i }} title={p.name} />)}
          {Array.from({ length: 3 - selected.length }).map((_, i) => <div key={`empty-${i}`} className="compare-tray-thumb compare-tray-thumb-empty">+</div>)}
        </div>
        <div className="compare-tray-text">
          <b>{selected.length} park{selected.length === 1 ? "" : "s"} ready to compare</b>
          <span className="muted">{selected.length < 2 ? "Add one more to see them side-by-side" : "Tap to view side-by-side"}</span>
        </div>
        <div className="compare-tray-actions">
          <button className="btn-ghost" onClick={() => setCompareIds([])}>Clear</button>
          <Link href="/compare" className="btn-primary">Compare →</Link>
        </div>
      </div>
    </div>
  );
}
