"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ArrowLeft,
  ArrowUpRight,
  Bath,
  BedDouble,
  Building2,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Cross,
  FileText,
  GraduationCap,
  Heart,
  Home,
  Info,
  Layers3,
  MessageCircle,
  Ruler,
  Send,
  ShieldAlert,
  ShoppingBag,
  TrainFront,
  Trees,
  Sparkles,
} from "lucide-react";
import { AppNavigator } from "@/src/components/AppNavigator";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  type ExploreProperty,
  VERDICT_STYLES,
} from "@/src/data/property-feed";
import {
  getPropertyReportData,
  type ReportModule,
} from "@/src/data/property-report-data";
import {
  getBiggestCaution,
  getReportChecks,
} from "@/src/data/property-report-support";
import {
  getLifecycleStageMeta,
  type PropertyLifecycleStage,
} from "@/src/data/property-state-machine";
import {
  createInteraction,
  createSession,
  getSessionPath,
  type Interaction,
  waitForInteractionResult,
} from "@/src/lib/brickai-agent-api";

type WorkspaceAnswer = {
  shortAnswer: string;
  concerns: string[];
  unknowns: string[];
  nextChecks: string[];
};

type WorkspaceMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  answer?: WorkspaceAnswer;
  tone?: "default" | "loading" | "error";
};

const WORKSPACE_SESSION_STORAGE_PREFIX = "brickai-workspace-session:";

const PROMPTS = [
  "Explain the main risk here",
  "What should I verify before inspecting?",
  "Summarize the tradeoff in plain English",
  "What would make this property stronger?",
] as const;

const EVIDENCE_TABS = [
  { id: "overview", label: "Overview" },
  { id: "visual", label: "Visual" },
  { id: "property", label: "Building" },
  { id: "context", label: "Location" },
  { id: "planning", label: "Land & Planning" },
  { id: "financial", label: "Financial" },
  { id: "documents", label: "Documents" },
] as const;

type EvidenceTabId = (typeof EVIDENCE_TABS)[number]["id"];

const WORKSPACE_STAGE_FLOW: {
  key: PropertyLifecycleStage;
  label: string;
}[] = [
  { key: "shortlisted", label: "Shortlisted" },
  { key: "reviewing_report", label: "Reviewing report" },
  { key: "ready_for_inspection", label: "Ready for inspection" },
  { key: "needs_further_checks", label: "Needs further checks" },
  { key: "preparing_offer", label: "Preparing offer" },
  { key: "under_contract", label: "Under contract" },
  { key: "pre_settlement", label: "Pre-settlement" },
  { key: "settled", label: "Settled" },
] as const;

function getDefaultEvidenceTab(stageLabel: string): EvidenceTabId {
  switch (stageLabel) {
    case "Reviewing report":
      return "property";
    case "Ready for inspection":
      return "visual";
    case "Needs further checks":
      return "documents";
    case "Preparing offer":
      return "financial";
    case "Under contract":
      return "documents";
    case "Pre-settlement":
    case "Settled":
    case "Shortlisted":
    default:
      return "overview";
  }
}

function getSimpleDecisionLabel(verdictTone: ExploreProperty["verdictTone"]) {
  switch (verdictTone) {
    case "positive":
      return "Recommended";
    case "cautious":
      return "Caution";
    case "unclear":
    default:
      return "Unknowns";
  }
}

function buildWorkspaceAnswer(property: ExploreProperty, prompt: string): WorkspaceAnswer {
  const normalized = prompt.toLowerCase();

  if (normalized.includes("inspect") || normalized.includes("verify")) {
    return {
      shortAnswer:
        "The next step is not more browsing. It is clearing the few unknowns that could change your conviction on this property.",
      concerns: getReportChecks(property).slice(0, 2),
      unknowns: [
        "You still do not know whether the apparent value survives building and pricing checks.",
        "The current report posture is directional, not yet final-conviction evidence.",
      ],
      nextChecks: getReportChecks(property),
    };
  }

  if (normalized.includes("risk")) {
    return {
      shortAnswer: getBiggestCaution(property),
      concerns: [
        "The current story could still be too optimistic if building or pricing friction appears.",
        "A good surface-level fit can still fail once you pressure-test actual deal conditions.",
      ],
      unknowns: [
        "No uploaded report or contract has been interpreted in this workspace yet.",
        "Comparable-sales confidence is still implied rather than explicitly shown.",
      ],
      nextChecks: getReportChecks(property),
    };
  }

  if (normalized.includes("stronger")) {
    return {
      shortAnswer:
        "This property gets stronger when the current fit story is backed by evidence, not just instinct.",
      concerns: [
        "Right now the fit is promising, but still partly narrative-driven.",
        "You need proof on price discipline and hidden maintenance or legal friction.",
      ],
      unknowns: [
        "There is no document-grounded confirmation yet.",
        "The current workspace has not captured inspection or contract notes.",
      ],
      nextChecks: [
        "Upload and interpret the building report.",
        "Check comparable sales against the guide price.",
        "Summarize deal-breakers before moving toward offer readiness.",
      ],
    };
  }

  return {
    shortAnswer:
      "In plain English: this property is interesting because the fit is visible, but you are not done until the risk story and next checks become explicit.",
    concerns: [
      property.reason,
      getBiggestCaution(property),
    ],
    unknowns: [
      "The report summary is still partial rather than end-to-end.",
      "No document-specific interpretation has been attached to this workspace yet.",
    ],
    nextChecks: getReportChecks(property),
  };
}

function buildWorkspaceApiAnswer(
  property: ExploreProperty,
  finalResponse: string,
): WorkspaceAnswer {
  return {
    shortAnswer: finalResponse,
    concerns: [
      property.reason,
      getBiggestCaution(property),
    ],
    unknowns: [
      "The answer came from the live API, but the workspace still has no uploaded report or contract attached.",
    ],
    nextChecks: getReportChecks(property),
  };
}

function buildWorkspaceErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("Gemini is not configured")) {
      return "The backend is online, but Gemini is not configured yet. Add the API key in `brickai-agent-api-design/backend/.env` and retry.";
    }

    return error.message;
  }

  return "Brick AI could not complete this property request.";
}

function buildInitialWorkspaceMessage(
  property: ExploreProperty,
  reportChecks: string[],
): WorkspaceMessage {
  return {
    id: "assistant-initial",
    role: "assistant",
    tone: "default",
    content:
      "This workspace stays focused on one property. Use it to ask what matters, what is still unknown, and what should happen next before you go further.",
    answer: {
      shortAnswer:
        "This workspace is for end-to-end support on one property, not general chat.",
      concerns: [
        property.reason,
        getBiggestCaution(property),
      ],
      unknowns: [
        "No report file or contract has been attached yet.",
        "The current decision deck still needs evidence-backed updates.",
      ],
      nextChecks: reportChecks,
    },
  };
}

function mapInteractionsToWorkspaceMessages(
  property: ExploreProperty,
  interactions: Interaction[],
): WorkspaceMessage[] {
  return interactions.flatMap((interaction) => {
    const mapped: WorkspaceMessage[] = [
      {
        id: `${interaction.interaction_id}-user`,
        role: "user",
        content: interaction.user.content,
        tone: "default",
      },
    ];

    if (interaction.assistant?.content) {
      mapped.push({
        id: interaction.interaction_id,
        role: "assistant",
        content: interaction.assistant.content,
        answer: buildWorkspaceApiAnswer(property, interaction.assistant.content),
        tone: "default",
      });
    }

    return mapped;
  });
}

interface PropertyWorkspacePageProps {
  property: ExploreProperty;
  initialMessage?: string;
}

function StructuredModuleCard({ module }: { module: ReportModule }) {
  const toneClass =
    module.tone === "caution"
      ? "border-amber-200 bg-amber-50/70"
      : "border-gray-200 bg-[#fffdf8]";

  return (
    <div className={`rounded-[22px] border p-4 ${toneClass}`}>
      <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
        {module.title}
      </div>
      <p className="mt-2 text-sm leading-6 text-gray-600">{module.summary}</p>
      <dl className="mt-4 space-y-3">
        {module.rows.map((row) => (
          <div key={`${module.id}-${row.label}`} className="grid gap-1">
            <dt className="text-xs uppercase tracking-[0.18em] text-gray-400">
              {row.label}
            </dt>
            <dd className="text-sm leading-6 text-gray-700">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function EvidenceSummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "caution";
}) {
  const toneClass =
    tone === "caution"
      ? "border-amber-200 bg-amber-50/70 text-amber-950"
      : "border-gray-200 bg-white text-gray-800";

  return (
    <div className={`rounded-[22px] border p-4 ${toneClass}`}>
      <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
        {label}
      </div>
      <p className="mt-2 text-sm leading-6">{value}</p>
    </div>
  );
}

function IdentityFactChip({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
      <span className="text-gray-400">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function VisualImageCard({
  title,
  caption,
  imageUrl,
  className = "",
  imageClassName = "",
}: {
  title: string;
  caption: string;
  imageUrl: string;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-[26px] border border-gray-200 bg-white ${className}`}>
      <div className="aspect-square">
        <img
          src={imageUrl}
          alt={title}
          className={`h-full w-full object-cover ${imageClassName}`}
        />
      </div>
      <div className="border-t border-gray-200 p-4">
        <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
          {title}
        </div>
        <p className="mt-2 text-sm leading-6 text-gray-700">{caption}</p>
      </div>
    </div>
  );
}

function VisualMapCard({
  property,
  reportData,
}: {
  property: ExploreProperty;
  reportData: ReturnType<typeof getPropertyReportData>;
}) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-gray-200 bg-white">
      <div className="relative aspect-square overflow-hidden bg-[#eef1ea]">
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,0.34)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.34)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute left-[18%] top-[22%] h-16 w-16 rounded-full border border-[#d8ddd2] bg-[#f9fbf6]" />
        <div className="absolute right-[20%] top-[16%] h-24 w-24 rounded-full border border-[#d8ddd2] bg-[#f9fbf6]" />
        <div className="absolute left-[10%] right-[18%] top-[46%] h-[2px] -rotate-6 bg-[#b9c3b3]" />
        <div className="absolute left-[14%] right-[10%] top-[62%] h-[2px] rotate-3 bg-[#b9c3b3]" />
        <div className="absolute bottom-[18%] left-[48%] h-24 w-[2px] bg-[#b9c3b3]" />
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <div className="h-4 w-4 rounded-full border-4 border-white bg-gray-950 shadow-[0_10px_28px_-12px_rgba(15,23,42,0.55)]" />
          <div className="mt-3 rounded-full border border-gray-200 bg-white/92 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gray-500 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.4)]">
            {property.suburb}
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 p-4">
        <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
          Map & orientation
        </div>
        <p className="mt-2 text-sm leading-6 text-gray-700">
          {reportData.modules.locationAmenity.rows[0]?.value}. {reportData.modules.planningConstraints.rows[0]?.value}. {reportData.modules.environmentLivability.rows[0]?.value}.
        </p>
      </div>
    </div>
  );
}

function LocationMapCard({
  property,
  reportData,
}: {
  property: ExploreProperty;
  reportData: ReturnType<typeof getPropertyReportData>;
}) {
  const pointPositions = [
    "left-[14%] top-[26%]",
    "right-[14%] top-[24%]",
    "left-[18%] bottom-[22%]",
    "right-[18%] bottom-[30%]",
    "left-[40%] bottom-[14%]",
  ] as const;

  const iconByKind = {
    station: <TrainFront className="h-3.5 w-3.5" />,
    school: <GraduationCap className="h-3.5 w-3.5" />,
    market: <ShoppingBag className="h-3.5 w-3.5" />,
    hospital: <Cross className="h-3.5 w-3.5" />,
    park: <Trees className="h-3.5 w-3.5" />,
  } as const;

  return (
    <div className="overflow-hidden rounded-[26px] border border-gray-200 bg-white">
      <div className="relative aspect-square overflow-hidden bg-[#eef2eb]">
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.28)_1px,transparent_1px)] bg-[size:42px_42px]" />
        <div className="absolute -left-[8%] top-[22%] h-[15%] w-[52%] rotate-[124deg] bg-white/95 shadow-[0_0_0_1px_rgba(209,213,219,0.35)]" />
        <div className="absolute left-[4%] top-[67%] h-[12%] w-[54%] rotate-[22deg] bg-white/95 shadow-[0_0_0_1px_rgba(209,213,219,0.35)]" />
        <div className="absolute right-[-10%] top-[18%] h-[16%] w-[44%] rotate-[32deg] bg-white/95 shadow-[0_0_0_1px_rgba(209,213,219,0.35)]" />
        <div className="absolute right-[8%] top-[52%] h-[14%] w-[34%] rotate-[118deg] bg-white/95 shadow-[0_0_0_1px_rgba(209,213,219,0.35)]" />
        <div className="absolute left-[12%] top-[10%] h-[18%] w-[12%] rotate-[18deg] rounded-[10px] bg-[#dfe5dd]" />
        <div className="absolute left-[56%] top-[14%] h-[20%] w-[14%] rotate-[30deg] rounded-[10px] bg-[#dfe5dd]" />
        <div className="absolute left-[26%] top-[42%] h-[18%] w-[16%] rotate-[24deg] rounded-[10px] bg-[#dfe5dd]" />
        <div className="absolute right-[18%] top-[34%] h-[20%] w-[16%] rotate-[20deg] rounded-[10px] bg-[#dfe5dd]" />
        <div className="absolute left-[60%] bottom-[18%] h-[22%] w-[18%] rotate-[18deg] rounded-[10px] bg-[#dfe5dd]" />

        <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <div className="h-5 w-5 rounded-full border-4 border-white bg-gray-950 shadow-[0_10px_28px_-12px_rgba(15,23,42,0.55)]" />
          <div className="mt-2 rounded-full border border-gray-200 bg-white/95 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-gray-500 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.4)]">
            {property.suburb}
          </div>
        </div>

        {reportData.location.mapPoints.map((point, index) => (
          <div
            key={`${point.kind}-${point.label}`}
            className={`absolute z-10 ${pointPositions[index] ?? pointPositions[0]}`}
          >
            <div className="rounded-[18px] border border-gray-200 bg-white/96 px-3 py-2 shadow-[0_16px_32px_-20px_rgba(15,23,42,0.35)] backdrop-blur-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-[#2563eb]">{iconByKind[point.kind]}</span>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                  {point.label}
                </span>
              </div>
              <div className="mt-1 text-sm leading-5 text-gray-900">{point.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 p-4">
        <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
          Nearby map
        </div>
      </div>
    </div>
  );
}

function RecentSaleCard({
  sale,
}: {
  sale: ReturnType<typeof getPropertyReportData>["financial"]["recentSales"][number];
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-gray-200 bg-white">
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={sale.imageUrl}
          alt={sale.address}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium leading-6 text-gray-950">{sale.address}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-400">
              {sale.soldDate}
            </div>
          </div>
          <div className="rounded-full border border-gray-200 bg-[#fffdf8] px-3 py-1 text-sm font-medium text-gray-900">
            {sale.soldPrice}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
          <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1">
            {sale.propertyType}
          </span>
          <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1">
            {sale.bedrooms}
          </span>
          <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1">
            {sale.bathrooms}
          </span>
          <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1">
            {sale.parking}
          </span>
        </div>
      </div>
    </div>
  );
}

function PlanningSummaryChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-gray-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-[0.22em] text-gray-400">{label}</div>
      <div className="mt-2 text-sm font-medium leading-6 text-gray-900">{value}</div>
    </div>
  );
}

function BuildingVerdictCard({
  label,
  value,
  cues,
  tone = "default",
}: {
  label: string;
  value: string;
  cues: string[];
  tone?: "default" | "caution";
}) {
  const toneClass =
    tone === "caution"
      ? "border-amber-200 bg-amber-50/70"
      : "border-gray-200 bg-white";

  return (
    <div className={`rounded-[26px] border p-5 ${toneClass}`}>
      <div className={`text-[11px] uppercase tracking-[0.24em] ${tone === "caution" ? "text-amber-800/70" : "text-gray-400"}`}>
        {label}
      </div>
      <p className="mt-3 text-lg leading-8 text-gray-950">{value}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {cues.map((cue) => (
          <span
            key={cue}
            className={`rounded-full border px-3 py-1 text-xs leading-5 ${
              tone === "caution"
                ? "border-amber-200 bg-white/75 text-amber-950"
                : "border-gray-200 bg-[#fffdf8] text-gray-700"
            }`}
          >
            {cue}
          </span>
        ))}
      </div>
    </div>
  );
}

function BuildingFactsCard({
  title,
  facts,
}: {
  title: string;
  facts: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="rounded-[26px] border border-gray-200 bg-white p-5">
      <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">{title}</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {facts.map((fact) => (
          <div key={fact.label} className="rounded-[18px] border border-gray-200 bg-[#fffdf8] px-3 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-gray-400">{fact.label}</div>
            <div className="mt-1 text-sm leading-6 text-gray-900">{fact.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getFeatureStatusClasses(status: "present" | "not_noted" | "none") {
  switch (status) {
    case "present":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "none":
      return "border-gray-200 bg-white text-gray-500";
    case "not_noted":
    default:
      return "border-amber-200 bg-amber-50/60 text-amber-950";
  }
}

function BuildingFeaturesCard({
  features,
}: {
  features: ReturnType<typeof getPropertyReportData>["building"]["features"];
}) {
  return (
    <div className="rounded-[26px] border border-gray-200 bg-white p-5">
      <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">Features & extras</div>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {features.map((feature) => (
          <div
            key={feature.label}
            className={`rounded-full border px-3 py-2 text-sm leading-5 ${getFeatureStatusClasses(feature.status)}`}
          >
            <span className="font-medium">{feature.label}</span>
            <span className="ml-2 opacity-80">{feature.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BuildingObservationCard({
  title,
  basis,
  items,
  read,
}: {
  title: string;
  basis: string;
  items: Array<{ label: string; value: string }>;
  read: string;
}) {
  return (
    <div className="rounded-[26px] border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">{title}</div>
        <div className="rounded-full border border-gray-200 bg-[#fffdf8] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-gray-500">
          {basis}
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-[18px] border border-gray-200 bg-[#fffdf8] px-3 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-gray-400">{item.label}</div>
            <div className="mt-1 text-sm leading-6 text-gray-700">{item.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-[20px] border border-[#ece5d7] bg-[#f6f1e7] px-4 py-3">
        <div className="text-xs uppercase tracking-[0.18em] text-gray-500">Read</div>
        <div className="mt-1 text-sm leading-6 text-gray-900">{read}</div>
      </div>
    </div>
  );
}

function BuildingDefectsCard({
  defects,
}: {
  defects: ReturnType<typeof getPropertyReportData>["building"]["defects"];
}) {
  return (
    <div className="rounded-[26px] border border-amber-200 bg-amber-50/60 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.24em] text-amber-800/70">Defects & maintenance</div>
        <div className="rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-amber-900">
          {defects.basis}
        </div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-3">
          {defects.known.map((item, index) => (
            <div key={item} className="rounded-[18px] border border-amber-200 bg-white/80 px-3 py-3">
              <div className="text-xs uppercase tracking-[0.18em] text-amber-800/70">Known issue {index + 1}</div>
              <div className="mt-1 text-sm leading-6 text-amber-950">{item}</div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <PlanningSummaryChip label="Maintenance pressure" value={defects.maintenancePressure} />
          <PlanningSummaryChip label="Report status" value={defects.reportStatus} />
          <PlanningSummaryChip label="Verification status" value={defects.verificationStatus} />
          <PlanningSummaryChip label="Short-term spend" value={defects.spendOutlook} />
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {defects.checks.map((item, index) => (
          <div key={item} className="rounded-[18px] border border-white/80 bg-white/70 px-3 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-amber-800/70">Check {index + 1}</div>
            <div className="mt-1 text-sm leading-6 text-amber-950">{item}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanningIconChip({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-gray-400">
        <span>{icon}</span>
        <span className="text-[11px] uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="mt-2 text-sm font-medium leading-6 text-gray-900">{value}</div>
    </div>
  );
}

function getPlanningControlIcon(label: string) {
  switch (label) {
    case "Zone":
      return <Layers3 className="h-3.5 w-3.5" />;
    case "Land use":
      return <Home className="h-3.5 w-3.5" />;
    case "Council":
      return <Building2 className="h-3.5 w-3.5" />;
    case "Max height":
      return <ArrowUpRight className="h-3.5 w-3.5" />;
    case "FSR":
    case "Minimum lot size":
    case "Setbacks":
      return <Ruler className="h-3.5 w-3.5" />;
    case "Easement":
    case "Overlays":
    case "Flood risk":
    case "Heritage":
      return <ShieldAlert className="h-3.5 w-3.5" />;
    default:
      return <Info className="h-3.5 w-3.5" />;
  }
}

function getSubdivisionToneClasses(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("unlikely")) {
    return "border-rose-200 bg-rose-50 text-rose-900";
  }

  if (normalized.includes("possible")) {
    return "border-amber-200 bg-amber-50 text-amber-950";
  }

  if (normalized.includes("yes") || normalized.includes("likely")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  return "border-gray-200 bg-[#fffdf8] text-gray-950";
}

const MARKET_TREND_CHART_CONFIG = {
  medianPrice: {
    label: "Median price",
    color: "#171614",
  },
  medianRent: {
    label: "Median rent",
    color: "#355B4C",
  },
} as const;

const SUPPLY_DEMAND_CHART_CONFIG = {
  supply: {
    label: "Similar for sale",
    color: "#A855F7",
  },
  demand: {
    label: "Potential buyers",
    color: "#7E22CE",
  },
} as const;

const VACANCY_CHART_CONFIG = {
  rate: {
    label: "Vacancy rate",
    color: "#2563EB",
  },
} as const;

export function PropertyWorkspacePage({
  property,
  initialMessage,
}: PropertyWorkspacePageProps) {
  const reportData = useMemo(() => getPropertyReportData(property), [property]);
  const reportChecks = reportData.proceed.checklist;
  const [isSaved, setIsSaved] = useState(property.id === "4");
  const [messages, setMessages] = useState<WorkspaceMessage[]>(() => [
    buildInitialWorkspaceMessage(property, reportChecks),
  ]);
  const [input, setInput] = useState("");
  const [workspaceSessionId, setWorkspaceSessionId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [hasHydratedSession, setHasHydratedSession] = useState(false);
  const [currentStageKey, setCurrentStageKey] = useState<PropertyLifecycleStage>(
    "shortlisted",
  );
  const [selectedStageKey, setSelectedStageKey] = useState<PropertyLifecycleStage>(
    "shortlisted",
  );
  const bootstrappedInitialMessage = useRef(false);
  const timelineScrollRef = useRef<HTMLDivElement | null>(null);
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<EvidenceTabId>(() =>
    getDefaultEvidenceTab(reportData.workflow.lifecycleStage),
  );
  const workspaceSessionStorageKey = `${WORKSPACE_SESSION_STORAGE_PREFIX}${property.id}`;

  const concernPoints = useMemo(
    () => reportData.decision.concerns.slice(0, 3),
    [reportData],
  );
  const currentStageIndex = useMemo(
    () => WORKSPACE_STAGE_FLOW.findIndex((stage) => stage.key === currentStageKey),
    [currentStageKey],
  );
  const selectedStageIndex = useMemo(
    () => WORKSPACE_STAGE_FLOW.findIndex((stage) => stage.key === selectedStageKey),
    [selectedStageKey],
  );
  const selectedStageMeta = useMemo(
    () => getLifecycleStageMeta(selectedStageKey),
    [selectedStageKey],
  );
  const identityFacts = useMemo(
    () => [
      {
        label: `${property.bedrooms} bed`,
        icon: <BedDouble className="h-3.5 w-3.5" />,
      },
      {
        label: reportData.identity.bathrooms,
        icon: <Bath className="h-3.5 w-3.5" />,
      },
      {
        label: reportData.identity.parking,
        icon: <CarFront className="h-3.5 w-3.5" />,
      },
      {
        label: reportData.identity.landSize,
        icon: <Ruler className="h-3.5 w-3.5" />,
      },
    ],
    [property.bedrooms, reportData.identity.bathrooms, reportData.identity.landSize, reportData.identity.parking],
  );

  const evidenceModules = useMemo(
    () => ({
      overview: [
        reportData.modules.propertyFacts,
        reportData.modules.saleProcessTiming,
        reportData.modules.planningConstraints,
      ],
      property: [
        reportData.modules.propertyFacts,
        reportData.modules.conditionQuality,
        reportData.modules.defectsMaintenance,
      ],
      context: [
        reportData.modules.environmentLivability,
        reportData.modules.locationAmenity,
      ],
      planning: [
        reportData.modules.planningConstraints,
      ],
      documents: [
        reportData.modules.documentsInterpretation,
        reportData.modules.referenceProvenance,
      ],
    }),
    [reportData],
  );

  const handleSend = async (rawText?: string) => {
    const text = (rawText ?? input).trim();
    if (!text || isSending) return;

    const userMessage: WorkspaceMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: text,
      tone: "default",
    };
    const pendingMessageId = `${Date.now()}-assistant-pending`;
    const assistantMessage: WorkspaceMessage = {
      id: pendingMessageId,
      role: "assistant",
      content: "Thinking through this property...",
      tone: "loading",
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setIsSending(true);

    try {
      let activeSessionId = workspaceSessionId;

      if (!activeSessionId) {
        const session = await createSession(`Workspace: ${property.address}`);
        activeSessionId = session.session_id;
        setWorkspaceSessionId(activeSessionId);
        window.sessionStorage.setItem(workspaceSessionStorageKey, activeSessionId);
      }

      const interaction = await createInteraction(activeSessionId, text);
      const result = await waitForInteractionResult(interaction.interaction_id);
      const answer = buildWorkspaceApiAnswer(
        property,
        result.final_response ?? "Brick AI returned an empty response.",
      );

      setMessages((prev) =>
        prev.map((message) =>
          message.id === pendingMessageId
            ? {
                id: interaction.interaction_id,
                role: "assistant",
                content: answer.shortAnswer,
                answer,
                tone: "default",
              }
            : message,
        ),
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === pendingMessageId
            ? {
                ...message,
                content: buildWorkspaceErrorMessage(error),
                tone: "error",
              }
            : message,
        ),
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleWorkspacePrompt = (prompt: string) => {
    setInput(prompt);
    document.getElementById("property-chat")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    let isActive = true;

    const storedSessionId = window.sessionStorage.getItem(workspaceSessionStorageKey);
    if (!storedSessionId) {
      setHasHydratedSession(true);
      return () => {
        isActive = false;
      };
    }

    getSessionPath(storedSessionId)
      .then((response) => {
        if (!isActive) return;
        setWorkspaceSessionId(response.session.session_id);
        setMessages([
          buildInitialWorkspaceMessage(property, reportChecks),
          ...mapInteractionsToWorkspaceMessages(property, response.interactions),
        ]);
      })
      .catch(() => {
        window.sessionStorage.removeItem(workspaceSessionStorageKey);
      })
      .finally(() => {
        if (isActive) {
          setHasHydratedSession(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, [property, reportChecks, workspaceSessionStorageKey]);

  useEffect(() => {
    if (!hasHydratedSession || !initialMessage || bootstrappedInitialMessage.current) {
      return;
    }

    bootstrappedInitialMessage.current = true;
    void handleSend(initialMessage);
  }, [hasHydratedSession, initialMessage]);

  useEffect(() => {
    const currentStage =
      WORKSPACE_STAGE_FLOW.find(
        (stage) => stage.label === reportData.workflow.lifecycleStage,
      )?.key ?? "shortlisted";
    setCurrentStageKey(currentStage);
    setSelectedStageKey(currentStage);
  }, [reportData.workflow.lifecycleStage]);

  useEffect(() => {
    const currentStageLabel =
      WORKSPACE_STAGE_FLOW.find((stage) => stage.key === currentStageKey)?.label ??
      "Shortlisted";
    setActiveEvidenceTab(getDefaultEvidenceTab(currentStageLabel));
  }, [currentStageKey]);

  const scrollTimeline = (direction: "left" | "right") => {
    timelineScrollRef.current?.scrollBy({
      left: direction === "left" ? -260 : 260,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const stageButton = timelineScrollRef.current?.querySelector<HTMLButtonElement>(
      `[data-stage-key="${selectedStageKey}"]`,
    );

    stageButton?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selectedStageKey]);

  return (
    <div className="relative z-10 min-h-screen">
      <header className="px-4 py-5 md:px-7">
        <AppNavigator
          rightSlot={
            <div className="hidden rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.2em] text-gray-500 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.28)] backdrop-blur-xl sm:inline-flex">
              Workspace + report
            </div>
          }
        />
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-12 md:px-7 md:pb-16">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Button
            asChild
            variant="outline"
            className="rounded-full border-gray-300 bg-white/80 text-gray-900 hover:bg-white"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
        </div>

        <section className="overflow-hidden rounded-[34px] border border-white/80 bg-white/82 shadow-[0_20px_70px_-34px_rgba(15,23,42,0.2)] backdrop-blur-xl">
          <div className="grid gap-0 lg:grid-cols-[minmax(320px,0.92fr)_minmax(0,1.08fr)]">
            <div className="relative aspect-square min-h-[320px]">
              <img
                src={property.overviewImageUrl}
                alt={`Overview of ${property.address}, ${property.suburb}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/62 via-black/18 to-black/8" />
              <div className="absolute left-6 right-6 top-6 flex items-start justify-between gap-3">
                <Badge className="rounded-full border border-white/20 bg-white/14 px-3 py-1.5 text-white backdrop-blur-md hover:bg-white/14">
                  {reportData.workflow.reportStatus}
                </Badge>
                <div
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium backdrop-blur-md ${VERDICT_STYLES[property.verdictTone].score}`}
                >
                  {property.aiScore.toFixed(1)}
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-3xl tracking-tight text-white md:text-4xl">
                  {property.address}
                </h1>
                <p className="mt-1 text-sm text-white/72 md:text-base">
                  {property.suburb}
                </p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="text-[11px] uppercase tracking-[0.28em] text-gray-400">
                Property identity
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
                  {property.price}
                </span>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
                  {property.propertyType}
                </span>
                {identityFacts.map((fact) => (
                  <IdentityFactChip key={fact.label} icon={fact.icon} label={fact.label} />
                ))}
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500">
                  {reportData.identity.updatedAt}
                </span>
              </div>

              <article id="purchase" className="mt-6 rounded-[28px] border border-gray-200 bg-[#fffdf8] p-5 md:p-6">
                <div className="text-[11px] uppercase tracking-[0.28em] text-gray-400">
                  Decision
                </div>
                <div className="mt-3 inline-flex rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800">
                  {getSimpleDecisionLabel(property.verdictTone)}
                </div>
                <p className="mt-4 text-base leading-7 text-gray-800 md:text-lg">
                  {property.reason}
                </p>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-[22px] border border-gray-200 bg-white p-4">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                      Highlights
                    </div>
                    <div className="mt-3 space-y-2">
                      {reportData.decision.highlights.slice(0, 2).map((item) => (
                        <p key={item} className="text-sm leading-6 text-gray-700">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[22px] border border-amber-200 bg-amber-50/80 p-4">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-amber-800/70">
                      Concerns
                    </div>
                    <div className="mt-3 space-y-2">
                      {concernPoints.slice(0, 2).map((item) => (
                        <p key={item} className="text-sm leading-6 text-amber-950">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {reportData.workflow.reportStatus === "Report not purchased" ? (
                    <Button
                      asChild
                      className="rounded-full bg-gray-950 text-white hover:bg-gray-800"
                    >
                      <Link href="#report-summary">
                        Full access
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSaved((value) => !value)}
                    className="rounded-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                    {isSaved ? "Watched" : "Watch"}
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    <Link href="#property-chat">
                      Chat
                      <MessageCircle className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="mt-6 grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0 space-y-6">
            <article className="w-full min-w-0 max-w-full overflow-hidden rounded-[34px] border border-white/80 bg-white/82 p-6 shadow-[0_20px_70px_-34px_rgba(15,23,42,0.2)] backdrop-blur-xl md:p-8">
              <div className="min-w-0 max-w-full">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-gray-400">
                    Current stage
                  </div>
                  <div className="hidden items-center gap-2 md:flex">
                    <button
                      type="button"
                      onClick={() => scrollTimeline("left")}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-gray-300 hover:text-gray-950"
                      aria-label="Scroll stages left"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollTimeline("right")}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-gray-300 hover:text-gray-950"
                      aria-label="Scroll stages right"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div
                  ref={timelineScrollRef}
                  className="mt-4 w-full max-w-full overflow-x-auto pb-2"
                >
                  <div className="flex min-w-max items-center gap-2">
                    {WORKSPACE_STAGE_FLOW.map((stage, index) => {
                      const isCurrent = index === currentStageIndex;
                      const isComplete = index < currentStageIndex;
                      const isSelected = index === selectedStageIndex;

                      return (
                        <div key={stage.key} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedStageKey(stage.key)}
                            data-stage-key={stage.key}
                            className={`flex items-center gap-3 rounded-full border px-3 py-2 transition ${
                              isSelected
                                ? "border-gray-950 bg-gray-950 text-white"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                isCurrent || isComplete ? "bg-emerald-500" : "bg-gray-300"
                              }`}
                            />
                            <span
                              className={`text-sm ${
                                isSelected
                                  ? "font-medium text-white"
                                  : isCurrent
                                    ? "font-medium text-gray-950"
                                    : "text-gray-600"
                              }`}
                            >
                              {stage.label}
                            </span>
                          </button>
                          {index < WORKSPACE_STAGE_FLOW.length - 1 ? (
                            <div className="h-px w-8 bg-gray-300" />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[26px] border border-gray-200 bg-[#fffdf8] p-5">
                <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                  Action
                </div>
                <div className="mt-3 text-xl font-medium tracking-tight text-gray-950">
                  {selectedStageMeta.primaryCtaLabel}
                </div>
                  <p className="mt-3 text-sm leading-6 text-gray-700">
                    {selectedStageMeta.proceedSummary}
                  </p>
                <div className="mt-4 space-y-2">
                  {selectedStageMeta.checklist.slice(0, 2).map((check) => (
                    <div
                      key={check}
                      className="rounded-[18px] border border-gray-200 bg-white px-3 py-3 text-sm leading-6 text-gray-700"
                    >
                      {check}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    asChild
                    className="rounded-full bg-gray-950 text-white hover:bg-gray-800"
                  >
                    <Link href="#report-summary">
                      {selectedStageMeta.primaryCtaLabel}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStageKey(selectedStageKey)}
                    className="rounded-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    {selectedStageIndex === currentStageIndex ? "Current stage" : "Move to this stage"}
                  </Button>
                </div>
              </div>
            </article>

            <article
              id="report-summary"
              className="w-full min-w-0 max-w-full overflow-hidden rounded-[34px] border border-white/80 bg-white/82 p-6 shadow-[0_20px_70px_-34px_rgba(15,23,42,0.2)] backdrop-blur-xl md:p-8"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-gray-400">
                    Evidence hub
                  </div>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {EVIDENCE_TABS.map((tab) => {
                  const isActive = activeEvidenceTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveEvidenceTab(tab.id)}
                      className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "border-gray-950 bg-gray-950 text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              {activeEvidenceTab === "overview" ? (
                <div className="mt-5 space-y-5">
                  <div className="grid gap-3 md:grid-cols-3">
                    <EvidenceSummaryCard
                      label="Current focus"
                      value={reportData.workflow.proceedSummary}
                    />
                    <EvidenceSummaryCard
                      label="Strongest supporting signal"
                      value={reportData.decision.highlights[0] ?? property.reason}
                    />
                    <EvidenceSummaryCard
                      label="Main unknown to clear"
                      value={reportData.proceed.checklist[0] ?? reportData.decision.biggestRisk}
                      tone="caution"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[26px] border border-gray-200 bg-white p-5">
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.28em] text-gray-400">
                            Highlights
                          </div>
                          <p className="mt-1 text-sm leading-6 text-gray-600">
                            The strongest reasons this property still makes sense.
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 space-y-3">
                        {reportData.decision.highlights.slice(0, 3).map((insight) => (
                          <div
                            key={insight}
                            className="rounded-[22px] border border-gray-200 bg-[#fffdf8] p-4 text-sm leading-6 text-gray-700"
                          >
                            {insight}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[26px] border border-amber-200 bg-amber-50/60 p-5">
                      <div className="flex items-center gap-3">
                        <ShieldAlert className="h-5 w-5 text-amber-700/80" />
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.28em] text-amber-800/70">
                            Concerns
                          </div>
                          <p className="mt-1 text-sm leading-6 text-amber-900/80">
                            The issues that could still change your conviction.
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 space-y-3">
                        {concernPoints.map((concern) => (
                          <div
                            key={concern}
                            className="rounded-[22px] border border-amber-200 bg-white/60 p-4 text-sm leading-6 text-amber-950"
                          >
                            {concern}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {evidenceModules.overview.map((module) => (
                      <StructuredModuleCard key={module.id} module={module} />
                    ))}
                  </div>
                </div>
              ) : null}

              {activeEvidenceTab === "visual" ? (
                <div className="mt-5 space-y-5">
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                    <VisualImageCard
                      title="Aerial context"
                      caption="This stays first because it shows how the property sits in the real world before listing styling starts to shape the story."
                      imageUrl={property.overviewImageUrl}
                    />
                    <VisualMapCard property={property} reportData={reportData} />
                  </div>
                  <div className="rounded-[26px] border border-gray-200 bg-white p-4">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                      Listing details
                    </div>
                    <p className="mt-2 text-sm leading-6 text-gray-700">
                      Listing imagery still matters, but it sits behind context. Use it to inspect finish, layout feel, and exterior cues after you understand the property&apos;s position.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <VisualImageCard
                        title="Exterior detail"
                        caption="Facade and street-level read."
                        imageUrl={property.imageUrl}
                        imageClassName="object-left"
                      />
                      <VisualImageCard
                        title="Listing hero"
                        caption="Primary marketing shot."
                        imageUrl={property.imageUrl}
                      />
                      <VisualImageCard
                        title="Close detail"
                        caption="Secondary angle for finish cues."
                        imageUrl={property.imageUrl}
                        imageClassName="object-right"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {activeEvidenceTab === "property" ? (
                <div className="mt-5 space-y-5">
                  <div className="grid gap-3 lg:grid-cols-2">
                    <BuildingVerdictCard
                      label="Building strength"
                      value={reportData.building.strength}
                      cues={reportData.building.strengthCues}
                    />
                    <BuildingVerdictCard
                      label="Main building risk"
                      value={reportData.building.mainRisk}
                      cues={reportData.building.riskCues}
                      tone="caution"
                    />
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                    <BuildingFactsCard
                      title="Building facts"
                      facts={reportData.building.facts}
                    />
                    <BuildingFeaturesCard features={reportData.building.features} />
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <BuildingObservationCard
                      title="Layout & liveability"
                      basis={reportData.building.layout.basis}
                      items={reportData.building.layout.items}
                      read={reportData.building.layout.read}
                    />
                    <BuildingObservationCard
                      title="Condition & finish"
                      basis={reportData.building.condition.basis}
                      items={reportData.building.condition.items}
                      read={reportData.building.condition.read}
                    />
                  </div>

                  <BuildingDefectsCard defects={reportData.building.defects} />
                </div>
              ) : null}

              {activeEvidenceTab === "context" ? (
                <div className="mt-5 space-y-5">
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                    <LocationMapCard property={property} reportData={reportData} />
                    <div className="grid gap-3 content-start">
                      <div className="rounded-[26px] border border-gray-200 bg-white p-5">
                        <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                          Best local strength
                        </div>
                        <p className="mt-3 text-base leading-7 text-gray-900">
                          {reportData.location.bestLocalStrength}
                        </p>
                      </div>
                      <div className="rounded-[26px] border border-amber-200 bg-amber-50/70 p-5">
                        <div className="text-[11px] uppercase tracking-[0.24em] text-amber-800/70">
                          Main tradeoff
                        </div>
                        <p className="mt-3 text-base leading-7 text-amber-950">
                          {reportData.location.biggestLocalTradeoff}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-gray-200 bg-white p-5">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                      Daily access
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                      {reportData.location.dailyLife
                        .filter((item) =>
                          ["Bus", "Train", "Metro", "Parks", "Retail street", "Shopping mall"].includes(item.label),
                        )
                        .map((item) => (
                          <PlanningSummaryChip key={item.label} label={item.label} value={item.value} />
                        ))}
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="rounded-[26px] border border-gray-200 bg-white p-5">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                        Schools
                      </div>
                      <div className="mt-4 space-y-3">
                        {reportData.location.schools.map((school) => (
                          <div key={school.name} className="rounded-[22px] border border-gray-200 bg-[#fffdf8] p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-medium leading-6 text-gray-950">{school.name}</div>
                                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-400">
                                  {school.distance}
                                </div>
                              </div>
                              <div className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
                                {school.ranking}
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleWorkspacePrompt("How good are the nearby schools for this property?")}
                          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:text-gray-950"
                        >
                          Ask Brick AI
                          <MessageCircle className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[26px] border border-gray-200 bg-white p-5">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                        Safety
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <PlanningSummaryChip label="Crime rate" value={reportData.location.safety.crimeRate} />
                        <PlanningSummaryChip label="After dark" value={reportData.location.safety.dayNightFeel} />
                        <PlanningSummaryChip label="Emergency access" value={reportData.location.safety.emergencyAccess} />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="rounded-[26px] border border-gray-200 bg-white p-5">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                        Street feel
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {reportData.location.streetFeel.map((item) => (
                          <div key={item.label} className="rounded-[18px] border border-gray-200 bg-[#fffdf8] px-3 py-3">
                            <div className="text-xs uppercase tracking-[0.18em] text-gray-400">{item.label}</div>
                            <div className="mt-1 text-sm leading-6 text-gray-700">{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[26px] border border-gray-200 bg-white p-5">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                        Local hazards
                      </div>
                      <div className="mt-4 space-y-3">
                        {reportData.location.localHazards.map((item) => (
                          <div key={item.label} className="rounded-[18px] border border-amber-200 bg-amber-50/60 px-3 py-3">
                            <div className="text-xs uppercase tracking-[0.18em] text-amber-800/70">{item.label}</div>
                            <div className="mt-1 text-sm leading-6 text-amber-950">{item.value}</div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleWorkspacePrompt("What are the main local risks around flood, bushfire, and daily livability here?")}
                          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:text-gray-950"
                        >
                          Ask Brick AI
                          <MessageCircle className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeEvidenceTab === "planning" ? (
                <div className="mt-5 space-y-5">
                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.95fr)]">
                    <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white">
                      <div className="relative aspect-[16/11] overflow-hidden bg-[#f3efe8]">
                        <div className="absolute inset-0 bg-[#f7f5f1]" />
                        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,0.65)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.65)_1px,transparent_1px)] bg-[size:64px_64px]" />
                        <div className="absolute -left-[6%] top-[18%] h-[13%] w-[40%] rotate-[121deg] bg-white/95 shadow-[0_0_0_1px_rgba(209,213,219,0.34)]" />
                        <div className="absolute left-[8%] top-[67%] h-[12%] w-[54%] rotate-[28deg] bg-white/95 shadow-[0_0_0_1px_rgba(209,213,219,0.34)]" />
                        <div className="absolute left-[52%] top-[-7%] h-[16%] w-[44%] rotate-[31deg] bg-white/92 shadow-[0_0_0_1px_rgba(209,213,219,0.28)]" />
                        <div className="absolute right-[-8%] top-[24%] h-[48%] w-[18%] rotate-[62deg] bg-white/92 shadow-[0_0_0_1px_rgba(209,213,219,0.28)]" />
                        <div className="absolute left-[9%] top-[12%] h-[18%] w-[12%] rotate-[34deg] rounded-[8px] bg-[#e5e7eb]" />
                        <div className="absolute left-[54%] top-[18%] h-[24%] w-[16%] rotate-[28deg] rounded-[10px] bg-[#e5e7eb]" />
                        <div className="absolute left-[34%] top-[52%] h-[28%] w-[20%] rotate-[25deg] rounded-[10px] bg-[#e5e7eb]" />
                        <div className="absolute right-[8%] top-[8%] h-[22%] w-[18%] rotate-[26deg] rounded-[10px] bg-[#e5e7eb]" />
                        <div className="absolute left-[73%] top-[52%] h-[20%] w-[16%] rotate-[22deg] rounded-[10px] bg-[#e5e7eb]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/28 via-transparent to-white/18" />
                        <div className="absolute left-[24%] top-[16%] h-[48%] w-[46%] rotate-[34deg] rounded-[28px] border-[3px] border-[#5f12d5] bg-[#8b5cf6]/18 shadow-[0_0_0_999px_rgba(255,255,255,0.12)]" />
                        <div className="absolute left-[42%] top-[39%] h-[23%] w-[17%] rotate-[34deg] rounded-[10px] bg-[#6d28d9]/34" />
                        <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                          <span className="rounded-full border border-[#5f12d5]/18 bg-white/92 px-3 py-1.5 text-xs font-medium text-[#4c1d95] shadow-sm">
                            {reportData.planning.site.landArea}
                          </span>
                          <span className="rounded-full border border-white/70 bg-white/92 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
                            {reportData.planning.controls[0]?.value ?? "-"}
                          </span>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 px-5 py-4 md:px-6">
                        <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                          Property boundary & land potential
                        </div>
                        <p className="mt-2 text-sm leading-6 text-gray-700">
                          {reportData.planning.landPotentialSummary}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-gray-200 bg-white p-5 md:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                            Land summary
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleWorkspacePrompt("Explain the land and planning outlook for this property.")}
                          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:text-gray-950"
                        >
                          Ask Brick AI
                          <MessageCircle className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <PlanningIconChip
                          icon={<Trees className="h-3.5 w-3.5" />}
                          label="Land value"
                          value={reportData.planning.landValueEstimate}
                        />
                        <PlanningIconChip
                          icon={<Ruler className="h-3.5 w-3.5" />}
                          label="Subdivision"
                          value={reportData.planning.subdivisionPotential}
                        />
                        <PlanningIconChip
                          icon={<Layers3 className="h-3.5 w-3.5" />}
                          label="Zone"
                          value={reportData.planning.controls[0]?.value ?? "-"}
                        />
                        <PlanningIconChip
                          icon={<Home className="h-3.5 w-3.5" />}
                          label="Land use"
                          value={reportData.planning.controls[1]?.value ?? "-"}
                        />
                        <PlanningIconChip
                          icon={<Building2 className="h-3.5 w-3.5" />}
                          label="Council"
                          value={reportData.planning.controls[2]?.value ?? "-"}
                        />
                        <PlanningIconChip
                          icon={<ArrowUpRight className="h-3.5 w-3.5" />}
                          label="Max height"
                          value={reportData.planning.controls[3]?.value ?? "-"}
                        />
                      </div>
                      <div className="mt-5 border-t border-gray-200 pt-5">
                        <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                          Site traits
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <PlanningIconChip icon={<Layers3 className="h-3.5 w-3.5" />} label="Shape" value={reportData.planning.site.shape} />
                          <PlanningIconChip icon={<Home className="h-3.5 w-3.5" />} label="Corner lot" value={reportData.planning.site.cornerLot} />
                          <PlanningIconChip icon={<ArrowUpRight className="h-3.5 w-3.5" />} label="Slope" value={reportData.planning.site.slopeElevation} />
                          <PlanningIconChip icon={<ShieldAlert className="h-3.5 w-3.5" />} label="Easement" value={reportData.planning.site.easementImpact} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
                    <div>
                      <div className="rounded-[26px] border border-gray-200 bg-white p-5 md:p-6">
                        <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                          Subdivision
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <div className={`rounded-full border px-4 py-1.5 text-sm font-medium ${getSubdivisionToneClasses(reportData.planning.subdivisionPotential)}`}>
                            {reportData.planning.subdivisionPotential}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleWorkspacePrompt("Can this property be subdivided and what could block it?")}
                            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:text-gray-950"
                          >
                            Ask Brick AI
                            <MessageCircle className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-gray-700">
                          {reportData.planning.subdivision.summary}
                        </p>
                        <p className="mt-3 text-xs leading-5 text-gray-500">
                          AI estimate only. This is directional support, not a planner or council guarantee.
                        </p>
                        <div className="mt-4 space-y-3">
                          {reportData.planning.subdivision.evidence.map((item) => (
                            <div
                              key={item}
                              className="rounded-[18px] border border-amber-200 bg-amber-50/60 px-3 py-3 text-sm leading-6 text-amber-950"
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[26px] border border-gray-200 bg-white p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                            Land & planning rules
                          </div>
                          <p className="mt-2 text-sm leading-6 text-gray-600">
                            Evidence behind the land score and subdivision stance.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleWorkspacePrompt("Explain the planning rules and what they mean for this property.")}
                          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:text-gray-950"
                        >
                          Ask Brick AI
                          <MessageCircle className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {reportData.planning.controls
                          .filter((control) =>
                            ["FSR", "Minimum lot size", "Setbacks", "Easement"].includes(control.label),
                          )
                          .map((control) => (
                          <div
                            key={control.label}
                            className="rounded-[20px] border border-gray-200 bg-[#fffdf8] p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2 text-gray-500">
                                <span>{getPlanningControlIcon(control.label)}</span>
                                <div className="text-[11px] uppercase tracking-[0.22em] text-gray-400">
                                  {control.label}
                                </div>
                              </div>
                              <button
                                type="button"
                                title={control.explainer}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:text-gray-900"
                                aria-label={`Explain ${control.label}`}
                              >
                                <Info className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="mt-3 text-sm font-medium leading-6 text-gray-900">
                              {control.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeEvidenceTab === "financial" ? (
                <div className="mt-5 space-y-5">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[24px] border border-gray-200 bg-white p-5">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                        Guide price
                      </div>
                      <div className="mt-3 text-2xl font-medium tracking-tight text-gray-950">
                        {reportData.financial.guidePrice}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        Seller-facing guide. Use it as context, not your final price discipline.
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-gray-200 bg-white p-5">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                        Estimated price range
                      </div>
                      <div className="mt-3 text-2xl font-medium tracking-tight text-gray-950">
                        {reportData.financial.estimatedPrice.display}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        Mid-point {reportData.financial.estimatedPrice.mid >= 1000
                          ? `$${(reportData.financial.estimatedPrice.mid / 1000).toFixed(2)}m`
                          : `$${reportData.financial.estimatedPrice.mid.toLocaleString()}k`}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        {reportData.financial.estimatedPrice.confidenceLabel} from {reportData.financial.estimatedPrice.comparableSalesCount} similar sales
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-gray-200 bg-white p-5">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                        Estimated rent
                      </div>
                      <div className="mt-3 text-2xl font-medium tracking-tight text-gray-950">
                        {reportData.financial.estimatedRent.display}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        Grounded in {reportData.financial.estimatedRent.listingsCount} comparable rental listings.
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-gray-200 bg-white p-5">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                        Estimated rental yield
                      </div>
                      <div className="mt-3 text-2xl font-medium tracking-tight text-gray-950">
                        {reportData.financial.estimatedRentalYield}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        Useful as support only. Yield should not outrank liveability, risk, or fit.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="rounded-[26px] border border-gray-200 bg-white p-5">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                        Median price trend
                      </div>
                      <div className="mt-2 text-2xl font-medium tracking-tight text-gray-950">
                        {reportData.financial.estimatedPrice.mid >= 1000
                          ? `$${(reportData.financial.estimatedPrice.mid / 1000).toFixed(2)}m`
                          : `$${reportData.financial.estimatedPrice.mid.toLocaleString()}k`}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        5-year view based on {reportData.financial.priceTrend.salesCount} similar sales
                      </p>
                      <p className="mt-2 text-sm leading-6 text-emerald-700">
                        Past 12 month growth: {reportData.financial.priceTrend.growthPct.toFixed(1)}%
                      </p>
                      <ChartContainer
                        className="mt-4 h-[240px] w-full"
                        config={MARKET_TREND_CHART_CONFIG}
                      >
                        <AreaChart data={reportData.financial.priceTrend.series} margin={{ left: 4, right: 4, top: 8 }}>
                          <CartesianGrid vertical={false} strokeDasharray="3 3" />
                          <XAxis
                            dataKey="period"
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                            tickFormatter={(value) => `$${value / 1000}m`}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                          />
                          <Area
                            dataKey="medianPrice"
                            type="monotone"
                            fill="var(--color-medianPrice)"
                            fillOpacity={0.12}
                            stroke="var(--color-medianPrice)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ChartContainer>
                    </div>

                    <div className="rounded-[26px] border border-gray-200 bg-white p-5">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                        Median rent trend
                      </div>
                      <div className="mt-2 text-2xl font-medium tracking-tight text-gray-950">
                        {reportData.financial.estimatedRent.display}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        5-year view based on {reportData.financial.rentTrend.listingsCount} similar rental listings
                      </p>
                      <p className="mt-2 text-sm leading-6 text-emerald-700">
                        Past 12 month growth: {reportData.financial.rentTrend.growthPct.toFixed(1)}%
                      </p>
                      <ChartContainer
                        className="mt-4 h-[240px] w-full"
                        config={MARKET_TREND_CHART_CONFIG}
                      >
                        <AreaChart data={reportData.financial.rentTrend.series} margin={{ left: 4, right: 4, top: 8 }}>
                          <CartesianGrid vertical={false} strokeDasharray="3 3" />
                          <XAxis
                            dataKey="period"
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                          />
                          <Area
                            dataKey="medianRent"
                            type="monotone"
                            fill="var(--color-medianRent)"
                            fillOpacity={0.12}
                            stroke="var(--color-medianRent)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ChartContainer>
                    </div>
                  </div>

                  <div className="grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <div className="rounded-[26px] border border-gray-200 bg-white p-5">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                        Vacancy history
                      </div>
                      <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
                        <div className="text-2xl font-medium tracking-tight text-gray-950">
                          {reportData.financial.vacancy.currentRate}
                        </div>
                        <div className="text-sm text-gray-500">
                          vs {reportData.financial.vacancy.benchmarkRate} suburb benchmark
                        </div>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        5-year view of how tight or loose the rental market has been locally.
                      </p>
                      <ChartContainer
                        className="mt-4 h-[220px] w-full"
                        config={VACANCY_CHART_CONFIG}
                      >
                        <LineChart data={reportData.financial.vacancy.series} margin={{ left: 4, right: 4, top: 8 }}>
                          <CartesianGrid vertical={false} strokeDasharray="3 3" />
                          <XAxis
                            dataKey="period"
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                          />
                          <Line
                            dataKey="rate"
                            type="monotone"
                            stroke="var(--color-rate)"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "var(--color-rate)" }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ChartContainer>
                    </div>

                    <div className="rounded-[26px] border border-gray-200 bg-white p-5">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                        Supply, demand and market pressure
                      </div>
                      <p className="mt-2 text-lg leading-7 text-gray-700">
                        In the past 12 months, {reportData.financial.priceTrend.salesCount} similar properties sold in this market, with a median of {reportData.financial.marketPressure.medianDaysOnMarket} days on market.
                      </p>
                      <ChartContainer
                        className="mt-4 h-[280px] w-full"
                        config={SUPPLY_DEMAND_CHART_CONFIG}
                      >
                        <LineChart data={reportData.financial.marketPressure.series} margin={{ left: 4, right: 4, top: 8 }}>
                          <CartesianGrid vertical={false} strokeDasharray="3 3" />
                          <XAxis
                            dataKey="period"
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                          />
                          <YAxis axisLine={false} tickLine={false} tickMargin={10} />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                          />
                          <Line
                            dataKey="supply"
                            type="monotone"
                            stroke="var(--color-supply)"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "var(--color-supply)" }}
                            activeDot={{ r: 5 }}
                          />
                          <Line
                            dataKey="demand"
                            type="monotone"
                            stroke="var(--color-demand)"
                            strokeDasharray="6 6"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "var(--color-demand)" }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ChartContainer>
                      <div className="mt-4 flex flex-wrap gap-5 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="h-0.5 w-6 bg-[var(--color-supply)]" />
                          Similar for sale
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-0.5 w-6 border-t-2 border-dashed border-[var(--color-demand)]" />
                          Potential buyers
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-rate)]" />
                          Vacancy {reportData.financial.vacancy.currentRate}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-gray-200 bg-white p-5">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                      Recent sold in the area
                    </div>
                    <p className="mt-2 text-lg leading-7 text-gray-700">
                      Recent comparable sales help anchor the estimate in real outcomes, not just market averages.
                    </p>
                    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {reportData.financial.recentSales.map((sale) => (
                        <RecentSaleCard key={sale.id} sale={sale} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {activeEvidenceTab === "documents" ? (
                <div className="mt-5 space-y-5">
                  <EvidenceSummaryCard
                    label="Current document posture"
                    value={reportData.modules.documentsInterpretation.summary}
                    tone="caution"
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    {evidenceModules.documents.map((module) => (
                      <StructuredModuleCard key={module.id} module={module} />
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          </div>

          <aside id="property-chat" className="2xl:sticky 2xl:top-6 2xl:self-start">
            <div className="rounded-[34px] border border-white/80 bg-white/88 p-6 shadow-[0_20px_70px_-34px_rgba(15,23,42,0.2)] backdrop-blur-xl md:p-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-gray-400">
                    Ask Brick AI
                  </div>
                  <div className="mt-2 text-lg font-medium tracking-tight text-gray-950">
                    Chat about this property
                  </div>
                </div>
                <Badge className="rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-gray-500 hover:bg-white/80">
                  {property.address}
                </Badge>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={isSending}
                    onClick={() => {
                      void handleSend(prompt);
                    }}
                    className="rounded-full border border-gray-200 bg-white/90 px-3 py-1.5 text-sm text-gray-700 transition hover:border-gray-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-[22px] border px-4 py-4 text-sm leading-6 ${
                      message.role === "user"
                        ? "border-gray-900 bg-gray-900 text-white"
                        : message.tone === "error"
                          ? "border-red-200 bg-red-50 text-red-800"
                          : "border-gray-200 bg-white text-gray-700"
                    }`}
                  >
                    {message.role === "assistant" && message.answer ? (
                      <div className="space-y-3">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                            Short answer
                          </div>
                          <p className="mt-1">{message.answer.shortAnswer}</p>
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                            What to check next
                          </div>
                          <ul className="mt-1 space-y-1">
                            {message.answer.nextChecks.slice(0, 2).map((check) => (
                              <li key={check}>{check}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <p className={message.tone === "loading" ? "animate-pulse" : ""}>
                        {message.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[26px] border border-gray-200 bg-white px-4 py-3 shadow-[0_14px_40px_-26px_rgba(22,2,17,0.15)]">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-4 w-4 text-gray-400" />
                  <input
                    value={input}
                    disabled={isSending}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !isSending) {
                        event.preventDefault();
                        void handleSend();
                      }
                    }}
                    placeholder="Ask about this property, this report, or what to do next"
                    className="h-12 w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-base"
                  />
                  <button
                    type="button"
                    disabled={isSending || !input.trim()}
                    onClick={() => {
                      void handleSend();
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-950 text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-300"
                    aria-label="Send workspace message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
