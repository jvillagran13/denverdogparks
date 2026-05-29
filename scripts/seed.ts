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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function main() {
  // ── Cleanup tables that use insert (not upsert) ──────────────────────────
  console.log("Cleaning up insertable tables...");

  const cleanupTables = ["ad_creatives", "reviews", "nearby_resources", "emergency_vets"];
  for (const table of cleanupTables) {
    const { error } = await supabase.from(table).delete().gte("created_at", "1970-01-01");
    if (error) {
      // emergency_vets has no created_at, use id
      const { error: err2 } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (err2) {
        console.error(`Failed to clean ${table}:`, err2.message);
        process.exit(1);
      }
    }
  }
  console.log("Cleanup complete.\n");

  // ── 1. Parks ─────────────────────────────────────────────────────────────
  console.log("Seeding parks...");
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

  const { error: parksError } = await supabase
    .from("parks")
    .upsert(parkRows, { onConflict: "slug" });
  if (parksError) {
    console.error("Parks error:", parksError.message);
    process.exit(1);
  }
  console.log(`  Inserted/updated ${parkRows.length} parks.\n`);

  // ── 2. Park scores ────────────────────────────────────────────────────────
  console.log("Seeding park_scores...");
  const scoreRows = PARKS.flatMap((p) =>
    Object.entries(p.scores).map(([category, value]) => ({
      park_slug: p.id,
      category,
      value,
    }))
  );

  const { error: scoresError } = await supabase
    .from("park_scores")
    .upsert(scoreRows, { onConflict: "park_slug,category" });
  if (scoresError) {
    console.error("Park scores error:", scoresError.message);
    process.exit(1);
  }
  console.log(`  Inserted/updated ${scoreRows.length} score rows.\n`);

  // ── 3. Sponsors ───────────────────────────────────────────────────────────
  console.log("Seeding sponsors...");
  const sponsorRows = PARKS.filter((p) => p.sponsor !== null).map((p) => ({
    park_slug: p.id,
    name: p.sponsor!.name,
    type: p.sponsor!.type,
    distance: p.sponsor!.distance,
    tagline: p.sponsor!.tagline,
  }));

  const { error: sponsorsError } = await supabase
    .from("sponsors")
    .upsert(sponsorRows, { onConflict: "park_slug" });
  if (sponsorsError) {
    console.error("Sponsors error:", sponsorsError.message);
    process.exit(1);
  }
  console.log(`  Inserted/updated ${sponsorRows.length} sponsors.\n`);

  // ── 4. Nearby resources ───────────────────────────────────────────────────
  console.log("Seeding nearby_resources...");
  const nearbyRows = PARKS.flatMap((p) => {
    const resources = NEARBY[p.id] ?? generateNearby(p);
    return resources.map((r) => ({
      park_slug: p.id,
      name: r.name,
      type: r.type,
      distance: r.distance,
      promoted: r.promoted,
      hours: r.hours,
    }));
  });

  const { error: nearbyError } = await supabase
    .from("nearby_resources")
    .insert(nearbyRows);
  if (nearbyError) {
    console.error("Nearby resources error:", nearbyError.message);
    process.exit(1);
  }
  console.log(`  Inserted ${nearbyRows.length} nearby resource rows.\n`);

  // ── 5. Reviews ────────────────────────────────────────────────────────────
  console.log("Seeding reviews...");
  const reviewRows = PARKS.flatMap((p) => {
    const parkReviews = REVIEWS[p.id] ?? defaultReviews(p);
    return parkReviews.map((r) => ({
      park_slug: p.id,
      username: r.user,
      dog: r.dog,
      rating: r.rating,
      time_ago: r.when,
      body: r.text,
    }));
  });

  const { error: reviewsError } = await supabase
    .from("reviews")
    .insert(reviewRows);
  if (reviewsError) {
    console.error("Reviews error:", reviewsError.message);
    process.exit(1);
  }
  console.log(`  Inserted ${reviewRows.length} review rows.\n`);

  // ── 6. Emergency vets ─────────────────────────────────────────────────────
  console.log("Seeding emergency_vets...");
  const vetRows = EMERGENCY_VETS.map((v) => ({
    name: v.name,
    address: v.address,
    phone: v.phone,
    coords_x: v.coords[0],
    coords_y: v.coords[1],
    hours_24: v.hours24,
    promoted: v.promoted ?? false,
    sponsor_label: v.sponsor ?? null,
    tagline: v.tagline ?? null,
    triage_min: v.triageMin ?? null,
  }));

  const { error: vetsError } = await supabase
    .from("emergency_vets")
    .insert(vetRows);
  if (vetsError) {
    console.error("Emergency vets error:", vetsError.message);
    process.exit(1);
  }
  console.log(`  Inserted/updated ${vetRows.length} emergency vets.\n`);

  // ── 7. Ad creatives ───────────────────────────────────────────────────────
  console.log("Seeding ad_creatives...");
  const adRows = AD_CREATIVES.map((a) => ({
    advertiser: a.advertiser,
    headline: a.headline,
    cta: a.cta,
    color: a.color,
    accent: a.accent,
    logo_text: a.logoText,
    body: a.body,
  }));

  const { error: adsError } = await supabase
    .from("ad_creatives")
    .insert(adRows);
  if (adsError) {
    console.error("Ad creatives error:", adsError.message);
    process.exit(1);
  }
  console.log(`  Inserted ${adRows.length} ad creatives.\n`);

  console.log("Seed complete!");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
