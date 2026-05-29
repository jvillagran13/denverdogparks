"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "./providers";
import { ParkPhoto } from "./park-card";
import { ScoreRing } from "./score-bars";
import Footer from "./footer";
import { SCORE_ICON, SCORE_LABEL, avgScore, type Park } from "@/app/data";

const COMPARE_REF = [50, 42];
function distanceMi(park: Park) { const dx = park.coords[0] - COMPARE_REF[0]; const dy = park.coords[1] - COMPARE_REF[1]; return Math.max(0.4, Math.sqrt(dx * dx + dy * dy) * 0.35); }
function driveMin(park: Park) { return Math.round(distanceMi(park) / 22 * 60); }
const CROWD_RANK: Record<string, number> = { "Light": 1, "Light mornings": 2, "Moderate": 3, "Busy": 4, "Packed after 5p": 5, "Busy weekends": 4 };

function argMax(arr: Park[], fn: (p: Park) => number): Park | null {
  if (!arr.length) return null;
  let best = arr[0], bestV = fn(arr[0]), tied = false;
  for (let i = 1; i < arr.length; i++) { const v = fn(arr[i]); if (v > bestV) { best = arr[i]; bestV = v; tied = false; } else if (v === bestV) tied = true; }
  return tied ? null : best;
}
function argMin(arr: Park[], fn: (p: Park) => number) { return argMax(arr, (x) => -fn(x)); }

const COMPARE_SCORE_KEYS = ["vets", "stores", "cafes", "trails", "water", "parking"];

const COMPARE_AWARDS = [
  { key: "closest", label: "Closest to you", pick: (ps: Park[]) => argMin(ps, driveMin), tag: (p: Park) => `${driveMin(p)} min drive · ${distanceMi(p).toFixed(1)} mi` },
  { key: "rating", label: "Highest rated", pick: (ps: Park[]) => argMax(ps, (p) => p.rating), tag: (p: Park) => `★ ${p.rating} · ${p.reviews.toLocaleString()} reviews` },
  { key: "swimmers", label: "Best for swimmers", pick: (ps: Park[]) => argMax(ps, (p) => p.scores.water), tag: (p: Park) => `Water score ${p.scores.water}` },
  { key: "trails", label: "Best for trails", pick: (ps: Park[]) => argMax(ps, (p) => p.scores.trails), tag: (p: Park) => `Trails score ${p.scores.trails}` },
  { key: "size", label: "Biggest run-around", pick: (ps: Park[]) => argMax(ps, (p) => p.acres), tag: (p: Park) => `${p.acres} acres` },
  { key: "cheap", label: "Easiest on the wallet", pick: (ps: Park[]) => argMin(ps, (p) => p.fee === "Free" ? 0 : 10), tag: (p: Park) => p.fee },
  { key: "quiet", label: "Most low-key", pick: (ps: Park[]) => argMin(ps, (p) => CROWD_RANK[p.crowd] || 3), tag: (p: Park) => p.crowd },
  { key: "cafes", label: "Best for a coffee after", pick: (ps: Park[]) => argMax(ps, (p) => p.scores.cafes), tag: (p: Park) => `Cafe score ${p.scores.cafes}` },
];

function CompareVerdicts({ parks }: { parks: Park[] }) {
  const awards = COMPARE_AWARDS.map((a) => { const winner = a.pick(parks); return { ...a, winner, tag: winner ? a.tag(winner) : null }; }).filter((a) => a.winner);
  const counts: Record<string, number> = {};
  awards.forEach((a) => { if (a.winner) counts[a.winner.id] = (counts[a.winner.id] || 0) + 1; });
  const overallWinner = parks.length ? parks.reduce((best, p) => ((counts[p.id] || 0) > (counts[best.id] || 0) ? p : best), parks[0]) : null;

  return (
    <div className="cmp-section cmp-verdicts">
      <div className="cmp-section-head"><h2 className="section-title"><em style={{ fontStyle: "italic" }}>The verdict</em></h2><span className="muted">Awards across {parks.length} parks</span></div>
      {overallWinner && (counts[overallWinner.id] || 0) > 1 && (
        <div className="cmp-overall"><div className="cmp-overall-side"><span className="eyebrow"><span className="eyebrow-line" />Overall pick</span><h3 className="cmp-overall-name">{overallWinner.name}</h3><p className="muted" style={{ margin: "4px 0 0", fontSize: 13.5, lineHeight: 1.5, maxWidth: 360 }}>Won <b style={{ color: "var(--ink)" }}>{counts[overallWinner.id]}</b> of {awards.length} categories.</p></div><div className="cmp-overall-side cmp-overall-photo"><ParkPhoto park={overallWinner} height={120} mono={false} /></div></div>
      )}
      <div className="cmp-awards">{awards.map((a) => <div key={a.key} className="cmp-award"><div className="cmp-award-label"><span className="cmp-award-mark">★</span>{a.label}</div><div className="cmp-award-winner">{a.winner!.name}</div><div className="cmp-award-tag muted">{a.tag}</div></div>)}</div>
    </div>
  );
}

export default function CompareScreen({ parks: allParks }: { parks: Park[] }) {
  const router = useRouter();
  const { savedSet, toggleSave, compareIds, setCompareIds } = useAppState();
  const [pickerOpen, setPickerOpen] = React.useState<number | null>(null);
  const slots = [0, 1, 2].map((i) => compareIds[i] || null);
  const parks = slots.map((id) => (id ? allParks.find((p) => p.id === id) || null : null));
  const filledParks = parks.filter(Boolean) as Park[];

  function setSlot(i: number, id: string) {
    const next = [...compareIds]; next[i] = id;
    for (let j = 0; j < 3; j++) if (j !== i && next[j] === id) next[j] = "";
    setCompareIds(next.filter(Boolean)); setPickerOpen(null);
  }
  function clearSlot(i: number) { const next = [...compareIds]; next[i] = ""; setCompareIds(next.filter(Boolean)); }

  React.useEffect(() => {
    if (pickerOpen === null) return;
    const close = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest?.(".cmp-slot")) setPickerOpen(null); };
    document.addEventListener("click", close); return () => document.removeEventListener("click", close);
  }, [pickerOpen]);

  return (
    <div className="screen">
      <section className="page-head"><div className="page-head-inner cmp-head"><div><span className="eyebrow"><span className="eyebrow-line" />Side-by-side</span><h1 className="page-title">Compare <em style={{ fontStyle: "italic", color: "var(--forest)" }}>up to three</em> parks.</h1><p className="muted" style={{ maxWidth: 580, fontSize: 16, lineHeight: 1.5 }}>Pin two or three parks below and we&apos;ll lay them out next to each other — with editorial awards for the things that actually decide a trip.</p></div><div className="cmp-head-meta"><div><b>{filledParks.length}</b><span>of 3 parks</span></div>{filledParks.length > 0 && <button className="btn-ghost" onClick={() => setCompareIds([])}>Reset</button>}</div></div></section>

      <section className="cmp-tray"><div className="cmp-tray-inner">
        {[0, 1, 2].map((i) => {
          const p = parks[i];
          const available = allParks.filter((x) => !slots.filter(Boolean).includes(x.id) || x.id === p?.id);
          if (!p) {
            return (
              <div key={i} className="cmp-slot cmp-slot-empty" data-open={pickerOpen === i}>
                <button className="cmp-slot-empty-btn" onClick={(e) => { e.stopPropagation(); setPickerOpen(pickerOpen === i ? null : i); }}><span className="cmp-slot-num">{String(i + 1).padStart(2, "0")}</span><span className="cmp-slot-empty-label"><span className="cmp-slot-plus">+</span>Pick a park</span></button>
                {pickerOpen === i && <div className="cmp-slot-menu" onClick={(e) => e.stopPropagation()}><div className="cmp-slot-menu-head">Choose a park</div><div className="cmp-slot-menu-list">{available.map((x) => <button key={x.id} className="cmp-slot-menu-item" onClick={() => setSlot(i, x.id)}><span className="cmp-slot-menu-thumb" style={{ background: x.image }} /><span className="cmp-slot-menu-text"><span className="cmp-slot-menu-name">{x.name}</span><span className="cmp-slot-menu-meta">{x.neighborhood} · Sniff {avgScore(x.scores)}</span></span></button>)}</div></div>}
              </div>
            );
          }
          return (
            <div key={i} className="cmp-slot cmp-slot-filled" data-open={pickerOpen === i}>
              <button className="cmp-slot-card" onClick={(e) => { e.stopPropagation(); setPickerOpen(pickerOpen === i ? null : i); }}><span className="cmp-slot-num">{String(i + 1).padStart(2, "0")}</span><div className="cmp-slot-thumb"><ParkPhoto park={p} height={64} mono={false} /></div><div className="cmp-slot-text"><div className="cmp-slot-title">{p.name}</div><div className="cmp-slot-meta">{p.neighborhood} · ★ {p.rating}</div></div><span className="cmp-slot-swap">Swap ▾</span></button>
              <button className="cmp-slot-x" onClick={(e) => { e.stopPropagation(); clearSlot(i); }} aria-label="Remove">×</button>
              {pickerOpen === i && <div className="cmp-slot-menu" onClick={(e) => e.stopPropagation()}><div className="cmp-slot-menu-head">Choose a park</div><div className="cmp-slot-menu-list">{available.map((x) => <button key={x.id} className="cmp-slot-menu-item" data-current={x.id === p.id} onClick={() => setSlot(i, x.id)}><span className="cmp-slot-menu-thumb" style={{ background: x.image }} /><span className="cmp-slot-menu-text"><span className="cmp-slot-menu-name">{x.name}</span><span className="cmp-slot-menu-meta">{x.neighborhood} · Sniff {avgScore(x.scores)}</span></span>{x.id === p.id && <span className="cmp-slot-menu-check">✓</span>}</button>)}</div></div>}
            </div>
          );
        })}
      </div></section>

      <section className="cmp-body">
        {filledParks.length < 2 ? (
          <div className="cmp-empty"><div className="cmp-empty-mark"><span className="cmp-empty-col">A</span><span className="cmp-empty-vs">vs</span><span className="cmp-empty-col">B</span></div><h3>{filledParks.length === 0 ? "Pick two parks to begin." : "Add one more park to compare."}</h3><p className="muted">Tap a slot above, or browse the full list and add from there.</p><div style={{ display: "flex", gap: 10, marginTop: 18 }}><button className="btn-primary" onClick={() => router.push("/")}>Browse all parks</button><button className="btn-ghost" onClick={() => router.push("/map")}>View map</button></div></div>
        ) : (
          <>
            <div className="cmp-hero" data-cols={filledParks.length}>
              {parks.map((p, i) => (
                <div key={i} className="cmp-hero-col">{p ? (<><div className="cmp-hero-photo"><ParkPhoto park={p} height={220} mono={false} /><button className="save-btn" data-saved={savedSet.has(p.id)} onClick={() => toggleSave(p.id)} aria-label="Save">{savedSet.has(p.id) ? "♥" : "♡"}</button></div><div className="cmp-hero-body"><div className="cmp-hero-meta"><span>{p.neighborhood}</span><span className="sep">·</span><span>{p.acres} ac</span></div><h3 className="cmp-hero-title">{p.name}</h3><div className="cmp-hero-row"><ScoreRing value={avgScore(p.scores)} size={48} /><div className="cmp-hero-row-text"><div className="cmp-hero-row-big">★ {p.rating}</div><div className="cmp-hero-row-sub muted">{p.reviews.toLocaleString()} reviews</div></div><div className="cmp-hero-row-text"><div className="cmp-hero-row-big">{driveMin(p)} min</div><div className="cmp-hero-row-sub muted">from downtown</div></div></div></div></>) : <div className="cmp-hero-placeholder"><span>—</span></div>}</div>
              ))}
            </div>

            <div className="cmp-section"><div className="cmp-section-head"><h2 className="section-title">The facts</h2><span className="muted"><span className="cmp-best-dot" /> Best in each row</span></div>
              <div className="cmp-table" data-cols={filledParks.length}>
                {[
                  { label: "Drive time", value: (p: Park) => `${driveMin(p)} min`, sub: (p: Park) => `${distanceMi(p).toFixed(1)} mi`, best: argMin(filledParks, driveMin) },
                  { label: "Size", value: (p: Park) => p.size, sub: (p: Park) => `${p.acres} acres`, best: argMax(filledParks, (p) => p.acres) },
                  { label: "Fee", value: (p: Park) => p.fee, best: argMin(filledParks, (p) => p.fee === "Free" ? 0 : 10) },
                  { label: "Fenced", value: (p: Park) => p.fenced ? "Yes" : "No", best: null },
                  { label: "Water access", value: (p: Park) => p.water ? "Yes" : "No", best: null },
                  { label: "Surface", value: (p: Park) => p.surface, best: null },
                  { label: "Hours", value: (p: Park) => p.hours, best: null },
                  { label: "Crowd", value: (p: Park) => p.crowd, best: argMin(filledParks, (p) => CROWD_RANK[p.crowd] || 3) },
                  { label: "Rating", value: (p: Park) => `★ ${p.rating}`, sub: (p: Park) => `${p.reviews.toLocaleString()} reviews`, best: argMax(filledParks, (p) => p.rating) },
                ].map((r) => (
                  <div key={r.label} className="cmp-row"><div className="cmp-row-label">{r.label}</div>{parks.map((p, i) => <div key={i} className="cmp-row-cell" data-best={p && r.best && r.best.id === p.id} data-empty={!p}>{p ? (<><span className="cmp-row-val">{r.value(p)}</span>{r.sub && <span className="cmp-row-sub muted">{r.sub(p)}</span>}{r.best && r.best.id === p.id && <span className="cmp-best-badge">Best</span>}</>) : <span className="cmp-row-empty">—</span>}</div>)}</div>
                ))}
              </div>
            </div>

            <div className="cmp-section"><div className="cmp-section-head"><h2 className="section-title">Sniff Score, broken down</h2><span className="muted">Higher bars are better</span></div>
              <div className="cmp-matrix" data-cols={filledParks.length}>
                {COMPARE_SCORE_KEYS.map((k) => {
                  const best = argMax(filledParks, (p) => p.scores[k]);
                  return <div key={k} className="cmp-matrix-row"><div className="cmp-matrix-label"><span className="score-icon">{SCORE_ICON[k]}</span>{SCORE_LABEL[k]}</div>{parks.map((p, i) => <div key={i} className="cmp-matrix-cell" data-best={p && best && best.id === p.id} data-empty={!p}>{p ? (<><div className="cmp-matrix-bar-track"><div className="cmp-matrix-bar-fill" style={{ width: `${p.scores[k]}%` }} /></div><div className="cmp-matrix-val">{p.scores[k]}</div></>) : <span className="muted">—</span>}</div>)}</div>;
                })}
              </div>
            </div>

            <CompareVerdicts parks={filledParks} />
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}
