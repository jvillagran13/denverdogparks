"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "./providers";
import ParkCard from "./park-card";
import { AdSlot, NativeAd, interleaveAds } from "./ad-slot";
import { ToggleChip, SelectChip } from "./filter-bar";
import Footer from "./footer";
import { avgScore, type Park, type AdCreative } from "@/app/data";

export default function HomeScreen({ parks, ads }: { parks: Park[]; ads: AdCreative[] }) {
  const router = useRouter();
  const { showAds, adDensity } = useAppState();
  const [q, setQ] = React.useState("");
  const [size, setSize] = React.useState("any");
  const [fenced, setFenced] = React.useState(false);
  const [water, setWater] = React.useState(false);
  const [free, setFree] = React.useState(false);
  const [sort, setSort] = React.useState("featured");

  const filtered = React.useMemo(() => {
    let list = parks.filter((p) => {
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
  }, [parks, q, size, fenced, water, free, sort]);

  return (
    <div className="screen">
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow"><span className="eyebrow-line" /><span>Spring 2026 · Issue 04</span></div>
          <h1 className="hero-title">The <em>fully scored</em> guide to every<br />off-leash park in <span className="hero-accent">Denver</span>.</h1>
          <p className="hero-sub">12 parks ranked across six things that actually matter — vets, pet stores, cafes, trails, water, and parking. Updated weekly.</p>
          <div className="hero-search">
            <span className="hero-search-icon">⌕</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a park or neighborhood…" />
            <button className="btn-primary" onClick={() => router.push("/map")}>View on map</button>
          </div>
          <div className="hero-stats">
            <div><b>12</b><span>parks scored</span></div>
            <div><b>183</b><span>nearby resources</span></div>
            <div><b>11,840</b><span>reviews indexed</span></div>
          </div>
        </div>
      </section>

      {showAds && <div className="ad-strip"><div className="ad-strip-inner"><AdSlot format="leaderboard" seed={0} ads={ads} /></div></div>}

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
            item.type === "ad" ? <NativeAd key={`ad-${i}`} ad={ads[item.seed % ads.length]} /> : (
              <ParkCard key={item.park.id} park={item.park} />
            )
          )}
        </div>
        {filtered.length === 0 && <div className="empty">No parks match those filters. Loosen up.</div>}
        {showAds && filtered.length > 0 && <div style={{ marginTop: 48 }}><AdSlot format="billboard" seed={4} ads={ads} /></div>}
      </section>
      <Footer />
    </div>
  );
}
