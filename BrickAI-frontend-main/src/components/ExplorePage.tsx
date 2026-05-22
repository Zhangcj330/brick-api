"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Heart,
  MessageCircle,
  Search,
} from "lucide-react";
import { AppNavigator } from "@/src/components/AppNavigator";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  EXPLORE_PROPERTIES,
  FEED_FILTERS,
  FILTER_DESCRIPTIONS,
  VERDICT_STYLES,
} from "@/src/data/property-feed";
import { useAuth } from "@/src/components/providers/AuthProvider";

export function ExplorePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeFilter, setActiveFilter] =
    useState<(typeof FEED_FILTERS)[number]>("Best match");
  const [savedIds, setSavedIds] = useState<string[]>(["4"]);
  const [addressQuery, setAddressQuery] = useState("");

  const filteredSuggestions = useMemo(() => {
    if (!addressQuery.trim()) {
      return EXPLORE_PROPERTIES.slice(0, 4);
    }

    const query = addressQuery.trim().toLowerCase();

    return EXPLORE_PROPERTIES.filter((property) =>
      `${property.address} ${property.suburb}`.toLowerCase().includes(query),
    ).slice(0, 4);
  }, [addressQuery]);

  const toggleSaved = (propertyId: string) => {
    setSavedIds((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId],
    );
  };

  const openProperty = (propertyId: string) => {
    router.push(`/workspace/${propertyId}`);
  };

  const askBrickAI = (prompt: string) => {
    router.push(`/chat?message=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="relative z-10 min-h-screen">
      <header className="px-4 py-5 md:px-7">
        <AppNavigator />
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-10 md:px-7 md:pb-14">
        <section className="rounded-[34px] border border-white/80 bg-white/82 p-6 shadow-[0_20px_70px_-34px_rgba(15,23,42,0.2)] backdrop-blur-xl md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-gray-400">
                Address lookup
              </div>
              <h1 className="mt-3 text-3xl tracking-tight text-gray-950 md:text-4xl">
                What property do you want to judge?
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 md:text-base">
                Search an exact address or suburb, then jump straight into the property workspace.
              </p>
            </div>
            <Badge className="rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-gray-500 hover:bg-white/80">
              Start with an address
            </Badge>
          </div>

          <div className="mt-6 rounded-[26px] border border-gray-200 bg-white px-4 py-3 shadow-[0_14px_40px_-26px_rgba(22,2,17,0.15)]">
            <div className="flex items-center gap-3">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                value={addressQuery}
                onChange={(event) => setAddressQuery(event.target.value)}
                placeholder="Search exact address or suburb"
                className="h-12 w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-base"
              />
              <Button
                onClick={() => {
                  if (filteredSuggestions[0]) {
                    openProperty(filteredSuggestions[0].id);
                  }
                }}
                className="rounded-full bg-gray-950 text-white hover:bg-gray-800"
              >
                Open
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {filteredSuggestions.map((property) => (
              <button
                key={property.id}
                type="button"
                onClick={() => openProperty(property.id)}
                className="rounded-full border border-gray-200 bg-white/85 px-3 py-2 text-sm text-gray-700 transition hover:border-gray-300 hover:text-gray-950"
              >
                {property.address}, {property.suburb}
              </button>
            ))}
          </div>
        </section>

        {!isLoading && isAuthenticated ? (
          <section className="mt-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-gray-400">
                  Feed
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Browse properties with clearer reasons, not just listing details.
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-gray-400">
                  {activeFilter}: {FILTER_DESCRIPTIONS[activeFilter]}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {FEED_FILTERS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      activeFilter === filter
                        ? "bg-gray-950 text-white"
                        : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {EXPLORE_PROPERTIES.map((property) => {
                const isSaved = savedIds.includes(property.id);

                return (
                  <article
                    key={property.id}
                    className="group relative overflow-hidden rounded-[34px] border border-white/70 bg-black shadow-[0_28px_90px_-36px_rgba(15,23,42,0.42)] transition hover:-translate-y-1 hover:shadow-[0_32px_100px_-34px_rgba(15,23,42,0.5)]"
                  >
                    <img
                      src={property.imageUrl}
                      alt={`${property.address}, ${property.suburb}`}
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/82 via-black/44 to-black/18" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-transparent to-black/22" />

                    <div className="relative flex min-h-[520px] flex-col justify-between p-6 md:p-8">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge className={`rounded-full border px-3 py-1.5 backdrop-blur-md hover:bg-white/14 ${VERDICT_STYLES[property.verdictTone].badge}`}>
                            {property.verdict}
                          </Badge>
                          <Badge className="rounded-full border border-white/20 bg-white/14 px-3 py-1.5 text-white backdrop-blur-md hover:bg-white/14">
                            {property.recommendation}
                          </Badge>
                        </div>
                        <div
                          className={`rounded-full border px-3 py-1.5 text-sm font-medium backdrop-blur-md ${VERDICT_STYLES[property.verdictTone].score}`}
                        >
                          {property.aiScore.toFixed(1)}
                        </div>
                      </div>

                      <div className="max-w-2xl">
                        <p className="max-w-xl text-base leading-7 text-white/88 md:text-lg">
                          {property.reason}
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/72">
                          <span className="font-medium text-white">{property.price}</span>
                          <span>{property.propertyType}</span>
                          <span>{property.bedrooms} bed</span>
                        </div>

                        <h3 className="mt-4 text-3xl tracking-tight text-white md:text-4xl">
                          {property.address}
                        </h3>
                        <p className="mt-1 text-sm text-white/68 md:text-base">
                          {property.suburb}
                        </p>

                        <div className="mt-5 grid gap-3 md:grid-cols-2">
                          {property.insights.slice(0, 2).map((insight) => (
                            <div
                              key={insight}
                              className="rounded-[22px] border border-white/14 bg-white/10 p-4 backdrop-blur-md"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white text-gray-950">
                                  <ArrowUpRight className="h-3.5 w-3.5" />
                                </div>
                                <p className="text-sm leading-6 text-white/82">{insight}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Button
                          variant="secondary"
                          onClick={() => openProperty(property.id)}
                          className="rounded-full border border-white/18 bg-white/12 px-5 text-white backdrop-blur-md hover:bg-white/18"
                        >
                          Open workspace
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                        <button
                          type="button"
                          onClick={() => toggleSaved(property.id)}
                          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/18 bg-white/12 text-white backdrop-blur-md"
                          aria-label={isSaved ? "Remove from saved" : "Save property"}
                        >
                          <Heart
                            className={`h-5 w-5 ${isSaved ? "fill-white text-white" : "text-white"}`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            askBrickAI(
                              `Explain why ${property.address}, ${property.suburb} surfaced for me.`,
                            )
                          }
                          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/18 bg-white/12 text-white backdrop-blur-md"
                          aria-label="Ask about this property"
                        >
                          <MessageCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </main>

      {isAuthenticated ? (
        <button
          type="button"
          onClick={() => askBrickAI("Help me compare suburbs or shortlist what to review next.")}
          className="fixed bottom-5 right-5 z-40 inline-flex h-14 items-center gap-2 rounded-full border border-gray-900/10 bg-gray-950 px-4 text-white shadow-[0_24px_60px_-26px_rgba(15,23,42,0.42)] transition hover:-translate-y-0.5 hover:bg-black md:bottom-7 md:right-7"
          aria-label="Ask Brick AI"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden text-sm font-medium sm:inline">Ask Brick AI</span>
        </button>
      ) : null}
    </div>
  );
}
