"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "./providers";
import { ParkPhoto, PromotedBadge } from "./park-card";
import { ScoreBars } from "./score-bars";
import { AdSlot } from "./ad-slot";
import { avgScore, type Park, type AdCreative } from "@/app/data";

function MapCanvas({ parks, selectedId, hoverId, setSelectedId, setHoverId }: { parks: Park[]; selectedId: string; hoverId: string | null; setSelectedId: (id: string) => void; setHoverId: (id: string | null) => void; allParks: Park[] }) {
  return (
    <div className="map-canvas">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="map-bg-svg">
        <defs>
          <pattern id="mapgrid" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M 4 0 L 0 0 0 4" fill="none" stroke="rgba(31,58,46,.06)" strokeWidth=".15" /></pattern>
          <linearGradient id="mapsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#eee6d4" /><stop offset="1" stopColor="#e3dcc8" /></linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#mapsky)" /><rect width="100" height="100" fill="url(#mapgrid)" />
        <path d="M0 100 L0 55 L6 38 L12 48 L18 30 L24 44 L30 28 L36 42 L42 32 L48 46 L52 38 L56 50 L0 100 Z" fill="rgba(31,58,46,.10)" />
        <path d="M0 100 L0 62 L8 52 L16 58 L26 46 L34 56 L42 50 L52 58 L0 100 Z" fill="rgba(31,58,46,.06)" />
        <path d="M85 0 Q70 30, 55 40 Q42 50, 38 70 Q35 88, 25 100" stroke="rgba(106,138,178,.45)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d="M85 0 Q70 30, 55 40 Q42 50, 38 70 Q35 88, 25 100" stroke="rgba(106,138,178,.18)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M100 60 Q72 62, 55 68 Q48 70, 42 78" stroke="rgba(106,138,178,.35)" strokeWidth="1" fill="none" />
        <line x1="48" y1="0" x2="48" y2="100" stroke="rgba(217,119,87,.18)" strokeWidth=".4" strokeDasharray="1 1.2" />
        <line x1="0" y1="38" x2="100" y2="38" stroke="rgba(217,119,87,.18)" strokeWidth=".4" strokeDasharray="1 1.2" />
        <text x="49" y="6" fontSize="2" fill="rgba(217,119,87,.55)" fontFamily="ui-monospace, monospace">I-25</text>
        <text x="92" y="37" fontSize="2" fill="rgba(217,119,87,.55)" fontFamily="ui-monospace, monospace">I-70</text>
        <circle cx="50" cy="42" r="6" fill="rgba(31,58,46,.06)" />
        <text x="50" y="44" fontSize="2.2" fill="rgba(31,58,46,.5)" textAnchor="middle" fontFamily="var(--serif), serif" fontStyle="italic">downtown</text>
        <text x="32" y="20" fontSize="1.8" fill="rgba(31,58,46,.4)" fontFamily="var(--serif)" fontStyle="italic">Berkeley</text>
        <text x="62" y="34" fontSize="1.8" fill="rgba(31,58,46,.4)" fontFamily="var(--serif)" fontStyle="italic">RiNo</text>
        <text x="68" y="54" fontSize="1.8" fill="rgba(31,58,46,.4)" fontFamily="var(--serif)" fontStyle="italic">Central Park</text>
        <text x="48" y="76" fontSize="1.8" fill="rgba(31,58,46,.4)" fontFamily="var(--serif)" fontStyle="italic">Cherry Creek</text>
        <text x="22" y="92" fontSize="1.8" fill="rgba(31,58,46,.4)" fontFamily="var(--serif)" fontStyle="italic">Chatfield</text>
      </svg>
      {parks.map((p, idx) => {
        const isSel = selectedId === p.id;
        const isHov = hoverId === p.id;
        return (
          <button key={p.id} className="map-pin" data-selected={isSel} data-hover={isHov} data-promoted={p.promoted} style={{ left: `${p.coords[0]}%`, top: `${p.coords[1]}%` }} onClick={() => setSelectedId(p.id)} onMouseEnter={() => setHoverId(p.id)} onMouseLeave={() => setHoverId(null)} aria-label={p.name}>
            <span className="map-pin-dot">{p.promoted ? "★" : idx + 1}</span>
            {(isSel || isHov) && <span className="map-pin-tip"><b>{p.name}</b><span>Sniff {avgScore(p.scores)} · ★ {p.rating}</span></span>}
          </button>
        );
      })}
      <div className="map-legend"><div><span className="map-legend-dot" /> Park</div><div><span className="map-legend-dot map-legend-dot-promo">★</span> Featured sponsor</div></div>
    </div>
  );
}

export default function MapScreen({ parks, ads }: { parks: Park[]; ads: AdCreative[] }) {
  const router = useRouter();
  const { savedSet, toggleSave, badgeStyle, showAds } = useAppState();
  const [selectedId, setSelectedId] = React.useState(parks[0]?.id || "");
  const [hoverId, setHoverId] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");
  const filtered = parks.filter((p) => !q || `${p.name} ${p.neighborhood}`.toLowerCase().includes(q.toLowerCase()));
  const selected = parks.find((p) => p.id === selectedId);

  return (
    <div className="screen map-screen">
      <div className="map-layout">
        <aside className="map-list">
          <div className="map-list-head">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h2 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 26 }}>Denver, mapped</h2>
              <span className="muted" style={{ fontSize: 12 }}>{filtered.length} parks</span>
            </div>
            <div className="map-search"><span>⌕</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter the map…" /></div>
          </div>
          <div className="map-list-scroll">
            {filtered.map((p) => (
              <button key={p.id} className="map-list-item" data-selected={selectedId === p.id} data-promoted={p.promoted} onClick={() => setSelectedId(p.id)} onMouseEnter={() => setHoverId(p.id)} onMouseLeave={() => setHoverId(null)}>
                <div className="map-list-num">{String(parks.indexOf(p) + 1).padStart(2, "0")}</div>
                <div className="map-list-text">
                  <div className="map-list-title">{p.name}{p.promoted && badgeStyle !== "halo" && <span className="map-list-promo">{badgeStyle === "subtle" ? "SPONSORED" : badgeStyle === "ribbon" ? "Featured" : "Promoted"}</span>}</div>
                  <div className="map-list-meta"><span>{p.neighborhood}</span><span>·</span><span><span className="star">★</span> {p.rating}</span><span>·</span><span>Sniff {avgScore(p.scores)}</span></div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <div className="map-canvas-wrap">
          <MapCanvas parks={filtered} selectedId={selectedId} hoverId={hoverId} setSelectedId={setSelectedId} setHoverId={setHoverId} allParks={parks} />
        </div>

        <aside className="map-detail">
          {selected && (
            <div className="map-detail-card">
              <ParkPhoto park={selected} height={160} />
              <div className="map-detail-body">
                <div className="park-card-meta-top">{selected.neighborhood}<span className="sep">·</span>{selected.acres} ac<span className="sep">·</span>{selected.fee}</div>
                <h3 style={{ margin: "4px 0 8px", fontFamily: "var(--serif)", fontSize: 24, lineHeight: 1.1 }}>{selected.name}</h3>
                {selected.promoted && badgeStyle === "native" && <PromotedBadge style="native" sponsor={selected.sponsor} />}
                <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: "8px 0 14px" }}>{selected.blurb}</p>
                <ScoreBars scores={selected.scores} compact />
                {selected.promoted && badgeStyle === "halo" && <div style={{ marginTop: 14 }}><PromotedBadge style="halo" sponsor={selected.sponsor} /></div>}
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button className="btn-primary" style={{ flex: 1 }} onClick={() => router.push(`/parks/${selected.id}`)}>Open park</button>
                  <button className="btn-ghost-square" onClick={() => toggleSave(selected.id)} aria-label="Save">{savedSet.has(selected.id) ? "♥" : "♡"}</button>
                </div>
              </div>
            </div>
          )}
          {showAds && selected && (
            <div className="ad-rail" style={{ marginTop: 16 }}><span className="ad-rail-label">Advertisement</span><AdSlot format="rect" seed={selected.id.length} ads={ads} /></div>
          )}
        </aside>
      </div>
    </div>
  );
}
