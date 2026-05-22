import type { ExploreProperty } from "@/src/data/property-feed";

export function getReportChecks(property: ExploreProperty) {
  if (property.verdictTone === "positive") {
    return [
      "Verify the building and strata history so the low-friction story is real.",
      "Check recent comparable sales to confirm the guide still feels disciplined.",
      "Review transport, street noise, and day-to-day livability against your actual routine.",
    ];
  }

  return [
    "Pressure-test the premium to make sure the emotional pull is not hiding a weak value case.",
    "Review comparable sales and time-on-market to see where conviction should rise or fall.",
    "Use suburb and street context to identify what still feels uncertain before you go further.",
  ];
}

export function getBiggestCaution(property: ExploreProperty) {
  if (property.verdictTone === "positive") {
    return "The overall fit looks strong, but the report still needs a reality check on hidden friction and pricing discipline.";
  }

  return "This property has real upside, but the current signal is not strong enough to skip a more careful value and risk review.";
}
