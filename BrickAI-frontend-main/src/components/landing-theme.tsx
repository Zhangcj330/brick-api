"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { motion } from "motion/react";

export const LANDING_VARIANT_STORAGE_KEY = "brick-ai-landing-variant";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type LandingVariantConfig = {
  label: string;
  heading: string;
  subheading: string;
  placeholder: string;
  summary: string;
  background: {
    base: string;
    overlay: string;
  };
  conversation: ChatMessage[];
};

export const LANDING_VARIANTS = {
  aurora: {
    label: "AUSTRALIAN PROPERTY INTELLIGENCE",
    heading:
      "Discover Australian property with Brick AI's Property Agent",
    subheading:
      "Talk naturally about your property goals and let AI instantly surface Australian recommendations tuned to price, commute, lifestyle, and more.",
    placeholder:
      "Ask Brick AI for the home you want, e.g. find a coastal townhouse near a good primary school.",
    summary:
      "Brick AI blends Australian listings, market signals, and your preferences to refine every recommendation.",
    background: {
      base: "bg-gradient-to-b from-blue-50 via-white to-emerald-50",
      overlay:
        "bg-[radial-gradient(circle_at_top,_rgba(74,95,255,0.08),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(92,255,211,0.08),_transparent_45%)]",
    },
    conversation: [
      {
        role: "user",
        content:
          "I'm after a two-bedroom in Melbourne around AUD 1.2M with an easy CBD commute.",
      },
      {
        role: "assistant",
        content:
          "No worries. Brunswick, Richmond, and South Yarra match the budget and have frequent train and tram links. Do you prefer an apartment or townhouse?",
      },
      {
        role: "user",
        content:
          "Apartment would be great - gym and secure parking are on my wishlist.",
      },
    ],
  },
  dusk: {
    label: "INVESTOR MODE",
    heading:
      "Find Australian suburbs that match your investment thesis",
    subheading:
      "Brief Brick AI on yield targets, vacancy tolerance, and tenant profile. We surface suburbs with the right momentum, transport, and amenities to match.",
    placeholder:
      "e.g. recommend a Perth suburb with 4% yield and new rail connections.",
    summary:
      "Brick AI scans council plans, transport projects, and sales history to shortlist properties aligned with your strategy.",
    background: {
      base: "bg-gradient-to-b from-orange-50 via-white to-amber-50",
      overlay:
        "bg-[radial-gradient(circle_at_top,_rgba(255,148,74,0.12),_transparent_52%),radial-gradient(circle_at_bottom,_rgba(255,191,105,0.1),_transparent_50%)]",
    },
    conversation: [
      {
        role: "user",
        content:
          "Show me Adelaide townhouses around AUD 850k with strong rental demand.",
      },
      {
        role: "assistant",
        content:
          "Consider Prospect and Norwood - low vacancy, tram access, and renovated stock. Want to prioritise newer builds or character homes?",
      },
      {
        role: "user",
        content:
          "Character homes with recent upgrades would be ideal.",
      },
    ],
  },
  coastal: {
    label: "COASTAL LIFESTYLE CURATION",
    heading: "Design your Australian sea-change with Brick AI",
    subheading:
      "Describe the beach lifestyle you're chasing and Brick AI filters coastal towns by commute, community vibe, and hidden local gems.",
    placeholder:
      "e.g. find a Gold Coast apartment under AUD 900k near surf breaks and cafes.",
    summary:
      "Brick AI weighs school ratings, beach access, and local culture to craft a shortlist without hours of scrolling.",
    background: {
      base: "bg-gradient-to-b from-cyan-50 via-white to-blue-50",
      overlay:
        "bg-[radial-gradient(circle_at_top,_rgba(76,201,240,0.12),_transparent_58%),radial-gradient(circle_at_bottom,_rgba(129,236,236,0.1),_transparent_48%)]",
    },
    conversation: [
      {
        role: "user",
        content:
          "Looking for a Sunshine Coast apartment under AUD 950k, walkable to the beach and markets.",
      },
      {
        role: "assistant",
        content:
          "Mooloolaba and Alexandra Headland tick the boxes - boardwalk access, Sunday markets, and strong rental demand. Do you need pet-friendly bylaws?",
      },
      {
        role: "user",
        content:
          "Yes, pet-friendly please, plus secure bike storage.",
      },
    ],
  },
} as const satisfies Record<string, LandingVariantConfig>;

export type LandingVariantKey = keyof typeof LANDING_VARIANTS;

const DEFAULT_VARIANT_KEY: LandingVariantKey = "aurora";

const SIDE_ICONS = [
  {
    src: "/Icons/button-comand.png",
    alt: "Command key",
    width: 96,
    height: 88,
    rotate: "-rotate-6",
  },
  {
    src: "/Icons/button-enter.png",
    alt: "Enter key",
    width: 98,
    height: 88,
    rotate: "rotate-6",
  },
] as const;

const RIGHT_SIDE_ICONS = [
  {
    src: "/Icons/button-up-active.png",
    alt: "Up key",
    width: 92,
    height: 84,
    rotate: "-rotate-5",
  },
  {
    src: "/Icons/button-down.png",
    alt: "Down key",
    width: 92,
    height: 84,
    rotate: "rotate-5",
  },
] as const;

export function pickRandomLandingVariantKey(): LandingVariantKey {
  const keys = Object.keys(LANDING_VARIANTS) as LandingVariantKey[];
  return keys[Math.floor(Math.random() * keys.length)];
}

function isLandingVariantKey(value: string | null): value is LandingVariantKey {
  return !!value && value in LANDING_VARIANTS;
}

export function useLandingVariant() {
  const [variantKey, setVariantKey] = useState<LandingVariantKey>(DEFAULT_VARIANT_KEY);

  useEffect(() => {
    const stored = window.localStorage.getItem(LANDING_VARIANT_STORAGE_KEY);
    if (isLandingVariantKey(stored)) {
      setVariantKey(stored);
      return;
    }

    const nextVariant = pickRandomLandingVariantKey();
    window.localStorage.setItem(LANDING_VARIANT_STORAGE_KEY, nextVariant);
    setVariantKey(nextVariant);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LANDING_VARIANT_STORAGE_KEY, variantKey);
  }, [variantKey]);

  return {
    variantKey,
    setVariantKey,
    activeVariant: LANDING_VARIANTS[variantKey],
  };
}

type LandingThemeContextValue = ReturnType<typeof useLandingVariant>;

const LandingThemeContext = createContext<LandingThemeContextValue | null>(null);

export function LandingThemeProvider({ children }: { children: ReactNode }) {
  const value = useLandingVariant();

  return (
    <LandingThemeContext.Provider value={value}>
      {children}
    </LandingThemeContext.Provider>
  );
}

export function useLandingTheme() {
  const context = useContext(LandingThemeContext);

  if (!context) {
    throw new Error("useLandingTheme must be used within LandingThemeProvider");
  }

  return context;
}

export function LandingAmbientBackground({
  overlayClassName,
}: {
  overlayClassName: string;
}) {
  return (
    <>
      <div className={`pointer-events-none absolute inset-0 ${overlayClassName}`} />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 hidden h-[1080px] xl:block">
        <div className="relative mx-auto h-full max-w-[1440px]">
          <div className="absolute left-16 top-56 flex w-36 flex-col justify-center gap-32 2xl:left-24 2xl:top-64 2xl:w-44">
            {SIDE_ICONS.map((icon, index) => (
              <motion.div
                key={icon.src}
                className={`relative flex justify-center ${
                  index === 0 ? "translate-x-8 translate-y-2" : "-translate-x-5 translate-y-10"
                }`}
                animate={{
                  y: index === 0 ? [0, -16, 10, 0] : [0, 14, -12, 0],
                  x: index === 0 ? [0, 12, -8, 0] : [0, -10, 8, 0],
                  rotate: index === 0 ? [0, 3, -2, 0] : [0, -4, 3, 0],
                }}
                transition={{
                  duration: index === 0 ? 15 : 18,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <motion.div
                  animate={{ rotate: index === 0 ? [-5, 1, -7, -5] : [5, -1, 7, 5] }}
                  transition={{
                    duration: index === 0 ? 17 : 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Image
                    src={icon.src}
                    alt={icon.alt}
                    width={icon.width}
                    height={icon.height}
                    className={`relative h-auto w-[122px] opacity-35 drop-shadow-[0_10px_18px_rgba(15,23,42,0.04)] 2xl:w-[138px] ${icon.rotate}`}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
          <div className="absolute right-16 top-64 flex w-36 flex-col justify-center gap-32 2xl:right-24 2xl:top-72 2xl:w-44">
            {RIGHT_SIDE_ICONS.map((icon, index) => (
              <motion.div
                key={icon.src}
                className={`relative flex justify-center ${
                  index === 0 ? "-translate-x-8 translate-y-6" : "translate-x-5 translate-y-14"
                }`}
                animate={{
                  y: index === 0 ? [0, 18, -10, 0] : [0, -14, 12, 0],
                  x: index === 0 ? [0, -12, 8, 0] : [0, 10, -8, 0],
                  rotate: index === 0 ? [0, -3, 2, 0] : [0, 4, -3, 0],
                }}
                transition={{
                  duration: index === 0 ? 16 : 19,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <motion.div
                  animate={{ rotate: index === 0 ? [-4, 1, -6, -4] : [4, -1, 6, 4] }}
                  transition={{
                    duration: index === 0 ? 18 : 21,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Image
                    src={icon.src}
                    alt={icon.alt}
                    width={icon.width}
                    height={icon.height}
                    className={`relative h-auto w-[122px] opacity-35 drop-shadow-[0_10px_18px_rgba(15,23,42,0.04)] 2xl:w-[138px] ${icon.rotate}`}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export function MarketingShell({ children }: { children: ReactNode }) {
  const { activeVariant } = useLandingTheme();

  return (
    <div
      className={`relative min-h-screen overflow-hidden text-gray-900 ${activeVariant.background.base}`}
    >
      <LandingAmbientBackground overlayClassName={activeVariant.background.overlay} />
      {children}
    </div>
  );
}
