export type VerdictTone = "positive" | "cautious" | "unclear";

export interface ExploreProperty {
  id: string;
  address: string;
  suburb: string;
  price: string;
  imageUrl: string;
  overviewImageUrl: string;
  propertyType: string;
  bedrooms: number;
  aiScore: number;
  verdict: string;
  verdictTone: VerdictTone;
  reason: string;
  recommendation: string;
  insights: [string, string, string];
  summary: string;
  tags: string[];
  watchers: string;
  chatMentions: string;
  momentum: string;
}

export const FEED_FILTERS = [
  "Best match",
  "Investor value",
  "Lifestyle fit",
  "Near transit",
] as const;

export const FILTER_DESCRIPTIONS = {
  "Best match": "Balanced across liveability, value, and risk.",
  "Investor value": "Leaning into yield support and pragmatic entry points.",
  "Lifestyle fit": "Prioritising emotional quality, amenity, and neighbourhood feel.",
  "Near transit": "Favouring rail, tram, and low-friction daily movement.",
} as const;

export const EXPLORE_PROPERTIES: ExploreProperty[] = [
  {
    id: "1",
    address: "45 Smith Street",
    suburb: "Brunswick, VIC",
    price: "Guide $750k",
    imageUrl:
      "https://images.unsplash.com/photo-1559329146-807aff9ff1fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBleHRlcmlvcnxlbnwxfHx8fDE3NjIzMjY4NDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    overviewImageUrl:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXJpYWwlMjBuZWlnaGJvdXJob29kfGVufDF8fHx8MTc3MDE0MDAwMHww&ixlib=rb-4.1.0&q=80&w=1080",
    propertyType: "Apartment",
    bedrooms: 2,
    aiScore: 8.4,
    verdict: "Worth pursuing",
    verdictTone: "positive",
    reason: "Inner-north convenience and budget discipline make this one easy to keep in play.",
    recommendation: "High rental fit",
    insights: [
      "Walk-to-tram access keeps tenant demand resilient.",
      "Entry price sits cleanly inside your current buy range.",
      "New-build profile lowers near-term maintenance friction.",
    ],
    summary:
      "A clean inner-north option for buyers who want transport, leasing depth, and lower operational drag.",
    tags: ["Transit", "Low maintenance", "Inner north"],
    watchers: "1.8k",
    chatMentions: "214",
    momentum: "+12%",
  },
  {
    id: "2",
    address: "128 Park Avenue",
    suburb: "Kew, VIC",
    price: "Guide $1.35M",
    imageUrl:
      "https://images.unsplash.com/photo-1564703048291-bcf7f001d83d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3VzZSUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NjIzNDQxMTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    overviewImageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWJ1cmIlMjBhaXJpYWx8ZW58MXx8fHwxNzcwMTQwMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    propertyType: "House",
    bedrooms: 4,
    aiScore: 8.8,
    verdict: "Worth pursuing",
    verdictTone: "positive",
    reason: "If you want long-term family confidence, this is one of the clearest fits in the feed.",
    recommendation: "Family standout",
    insights: [
      "Quiet residential rhythm aligns with owner-occupier priorities.",
      "Four-bed house format offers long-term space flexibility.",
      "School-zone depth supports family confidence and resale strength.",
    ],
    summary:
      "A high-confidence liveability pick with strong family fundamentals and premium suburb quality.",
    tags: ["Quiet street", "School zone", "Long-term hold"],
    watchers: "2.3k",
    chatMentions: "186",
    momentum: "+9%",
  },
  {
    id: "3",
    address: "67 Victoria Street",
    suburb: "South Yarra, VIC",
    price: "Guide $920k",
    imageUrl:
      "https://images.unsplash.com/photo-1630404515111-2fc17457daa6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjB0b3duaG91c2V8ZW58MXx8fHwxNzYyMjYwMzI0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    overviewImageUrl:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMGFpcmlhbHxlbnwxfHx8fDE3NzAxNDAwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    propertyType: "Townhouse",
    bedrooms: 2,
    aiScore: 8.1,
    verdict: "Proceed with caution",
    verdictTone: "cautious",
    reason: "Scarcity and lifestyle are strong, but this one needs a sharper value case before it feels easy.",
    recommendation: "Balanced growth play",
    insights: [
      "Townhouse stock here is scarcer than standard apartment inventory.",
      "Amenity and transport support both lifestyle and leasing demand.",
      "A stronger all-rounder than a purely yield-led purchase.",
    ],
    summary:
      "A premium city-fringe property that balances scarcity, walkability, and long-term flexibility.",
    tags: ["Townhouse", "Walkability", "City fringe"],
    watchers: "1.5k",
    chatMentions: "142",
    momentum: "+7%",
  },
  {
    id: "4",
    address: "18 Irving Street",
    suburb: "Footscray, VIC",
    price: "Guide $520k",
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBidWlsZGluZ3xlbnwxfHx8fDE3NjIzNDQyMTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    overviewImageUrl:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3BkZG93biUyMGNpdHl8ZW58MXx8fHwxNzcwMTQwMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    propertyType: "Unit",
    bedrooms: 2,
    aiScore: 8.9,
    verdict: "Worth pursuing",
    verdictTone: "positive",
    reason: "This is the strongest value-to-transport tradeoff in your current shortlist.",
    recommendation: "Top value candidate",
    insights: [
      "One of the clearest value pockets in your current feed.",
      "Station proximity supports a broad renter and commuter pool.",
      "Two-bedroom layout improves versatility without stretching budget.",
    ],
    summary:
      "A pragmatic value-led option for buyers who want transport access and disciplined entry pricing.",
    tags: ["Value", "Station access", "Two-bed"],
    watchers: "3.1k",
    chatMentions: "267",
    momentum: "+18%",
  },
  {
    id: "5",
    address: "3 River Esplanade",
    suburb: "Mooloolaba, QLD",
    price: "Guide $825k",
    imageUrl:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGFwYXJ0bWVudCUyMGJhbGNvbnl8ZW58MXx8fHwxNzYyMzQ0MjQxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    overviewImageUrl:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2FzdGFsJTIwYWVyaWFsfGVufDF8fHx8MTc3MDE0MDAwMHww&ixlib=rb-4.1.0&q=80&w=1080",
    propertyType: "Apartment",
    bedrooms: 2,
    aiScore: 8.5,
    verdict: "Worth pursuing",
    verdictTone: "positive",
    reason: "If lifestyle is doing real work in your brief, this is one of the cleanest emotional fits.",
    recommendation: "Lifestyle standout",
    insights: [
      "Beach access drives high emotional value day to day.",
      "Two-bed format gives flexibility without the burden of a house.",
      "Best suited to buyers prioritising lifestyle quality over raw size.",
    ],
    summary:
      "A premium coastal candidate for buyers leaning toward lifestyle, light, and low-maintenance living.",
    tags: ["Beach", "Natural light", "Coastal"],
    watchers: "2.1k",
    chatMentions: "193",
    momentum: "+11%",
  },
  {
    id: "6",
    address: "24 North Road",
    suburb: "Brighton, VIC",
    price: "Guide $950k",
    imageUrl:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMGV4dGVyaW9yfGVufDF8fHx8MTc2MjM0NDI2N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    overviewImageUrl:
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2FzdGFsJTIwc3VidXJiJTIwYWVyaWFsfGVufDF8fHx8MTc3MDE0MDAwMHww&ixlib=rb-4.1.0&q=80&w=1080",
    propertyType: "Villa",
    bedrooms: 2,
    aiScore: 8.7,
    verdict: "Proceed with caution",
    verdictTone: "cautious",
    reason: "Neighbourhood quality is obvious here, but you should be sure that premium calm is worth the extra spend.",
    recommendation: "Quiet premium fit",
    insights: [
      "Villa format lands between house comfort and apartment ease.",
      "Brighton aligns with a calm, premium owner-occupier brief.",
      "Lower upkeep without sacrificing neighbourhood quality.",
    ],
    summary:
      "A composed owner-occupier option for buyers who want quieter coastal living with less maintenance.",
    tags: ["Villa", "Quiet", "Premium"],
    watchers: "1.7k",
    chatMentions: "121",
    momentum: "+8%",
  },
];

export const VERDICT_STYLES: Record<
  VerdictTone,
  { badge: string; score: string; chip: string }
> = {
  positive: {
    badge: "border-white/20 bg-white/14 text-white",
    score: "border-emerald-200/60 bg-emerald-50/95 text-emerald-700",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  cautious: {
    badge: "border-amber-200/70 bg-amber-50/90 text-amber-800",
    score: "border-amber-200 bg-amber-50 text-amber-800",
    chip: "border-amber-200 bg-amber-50 text-amber-800",
  },
  unclear: {
    badge: "border-rose-200/70 bg-rose-50/90 text-rose-700",
    score: "border-rose-200 bg-rose-50 text-rose-700",
    chip: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

export function findProperty(propertyId: string) {
  return EXPLORE_PROPERTIES.find((property) => property.id === propertyId) ?? null;
}
