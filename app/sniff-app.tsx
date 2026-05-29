"use client";

import React from "react";
import {
  PARKS, NEARBY, DASHBOARD, EMERGENCY_VETS, REVIEWS, AD_CREATIVES,
  SCORE_LABEL, SCORE_ICON, avgScore, generateNearby, defaultReviews,
  type Park, type AdCreative,
} from "./data";

// ── Shared components ──────────────────────────────────────────────────────

function SniffMark({ size = 28, color = "var(--ink)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M8 22 C 8 14, 14 10, 18 12 C 22 14, 24 14, 26 12 L 26 18 C 26 22, 22 24, 18 24 C 14 24, 10 24, 8 22 Z" fill={color} />
      <circle cx="22" cy="16" r="1.3" fill="var(--paper)" />
      <path d="M24 20 q1.5 -1 3 0" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M26.5 19 q1.8 -.5 3 .5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity=".6" />
    </svg>
  );
}

function Wordmark({ tagline = true }: { tagline?: boolean }) {
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

function TopNav({ route, go, saved, compareCount = 0 }: { route: string; go: (name: string, id?: string) => void; saved: number; compareCount?: number }) {
  const item = (key: string, label: string) => (
    <button key={key} onClick={() => go(key)} data-active={route === key} className="nav-item">{label}</button>
  );
  return (
    <header className="topnav">
      <div className="topnav-inner">
        <button onClick={() => go("home")} style={{ background: "none", border: 0, padding: 0, cursor: "default" }}>
          <Wordmark />
        </button>
        <nav className="nav-links">
          {item("home", "Browse")}
          {item("map", "Map")}
          {item("compare", `Compare${compareCount ? ` · ${compareCount}` : ""}`)}
          {item("account", `Saved${saved ? ` · ${saved}` : ""}`)}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn-ghost" onClick={() => go("promote")}>For Businesses</button>
          <button className="btn-primary" onClick={() => go("dashboard")}>Dashboard</button>
        </div>
      </div>
    </header>
  );
}

function ParkPhoto({ park, height = 200, mono = true }: { park: Park; height?: number; mono?: boolean }) {
  const initial = park.name.split(" ").slice(0, 2).map((w) => w[0]).join("");
  return (
    <div style={{ height, background: park.image, position: "relative", overflow: "hidden", borderRadius: "inherit" }}>
      <div style={{ position: "absolute", inset: "60% 0 0 0", background: "linear-gradient(180deg, transparent, rgba(0,0,0,.18))" }} />
      {mono && (
        <div style={{ position: "absolute", right: 14, bottom: 10, fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 14, color: "rgba(255,255,255,.82)", letterSpacing: ".05em" }}>
          {initial}
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.08) 1px, transparent 1px)", backgroundSize: "3px 3px", mixBlendMode: "overlay", opacity: 0.55 }} />
    </div>
  );
}

function PromotedBadge({ style = "subtle", sponsor }: { style?: string; sponsor?: Park["sponsor"] }) {
  if (style === "subtle") {
    return <span className="promo-subtle" title="Sponsored placement"><span className="promo-dot" /> SPONSORED</span>;
  }
  if (style === "ribbon") {
    return <div className="promo-ribbon"><span>Featured</span></div>;
  }
  if (style === "halo") {
    return (
      <div className="promo-halo">
        <div className="promo-halo-strip">
          <div className="promo-halo-meta">
            <span className="promo-halo-tag">Sponsored by</span>
            <span className="promo-halo-name">{sponsor?.name}</span>
          </div>
          <span className="promo-halo-cta">{sponsor?.tagline}</span>
        </div>
      </div>
    );
  }
  if (style === "native") {
    return <span className="promo-native"><span className="promo-native-dot">◆</span>Promoted by {sponsor?.name}</span>;
  }
  return null;
}

function ScoreRow({ k, v, compact = false }: { k: string; v: number; compact?: boolean }) {
  return (
    <div className="score-row" data-compact={compact}>
      <span className="score-label"><span className="score-icon">{SCORE_ICON[k]}</span>{SCORE_LABEL[k]}</span>
      <span className="score-track"><span className="score-fill" style={{ width: `${v}%` }} /></span>
      <span className="score-val">{v}</span>
    </div>
  );
}

function ScoreBars({ scores, compact = false }: { scores: Record<string, number>; compact?: boolean }) {
  return (
    <div className="score-bars" data-compact={compact}>
      {Object.keys(scores).map((k) => <ScoreRow key={k} k={k} v={scores[k]} compact={compact} />)}
    </div>
  );
}

function ScoreRing({ value, size = 56 }: { value: number; size?: number }) {
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

function ParkCard({ park, onOpen, onSave, saved, badgeStyle = "subtle", onCompare, inCompare }: {
  park: Park; onOpen: (id: string) => void; onSave: (id: string) => void; saved: boolean;
  badgeStyle?: string; onCompare?: (id: string) => void; inCompare?: boolean;
}) {
  const overall = avgScore(park.scores);
  const showHaloBelow = park.promoted && badgeStyle === "halo";
  return (
    <article className="park-card" data-promoted={park.promoted} data-badge={badgeStyle} onClick={() => onOpen(park.id)}>
      {park.promoted && badgeStyle === "ribbon" && <PromotedBadge style="ribbon" />}
      <div className="park-card-photo">
        <ParkPhoto park={park} height={180} />
        <button className="save-btn" data-saved={saved} onClick={(e) => { e.stopPropagation(); onSave(park.id); }} aria-label="Save park">
          {saved ? "♥" : "♡"}
        </button>
        {onCompare && (
          <button className="compare-btn" data-active={inCompare} onClick={(e) => { e.stopPropagation(); onCompare(park.id); }} aria-label="Add to compare" title={inCompare ? "Remove from compare" : "Add to compare"}>
            {inCompare ? "✓ Comparing" : "⇆ Compare"}
          </button>
        )}
        {park.promoted && badgeStyle === "subtle" && (
          <div className="promo-subtle-wrap"><PromotedBadge style="subtle" /></div>
        )}
      </div>
      <div className="park-card-body">
        <div className="park-card-row">
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="park-card-meta-top">
              {park.neighborhood}<span className="sep">·</span>{park.acres} ac<span className="sep">·</span>{park.fee}
            </div>
            <h3 className="park-card-title">{park.name}</h3>
            {park.promoted && badgeStyle === "native" && <PromotedBadge style="native" sponsor={park.sponsor} />}
          </div>
          <ScoreRing value={overall} />
        </div>
        <p className="park-card-blurb">{park.blurb}</p>
        <ScoreBars scores={park.scores} compact />
        <div className="park-card-foot">
          <span className="rating"><span className="star">★</span> {park.rating}<span className="muted"> ({park.reviews.toLocaleString()})</span></span>
          <span className="muted">{park.crowd}</span>
        </div>
        {showHaloBelow && <PromotedBadge style="halo" sponsor={park.sponsor} />}
      </div>
    </article>
  );
}

function CompareTray({ ids, go, onClear }: { ids: string[]; go: (name: string) => void; onClear: () => void }) {
  const parks = ids.map((id) => PARKS.find((p) => p.id === id)).filter(Boolean) as Park[];
  return (
    <div className="compare-tray">
      <div className="compare-tray-inner">
        <div className="compare-tray-thumbs">
          {parks.map((p, i) => <div key={p.id} className="compare-tray-thumb" style={{ background: p.image, zIndex: 10 - i }} title={p.name} />)}
          {Array.from({ length: 3 - parks.length }).map((_, i) => <div key={`empty-${i}`} className="compare-tray-thumb compare-tray-thumb-empty">+</div>)}
        </div>
        <div className="compare-tray-text">
          <b>{parks.length} park{parks.length === 1 ? "" : "s"} ready to compare</b>
          <span className="muted">{parks.length < 2 ? "Add one more to see them side-by-side" : "Tap to view side-by-side"}</span>
        </div>
        <div className="compare-tray-actions">
          <button className="btn-ghost" onClick={onClear}>Clear</button>
          <button className="btn-primary" onClick={() => go("compare")}>Compare →</button>
        </div>
      </div>
    </div>
  );
}

// ── Ads ────────────────────────────────────────────────────────────────────

let __adIdx = 0;
function pickAd(seed?: number): AdCreative {
  if (typeof seed === "number") return AD_CREATIVES[seed % AD_CREATIVES.length];
  __adIdx = (__adIdx + 1) % AD_CREATIVES.length;
  return AD_CREATIVES[__adIdx];
}

function AdSlot({ format = "leaderboard", seed, className = "" }: { format?: string; seed?: number; className?: string }) {
  const ad = React.useMemo(() => pickAd(seed), [seed]);
  if (format === "native") return <NativeAd ad={ad} />;
  if (format === "anchor") return <AnchorAd ad={ad} />;
  const dims: Record<string, { w: number; h: number }> = {
    leaderboard: { w: 728, h: 90 }, billboard: { w: 970, h: 250 },
    rect: { w: 300, h: 250 }, half: { w: 300, h: 600 }, mobile: { w: 320, h: 50 },
  };
  const d = dims[format] || dims.leaderboard;
  return (
    <div className={`ad-wrap ad-wrap-${format} ${className}`} data-advertiser={ad.advertiser} style={{ maxWidth: d.w, margin: "0 auto" }}>
      <div className="ad-disclosure">
        <span className="ad-disc-label">Ad</span><span className="ad-disc-info">·</span>
        <a className="ad-disc-link">Why this ad?</a><span className="ad-choices" title="AdChoices">▾</span>
      </div>
      <div className={`ad-creative ad-${format}`} style={{ "--ad-color": ad.color, "--ad-accent": ad.accent, minHeight: d.h } as React.CSSProperties}>
        <AdCreativeInner ad={ad} format={format} />
      </div>
    </div>
  );
}

function AdCreativeInner({ ad, format }: { ad: AdCreative; format: string }) {
  if (format === "leaderboard" || format === "mobile") {
    return (<><div className="ad-logo">{ad.logoText}</div><div className="ad-text"><div className="ad-headline">{ad.headline}</div>{format === "leaderboard" && <div className="ad-body">{ad.body}</div>}</div><button className="ad-cta">{ad.cta} →</button></>);
  }
  if (format === "billboard") {
    return (
      <div className="ad-billboard-grid">
        <div className="ad-billboard-left"><div className="ad-logo lg">{ad.logoText}</div><div className="ad-headline" style={{ fontSize: 28, marginTop: 12 }}>{ad.headline}</div><div className="ad-body" style={{ marginTop: 8 }}>{ad.body}</div><button className="ad-cta lg" style={{ marginTop: 16 }}>{ad.cta} →</button></div>
        <div className="ad-billboard-right"><div className="ad-product-mock"><div className="ad-product-mock-shape" /><div className="ad-product-mock-glow" /></div></div>
      </div>
    );
  }
  return (<><div className="ad-rect-top"><div className="ad-logo">{ad.logoText}</div><div className="ad-product-mock small"><div className="ad-product-mock-shape" /></div></div><div className="ad-rect-body"><div className="ad-headline">{ad.headline}</div><div className="ad-body">{ad.body}</div><button className="ad-cta" style={{ marginTop: 12 }}>{ad.cta} →</button></div></>);
}

function NativeAd({ ad }: { ad: AdCreative }) {
  return (
    <article className="park-card ad-native" data-advertiser={ad.advertiser}>
      <div className="park-card-photo">
        <div className="ad-native-photo" style={{ "--ad-color": ad.color, "--ad-accent": ad.accent } as React.CSSProperties}>
          <div className="ad-native-product"><div className="ad-product-mock-shape" /></div>
          <div className="ad-native-corner"><span className="ad-disc-label">Ad</span><span className="ad-choices">▾</span></div>
        </div>
      </div>
      <div className="park-card-body">
        <div className="park-card-meta-top">{ad.advertiser}<span className="sep">·</span>Sponsored<span className="sep">·</span>Why this ad?</div>
        <h3 className="park-card-title">{ad.headline}</h3>
        <p className="park-card-blurb">{ad.body}</p>
        <div className="ad-native-foot">
          <span className="ad-native-domain">{ad.advertiser.toLowerCase().replace(/[^a-z]/g, "")}.com</span>
          <button className="btn-primary" style={{ fontSize: 12 }}>{ad.cta} →</button>
        </div>
      </div>
    </article>
  );
}

function AnchorAd({ ad }: { ad: AdCreative }) {
  const [closed, setClosed] = React.useState(false);
  if (closed) return null;
  return (
    <div className="ad-anchor" style={{ "--ad-color": ad.color, "--ad-accent": ad.accent } as React.CSSProperties}>
      <div className="ad-anchor-inner">
        <div className="ad-anchor-label"><span className="ad-disc-label">Ad</span><span className="ad-choices">▾</span></div>
        <div className="ad-logo">{ad.logoText}</div>
        <div className="ad-text" style={{ flex: 1, minWidth: 0 }}><div className="ad-headline">{ad.headline}</div><div className="ad-body ad-body-anchor">{ad.body}</div></div>
        <button className="ad-cta">{ad.cta} →</button>
        <button className="ad-anchor-close" onClick={() => setClosed(true)} aria-label="Close ad">×</button>
      </div>
    </div>
  );
}

function interleaveAds(items: Park[], density: string) {
  if (density === "off" || !items.length) return items.map((p) => ({ type: "park" as const, park: p }));
  const every = density === "dense" ? 3 : density === "sparse" ? 8 : 4;
  const out: ({ type: "park"; park: Park } | { type: "ad"; seed: number })[] = [];
  let adSeed = 1;
  items.forEach((p, i) => {
    out.push({ type: "park", park: p });
    if ((i + 1) % every === 0 && i < items.length - 1) {
      out.push({ type: "ad", seed: adSeed++ });
    }
  });
  return out;
}

// ── Footer ─────────────────────────────────────────────────────────────────

function Footer({ go }: { go: (name: string) => void }) {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <Wordmark />
          <p className="muted" style={{ maxWidth: 360, marginTop: 12 }}>A field guide to Denver&apos;s off-leash parks and the businesses around them. Independent, ad-supported, dog-tested.</p>
        </div>
        <div><h4>Explore</h4><a onClick={() => go("home")}>All parks</a><a onClick={() => go("map")}>Map view</a><a onClick={() => go("account")}>Saved parks</a></div>
        <div><h4>For businesses</h4><a onClick={() => go("promote")}>Sponsor a park</a><a onClick={() => go("dashboard")}>Sponsor dashboard</a><a>Advertising policy</a></div>
        <div><h4>Sniff</h4><a>About</a><a>How we score</a><a>Contact</a></div>
      </div>
      <div className="site-footer-base">
        <span>© 2026 Sniff Guides, LLC · Denver, CO</span>
        <span>Independently owned · Dogs welcome at the office</span>
      </div>
    </footer>
  );
}

// ── Filter primitives ──────────────────────────────────────────────────────

function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button className="chip" data-active={active} onClick={onClick}><span className="chip-check">{active ? "✓" : "+"}</span>{label}</button>;
}

function SelectChip({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
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

// ── Home screen ────────────────────────────────────────────────────────────

function HomeScreen({ go, savedSet, toggleSave, compareIds, toggleCompare, badgeStyle, adDensity = "standard", showAds = true }: ScreenProps) {
  const [q, setQ] = React.useState("");
  const [size, setSize] = React.useState("any");
  const [fenced, setFenced] = React.useState(false);
  const [water, setWater] = React.useState(false);
  const [free, setFree] = React.useState(false);
  const [sort, setSort] = React.useState("featured");

  const filtered = React.useMemo(() => {
    let list = PARKS.filter((p) => {
      if (q && !`${p.name} ${p.neighborhood}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (size !== "any" && p.size.toLowerCase() !== size) return false;
      if (fenced && !p.fenced) return false;
      if (water && !p.water) return false;
      if (free && p.fee !== "Free") return false;
      return true;
    });
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sort === "score") list = [...list].sort((a, b) => avgScore(b.scores) - avgScore(a.scores));
    else if (sort === "size") list = [...list].sort((a, b) => b.acres - a.acres);
    else list = [...list].sort((a, b) => (Number(b.promoted) - Number(a.promoted)) || avgScore(b.scores) - avgScore(a.scores));
    return list;
  }, [q, size, fenced, water, free, sort]);

  return (
    <div className="screen">
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow"><span className="eyebrow-line" /><span>Spring 2026 · Issue 04</span></div>
          <h1 className="hero-title">The <em>fully scored</em> guide to every<br />off-leash park in <span className="hero-accent">Denver</span>.</h1>
          <p className="hero-sub">12 parks ranked across six things that actually matter — vets, pet stores, cafés, trails, water, and parking. Updated weekly.</p>
          <div className="hero-search">
            <span className="hero-search-icon">⌕</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a park or neighborhood…" />
            <button className="btn-primary" onClick={() => go("map")}>View on map</button>
          </div>
          <div className="hero-stats">
            <div><b>12</b><span>parks scored</span></div>
            <div><b>183</b><span>nearby resources</span></div>
            <div><b>11,840</b><span>reviews indexed</span></div>
          </div>
        </div>
      </section>

      {showAds && <div className="ad-strip"><div className="ad-strip-inner"><AdSlot format="leaderboard" seed={0} /></div></div>}

      <section className="filterbar">
        <div className="filterbar-inner">
          <div className="filterbar-left">
            <SelectChip label="Size" value={size} onChange={setSize} options={[["any","Any size"],["tiny","Tiny"],["small","Small"],["medium","Medium"],["large","Large"],["huge","Huge"]]} />
            <ToggleChip label="Fenced" active={fenced} onClick={() => setFenced(!fenced)} />
            <ToggleChip label="Water access" active={water} onClick={() => setWater(!water)} />
            <ToggleChip label="Free entry" active={free} onClick={() => setFree(!free)} />
            {(size !== "any" || fenced || water || free || q) && (
              <button className="chip chip-clear" onClick={() => { setQ(""); setSize("any"); setFenced(false); setWater(false); setFree(false); }}>Clear all</button>
            )}
          </div>
          <div className="filterbar-right">
            <span className="muted">Sort</span>
            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="score">Sniff Score</option>
              <option value="rating">Rating</option>
              <option value="size">Size</option>
            </select>
          </div>
        </div>
      </section>

      <section className="results">
        <div className="results-head">
          <h2><span style={{ fontFamily: "var(--serif)", fontStyle: "italic" }}>{filtered.length}</span> parks</h2>
          <span className="muted">Denver metro</span>
        </div>
        <div className="park-grid">
          {interleaveAds(filtered, showAds ? adDensity : "off").map((item, i) =>
            item.type === "ad" ? <NativeAd key={`ad-${i}`} ad={AD_CREATIVES[item.seed % AD_CREATIVES.length]} /> : (
              <ParkCard key={item.park.id} park={item.park} onOpen={(id) => go("park", id)} onSave={toggleSave} saved={savedSet.has(item.park.id)} onCompare={toggleCompare} inCompare={compareIds.includes(item.park.id)} badgeStyle={badgeStyle} />
            )
          )}
        </div>
        {filtered.length === 0 && <div className="empty">No parks match those filters. Loosen up.</div>}
        {showAds && filtered.length > 0 && <div style={{ marginTop: 48 }}><AdSlot format="billboard" seed={4} /></div>}
      </section>
      <Footer go={go} />
    </div>
  );
}

// ── Account / Saved screen ─────────────────────────────────────────────────

function AccountScreen({ go, savedSet, toggleSave, compareIds, toggleCompare, badgeStyle, adDensity = "standard", showAds = true }: ScreenProps) {
  const saved = PARKS.filter((p) => savedSet.has(p.id));
  return (
    <div className="screen">
      <section className="page-head"><div className="page-head-inner"><span className="eyebrow">Your account</span><h1 className="page-title">Saved parks</h1><p className="muted" style={{ maxWidth: 520 }}>Pin the parks you visit. Sniff remembers which ones you&apos;ve been to and recommends new ones based on what your dog already loves.</p></div></section>
      {showAds && <div className="ad-strip"><div className="ad-strip-inner"><AdSlot format="leaderboard" seed={2} /></div></div>}
      <section className="results">
        {saved.length === 0 ? (
          <div className="empty empty-large">
            <div style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--ink)", marginBottom: 8 }}>No saves yet.</div>
            <p className="muted" style={{ marginBottom: 18 }}>Tap the heart on any park to keep it here for later.</p>
            <button className="btn-primary" onClick={() => go("home")}>Browse parks</button>
          </div>
        ) : (
          <>
            <div className="results-head"><h2><span style={{ fontFamily: "var(--serif)", fontStyle: "italic" }}>{saved.length}</span> saved</h2></div>
            <div className="park-grid">
              {interleaveAds(saved, showAds ? adDensity : "off").map((item, i) =>
                item.type === "ad" ? <NativeAd key={`ad-${i}`} ad={AD_CREATIVES[item.seed % AD_CREATIVES.length]} /> : (
                  <ParkCard key={item.park.id} park={item.park} onOpen={(id) => go("park", id)} onSave={toggleSave} saved onCompare={toggleCompare} inCompare={compareIds.includes(item.park.id)} badgeStyle={badgeStyle} />
                )
              )}
            </div>
          </>
        )}
      </section>
      <Footer go={go} />
    </div>
  );
}

// ── Map screen ─────────────────────────────────────────────────────────────

function MapScreen({ go, savedSet, toggleSave, badgeStyle, showAds = true }: ScreenProps) {
  const [selectedId, setSelectedId] = React.useState(PARKS[0].id);
  const [hoverId, setHoverId] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");
  const parks = PARKS.filter((p) => !q || `${p.name} ${p.neighborhood}`.toLowerCase().includes(q.toLowerCase()));
  const selected = PARKS.find((p) => p.id === selectedId);

  return (
    <div className="screen map-screen">
      <div className="map-layout">
        <aside className="map-list">
          <div className="map-list-head">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h2 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 26 }}>Denver, mapped</h2>
              <span className="muted" style={{ fontSize: 12 }}>{parks.length} parks</span>
            </div>
            <div className="map-search"><span>⌕</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter the map…" /></div>
          </div>
          <div className="map-list-scroll">
            {parks.map((p) => (
              <button key={p.id} className="map-list-item" data-selected={selectedId === p.id} data-promoted={p.promoted} onClick={() => setSelectedId(p.id)} onMouseEnter={() => setHoverId(p.id)} onMouseLeave={() => setHoverId(null)}>
                <div className="map-list-num">{String(PARKS.indexOf(p) + 1).padStart(2, "0")}</div>
                <div className="map-list-text">
                  <div className="map-list-title">{p.name}{p.promoted && badgeStyle !== "halo" && <span className="map-list-promo">{badgeStyle === "subtle" ? "SPONSORED" : badgeStyle === "ribbon" ? "Featured" : "Promoted"}</span>}</div>
                  <div className="map-list-meta"><span>{p.neighborhood}</span><span>·</span><span><span className="star">★</span> {p.rating}</span><span>·</span><span>Sniff {avgScore(p.scores)}</span></div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <div className="map-canvas-wrap">
          <MapCanvas parks={parks} selectedId={selectedId} hoverId={hoverId} setSelectedId={setSelectedId} setHoverId={setHoverId} badgeStyle={badgeStyle} />
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
                  <button className="btn-primary" style={{ flex: 1 }} onClick={() => go("park", selected.id)}>Open park</button>
                  <button className="btn-ghost-square" onClick={() => toggleSave(selected.id)} aria-label="Save">{savedSet.has(selected.id) ? "♥" : "♡"}</button>
                </div>
              </div>
            </div>
          )}
          {showAds && selected && (
            <div className="ad-rail" style={{ marginTop: 16 }}><span className="ad-rail-label">Advertisement</span><AdSlot format="rect" seed={selected.id.length} /></div>
          )}
        </aside>
      </div>
    </div>
  );
}

function MapCanvas({ parks, selectedId, hoverId, setSelectedId, setHoverId }: { parks: Park[]; selectedId: string; hoverId: string | null; setSelectedId: (id: string) => void; setHoverId: (id: string | null) => void; badgeStyle: string }) {
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
      {parks.map((p) => {
        const isSel = selectedId === p.id;
        const isHov = hoverId === p.id;
        return (
          <button key={p.id} className="map-pin" data-selected={isSel} data-hover={isHov} data-promoted={p.promoted} style={{ left: `${p.coords[0]}%`, top: `${p.coords[1]}%` }} onClick={() => setSelectedId(p.id)} onMouseEnter={() => setHoverId(p.id)} onMouseLeave={() => setHoverId(null)} aria-label={p.name}>
            <span className="map-pin-dot">{p.promoted ? "★" : PARKS.indexOf(p) + 1}</span>
            {(isSel || isHov) && <span className="map-pin-tip"><b>{p.name}</b><span>Sniff {avgScore(p.scores)} · ★ {p.rating}</span></span>}
          </button>
        );
      })}
      <div className="map-legend"><div><span className="map-legend-dot" /> Park</div><div><span className="map-legend-dot map-legend-dot-promo">★</span> Featured sponsor</div></div>
    </div>
  );
}

// ── Park detail screen ─────────────────────────────────────────────────────

const RN_SCENARIOS: Record<string, { label: string; stamp: string; air: number; feels: number; ground: number; aqi: number; aqiCat: string; crowd: number; crowdLabel: string; surface: string; surfaceSub: string; photoMin: number; note: { severity: string; title: string; body: string } | null }> = {
  clear: { label: "Clear day", stamp: "4 min ago", air: 72, feels: 70, ground: 96, aqi: 38, aqiCat: "Good", crowd: 2, crowdLabel: "Moderate", surface: "Firm + dry", surfaceSub: "no rain in 5 days", photoMin: 8, note: null },
  hot: { label: "Hot afternoon", stamp: "2 min ago", air: 94, feels: 98, ground: 138, aqi: 52, aqiCat: "Moderate", crowd: 1, crowdLabel: "Sparse", surface: "Sun-baked dirt", surfaceSub: "shade in W corner only", photoMin: 23, note: { severity: "danger", title: "Asphalt 138°F — paws burn in <60s", body: "Stick to grass paths, or come back after 6:30pm when ground drops below 110°." } },
  smoke: { label: "Wildfire smoke", stamp: "11 min ago", air: 81, feels: 83, ground: 108, aqi: 158, aqiCat: "Unhealthy", crowd: 0, crowdLabel: "Empty", surface: "Dusty · hazy", surfaceSub: "visibility ~1/4 mi", photoMin: 41, note: { severity: "warn", title: "AQI 158 from Williams Fork fire (78 mi NW)", body: "Brachycephalic breeds (Frenchies, pugs, bulldogs) should skip. For others, cap visits at 20 min and watch for cough." } },
  muddy: { label: "After storms", stamp: "16 min ago", air: 58, feels: 55, ground: 62, aqi: 22, aqiCat: "Good", crowd: 1, crowdLabel: "Sparse", surface: "Muddy", surfaceSub: "ankle-deep at the gate", photoMin: 14, note: { severity: "info", title: "Bring boots + a towel", body: "Two cells passed through yesterday. Reservoir trail still pooling — main loop is OK." } },
  cold: { label: "Cold snap", stamp: "31 min ago", air: 24, feels: 11, ground: 22, aqi: 30, aqiCat: "Good", crowd: 0, crowdLabel: "Empty", surface: "Packed snow", surfaceSub: "ice patches by water", photoMin: 96, note: { severity: "info", title: "Ground 22°F — short-coated dogs need booties", body: "Thick-coated breeds fine for 45+ min. Limit Vizslas, greyhounds, and seniors to 20 min." } },
};

function RightNowPanel({ scenario = "clear" }: { park: Park; scenario?: string }) {
  const s = RN_SCENARIOS[scenario] || RN_SCENARIOS.clear;
  const photoStamp = s.photoMin < 60 ? `${s.photoMin}m ago` : `${Math.floor(s.photoMin / 60)}h ${s.photoMin % 60}m`;
  const aqiKey = s.aqiCat.toLowerCase();
  return (
    <div className={`rightnow rightnow-${scenario}`}>
      <div className="rightnow-head">
        <div className="rightnow-head-l"><span className="rightnow-live" aria-hidden="true"><span /></span><span className="rightnow-title">What it&apos;s like right now</span></div>
        <div className="rightnow-head-r"><span className="rightnow-stamp">Updated {s.stamp}</span><button className="rightnow-refresh" aria-label="Refresh">↻</button></div>
      </div>
      <div className="rightnow-tiles">
        <div className="rn-tile"><div className="rn-tile-label">Air</div><div className="rn-big">{s.air}<span>°F</span></div><div className="rn-sub">feels like {s.feels}°</div></div>
        <div className={`rn-tile ${s.ground > 125 ? "rn-tile-warn" : ""}`}><div className="rn-tile-label">Paw temp</div><div className="rn-big" data-hot={s.ground > 125}>{s.ground}<span>°F</span></div><div className="rn-sub" data-tone={s.ground > 125 ? "danger" : s.ground < 30 ? "info" : "ok"}>{s.ground > 125 ? "Will burn" : s.ground < 30 ? "Booties advised" : "Safe"}</div></div>
        <div className={`rn-tile ${s.aqi > 100 ? "rn-tile-warn" : ""}`}><div className="rn-tile-label">Air quality</div><div className="rn-big">{s.aqi}</div><div className="rn-sub" data-aqi={aqiKey}><span className="rn-aqi-dot" data-aqi={aqiKey} /> {s.aqiCat}</div></div>
        <div className="rn-tile"><div className="rn-tile-label">Crowd</div><div className="rn-dots">{[0, 1, 2, 3, 4].map((i) => <span key={i} data-on={i <= s.crowd} />)}</div><div className="rn-sub">{s.crowdLabel} · ~{Math.max(1, s.crowd * 6 + 2)} dogs</div></div>
        <div className="rn-tile rn-tile-text"><div className="rn-tile-label">Surface</div><div className="rn-text">{s.surface}</div><div className="rn-sub">{s.surfaceSub}</div></div>
        <div className="rn-tile rn-tile-photo"><div className="rn-tile-label">Latest photo</div><div className="rn-photo-wrap"><div style={{ width: 52, height: 52, borderRadius: 6, background: "var(--paper-2)" }} /></div><div className="rn-sub">{photoStamp}</div></div>
      </div>
      {s.note && (
        <div className={`rightnow-note rightnow-note-${s.note.severity}`}>
          <span className="rightnow-note-bar" /><div className="rightnow-note-body"><b>{s.note.title}</b><span>{s.note.body}</span></div>
        </div>
      )}
    </div>
  );
}

function findVetsForPark(park: Park, sponsored = true) {
  const vets = EMERGENCY_VETS;
  if (!vets.length) return { primary: null, backup: null, allCount: 0 };
  const MILES_PER_UNIT = 0.4;
  const withDist = vets.map((v) => {
    const dx = v.coords[0] - park.coords[0];
    const dy = v.coords[1] - park.coords[1];
    const distance = Math.sqrt(dx * dx + dy * dy) * MILES_PER_UNIT;
    const driveMin = Math.max(3, Math.round(distance * 3.2));
    return { ...v, distance, driveMin };
  }).sort((a, b) => a.distance - b.distance);
  if (sponsored) {
    const promoted = withDist.find((v) => v.promoted);
    const nearest = withDist[0];
    if (promoted && promoted.distance <= nearest.distance * 2 + 1) {
      const others = withDist.filter((v) => v !== promoted);
      return { primary: promoted, backup: others[0], allCount: withDist.length };
    }
  }
  return { primary: { ...withDist[0], promoted: false }, backup: withDist[1], allCount: withDist.length };
}

function EmergencyVetCard({ park, showPromoted = true }: { park: Park; showPromoted?: boolean }) {
  const [expanded, setExpanded] = React.useState(false);
  const { primary: v, backup, allCount } = findVetsForPark(park, showPromoted);
  if (!v) return null;
  return (
    <div className="emergency-vet">
      <div className="ev-head"><div className="ev-head-l"><span className="ev-cross" aria-hidden="true"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z" /></svg></span><span className="ev-eyebrow">Safety · one tap</span></div><span className="ev-eyebrow-r">{allCount} ER vets &lt; 10 mi</span></div>
      <h3 className="ev-title">Emergency vet</h3>
      <div className="ev-primary">
        <div className="ev-vet-name">{v.name}</div>
        <div className="ev-vet-meta"><span className="ev-vet-dist">{v.distance.toFixed(1)} mi</span><span className="ev-dot">·</span><span>{v.driveMin} min drive</span><span className="ev-dot">·</span><span className="ev-open-now"><span className="ev-pulse" /> Open 24/7</span></div>
        <div className="ev-vet-addr">{v.address}</div>
      </div>
      <a href={`tel:${v.phone.replace(/\D/g, "")}`} className="ev-call-btn">
        <span className="ev-call-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" /></svg></span>
        <span className="ev-call-text"><b>Call now</b><span className="ev-call-num">{v.phone}</span></span><span className="ev-call-arrow" aria-hidden="true">↗</span>
      </a>
      <button className="ev-dir-btn"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-7.58-8-13a8 8 0 0 1 16 0c0 5.42-8 13-8 13z" /><circle cx="12" cy="9" r="2.5" /></svg>Directions in Maps</button>
      {v.promoted && showPromoted && (
        <div className="ev-sponsor"><span className="ev-sponsor-check" aria-hidden="true">✓</span><div className="ev-sponsor-body"><b>{v.sponsor || "Sniff Preferred Partner"}</b><span>{v.tagline}</span></div><a className="ev-sponsor-why" title="Why this partner?">?</a></div>
      )}
      <button className="ev-expand" onClick={() => setExpanded(!expanded)} data-expanded={expanded} aria-expanded={expanded}><span>{expanded ? "Hide backup + checklist" : "Backup vet + emergency checklist"}</span><span className="ev-expand-icon" aria-hidden="true">{expanded ? "–" : "+"}</span></button>
      {expanded && (
        <div className="ev-expanded">
          {backup && <div className="ev-backup"><div className="ev-eyebrow-sm">If primary is at capacity</div><div className="ev-vet-name-sm">{backup.name}</div><div className="ev-vet-meta-sm">{backup.distance.toFixed(1)} mi · {backup.driveMin} min · <a href={`tel:${backup.phone.replace(/\D/g, "")}`}>{backup.phone}</a></div></div>}
          <div className="ev-checklist"><div className="ev-eyebrow-sm">Have ready before you call</div><ul><li>Breed, weight, age</li><li>What happened / what they ingested</li><li>Any medications + allergies</li><li>Your closest cross-street from this park</li></ul></div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, sub, big }: { label: string; value: string | number; sub?: string; big?: boolean }) {
  return <div className="stat"><div className="stat-label">{label}</div><div className="stat-val" data-big={big}>{value}</div>{sub && <div className="stat-sub muted">{sub}</div>}</div>;
}

function SponsorSpot({ sponsor, badgeStyle }: { sponsor: NonNullable<Park["sponsor"]>; badgeStyle: string }) {
  return (
    <div className="sponsor-spot" data-badge={badgeStyle}>
      <div className="sponsor-spot-head">
        <span className="sponsor-spot-tag">
          {badgeStyle === "subtle" && <><span className="promo-dot" /> SPONSORED RESOURCE</>}
          {badgeStyle === "ribbon" && <>★ Featured local business</>}
          {badgeStyle === "halo" && <>Brought to you by</>}
          {badgeStyle === "native" && <>◆ Promoted</>}
        </span>
        <span className="muted" style={{ fontSize: 11 }}>Why am I seeing this?</span>
      </div>
      <div className="sponsor-spot-body">
        <div className="sponsor-spot-logo">{sponsor.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
        <div style={{ flex: 1 }}>
          <div className="sponsor-spot-meta muted">{sponsor.type} · {sponsor.distance}</div>
          <div className="sponsor-spot-name">{sponsor.name}</div>
          <p className="sponsor-spot-tag-line">&ldquo;{sponsor.tagline}&rdquo;</p>
        </div>
        <button className="btn-primary">Visit →</button>
      </div>
    </div>
  );
}

function ParkScreen({ id, go, savedSet, toggleSave, compareIds, toggleCompare, badgeStyle, showAds = true, rightNow = "clear", showPromoted = true }: ScreenProps & { id: string; rightNow?: string; showPromoted?: boolean }) {
  const park = PARKS.find((p) => p.id === id) || PARKS[0];
  const nearby = NEARBY[park.id] || generateNearby(park);
  const reviews = REVIEWS[park.id] || defaultReviews(park);
  const overall = avgScore(park.scores);

  return (
    <div className="screen">
      <div className="crumbs"><a onClick={() => go("home")}>Browse</a><span>›</span><span>{park.neighborhood}</span><span>›</span><span className="ink">{park.name}</span></div>
      <section className="park-hero">
        <div className="park-hero-photo">
          <ParkPhoto park={park} height={420} mono={false} />
          <div className="park-hero-photo-actions">
            {toggleCompare && <button className="compare-btn compare-btn-lg" data-active={compareIds.includes(park.id)} onClick={() => toggleCompare(park.id)}>{compareIds.includes(park.id) ? "✓ In compare" : "⇆ Add to compare"}</button>}
            <button className="save-btn save-btn-lg" data-saved={savedSet.has(park.id)} onClick={() => toggleSave(park.id)}>{savedSet.has(park.id) ? "♥ Saved" : "♡ Save"}</button>
          </div>
        </div>
        <div className="park-hero-meta">
          <div className="eyebrow eyebrow-row"><span>{park.neighborhood}</span><span className="dot-sep">·</span><span>Denver, CO</span></div>
          <h1 className="park-hero-title">{park.name}</h1>
          <p className="park-hero-blurb">{park.blurb}</p>
          <div className="park-hero-stats">
            <Stat label="Sniff Score" value={overall} big />
            <Stat label="Rating" value={`★ ${park.rating}`} sub={`${park.reviews.toLocaleString()} reviews`} />
            <Stat label="Size" value={park.size} sub={`${park.acres} acres`} />
            <Stat label="Fee" value={park.fee} />
          </div>
          <div className="park-hero-tags">
            {park.fenced && <span className="tag">Fully fenced</span>}
            {park.water && <span className="tag">Water access</span>}
            <span className="tag">{park.surface}</span>
            <span className="tag">{park.hours}</span>
          </div>
        </div>
      </section>

      <section className="park-body">
        <div className="park-body-main">
          <RightNowPanel park={park} scenario={rightNow} />
          {showAds && <AdSlot format="leaderboard" seed={park.acres | 0} />}

          <div className="section">
            <div className="section-head"><h2 className="section-title">Sniff Score breakdown</h2><span className="muted">How we rate nearby resources →</span></div>
            <div className="score-cards">
              {Object.entries(park.scores).map(([k, v]) => (
                <div key={k} className="score-card"><div className="score-card-top"><span className="score-card-icon">{SCORE_ICON[k]}</span><span className="score-card-val">{v}</span></div><div className="score-card-label">{SCORE_LABEL[k]}</div><div className="score-card-bar"><span style={{ width: `${v}%` }} /></div></div>
              ))}
            </div>
          </div>

          {park.promoted && park.sponsor && <SponsorSpot sponsor={park.sponsor} badgeStyle={badgeStyle} />}
          {showAds && <AdSlot format="leaderboard" seed={park.id.charCodeAt(0)} />}

          <div className="section">
            <div className="section-head"><h2 className="section-title">What&apos;s nearby</h2><span className="muted">{nearby.length} resources within 1 mi</span></div>
            <div className="nearby-list">
              {nearby.map((n, i) => (
                <div key={i} className="nearby-row" data-promoted={n.promoted}>
                  <span className="nearby-type">{n.type}</span>
                  <div className="nearby-main">
                    <div className="nearby-name">{n.name}{n.promoted && <span className="nearby-promo">{badgeStyle === "subtle" ? "SPONSORED" : badgeStyle === "ribbon" ? "Featured" : badgeStyle === "halo" ? "Sponsor" : "Promoted"}</span>}</div>
                    <div className="nearby-meta">{n.distance} mi · {n.hours}</div>
                  </div>
                  <button className="nearby-cta">Directions ↗</button>
                </div>
              ))}
            </div>
          </div>

          {showAds && <AdSlot format="leaderboard" seed={park.id.charCodeAt(1) || 3} />}

          <div className="section">
            <div className="section-head"><h2 className="section-title">Reviews</h2><span className="muted">★ {park.rating} · {park.reviews.toLocaleString()} ratings</span></div>
            <div className="reviews-list">
              {reviews.map((r, i) => (
                <article key={i} className="review">
                  <div className="review-head"><div><div className="review-user">{r.user}</div><div className="review-dog muted">{r.dog}</div></div><div className="review-meta"><span className="review-stars">{"★".repeat(r.rating)}<span style={{ opacity: .25 }}>{"★".repeat(5 - r.rating)}</span></span><span className="muted">{r.when}</span></div></div>
                  <p className="review-text">{r.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="park-body-side">
          <EmergencyVetCard park={park} showPromoted={showPromoted} />
          <div className="side-card"><h3>Hours & access</h3><div className="side-row"><span className="muted">Hours</span><span>{park.hours}</span></div><div className="side-row"><span className="muted">Fee</span><span>{park.fee}</span></div><div className="side-row"><span className="muted">Crowd</span><span>{park.crowd}</span></div><div className="side-row"><span className="muted">Surface</span><span>{park.surface}</span></div><button className="btn-primary" style={{ width: "100%", marginTop: 10 }}>Get directions</button></div>
          {showAds && <div className="ad-rail"><span className="ad-rail-label">Advertisement</span><AdSlot format="rect" seed={park.id.length} /></div>}
          <div className="side-card side-card-business"><span className="eyebrow">For local businesses</span><h3 style={{ marginTop: 6 }}>Reach the {park.reviews.toLocaleString()} regulars at this park</h3><p className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>Get featured in the &quot;nearby&quot; panel and on the map pin. Pricing from $89/mo.</p><button className="btn-ghost" style={{ width: "100%", marginTop: 8 }} onClick={() => go("promote")}>Sponsor this park →</button></div>
          {showAds && <div className="ad-rail"><span className="ad-rail-label">Advertisement</span><AdSlot format="half" seed={park.id.length + 2} /></div>}
        </aside>
      </section>
      <Footer go={go} />
    </div>
  );
}

// ── Compare screen ─────────────────────────────────────────────────────────

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
  { key: "cafes", label: "Best for a coffee after", pick: (ps: Park[]) => argMax(ps, (p) => p.scores.cafes), tag: (p: Park) => `Café score ${p.scores.cafes}` },
];

function CompareScreen({ go, savedSet, toggleSave, compareIds, setCompareIds }: ScreenProps & { setCompareIds: (ids: string[]) => void }) {
  const [pickerOpen, setPickerOpen] = React.useState<number | null>(null);
  const slots = [0, 1, 2].map((i) => compareIds[i] || null);
  const parks = slots.map((id) => (id ? PARKS.find((p) => p.id === id) || null : null));
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
          const available = PARKS.filter((x) => !slots.filter(Boolean).includes(x.id) || x.id === p?.id);
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
          <div className="cmp-empty"><div className="cmp-empty-mark"><span className="cmp-empty-col">A</span><span className="cmp-empty-vs">vs</span><span className="cmp-empty-col">B</span></div><h3>{filledParks.length === 0 ? "Pick two parks to begin." : "Add one more park to compare."}</h3><p className="muted">Tap a slot above, or browse the full list and add from there.</p><div style={{ display: "flex", gap: 10, marginTop: 18 }}><button className="btn-primary" onClick={() => go("home")}>Browse all parks</button><button className="btn-ghost" onClick={() => go("map")}>View map</button></div></div>
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
      <Footer go={go} />
    </div>
  );
}

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

// ── Business screens ───────────────────────────────────────────────────────

function PromoteScreen({ go, badgeStyle }: { go: (name: string, id?: string) => void; badgeStyle: string }) {
  const [pickedTier, setPickedTier] = React.useState("featured");
  const [pickedPark, setPickedPark] = React.useState("cherry-creek");
  const tiers = [
    { id: "listing", name: "Local Listing", price: 89, summary: "Show up in the 'What's nearby' panel of one park.", perks: ["Listed in 1 park's nearby panel", "Business hours + directions", "Up to 3,000 impressions/mo"] },
    { id: "featured", name: "Featured Sponsor", price: 249, summary: "Top placement on one park's detail page + map pin star.", perks: ["Sponsor card on 1 park's detail page", "Gold star on the map pin", "Tagline + photo + CTA", "Up to 15,000 impressions/mo", "Weekly performance email"], featured: true },
    { id: "neighborhood", name: "Neighborhood Takeover", price: 599, summary: "Featured across every park in one Denver neighborhood.", perks: ["Featured on every park in 1 neighborhood", "Sponsored placement in search results", "Up to 60,000 impressions/mo", "Dedicated account manager", "Quarterly insights report"] },
  ];
  const picked = tiers.find((t) => t.id === pickedTier)!;
  const park = PARKS.find((p) => p.id === pickedPark)!;

  return (
    <div className="screen promote">
      <section className="promote-hero"><div className="promote-hero-inner"><div><span className="eyebrow"><span className="eyebrow-line" /> For local businesses</span><h1 className="promote-title">Be the first thing<br />they see <em>after the walk.</em></h1><p className="promote-sub">Denver dog owners open Sniff before they head to the park — and right after. Sponsor a park to show up exactly when they&apos;re deciding where to grab a coffee, where to take their pup for shots, or which pet store is on the way home.</p><div className="promote-cta-row"><button className="btn-primary btn-lg" onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}>See sponsorship plans</button><button className="btn-ghost btn-lg" onClick={() => go("dashboard")}>View live dashboard →</button></div>
        <div className="promote-trust"><div><b>183</b><span>local businesses sponsoring</span></div><div><b>52k</b><span>monthly active dog owners</span></div><div><b>4.1×</b><span>avg. ROAS reported</span></div></div></div>
        <div className="promote-preview"><div className="promote-preview-label"><span className="promote-preview-dot" /><span>Live preview · how your sponsorship appears</span></div><div className="promote-preview-frame"><ParkCard park={{ ...park, promoted: true, sponsor: park.sponsor || { name: "Your Business", type: "Vet clinic", distance: "0.5 mi", tagline: "Your tagline here — 12 words or less converts best." } }} onOpen={() => {}} onSave={() => {}} saved={false} badgeStyle={badgeStyle} /></div>
        <div className="promote-preview-pickers"><label>Preview park<select value={pickedPark} onChange={(e) => setPickedPark(e.target.value)}>{PARKS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><span className="muted" style={{ fontSize: 11 }}>Badge style controlled by Tweaks panel →</span></div></div>
      </div></section>

      <section className="how"><div className="how-inner"><h2 className="section-title-xl">Three places your business shows up.</h2><div className="how-grid">
        <div className="how-card"><span className="how-num">01</span><h3>Park detail page</h3><p className="muted">A featured card above the &quot;What&apos;s nearby&quot; list, with your logo, tagline, and a direct CTA.</p><div className="how-mock"><div className="how-mock-line" /><div className="how-mock-card">★ Cherry Creek Veterinary</div><div className="how-mock-line" /><div className="how-mock-line" style={{ width: "60%" }} /></div></div>
        <div className="how-card"><span className="how-num">02</span><h3>Map pin</h3><p className="muted">Your sponsored park is marked with a gold star on the map — visible the moment someone opens Denver.</p><div className="how-mock how-mock-map"><span className="how-mock-pin">★</span><span className="how-mock-pin small" style={{ top: 22, left: 70 }}>•</span><span className="how-mock-pin small" style={{ top: 60, left: 30 }}>•</span></div></div>
        <div className="how-card"><span className="how-num">03</span><h3>Nearby panel</h3><p className="muted">Pinned to the top of the resources list, highlighted with a sponsored tag and a directions button.</p><div className="how-mock"><div className="how-mock-row" data-promo="true"><span>★</span> Your business · 0.3 mi</div><div className="how-mock-row">Other vet · 0.7 mi</div><div className="how-mock-row">Pet store · 0.9 mi</div></div></div>
      </div></div></section>

      <section className="plans" id="plans"><div className="plans-inner"><h2 className="section-title-xl">Pick a plan.</h2><p className="muted" style={{ marginBottom: 28, maxWidth: 500 }}>All plans are month-to-month. Cancel anytime. First 14 days are free — you only pay if you renew.</p><div className="plans-grid">
        {tiers.map((t) => (
          <div key={t.id} className="plan-card" data-featured={"featured" in t && t.featured} data-picked={pickedTier === t.id}>{"featured" in t && t.featured && <div className="plan-feat">Most picked</div>}<h3 className="plan-name">{t.name}</h3><div className="plan-price"><span className="plan-price-num">${t.price}</span><span className="plan-price-unit">/mo</span></div><p className="plan-summary">{t.summary}</p><ul className="plan-perks">{t.perks.map((p, i) => <li key={i}><span>✓</span> {p}</li>)}</ul><button className={pickedTier === t.id ? "btn-primary" : "btn-ghost"} style={{ width: "100%" }} onClick={() => setPickedTier(t.id)}>{pickedTier === t.id ? "Selected" : "Choose"}</button></div>
        ))}
      </div></div></section>

      <section className="checkout"><div className="checkout-inner"><div className="checkout-left"><span className="eyebrow">Almost there</span><h2 style={{ fontFamily: "var(--serif)", fontSize: 38, lineHeight: 1.05, margin: "8px 0 16px" }}>Start your <em>{picked.name}</em> sponsorship.</h2><p className="muted" style={{ marginBottom: 24 }}>We&apos;ll set you up in under 5 minutes. First two weeks are free; cancel anytime from your dashboard.</p>
        <form className="checkout-form" onSubmit={(e) => { e.preventDefault(); go("dashboard"); }}><label>Business name<input defaultValue="Cherry Creek Veterinary Hospital" /></label><label>Business type<select defaultValue="vet"><option value="vet">Vet clinic</option><option value="store">Pet store</option><option value="cafe">Café / restaurant</option><option value="bar">Bar with patio</option><option value="groom">Grooming</option><option value="daycare">Daycare / boarding</option></select></label><label>Park to sponsor<select value={pickedPark} onChange={(e) => setPickedPark(e.target.value)}>{PARKS.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.neighborhood}</option>)}</select></label><label>Your tagline <span className="muted" style={{ fontWeight: 400 }}>(shown under your business name)</span><input defaultValue="Same-day visits for park regulars — flash your check-in." maxLength={80} /></label><button type="submit" className="btn-primary btn-lg" style={{ width: "100%", marginTop: 4 }}>Start 14-day free trial → ${picked.price}/mo after</button><p className="muted" style={{ fontSize: 11, textAlign: "center" }}>No charge today. We&apos;ll email a reminder 3 days before billing starts.</p></form></div>
        <aside className="checkout-summary"><h4>Your order</h4><div className="cs-row"><span>{picked.name}</span><span>${picked.price}/mo</span></div><div className="cs-row muted"><span>{park.name}</span><span>{park.neighborhood}</span></div><div className="cs-divider" /><div className="cs-row"><span>First 14 days</span><span><b>Free</b></span></div><div className="cs-row"><span>Then</span><span>${picked.price}.00 / mo</span></div><div className="cs-divider" /><div className="cs-row cs-row-total"><span>Due today</span><span>$0.00</span></div><p className="muted" style={{ fontSize: 11, marginTop: 12 }}>By starting your trial you agree to the Sniff Sponsor terms. We never run more than one sponsor per park at a time — you&apos;ll get exclusive placement.</p></aside>
      </div></section>
      <Footer go={go} />
    </div>
  );
}

function DashboardScreen({ go }: { go: (name: string, id?: string) => void; badgeStyle: string }) {
  const d = DASHBOARD;
  const [range, setRange] = React.useState("30d");
  return (
    <div className="screen dashboard">
      <section className="dash-head"><div className="dash-head-inner"><div><span className="eyebrow">Sponsor dashboard</span><h1 className="page-title">{d.business}</h1><div className="muted" style={{ marginTop: 4 }}>{d.plan} · ${d.monthly}/mo · Sponsoring {d.parks.length} parks</div></div><div className="dash-head-right"><div className="seg">{["7d", "30d", "90d"].map((r) => <button key={r} data-active={range === r} onClick={() => setRange(r)}>{r}</button>)}</div><button className="btn-ghost">Pause campaign</button><button className="btn-primary">Add new sponsorship</button></div></div></section>
      <section className="dash-body">
        <div className="dash-metrics">
          <Metric label="Impressions" value={d.metrics.impressions.toLocaleString()} delta={d.metrics.impressionsDelta} />
          <Metric label="Clicks" value={d.metrics.clicks.toLocaleString()} delta={d.metrics.clicksDelta} />
          <Metric label="Saves" value={d.metrics.saves.toLocaleString()} delta={d.metrics.savesDelta} />
          <Metric label="CPM" value={`$${d.metrics.cpm.toFixed(2)}`} delta={-0.05} />
        </div>
        <div className="dash-grid">
          <div className="dash-card dash-chart"><div className="dash-card-head"><div><h3>Impressions over time</h3><span className="muted">Last 30 days</span></div><div className="dash-legend"><span><span className="dash-legend-sw" style={{ background: "var(--forest)" }} /> Impressions</span><span><span className="dash-legend-sw" style={{ background: "var(--sunset)" }} /> Clicks</span></div></div><Chart series={d.daily} /></div>
          <div className="dash-card dash-parks"><div className="dash-card-head"><h3>Parks you sponsor</h3><a className="muted small-link" onClick={() => go("promote")}>+ Add park</a></div>{d.parks.map((name) => { const p = PARKS.find((x) => x.name === name); if (!p) return null; return <div key={p.id} className="dash-park" onClick={() => go("park", p.id)}><div className="dash-park-thumb"><ParkPhoto park={p} height={56} /></div><div style={{ flex: 1, minWidth: 0 }}><div className="dash-park-name">{p.name}</div><div className="dash-park-meta muted">Featured · {(Math.random() * 12000 + 4000 | 0).toLocaleString()} imp · ★ {p.rating}</div></div><span className="dash-park-status">Live</span></div>; })}<button className="btn-ghost" style={{ width: "100%", marginTop: 10 }} onClick={() => go("promote")}>Browse parks to sponsor</button></div>
          <div className="dash-card dash-activity"><div className="dash-card-head"><h3>Recent activity</h3><span className="muted">Live</span></div><ul className="activity-list">{d.recent.map((r, i) => <li key={i}><span className="activity-dot" /><div style={{ flex: 1 }}><div><b>{r.action}</b> from {r.source}</div><div className="muted" style={{ fontSize: 12 }}>{r.when}</div></div></li>)}</ul></div>
          <div className="dash-card dash-creative"><div className="dash-card-head"><h3>Creative</h3><a className="muted small-link">Edit</a></div><div className="dash-creative-preview"><div className="sponsor-spot-logo">CC</div><div style={{ flex: 1 }}><div className="muted" style={{ fontSize: 11 }}>Vet clinic · 0.4 mi</div><div style={{ fontFamily: "var(--serif)", fontSize: 18, marginTop: 2 }}>Cherry Creek Veterinary Hospital</div><p style={{ fontSize: 13, color: "var(--ink)", margin: "6px 0 0", fontStyle: "italic" }}>&ldquo;24/7 emergency care, 4 min from the south gate.&rdquo;</p></div></div><div className="dash-creative-meta muted" style={{ marginTop: 12, fontSize: 12 }}>Last updated 4 days ago · Approved by Sniff editorial</div></div>
        </div>
      </section>
      <Footer go={go} />
    </div>
  );
}

function Metric({ label, value, delta }: { label: string; value: string; delta: number }) {
  const pos = delta >= 0;
  return <div className="metric"><div className="metric-label muted">{label}</div><div className="metric-val">{value}</div><div className={"metric-delta " + (pos ? "pos" : "neg")}>{pos ? "▲" : "▼"} {(Math.abs(delta) * 100).toFixed(1)}%<span className="muted" style={{ marginLeft: 6 }}>vs prev</span></div></div>;
}

function Chart({ series }: { series: number[] }) {
  const w = 760, h = 220, pad = 28;
  const max = Math.max(...series) * 1.15;
  const step = (w - pad * 2) / (series.length - 1);
  const pts = series.map((v, i) => [pad + i * step, h - pad - (v / max) * (h - pad * 2)]);
  const path = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = path + ` L ${pad + (series.length - 1) * step} ${h - pad} L ${pad} ${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="chart-svg" preserveAspectRatio="none">
      <defs><linearGradient id="chartfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--forest)" stopOpacity=".24" /><stop offset="1" stopColor="var(--forest)" stopOpacity="0" /></linearGradient></defs>
      {[0, 1, 2, 3].map((i) => <line key={i} x1={pad} x2={w - pad} y1={pad + i * ((h - pad * 2) / 3)} y2={pad + i * ((h - pad * 2) / 3)} stroke="rgba(31,58,46,.08)" strokeWidth="1" />)}
      <path d={area} fill="url(#chartfill)" /><path d={path} fill="none" stroke="var(--forest)" strokeWidth="2" strokeLinejoin="round" />
      {pts.map(([x, y], i) => i % 3 === 0 && <circle key={i} cx={x} cy={y} r="2.5" fill="var(--forest)" />)}
      {[0, Math.floor(series.length / 2), series.length - 1].map((i) => <text key={i} x={pad + i * step} y={h - 6} fontSize="10" fill="var(--stone)" textAnchor="middle">{i === 0 ? "30d ago" : i === series.length - 1 ? "Today" : "15d"}</text>)}
    </svg>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────

interface ScreenProps {
  go: (name: string, id?: string) => void;
  savedSet: Set<string>;
  toggleSave: (id: string) => void;
  compareIds: string[];
  toggleCompare: (id: string) => void;
  badgeStyle: string;
  adDensity?: string;
  showAds?: boolean;
}

// ── Root app ──────────────────────────────────────────────────────────────

export default function SniffApp() {
  const [route, setRoute] = React.useState<{ name: string; id: string | null }>({ name: "home", id: null });
  const [savedSet, setSavedSet] = React.useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try { return new Set(JSON.parse(localStorage.getItem("sniff:saved") || "[]")); } catch { return new Set(); }
  });
  const [compareIds, setCompareIds] = React.useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("sniff:compare") || "[]"); } catch { return []; }
  });

  const badgeStyle = "halo";
  const showAds = true;
  const adDensity = "standard";
  const rightNow = "hot";
  const showPromoted = true;

  React.useEffect(() => { localStorage.setItem("sniff:saved", JSON.stringify([...savedSet])); }, [savedSet]);
  React.useEffect(() => { localStorage.setItem("sniff:compare", JSON.stringify(compareIds)); }, [compareIds]);

  React.useEffect(() => {
    const [forest, sunset, paper] = ["#2E3D38", "#BC8A6F", "#DCE4DE"];
    document.documentElement.style.setProperty("--forest", forest);
    document.documentElement.style.setProperty("--sunset", sunset);
    document.documentElement.style.setProperty("--paper", paper);
  }, []);

  React.useEffect(() => {
    document.body.dataset.anchorAd = (showAds ? "true" : "false");
  }, [showAds]);

  function go(name: string, id?: string) {
    setRoute({ name, id: id || null });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function toggleSave(id: string) {
    setSavedSet((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }
  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }

  const screenProps: ScreenProps = { go, savedSet, toggleSave, compareIds, toggleCompare, badgeStyle, showAds, adDensity };

  return (
    <div data-screen-label={`${route.name}${route.id ? " · " + route.id : ""}`}>
      <TopNav route={route.name} go={go} saved={savedSet.size} compareCount={compareIds.length} />

      {route.name === "home" && <HomeScreen {...screenProps} />}
      {route.name === "map" && <MapScreen {...screenProps} />}
      {route.name === "compare" && <CompareScreen {...screenProps} setCompareIds={setCompareIds} />}
      {route.name === "park" && <ParkScreen id={route.id || "cherry-creek"} {...screenProps} rightNow={rightNow} showPromoted={showPromoted} />}
      {route.name === "promote" && <PromoteScreen go={go} badgeStyle={badgeStyle} />}
      {route.name === "dashboard" && <DashboardScreen go={go} badgeStyle={badgeStyle} />}
      {route.name === "account" && <AccountScreen {...screenProps} />}

      {showAds && route.name !== "promote" && route.name !== "dashboard" && <AnchorAd ad={AD_CREATIVES[5]} />}
      {compareIds.length > 0 && route.name !== "compare" && <CompareTray ids={compareIds} go={go} onClear={() => setCompareIds([])} />}
    </div>
  );
}
