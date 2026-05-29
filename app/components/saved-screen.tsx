"use client";

import { useRouter } from "next/navigation";
import { useAppState } from "./providers";
import ParkCard from "./park-card";
import { AdSlot, NativeAd, interleaveAds } from "./ad-slot";
import Footer from "./footer";
import type { Park, AdCreative } from "@/app/data";

export default function SavedScreen({ parks, ads }: { parks: Park[]; ads: AdCreative[] }) {
  const router = useRouter();
  const { savedSet, showAds, adDensity } = useAppState();
  const saved = parks.filter((p) => savedSet.has(p.id));

  return (
    <div className="screen">
      <section className="page-head"><div className="page-head-inner"><span className="eyebrow">Your account</span><h1 className="page-title">Saved parks</h1><p className="muted" style={{ maxWidth: 520 }}>Pin the parks you visit. Sniff remembers which ones you&apos;ve been to and recommends new ones based on what your dog already loves.</p></div></section>
      {showAds && <div className="ad-strip"><div className="ad-strip-inner"><AdSlot format="leaderboard" seed={2} ads={ads} /></div></div>}
      <section className="results">
        {saved.length === 0 ? (
          <div className="empty empty-large">
            <div style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--ink)", marginBottom: 8 }}>No saves yet.</div>
            <p className="muted" style={{ marginBottom: 18 }}>Tap the heart on any park to keep it here for later.</p>
            <button className="btn-primary" onClick={() => router.push("/")}>Browse parks</button>
          </div>
        ) : (
          <>
            <div className="results-head"><h2><span style={{ fontFamily: "var(--serif)", fontStyle: "italic" }}>{saved.length}</span> saved</h2></div>
            <div className="park-grid">
              {interleaveAds(saved, showAds ? adDensity : "off").map((item, i) =>
                item.type === "ad" ? <NativeAd key={`ad-${i}`} ad={ads[item.seed % ads.length]} /> : (
                  <ParkCard key={item.park.id} park={item.park} />
                )
              )}
            </div>
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}
