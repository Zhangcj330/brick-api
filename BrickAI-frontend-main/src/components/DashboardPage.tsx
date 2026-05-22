"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Search,
} from "lucide-react";
import { AppNavigator } from "@/src/components/AppNavigator";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  EXPLORE_PROPERTIES,
  VERDICT_STYLES,
  findProperty,
} from "@/src/data/property-feed";
import {
  getLifecycleStageMeta,
  getPropertyWorkflowState,
  getReportStatusLabel,
  type PropertyStageTone,
} from "@/src/data/property-state-machine";
import { useAuth } from "@/src/components/providers/AuthProvider";

const DASHBOARD_FILTERS = ["Selling", "Sold"] as const;
const RECOMMENDATION_FILTERS = ["All", "Recommended", "Not recommended"] as const;
const DASHBOARD_PROPERTY_IDS = ["6", "2", "4", "3", "1", "5"] as const;

type DashboardFilter = (typeof DASHBOARD_FILTERS)[number];
type RecommendationFilter = (typeof RECOMMENDATION_FILTERS)[number];
type DashboardStatusTone = PropertyStageTone;
type DashboardPropertyItem = {
  propertyId: (typeof DASHBOARD_PROPERTY_IDS)[number];
  property: NonNullable<ReturnType<typeof findProperty>>;
  workflow: NonNullable<ReturnType<typeof getPropertyWorkflowState>>;
};

const STATUS_STYLES: Record<DashboardStatusTone, string> = {
  positive: "border-emerald-200 bg-emerald-50 text-emerald-700",
  neutral: "border-gray-200 bg-white text-gray-600",
  caution: "border-amber-200 bg-amber-50 text-amber-800",
};

function matchesDashboardFilter(
  item: {
    workflow: ReturnType<typeof getPropertyWorkflowState>;
  },
  filter: DashboardFilter,
) {
  if (filter === "Selling") return item.workflow.marketStatus === "selling";
  return item.workflow.marketStatus === "sold";
}

export function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [addressQuery, setAddressQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<DashboardFilter>("Selling");
  const [recommendationFilter, setRecommendationFilter] =
    useState<RecommendationFilter>("All");
  const [hiddenPropertyIds, setHiddenPropertyIds] = useState<string[]>([]);

  const filteredSuggestions = useMemo(() => {
    if (!addressQuery.trim()) {
      return EXPLORE_PROPERTIES.slice(0, 4);
    }

    const query = addressQuery.trim().toLowerCase();

    return EXPLORE_PROPERTIES.filter((property) =>
      `${property.address} ${property.suburb}`.toLowerCase().includes(query),
    ).slice(0, 4);
  }, [addressQuery]);

  const interestedProperties = useMemo(
    () =>
      DASHBOARD_PROPERTY_IDS.map((propertyId) => {
        const property = findProperty(propertyId);
        const workflow = getPropertyWorkflowState(propertyId);
        return property && workflow ? { propertyId, property, workflow } : null;
      }).filter(
        (item): item is DashboardPropertyItem => item !== null,
      ),
    [],
  );

  const visibleProperties = useMemo(
    () =>
      interestedProperties.filter((item) =>
        !hiddenPropertyIds.includes(item.propertyId) &&
        matchesDashboardFilter(item, activeFilter) &&
        (recommendationFilter === "All" ||
          (recommendationFilter === "Recommended"
            ? item.property.verdictTone === "positive"
            : item.property.verdictTone !== "positive")),
      ),
    [activeFilter, hiddenPropertyIds, interestedProperties, recommendationFilter],
  );

  const handleAddressOpen = () => {
    if (filteredSuggestions[0]) {
      router.push(`/workspace/${filteredSuggestions[0].id}`);
    }
  };

  const handleUnwatch = (propertyId: string) => {
    setHiddenPropertyIds((current) =>
      current.includes(propertyId) ? current : [...current, propertyId],
    );
  };

  const openReport = (propertyId: string) => {
    router.push(`/workspace/${propertyId}`);
  };

  return (
    <div className="relative z-10 min-h-screen">
      <header className="px-4 py-5 md:px-7">
        <AppNavigator />
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-10 md:px-7 md:pb-14">
        <section className="rounded-[30px] border border-white/80 bg-white/82 p-4 shadow-[0_20px_70px_-34px_rgba(15,23,42,0.2)] backdrop-blur-xl md:p-5">
          <div className="text-[11px] uppercase tracking-[0.28em] text-gray-400">
            Search exact address
          </div>
          <div className="mt-6 rounded-[26px] border border-gray-200 bg-white px-4 py-3 shadow-[0_14px_40px_-26px_rgba(22,2,17,0.15)]">
            <div className="flex items-center gap-3">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                value={addressQuery}
                onChange={(event) => setAddressQuery(event.target.value)}
                placeholder="Search exact address"
                className="h-12 w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-base"
              />
              <Button
                onClick={handleAddressOpen}
                className="rounded-full bg-gray-950 text-white hover:bg-gray-800"
              >
                Search
              </Button>
            </div>
          </div>
        </section>

        {!isLoading && isAuthenticated ? (
          <>
            <section className="mt-6 rounded-[34px] border border-white/80 bg-white/82 p-6 shadow-[0_20px_70px_-34px_rgba(15,23,42,0.2)] backdrop-blur-xl md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-gray-400">
                    Properties
                  </div>
                  <h2 className="mt-3 text-2xl tracking-tight text-gray-950 md:text-3xl">
                    Track every serious property in one place
                  </h2>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-gray-300 bg-white/80 text-gray-700 hover:bg-white"
                >
                  <Link href="/explore">Go to explore</Link>
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {DASHBOARD_FILTERS.map((filter) => (
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
                <div className="h-6 w-px bg-gray-200" aria-hidden="true" />
                {RECOMMENDATION_FILTERS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setRecommendationFilter(filter)}
                    className={`rounded-[22px] border px-5 py-3 text-sm font-medium tracking-tight transition md:min-w-[150px] ${
                      recommendationFilter === filter
                        ? "border-gray-950 bg-gray-950 text-white shadow-[0_16px_36px_-28px_rgba(15,23,42,0.55)]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:text-gray-950"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                {visibleProperties.map((item) => {
                  const stage = getLifecycleStageMeta(item.workflow.lifecycleStage);
                  const stageTone = STATUS_STYLES[stage.tone];
                  const reportStatusLabel = getReportStatusLabel(item.workflow.reportStatus);
                  const primaryButtonLabel =
                    item.workflow.reportStatus === "unpurchased"
                      ? "Full access"
                      : "Workspace";

                  return (
                    <article
                      key={`${item.propertyId}-${item.workflow.lifecycleStage}`}
                      onClick={() => openReport(item.property.id)}
                      className="cursor-pointer rounded-[28px] border border-gray-200 bg-white/92 p-5 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.28)] transition hover:border-gray-300 md:p-6"
                    >
                      <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1.2fr)_220px_210px]">
                        <div className="relative aspect-square overflow-hidden rounded-[24px] border border-gray-200 bg-gray-100 md:h-[180px]">
                          <img
                            src={item.property.overviewImageUrl}
                            alt={`Overview of ${item.property.address}, ${item.property.suburb}`}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                          <div className="absolute left-3 top-3">
                            <Badge
                              className={`rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md ${VERDICT_STYLES[item.property.verdictTone].badge}`}
                            >
                              {item.property.verdict}
                            </Badge>
                          </div>
                        </div>

                        <div className="min-w-0 overflow-hidden rounded-[24px] border border-gray-200 bg-[rgba(255,255,255,0.86)] p-4 md:h-[180px]">
                          <div className="flex h-full flex-col">
                            <div className="min-w-0 flex-1">
                              <div className="line-clamp-1 text-lg font-medium tracking-tight text-gray-950 md:text-xl">
                                {item.property.address}
                              </div>
                              <p className="mt-1 line-clamp-1 text-sm text-gray-500">
                                {item.property.suburb} · {item.property.price} · {item.property.propertyType}
                              </p>

                              <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-5 text-gray-700 md:text-[15px]">
                                {item.property.reason}
                              </p>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className={`rounded-full border px-3 py-1.5 text-xs font-medium ${stageTone}`}>
                                {stage.label}
                              </span>
                              <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
                                {reportStatusLabel}
                              </span>
                              <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
                                {item.workflow.updatedAt}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="overflow-hidden rounded-[24px] border border-gray-200 bg-[rgba(249,250,251,0.62)] p-4 md:h-[180px]">
                          <div className="flex h-full flex-col justify-between">
                            <div>
                              <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                                Action
                              </div>
                              <div className="mt-3 line-clamp-2 text-[15px] font-medium tracking-tight text-gray-950">
                                {stage.nextActionLabel}
                              </div>
                              <p className="mt-2 line-clamp-3 text-sm leading-5 text-gray-600">
                                {item.workflow.actionSupport}
                              </p>
                            </div>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              <span className={`rounded-full border px-3 py-1.5 text-xs font-medium ${stageTone}`}>
                                {stage.label}
                              </span>
                              <Button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  router.push(`/workspace/${item.property.id}#proceed`);
                                }}
                                variant="outline"
                                className="rounded-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                              >
                                {stage.nextActionLabel}
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="overflow-hidden rounded-[24px] border border-gray-200 bg-white p-4 md:h-[180px]">
                          <div className="flex h-full flex-col justify-end gap-3">
                            <Button
                              onClick={(event) => {
                                event.stopPropagation();
                                if (item.workflow.reportStatus === "unpurchased") {
                                  router.push(`/workspace/${item.property.id}#purchase`);
                                  return;
                                }
                                router.push(`/workspace/${item.property.id}`);
                              }}
                              className="rounded-full bg-gray-950 text-white hover:bg-gray-800"
                            >
                              {primaryButtonLabel}
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={(event) => {
                                event.stopPropagation();
                                router.push(
                                  `/chat?message=${encodeURIComponent(
                                    `Chat about ${item.property.address}, ${item.property.suburb}.`,
                                  )}`,
                                )
                              }}
                              variant="outline"
                              className="h-auto whitespace-normal rounded-full border-gray-300 bg-white px-4 py-2 text-center text-sm leading-5 text-gray-700 hover:bg-gray-50"
                            >
                              Chat
                            </Button>
                            <Button
                              variant="outline"
                              className="rounded-full border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleUnwatch(item.propertyId);
                              }}
                            >
                              Unwatch
                            </Button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          <section className="mt-6 rounded-[34px] border border-white/80 bg-white/82 p-6 shadow-[0_20px_70px_-34px_rgba(15,23,42,0.2)] backdrop-blur-xl md:p-8">
            <div className="max-w-3xl">
              <div className="text-[11px] uppercase tracking-[0.28em] text-gray-400">
                Dashboard unlocks after sign-in
              </div>
              <h2 className="mt-3 text-3xl tracking-tight text-gray-950">
                Sign in to unlock your interested properties board, workspace continuity, and next steps.
              </h2>
              <p className="mt-4 text-sm leading-7 text-gray-600 md:text-base">
                Explore stays browse-first. Dashboard is where the product keeps every serious property, workspace state, and next move in one place.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="rounded-full bg-gray-950 text-white hover:bg-gray-800">
                  <Link href="/auth">Sign in</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-gray-300">
                  <Link href="/explore">Keep browsing</Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
