"use client";

import { useRouter } from "next/navigation";
import { useAppState } from "./providers";
import { ScoreBars } from "./score-bars";
import { ScoreRing } from "./score-bars";
import { avgScore, type Park } from "@/app/data";

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

export { ParkPhoto };

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

export { PromotedBadge };

export default function ParkCard({ park }: { park: Park }) {
  const router = useRouter();
  const { savedSet, toggleSave, compareIds, toggleCompare, badgeStyle } = useAppState();
  const overall = avgScore(park.scores);
  const saved = savedSet.has(park.id);
  const inCompare = compareIds.includes(park.id);
  const showHaloBelow = park.promoted && badgeStyle === "halo";

  return (
    <article className="park-card" data-promoted={park.promoted} data-badge={badgeStyle} onClick={() => router.push(`/parks/${park.id}`)}>
      {park.promoted && badgeStyle === "ribbon" && <PromotedBadge style="ribbon" />}
      <div className="park-card-photo">
        <ParkPhoto park={park} height={180} />
        <button className="save-btn" data-saved={saved} onClick={(e) => { e.stopPropagation(); toggleSave(park.id); }} aria-label="Save park">
          {saved ? "♥" : "♡"}
        </button>
        <button className="compare-btn" data-active={inCompare} onClick={(e) => { e.stopPropagation(); toggleCompare(park.id); }} aria-label="Add to compare" title={inCompare ? "Remove from compare" : "Add to compare"}>
          {inCompare ? "✓ Comparing" : "⇆ Compare"}
        </button>
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
