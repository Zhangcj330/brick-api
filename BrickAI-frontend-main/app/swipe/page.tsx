"use client";

import { useRouter } from "next/navigation";
import { LandingThemeProvider, MarketingShell } from "@/src/components/landing-theme";
import { SwipeablePropertyCards } from "@/src/components/SwipeablePropertyCards";

export default function SwipeRoutePage() {
  const router = useRouter();

  return (
    <LandingThemeProvider>
      <MarketingShell>
        <SwipeablePropertyCards onBack={() => router.push("/")} />
      </MarketingShell>
    </LandingThemeProvider>
  );
}
