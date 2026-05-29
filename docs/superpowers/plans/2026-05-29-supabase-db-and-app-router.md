# Supabase Database & App Router Migration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all hardcoded data from `app/data.ts` into a Supabase Postgres database and replace the client-side state router with real Next.js App Router routes.

**Architecture:** Create a new Supabase project, define tables via SQL migrations, set up `@supabase/ssr` for both server and client components, build a seed script from the existing data, then decompose the single-file `sniff-app.tsx` into route-based pages that fetch data from Supabase as server components. The monolithic `"use client"` component becomes a shared layout + individual page files.

**Tech Stack:** Next.js 16 App Router, Supabase Postgres, `@supabase/ssr`, `@supabase/supabase-js`, TypeScript, Tailwind CSS 4

---

## File Structure

```
app/
├── layout.tsx                          (modify — keep fonts/metadata, add Supabase provider)
├── page.tsx                            (modify — server component, fetch parks from Supabase)
├── components/
│   ├── sniff-mark.tsx                  (create — extracted SniffMark + Wordmark)
│   ├── top-nav.tsx                     (create — extracted TopNav, client component)
│   ├── footer.tsx                      (create — extracted Footer)
│   ├── park-card.tsx                   (create — extracted ParkCard + related)
│   ├── score-bars.tsx                  (create — extracted ScoreBars, ScoreRow, ScoreRing)
│   ├── ad-slot.tsx                     (create — extracted ad components)
│   ├── compare-tray.tsx                (create — extracted CompareTray)
│   ├── emergency-vet-card.tsx          (create — extracted EmergencyVetCard)
│   ├── right-now-panel.tsx             (create — extracted RightNowPanel)
│   ├── sponsor-spot.tsx                (create — extracted SponsorSpot)
│   ├── filter-bar.tsx                  (create — extracted filter primitives + bar)
│   └── providers.tsx                   (create — client-side context for saved/compare state)
├── parks/
│   └── [slug]/
│       └── page.tsx                    (create — park detail server component)
├── map/
│   └── page.tsx                        (create — map view)
├── compare/
│   └── page.tsx                        (create — compare view)
├── saved/
│   └── page.tsx                        (create — saved parks)
├── business/
│   └── page.tsx                        (create — promote/sponsor landing)
├── dashboard/
│   └── page.tsx                        (create — sponsor dashboard)
├── data.ts                             (modify — keep types, score labels/icons, helper fns; remove hardcoded arrays)
├── sniff-app.tsx                       (delete — after migration complete)
├── sniff.css                           (keep — no changes)
lib/
├── supabase/
│   ├── server.ts                       (create — createServerClient helper)
│   ├── client.ts                       (create — createBrowserClient helper)
│   └── types.ts                        (create — generated DB types)
├── queries.ts                          (create — reusable Supabase query functions)
scripts/
└── seed.ts                             (create — seed script using Supabase client)
```

---

### Task 1: Create Supabase Project & Install Dependencies

**Files:**
- Modify: `package.json`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/client.ts`
- Create: `.env.local` (gitignored)

- [ ] **Step 1: Create the Supabase project**

Use the Supabase MCP tool `create_project`:
- Name: `denverdogparks`
- Organization: `abcddkhknrvhtumkwodc`
- Region: `us-west-1`

Wait for the project to be `ACTIVE_HEALTHY` (check with `get_project`).

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 3: Create `.env.local`**

```bash
# Get these from the Supabase project dashboard after creation
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Add `.env.local` to `.gitignore` if not already there.

- [ ] **Step 4: Create `lib/supabase/server.ts`**

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
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
}
```

- [ ] **Step 5: Create `lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/supabase/ package.json package-lock.json .gitignore
git commit -m "feat: add Supabase project and client helpers"
```

---

### Task 2: Database Schema — Apply Migrations

**Files:**
- Applied via Supabase MCP `apply_migration` tool (no local files yet)
- Create: `lib/supabase/types.ts`

The schema maps directly from the existing TypeScript interfaces in `app/data.ts`. We use `text` slugs as primary keys for parks (matching the existing `id` field like `"cherry-creek"`).

- [ ] **Step 1: Migration — `create_parks_table`**

```sql
CREATE TABLE parks (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  blurb TEXT NOT NULL,
  acres NUMERIC(6,2) NOT NULL,
  fenced BOOLEAN NOT NULL DEFAULT false,
  water BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(2,1) NOT NULL,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  crowd TEXT NOT NULL,
  surface TEXT NOT NULL,
  size TEXT NOT NULL CHECK (size IN ('Tiny','Small','Medium','Large','Huge')),
  hours TEXT NOT NULL,
  fee TEXT NOT NULL,
  image TEXT NOT NULL,
  photo_hue SMALLINT NOT NULL DEFAULT 0,
  coords_x NUMERIC(5,2) NOT NULL,
  coords_y NUMERIC(5,2) NOT NULL,
  promoted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- [ ] **Step 2: Migration — `create_park_scores_table`**

```sql
CREATE TABLE park_scores (
  park_slug TEXT NOT NULL REFERENCES parks(slug) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('vets','stores','cafes','trails','water','parking')),
  value SMALLINT NOT NULL CHECK (value >= 0 AND value <= 100),
  PRIMARY KEY (park_slug, category)
);
```

- [ ] **Step 3: Migration — `create_sponsors_table`**

```sql
CREATE TABLE sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  park_slug TEXT NOT NULL REFERENCES parks(slug) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  distance TEXT NOT NULL,
  tagline TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (park_slug)
);
```

- [ ] **Step 4: Migration — `create_nearby_resources_table`**

```sql
CREATE TABLE nearby_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  park_slug TEXT NOT NULL REFERENCES parks(slug) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  distance NUMERIC(4,2) NOT NULL,
  promoted BOOLEAN NOT NULL DEFAULT false,
  hours TEXT NOT NULL
);
```

- [ ] **Step 5: Migration — `create_reviews_table`**

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  park_slug TEXT NOT NULL REFERENCES parks(slug) ON DELETE CASCADE,
  username TEXT NOT NULL,
  dog TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  time_ago TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- [ ] **Step 6: Migration — `create_emergency_vets_table`**

```sql
CREATE TABLE emergency_vets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  coords_x NUMERIC(5,2) NOT NULL,
  coords_y NUMERIC(5,2) NOT NULL,
  hours_24 BOOLEAN NOT NULL DEFAULT false,
  promoted BOOLEAN NOT NULL DEFAULT false,
  sponsor_label TEXT,
  tagline TEXT,
  triage_min SMALLINT
);
```

- [ ] **Step 7: Migration — `create_ad_creatives_table`**

```sql
CREATE TABLE ad_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser TEXT NOT NULL,
  headline TEXT NOT NULL,
  cta TEXT NOT NULL,
  color TEXT NOT NULL,
  accent TEXT NOT NULL,
  logo_text TEXT NOT NULL,
  body TEXT NOT NULL
);
```

- [ ] **Step 8: Migration — `enable_rls_and_read_policies`**

```sql
ALTER TABLE parks ENABLE ROW LEVEL SECURITY;
ALTER TABLE park_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE nearby_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_vets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_creatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON parks FOR SELECT USING (true);
CREATE POLICY "Public read" ON park_scores FOR SELECT USING (true);
CREATE POLICY "Public read" ON sponsors FOR SELECT USING (true);
CREATE POLICY "Public read" ON nearby_resources FOR SELECT USING (true);
CREATE POLICY "Public read" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public read" ON emergency_vets FOR SELECT USING (true);
CREATE POLICY "Public read" ON ad_creatives FOR SELECT USING (true);
```

- [ ] **Step 9: Create `lib/supabase/types.ts`**

Use the Supabase MCP `generate_typescript_types` tool to generate types from the new project, then save to this file.

- [ ] **Step 10: Commit types file**

```bash
git add lib/supabase/types.ts
git commit -m "feat: add Supabase schema types"
```

---

### Task 3: Seed Script

**Files:**
- Create: `scripts/seed.ts`
- Modify: `package.json` (add `db:seed` script)

- [ ] **Step 1: Create `scripts/seed.ts`**

This script reads from the existing `app/data.ts` exports and inserts them into Supabase. It uses `@supabase/supabase-js` directly with the service role key.

```typescript
import { createClient } from "@supabase/supabase-js";
import {
  PARKS,
  NEARBY,
  REVIEWS,
  EMERGENCY_VETS,
  AD_CREATIVES,
  generateNearby,
  defaultReviews,
} from "../app/data";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
  console.log("Seeding parks...");

  // 1. Parks
  const parkRows = PARKS.map((p) => ({
    slug: p.id,
    name: p.name,
    neighborhood: p.neighborhood,
    blurb: p.blurb,
    acres: p.acres,
    fenced: p.fenced,
    water: p.water,
    rating: p.rating,
    reviews_count: p.reviews,
    crowd: p.crowd,
    surface: p.surface,
    size: p.size,
    hours: p.hours,
    fee: p.fee,
    image: p.image,
    photo_hue: p.photoHue,
    coords_x: p.coords[0],
    coords_y: p.coords[1],
    promoted: p.promoted,
  }));
  const { error: parksErr } = await supabase.from("parks").upsert(parkRows);
  if (parksErr) throw parksErr;
  console.log(`  ${parkRows.length} parks inserted.`);

  // 2. Park scores
  const scoreRows = PARKS.flatMap((p) =>
    Object.entries(p.scores).map(([category, value]) => ({
      park_slug: p.id,
      category,
      value,
    }))
  );
  const { error: scoresErr } = await supabase.from("park_scores").upsert(scoreRows);
  if (scoresErr) throw scoresErr;
  console.log(`  ${scoreRows.length} scores inserted.`);

  // 3. Sponsors
  const sponsorRows = PARKS.filter((p) => p.sponsor).map((p) => ({
    park_slug: p.id,
    name: p.sponsor!.name,
    type: p.sponsor!.type,
    distance: p.sponsor!.distance,
    tagline: p.sponsor!.tagline,
  }));
  const { error: sponsorsErr } = await supabase.from("sponsors").upsert(sponsorRows, { onConflict: "park_slug" });
  if (sponsorsErr) throw sponsorsErr;
  console.log(`  ${sponsorRows.length} sponsors inserted.`);

  // 4. Nearby resources
  const nearbyRows = PARKS.flatMap((p) => {
    const resources = NEARBY[p.id] || generateNearby(p);
    return resources.map((r) => ({
      park_slug: p.id,
      name: r.name,
      type: r.type,
      distance: r.distance,
      promoted: r.promoted,
      hours: r.hours,
    }));
  });
  const { error: nearbyErr } = await supabase.from("nearby_resources").insert(nearbyRows);
  if (nearbyErr) throw nearbyErr;
  console.log(`  ${nearbyRows.length} nearby resources inserted.`);

  // 5. Reviews
  const reviewRows = PARKS.flatMap((p) => {
    const revs = REVIEWS[p.id] || defaultReviews(p);
    return revs.map((r) => ({
      park_slug: p.id,
      username: r.user,
      dog: r.dog,
      rating: r.rating,
      time_ago: r.when,
      body: r.text,
    }));
  });
  const { error: reviewsErr } = await supabase.from("reviews").insert(reviewRows);
  if (reviewsErr) throw reviewsErr;
  console.log(`  ${reviewRows.length} reviews inserted.`);

  // 6. Emergency vets
  const vetRows = EMERGENCY_VETS.map((v) => ({
    name: v.name,
    address: v.address,
    phone: v.phone,
    coords_x: v.coords[0],
    coords_y: v.coords[1],
    hours_24: v.hours24,
    promoted: v.promoted || false,
    sponsor_label: v.sponsor || null,
    tagline: v.tagline || null,
    triage_min: v.triageMin || null,
  }));
  const { error: vetsErr } = await supabase.from("emergency_vets").upsert(vetRows);
  if (vetsErr) throw vetsErr;
  console.log(`  ${vetRows.length} emergency vets inserted.`);

  // 7. Ad creatives
  const adRows = AD_CREATIVES.map((a) => ({
    advertiser: a.advertiser,
    headline: a.headline,
    cta: a.cta,
    color: a.color,
    accent: a.accent,
    logo_text: a.logoText,
    body: a.body,
  }));
  const { error: adsErr } = await supabase.from("ad_creatives").insert(adRows);
  if (adsErr) throw adsErr;
  console.log(`  ${adRows.length} ad creatives inserted.`);

  console.log("Seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
```

- [ ] **Step 2: Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`**

Get the service role key from the new project's API settings.

```
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

- [ ] **Step 3: Add seed script to `package.json`**

```json
"scripts": {
  "db:seed": "npx tsx scripts/seed.ts"
}
```

- [ ] **Step 4: Run the seed script**

```bash
npm run db:seed
```

Expected output:
```
Seeding parks...
  12 parks inserted.
  72 scores inserted.
  4 sponsors inserted.
  ~48 nearby resources inserted.
  ~29 reviews inserted.
  5 emergency vets inserted.
  7 ad creatives inserted.
Seed complete!
```

- [ ] **Step 5: Verify data in Supabase**

Use `execute_sql` MCP tool:
```sql
SELECT slug, name FROM parks ORDER BY name;
```

Should return 12 rows.

- [ ] **Step 6: Commit**

```bash
git add scripts/seed.ts package.json
git commit -m "feat: add seed script for Supabase data"
```

---

### Task 4: Query Layer

**Files:**
- Create: `lib/queries.ts`
- Modify: `app/data.ts` (keep types, score labels/icons, helpers; remove hardcoded arrays)

- [ ] **Step 1: Create `lib/queries.ts`**

```typescript
import { createClient } from "@/lib/supabase/server";

export interface ParkRow {
  slug: string;
  name: string;
  neighborhood: string;
  blurb: string;
  acres: number;
  fenced: boolean;
  water: boolean;
  rating: number;
  reviews_count: number;
  crowd: string;
  surface: string;
  size: string;
  hours: string;
  fee: string;
  image: string;
  photo_hue: number;
  coords_x: number;
  coords_y: number;
  promoted: boolean;
}

export interface Park {
  id: string;
  name: string;
  neighborhood: string;
  blurb: string;
  acres: number;
  fenced: boolean;
  water: boolean;
  rating: number;
  reviews: number;
  crowd: string;
  surface: string;
  size: string;
  hours: string;
  fee: string;
  image: string;
  photoHue: number;
  coords: [number, number];
  scores: Record<string, number>;
  sponsor: { name: string; type: string; distance: string; tagline: string } | null;
  promoted: boolean;
}

function rowToPark(row: ParkRow, scores: { category: string; value: number }[], sponsor: { name: string; type: string; distance: string; tagline: string } | null): Park {
  return {
    id: row.slug,
    name: row.name,
    neighborhood: row.neighborhood,
    blurb: row.blurb,
    acres: Number(row.acres),
    fenced: row.fenced,
    water: row.water,
    rating: Number(row.rating),
    reviews: row.reviews_count,
    crowd: row.crowd,
    surface: row.surface,
    size: row.size,
    hours: row.hours,
    fee: row.fee,
    image: row.image,
    photoHue: row.photo_hue,
    coords: [Number(row.coords_x), Number(row.coords_y)],
    scores: Object.fromEntries(scores.map((s) => [s.category, s.value])),
    sponsor,
    promoted: row.promoted,
  };
}

export async function getAllParks(): Promise<Park[]> {
  const supabase = await createClient();

  const [{ data: parks }, { data: scores }, { data: sponsors }] = await Promise.all([
    supabase.from("parks").select("*").order("name"),
    supabase.from("park_scores").select("*"),
    supabase.from("sponsors").select("*"),
  ]);

  if (!parks) return [];

  const scoresByPark = new Map<string, { category: string; value: number }[]>();
  for (const s of scores || []) {
    const list = scoresByPark.get(s.park_slug) || [];
    list.push({ category: s.category, value: s.value });
    scoresByPark.set(s.park_slug, list);
  }

  const sponsorByPark = new Map<string, { name: string; type: string; distance: string; tagline: string }>();
  for (const sp of sponsors || []) {
    sponsorByPark.set(sp.park_slug, { name: sp.name, type: sp.type, distance: sp.distance, tagline: sp.tagline });
  }

  return parks.map((row) =>
    rowToPark(row as ParkRow, scoresByPark.get(row.slug) || [], sponsorByPark.get(row.slug) || null)
  );
}

export async function getParkBySlug(slug: string): Promise<Park | null> {
  const supabase = await createClient();

  const [{ data: park }, { data: scores }, { data: sponsor }] = await Promise.all([
    supabase.from("parks").select("*").eq("slug", slug).single(),
    supabase.from("park_scores").select("*").eq("park_slug", slug),
    supabase.from("sponsors").select("*").eq("park_slug", slug).maybeSingle(),
  ]);

  if (!park) return null;

  return rowToPark(
    park as ParkRow,
    (scores || []).map((s) => ({ category: s.category, value: s.value })),
    sponsor ? { name: sponsor.name, type: sponsor.type, distance: sponsor.distance, tagline: sponsor.tagline } : null
  );
}

export async function getNearbyResources(parkSlug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("nearby_resources")
    .select("*")
    .eq("park_slug", parkSlug)
    .order("distance");
  return data || [];
}

export async function getReviews(parkSlug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("park_slug", parkSlug)
    .order("created_at", { ascending: false });
  return (data || []).map((r) => ({
    user: r.username,
    dog: r.dog,
    rating: r.rating,
    when: r.time_ago,
    text: r.body,
  }));
}

export async function getEmergencyVets() {
  const supabase = await createClient();
  const { data } = await supabase.from("emergency_vets").select("*");
  return (data || []).map((v) => ({
    name: v.name,
    address: v.address,
    phone: v.phone,
    coords: [Number(v.coords_x), Number(v.coords_y)] as [number, number],
    hours24: v.hours_24,
    promoted: v.promoted,
    sponsor: v.sponsor_label,
    tagline: v.tagline,
    triageMin: v.triage_min,
  }));
}

export async function getAdCreatives() {
  const supabase = await createClient();
  const { data } = await supabase.from("ad_creatives").select("*");
  return (data || []).map((a) => ({
    advertiser: a.advertiser,
    headline: a.headline,
    cta: a.cta,
    color: a.color,
    accent: a.accent,
    logoText: a.logo_text,
    body: a.body,
  }));
}

export async function getDashboardData() {
  // For now, return the same static dashboard data
  // This will be replaced with real metrics in a future task
  return {
    business: "Cherry Creek Veterinary Hospital",
    plan: "Featured Sponsor",
    monthly: 249,
    parks: ["Cherry Creek State Park", "Kennedy Dog Park"],
    metrics: {
      impressions: 18420,
      impressionsDelta: 0.124,
      clicks: 892,
      clicksDelta: 0.083,
      saves: 214,
      savesDelta: -0.021,
      cpm: 13.5,
    },
    daily: [42, 51, 38, 64, 72, 58, 81, 76, 92, 88, 71, 95, 102, 87, 110, 124, 118, 134, 121, 142, 138, 156, 149, 168, 161, 178, 172, 188, 195, 212],
    recent: [
      { when: "2 min ago", action: "Profile click", source: "Cherry Creek State Park" },
      { when: "14 min ago", action: "Map pin tap", source: "Cherry Creek State Park" },
      { when: "1 hr ago", action: "Save to list", source: "Kennedy Dog Park" },
      { when: "2 hr ago", action: "Directions tap", source: "Cherry Creek State Park" },
      { when: "3 hr ago", action: "Phone call", source: "Cherry Creek State Park" },
    ],
  };
}
```

- [ ] **Step 2: Trim `app/data.ts`**

Remove the hardcoded `PARKS`, `NEARBY`, `REVIEWS`, `EMERGENCY_VETS`, `AD_CREATIVES`, `DASHBOARD` arrays/objects from `app/data.ts`. Keep:
- The `Park`, `EmergencyVet`, `AdCreative` interfaces (components still reference them)
- `SCORE_LABEL`, `SCORE_ICON` constants
- `avgScore()`, `generateNearby()`, `defaultReviews()` helper functions
- The `RN_SCENARIOS` object (hardcoded weather scenarios — replaced by API in a future task)

- [ ] **Step 3: Commit**

```bash
git add lib/queries.ts app/data.ts
git commit -m "feat: add Supabase query layer, trim hardcoded data"
```

---

### Task 5: Extract Shared Components

**Files:**
- Create: `app/components/sniff-mark.tsx`
- Create: `app/components/top-nav.tsx`
- Create: `app/components/footer.tsx`
- Create: `app/components/park-card.tsx`
- Create: `app/components/score-bars.tsx`
- Create: `app/components/ad-slot.tsx`
- Create: `app/components/compare-tray.tsx`
- Create: `app/components/emergency-vet-card.tsx`
- Create: `app/components/right-now-panel.tsx`
- Create: `app/components/sponsor-spot.tsx`
- Create: `app/components/filter-bar.tsx`
- Create: `app/components/providers.tsx`

This is a mechanical extraction — move each component from `sniff-app.tsx` into its own file, adding `"use client"` only to components that use React state/effects (TopNav, FilterBar, CompareTray, AdSlot, EmergencyVetCard, RightNowPanel, Providers). Server-compatible components (Footer, ParkCard visual, ScoreBars, SniffMark) stay as server components.

- [ ] **Step 1: Create `app/components/providers.tsx`**

Client component that provides saved parks and compare state via React context. This replaces the `useState` calls in the old `SniffApp` root.

```typescript
"use client";

import React from "react";

interface AppState {
  savedSet: Set<string>;
  toggleSave: (id: string) => void;
  compareIds: string[];
  toggleCompare: (id: string) => void;
  setCompareIds: (ids: string[]) => void;
}

const AppContext = React.createContext<AppState | null>(null);

export function useAppState() {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [savedSet, setSavedSet] = React.useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try { return new Set(JSON.parse(localStorage.getItem("sniff:saved") || "[]")); } catch { return new Set(); }
  });
  const [compareIds, setCompareIds] = React.useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("sniff:compare") || "[]"); } catch { return []; }
  });

  React.useEffect(() => { localStorage.setItem("sniff:saved", JSON.stringify([...savedSet])); }, [savedSet]);
  React.useEffect(() => { localStorage.setItem("sniff:compare", JSON.stringify(compareIds)); }, [compareIds]);

  function toggleSave(id: string) {
    setSavedSet((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }
  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }

  return (
    <AppContext value={{ savedSet, toggleSave, compareIds, toggleCompare, setCompareIds }}>
      {children}
    </AppContext>
  );
}
```

- [ ] **Step 2: Extract each component from `sniff-app.tsx` into its own file**

Move each function component into the corresponding file from the file structure above. Add proper imports. Mark client components with `"use client"` where needed. Components that call `useAppState()` or have interactive state need `"use client"`.

Key decisions:
- `ParkCard` needs `"use client"` because it has save/compare click handlers via `useAppState()`
- `TopNav` needs `"use client"` because it uses `usePathname()` from `next/navigation` for active link highlighting
- `Footer` can be a server component — its links become `<Link>` from `next/link`
- `AdSlot` and all ad components stay `"use client"` (stateful dismiss, rotation)

- [ ] **Step 3: Verify the app still builds**

```bash
npm run build
```

Expected: builds successfully (pages still reference old `sniff-app.tsx` at this point — that's fine, we update routes in the next task).

- [ ] **Step 4: Commit**

```bash
git add app/components/
git commit -m "refactor: extract shared components from sniff-app.tsx"
```

---

### Task 6: App Router Routes — Layout & Home

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Update `app/layout.tsx`**

Wrap children with `AppProvider`. Add `TopNav` as a server-compatible layout element. Keep the existing font setup.

```typescript
import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import "./sniff.css";
import { AppProvider } from "./components/providers";
import TopNav from "./components/top-nav";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sniff · Denver dog parks, scored.",
  description:
    "The fully scored guide to every off-leash park in Denver. 12 parks ranked across six things that actually matter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${dmSans.variable}`}>
      <body>
        <AppProvider>
          <TopNav />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Convert `app/page.tsx` to server component**

Replace the old `<SniffApp />` import with a server component that fetches parks from Supabase and passes them to the client `HomeScreen` component.

```typescript
import { getAllParks, getAdCreatives } from "@/lib/queries";
import HomeScreen from "./components/home-screen";

export default async function Page() {
  const [parks, ads] = await Promise.all([
    getAllParks(),
    getAdCreatives(),
  ]);

  return <HomeScreen parks={parks} ads={ads} />;
}
```

Note: `HomeScreen` is a new client component extracted from the old `HomeScreen` in `sniff-app.tsx`, but now receives `parks` and `ads` as props instead of importing from `data.ts`.

- [ ] **Step 3: Create `app/components/home-screen.tsx`**

Extract the old `HomeScreen` function from `sniff-app.tsx` into this client component. Change it to accept `parks` and `ads` as props instead of importing `PARKS` and `AD_CREATIVES`. Wire up `useAppState()` for saved/compare state.

- [ ] **Step 4: Test the home page**

```bash
npm run dev
```

Open `http://localhost:3000` — should show the same park grid, now powered by Supabase data.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/page.tsx app/components/home-screen.tsx
git commit -m "feat: convert home page to server component with Supabase data"
```

---

### Task 7: App Router Routes — Park Detail

**Files:**
- Create: `app/parks/[slug]/page.tsx`
- Create: `app/components/park-screen.tsx`

- [ ] **Step 1: Create `app/parks/[slug]/page.tsx`**

```typescript
import { getParkBySlug, getNearbyResources, getReviews, getEmergencyVets, getAllParks } from "@/lib/queries";
import { notFound } from "next/navigation";
import ParkScreen from "@/app/components/park-screen";

export async function generateStaticParams() {
  const parks = await getAllParks();
  return parks.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const park = await getParkBySlug(slug);
  if (!park) return {};
  return {
    title: `${park.name} · Sniff`,
    description: park.blurb,
  };
}

export default async function ParkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [park, nearby, reviews, vets] = await Promise.all([
    getParkBySlug(slug),
    getNearbyResources(slug),
    getReviews(slug),
    getEmergencyVets(),
  ]);

  if (!park) notFound();

  return <ParkScreen park={park} nearby={nearby} reviews={reviews} emergencyVets={vets} />;
}
```

- [ ] **Step 2: Create `app/components/park-screen.tsx`**

Extract the `ParkScreen` function from `sniff-app.tsx`. Change it to accept `park`, `nearby`, `reviews`, and `emergencyVets` as props instead of looking them up from hardcoded data. Wire up `useAppState()` for saved/compare.

- [ ] **Step 3: Test park detail page**

Navigate to `http://localhost:3000/parks/cherry-creek` — should show the full park detail page.

- [ ] **Step 4: Commit**

```bash
git add app/parks/ app/components/park-screen.tsx
git commit -m "feat: add /parks/[slug] route with Supabase data"
```

---

### Task 8: App Router Routes — Map, Compare, Saved

**Files:**
- Create: `app/map/page.tsx`
- Create: `app/compare/page.tsx`
- Create: `app/saved/page.tsx`
- Create: `app/components/map-screen.tsx`
- Create: `app/components/compare-screen.tsx`
- Create: `app/components/saved-screen.tsx`

- [ ] **Step 1: Create `app/map/page.tsx`**

```typescript
import { getAllParks } from "@/lib/queries";
import MapScreen from "@/app/components/map-screen";

export const metadata = { title: "Map · Sniff" };

export default async function MapPage() {
  const parks = await getAllParks();
  return <MapScreen parks={parks} />;
}
```

- [ ] **Step 2: Create `app/compare/page.tsx`**

```typescript
import { getAllParks } from "@/lib/queries";
import CompareScreen from "@/app/components/compare-screen";

export const metadata = { title: "Compare · Sniff" };

export default async function ComparePage() {
  const parks = await getAllParks();
  return <CompareScreen allParks={parks} />;
}
```

- [ ] **Step 3: Create `app/saved/page.tsx`**

```typescript
import { getAllParks, getAdCreatives } from "@/lib/queries";
import SavedScreen from "@/app/components/saved-screen";

export const metadata = { title: "Saved Parks · Sniff" };

export default async function SavedPage() {
  const [parks, ads] = await Promise.all([getAllParks(), getAdCreatives()]);
  return <SavedScreen allParks={parks} ads={ads} />;
}
```

- [ ] **Step 4: Extract MapScreen, CompareScreen, SavedScreen**

Extract each from `sniff-app.tsx` into the corresponding client component file. Change them to accept all data as props. Use `useAppState()` for saved/compare state. Replace `go("park", id)` calls with `router.push(\`/parks/\${id}\`)` using `useRouter()` from `next/navigation`.

- [ ] **Step 5: Test all three routes**

- `http://localhost:3000/map` — map view with sidebar
- `http://localhost:3000/compare` — compare picker
- `http://localhost:3000/saved` — saved parks list

- [ ] **Step 6: Commit**

```bash
git add app/map/ app/compare/ app/saved/ app/components/map-screen.tsx app/components/compare-screen.tsx app/components/saved-screen.tsx
git commit -m "feat: add /map, /compare, /saved routes"
```

---

### Task 9: App Router Routes — Business & Dashboard

**Files:**
- Create: `app/business/page.tsx`
- Create: `app/dashboard/page.tsx`
- Create: `app/components/promote-screen.tsx`
- Create: `app/components/dashboard-screen.tsx`

- [ ] **Step 1: Create `app/business/page.tsx`**

```typescript
import { getAllParks } from "@/lib/queries";
import PromoteScreen from "@/app/components/promote-screen";

export const metadata = { title: "For Businesses · Sniff" };

export default async function BusinessPage() {
  const parks = await getAllParks();
  return <PromoteScreen parks={parks} />;
}
```

- [ ] **Step 2: Create `app/dashboard/page.tsx`**

```typescript
import { getAllParks, getDashboardData } from "@/lib/queries";
import DashboardScreen from "@/app/components/dashboard-screen";

export const metadata = { title: "Dashboard · Sniff" };

export default async function DashboardPage() {
  const [parks, data] = await Promise.all([getAllParks(), getDashboardData()]);
  return <DashboardScreen parks={parks} data={data} />;
}
```

- [ ] **Step 3: Extract PromoteScreen and DashboardScreen**

Same pattern — extract from `sniff-app.tsx`, accept props, use `useRouter()` for navigation.

- [ ] **Step 4: Test both routes**

- `http://localhost:3000/business` — sponsor landing page
- `http://localhost:3000/dashboard` — sponsor dashboard

- [ ] **Step 5: Commit**

```bash
git add app/business/ app/dashboard/ app/components/promote-screen.tsx app/components/dashboard-screen.tsx
git commit -m "feat: add /business and /dashboard routes"
```

---

### Task 10: Update Navigation & Clean Up

**Files:**
- Modify: `app/components/top-nav.tsx` (use `<Link>` and `usePathname()`)
- Modify: `app/components/footer.tsx` (use `<Link>`)
- Delete: `app/sniff-app.tsx`
- Modify: `app/data.ts` (final cleanup)

- [ ] **Step 1: Update TopNav to use `<Link>` and `usePathname()`**

Replace `go()` calls with Next.js `<Link>` components. Use `usePathname()` for active state.

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "./sniff-mark";
import { useAppState } from "./providers";

export default function TopNav() {
  const pathname = usePathname();
  const { savedSet, compareIds } = useAppState();

  const navItems = [
    { href: "/", label: "Browse", key: "home" },
    { href: "/map", label: "Map", key: "map" },
    { href: "/compare", label: `Compare${compareIds.length ? ` · ${compareIds.length}` : ""}`, key: "compare" },
    { href: "/saved", label: `Saved${savedSet.size ? ` · ${savedSet.size}` : ""}`, key: "saved" },
  ];

  return (
    <header className="topnav">
      <div className="topnav-inner">
        <Link href="/" style={{ background: "none", border: 0, padding: 0, cursor: "default" }}>
          <Wordmark />
        </Link>
        <nav className="nav-links">
          {navItems.map((item) => (
            <Link key={item.key} href={item.href} data-active={pathname === item.href} className="nav-item">
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/business" className="btn-ghost">For Businesses</Link>
          <Link href="/dashboard" className="btn-primary">Dashboard</Link>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Update Footer to use `<Link>`**

Replace `go()` calls with `<Link>` components.

- [ ] **Step 3: Update all `go()` calls in extracted components**

Search every component for remaining `go("...")` calls and replace with `useRouter().push()` or `<Link>`. The pattern:
- `go("home")` → `router.push("/")`
- `go("park", id)` → `router.push(\`/parks/\${id}\`)`
- `go("map")` → `router.push("/map")`
- `go("compare")` → `router.push("/compare")`
- `go("account")` → `router.push("/saved")`
- `go("promote")` → `router.push("/business")`
- `go("dashboard")` → `router.push("/dashboard")`

- [ ] **Step 4: Delete `app/sniff-app.tsx`**

```bash
rm app/sniff-app.tsx
```

- [ ] **Step 5: Run full build**

```bash
npm run build
```

Expected: clean build with all routes pre-rendered.

- [ ] **Step 6: Manual smoke test**

Run `npm run dev` and verify:
- `/` — home page loads with park grid from Supabase
- `/parks/cherry-creek` — detail page loads with scores, reviews, nearby
- `/map` — map view with all park pins
- `/compare` — compare picker, add 2 parks and see side-by-side
- `/saved` — shows saved parks (from localStorage)
- `/business` — sponsor landing page
- `/dashboard` — sponsor dashboard
- Navigation between all pages via TopNav links
- Back/forward browser buttons work
- Save/compare state persists across navigation

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: complete App Router migration with Supabase data"
```
