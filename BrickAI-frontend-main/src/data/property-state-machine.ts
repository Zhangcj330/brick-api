export type PropertyLifecycleStage =
  | "shortlisted"
  | "reviewing_report"
  | "ready_for_inspection"
  | "needs_further_checks"
  | "preparing_offer"
  | "under_contract"
  | "pre_settlement"
  | "settled";

export type PropertyReportStatus = "unpurchased" | "purchased";
export type PropertyMarketStatus = "selling" | "sold";
export type PropertyStageTone = "positive" | "neutral" | "caution";

export type PropertyWorkflowState = {
  marketStatus: PropertyMarketStatus;
  lifecycleStage: PropertyLifecycleStage;
  reportStatus: PropertyReportStatus;
  updatedAt: string;
  actionSupport: string;
};

type LifecycleStageMeta = {
  label: string;
  tone: PropertyStageTone;
  nextActionLabel: string;
  primaryCtaLabel: string;
  proceedTitle: string;
  proceedSummary: string;
  checklist: string[];
};

const LIFECYCLE_STAGE_META: Record<PropertyLifecycleStage, LifecycleStageMeta> = {
  shortlisted: {
    label: "Shortlisted",
    tone: "neutral",
    nextActionLabel: "Full access",
    primaryCtaLabel: "Full access",
    proceedTitle: "What to do before you go deeper",
    proceedSummary:
      "You can already read a partial report here. Purchase unlocks the full workspace, deeper guidance, and the complete buyer workflow.",
    checklist: [
      "Confirm the guide price still fits your buying range.",
      "Use the partial report to decide whether this property deserves serious attention.",
      "Purchase full access before you rely on the full workflow and decision support.",
    ],
  },
  reviewing_report: {
    label: "Reviewing report",
    tone: "neutral",
    nextActionLabel: "Prep inspection",
    primaryCtaLabel: "Prep inspection",
    proceedTitle: "Turn the report into inspection prep",
    proceedSummary:
      "You have the report. Now the job is to turn that into a clear inspection plan and a sharper go / no-go view.",
    checklist: [
      "Read the summary decision and the biggest risk in full.",
      "Turn report concerns into questions to test in person.",
      "Decide whether this property is strong enough to inspect.",
    ],
  },
  ready_for_inspection: {
    label: "Ready for inspection",
    tone: "positive",
    nextActionLabel: "Inspected",
    primaryCtaLabel: "Inspected",
    proceedTitle: "Get ready to inspect in person",
    proceedSummary:
      "The next move is real-world validation. Use the report to test what still feels uncertain once you are on site.",
    checklist: [
      "Bring the top questions and red flags into the inspection.",
      "Record what changed your confidence after seeing the property in person.",
      "Decide whether the property should keep moving or needs more checks.",
    ],
  },
  needs_further_checks: {
    label: "Needs further checks",
    tone: "caution",
    nextActionLabel: "Upload docs",
    primaryCtaLabel: "Upload docs",
    proceedTitle: "Clear the open risks before you act",
    proceedSummary:
      "The property is still alive, but you do not have enough evidence yet. Move it forward by adding the missing legal and building context.",
    checklist: [
      "Upload the contract for interpretation.",
      "Upload the building report or strata documents if available.",
      "Resolve the unresolved risks before thinking about an offer.",
    ],
  },
  preparing_offer: {
    label: "Preparing offer",
    tone: "positive",
    nextActionLabel: "Prepare offer",
    primaryCtaLabel: "Prepare offer",
    proceedTitle: "Move from conviction into offer prep",
    proceedSummary:
      "This is now an action stage. The work is setting a disciplined offer plan and preparing for offer or auction tactics.",
    checklist: [
      "Set a walk-away price before emotions rise.",
      "Prepare your offer or auction plan.",
      "Make sure finance and solicitor support are ready before you act.",
    ],
  },
  under_contract: {
    label: "Under contract",
    tone: "neutral",
    nextActionLabel: "Contract tasks",
    primaryCtaLabel: "Contract tasks",
    proceedTitle: "Stay on top of the contract stage",
    proceedSummary:
      "The decision is no longer whether to buy. The work now is finance, legal follow-through, and clearing contract conditions.",
    checklist: [
      "Track finance approval and lender milestones.",
      "Coordinate with your solicitor or conveyancer.",
      "Monitor any special conditions or required follow-up checks.",
    ],
  },
  pre_settlement: {
    label: "Pre-settlement",
    tone: "neutral",
    nextActionLabel: "Settlement",
    primaryCtaLabel: "Settlement",
    proceedTitle: "Get ready for settlement",
    proceedSummary:
      "You are in the final execution stretch. Focus on final inspection, funds, and legal readiness so settlement is uneventful.",
    checklist: [
      "Book and prepare for the final inspection.",
      "Confirm funds, legal documents, and handover timing.",
      "Track the remaining tasks that must be cleared before settlement day.",
    ],
  },
  settled: {
    label: "Settled",
    tone: "positive",
    nextActionLabel: "Notes",
    primaryCtaLabel: "Notes",
    proceedTitle: "Close out the purchase cleanly",
    proceedSummary:
      "This property has reached the end of the buying flow. The remaining value is keeping the record and final notes tidy.",
    checklist: [
      "Archive the workspace with final notes.",
      "Keep key legal and finance records accessible.",
      "Capture anything worth remembering for the next purchase.",
    ],
  },
};

const PROPERTY_WORKFLOW_STATES: Record<string, PropertyWorkflowState> = {
  "1": {
    marketStatus: "selling",
    lifecycleStage: "preparing_offer",
    reportStatus: "purchased",
    updatedAt: "Updated 5h ago",
    actionSupport:
      "This property has cleared the main doubts. The next move is a disciplined offer plan, not more browsing.",
  },
  "2": {
    marketStatus: "selling",
    lifecycleStage: "reviewing_report",
    reportStatus: "purchased",
    updatedAt: "Updated yesterday",
    actionSupport:
      "The report is in hand, but it still needs to be turned into a sharp inspection plan before you commit more time.",
  },
  "3": {
    marketStatus: "selling",
    lifecycleStage: "needs_further_checks",
    reportStatus: "purchased",
    updatedAt: "Updated 3d ago",
    actionSupport:
      "Lifestyle fit is real here, but legal and building evidence still need to be attached before this becomes defendable.",
  },
  "4": {
    marketStatus: "selling",
    lifecycleStage: "ready_for_inspection",
    reportStatus: "purchased",
    updatedAt: "Updated 2h ago",
    actionSupport:
      "This one is ready to leave desk mode. Use the report to pressure-test the property in person.",
  },
  "5": {
    marketStatus: "sold",
    lifecycleStage: "pre_settlement",
    reportStatus: "purchased",
    updatedAt: "Settlement in 6 days",
    actionSupport:
      "This property is already past the market phase. The work now is legal, finance, and final inspection readiness.",
  },
  "6": {
    marketStatus: "selling",
    lifecycleStage: "shortlisted",
    reportStatus: "unpurchased",
    updatedAt: "Added today",
    actionSupport:
      "You can view a partial report now. Purchase full access when you want the full workflow, deeper guidance, and next-step support.",
  },
};

export function getLifecycleStageMeta(stage: PropertyLifecycleStage) {
  return LIFECYCLE_STAGE_META[stage];
}

export function getPropertyWorkflowState(propertyId: string) {
  return PROPERTY_WORKFLOW_STATES[propertyId];
}

export function getReportStatusLabel(status: PropertyReportStatus) {
  return status === "purchased" ? "Report purchased" : "Report not purchased";
}

export function getMarketStatusLabel(status: PropertyMarketStatus) {
  return status === "selling" ? "Selling" : "Sold";
}
