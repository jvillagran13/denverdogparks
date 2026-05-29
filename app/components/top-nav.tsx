"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppState } from "./providers";
import { Wordmark } from "./sniff-mark";
import UserMenu from "./user-menu";

const NAV_ITEMS: { href: string; key: string; label: (n?: number) => string }[] = [
  { href: "/", key: "/", label: () => "Browse" },
  { href: "/map", key: "/map", label: () => "Map" },
  { href: "/compare", key: "/compare", label: (n) => `Compare${n ? ` · ${n}` : ""}` },
  { href: "/saved", key: "/saved", label: (n) => `Saved${n ? ` · ${n}` : ""}` },
];

export default function TopNav() {
  const pathname = usePathname();
  const { savedSet, compareIds } = useAppState();

  return (
    <header className="topnav">
      <div className="topnav-inner">
        <Link href="/" style={{ background: "none", border: 0, padding: 0, cursor: "default", textDecoration: "none" }}>
          <Wordmark />
        </Link>
        <nav className="nav-links">
          {NAV_ITEMS.map((item) => {
            const count = item.key === "/compare" ? compareIds.length : item.key === "/saved" ? savedSet.size : undefined;
            const active = item.key === "/" ? pathname === "/" : pathname.startsWith(item.key);
            return (
              <Link key={item.key} href={item.href} data-active={active} className="nav-item">
                {item.label(count)}
              </Link>
            );
          })}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/business" className="btn-ghost">For Businesses</Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
