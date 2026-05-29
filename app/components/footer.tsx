import Link from "next/link";
import { Wordmark } from "./sniff-mark";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <Wordmark />
          <p className="muted" style={{ maxWidth: 360, marginTop: 12 }}>A field guide to Denver&apos;s off-leash parks and the businesses around them. Independent, ad-supported, dog-tested.</p>
        </div>
        <div><h4>Explore</h4><Link href="/">All parks</Link><Link href="/map">Map view</Link><Link href="/saved">Saved parks</Link></div>
        <div><h4>For businesses</h4><Link href="/business">Sponsor a park</Link><Link href="/dashboard">Sponsor dashboard</Link><a>Advertising policy</a></div>
        <div><h4>Sniff</h4><a>About</a><a>How we score</a><a>Contact</a></div>
      </div>
      <div className="site-footer-base">
        <span>&copy; 2026 Sniff Guides, LLC &middot; Denver, CO</span>
        <span>Independently owned &middot; Dogs welcome at the office</span>
      </div>
    </footer>
  );
}
