"use client";

import React from "react";
import type { AdCreative, Park } from "@/app/data";

let __adIdx = 0;
export function pickAd(ads: AdCreative[], seed?: number): AdCreative {
  if (!ads.length) return { advertiser: "", headline: "", cta: "", color: "#333", accent: "#fff", logoText: "", body: "" };
  if (typeof seed === "number") return ads[seed % ads.length];
  __adIdx = (__adIdx + 1) % ads.length;
  return ads[__adIdx];
}

export function AdSlot({ format = "leaderboard", seed, className = "", ads }: { format?: string; seed?: number; className?: string; ads: AdCreative[] }) {
  const ad = React.useMemo(() => pickAd(ads, seed), [ads, seed]);
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

export function NativeAd({ ad }: { ad: AdCreative }) {
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

export function AnchorAd({ ad }: { ad: AdCreative }) {
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

export function interleaveAds(items: Park[], density: string) {
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
