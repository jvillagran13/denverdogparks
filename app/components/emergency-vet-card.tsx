"use client";

import React from "react";
import type { Park, EmergencyVet } from "@/app/data";

function findVetsForPark(park: Park, vets: EmergencyVet[], sponsored = true) {
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

export default function EmergencyVetCard({ park, vets, showPromoted = true }: { park: Park; vets: EmergencyVet[]; showPromoted?: boolean }) {
  const [expanded, setExpanded] = React.useState(false);
  const { primary: v, backup, allCount } = findVetsForPark(park, vets, showPromoted);
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
