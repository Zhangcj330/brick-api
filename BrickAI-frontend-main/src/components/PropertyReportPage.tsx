import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  FileSearch,
  Heart,
  MessageCircle,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { AppNavigator } from "@/src/components/AppNavigator";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  type ExploreProperty,
  VERDICT_STYLES,
} from "@/src/data/property-feed";
import {
  getBiggestCaution,
  getReportChecks,
} from "@/src/data/property-report-support";

interface PropertyReportPageProps {
  property: ExploreProperty;
}

export function PropertyReportPage({ property }: PropertyReportPageProps) {
  const reportChecks = getReportChecks(property);
  const chatPrompt = `Help me understand the report for ${property.address}, ${property.suburb}.`;

  return (
    <div className="relative z-10 min-h-screen">
      <header className="px-4 py-5 md:px-7">
        <AppNavigator
          rightSlot={
            <div className="hidden rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.2em] text-gray-500 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.28)] backdrop-blur-xl sm:inline-flex">
              Property report
            </div>
          }
        />
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-12 md:px-7 md:pb-16">
        <div className="mb-5">
          <Button
            asChild
            variant="outline"
            className="rounded-full border-gray-300 bg-white/80 text-gray-900 hover:bg-white"
          >
            <Link href="/explore">
              <ArrowLeft className="h-4 w-4" />
              Back to explore
            </Link>
          </Button>
        </div>

        <section className="overflow-hidden rounded-[34px] border border-white/80 bg-white/82 shadow-[0_20px_70px_-34px_rgba(15,23,42,0.2)] backdrop-blur-xl">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
            <div className="relative min-h-[360px]">
              <img
                src={property.imageUrl}
                alt={`${property.address}, ${property.suburb}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/62 via-black/20 to-black/8" />
              <div className="absolute left-6 right-6 top-6 flex items-start justify-between gap-3">
                <Badge className={`rounded-full border px-3 py-1.5 backdrop-blur-md hover:bg-white/14 ${VERDICT_STYLES[property.verdictTone].badge}`}>
                  {property.verdict}
                </Badge>
                <div
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium backdrop-blur-md ${VERDICT_STYLES[property.verdictTone].score}`}
                >
                  {property.aiScore.toFixed(1)}
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/68">
                  Property context
                </div>
                <h1 className="mt-3 text-3xl tracking-tight text-white md:text-4xl">
                  {property.address}
                </h1>
                <p className="mt-1 text-sm text-white/72 md:text-base">
                  {property.suburb}
                </p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="text-[11px] uppercase tracking-[0.28em] text-gray-400">
                Decision framing
              </div>
              <h2 className="mt-3 text-3xl tracking-tight text-gray-950">
                {property.reason}
              </h2>
              <p className="mt-4 text-sm leading-7 text-gray-600 md:text-base">
                {property.summary}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                <span className="font-medium text-gray-950">{property.price}</span>
                <span>{property.propertyType}</span>
                <span>{property.bedrooms} bed</span>
                <span>{property.recommendation}</span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-gray-200 bg-[#fffdf8] p-4">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                    Biggest caution
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-700">
                    {getBiggestCaution(property)}
                  </p>
                </div>
                <div className="rounded-[22px] border border-gray-200 bg-[#fffdf8] p-4">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                    Chat context
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-700">
                    Ask Brick AI about this property, this report, or what still needs checking next.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  className="rounded-full bg-gray-950 text-white hover:bg-gray-800"
                >
                  <Link href={`/workspace/${property.id}`}>
                    Open workspace
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-gray-300"
                >
                  <Link href={`/chat?message=${encodeURIComponent(chatPrompt)}`}>
                    Ask Brick AI
                    <MessageCircle className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  className="rounded-full border-gray-300"
                  variant="outline"
                >
                  <Heart className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
          <article className="rounded-[34px] border border-white/80 bg-white/82 p-6 shadow-[0_20px_70px_-34px_rgba(15,23,42,0.2)] backdrop-blur-xl md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-950 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-gray-400">
                  Brick AI highlights
                </div>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  The strongest reasons this property belongs in the conversation.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {property.insights.map((insight) => (
                <div
                  key={insight}
                  className="flex items-start gap-3 rounded-[22px] border border-gray-200 bg-white/90 p-4"
                >
                  <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-950 text-white">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-sm leading-6 text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </article>

          <aside className="space-y-6">
            <div className="rounded-[34px] bg-gray-950 p-6 text-white shadow-[0_20px_70px_-34px_rgba(15,23,42,0.4)] md:p-8">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-white/72" />
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/55">
                  What to verify next
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {reportChecks.map((check) => (
                  <div
                    key={check}
                    className="rounded-[22px] border border-white/12 bg-white/8 p-4 text-sm leading-6 text-white/78"
                  >
                    {check}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[34px] border border-white/80 bg-white/82 p-6 shadow-[0_20px_70px_-34px_rgba(15,23,42,0.2)] backdrop-blur-xl md:p-8">
              <div className="flex items-center gap-3">
                <FileSearch className="h-5 w-5 text-gray-500" />
                <div className="text-[11px] uppercase tracking-[0.28em] text-gray-400">
                  Report posture
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-700">
                This page is the serious-mode surface: judgment first, evidence second, and next checks before final conviction.
              </p>
              <Button
                asChild
                variant="outline"
                className="mt-5 rounded-full border-gray-300"
              >
                <Link href={`/chat?message=${encodeURIComponent(`What should I verify next for ${property.address}?`)}`}>
                  Ask what to verify next
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
