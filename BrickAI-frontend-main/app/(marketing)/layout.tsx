import {
  LandingThemeProvider,
  MarketingShell,
} from "@/src/components/landing-theme";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LandingThemeProvider>
      <MarketingShell>{children}</MarketingShell>
    </LandingThemeProvider>
  );
}
