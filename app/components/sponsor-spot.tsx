import type { Park } from "@/app/data";

export default function SponsorSpot({ sponsor, badgeStyle }: { sponsor: NonNullable<Park["sponsor"]>; badgeStyle: string }) {
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
