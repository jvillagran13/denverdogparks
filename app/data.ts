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
  sponsor: {
    name: string;
    type: string;
    distance: string;
    tagline: string;
  } | null;
  promoted: boolean;
}

export interface EmergencyVet {
  name: string;
  address: string;
  phone: string;
  coords: [number, number];
  hours24: boolean;
  promoted?: boolean;
  sponsor?: string;
  tagline?: string;
  triageMin?: number;
}

export interface AdCreative {
  advertiser: string;
  headline: string;
  cta: string;
  color: string;
  accent: string;
  logoText: string;
  body: string;
}

export const SCORE_LABEL: Record<string, string> = {
  vets: "Vets",
  stores: "Pet stores",
  cafes: "Cafes",
  trails: "Trails",
  water: "Water",
  parking: "Parking",
};

export const SCORE_ICON: Record<string, string> = {
  vets: "✚",
  stores: "❋",
  cafes: "◐",
  trails: "▲",
  water: "≈",
  parking: "P",
};

export function avgScore(scores: Record<string, number>): number {
  const v = Object.values(scores);
  return Math.round(v.reduce((a, b) => a + b, 0) / v.length);
}

export function generateNearby(park: Park) {
  const types = ["Vet", "Pet store", "Cafe", "Trail"];
  return types.map((t, i) => ({
    name: `${t} near ${park.neighborhood}`,
    type: t,
    distance: +(0.2 + i * 0.3).toFixed(1),
    promoted: false,
    hours: "Varies",
  }));
}

export function defaultReviews(park: Park) {
  return [
    { user: "A. Lopez", dog: "Mix · Adult", rating: 5, when: "1w ago", text: `Came to ${park.name} on a recommendation and we'll absolutely be back.` },
    { user: "T. Nguyen", dog: "Vizsla · 3yr", rating: 4, when: "3w ago", text: "Great spot in the morning. Gets a bit muddy after storms but the vibe is unbeatable." },
  ];
}

export const RN_SCENARIOS: Record<string, { label: string; stamp: string; air: number; feels: number; ground: number; aqi: number; aqiCat: string; crowd: number; crowdLabel: string; surface: string; surfaceSub: string; photoMin: number; note: { severity: string; title: string; body: string } | null }> = {
  clear: { label: "Clear day", stamp: "4 min ago", air: 72, feels: 70, ground: 96, aqi: 38, aqiCat: "Good", crowd: 2, crowdLabel: "Moderate", surface: "Firm + dry", surfaceSub: "no rain in 5 days", photoMin: 8, note: null },
  hot: { label: "Hot afternoon", stamp: "2 min ago", air: 94, feels: 98, ground: 138, aqi: 52, aqiCat: "Moderate", crowd: 1, crowdLabel: "Sparse", surface: "Sun-baked dirt", surfaceSub: "shade in W corner only", photoMin: 23, note: { severity: "danger", title: "Asphalt 138°F — paws burn in <60s", body: "Stick to grass paths, or come back after 6:30pm when ground drops below 110°." } },
  smoke: { label: "Wildfire smoke", stamp: "11 min ago", air: 81, feels: 83, ground: 108, aqi: 158, aqiCat: "Unhealthy", crowd: 0, crowdLabel: "Empty", surface: "Dusty · hazy", surfaceSub: "visibility ~1/4 mi", photoMin: 41, note: { severity: "warn", title: "AQI 158 from Williams Fork fire (78 mi NW)", body: "Brachycephalic breeds (Frenchies, pugs, bulldogs) should skip. For others, cap visits at 20 min and watch for cough." } },
  muddy: { label: "After storms", stamp: "16 min ago", air: 58, feels: 55, ground: 62, aqi: 22, aqiCat: "Good", crowd: 1, crowdLabel: "Sparse", surface: "Muddy", surfaceSub: "ankle-deep at the gate", photoMin: 14, note: { severity: "info", title: "Bring boots + a towel", body: "Two cells passed through yesterday. Reservoir trail still pooling — main loop is OK." } },
  cold: { label: "Cold snap", stamp: "31 min ago", air: 24, feels: 11, ground: 22, aqi: 30, aqiCat: "Good", crowd: 0, crowdLabel: "Empty", surface: "Packed snow", surfaceSub: "ice patches by water", photoMin: 96, note: { severity: "info", title: "Ground 22°F — short-coated dogs need booties", body: "Thick-coated breeds fine for 45+ min. Limit Vizslas, greyhounds, and seniors to 20 min." } },
};
