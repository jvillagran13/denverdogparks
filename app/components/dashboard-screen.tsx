"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ParkPhoto } from "./park-card";
import Footer from "./footer";
import type { Park } from "@/app/data";

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

interface DashboardData {
  business: string;
  plan: string;
  monthly: number;
  parks: string[];
  metrics: {
    impressions: number;
    impressionsDelta: number;
    clicks: number;
    clicksDelta: number;
    saves: number;
    savesDelta: number;
    cpm: number;
  };
  daily: number[];
  recent: { when: string; action: string; source: string }[];
}

export default function DashboardScreen({ parks, dashboard }: { parks: Park[]; dashboard: DashboardData }) {
  const router = useRouter();
  const d = dashboard;
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
          <div className="dash-card dash-parks"><div className="dash-card-head"><h3>Parks you sponsor</h3><a className="muted small-link" onClick={() => router.push("/business")}>+ Add park</a></div>{d.parks.map((name) => { const p = parks.find((x) => x.name === name); if (!p) return null; return <div key={p.id} className="dash-park" onClick={() => router.push(`/parks/${p.id}`)}><div className="dash-park-thumb"><ParkPhoto park={p} height={56} /></div><div style={{ flex: 1, minWidth: 0 }}><div className="dash-park-name">{p.name}</div><div className="dash-park-meta muted">Featured · {(Math.random() * 12000 + 4000 | 0).toLocaleString()} imp · ★ {p.rating}</div></div><span className="dash-park-status">Live</span></div>; })}<button className="btn-ghost" style={{ width: "100%", marginTop: 10 }} onClick={() => router.push("/business")}>Browse parks to sponsor</button></div>
          <div className="dash-card dash-activity"><div className="dash-card-head"><h3>Recent activity</h3><span className="muted">Live</span></div><ul className="activity-list">{d.recent.map((r, i) => <li key={i}><span className="activity-dot" /><div style={{ flex: 1 }}><div><b>{r.action}</b> from {r.source}</div><div className="muted" style={{ fontSize: 12 }}>{r.when}</div></div></li>)}</ul></div>
          <div className="dash-card dash-creative"><div className="dash-card-head"><h3>Creative</h3><a className="muted small-link">Edit</a></div><div className="dash-creative-preview"><div className="sponsor-spot-logo">CC</div><div style={{ flex: 1 }}><div className="muted" style={{ fontSize: 11 }}>Vet clinic · 0.4 mi</div><div style={{ fontFamily: "var(--serif)", fontSize: 18, marginTop: 2 }}>Cherry Creek Veterinary Hospital</div><p style={{ fontSize: 13, color: "var(--ink)", margin: "6px 0 0", fontStyle: "italic" }}>&ldquo;24/7 emergency care, 4 min from the south gate.&rdquo;</p></div></div><div className="dash-creative-meta muted" style={{ marginTop: 12, fontSize: 12 }}>Last updated 4 days ago · Approved by Sniff editorial</div></div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
