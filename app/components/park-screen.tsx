"use client";

import Link from "next/link";
import { useAppState } from "./providers";
import { ParkPhoto, PromotedBadge } from "./park-card";
import { ScoreBars } from "./score-bars";
import { AdSlot } from "./ad-slot";
import RightNowPanel from "./right-now-panel";
import SponsorSpot from "./sponsor-spot";
import EmergencyVetCard from "./emergency-vet-card";
import Footer from "./footer";
import { SCORE_ICON, SCORE_LABEL, avgScore, type Park, type EmergencyVet, type AdCreative } from "@/app/data";

function Stat({ label, value, sub, big }: { label: string; value: string | number; sub?: string; big?: boolean }) {
  return <div className="stat"><div className="stat-label">{label}</div><div className="stat-val" data-big={big}>{value}</div>{sub && <div className="stat-sub muted">{sub}</div>}</div>;
}

export default function ParkScreen({ park, nearby, reviews, vets, ads }: {
  park: Park;
  nearby: { name: string; type: string; distance: number; promoted: boolean; hours: string }[];
  reviews: { user: string; dog: string; rating: number; when: string; text: string }[];
  vets: EmergencyVet[];
  ads: AdCreative[];
}) {
  const { savedSet, toggleSave, compareIds, toggleCompare, badgeStyle, showAds, rightNow, showPromoted } = useAppState();
  const overall = avgScore(park.scores);

  return (
    <div className="screen">
      <div className="crumbs"><Link href="/">Browse</Link><span>›</span><span>{park.neighborhood}</span><span>›</span><span className="ink">{park.name}</span></div>
      <section className="park-hero">
        <div className="park-hero-photo">
          <ParkPhoto park={park} height={420} mono={false} />
          <div className="park-hero-photo-actions">
            <button className="compare-btn compare-btn-lg" data-active={compareIds.includes(park.id)} onClick={() => toggleCompare(park.id)}>{compareIds.includes(park.id) ? "✓ In compare" : "⇆ Add to compare"}</button>
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
          {showAds && <AdSlot format="leaderboard" seed={park.acres | 0} ads={ads} />}

          <div className="section">
            <div className="section-head"><h2 className="section-title">Sniff Score breakdown</h2><span className="muted">How we rate nearby resources →</span></div>
            <div className="score-cards">
              {Object.entries(park.scores).map(([k, v]) => (
                <div key={k} className="score-card"><div className="score-card-top"><span className="score-card-icon">{SCORE_ICON[k]}</span><span className="score-card-val">{v}</span></div><div className="score-card-label">{SCORE_LABEL[k]}</div><div className="score-card-bar"><span style={{ width: `${v}%` }} /></div></div>
              ))}
            </div>
          </div>

          {park.promoted && park.sponsor && <SponsorSpot sponsor={park.sponsor} badgeStyle={badgeStyle} />}
          {showAds && <AdSlot format="leaderboard" seed={park.id.charCodeAt(0)} ads={ads} />}

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

          {showAds && <AdSlot format="leaderboard" seed={park.id.charCodeAt(1) || 3} ads={ads} />}

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
          <EmergencyVetCard park={park} vets={vets} showPromoted={showPromoted} />
          <div className="side-card"><h3>Hours & access</h3><div className="side-row"><span className="muted">Hours</span><span>{park.hours}</span></div><div className="side-row"><span className="muted">Fee</span><span>{park.fee}</span></div><div className="side-row"><span className="muted">Crowd</span><span>{park.crowd}</span></div><div className="side-row"><span className="muted">Surface</span><span>{park.surface}</span></div><button className="btn-primary" style={{ width: "100%", marginTop: 10 }}>Get directions</button></div>
          {showAds && <div className="ad-rail"><span className="ad-rail-label">Advertisement</span><AdSlot format="rect" seed={park.id.length} ads={ads} /></div>}
          <div className="side-card side-card-business"><span className="eyebrow">For local businesses</span><h3 style={{ marginTop: 6 }}>Reach the {park.reviews.toLocaleString()} regulars at this park</h3><p className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>Get featured in the &quot;nearby&quot; panel and on the map pin. Pricing from $89/mo.</p><Link href="/business" className="btn-ghost" style={{ width: "100%", marginTop: 8, display: "block", textAlign: "center" }}>Sponsor this park →</Link></div>
          {showAds && <div className="ad-rail"><span className="ad-rail-label">Advertisement</span><AdSlot format="half" seed={park.id.length + 2} ads={ads} /></div>}
        </aside>
      </section>
      <Footer />
    </div>
  );
}
