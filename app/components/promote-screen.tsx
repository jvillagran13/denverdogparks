"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "./providers";
import ParkCard from "./park-card";
import { ParkPhoto } from "./park-card";
import Footer from "./footer";
import type { Park } from "@/app/data";

export default function PromoteScreen({ parks }: { parks: Park[] }) {
  const router = useRouter();
  const { badgeStyle } = useAppState();
  const [pickedTier, setPickedTier] = React.useState("featured");
  const [pickedPark, setPickedPark] = React.useState(parks[0]?.id || "cherry-creek");
  const tiers = [
    { id: "listing", name: "Local Listing", price: 89, summary: "Show up in the 'What's nearby' panel of one park.", perks: ["Listed in 1 park's nearby panel", "Business hours + directions", "Up to 3,000 impressions/mo"] },
    { id: "featured", name: "Featured Sponsor", price: 249, summary: "Top placement on one park's detail page + map pin star.", perks: ["Sponsor card on 1 park's detail page", "Gold star on the map pin", "Tagline + photo + CTA", "Up to 15,000 impressions/mo", "Weekly performance email"], featured: true },
    { id: "neighborhood", name: "Neighborhood Takeover", price: 599, summary: "Featured across every park in one Denver neighborhood.", perks: ["Featured on every park in 1 neighborhood", "Sponsored placement in search results", "Up to 60,000 impressions/mo", "Dedicated account manager", "Quarterly insights report"] },
  ];
  const picked = tiers.find((t) => t.id === pickedTier)!;
  const park = parks.find((p) => p.id === pickedPark) || parks[0];

  return (
    <div className="screen promote">
      <section className="promote-hero"><div className="promote-hero-inner"><div><span className="eyebrow"><span className="eyebrow-line" /> For local businesses</span><h1 className="promote-title">Be the first thing<br />they see <em>after the walk.</em></h1><p className="promote-sub">Denver dog owners open Sniff before they head to the park — and right after. Sponsor a park to show up exactly when they&apos;re deciding where to grab a coffee, where to take their pup for shots, or which pet store is on the way home.</p><div className="promote-cta-row"><button className="btn-primary btn-lg" onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}>See sponsorship plans</button><button className="btn-ghost btn-lg" onClick={() => router.push("/dashboard")}>View live dashboard →</button></div>
        <div className="promote-trust"><div><b>183</b><span>local businesses sponsoring</span></div><div><b>52k</b><span>monthly active dog owners</span></div><div><b>4.1×</b><span>avg. ROAS reported</span></div></div></div>
        <div className="promote-preview"><div className="promote-preview-label"><span className="promote-preview-dot" /><span>Live preview · how your sponsorship appears</span></div><div className="promote-preview-frame"><ParkCard park={{ ...park, promoted: true, sponsor: park.sponsor || { name: "Your Business", type: "Vet clinic", distance: "0.5 mi", tagline: "Your tagline here — 12 words or less converts best." } }} /></div>
        <div className="promote-preview-pickers"><label>Preview park<select value={pickedPark} onChange={(e) => setPickedPark(e.target.value)}>{parks.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><span className="muted" style={{ fontSize: 11 }}>Badge style controlled by Tweaks panel →</span></div></div>
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
        <form className="checkout-form" onSubmit={(e) => { e.preventDefault(); router.push("/dashboard"); }}><label>Business name<input defaultValue="Cherry Creek Veterinary Hospital" /></label><label>Business type<select defaultValue="vet"><option value="vet">Vet clinic</option><option value="store">Pet store</option><option value="cafe">Cafe / restaurant</option><option value="bar">Bar with patio</option><option value="groom">Grooming</option><option value="daycare">Daycare / boarding</option></select></label><label>Park to sponsor<select value={pickedPark} onChange={(e) => setPickedPark(e.target.value)}>{parks.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.neighborhood}</option>)}</select></label><label>Your tagline <span className="muted" style={{ fontWeight: 400 }}>(shown under your business name)</span><input defaultValue="Same-day visits for park regulars — flash your check-in." maxLength={80} /></label><button type="submit" className="btn-primary btn-lg" style={{ width: "100%", marginTop: 4 }}>Start 14-day free trial → ${picked.price}/mo after</button><p className="muted" style={{ fontSize: 11, textAlign: "center" }}>No charge today. We&apos;ll email a reminder 3 days before billing starts.</p></form></div>
        <aside className="checkout-summary"><h4>Your order</h4><div className="cs-row"><span>{picked.name}</span><span>${picked.price}/mo</span></div><div className="cs-row muted"><span>{park.name}</span><span>{park.neighborhood}</span></div><div className="cs-divider" /><div className="cs-row"><span>First 14 days</span><span><b>Free</b></span></div><div className="cs-row"><span>Then</span><span>${picked.price}.00 / mo</span></div><div className="cs-divider" /><div className="cs-row cs-row-total"><span>Due today</span><span>$0.00</span></div><p className="muted" style={{ fontSize: 11, marginTop: 12 }}>By starting your trial you agree to the Sniff Sponsor terms. We never run more than one sponsor per park at a time — you&apos;ll get exclusive placement.</p></aside>
      </div></section>
      <Footer />
    </div>
  );
}
