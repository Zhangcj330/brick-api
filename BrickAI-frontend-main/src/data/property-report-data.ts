import type { ExploreProperty } from "@/src/data/property-feed";
import { getBiggestCaution, getReportChecks } from "@/src/data/property-report-support";
import {
  getLifecycleStageMeta,
  getPropertyWorkflowState,
  getReportStatusLabel,
} from "@/src/data/property-state-machine";

export type ReportRow = {
  label: string;
  value: string;
};

export type ReportModule = {
  id: string;
  title: string;
  summary: string;
  rows: ReportRow[];
  tone?: "default" | "caution";
};

export type BuildingFeature = {
  label: string;
  value: string;
  status: "present" | "not_noted" | "none";
};

export type PropertyReportData = {
  identity: {
    state: string;
    postcode: string;
    bathrooms: string;
    parking: string;
    landSize: string;
    updatedAt: string;
  };
  workflow: {
    lifecycleStage: string;
    reportStatus: string;
    nextActionLabel: string;
    primaryCtaLabel: string;
    proceedTitle: string;
    proceedSummary: string;
  };
  decision: {
    score: number;
    why: string;
    biggestRisk: string;
    highlights: string[];
    concerns: string[];
  };
  proceed: {
    nextMove: string;
    checklist: string[];
  };
  building: {
    strength: string;
    strengthCues: string[];
    mainRisk: string;
    riskCues: string[];
    facts: Array<{
      label: string;
      value: string;
    }>;
    features: BuildingFeature[];
    layout: {
      basis: string;
      items: Array<{
        label: string;
        value: string;
      }>;
      read: string;
    };
    condition: {
      basis: string;
      items: Array<{
        label: string;
        value: string;
      }>;
      read: string;
    };
    defects: {
      basis: string;
      known: string[];
      checks: string[];
      maintenancePressure: string;
      reportStatus: string;
      verificationStatus: string;
      spendOutlook: string;
    };
  };
  location: {
    schoolFit: string;
    safetyPosture: string;
    transportPosture: string;
    streetFeelPosture: string;
    amenityPosture: string;
    localHazardPosture: string;
    summary: string;
    bestLocalStrength: string;
    biggestLocalTradeoff: string;
    dailyLife: Array<{
      label: string;
      value: string;
    }>;
    schools: Array<{
      name: string;
      ranking: string;
      distance: string;
      relevance: string;
    }>;
    safety: {
      crimeRate: string;
      dayNightFeel: string;
      emergencyAccess: string;
      summary: string;
    };
    streetFeel: Array<{
      label: string;
      value: string;
    }>;
    amenity: Array<{
      label: string;
      value: string;
    }>;
    localHazards: Array<{
      label: string;
      value: string;
    }>;
    mapPoints: Array<{
      label: string;
      detail: string;
      kind: "station" | "school" | "market" | "hospital" | "park";
    }>;
  };
    planning: {
      landValueEstimate: string;
      landPotentialSummary: string;
      subdivisionPotential: string;
      site: {
        parcelImageUrl: string;
        landArea: string;
        shape: string;
        cornerLot: string;
        slopeElevation: string;
        easementImpact: string;
      };
    controls: Array<{
      label: string;
      value: string;
      explainer: string;
      prompt: string;
    }>;
      subdivision: {
        summary: string;
        evidence: string[];
      };
    };
  financial: {
    title: string;
    subtitle: string;
    guidePrice: string;
    estimatedPrice: {
      low: number;
      high: number;
      mid: number;
      display: string;
      confidenceLabel: string;
      comparableSalesCount: number;
    };
    estimatedRent: {
      weekly: number;
      display: string;
      listingsCount: number;
    };
    estimatedRentalYield: string;
    priceTrend: {
      growthPct: number;
      salesCount: number;
      series: Array<{
        period: string;
        medianPrice: number;
      }>;
    };
    rentTrend: {
      growthPct: number;
      listingsCount: number;
      series: Array<{
        period: string;
        medianRent: number;
      }>;
    };
    vacancy: {
      currentRate: string;
      benchmarkRate: string;
      series: Array<{
        period: string;
        rate: number;
      }>;
    };
    marketPressure: {
      medianDaysOnMarket: number;
      series: Array<{
        period: string;
        supply: number;
        demand: number;
      }>;
    };
    recentSales: Array<{
      id: string;
      imageUrl: string;
      address: string;
      soldDate: string;
      soldPrice: string;
      propertyType: string;
      bedrooms: string;
      bathrooms: string;
      parking: string;
    }>;
  };
  modules: {
    propertyFacts: ReportModule;
    conditionQuality: ReportModule;
    defectsMaintenance: ReportModule;
    environmentLivability: ReportModule;
    planningConstraints: ReportModule;
    locationAmenity: ReportModule;
    financialInvestment: ReportModule;
    saleProcessTiming: ReportModule;
    documentsInterpretation: ReportModule;
    referenceProvenance: ReportModule;
  };
};

type PropertyReportSeed = {
  postcode: string;
  bathrooms: string;
  parking: string;
  landSize: string;
  landArea: string;
  frontage: string;
  depth: string;
  shape: string;
  cornerLot: string;
  slopeElevation: string;
  easementImpact: string;
  updatedAt: string;
  listingDate: string;
  inspection: string;
  auction: string;
  zone: string;
  landUse: string;
  council: string;
  maxHeight: string;
  floorSpaceRatio: string;
  minLotSize: string;
  setbacks: string;
  overlays: string;
  floodRisk: string;
  heritage: string;
  transit: string;
  lifestyle: string;
  safety: string;
  schoolFit: string;
  transportPosture: string;
  streetFeelPosture: string;
  amenityPosture: string;
  localHazardPosture: string;
  locationSummary: string;
  bestLocalStrength: string;
  biggestLocalTradeoff: string;
  busWalk: string;
  trainWalk: string;
  metroWalk: string;
  trafficLevel: string;
  quietness: string;
  powerLines: string;
  parkAccess: string;
  retailStreet: string;
  shoppingMall: string;
  hospitalAccess: string;
  crimeRate: string;
  dayNightFeel: string;
  schools: Array<{
    name: string;
    ranking: string;
    distance: string;
    relevance: string;
  }>;
  bushfireRisk: string;
  currentRent: string;
  rentalYield: string;
  vacancyRate: string;
  vacancyBenchmark: string;
  salesCount: number;
  rentalListingsCount: number;
  medianDaysOnMarket: number;
  estimatedPriceLow: number;
  estimatedPriceHigh: number;
  estimatedWeeklyRent: number;
  medianPriceTrend: number[];
  medianRentTrend: number[];
  vacancyTrend: number[];
  supplyDemandTrend: Array<{ period: string; supply: number; demand: number }>;
  recentSales: Array<{
    id: string;
    imageUrl: string;
    address: string;
    soldDate: string;
    soldPrice: string;
    propertyType: string;
    bedrooms: string;
    bathrooms: string;
    parking: string;
  }>;
  agent: string;
  source: string;
  landValueEstimate: string;
  landPotentialSummary: string;
  subdivisionPotential: string;
  subdivisionSummary: string;
  subdivisionEvidence: string[];
  buildingStrength: string;
  buildingRisk: string;
  levelInfo: string;
  outdoorType: string;
  buildingFeatures: BuildingFeature[];
  layoutItems: string[];
  layoutRead: string;
  maintenancePressure: string;
  buildingReportStatus: string;
  verificationStatus: string;
  shortTermSpend: string;
  condition: string[];
  defects: string[];
  environment: string[];
  documents: string[];
};

const PROPERTY_REPORT_SEEDS: Record<string, PropertyReportSeed> = {
  "1": {
    postcode: "3056",
    bathrooms: "1 bath",
    parking: "1 off-street car space",
    landSize: "84 sqm internal",
    landArea: "85 sqm land",
    frontage: "8.2m",
    depth: "10.4m",
    shape: "Regular",
    cornerLot: "No",
    slopeElevation: "Flat",
    easementImpact: "Waiting for docs",
    updatedAt: "Updated 5h ago",
    listingDate: "Listed 28 Feb 2026",
    inspection: "Sat 11:15am",
    auction: "Private sale",
    zone: "Medium-density residential",
    landUse: "Residential",
    council: "Merri-bek City Council",
    maxHeight: "4 storeys typical envelope",
    floorSpaceRatio: "N/A apartment title",
    minLotSize: "Not relevant for this title",
    setbacks: "Waiting for docs",
    overlays: "No heritage overlay",
    floodRisk: "Low",
    heritage: "No",
    transit: "Tram 4 min walk",
    lifestyle: "Cafe strip 6 min walk",
    safety: "Low-night noise tradeoff",
    schoolFit: "Good local public options",
    transportPosture: "Convenient without a car",
    streetFeelPosture: "Lively rather than quiet",
    amenityPosture: "Strong daily convenience",
    localHazardPosture: "Low local hazard",
    locationSummary: "This is a convenience-led inner-north location with strong public transport and café access, but it trades some late-night calm for that energy.",
    bestLocalStrength: "You can live here with very low daily friction.",
    biggestLocalTradeoff: "Street calm and nightlife spillover still need an in-person read.",
    busWalk: "Bus 5 min walk",
    trainWalk: "Train 11 min walk",
    metroWalk: "Metro not relevant",
    trafficLevel: "Moderate inner-urban flow",
    quietness: "Moderate, softer on side streets",
    powerLines: "No major overhead powerline concern surfaced",
    parkAccess: "Small parks 6 min walk",
    retailStreet: "Sydney Road retail strip 6 min walk",
    shoppingMall: "Major mall 14 min tram ride",
    hospitalAccess: "Royal Melbourne Hospital 16 min drive",
    crimeRate: "Typical inner-urban petty crime profile",
    dayNightFeel: "Active at night, not deserted",
    schools: [
      { name: "Brunswick Secondary College", ranking: "Solid local option", distance: "8 min drive", relevance: "Good enough for owner-occupier families, not the main drawcard" },
      { name: "Brunswick North Primary School", ranking: "Well regarded locally", distance: "12 min walk", relevance: "Useful if family plans matter later" },
    ],
    bushfireRisk: "Low",
    currentRent: "$640 / week",
    rentalYield: "4.4% gross",
    vacancyRate: "1.8%",
    vacancyBenchmark: "1.9%",
    salesCount: 11,
    rentalListingsCount: 12,
    medianDaysOnMarket: 29,
    estimatedPriceLow: 732,
    estimatedPriceHigh: 768,
    estimatedWeeklyRent: 640,
    medianPriceTrend: [718, 724, 732, 741, 748, 756],
    medianRentTrend: [590, 600, 610, 618, 628, 640],
    vacancyTrend: [2.3, 2.2, 2.1, 2.0, 1.9, 1.8],
    supplyDemandTrend: [
      { period: "Q1", supply: 54, demand: 71 },
      { period: "Q2", supply: 49, demand: 74 },
      { period: "Q3", supply: 46, demand: 78 },
    ],
    recentSales: [
      {
        id: "brunswick-1",
        imageUrl: "https://images.unsplash.com/photo-1559329146-807aff9ff1fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        address: "12 Union Street, Brunswick",
        soldDate: "Sold Feb 2026",
        soldPrice: "$748k",
        propertyType: "Apartment",
        bedrooms: "2 bed",
        bathrooms: "1 bath",
        parking: "1 car",
      },
      {
        id: "brunswick-2",
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        address: "8 Wilson Avenue, Brunswick",
        soldDate: "Sold Jan 2026",
        soldPrice: "$762k",
        propertyType: "Unit",
        bedrooms: "2 bed",
        bathrooms: "1 bath",
        parking: "1 car",
      },
      {
        id: "brunswick-3",
        imageUrl: "https://images.unsplash.com/photo-1630404515111-2fc17457daa6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        address: "27 Albert Street, Brunswick",
        soldDate: "Sold Dec 2025",
        soldPrice: "$735k",
        propertyType: "Apartment",
        bedrooms: "2 bed",
        bathrooms: "1 bath",
        parking: "1 car",
      },
    ],
    agent: "Mina Patel · Northside Property",
    source: "Domain + Brick AI image analysis",
    landValueEstimate: "$180k - $260k",
    landPotentialSummary: "This reads more like home value than land value. Title format and existing built form keep land-led upside limited.",
    subdivisionPotential: "Subdivision unlikely",
    subdivisionSummary: "Subdivision is not the main path here because this asset sits inside an existing apartment format rather than a simple land parcel.",
    subdivisionEvidence: [
      "Strata and title structure limit simple land-led subdivision upside.",
      "Established built form reduces practical redevelopment flexibility.",
    ],
    buildingStrength: "Low-friction apartment layout with clean recent presentation.",
    buildingRisk: "Building confidence still depends on strata and maintenance evidence.",
    levelInfo: "Level not noted",
    outdoorType: "No private outdoor space noted",
    buildingFeatures: [
      { label: "Pool", value: "Not noted", status: "not_noted" },
      { label: "Balcony / terrace", value: "Not noted", status: "not_noted" },
      { label: "Study nook", value: "Not noted", status: "not_noted" },
      { label: "Storage", value: "Not noted", status: "not_noted" },
      { label: "Lift access", value: "Not noted", status: "not_noted" },
      { label: "Air conditioning", value: "Not noted", status: "not_noted" },
    ],
    layoutItems: [
      "Efficient two-bed footprint with limited wasted circulation",
      "Living zone appears to carry the best natural light",
      "Compact plan favours easy day-to-day use over generous separation",
    ],
    layoutRead: "Easy daily layout with compact tradeoffs.",
    maintenancePressure: "Likely low near-term maintenance if strata quality checks land well.",
    buildingReportStatus: "No building report or strata pack reviewed yet",
    verificationStatus: "High verification needed before full conviction",
    shortTermSpend: "Low immediate cosmetic spend, moderate document risk",
    condition: ["Kitchen is modern but compact", "Bathroom presentation is clean and functional", "Flooring reads as recently updated engineered timber"],
    defects: ["No obvious structural damage in media", "Facade wear looks minor", "Still needs strata and maintenance history verification"],
    environment: ["Street feels active but not fully quiet", "Greenery is moderate rather than lush", "Natural light looks strongest in the living zone"],
    documents: ["No contract uploaded yet", "Building and strata history still missing", "No doc-grounded defect interpretation yet"],
  },
  "2": {
    postcode: "3101",
    bathrooms: "2 baths",
    parking: "2-car garage",
    landSize: "468 sqm lot",
    landArea: "468 sqm land",
    frontage: "14.8m",
    depth: "31.6m",
    shape: "Regular rectangle",
    cornerLot: "No",
    slopeElevation: "Gentle fall to rear",
    easementImpact: "Waiting for docs",
    updatedAt: "Updated yesterday",
    listingDate: "Listed 3 Mar 2026",
    inspection: "Wed 5:30pm · Sat 1:00pm",
    auction: "Auction 18 Apr 2026",
    zone: "Low-density residential",
    landUse: "Residential",
    council: "City of Boroondara",
    maxHeight: "9m",
    floorSpaceRatio: "Not codified",
    minLotSize: "300 sqm indicative minimum",
    setbacks: "Waiting for docs",
    overlays: "Tree and streetscape controls",
    floodRisk: "Low",
    heritage: "Potential streetscape sensitivity",
    transit: "Bus nearby, train requires transfer",
    lifestyle: "Strong family amenity and school access",
    safety: "Calm residential feel",
    schoolFit: "Strong school catchment story",
    transportPosture: "Convenient, but more car-dependent than inner-city options",
    streetFeelPosture: "Quiet family street",
    amenityPosture: "High family amenity",
    localHazardPosture: "Low hazard, some tree-control friction",
    locationSummary: "This is a family-first location where school access, calm streets, and suburban stability are the real value drivers.",
    bestLocalStrength: "Family confidence is much easier to justify here than in most alternatives.",
    biggestLocalTradeoff: "You give up easy rail access and some daily spontaneity.",
    busWalk: "Bus 4 min walk",
    trainWalk: "Train 18 min via bus or drive",
    metroWalk: "Metro not relevant",
    trafficLevel: "Low residential traffic",
    quietness: "High",
    powerLines: "Some standard street poles, no major corridor issue surfaced",
    parkAccess: "Neighbourhood park 5 min walk",
    retailStreet: "Village strip 7 min drive",
    shoppingMall: "Shopping centre 11 min drive",
    hospitalAccess: "St Vincent's Private Kew 9 min drive",
    crimeRate: "Low suburban crime profile",
    dayNightFeel: "Calm and predictable after dark",
    schools: [
      { name: "Kew Primary School", ranking: "Well regarded", distance: "6 min drive", relevance: "Strong fit for family buyers" },
      { name: "Kew High School", ranking: "Strong public option", distance: "8 min drive", relevance: "Supports long-term family confidence" },
    ],
    bushfireRisk: "Low",
    currentRent: "$1,180 / week",
    rentalYield: "4.0% gross",
    vacancyRate: "1.4%",
    vacancyBenchmark: "1.6%",
    salesCount: 9,
    rentalListingsCount: 11,
    medianDaysOnMarket: 36,
    estimatedPriceLow: 1325,
    estimatedPriceHigh: 1395,
    estimatedWeeklyRent: 1180,
    medianPriceTrend: [1280, 1295, 1308, 1322, 1334, 1348],
    medianRentTrend: [1080, 1095, 1110, 1130, 1155, 1180],
    vacancyTrend: [1.8, 1.7, 1.6, 1.6, 1.5, 1.4],
    supplyDemandTrend: [
      { period: "Q1", supply: 42, demand: 66 },
      { period: "Q2", supply: 38, demand: 69 },
      { period: "Q3", supply: 36, demand: 72 },
    ],
    recentSales: [
      {
        id: "kew-1",
        imageUrl: "https://images.unsplash.com/photo-1564703048291-bcf7f001d83d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        address: "54 Sackville Street, Kew",
        soldDate: "Sold Feb 2026",
        soldPrice: "$1.38m",
        propertyType: "House",
        bedrooms: "4 bed",
        bathrooms: "2 bath",
        parking: "2 car",
      },
      {
        id: "kew-2",
        imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        address: "19 Belford Road, Kew",
        soldDate: "Sold Jan 2026",
        soldPrice: "$1.34m",
        propertyType: "House",
        bedrooms: "4 bed",
        bathrooms: "2 bath",
        parking: "2 car",
      },
      {
        id: "kew-3",
        imageUrl: "https://images.unsplash.com/photo-1460317442991-0ec209397118?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        address: "7 Edgevale Road, Kew",
        soldDate: "Sold Nov 2025",
        soldPrice: "$1.31m",
        propertyType: "House",
        bedrooms: "4 bed",
        bathrooms: "2 bath",
        parking: "2 car",
      },
    ],
    agent: "Leah Warren · Kew Family Realty",
    source: "REA + suburb and planning overlays",
    landValueEstimate: "$780k - $980k",
    landPotentialSummary: "The lot has real land appeal and low-density settings keep optionality alive, but any split thesis still depends on proper planning docs.",
    subdivisionPotential: "Subdivision possible with checks",
    subdivisionSummary: "A split may be possible, but frontage, rear easement, and council character controls all need confirming before this becomes a real thesis.",
    subdivisionEvidence: [
      "Rear easement trims usable split depth.",
      "Neighbourhood character controls could limit form and access.",
      "Lot size is supportive, but not enough on its own.",
    ],
    buildingStrength: "Family-sized house format with strong light and easy day-to-day usability.",
    buildingRisk: "Premium pricing raises the bar for hidden maintenance and value discipline.",
    levelInfo: "Single dwelling",
    outdoorType: "Garden / backyard",
    buildingFeatures: [
      { label: "Pool", value: "None noted", status: "none" },
      { label: "Study nook", value: "Not noted", status: "not_noted" },
      { label: "Garden", value: "Present", status: "present" },
      { label: "Outdoor entertaining", value: "Not noted", status: "not_noted" },
      { label: "Air conditioning", value: "Not noted", status: "not_noted" },
      { label: "Solar", value: "Not noted", status: "not_noted" },
    ],
    layoutItems: [
      "Four-bed house format supports strong bedroom separation",
      "Main living areas appear to hold natural light well",
      "Family use looks easier than many comparable premium alternatives",
    ],
    layoutRead: "Family-friendly layout with low daily friction.",
    maintenancePressure: "Moderate ongoing upkeep remains possible because of house format and garden load.",
    buildingReportStatus: "No building report reviewed yet",
    verificationStatus: "Medium verification needed before moving to offer conviction",
    shortTermSpend: "Likely manageable cosmetic spend, but exterior upkeep still needs checking",
    condition: ["Kitchen presents as renovated within the last cycle", "Bathrooms feel liveable now but not ultra-premium", "Natural light is good across the main living areas"],
    defects: ["No obvious structural distress in images", "Premium suburb pricing could hide weaker value discipline", "Garden and exterior upkeep should be confirmed at inspection"],
    environment: ["Quiet residential rhythm is a major strength", "Privacy looks better than typical family alternatives", "Low noise exposure appears likely but still worth verifying in person"],
    documents: ["Contract not yet interpreted", "No school-zone evidence pack attached", "Comparable-sales proof still needs to be compiled"],
  },
  "3": {
    postcode: "3141",
    bathrooms: "2 baths",
    parking: "Single secure car space",
    landSize: "152 sqm internal + terrace",
    landArea: "155 sqm land",
    frontage: "6.1m",
    depth: "25.4m",
    shape: "Narrow urban lot",
    cornerLot: "No",
    slopeElevation: "Mostly flat",
    easementImpact: "Waiting for docs",
    updatedAt: "Updated 3d ago",
    listingDate: "Listed 25 Feb 2026",
    inspection: "Sat 12:30pm",
    auction: "Private sale",
    zone: "Medium-density residential",
    landUse: "Residential",
    council: "City of Stonnington",
    maxHeight: "11m",
    floorSpaceRatio: "Site-specific controls apply",
    minLotSize: "No clear subdivision minimum surfaced",
    setbacks: "Waiting for docs",
    overlays: "Activity centre controls",
    floodRisk: "Moderate urban runoff exposure",
    heritage: "No direct heritage listing found",
    transit: "Train and tram access are strong",
    lifestyle: "High walkability and city-fringe appeal",
    safety: "Good activation, mixed late-night noise risk",
    schoolFit: "Adequate, not the main reason to buy",
    transportPosture: "Excellent without a car",
    streetFeelPosture: "Active, mixed calm",
    amenityPosture: "Very strong walkability",
    localHazardPosture: "Some local flood and noise sensitivity",
    locationSummary: "This location wins on walkability, transport, and city-fringe flexibility, but you need to be comfortable with a more active, less sheltered street rhythm.",
    bestLocalStrength: "Daily movement is easy and amenity is dense.",
    biggestLocalTradeoff: "Noise, privacy, and urban intensity are real tradeoffs.",
    busWalk: "Bus 3 min walk",
    trainWalk: "Train 7 min walk",
    metroWalk: "Metro not relevant",
    trafficLevel: "Moderate to high urban traffic",
    quietness: "Mixed, quieter off the main strip",
    powerLines: "Some visible poles in nearby streetscape",
    parkAccess: "Pocket park 8 min walk",
    retailStreet: "Chapel Street precinct 6 min walk",
    shoppingMall: "Major retail precinct 10 min walk",
    hospitalAccess: "Alfred Hospital 11 min drive",
    crimeRate: "Moderate inner-urban crime profile",
    dayNightFeel: "Active and well lit, but noisier",
    schools: [
      { name: "South Yarra Primary School", ranking: "Solid local option", distance: "10 min walk", relevance: "Useful but not the main purchase driver" },
      { name: "Melbourne High catchment context", ranking: "Selective / competitive", distance: "Short train access", relevance: "Relevant only for certain buyer profiles" },
    ],
    bushfireRisk: "Low",
    currentRent: "$890 / week",
    rentalYield: "5.0% gross",
    vacancyRate: "2.1%",
    vacancyBenchmark: "2.3%",
    salesCount: 14,
    rentalListingsCount: 16,
    medianDaysOnMarket: 31,
    estimatedPriceLow: 900,
    estimatedPriceHigh: 950,
    estimatedWeeklyRent: 890,
    medianPriceTrend: [875, 882, 894, 901, 912, 920],
    medianRentTrend: [820, 835, 848, 860, 874, 890],
    vacancyTrend: [2.5, 2.4, 2.4, 2.3, 2.2, 2.1],
    supplyDemandTrend: [
      { period: "Q1", supply: 61, demand: 64 },
      { period: "Q2", supply: 57, demand: 68 },
      { period: "Q3", supply: 52, demand: 71 },
    ],
    recentSales: [
      {
        id: "sy-1",
        imageUrl: "https://images.unsplash.com/photo-1630404515111-2fc17457daa6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        address: "11 Murphy Street, South Yarra",
        soldDate: "Sold Feb 2026",
        soldPrice: "$938k",
        propertyType: "Townhouse",
        bedrooms: "2 bed",
        bathrooms: "2 bath",
        parking: "1 car",
      },
      {
        id: "sy-2",
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        address: "4 Davis Avenue, South Yarra",
        soldDate: "Sold Jan 2026",
        soldPrice: "$905k",
        propertyType: "Townhouse",
        bedrooms: "2 bed",
        bathrooms: "2 bath",
        parking: "1 car",
      },
      {
        id: "sy-3",
        imageUrl: "https://images.unsplash.com/photo-1559329146-807aff9ff1fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        address: "28 Argo Street, South Yarra",
        soldDate: "Sold Dec 2025",
        soldPrice: "$918k",
        propertyType: "Townhouse",
        bedrooms: "2 bed",
        bathrooms: "2 bath",
        parking: "1 car",
      },
    ],
    agent: "Oliver Ng · South Yarra Projects",
    source: "Domain + planning overlays",
    landValueEstimate: "$320k - $460k",
    landPotentialSummary: "There is some land signal here, but the attached urban format makes this more usable as housing than as a clean land play.",
    subdivisionPotential: "Subdivision unlikely",
    subdivisionSummary: "Subdivision is unlikely to be the value story because the lot is narrow and the existing townhouse format already uses the land quite efficiently.",
    subdivisionEvidence: [
      "Narrow frontage weakens subdivision flexibility.",
      "Existing attached format reduces clean land optionality.",
      "Urban controls matter more than raw lot splitting.",
    ],
    buildingStrength: "Townhouse format gives stronger separation and emotional appeal than nearby apartment stock.",
    buildingRisk: "Formal building and privacy checks still need to support the premium story.",
    levelInfo: "Multi-level townhouse",
    outdoorType: "Terrace",
    buildingFeatures: [
      { label: "Pool", value: "None noted", status: "none" },
      { label: "Balcony / terrace", value: "Present", status: "present" },
      { label: "Study nook", value: "Not noted", status: "not_noted" },
      { label: "Storage", value: "Not noted", status: "not_noted" },
      { label: "Secure parking", value: "Present", status: "present" },
      { label: "Air conditioning", value: "Not noted", status: "not_noted" },
    ],
    layoutItems: [
      "Townhouse split gives stronger living and sleeping separation",
      "Terrace connection is one of the main daily-liveability positives",
      "Urban lot width likely keeps some spaces efficient rather than generous",
    ],
    layoutRead: "Strong liveability for a two-bed urban format.",
    maintenancePressure: "Moderate verification pressure because premium finish assumptions remain untested.",
    buildingReportStatus: "No building report attached",
    verificationStatus: "High verification needed before price conviction",
    shortTermSpend: "Low immediate cosmetic spend, but unknown structural and privacy checks remain",
    condition: ["Interior styling feels modern and well-kept", "Townhouse format gives stronger separation than typical apartment stock", "Terrace and light quality look like major emotional positives"],
    defects: ["Value case remains the core risk", "No contract review yet", "Urban noise and privacy still need direct verification"],
    environment: ["Excellent access to amenity", "Road and nightlife exposure are the biggest livability unknowns", "Walkability is a real strength if the user tolerates city-fringe intensity"],
    documents: ["Contract missing", "No building report attached", "No planning memo on future adjacent development risk"],
  },
  "4": {
    postcode: "3011",
    bathrooms: "1 bath",
    parking: "1 secure car space",
    landSize: "78 sqm internal",
    landArea: "78 sqm land",
    frontage: "5.8m",
    depth: "13.4m",
    shape: "Compact rectangle",
    cornerLot: "No",
    slopeElevation: "Flat",
    easementImpact: "Waiting for docs",
    updatedAt: "Updated 2h ago",
    listingDate: "Listed 6 Mar 2026",
    inspection: "Sat 10:00am",
    auction: "Private sale",
    zone: "High-density urban",
    landUse: "Mixed use",
    council: "Maribyrnong City Council",
    maxHeight: "12m+ subject to precinct controls",
    floorSpaceRatio: "Precinct-led envelope",
    minLotSize: "Not the main limiting control",
    setbacks: "Waiting for docs",
    overlays: "No heritage, no flood overlay flagged",
    floodRisk: "Low",
    heritage: "No",
    transit: "Station 7 min walk",
    lifestyle: "Strong everyday convenience",
    safety: "Mixed urban edge but active area",
    schoolFit: "Functional local options",
    transportPosture: "Very convenient without a car",
    streetFeelPosture: "Practical urban setting",
    amenityPosture: "Strong daily convenience",
    localHazardPosture: "Low site hazard, moderate urban nuisance",
    locationSummary: "This location works because transport and convenience are easy, even if the streetscape feels more practical than polished.",
    bestLocalStrength: "Station access and everyday convenience are hard to beat at this price point.",
    biggestLocalTradeoff: "Street polish and long quiet windows are not the main strengths.",
    busWalk: "Bus 3 min walk",
    trainWalk: "Station 7 min walk",
    metroWalk: "Metro not relevant",
    trafficLevel: "Moderate arterial spill nearby",
    quietness: "Moderate",
    powerLines: "Standard urban poles visible in some streets",
    parkAccess: "Linear reserve 9 min walk",
    retailStreet: "Local retail strip 5 min walk",
    shoppingMall: "Shopping centre 12 min drive",
    hospitalAccess: "Western Hospital 11 min drive",
    crimeRate: "Moderate urban crime profile",
    dayNightFeel: "Active rather than empty",
    schools: [
      { name: "Footscray Primary School", ranking: "Local option", distance: "9 min walk", relevance: "Useful for nearby owner-occupier demand" },
      { name: "Footscray High School", ranking: "Improving reputation", distance: "8 min drive", relevance: "More relevant for family resale logic than immediate use" },
    ],
    bushfireRisk: "Low",
    currentRent: "$560 / week",
    rentalYield: "5.6% gross",
    vacancyRate: "2.4%",
    vacancyBenchmark: "2.5%",
    salesCount: 18,
    rentalListingsCount: 21,
    medianDaysOnMarket: 27,
    estimatedPriceLow: 515,
    estimatedPriceHigh: 540,
    estimatedWeeklyRent: 560,
    medianPriceTrend: [492, 498, 505, 511, 517, 524],
    medianRentTrend: [520, 528, 536, 545, 552, 560],
    vacancyTrend: [2.9, 2.8, 2.7, 2.6, 2.5, 2.4],
    supplyDemandTrend: [
      { period: "Q1", supply: 68, demand: 73 },
      { period: "Q2", supply: 63, demand: 77 },
      { period: "Q3", supply: 59, demand: 82 },
    ],
    recentSales: [
      {
        id: "footscray-1",
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        address: "9 Donald Street, Footscray",
        soldDate: "Sold Feb 2026",
        soldPrice: "$528k",
        propertyType: "Unit",
        bedrooms: "2 bed",
        bathrooms: "1 bath",
        parking: "1 car",
      },
      {
        id: "footscray-2",
        imageUrl: "https://images.unsplash.com/photo-1559329146-807aff9ff1fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        address: "31 Leeds Street, Footscray",
        soldDate: "Sold Jan 2026",
        soldPrice: "$515k",
        propertyType: "Apartment",
        bedrooms: "2 bed",
        bathrooms: "1 bath",
        parking: "1 car",
      },
      {
        id: "footscray-3",
        imageUrl: "https://images.unsplash.com/photo-1630404515111-2fc17457daa6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        address: "6 Hopkins Street, Footscray",
        soldDate: "Sold Dec 2025",
        soldPrice: "$536k",
        propertyType: "Unit",
        bedrooms: "2 bed",
        bathrooms: "1 bath",
        parking: "1 car",
      },
    ],
    agent: "Sophie Tran · Westline Residential",
    source: "REA + train catchment + image analysis",
    landValueEstimate: "$140k - $220k",
    landPotentialSummary: "This is mainly an urban convenience asset. Land optionality is limited and should not be the main reason to pursue it.",
    subdivisionPotential: "Subdivision unlikely",
    subdivisionSummary: "Subdivision is unlikely because the lot is compact and already used efficiently in an urban format.",
    subdivisionEvidence: [
      "Compact site dimensions leave little room for a viable split.",
      "Urban controls are more about envelope than simple lot splitting.",
      "Precinct context helps demand, not land optionality.",
    ],
    buildingStrength: "Efficient two-bed plan keeps the building story practical and usable.",
    buildingRisk: "Strata quality and long-term noise are still the main building-side unknowns.",
    levelInfo: "Level not noted",
    outdoorType: "No private outdoor space noted",
    buildingFeatures: [
      { label: "Pool", value: "None noted", status: "none" },
      { label: "Balcony / terrace", value: "Not noted", status: "not_noted" },
      { label: "Study nook", value: "Not noted", status: "not_noted" },
      { label: "Storage", value: "Not noted", status: "not_noted" },
      { label: "Lift access", value: "Not noted", status: "not_noted" },
      { label: "Air conditioning", value: "Not noted", status: "not_noted" },
    ],
    layoutItems: [
      "Two-bed footprint appears efficient and easy to furnish",
      "Practical rather than generous room proportions are likely",
      "Versatility comes more from clean basics than standout design moves",
    ],
    layoutRead: "Functionally sound layout that suits value-led buyers.",
    maintenancePressure: "Moderate because strata quality and noise durability remain unchecked.",
    buildingReportStatus: "Building report and strata minutes still missing",
    verificationStatus: "High verification needed before strong owner-occupier conviction",
    shortTermSpend: "Low immediate cosmetic pressure, moderate verification risk",
    condition: ["Layout is efficient and practical", "Kitchen and bathroom feel serviceable rather than aspirational", "Presentation suggests low immediate cosmetic spend"],
    defects: ["Need to verify building quality and strata history", "Long-term noise exposure still needs routine checking", "No document-grounded maintenance review yet"],
    environment: ["Transport access is one of the best strengths here", "Day-to-day convenience is high", "Street character is more practical than polished"],
    documents: ["Contract not interpreted yet", "Strata minutes still missing", "Building report still needed before full conviction"],
  },
  "5": {
    postcode: "4557",
    bathrooms: "2 baths",
    parking: "1 basement car space",
    landSize: "96 sqm internal + balcony",
    landArea: "105 sqm land",
    frontage: "7.4m",
    depth: "14.2m",
    shape: "Regular apartment parcel",
    cornerLot: "No",
    slopeElevation: "Flat coastal site",
    easementImpact: "Waiting for docs",
    updatedAt: "Archived last week",
    listingDate: "Listed 22 Feb 2026",
    inspection: "Sat 2:00pm",
    auction: "Private sale",
    zone: "High-density residential",
    landUse: "Residential",
    council: "Sunshine Coast Council",
    maxHeight: "12m",
    floorSpaceRatio: "Higher density coastal controls",
    minLotSize: "Not the main issue for this title",
    setbacks: "Waiting for docs",
    overlays: "Coastal management overlay",
    floodRisk: "Coastal exposure worth reviewing",
    heritage: "No",
    transit: "Car-first daily movement",
    lifestyle: "Beach-led premium lifestyle",
    safety: "Tourist activity varies by season",
    schoolFit: "Secondary to lifestyle appeal",
    transportPosture: "Car-first",
    streetFeelPosture: "Bright, active coastal strip",
    amenityPosture: "Excellent leisure amenity",
    localHazardPosture: "Coastal exposure worth respecting",
    locationSummary: "The location is emotionally strong because of beach access and lifestyle, but daily movement is more car-led and environmental exposure matters more here.",
    bestLocalStrength: "Beach-led amenity is a real lifestyle differentiator.",
    biggestLocalTradeoff: "Coastal exposure and tourist-season rhythm add noise to the story.",
    busWalk: "Bus 6 min walk",
    trainWalk: "Train not nearby",
    metroWalk: "Metro not relevant",
    trafficLevel: "Seasonal coastal congestion",
    quietness: "Mixed by season",
    powerLines: "No major overhead corridor surfaced",
    parkAccess: "Foreshore and open space 4 min walk",
    retailStreet: "Beach retail strip 5 min walk",
    shoppingMall: "Major mall 14 min drive",
    hospitalAccess: "Sunshine Coast University Hospital 18 min drive",
    crimeRate: "Low to moderate tourist-area petty crime",
    dayNightFeel: "Well activated, seasonal nightlife pockets",
    schools: [
      { name: "Mooloolaba State School", ranking: "Local public option", distance: "8 min drive", relevance: "Relevant if family use matters, but not the core draw here" },
      { name: "Mountain Creek State High School", ranking: "Solid regional option", distance: "12 min drive", relevance: "Moderate family relevance" },
    ],
    bushfireRisk: "Low",
    currentRent: "$760 / week",
    rentalYield: "4.8% gross",
    vacancyRate: "1.9%",
    vacancyBenchmark: "2.0%",
    salesCount: 10,
    rentalListingsCount: 14,
    medianDaysOnMarket: 34,
    estimatedPriceLow: 805,
    estimatedPriceHigh: 845,
    estimatedWeeklyRent: 760,
    medianPriceTrend: [782, 790, 799, 808, 816, 825],
    medianRentTrend: [700, 714, 726, 739, 751, 760],
    vacancyTrend: [2.3, 2.2, 2.2, 2.1, 2.0, 1.9],
    supplyDemandTrend: [
      { period: "Q1", supply: 48, demand: 62 },
      { period: "Q2", supply: 45, demand: 64 },
      { period: "Q3", supply: 43, demand: 67 },
    ],
    recentSales: [
      {
        id: "mooloolaba-1",
        imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        address: "22 River Esplanade, Mooloolaba",
        soldDate: "Sold Feb 2026",
        soldPrice: "$818k",
        propertyType: "Apartment",
        bedrooms: "2 bed",
        bathrooms: "2 bath",
        parking: "1 car",
      },
      {
        id: "mooloolaba-2",
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        address: "5 Meta Street, Mooloolaba",
        soldDate: "Sold Jan 2026",
        soldPrice: "$832k",
        propertyType: "Apartment",
        bedrooms: "2 bed",
        bathrooms: "2 bath",
        parking: "1 car",
      },
      {
        id: "mooloolaba-3",
        imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        address: "17 Burnett Street, Mooloolaba",
        soldDate: "Sold Dec 2025",
        soldPrice: "$806k",
        propertyType: "Apartment",
        bedrooms: "2 bed",
        bathrooms: "2 bath",
        parking: "1 car",
      },
    ],
    agent: "Ella James · Coastline Living",
    source: "Domain + coastal planning data",
    landValueEstimate: "$210k - $320k",
    landPotentialSummary: "Coastal scarcity matters more than land optionality here. The value case is lifestyle-led, not development-led.",
    subdivisionPotential: "Subdivision unlikely",
    subdivisionSummary: "Subdivision is not the likely value path because this is already structured as higher-density coastal residential stock.",
    subdivisionEvidence: [
      "Higher-density title structure limits simple land-led plays.",
      "Coastal overlay adds approval sensitivity.",
      "Scarcity value is stronger than split-lot value.",
    ],
    buildingStrength: "Balcony-led apartment format matches the low-maintenance coastal brief well.",
    buildingRisk: "Coastal wear and body corporate quality still need formal evidence.",
    levelInfo: "Level not noted",
    outdoorType: "Balcony",
    buildingFeatures: [
      { label: "Pool", value: "Not noted", status: "not_noted" },
      { label: "Balcony / terrace", value: "Present", status: "present" },
      { label: "Lift access", value: "Not noted", status: "not_noted" },
      { label: "Storage", value: "Not noted", status: "not_noted" },
      { label: "Air conditioning", value: "Not noted", status: "not_noted" },
      { label: "Security / intercom", value: "Not noted", status: "not_noted" },
    ],
    layoutItems: [
      "Balcony and outlook likely do heavy lifting for daily enjoyment",
      "Two-bed apartment format fits a lifestyle-led, lower-upkeep brief",
      "Internal flexibility appears solid, but not deeply family-scaled",
    ],
    layoutRead: "Lifestyle-strong layout with low-maintenance appeal.",
    maintenancePressure: "Moderate because coastal wear and body corporate quality can change the story quickly.",
    buildingReportStatus: "No body corporate pack or building review uploaded",
    verificationStatus: "High verification needed before relying on the low-upkeep story",
    shortTermSpend: "Low immediate cosmetic spend, but coastal maintenance risk needs checking",
    condition: ["Balcony and outlook are major positives", "Apartment finish reads polished and lifestyle-led", "Maintenance profile should be lower than a house alternative"],
    defects: ["Lifestyle premium may outrun the main brief", "Coastal wear should be checked", "No contract interpretation yet"],
    environment: ["Beach access is the primary emotional driver", "Light and outlook are likely strong", "Storm and coastal exposure are the main environmental caveats"],
    documents: ["No body corporate pack uploaded", "No insurance review", "No coastal risk interpretation memo"],
  },
  "6": {
    postcode: "3186",
    bathrooms: "1 bath",
    parking: "Single garage",
    landSize: "118 sqm internal",
    landArea: "251 sqm land",
    frontage: "9.6m",
    depth: "26.1m",
    shape: "Regular villa site",
    cornerLot: "No",
    slopeElevation: "Mostly flat",
    easementImpact: "Waiting for docs",
    updatedAt: "Updated 1d ago",
    listingDate: "Listed 1 Mar 2026",
    inspection: "Sat 9:45am",
    auction: "Private sale",
    zone: "Low-density residential",
    landUse: "Residential",
    council: "Bayside City Council",
    maxHeight: "9m",
    floorSpaceRatio: "Not codified",
    minLotSize: "300 sqm indicative minimum",
    setbacks: "Waiting for docs",
    overlays: "Neighbourhood character overlay",
    floodRisk: "Low",
    heritage: "No direct heritage flag",
    transit: "Good rail access, car still useful",
    lifestyle: "Quiet premium coastal rhythm",
    safety: "High perceived safety",
    schoolFit: "Good if family plans matter later",
    transportPosture: "Good, but still easier with a car",
    streetFeelPosture: "Quiet and premium",
    amenityPosture: "Strong local amenity",
    localHazardPosture: "Low hazard",
    locationSummary: "This location wins on calm, safety, and premium coastal feel. It is less about intensity and more about quiet daily quality.",
    bestLocalStrength: "The street feel is calm and confidence-building.",
    biggestLocalTradeoff: "You pay for quiet premium positioning and still use a car more than inner-city buyers.",
    busWalk: "Bus 6 min walk",
    trainWalk: "Train 11 min walk",
    metroWalk: "Metro not relevant",
    trafficLevel: "Low residential flow",
    quietness: "High",
    powerLines: "Some standard poles, no major corridor issue surfaced",
    parkAccess: "Neighbourhood reserve 7 min walk",
    retailStreet: "Village strip 8 min walk",
    shoppingMall: "Regional centre 13 min drive",
    hospitalAccess: "Sandringham Hospital 9 min drive",
    crimeRate: "Low crime profile",
    dayNightFeel: "Quiet and comfortable after dark",
    schools: [
      { name: "Brighton Primary School", ranking: "Well regarded", distance: "7 min drive", relevance: "Strong support for family resale logic" },
      { name: "Brighton Secondary College", ranking: "Strong local option", distance: "9 min drive", relevance: "Helpful for longer-horizon owner-occupier buyers" },
    ],
    bushfireRisk: "Low",
    currentRent: "$770 / week",
    rentalYield: "4.2% gross",
    vacancyRate: "1.3%",
    vacancyBenchmark: "1.5%",
    salesCount: 8,
    rentalListingsCount: 10,
    medianDaysOnMarket: 38,
    estimatedPriceLow: 930,
    estimatedPriceHigh: 972,
    estimatedWeeklyRent: 770,
    medianPriceTrend: [905, 914, 922, 931, 940, 950],
    medianRentTrend: [720, 731, 742, 751, 761, 770],
    vacancyTrend: [1.8, 1.7, 1.6, 1.5, 1.4, 1.3],
    supplyDemandTrend: [
      { period: "Q1", supply: 37, demand: 58 },
      { period: "Q2", supply: 34, demand: 61 },
      { period: "Q3", supply: 31, demand: 63 },
    ],
    recentSales: [
      {
        id: "brighton-1",
        imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        address: "14 Male Street, Brighton",
        soldDate: "Sold Feb 2026",
        soldPrice: "$958k",
        propertyType: "Villa",
        bedrooms: "2 bed",
        bathrooms: "1 bath",
        parking: "1 car",
      },
      {
        id: "brighton-2",
        imageUrl: "https://images.unsplash.com/photo-1564703048291-bcf7f001d83d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        address: "3 Bay Street, Brighton",
        soldDate: "Sold Jan 2026",
        soldPrice: "$944k",
        propertyType: "Villa",
        bedrooms: "2 bed",
        bathrooms: "1 bath",
        parking: "1 car",
      },
      {
        id: "brighton-3",
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        address: "29 St Andrews Street, Brighton",
        soldDate: "Sold Dec 2025",
        soldPrice: "$932k",
        propertyType: "Villa",
        bedrooms: "2 bed",
        bathrooms: "1 bath",
        parking: "1 car",
      },
    ],
    agent: "Ben Carter · Brighton Coast",
    source: "REA + planning overlays + map context",
    landValueEstimate: "$500k - $680k",
    landPotentialSummary: "The site carries some land value, but the current story is modest upside rather than clear subdivision confidence.",
    subdivisionPotential: "Possible with checks",
    subdivisionSummary: "A split may be theoretically possible, but lot size and neighbourhood character rules mean it needs a real feasibility check before it matters.",
    subdivisionEvidence: [
      "Lot size may be too tight once character setbacks are applied.",
      "Low-density neighbourhood controls may cap intensity.",
      "Minor easement impact is manageable, but not irrelevant.",
    ],
    buildingStrength: "Villa form gives calm liveability without the upkeep load of a larger house.",
    buildingRisk: "The premium spend only works if maintenance and condition claims hold up.",
    levelInfo: "Single-level villa",
    outdoorType: "Private garden / yard",
    buildingFeatures: [
      { label: "Pool", value: "None noted", status: "none" },
      { label: "Courtyard / garden", value: "Present", status: "present" },
      { label: "Study nook", value: "Not noted", status: "not_noted" },
      { label: "Storage", value: "Not noted", status: "not_noted" },
      { label: "Air conditioning", value: "Not noted", status: "not_noted" },
      { label: "Solar", value: "Not noted", status: "not_noted" },
    ],
    layoutItems: [
      "Villa format should keep movement simple and low-friction",
      "Privacy appears stronger than many similarly priced alternatives",
      "Two-bed layout suits downsizer or couple use more than large-family flexibility",
    ],
    layoutRead: "Quiet and easy daily layout with premium owner-occupier fit.",
    maintenancePressure: "Medium because older villa stock can hide upkeep behind calm presentation.",
    buildingReportStatus: "No building report or maintenance history summary reviewed",
    verificationStatus: "Medium verification needed before paying the premium confidently",
    shortTermSpend: "Likely manageable cosmetic spend, but hidden upkeep risk remains open",
    condition: ["Villa format is a structural strength", "Presentation is calm and premium without feeling flashy", "Finishes look solid, but some age may still exist behind the scenes"],
    defects: ["Premium spend remains the central concern", "Need to verify that lower-upkeep story is real", "No document-backed building evidence yet"],
    environment: ["Quiet street rhythm is a major plus", "Privacy appears strong", "Lifestyle upside is real if the brief can justify the premium"],
    documents: ["Contract not reviewed", "No building report attached", "No maintenance history summary yet"],
  },
};

function getStateFromSuburb(suburb: string) {
  return suburb.split(",")[1]?.trim() ?? "VIC";
}

function formatCompactDollar(value: number) {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}m`;
  }

  return `$${value.toLocaleString()}k`;
}

function formatPriceRange(low: number, high: number) {
  return `${formatCompactDollar(low)} - ${formatCompactDollar(high)}`;
}

function calculateGrowthPct(values: number[]) {
  if (values.length < 2 || values[0] === 0) return 0;

  return ((values[values.length - 1] - values[0]) / values[0]) * 100;
}

function mapBuildingObservations(
  items: string[],
  labels: string[],
) {
  return items.map((value, index) => ({
    label: labels[index] ?? `Observation ${index + 1}`,
    value,
  }));
}

export function getPropertyReportData(property: ExploreProperty): PropertyReportData {
  const seed = PROPERTY_REPORT_SEEDS[property.id];
  const reportChecks = getReportChecks(property);
  const biggestRisk = getBiggestCaution(property);
  const state = getStateFromSuburb(property.suburb);
  const workflow = getPropertyWorkflowState(property.id);
  const stage = getLifecycleStageMeta(workflow.lifecycleStage);
  const baseChecklist = [...stage.checklist];
  const mergedChecklist = [...new Set([...baseChecklist, ...reportChecks])];
  const suburbName = property.suburb.split(",")[0]?.trim() ?? property.suburb;
  const propertyTypeLabel = `${property.bedrooms}+ bedroom ${property.propertyType.toLowerCase()}${property.bedrooms > 1 ? "s" : ""}`;
  const trendPeriods = ["2021", "2022", "2023", "2024", "2025", "2026"];
  const estimatedPriceMid = Math.round((seed.estimatedPriceLow + seed.estimatedPriceHigh) / 2);

  return {
    identity: {
      state,
      postcode: seed.postcode,
      bathrooms: seed.bathrooms,
      parking: seed.parking,
      landSize: seed.landSize,
      updatedAt: workflow.updatedAt,
    },
    workflow: {
      lifecycleStage: stage.label,
      reportStatus: getReportStatusLabel(workflow.reportStatus),
      nextActionLabel: stage.nextActionLabel,
      primaryCtaLabel: stage.primaryCtaLabel,
      proceedTitle: stage.proceedTitle,
      proceedSummary: stage.proceedSummary,
    },
    decision: {
      score: property.aiScore,
      why: property.summary,
      biggestRisk,
      highlights: property.insights,
      concerns: [biggestRisk, ...seed.defects.slice(0, 2)],
    },
    proceed: {
      nextMove: stage.nextActionLabel,
      checklist: mergedChecklist,
    },
    building: {
      strength: seed.buildingStrength,
      strengthCues: [seed.layoutRead, seed.condition[0]].filter(Boolean).slice(0, 2),
      mainRisk: seed.buildingRisk,
      riskCues: [seed.buildingReportStatus, seed.shortTermSpend].filter(Boolean).slice(0, 2),
      facts: [
        { label: "Property type", value: property.propertyType },
        { label: "Dwelling form", value: property.propertyType },
        { label: "Bedrooms", value: String(property.bedrooms) },
        { label: "Bathrooms", value: seed.bathrooms },
        { label: "Parking", value: seed.parking },
        { label: "Internal / lot size", value: seed.landSize },
        { label: "Site area", value: seed.landArea },
        { label: "Level / storey", value: seed.levelInfo },
        { label: "Outdoor type", value: seed.outdoorType },
      ],
      features: seed.buildingFeatures,
      layout: {
        basis: "Visual read",
        items: mapBuildingObservations(seed.layoutItems, [
          "Layout efficiency",
          "Natural light",
          "Daily usability",
        ]),
        read: seed.layoutRead,
      },
      condition: {
        basis: "Listing + visual read",
        items: mapBuildingObservations(seed.condition, [
          "Kitchen / core finish",
          "Bathroom / presentation",
          "Material / finish feel",
        ]),
        read: seed.shortTermSpend,
      },
      defects: {
        basis: "Not verified",
        known: seed.defects,
        checks: seed.documents,
        maintenancePressure: seed.maintenancePressure,
        reportStatus: seed.buildingReportStatus,
        verificationStatus: seed.verificationStatus,
        spendOutlook: seed.shortTermSpend,
      },
    },
    location: {
      schoolFit: seed.schoolFit,
      safetyPosture: seed.safety,
      transportPosture: seed.transportPosture,
      streetFeelPosture: seed.streetFeelPosture,
      amenityPosture: seed.amenityPosture,
      localHazardPosture: seed.localHazardPosture,
      summary: seed.locationSummary,
      bestLocalStrength: seed.bestLocalStrength,
      biggestLocalTradeoff: seed.biggestLocalTradeoff,
      dailyLife: [
        { label: "Bus", value: seed.busWalk },
        { label: "Train", value: seed.trainWalk },
        { label: "Metro", value: seed.metroWalk },
        { label: "Traffic", value: seed.trafficLevel },
        { label: "Quietness", value: seed.quietness },
        { label: "Power lines", value: seed.powerLines },
        { label: "Parks", value: seed.parkAccess },
        { label: "Retail street", value: seed.retailStreet },
        { label: "Shopping mall", value: seed.shoppingMall },
      ],
      schools: seed.schools,
      safety: {
        crimeRate: seed.crimeRate,
        dayNightFeel: seed.dayNightFeel,
        emergencyAccess: seed.hospitalAccess,
        summary: seed.safety,
      },
      streetFeel: [
        { label: "Traffic flow", value: seed.trafficLevel },
        { label: "Quietness", value: seed.quietness },
        { label: "Power lines", value: seed.powerLines },
      ],
      amenity: [
        { label: "Commercial street", value: seed.retailStreet },
        { label: "Shopping mall", value: seed.shoppingMall },
        { label: "Parks", value: seed.parkAccess },
        { label: "Lifestyle", value: seed.lifestyle },
      ],
      localHazards: [
        { label: "Flood", value: seed.floodRisk },
        { label: "Bushfire", value: seed.bushfireRisk },
        { label: "Local environmental note", value: seed.localHazardPosture },
      ],
      mapPoints: [
        {
          label: "Station",
          detail: seed.trainWalk,
          kind: "station",
        },
        {
          label: "Market",
          detail: seed.retailStreet,
          kind: "market",
        },
        {
          label: "School",
          detail: `${seed.schools[0]?.name ?? "Nearby school"} · ${seed.schools[0]?.distance ?? ""}`.trim(),
          kind: "school",
        },
        {
          label: "Hospital",
          detail: seed.hospitalAccess,
          kind: "hospital",
        },
        {
          label: "Park",
          detail: seed.parkAccess,
          kind: "park",
        },
      ],
    },
    planning: {
      landValueEstimate: seed.landValueEstimate,
      landPotentialSummary: seed.landPotentialSummary,
      subdivisionPotential: seed.subdivisionPotential,
      site: {
        parcelImageUrl: property.overviewImageUrl,
        landArea: seed.landArea,
        shape: seed.shape,
        cornerLot: seed.cornerLot,
        slopeElevation: seed.slopeElevation,
        easementImpact: seed.easementImpact,
      },
      controls: [
        {
          label: "Zone",
          value: seed.zone,
          explainer: "The base planning zone shapes what kind of uses and density the site can usually support.",
          prompt: `What does the ${seed.zone} mean for this property?`,
        },
        {
          label: "Land use",
          value: seed.landUse,
          explainer: "This is the general type of use the site most naturally supports under current planning settings.",
          prompt: `Explain the current land use setting for this property.`,
        },
        {
          label: "Council",
          value: seed.council,
          explainer: "Council policy and local character rules often matter as much as the zone itself.",
          prompt: `What should I know about ${seed.council} for this property?`,
        },
        {
          label: "Max height",
          value: seed.maxHeight,
          explainer: "Height is one of the fastest ways to judge whether the site has real redevelopment upside.",
          prompt: `What does the max height rule mean for this property?`,
        },
        {
          label: "FSR",
          value: seed.floorSpaceRatio,
          explainer: "Floor space ratio tells you how much total building area the site may reasonably support.",
          prompt: `Explain the FSR setting for this property.`,
        },
        {
          label: "Minimum lot size",
          value: seed.minLotSize,
          explainer: "This is a key filter for whether subdivision or multi-lot outcomes are realistic.",
          prompt: `Does the minimum lot size affect subdivision potential here?`,
        },
        {
          label: "Setbacks",
          value: seed.setbacks,
          explainer: "Setbacks shrink the usable building envelope even when the raw land size looks good.",
          prompt: `How do the setback rules affect this property?`,
        },
        {
          label: "Easement",
          value: seed.easementImpact,
          explainer: "Easements can cut into the buildable or splittable part of the site.",
          prompt: `What does the easement mean for development on this property?`,
        },
      ],
      subdivision: {
        summary: seed.subdivisionSummary,
        evidence: seed.subdivisionEvidence,
      },
    },
    financial: {
      title: `Property market insights for ${propertyTypeLabel} in ${suburbName}, ${state}`,
      subtitle: "Price discipline, rent support, vacancy history, and market pressure for similar properties.",
      guidePrice: property.price,
      estimatedPrice: {
        low: seed.estimatedPriceLow,
        high: seed.estimatedPriceHigh,
        mid: estimatedPriceMid,
        display: formatPriceRange(seed.estimatedPriceLow, seed.estimatedPriceHigh),
        confidenceLabel: seed.salesCount >= 12 ? "Higher confidence" : "Moderate confidence",
        comparableSalesCount: seed.salesCount,
      },
      estimatedRent: {
        weekly: seed.estimatedWeeklyRent,
        display: `$${seed.estimatedWeeklyRent.toLocaleString()} / week`,
        listingsCount: seed.rentalListingsCount,
      },
      estimatedRentalYield: seed.rentalYield,
      priceTrend: {
        growthPct: calculateGrowthPct(seed.medianPriceTrend),
        salesCount: seed.salesCount,
        series: seed.medianPriceTrend.map((medianPrice, index) => ({
          period: trendPeriods[index] ?? `P${index + 1}`,
          medianPrice,
        })),
      },
      rentTrend: {
        growthPct: calculateGrowthPct(seed.medianRentTrend),
        listingsCount: seed.rentalListingsCount,
        series: seed.medianRentTrend.map((medianRent, index) => ({
          period: trendPeriods[index] ?? `P${index + 1}`,
          medianRent,
        })),
      },
      vacancy: {
        currentRate: seed.vacancyRate,
        benchmarkRate: seed.vacancyBenchmark,
        series: seed.vacancyTrend.map((rate, index) => ({
          period: trendPeriods[index] ?? `P${index + 1}`,
          rate,
        })),
      },
      marketPressure: {
        medianDaysOnMarket: seed.medianDaysOnMarket,
        series: seed.supplyDemandTrend,
      },
      recentSales: seed.recentSales,
    },
    modules: {
      propertyFacts: {
        id: "property-facts",
        title: "Building facts",
        summary: "The core dwelling facts that anchor the rest of the decision.",
        rows: [
          { label: "Address", value: `${property.address}, ${property.suburb} ${seed.postcode}` },
          { label: "Type", value: property.propertyType },
          { label: "Bedrooms", value: String(property.bedrooms) },
          { label: "Bathrooms", value: seed.bathrooms },
          { label: "Parking", value: seed.parking },
          { label: "Land / internal size", value: seed.landSize },
          { label: "Guide price", value: property.price },
        ],
      },
      conditionQuality: {
        id: "condition-quality",
        title: "Condition & quality",
        summary: "The visible quality story from finishes, layout, and presentation.",
        rows: seed.condition.map((value, index) => ({
          label: `Observation ${index + 1}`,
          value,
        })),
      },
      defectsMaintenance: {
        id: "defects-maintenance",
        title: "Defects & maintenance",
        summary: "The friction points that could undermine an easy purchase story.",
        tone: "caution",
        rows: seed.defects.map((value, index) => ({
          label: `Risk ${index + 1}`,
          value,
        })),
      },
      environmentLivability: {
        id: "environment-livability",
        title: "Environment & livability",
        summary: "How the property feels day to day outside the staged listing context.",
        rows: [
          { label: "Transit", value: seed.transit },
          { label: "Lifestyle", value: seed.lifestyle },
          { label: "Safety / comfort", value: seed.safety },
          ...seed.environment.map((value, index) => ({
            label: `Context ${index + 1}`,
            value,
          })),
        ],
      },
      planningConstraints: {
        id: "planning-constraints",
        title: "Land & planning rules",
        summary: "These are the detailed controls that sit underneath the higher-level land and subdivision story.",
        rows: [
          { label: "Land size", value: seed.landSize },
          { label: "Zone", value: seed.zone },
          { label: "Land use", value: seed.landUse },
          { label: "Council", value: seed.council },
          { label: "Max building height", value: seed.maxHeight },
          { label: "FSR", value: seed.floorSpaceRatio },
          { label: "Minimum lot size", value: seed.minLotSize },
          { label: "Setbacks", value: seed.setbacks },
          { label: "Easement", value: seed.easementImpact },
          { label: "Overlays", value: seed.overlays },
          { label: "Flood risk", value: seed.floodRisk },
          { label: "Heritage", value: seed.heritage },
        ],
      },
      locationAmenity: {
        id: "location-amenity",
        title: "Location & amenity",
        summary: "The surrounding area matters because it changes both livability and resilience.",
        rows: [
          { label: "Top local strength", value: property.tags[0] ?? "Neighbourhood access" },
          { label: "Secondary local strength", value: property.tags[1] ?? "Amenity mix" },
          { label: "Lifestyle cue", value: seed.lifestyle },
          { label: "Movement pattern", value: seed.transit },
        ],
      },
      financialInvestment: {
        id: "financial-investment",
        title: "Market & pricing",
        summary: "Price discipline and rental support should clarify the buy, not overpower it.",
        rows: [
          { label: "Guide price", value: property.price },
          { label: "Estimated price range", value: formatPriceRange(seed.estimatedPriceLow, seed.estimatedPriceHigh) },
          { label: "Estimated rent", value: `$${seed.estimatedWeeklyRent.toLocaleString()} / week` },
          { label: "Estimated rental yield", value: seed.rentalYield },
          { label: "Vacancy rate", value: `${seed.vacancyRate} vs ${seed.vacancyBenchmark} suburb benchmark` },
        ],
      },
      saleProcessTiming: {
        id: "sale-process-timing",
        title: "Sale process & timing",
        summary: "These dates matter because the right next move depends on timing pressure.",
        rows: [
          { label: "Listing date", value: seed.listingDate },
          { label: "Inspection", value: seed.inspection },
          { label: "Auction / sale mode", value: seed.auction },
          { label: "Last updated", value: seed.updatedAt },
        ],
      },
      documentsInterpretation: {
        id: "documents-interpretation",
        title: "Documents & interpretation",
        summary: "What is still missing or still needs evidence-backed interpretation.",
        tone: "caution",
        rows: seed.documents.map((value, index) => ({
          label: `Document item ${index + 1}`,
          value,
        })),
      },
      referenceProvenance: {
        id: "reference-provenance",
        title: "Reference & provenance",
        summary: "Reference information stays available without competing with the decision layer.",
        rows: [
          { label: "Listing id", value: property.id },
          { label: "Agent", value: seed.agent },
          { label: "Source", value: seed.source },
          { label: "Watchers", value: property.watchers },
          { label: "Chat mentions", value: property.chatMentions },
          { label: "Feed momentum", value: property.momentum },
        ],
      },
    },
  };
}
