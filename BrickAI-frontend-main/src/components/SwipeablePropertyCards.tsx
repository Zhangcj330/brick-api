import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BedDouble, Building2, ChartNoAxesColumn, Check, ChevronRight, CircleAlert, Home, MapPin, MoveRight, ShieldCheck, TrendingUp, X } from 'lucide-react';
import { motion, PanInfo, useMotionValue, useTransform } from 'motion/react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from './ui/drawer';

type BuyerType = 'investor' | 'owner-occupier';

interface BuyerContext {
  id: string;
  label: string;
  buyerType: BuyerType;
  budget: string;
  targetAreas: string[];
  propertyTypes: string[];
  priorityFeatures: string[];
}

interface DetailSection {
  title: string;
  items: string[];
}

interface AIEvaluation {
  score: number;
  recommendationLabel: string;
  insights: [string, string, string];
  detailSummary: string;
  detailSections: DetailSection[];
}

interface Property {
  id: string;
  title: string;
  address: string;
  suburb: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  landSize: string;
  propertyType: string;
  imageUrl: string;
  listingAge: string;
  evaluations: Record<BuyerType, AIEvaluation>;
}

const MOCK_BUYER_CONTEXTS: BuyerContext[] = [
  {
    id: 'investor',
    label: 'Investor Lens',
    buyerType: 'investor',
    budget: '$800k - $1.2M',
    targetAreas: ['Brunswick', 'South Yarra', 'Footscray'],
    propertyTypes: ['Apartment', 'Townhouse', 'Unit'],
    priorityFeatures: ['Capital Growth', 'Rental Yield', 'Public Transport'],
  },
  {
    id: 'owner-occupier',
    label: 'Owner Lens',
    buyerType: 'owner-occupier',
    budget: '$900k - $1.5M',
    targetAreas: ['Kew', 'Brighton', 'Mooloolaba'],
    propertyTypes: ['House', 'Townhouse', 'Villa'],
    priorityFeatures: ['Low Noise', 'Walkability', 'School Zone'],
  },
];

const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Modern 2-Bedroom Apartment',
    address: '45 Smith Street',
    suburb: 'Brunswick, VIC',
    price: 'Guide $750k',
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    landSize: '85m²',
    propertyType: 'Apartment',
    imageUrl: 'https://images.unsplash.com/photo-1559329146-807aff9ff1fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBleHRlcmlvcnxlbnwxfHx8fDE3NjIzMjY4NDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    listingAge: '2 days ago',
    evaluations: {
      investor: {
        score: 8.4,
        recommendationLabel: 'Strong rental fit',
        insights: [
          'Walk-to-tram positioning supports consistent tenant demand.',
          'Guide sits inside your target budget with room for yield upside.',
          'New-build stock keeps maintenance risk lower in the first years.',
        ],
        detailSummary: 'Brick AI sees this as a clean inner-north hold with strong leasing appeal and manageable downside for an investor profile.',
        detailSections: [
          {
            title: 'Why it ranks',
            items: [
              'Comparable investor stock nearby is trading at similar entry levels but with less transport access.',
              'Two-bedroom layouts in Brunswick remain easier to lease than compact one-bedroom stock.',
            ],
          },
          {
            title: 'Decision signals',
            items: [
              'Public transport matches one of your highest-priority filters.',
              'Apartment format aligns with your current preferred property mix.',
            ],
          },
          {
            title: 'Watchouts',
            items: [
              'New-build premiums can compress near-term capital growth if too many similar listings hit at once.',
            ],
          },
        ],
      },
      'owner-occupier': {
        score: 7.2,
        recommendationLabel: 'Urban lifestyle pick',
        insights: [
          'Brunswick gives you strong cafe and tram access in a walkable pocket.',
          'Two-bed layout is practical, but the apartment format is less aligned with your preferred home types.',
          'Good everyday convenience, weaker fit if quiet streets are a priority.',
        ],
        detailSummary: 'Brick AI treats this as a lifestyle-forward option for someone prioritising walkability over long-term space flexibility.',
        detailSections: [
          {
            title: 'Why it ranks',
            items: [
              'Daily convenience is high with transport and retail within a short walk.',
              'Two bathrooms improve liveability despite the compact footprint.',
            ],
          },
          {
            title: 'Lifestyle cues',
            items: [
              'Cafe-heavy streets and good tram frequency suit a city-fringe routine.',
              'Apartment living reduces upkeep but limits outdoor space.',
            ],
          },
          {
            title: 'Tradeoffs',
            items: [
              'Less suited to your quieter, owner-occupier-oriented target suburbs.',
            ],
          },
        ],
      },
    },
  },
  {
    id: '2',
    title: 'Luxury Family Home',
    address: '128 Park Avenue',
    suburb: 'Kew, VIC',
    price: 'Guide $1.35M',
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    landSize: '450m²',
    propertyType: 'House',
    imageUrl: 'https://images.unsplash.com/photo-1564703048291-bcf7f001d83d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3VzZSUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NjIzNDQxMTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    listingAge: '1 week ago',
    evaluations: {
      investor: {
        score: 6.3,
        recommendationLabel: 'Premium hold only',
        insights: [
          'Owner-occupier demand is strong here, but yield efficiency is weaker than your best-fit suburbs.',
          'Higher entry price narrows margin for error versus your investor budget band.',
          'This works better as a long-duration prestige hold than an immediate value play.',
        ],
        detailSummary: 'Brick AI sees high quality but limited investor efficiency here. The suburb is defensible; the entry point is not especially sharp.',
        detailSections: [
          {
            title: 'Why it ranks',
            items: [
              'Kew holds buyer demand well, but the house format pushes you above your ideal capital allocation.',
              'Family homes in this pocket typically reward patience more than immediate yield.',
            ],
          },
          {
            title: 'Decision signals',
            items: [
              'Premium school-zone appeal supports long-term resale confidence.',
              'This is outside your preferred apartment and townhouse-heavy mix.',
            ],
          },
          {
            title: 'Watchouts',
            items: [
              'House maintenance and landholding costs raise operating friction for an investor lens.',
            ],
          },
        ],
      },
      'owner-occupier': {
        score: 8.8,
        recommendationLabel: 'High-confidence family fit',
        insights: [
          'Kew lines up closely with your owner-occupier suburb preferences.',
          'Four-bed house format gives you the space flexibility missing from apartment stock.',
          'Quiet street character and school-zone appeal make it a strong liveability candidate.',
        ],
        detailSummary: 'Brick AI ranks this as a strong family-oriented home with high confidence on suburb fit, space, and long-term owner satisfaction.',
        detailSections: [
          {
            title: 'Why it ranks',
            items: [
              'House format aligns directly with your preferred property type.',
              'Kew remains one of the cleaner matches for quiet streets and school access.',
            ],
          },
          {
            title: 'Lifestyle cues',
            items: [
              'The area supports a slower residential rhythm while keeping city access feasible.',
              'Two-car parking and a larger footprint improve day-to-day practicality.',
            ],
          },
          {
            title: 'Tradeoffs',
            items: [
              'This is a premium-priced option, so value depends on how much you prioritise suburb quality over bargain entry.',
            ],
          },
        ],
      },
    },
  },
  {
    id: '3',
    title: 'Contemporary Townhouse',
    address: '67 Victoria Street',
    suburb: 'South Yarra, VIC',
    price: 'Guide $920k',
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    landSize: '120m²',
    propertyType: 'Townhouse',
    imageUrl: 'https://images.unsplash.com/photo-1630404515111-2fc17457daa6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjB0b3duaG91c2V8ZW58MXx8fHwxNzYyMjYwMzI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    listingAge: '3 days ago',
    evaluations: {
      investor: {
        score: 8.0,
        recommendationLabel: 'Balanced growth play',
        insights: [
          'Townhouse format gives you more scarcity than standard apartment stock in this area.',
          'South Yarra transport and amenity mix support resilient rental demand.',
          'Entry price is higher, but the product quality makes the hold more defensible.',
        ],
        detailSummary: 'Brick AI treats this as a balanced capital-growth-led opportunity with stronger product differentiation than a standard inner-city apartment.',
        detailSections: [
          {
            title: 'Why it ranks',
            items: [
              'Scarcer townhouse supply improves competitive positioning at resale and lease renewal.',
              'Two-bed layout suits both couples and sharers, broadening tenant demand.',
            ],
          },
          {
            title: 'Decision signals',
            items: [
              'High-amenity suburb with proven depth of demand.',
              'Format sits within your preferred townhouse mix.',
            ],
          },
          {
            title: 'Watchouts',
            items: [
              'Premium suburb pricing means returns rely more on quality of stock than raw value.',
            ],
          },
        ],
      },
      'owner-occupier': {
        score: 8.1,
        recommendationLabel: 'Polished city-fringe option',
        insights: [
          'Townhouse format lands closer to your preferred owner-occupier mix than an apartment.',
          'Walkability and lifestyle access are strong without going fully CBD.',
          'Space is efficient rather than expansive, so this suits a compact premium lifestyle.',
        ],
        detailSummary: 'Brick AI reads this as a refined city-fringe home for a buyer who wants high-quality urban life without dropping back to apartment living.',
        detailSections: [
          {
            title: 'Why it ranks',
            items: [
              'Townhouse product is a stronger lifestyle compromise than most inner-city apartment alternatives.',
              'South Yarra remains one of the easiest suburbs for amenity-led routines.',
            ],
          },
          {
            title: 'Lifestyle cues',
            items: [
              'Private courtyard adds a layer of breathing room missing from denser stock.',
              'Transport, dining, and retail are all accessible without heavy driving dependence.',
            ],
          },
          {
            title: 'Tradeoffs',
            items: [
              'Less quiet and less family-scaled than your more residential target suburbs.',
            ],
          },
        ],
      },
    },
  },
  {
    id: '4',
    title: 'CBD Studio Apartment',
    address: '234 Collins Street',
    suburb: 'Melbourne CBD, VIC',
    price: 'Guide $480k',
    bedrooms: 1,
    bathrooms: 1,
    parking: 0,
    landSize: '42m²',
    propertyType: 'Apartment',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkaW8lMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjIzNDQxODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    listingAge: '5 days ago',
    evaluations: {
      investor: {
        score: 6.9,
        recommendationLabel: 'Yield with caveats',
        insights: [
          'The lower entry point is attractive, but studio liquidity is thinner than larger formats.',
          'CBD amenity and walkability support demand, especially for young renters.',
          'Best considered as a tactical yield hold, not your strongest long-term scarcity play.',
        ],
        detailSummary: 'Brick AI sees workable cashflow logic here, but the small format makes this a more tactical than conviction-grade investor pick.',
        detailSections: [
          {
            title: 'Why it ranks',
            items: [
              'Entry price leaves capital available for portfolio flexibility.',
              'Walk-to-everything convenience keeps renter demand active.',
            ],
          },
          {
            title: 'Decision signals',
            items: [
              'CBD location supports occupancy more than family-oriented capital growth.',
              'Studio format is below your ideal bedroom threshold.',
            ],
          },
          {
            title: 'Watchouts',
            items: [
              'Studio resales can be more exposed when buyer sentiment softens.',
            ],
          },
        ],
      },
      'owner-occupier': {
        score: 5.8,
        recommendationLabel: 'Lifestyle compromise',
        insights: [
          'The location is ultra-convenient, but the studio layout is far below your ideal home spec.',
          'Best for a short urban chapter, not a longer-horizon owner-occupier move.',
          'Works if proximity outranks quiet, space, and flexibility.',
        ],
        detailSummary: 'Brick AI treats this as a convenience-first fallback, not a primary owner-occupier recommendation.',
        detailSections: [
          {
            title: 'Why it ranks',
            items: [
              'CBD access is unmatched for car-free daily routines.',
              'Rooftop and gym amenities improve the building proposition.',
            ],
          },
          {
            title: 'Lifestyle cues',
            items: [
              'High-energy urban living with no real transition into quieter residential life.',
            ],
          },
          {
            title: 'Tradeoffs',
            items: [
              'Single-room living and no parking push this below your stated owner goals.',
            ],
          },
        ],
      },
    },
  },
  {
    id: '5',
    title: 'Investment Unit',
    address: '89 Station Road',
    suburb: 'Footscray, VIC',
    price: 'Guide $520k',
    bedrooms: 2,
    bathrooms: 1,
    parking: 1,
    landSize: '65m²',
    propertyType: 'Unit',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBidWlsZGluZ3xlbnwxfHx8fDE3NjIzNDQyMTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    listingAge: '1 day ago',
    evaluations: {
      investor: {
        score: 8.9,
        recommendationLabel: 'Top value candidate',
        insights: [
          'Footscray remains one of the cleaner value pockets inside your investor lens.',
          'Walk-to-station access and lower maintenance profile improve hold efficiency.',
          'Two-bed format broadens tenant demand without pushing entry cost too high.',
        ],
        detailSummary: 'Brick AI ranks this as one of the sharpest investor fits in the current stack because it combines transport, value, and pragmatic rental appeal.',
        detailSections: [
          {
            title: 'Why it ranks',
            items: [
              'Guide is well within your target budget band and leaves room for portfolio resilience.',
              'Transport adjacency supports a broad renter pool.',
            ],
          },
          {
            title: 'Decision signals',
            items: [
              'Unit format fits your low-maintenance preference.',
              'The suburb remains aligned with your target-area list.',
            ],
          },
          {
            title: 'Watchouts',
            items: [
              'One bathroom slightly caps family-style tenant appeal, but the price offsets that tradeoff.',
            ],
          },
        ],
      },
      'owner-occupier': {
        score: 6.6,
        recommendationLabel: 'Practical, not aspirational',
        insights: [
          'The value story is solid, but this is less aligned with your quieter owner-occupier suburbs.',
          'Station access is a clear convenience win for day-to-day movement.',
          'Best if budget discipline matters more than premium neighbourhood feel.',
        ],
        detailSummary: 'Brick AI sees this as sensible and efficient, but not a high-emotion owner-occupier match relative to your stronger lifestyle targets.',
        detailSections: [
          {
            title: 'Why it ranks',
            items: [
              'Affordable entry increases financial comfort for an owner profile.',
              'Two bedrooms and parking add useful practicality.',
            ],
          },
          {
            title: 'Lifestyle cues',
            items: [
              'Transport-led convenience is strong, but the surrounding feel is more utilitarian than premium residential.',
            ],
          },
          {
            title: 'Tradeoffs',
            items: [
              'This is a practical compromise rather than a high-confidence lifestyle recommendation.',
            ],
          },
        ],
      },
    },
  },
  {
    id: '6',
    title: 'Beachside Apartment',
    address: '12 Ocean Parade',
    suburb: 'Mooloolaba, QLD',
    price: 'Guide $825k',
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    landSize: '95m²',
    propertyType: 'Apartment',
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGFwYXJ0bWVudCUyMGJhbGNvbnl8ZW58MXx8fHwxNzYyMzQ0MjQxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    listingAge: '4 days ago',
    evaluations: {
      investor: {
        score: 7.6,
        recommendationLabel: 'Lifestyle-led hold',
        insights: [
          'Coastal demand is strong, but the investment case depends on lifestyle premium holding up.',
          'Two-bed beachfront product is easier to rent than smaller holiday-style stock.',
          'This is more of a conviction coastal bet than a pure value purchase.',
        ],
        detailSummary: 'Brick AI sees credible upside here, but the thesis is driven by coastal desirability rather than pure numerical value.',
        detailSections: [
          {
            title: 'Why it ranks',
            items: [
              'Beach access and views create stronger emotional demand than standard apartment stock.',
              'Two bathrooms and parking make the unit more usable for longer stays.',
            ],
          },
          {
            title: 'Decision signals',
            items: [
              'Coastal location sits outside your core target areas but offers differentiated demand.',
              'Apartment format still fits your lower-maintenance preference.',
            ],
          },
          {
            title: 'Watchouts',
            items: [
              'Pricing is exposed to lifestyle sentiment and may be less predictable than metro commuter stock.',
            ],
          },
        ],
      },
      'owner-occupier': {
        score: 8.5,
        recommendationLabel: 'Lifestyle standout',
        insights: [
          'Beach access and natural light make this a high-emotion owner-occupier candidate.',
          'Two-bed apartment format works if you want lower upkeep without giving up quality of life.',
          'This is strongest when lifestyle quality matters more than maximum internal space.',
        ],
        detailSummary: 'Brick AI treats this as one of the stronger lifestyle-led homes in the stack, especially for a buyer prioritising day-to-day quality over pure scale.',
        detailSections: [
          {
            title: 'Why it ranks',
            items: [
              'Beach proximity maps directly to a more premium daily routine.',
              'Resort-style amenities reduce the need to trade convenience for location.',
            ],
          },
          {
            title: 'Lifestyle cues',
            items: [
              'Walkable coastal living and ocean views create a meaningfully different home experience.',
            ],
          },
          {
            title: 'Tradeoffs',
            items: [
              'Apartment living still means less privacy and less land than a house or villa.',
            ],
          },
        ],
      },
    },
  },
  {
    id: '7',
    title: 'Low Maintenance Villa',
    address: '56 Seaside Boulevard',
    suburb: 'Brighton, VIC',
    price: 'Guide $950k',
    bedrooms: 2,
    bathrooms: 2,
    parking: 2,
    landSize: '140m²',
    propertyType: 'Villa',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMGV4dGVyaW9yfGVufDF8fHx8MTc2MjM0NDI2N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    listingAge: '6 days ago',
    evaluations: {
      investor: {
        score: 7.1,
        recommendationLabel: 'Defensive, lower upside',
        insights: [
          'Villa format is resilient and low-maintenance, but Brighton pricing limits value arbitrage.',
          'This is safer than it is sharp from an investor perspective.',
          'Better suited to defensive capital preservation than aggressive growth hunting.',
        ],
        detailSummary: 'Brick AI sees a stable product in a premium suburb, but not one that maximises your current investor filters.',
        detailSections: [
          {
            title: 'Why it ranks',
            items: [
              'Low-maintenance villa stock is comparatively resilient in down cycles.',
              'Brighton remains a defensible prestige location.',
            ],
          },
          {
            title: 'Decision signals',
            items: [
              'Format matches your maintenance preference.',
              'Suburb quality is high, but value entry is softer than your top investor matches.',
            ],
          },
          {
            title: 'Watchouts',
            items: [
              'Premium coastal pricing can cap upside if growth expectations are already fully priced in.',
            ],
          },
        ],
      },
      'owner-occupier': {
        score: 8.7,
        recommendationLabel: 'Quiet premium fit',
        insights: [
          'Brighton aligns closely with your preferred owner-occupier suburb profile.',
          'Villa format gives you low maintenance without dropping to high-density apartment living.',
          'Quiet coastal positioning makes this a strong everyday-lifestyle recommendation.',
        ],
        detailSummary: 'Brick AI sees this as a high-confidence owner choice for a buyer who values calm, coastal access, and lower-maintenance living.',
        detailSections: [
          {
            title: 'Why it ranks',
            items: [
              'The villa format is a strong middle ground between house comfort and apartment simplicity.',
              'Brighton matches your suburb and lifestyle bias well.',
            ],
          },
          {
            title: 'Lifestyle cues',
            items: [
              'Coastal walks, quieter streets, and secure parking support a calmer daily routine.',
              'Two-car parking and single-level style improve long-term liveability.',
            ],
          },
          {
            title: 'Tradeoffs',
            items: [
              'The premium suburb tax means value is coming from quality of life, not bargain pricing.',
            ],
          },
        ],
      },
    },
  },
];

interface SwipeablePropertyCardsProps {
  onBack: () => void;
}

export function SwipeablePropertyCards({ onBack }: SwipeablePropertyCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [buyerContextId, setBuyerContextId] = useState(MOCK_BUYER_CONTEXTS[0].id);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [decisionStats, setDecisionStats] = useState({
    left: 0,
    right: 0,
  });

  const buyerContext = useMemo(
    () => MOCK_BUYER_CONTEXTS.find((context) => context.id === buyerContextId) ?? MOCK_BUYER_CONTEXTS[0],
    [buyerContextId],
  );

  const currentProperty = MOCK_PROPERTIES[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    setDecisionStats((prev) => ({
      ...prev,
      [direction]: prev[direction] + 1,
    }));
    setIsDetailsOpen(false);

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 280);
  };

  const resetCards = () => {
    setCurrentIndex(0);
    setIsDetailsOpen(false);
    setDecisionStats({ left: 0, right: 0 });
  };

  if (currentIndex >= MOCK_PROPERTIES.length) {
    return (
      <div className="relative z-10 flex h-[100dvh] overflow-hidden p-6">
        <div className="flex w-full items-center justify-center">
          <div className="w-full max-w-md rounded-[32px] border border-white/80 bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
            <div className="mb-4 text-xs uppercase tracking-[0.35em] text-gray-400">Brick AI</div>
            <h2 className="mb-3 text-3xl font-medium tracking-tight text-gray-950">Review complete</h2>
            <p className="mb-6 text-sm leading-6 text-gray-600">
              You have reached the end of this stack. Restart to review the cards again or head back home.
            </p>

            <div className="mb-6 grid grid-cols-2 gap-3 text-left">
              <div className="rounded-[24px] border border-gray-200 bg-[#fbfaf7] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-gray-400">Saved</div>
                <div className="mt-2 text-3xl font-medium tracking-tight text-gray-950">{decisionStats.right}</div>
              </div>
              <div className="rounded-[24px] border border-gray-200 bg-[#fbfaf7] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-gray-400">Skipped</div>
                <div className="mt-2 text-3xl font-medium tracking-tight text-gray-950">{decisionStats.left}</div>
              </div>
            </div>

            <div className="mb-6 rounded-[24px] border border-gray-200 bg-[#fbfaf7] p-4 text-left">
              <div className="text-xs uppercase tracking-[0.2em] text-gray-400">Active lens</div>
              <div className="mt-2 text-sm text-gray-700">{buyerContext.label}</div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onBack} className="flex-1 rounded-full border-gray-300">
                Back
              </Button>
              <Button onClick={resetCards} className="flex-1 rounded-full bg-gray-950 text-white hover:bg-gray-800">
                Restart
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Drawer open={isDetailsOpen} onOpenChange={setIsDetailsOpen} direction="right">
      <div className="relative z-10 h-[100dvh] overflow-hidden px-4 py-6 sm:px-6 sm:py-10">
        <div className="pointer-events-none absolute left-4 top-6 sm:left-6 sm:top-8">
          <button
            onClick={onBack}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[#160211]/10 bg-white px-4 py-2 text-sm text-[#160211] transition hover:border-[#160211]/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <div className="mx-auto flex h-full max-w-5xl items-center justify-center">
          <SwipeCard
            buyerContext={buyerContext}
            properties={MOCK_PROPERTIES.slice(currentIndex, currentIndex + 4)}
            onOpenDetails={() => setIsDetailsOpen(true)}
            onSwipe={handleSwipe}
          />
        </div>
      </div>

      <PropertyDetailsDrawer
        buyerContext={buyerContext}
        onSelectContext={setBuyerContextId}
        onSwipe={handleSwipe}
        property={currentProperty}
      />
    </Drawer>
  );
}

interface SwipeCardProps {
  buyerContext: BuyerContext;
  properties: Property[];
  onOpenDetails: () => void;
  onSwipe: (direction: 'left' | 'right') => void;
}

function SwipeCard({ buyerContext, properties, onOpenDetails, onSwipe }: SwipeCardProps) {
  const visibleProperties = properties.slice(0, 4).reverse();
  const activeProperty = properties[0];
  const activeDragRef = useRef(false);

  if (!activeProperty) {
    return null;
  }

  return (
    <div className="relative flex h-[48rem] w-full max-w-lg items-center justify-center [perspective:600px] sm:h-[52rem]">
      {visibleProperties.map((stackProperty, index) => {
        const isActive = stackProperty.id === activeProperty.id;
        const depth = visibleProperties.length - index - 1;

        return (
          <StackCardRotate
            key={stackProperty.id}
            isActive={isActive}
            onDragStateChange={(dragging) => {
              if (isActive) {
                activeDragRef.current = dragging;
              }
            }}
            onSwipe={onSwipe}
          >
            <motion.div
              className="absolute inset-0"
              animate={{
                rotateZ: depth * 2.25,
                scale: 1 - depth * 0.06,
                y: depth * 18,
                transformOrigin: '90% 90%',
              }}
              initial={false}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
            >
              <SwipePropertyCard
                buyerContext={buyerContext}
                dragStateRef={activeDragRef}
                isActive={isActive}
                onOpenDetails={onOpenDetails}
                onSwipe={onSwipe}
                property={stackProperty}
              />
            </motion.div>
          </StackCardRotate>
        );
      })}
    </div>
  );
}

interface StackCardRotateProps {
  children: React.ReactNode;
  isActive: boolean;
  onDragStateChange?: (dragging: boolean) => void;
  onSwipe: (direction: 'left' | 'right') => void;
}

function StackCardRotate({ children, isActive, onDragStateChange, onSwipe }: StackCardRotateProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 120) {
      onSwipe(info.offset.x > 0 ? 'right' : 'left');
    } else {
      x.set(0);
      y.set(0);
    }

    window.setTimeout(() => {
      onDragStateChange?.(false);
    }, 0);
  };

  if (!isActive) {
    return (
      <motion.div className="pointer-events-none absolute inset-0" style={{ x: 0, y: 0 }}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: 'grabbing' }}
      onDragStart={() => onDragStateChange?.(true)}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

interface SwipePropertyCardProps {
  buyerContext: BuyerContext;
  dragStateRef: React.MutableRefObject<boolean>;
  isActive: boolean;
  onOpenDetails: () => void;
  onSwipe: (direction: 'left' | 'right') => void;
  property: Property;
}

function SwipePropertyCard({
  buyerContext,
  dragStateRef,
  isActive,
  onOpenDetails,
  onSwipe,
  property,
}: SwipePropertyCardProps) {
  const evaluation = property.evaluations[buyerContext.buyerType];

  const handleCardClick = () => {
    if (!isActive || dragStateRef.current) {
      return;
    }
    onOpenDetails();
  };

  const handleActionClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    direction: 'left' | 'right',
  ) => {
    event.stopPropagation();
    onSwipe(direction);
  };

  return (
    <div
      role={isActive ? 'button' : undefined}
      tabIndex={isActive ? 0 : -1}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (!isActive) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleCardClick();
        }
      }}
      className={`flex h-full flex-col overflow-hidden rounded-[36px] border border-white/80 bg-[#fffdf8] text-left shadow-[0_30px_90px_rgba(15,23,42,0.16)] outline-none transition ${
        isActive ? 'focus-visible:ring-2 focus-visible:ring-gray-900' : 'pointer-events-none brightness-[0.98] saturate-[0.88]'
      }`}
    >
      <div className="relative h-[24rem] overflow-hidden bg-gray-200 sm:h-[29rem]">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/10" />

        <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-3">
          <div className="rounded-full border border-white/25 bg-black/30 px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] text-white backdrop-blur-md">
            {buyerContext.label}
          </div>
          <div className="rounded-full border border-white/25 bg-white/12 px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] text-white backdrop-blur-md">
            {property.listingAge}
          </div>
        </div>

        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.35em] text-white/70">Brick AI score</div>
            <div className="flex items-end gap-3">
              <div className="text-5xl font-medium tracking-tight text-white">
                {evaluation.score.toFixed(1)}
              </div>
              <Badge className="rounded-full border border-white/20 bg-white/14 px-3 py-1.5 text-white backdrop-blur-md hover:bg-white/14">
                {evaluation.recommendationLabel}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 sm:p-7">
        <div className="mb-6">
          <div className="text-3xl font-medium tracking-tight text-gray-950">{property.suburb}</div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">{property.price}</span>
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-gray-400" />
              {property.propertyType}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BedDouble className="h-4 w-4 text-gray-400" />
              {property.bedrooms} bed
            </span>
          </div>
        </div>

        <div className="space-y-3 border-t border-gray-200 pt-5">
          {evaluation.insights.map((insight) => (
            <div key={insight} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-950 text-white">
                <Check className="h-3.5 w-3.5" />
              </div>
              <p className="text-sm leading-6 text-gray-700">{insight}</p>
            </div>
          ))}
        </div>

        {isActive && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-5 text-sm text-gray-500">
            <span>Tap card for full reasoning</span>
            <span className="inline-flex items-center gap-1 text-gray-900">
              Open details
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        )}
      </div>

      {isActive && (
        <div className="grid grid-cols-2 gap-3 border-t border-gray-200 bg-[#f9f6ef] p-5">
          <button
            type="button"
            onClick={(event) => handleActionClick(event, 'left')}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm text-gray-700 transition hover:border-gray-900 hover:text-gray-950"
          >
            <X className="h-4 w-4" />
            Skip
          </button>
          <button
            type="button"
            onClick={(event) => handleActionClick(event, 'right')}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-950 px-5 py-3 text-sm text-white transition hover:bg-gray-800"
          >
            <Check className="h-4 w-4" />
            Save
          </button>
        </div>
      )}
    </div>
  );
}

interface PropertyDetailsDrawerProps {
  buyerContext: BuyerContext;
  onSelectContext: (contextId: string) => void;
  onSwipe: (direction: 'left' | 'right') => void;
  property: Property;
}

function PropertyDetailsDrawer({
  buyerContext,
  onSelectContext,
  onSwipe,
  property,
}: PropertyDetailsDrawerProps) {
  const evaluation = property.evaluations[buyerContext.buyerType];

  return (
    <DrawerContent className="w-full border-l border-gray-200 bg-[#fcfaf4] sm:max-w-xl">
      <DrawerHeader className="border-b border-gray-200 px-6 pb-5 pt-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-gray-400">Brick AI reasoning</div>
            <DrawerTitle className="mt-2 text-2xl font-medium tracking-tight text-gray-950">
              {property.suburb}
            </DrawerTitle>
            <DrawerDescription className="mt-2 max-w-md leading-6 text-gray-600">
              {evaluation.detailSummary}
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition hover:text-gray-950"
            >
              <X className="h-4 w-4" />
            </button>
          </DrawerClose>
        </div>

        <div className="flex flex-wrap gap-2">
          {MOCK_BUYER_CONTEXTS.map((context) => {
            const isActive = context.id === buyerContext.id;
            return (
              <button
                key={context.id}
                type="button"
                onClick={() => onSelectContext(context.id)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  isActive
                    ? 'bg-gray-950 text-white'
                    : 'border border-gray-300 bg-white text-gray-700 hover:border-gray-900'
                }`}
              >
                {context.label}
              </button>
            );
          })}
        </div>
      </DrawerHeader>

      <div className="overflow-y-auto px-6 py-6">
        <div className="mb-6 overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="relative h-52">
            <img
              src={property.imageUrl}
              alt={property.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/70">AI score</div>
                <div className="mt-1 text-4xl font-medium tracking-tight text-white">
                  {evaluation.score.toFixed(1)}
                </div>
              </div>
              <Badge className="rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-white backdrop-blur-md hover:bg-white/12">
                {evaluation.recommendationLabel}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-gray-200 bg-[#fffdf8] p-5 text-sm text-gray-700">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-gray-400">Guide</div>
              <div className="mt-1 font-medium text-gray-950">{property.price}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-gray-400">Address</div>
              <div className="mt-1 font-medium text-gray-950">{property.address}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-gray-400">Type</div>
              <div className="mt-1">{property.propertyType}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-gray-400">Bedrooms</div>
              <div className="mt-1">{property.bedrooms} bed</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-gray-400">Bathrooms</div>
              <div className="mt-1">{property.bathrooms}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-gray-400">Parking</div>
              <div className="mt-1">{property.parking}</div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-[28px] border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-gray-400">
            <Home className="h-4 w-4" />
            Buyer context
          </div>
          <div className="mt-4 space-y-3 text-sm text-gray-700">
            <div className="flex items-start justify-between gap-4">
              <span className="text-gray-500">Budget</span>
              <span className="text-right text-gray-950">{buyerContext.budget}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-gray-500">Target areas</span>
              <span className="text-right text-gray-950">{buyerContext.targetAreas.join(', ')}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-gray-500">Preferred types</span>
              <span className="text-right text-gray-950">{buyerContext.propertyTypes.join(', ')}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-gray-500">Priority filters</span>
              <span className="text-right text-gray-950">{buyerContext.priorityFeatures.join(', ')}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {evaluation.detailSections.map((section, index) => (
            <div key={section.title} className="rounded-[28px] border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-gray-400">
                {index === 0 ? (
                  <ChartNoAxesColumn className="h-4 w-4" />
                ) : index === 1 ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <CircleAlert className="h-4 w-4" />
                )}
                {section.title}
              </div>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm leading-6 text-gray-700">
                    <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                      <MoveRight className="h-3 w-3" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[28px] border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-gray-400">
            <MapPin className="h-4 w-4" />
            Quick read
          </div>
          <div className="space-y-3">
            {evaluation.insights.map((insight) => (
              <div key={insight} className="flex items-start gap-3 text-sm leading-6 text-gray-700">
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-950 text-white">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DrawerFooter className="border-t border-gray-200 bg-[#fcfaf4] px-6 py-5">
        <div className="grid grid-cols-2 gap-3">
          <DrawerClose asChild>
            <button
              type="button"
              onClick={() => onSwipe('left')}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm text-gray-700 transition hover:border-gray-900 hover:text-gray-950"
            >
              <X className="h-4 w-4" />
              Skip
            </button>
          </DrawerClose>
          <DrawerClose asChild>
            <button
              type="button"
              onClick={() => onSwipe('right')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-950 px-5 py-3 text-sm text-white transition hover:bg-gray-800"
            >
              <ArrowRight className="h-4 w-4" />
              Save
            </button>
          </DrawerClose>
        </div>
      </DrawerFooter>
    </DrawerContent>
  );
}
