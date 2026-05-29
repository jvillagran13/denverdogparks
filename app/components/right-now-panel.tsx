import { RN_SCENARIOS, type Park } from "@/app/data";

export default function RightNowPanel({ scenario = "clear" }: { park: Park; scenario?: string }) {
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
