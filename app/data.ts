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

export const PARKS: Park[] = [
  {
    id: "cherry-creek",
    name: "Cherry Creek State Park",
    neighborhood: "Cherry Creek",
    blurb: "107 fenced acres with a reservoir, prairie trails, and the metro's biggest swimming pond.",
    acres: 107,
    fenced: true,
    water: true,
    rating: 4.8,
    reviews: 2841,
    crowd: "Busy",
    surface: "Mixed grass + dirt",
    size: "Huge",
    hours: "5a – 10p",
    fee: "$10/vehicle",
    image: "linear-gradient(135deg,#3d5a3f 0%,#6b8e5a 60%,#b9c98a 100%)",
    photoHue: 95,
    coords: [50, 70],
    scores: { vets: 88, stores: 92, cafes: 74, trails: 99, water: 100, parking: 95 },
    sponsor: {
      name: "Cherry Creek Veterinary Hospital",
      type: "Vet clinic",
      distance: "0.4 mi",
      tagline: "24/7 emergency care, 4 min from the south gate.",
    },
    promoted: false,
  },
  {
    id: "railyard",
    name: "Railyard Dog Park",
    neighborhood: "RiNo",
    blurb: "Urban turf park tucked under the 38th & Blake light rail. Patio bars on every side.",
    acres: 0.4,
    fenced: true,
    water: false,
    rating: 4.4,
    reviews: 612,
    crowd: "Packed after 5p",
    surface: "Artificial turf",
    size: "Small",
    hours: "6a – 11p",
    fee: "Free",
    image: "linear-gradient(135deg,#2a2520 0%,#5a4332 55%,#c4956b 100%)",
    photoHue: 25,
    coords: [54, 38],
    scores: { vets: 72, stores: 84, cafes: 99, trails: 38, water: 22, parking: 45 },
    sponsor: {
      name: "Bark Social RiNo",
      type: "Dog-friendly bar",
      distance: "350 ft",
      tagline: "First pint free with a check-in.",
    },
    promoted: true,
  },
  {
    id: "berkeley-lake",
    name: "Berkeley Lake Dog Park",
    neighborhood: "Berkeley",
    blurb: "Lakeside off-leash strip with a swim beach. Sunset crowd is unbeatable.",
    acres: 6.2,
    fenced: false,
    water: true,
    rating: 4.6,
    reviews: 1480,
    crowd: "Moderate",
    surface: "Grass + sand",
    size: "Medium",
    hours: "5a – 11p",
    fee: "Free",
    image: "linear-gradient(135deg,#2f4a6b 0%,#6da3c5 55%,#dcc88a 100%)",
    photoHue: 200,
    coords: [32, 22],
    scores: { vets: 76, stores: 81, cafes: 88, trails: 72, water: 96, parking: 70 },
    sponsor: {
      name: "Tennyson Pet Supply Co.",
      type: "Pet store",
      distance: "0.6 mi",
      tagline: "Locally-roasted treats + fresh water bowl out front.",
    },
    promoted: false,
  },
  {
    id: "westerly-creek",
    name: "Westerly Creek Dog Park",
    neighborhood: "Central Park",
    blurb: "Creek-fed run-around with separate small dog area and a gravel rinse pad.",
    acres: 3.1,
    fenced: true,
    water: true,
    rating: 4.7,
    reviews: 934,
    crowd: "Light mornings",
    surface: "Grass",
    size: "Medium",
    hours: "5a – 11p",
    fee: "Free",
    image: "linear-gradient(135deg,#1f3a2e 0%,#4d7a4a 55%,#a8c878 100%)",
    photoHue: 110,
    coords: [70, 50],
    scores: { vets: 91, stores: 78, cafes: 65, trails: 84, water: 88, parking: 92 },
    sponsor: {
      name: "Central Bark Veterinary",
      type: "Vet clinic",
      distance: "0.3 mi",
      tagline: "Same-day visits for park regulars — flash your check-in.",
    },
    promoted: true,
  },
  {
    id: "fuller",
    name: "Fuller Dog Park",
    neighborhood: "Five Points",
    blurb: "Compact neighborhood park. Tight community, weekly puppy meetups.",
    acres: 0.8,
    fenced: true,
    water: false,
    rating: 4.2,
    reviews: 388,
    crowd: "Moderate",
    surface: "Decomposed granite",
    size: "Small",
    hours: "5a – 11p",
    fee: "Free",
    image: "linear-gradient(135deg,#3a2e2a 0%,#7a5a3e 55%,#d4a574 100%)",
    photoHue: 30,
    coords: [56, 48],
    scores: { vets: 82, stores: 71, cafes: 93, trails: 42, water: 30, parking: 58 },
    sponsor: null,
    promoted: false,
  },
  {
    id: "kennedy",
    name: "Kennedy Dog Park",
    neighborhood: "Hampden",
    blurb: "Sprawling SE Denver favorite with a creek crossing and shaded cottonwood loop.",
    acres: 18,
    fenced: false,
    water: true,
    rating: 4.5,
    reviews: 1102,
    crowd: "Moderate",
    surface: "Grass + dirt",
    size: "Large",
    hours: "5a – 11p",
    fee: "Free",
    image: "linear-gradient(135deg,#2e3a2a 0%,#587a4a 55%,#b9c878 100%)",
    photoHue: 90,
    coords: [62, 80],
    scores: { vets: 70, stores: 68, cafes: 54, trails: 88, water: 82, parking: 90 },
    sponsor: null,
    promoted: false,
  },
  {
    id: "stapleton",
    name: "Stapleton Dog Park",
    neighborhood: "Central Park",
    blurb: "Open prairie park with rolling hills and a long-throw frisbee meadow.",
    acres: 4.5,
    fenced: true,
    water: false,
    rating: 4.3,
    reviews: 567,
    crowd: "Light",
    surface: "Grass",
    size: "Medium",
    hours: "5a – 11p",
    fee: "Free",
    image: "linear-gradient(135deg,#3f3a26 0%,#8a7a4a 55%,#d4c878 100%)",
    photoHue: 55,
    coords: [74, 44],
    scores: { vets: 85, stores: 82, cafes: 70, trails: 78, water: 52, parking: 88 },
    sponsor: null,
    promoted: false,
  },
  {
    id: "lowry",
    name: "Lowry Dog Park",
    neighborhood: "Lowry",
    blurb: "Two fully fenced acres split by dog size. Agility equipment up year-round.",
    acres: 2.0,
    fenced: true,
    water: false,
    rating: 4.4,
    reviews: 721,
    crowd: "Moderate",
    surface: "Grass",
    size: "Medium",
    hours: "5a – 11p",
    fee: "Free",
    image: "linear-gradient(135deg,#2a3a3f 0%,#4a7a8a 55%,#a8c8d4 100%)",
    photoHue: 195,
    coords: [66, 58],
    scores: { vets: 80, stores: 75, cafes: 72, trails: 60, water: 40, parking: 86 },
    sponsor: null,
    promoted: false,
  },
  {
    id: "barnum",
    name: "Barnum Dog Park",
    neighborhood: "Barnum",
    blurb: "West-side fenced park with mountain views at golden hour.",
    acres: 1.4,
    fenced: true,
    water: false,
    rating: 4.1,
    reviews: 244,
    crowd: "Light",
    surface: "Grass + gravel",
    size: "Small",
    hours: "5a – 11p",
    fee: "Free",
    image: "linear-gradient(135deg,#3f2a2e 0%,#8a4a5a 55%,#d47894 100%)",
    photoHue: 350,
    coords: [40, 56],
    scores: { vets: 66, stores: 70, cafes: 58, trails: 64, water: 28, parking: 72 },
    sponsor: null,
    promoted: false,
  },
  {
    id: "carla-madison",
    name: "Carla Madison Dog Park",
    neighborhood: "Uptown",
    blurb: "Tiny but mighty downtown park beside the rec center pool.",
    acres: 0.25,
    fenced: true,
    water: false,
    rating: 4.0,
    reviews: 198,
    crowd: "Busy",
    surface: "Turf",
    size: "Tiny",
    hours: "6a – 10p",
    fee: "Free",
    image: "linear-gradient(135deg,#26303f 0%,#4a5a8a 55%,#a8b4d4 100%)",
    photoHue: 220,
    coords: [52, 44],
    scores: { vets: 88, stores: 86, cafes: 96, trails: 30, water: 18, parking: 38 },
    sponsor: {
      name: "Uptown Hounds Daycare",
      type: "Dog daycare",
      distance: "0.2 mi",
      tagline: "$15 off your first half-day for park check-ins.",
    },
    promoted: true,
  },
  {
    id: "chatfield",
    name: "Chatfield Off-Leash Area",
    neighborhood: "Littleton",
    blurb: "Sprawling 69 acres with two ponds and a river crossing. Worth the drive south.",
    acres: 69,
    fenced: true,
    water: true,
    rating: 4.9,
    reviews: 3204,
    crowd: "Busy weekends",
    surface: "Mixed",
    size: "Huge",
    hours: "5a – 9p",
    fee: "$10/vehicle",
    image: "linear-gradient(135deg,#2e4a3f 0%,#5a8a6a 55%,#b9d4a8 100%)",
    photoHue: 130,
    coords: [28, 88],
    scores: { vets: 64, stores: 60, cafes: 48, trails: 96, water: 99, parking: 92 },
    sponsor: null,
    promoted: false,
  },
  {
    id: "green-valley",
    name: "Green Valley Ranch Dog Park",
    neighborhood: "GVR",
    blurb: "Northeast-side park with the metro's longest fence line and big-dog zone.",
    acres: 5.5,
    fenced: true,
    water: false,
    rating: 4.3,
    reviews: 451,
    crowd: "Light",
    surface: "Grass",
    size: "Large",
    hours: "5a – 11p",
    fee: "Free",
    image: "linear-gradient(135deg,#3a3f2a 0%,#7a8a4a 55%,#c8d478 100%)",
    photoHue: 70,
    coords: [88, 28],
    scores: { vets: 58, stores: 64, cafes: 44, trails: 70, water: 36, parking: 84 },
    sponsor: null,
    promoted: false,
  },
];

export const NEARBY: Record<string, { name: string; type: string; distance: number; promoted: boolean; hours: string }[]> = {
  "cherry-creek": [
    { name: "Cherry Creek Veterinary Hospital", type: "Vet", distance: 0.4, promoted: true, hours: "24/7" },
    { name: "Pet Palace Cherry Creek", type: "Pet store", distance: 0.6, promoted: false, hours: "9a–8p" },
    { name: "Snooze A.M. Eatery", type: "Cafe", distance: 0.9, promoted: false, hours: "6:30a–2:30p" },
    { name: "Cherry Creek Trail (head)", type: "Trail", distance: 0.1, promoted: false, hours: "Dawn–dusk" },
    { name: "Cherry Creek Reservoir", type: "Water", distance: 0.2, promoted: false, hours: "5a–10p" },
  ],
  "railyard": [
    { name: "Bark Social RiNo", type: "Bar", distance: 0.07, promoted: true, hours: "11a–12a" },
    { name: "RiNo Pet Provisions", type: "Pet store", distance: 0.3, promoted: false, hours: "10a–7p" },
    { name: "Rosenberg's Bagels", type: "Cafe", distance: 0.2, promoted: false, hours: "6a–2p" },
    { name: "Denver Animal Hospital", type: "Vet", distance: 1.1, promoted: false, hours: "8a–6p" },
    { name: "South Platte River Trail", type: "Trail", distance: 0.4, promoted: false, hours: "Dawn–dusk" },
  ],
  "berkeley-lake": [
    { name: "Tennyson Pet Supply Co.", type: "Pet store", distance: 0.6, promoted: true, hours: "10a–7p" },
    { name: "Hops & Pie", type: "Cafe", distance: 0.5, promoted: false, hours: "11a–10p" },
    { name: "Berkeley Veterinary Clinic", type: "Vet", distance: 0.9, promoted: false, hours: "8a–6p" },
    { name: "Berkeley Lake Loop", type: "Trail", distance: 0.05, promoted: false, hours: "Dawn–dusk" },
    { name: "Berkeley Lake swim beach", type: "Water", distance: 0.1, promoted: false, hours: "5a–11p" },
  ],
  "westerly-creek": [
    { name: "Central Bark Veterinary", type: "Vet", distance: 0.3, promoted: true, hours: "7a–7p" },
    { name: "Stanley Marketplace", type: "Cafe", distance: 0.8, promoted: false, hours: "8a–9p" },
    { name: "Chuck & Don's Pet Food", type: "Pet store", distance: 0.7, promoted: false, hours: "9a–8p" },
    { name: "Westerly Creek Trail", type: "Trail", distance: 0.05, promoted: false, hours: "Dawn–dusk" },
    { name: "Westerly Creek (rinse pad)", type: "Water", distance: 0.05, promoted: false, hours: "5a–11p" },
  ],
};

export const DASHBOARD = {
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

export const EMERGENCY_VETS: EmergencyVet[] = [
  {
    name: "Front Range Animal ER",
    address: "1818 N Speer Blvd, Denver",
    phone: "(303) 595-1300",
    coords: [50, 41],
    hours24: true,
    promoted: true,
    sponsor: "Sniff Preferred Partner",
    tagline: "Largest 24/7 ER team in the metro. Call ahead — they'll meet you in the lot with a stretcher.",
    triageMin: 8,
  },
  {
    name: "Mile High Veterinary Specialty + ER",
    address: "3550 S Jason St, Englewood",
    phone: "(303) 874-2080",
    coords: [48, 84],
    hours24: true,
  },
  {
    name: "Foothills Pet ER",
    address: "5775 W 13th Ave, Lakewood",
    phone: "(303) 233-1488",
    coords: [22, 48],
    hours24: true,
  },
  {
    name: "Cherry Creek Animal Hospital ER",
    address: "4140 E Iliff Ave, Denver",
    phone: "(303) 758-7777",
    coords: [68, 72],
    hours24: true,
  },
  {
    name: "Northglenn 24/7 Vet",
    address: "11800 Washington St, Northglenn",
    phone: "(303) 451-1900",
    coords: [50, 14],
    hours24: true,
  },
];

export const REVIEWS: Record<string, { user: string; dog: string; rating: number; when: string; text: string }[]> = {
  "cherry-creek": [
    { user: "Maya R.", dog: "Otis · Border Collie", rating: 5, when: "2d ago", text: "We drove an hour and it was worth every minute. Otis swam until he fell asleep in the car on the way home." },
    { user: "Brandon T.", dog: "Pippa · Goldendoodle", rating: 5, when: "1w ago", text: "Biggest off-leash area I've ever seen. The east-side prairie loop is empty even on Saturdays." },
    { user: "Sofia K.", dog: "Beans · Chihuahua mix", rating: 4, when: "2w ago", text: "Bring boots — the trail by the reservoir gets gnarly after rain. Otherwise unreal." },
  ],
  "railyard": [
    { user: "Jess M.", dog: "Mochi · Frenchie", rating: 5, when: "3d ago", text: "Tiny but pristine. We grab a beer at Bark Social right after and it feels like a whole evening out." },
    { user: "Devon L.", dog: "Rex · Lab mix", rating: 4, when: "1w ago", text: "Turf gets HOT in July afternoons. Mornings or evenings only." },
  ],
};

export interface AdCreative {
  advertiser: string;
  headline: string;
  cta: string;
  color: string;
  accent: string;
  logoText: string;
  body: string;
}

export const AD_CREATIVES: AdCreative[] = [
  { advertiser: "Chewy", headline: "Free shipping on $49+. Auto-ship saves 35%.", cta: "Shop Chewy", color: "#1B6CC4", accent: "#FFC72C", logoText: "Chewy", body: "Stock up on kibble, treats, and toys. Same-day delivery to Denver." },
  { advertiser: "The Farmer's Dog", headline: "Fresh dog food, made for your dog.", cta: "Get 50% off", color: "#2D5F3F", accent: "#F4A261", logoText: "TFD", body: "Personalized recipes. Vet-developed. Delivered to your door weekly." },
  { advertiser: "BarkBox", headline: "A box of joy, every month.", cta: "Get 1st box free", color: "#FB6F92", accent: "#FFB627", logoText: "Bark", body: "Toys, treats, and chews — themed monthly. Made for tail wags." },
  { advertiser: "Rover", headline: "5-star dog walkers in Denver.", cta: "Book in 60s", color: "#00A2B3", accent: "#FFC857", logoText: "Rover", body: "Insured, background-checked walkers. From $20/walk." },
  { advertiser: "Fi Smart Collar", headline: "Never lose your dog again.", cta: "Shop Fi", color: "#0F1B2D", accent: "#00D4AA", logoText: "Fi", body: "GPS tracking. 3-month battery. Live location on your phone." },
  { advertiser: "Trupanion", headline: "We pay 90% of your vet bills.", cta: "Get a free quote", color: "#003E7E", accent: "#FFB81C", logoText: "Trupanion", body: "Per-condition coverage, no payout limits. Trusted by Colorado vets." },
  { advertiser: "Wag!", headline: "On-demand dog walks.", cta: "Get the app", color: "#9C27B0", accent: "#F8B400", logoText: "Wag", body: "Same-day walks, drop-ins, and overnight care. Denver-wide." },
];

export const SCORE_LABEL: Record<string, string> = {
  vets: "Vets",
  stores: "Pet stores",
  cafes: "Cafés",
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
