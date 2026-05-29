import { createClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Park, EmergencyVet, AdCreative } from "@/app/data";
import { generateNearby, defaultReviews } from "@/app/data";

// ── Parks ────────────────────────────────────────────────────────────────────

export async function getAllParks(): Promise<Park[]> {
  const supabase = await createClient();

  const [{ data: parks }, { data: scores }, { data: sponsors }] = await Promise.all([
    supabase.from("parks").select("*").order("rating", { ascending: false }),
    supabase.from("park_scores").select("*"),
    supabase.from("sponsors").select("*"),
  ]);

  if (!parks) return [];

  const scoreMap = new Map<string, Record<string, number>>();
  for (const s of scores || []) {
    if (!scoreMap.has(s.park_slug)) scoreMap.set(s.park_slug, {});
    scoreMap.get(s.park_slug)![s.category] = s.value;
  }

  const sponsorMap = new Map<string, Park["sponsor"]>();
  for (const sp of sponsors || []) {
    sponsorMap.set(sp.park_slug, {
      name: sp.name,
      type: sp.type,
      distance: sp.distance,
      tagline: sp.tagline,
    });
  }

  return parks.map((p) => ({
    id: p.slug,
    name: p.name,
    neighborhood: p.neighborhood,
    blurb: p.blurb,
    acres: p.acres,
    fenced: p.fenced,
    water: p.water,
    rating: p.rating,
    reviews: p.reviews_count,
    crowd: p.crowd,
    surface: p.surface,
    size: p.size,
    hours: p.hours,
    fee: p.fee,
    image: p.image,
    photoHue: p.photo_hue,
    coords: [p.coords_x, p.coords_y] as [number, number],
    scores: scoreMap.get(p.slug) || {},
    sponsor: sponsorMap.get(p.slug) || null,
    promoted: p.promoted,
  }));
}

export async function getParkBySlug(slug: string): Promise<Park | null> {
  const supabase = await createClient();

  const [{ data: park }, { data: scores }, { data: sponsors }] = await Promise.all([
    supabase.from("parks").select("*").eq("slug", slug).single(),
    supabase.from("park_scores").select("*").eq("park_slug", slug),
    supabase.from("sponsors").select("*").eq("park_slug", slug).maybeSingle(),
  ]);

  if (!park) return null;

  const scoreObj: Record<string, number> = {};
  for (const s of scores || []) {
    scoreObj[s.category] = s.value;
  }

  const sponsor: Park["sponsor"] = sponsors
    ? { name: sponsors.name, type: sponsors.type, distance: sponsors.distance, tagline: sponsors.tagline }
    : null;

  return {
    id: park.slug,
    name: park.name,
    neighborhood: park.neighborhood,
    blurb: park.blurb,
    acres: park.acres,
    fenced: park.fenced,
    water: park.water,
    rating: park.rating,
    reviews: park.reviews_count,
    crowd: park.crowd,
    surface: park.surface,
    size: park.size,
    hours: park.hours,
    fee: park.fee,
    image: park.image,
    photoHue: park.photo_hue,
    coords: [park.coords_x, park.coords_y] as [number, number],
    scores: scoreObj,
    sponsor,
    promoted: park.promoted,
  };
}

// ── Nearby resources ─────────────────────────────────────────────────────────

export async function getNearbyResources(parkSlug: string): Promise<{ name: string; type: string; distance: number; promoted: boolean; hours: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("nearby_resources")
    .select("*")
    .eq("park_slug", parkSlug)
    .order("distance");

  if (!data || data.length === 0) {
    // fallback — generate synthetic nearby if DB has none for this park
    const park = await getParkBySlug(parkSlug);
    if (park) return generateNearby(park);
    return [];
  }

  return data.map((r) => ({
    name: r.name,
    type: r.type,
    distance: r.distance,
    promoted: r.promoted,
    hours: r.hours,
  }));
}

// ── Reviews ──────────────────────────────────────────────────────────────────

export async function getReviews(parkSlug: string): Promise<{ user: string; dog: string; rating: number; when: string; text: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("park_slug", parkSlug)
    .order("created_at", { ascending: false });

  if (!data || data.length === 0) {
    const park = await getParkBySlug(parkSlug);
    if (park) return defaultReviews(park);
    return [];
  }

  return data.map((r) => ({
    user: r.username,
    dog: r.dog,
    rating: r.rating,
    when: r.time_ago,
    text: r.body,
  }));
}

// ── Emergency vets ───────────────────────────────────────────────────────────

export async function getEmergencyVets(): Promise<EmergencyVet[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("emergency_vets").select("*");

  if (!data) return [];

  return data.map((v) => ({
    name: v.name,
    address: v.address,
    phone: v.phone,
    coords: [v.coords_x, v.coords_y] as [number, number],
    hours24: v.hours_24,
    promoted: v.promoted || undefined,
    sponsor: v.sponsor_label || undefined,
    tagline: v.tagline || undefined,
    triageMin: v.triage_min || undefined,
  }));
}

// ── Ad creatives ─────────────────────────────────────────────────────────────

export async function getAdCreatives(): Promise<AdCreative[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("ad_creatives").select("*");

  if (!data) return [];

  return data.map((a) => ({
    advertiser: a.advertiser,
    headline: a.headline,
    cta: a.cta,
    color: a.color,
    accent: a.accent,
    logoText: a.logo_text,
    body: a.body,
  }));
}

// ── Dashboard (static) ───────────────────────────────────────────────────────

export function getDashboardData() {
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

// ── Saved parks (auth-aware) ────────────────────────────────────────────────

export async function getSavedParkSlugs(userId: string): Promise<string[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("saved_parks")
    .select("park_slug")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data || []).map((r) => r.park_slug);
}

export async function getProfile(userId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}
