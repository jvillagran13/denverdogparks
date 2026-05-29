"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppState } from "./providers";

export default function UserMenu() {
  const { user, profile, signOut } = useAppState();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!user) {
    return (
      <Link href="/login" className="btn-ghost">
        Sign in
      </Link>
    );
  }

  const displayName = profile?.display_name ?? user.email ?? "User";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    router.push("/");
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          border: "1.5px solid var(--line)",
          background: profile?.avatar_url ? "transparent" : "var(--forest)",
          backgroundImage: profile?.avatar_url ? `url(${profile.avatar_url})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--sans)",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--white)",
          padding: 0,
          flexShrink: 0,
        }}
      >
        {!profile?.avatar_url && initials}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 220,
            background: "var(--white)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-md)",
            boxShadow: "var(--shadow-md)",
            zIndex: 200,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
            <div style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>
              {displayName}
            </div>
            <div style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--stone)", marginTop: 2 }}>
              {user.email}
            </div>
          </div>

          {/* Links */}
          <div style={{ padding: "8px 0" }}>
            <Link
              href="/saved"
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "9px 16px",
                fontFamily: "var(--sans)",
                fontSize: 14,
                color: "var(--ink)",
                textDecoration: "none",
              }}
              className="user-menu-item"
            >
              My saves
            </Link>

            {profile?.role === "sponsor" && (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                style={{
                  display: "block",
                  padding: "9px 16px",
                  fontFamily: "var(--sans)",
                  fontSize: 14,
                  color: "var(--ink)",
                  textDecoration: "none",
                }}
                className="user-menu-item"
              >
                Dashboard
              </Link>
            )}

            <Link
              href="/business"
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "9px 16px",
                fontFamily: "var(--sans)",
                fontSize: 14,
                color: "var(--ink)",
                textDecoration: "none",
              }}
              className="user-menu-item"
            >
              For Businesses
            </Link>
          </div>

          {/* Divider + Sign out */}
          <div style={{ borderTop: "1px solid var(--line)", padding: "8px 0" }}>
            <button
              onClick={handleSignOut}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "9px 16px",
                fontFamily: "var(--sans)",
                fontSize: 14,
                color: "var(--stone)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              className="user-menu-item"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
