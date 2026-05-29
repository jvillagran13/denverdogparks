# Auth & Accounts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Supabase Auth with Google/Apple OAuth + email/password, a profiles table, a saved_parks table that replaces localStorage, and a login page — so saves and identity persist across devices.

**Architecture:** Supabase Auth handles sessions via cookies refreshed in Next.js 16 `proxy.ts`. A `profiles` table auto-populates via trigger on signup. `saved_parks` replaces localStorage for logged-in users. The `AppProvider` context gains a `user` + `profile` state, with save operations routing to DB when authenticated and localStorage when not. On first login, localStorage saves merge into the DB.

**Tech Stack:** Supabase Auth, `@supabase/ssr`, Next.js 16 App Router (`proxy.ts`), React 19 context

---

## File Structure

```
proxy.ts                                (create — session refresh on every request)
app/
├── auth/
│   └── callback/
│       └── route.ts                    (create — OAuth code exchange)
├── login/
│   └── page.tsx                        (create — login/signup page)
├── components/
│   ├── providers.tsx                   (modify — add user/profile state, DB saves)
│   ├── top-nav.tsx                     (modify — auth-aware with avatar dropdown)
│   ├── login-form.tsx                  (create — client component with OAuth + email form)
│   ├── user-menu.tsx                   (create — avatar dropdown menu)
│   └── saved-screen.tsx               (modify — auth-aware save display)
lib/
├── supabase/
│   └── server.ts                       (already exists — used by proxy)
├── queries.ts                          (modify — add saved_parks queries)
```

---

### Task 1: Database — profiles, saved_parks, trigger

**Files:**
- Applied via Supabase MCP `apply_migration` tool

- [ ] **Step 1: Migration — `create_profiles_table`**

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'sponsor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users update own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

- [ ] **Step 2: Migration — `create_saved_parks_table`**

```sql
CREATE TABLE saved_parks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  park_slug TEXT NOT NULL REFERENCES parks(slug) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, park_slug)
);

ALTER TABLE saved_parks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own" ON saved_parks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own" ON saved_parks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own" ON saved_parks
  FOR DELETE USING (auth.uid() = user_id);
```

- [ ] **Step 3: Migration — `create_profile_trigger`**

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', '')
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

- [ ] **Step 4: Verify tables exist**

Use `execute_sql`:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('profiles', 'saved_parks')
ORDER BY table_name;
```

Expected: 2 rows (profiles, saved_parks).

- [ ] **Step 5: Regenerate TypeScript types**

Use `generate_typescript_types` MCP tool, save to `lib/supabase/types.ts`.

---

### Task 2: Proxy (session refresh) + Auth Callback Route

**Files:**
- Create: `proxy.ts`
- Create: `app/auth/callback/route.ts`

- [ ] **Step 1: Create `proxy.ts`**

Next.js 16 uses `proxy.ts` (not `middleware.ts`). The exported function must be named `proxy`.

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 2: Create `app/auth/callback/route.ts`**

This Route Handler exchanges the OAuth `code` for a session, then redirects.

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
```

- [ ] **Step 3: Commit**

```bash
git add proxy.ts app/auth/
git commit -m "feat: add auth proxy and OAuth callback route

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Saved Parks Queries

**Files:**
- Modify: `lib/queries.ts`

- [ ] **Step 1: Add saved_parks query functions to `lib/queries.ts`**

Add these functions at the bottom of the file. These use `lib/supabase/server.ts` (the cookie-aware client) since they need the user's auth session:

```typescript
import { createClient as createServerClient } from "@/lib/supabase/server";

// ── Saved parks ─────────────────────────────────────────────────────────────

export async function getSavedParkSlugs(userId: string): Promise<string[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("saved_parks")
    .select("park_slug")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data || []).map((r) => r.park_slug);
}

export async function savePark(userId: string, parkSlug: string): Promise<boolean> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("saved_parks")
    .insert({ user_id: userId, park_slug: parkSlug });
  return !error;
}

export async function unsavePark(userId: string, parkSlug: string): Promise<boolean> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("saved_parks")
    .delete()
    .eq("user_id", userId)
    .eq("park_slug", parkSlug);
  return !error;
}

export async function mergeSavedParks(userId: string, slugs: string[]): Promise<void> {
  if (slugs.length === 0) return;
  const supabase = await createServerClient();
  const rows = slugs.map((park_slug) => ({ user_id: userId, park_slug }));
  await supabase
    .from("saved_parks")
    .upsert(rows, { onConflict: "user_id,park_slug" });
}

// ── Profile ─────────────────────────────────────────────────────────────────

export async function getProfile(userId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}
```

Note: The existing query functions use `lib/supabase/admin.ts` (cookie-free). The new auth-aware queries must use `lib/supabase/server.ts` (cookie-aware) to respect RLS. Add the import at the top of the file alongside the existing admin import.

- [ ] **Step 2: Commit**

```bash
git add lib/queries.ts
git commit -m "feat: add saved_parks and profile query functions

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4: Update AppProvider with Auth State

**Files:**
- Modify: `app/components/providers.tsx`

- [ ] **Step 1: Rewrite `app/components/providers.tsx`**

The provider gains:
- `user` state (from `supabase.auth.getUser()`)
- `profile` state (from profiles table)
- `loading` state
- Auth-aware `toggleSave` — writes to DB when logged in, localStorage when not
- `signOut` function
- On auth state change: fetch profile + saved parks from DB, merge localStorage saves, clear localStorage

```typescript
"use client";

import React from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
}

interface AppState {
  user: User | null;
  profile: Profile | null;
  authLoading: boolean;
  savedSet: Set<string>;
  toggleSave: (id: string) => void;
  compareIds: string[];
  toggleCompare: (id: string) => void;
  setCompareIds: (ids: string[]) => void;
  signOut: () => Promise<void>;
  badgeStyle: string;
  showAds: boolean;
  adDensity: string;
  rightNow: string;
  showPromoted: boolean;
}

const AppContext = React.createContext<AppState | null>(null);

export function useAppState(): AppState {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}

function getLocalSaves(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try { return new Set(JSON.parse(localStorage.getItem("sniff:saved") || "[]")); } catch { return new Set(); }
}

function setLocalSaves(set: Set<string>) {
  localStorage.setItem("sniff:saved", JSON.stringify([...set]));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [savedSet, setSavedSet] = React.useState<Set<string>>(getLocalSaves);
  const [compareIds, setCompareIds] = React.useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("sniff:compare") || "[]"); } catch { return []; }
  });

  const supabase = React.useMemo(() => createClient(), []);

  const badgeStyle = "halo";
  const showAds = true;
  const adDensity = "standard";
  const rightNow = "hot";
  const showPromoted = true;

  React.useEffect(() => {
    async function init() {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
      if (u) {
        const { data: p } = await supabase.from("profiles").select("*").eq("id", u.id).single();
        setProfile(p);
        // Fetch DB saves
        const { data: dbSaves } = await supabase.from("saved_parks").select("park_slug").eq("user_id", u.id);
        const dbSet = new Set((dbSaves || []).map((r: { park_slug: string }) => r.park_slug));
        // Merge localStorage saves into DB
        const localSaves = getLocalSaves();
        const toMerge = [...localSaves].filter((s) => !dbSet.has(s));
        if (toMerge.length > 0) {
          await supabase.from("saved_parks").upsert(
            toMerge.map((park_slug) => ({ user_id: u.id, park_slug })),
            { onConflict: "user_id,park_slug" }
          );
          toMerge.forEach((s) => dbSet.add(s));
        }
        // Clear localStorage, use DB as source of truth
        localStorage.removeItem("sniff:saved");
        setSavedSet(dbSet);
      }
      setAuthLoading(false);
    }
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data: p } = await supabase.from("profiles").select("*").eq("id", u.id).single();
        setProfile(p);
        const { data: dbSaves } = await supabase.from("saved_parks").select("park_slug").eq("user_id", u.id);
        setSavedSet(new Set((dbSaves || []).map((r: { park_slug: string }) => r.park_slug)));
        localStorage.removeItem("sniff:saved");
      } else {
        setProfile(null);
        setSavedSet(getLocalSaves());
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Persist compare to localStorage
  React.useEffect(() => { localStorage.setItem("sniff:compare", JSON.stringify(compareIds)); }, [compareIds]);

  React.useEffect(() => {
    document.body.dataset.anchorAd = showAds ? "true" : "false";
  }, [showAds]);

  async function toggleSave(id: string) {
    const next = new Set(savedSet);
    if (next.has(id)) {
      next.delete(id);
      if (user) {
        await supabase.from("saved_parks").delete().eq("user_id", user.id).eq("park_slug", id);
      }
    } else {
      next.add(id);
      if (user) {
        await supabase.from("saved_parks").insert({ user_id: user.id, park_slug: id });
      }
    }
    setSavedSet(next);
    if (!user) setLocalSaves(next);
  }

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSavedSet(getLocalSaves());
  }

  const value: AppState = {
    user, profile, authLoading,
    savedSet, toggleSave,
    compareIds, toggleCompare, setCompareIds,
    signOut,
    badgeStyle, showAds, adDensity, rightNow, showPromoted,
  };

  return <AppContext value={value}>{children}</AppContext>;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/providers.tsx
git commit -m "feat: add auth state to AppProvider with DB saves

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Login Page

**Files:**
- Create: `app/login/page.tsx`
- Create: `app/components/login-form.tsx`

- [ ] **Step 1: Create `app/login/page.tsx`**

Server component — just renders the login form with metadata.

```typescript
import type { Metadata } from "next";
import LoginForm from "@/app/components/login-form";

export const metadata: Metadata = {
  title: "Sign in · Sniff",
};

export default function LoginPage() {
  return <LoginForm />;
}
```

- [ ] **Step 2: Create `app/components/login-form.tsx`**

Client component with Google, Apple OAuth buttons and email/password form.

```typescript
"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Wordmark } from "./sniff-mark";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(searchParams.get("error") ? "Authentication failed. Please try again." : null);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const supabase = React.useMemo(() => createClient(), []);
  const redirectTo = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`;

  async function handleOAuth(provider: "google" | "apple") {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) setError(error.message);
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) setError(error.message);
      else setMessage("Check your email for a confirmation link.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push("/");
    }

    setLoading(false);
  }

  return (
    <div className="screen" style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-block" }}><Wordmark /></div>
        </div>
        <div className="side-card" style={{ padding: 28 }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 26, textAlign: "center", marginBottom: 24 }}>
            {mode === "signin" ? "Sign in to Sniff" : "Create an account"}
          </h2>

          <button className="btn-ghost" style={{ width: "100%", marginBottom: 8, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={() => handleOAuth("google")}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <button className="btn-ghost" style={{ width: "100%", marginBottom: 20, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={() => handleOAuth("apple")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            Continue with Apple
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0", color: "var(--stone)" }}>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
            <span style={{ fontSize: 12 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
          </div>

          <form onSubmit={handleEmailSubmit}>
            <label style={{ display: "block", marginBottom: 12, fontSize: 13 }}>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: "8px 12px", marginTop: 4, border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)", fontFamily: "var(--sans)", fontSize: 14 }} />
            </label>
            <label style={{ display: "block", marginBottom: 16, fontSize: 13 }}>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={{ width: "100%", padding: "8px 12px", marginTop: 4, border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)", fontFamily: "var(--sans)", fontSize: 14 }} />
            </label>

            {error && <p style={{ color: "#c44", fontSize: 13, marginBottom: 12 }}>{error}</p>}
            {message && <p style={{ color: "var(--forest)", fontSize: 13, marginBottom: 12 }}>{message}</p>}

            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "10px 16px" }} disabled={loading}>
              {loading ? "..." : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--stone)" }}>
            {mode === "signin" ? (
              <>No account? <button onClick={() => { setMode("signup"); setError(null); setMessage(null); }} style={{ background: "none", border: 0, color: "var(--forest)", cursor: "pointer", textDecoration: "underline", fontFamily: "inherit", fontSize: "inherit", padding: 0 }}>Sign up</button></>
            ) : (
              <>Already have one? <button onClick={() => { setMode("signin"); setError(null); setMessage(null); }} style={{ background: "none", border: 0, color: "var(--forest)", cursor: "pointer", textDecoration: "underline", fontFamily: "inherit", fontSize: "inherit", padding: 0 }}>Sign in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/login/ app/components/login-form.tsx
git commit -m "feat: add login page with Google, Apple, and email auth

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 6: User Menu + TopNav Auth Awareness

**Files:**
- Create: `app/components/user-menu.tsx`
- Modify: `app/components/top-nav.tsx`

- [ ] **Step 1: Create `app/components/user-menu.tsx`**

Client component — avatar button that opens a dropdown.

```typescript
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppState } from "./providers";

export default function UserMenu() {
  const { user, profile, signOut } = useAppState();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest?.(".user-menu-wrap")) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  if (!user) {
    return <Link href="/login" className="btn-ghost">Sign in</Link>;
  }

  const initials = (profile?.display_name || user.email || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="user-menu-wrap" style={{ position: "relative" }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        style={{
          width: 34, height: 34, borderRadius: "50%", border: "2px solid var(--line-2)",
          background: profile?.avatar_url ? `url(${profile.avatar_url}) center/cover` : "var(--forest)",
          color: "var(--white)", fontSize: 12, fontWeight: 600, fontFamily: "var(--sans)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}
        aria-label="Account menu"
      >
        {!profile?.avatar_url && initials}
      </button>
      {open && (
        <div style={{
          position: "absolute", right: 0, top: 42, minWidth: 200,
          background: "var(--white)", border: "1px solid var(--line)", borderRadius: "var(--r-md)",
          boxShadow: "var(--shadow-md)", zIndex: 100, padding: "6px 0",
        }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)" }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{profile?.display_name || "User"}</div>
            <div style={{ fontSize: 12, color: "var(--stone)" }}>{user.email}</div>
          </div>
          <Link href="/saved" onClick={() => setOpen(false)} style={{ display: "block", padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>My saves</Link>
          {profile?.role === "sponsor" && (
            <Link href="/dashboard" onClick={() => setOpen(false)} style={{ display: "block", padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>Dashboard</Link>
          )}
          <Link href="/business" onClick={() => setOpen(false)} style={{ display: "block", padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>For Businesses</Link>
          <div style={{ borderTop: "1px solid var(--line)", marginTop: 4, paddingTop: 4 }}>
            <button
              onClick={async () => { setOpen(false); await signOut(); router.push("/"); }}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 16px", fontSize: 13, background: "none", border: 0, cursor: "pointer", color: "var(--stone)", fontFamily: "var(--sans)" }}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update `app/components/top-nav.tsx`**

Replace the static "For Businesses" / "Dashboard" buttons with the `UserMenu` component.

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add app/components/user-menu.tsx app/components/top-nav.tsx
git commit -m "feat: add user menu with auth-aware TopNav

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 7: Update Saved Screen with Auth Awareness

**Files:**
- Modify: `app/components/saved-screen.tsx`

- [ ] **Step 1: Update `app/components/saved-screen.tsx`**

Add a sign-in prompt banner when logged out, showing saves from localStorage. When logged in, show DB saves (already handled by providers).

Replace the existing empty-state section to include an auth prompt:

```typescript
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppState } from "./providers";
import ParkCard from "./park-card";
import { AdSlot, NativeAd, interleaveAds } from "./ad-slot";
import Footer from "./footer";
import type { Park, AdCreative } from "@/app/data";

export default function SavedScreen({ parks, ads }: { parks: Park[]; ads: AdCreative[] }) {
  const router = useRouter();
  const { savedSet, user, showAds, adDensity } = useAppState();
  const saved = parks.filter((p) => savedSet.has(p.id));

  return (
    <div className="screen">
      <section className="page-head"><div className="page-head-inner"><span className="eyebrow">Your account</span><h1 className="page-title">Saved parks</h1><p className="muted" style={{ maxWidth: 520 }}>Pin the parks you visit. Sniff remembers which ones you&apos;ve been to and recommends new ones based on what your dog already loves.</p></div></section>

      {!user && saved.length > 0 && (
        <div style={{ maxWidth: 700, margin: "0 auto 24px", padding: "14px 20px", background: "var(--white)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--stone)" }}>Sign in to sync your saves across devices.</p>
          <Link href="/login" className="btn-primary" style={{ fontSize: 12, padding: "6px 14px", whiteSpace: "nowrap" }}>Sign in</Link>
        </div>
      )}

      {showAds && <div className="ad-strip"><div className="ad-strip-inner"><AdSlot format="leaderboard" seed={2} ads={ads} /></div></div>}
      <section className="results">
        {saved.length === 0 ? (
          <div className="empty empty-large">
            <div style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--ink)", marginBottom: 8 }}>No saves yet.</div>
            <p className="muted" style={{ marginBottom: 18 }}>Tap the heart on any park to keep it here for later.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="btn-primary" onClick={() => router.push("/")}>Browse parks</button>
              {!user && <Link href="/login" className="btn-ghost">Sign in</Link>}
            </div>
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
```

- [ ] **Step 2: Commit**

```bash
git add app/components/saved-screen.tsx
git commit -m "feat: add auth-aware saved screen with sign-in prompt

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 8: Build & Smoke Test

**Files:** None (verification only)

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: Clean build. Fix any type errors.

- [ ] **Step 2: Run dev server and verify**

```bash
npm run dev
```

Test these flows:
- `/` loads, park cards show save buttons
- `/login` shows Google, Apple, email/password form
- TopNav shows "Sign in" when logged out
- Saving a park while logged out writes to localStorage
- `/saved` shows localStorage saves + sign-in prompt when logged out
- After sign-in (email/password for now — OAuth needs provider config):
  - TopNav shows avatar + dropdown
  - localStorage saves merge into DB
  - `/saved` shows DB saves, no sign-in prompt
  - Saving/unsaving writes to DB
  - Sign out reverts to localStorage mode

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve build issues from auth integration

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## OAuth Provider Setup (Manual)

After the code is deployed, Google and Apple OAuth providers need to be configured in the Supabase dashboard:

1. **Supabase Dashboard** → Authentication → Providers
2. **Google**: Enable, add Client ID + Secret from Google Cloud Console
3. **Apple**: Enable, add Service ID + Secret from Apple Developer account
4. **Redirect URL**: Add `http://localhost:3000/auth/callback` for local dev and your production URL

This is a dashboard config step, not a code change.
