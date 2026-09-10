import { CabinClass } from "../types/flight";

export interface CabinNormalizationResult {
  cabinClass?: CabinClass;
  isValid: boolean;
  errorMessage?: string;
}

const CABIN_PATTERNS: Array<{ pattern: RegExp; cabin: CabinClass }> = [
  { pattern: /\b(first|first\s*class|suite)\b/i, cabin: "first" },
  { pattern: /\b(premium\s*economy|prem\s*econ?|premium|comfort)\b/i, cabin: "premium_economy" },
  { pattern: /\b(business|biz\s*class|business\s*class|club|executive)\b/i, cabin: "business" },
  { pattern: /\b(economy|econ|coach|standard|main\s*cabin|tourist)\b/i, cabin: "economy" },
];

/**
 * Normalizes raw cabin class input into one of:
 * "economy" | "premium_economy" | "business" | "first"
 */
export function normalizeCabinClass(raw: unknown): CabinNormalizationResult {
  if (raw === undefined || raw === null || raw === "") {
    return {
      isValid: false,
      errorMessage: "Cabin class is missing",
    };
  }

  const str = String(raw).trim().toLowerCase();

  // Direct exact match
  if (str === "economy" || str === "premium_economy" || str === "business" || str === "first") {
    return {
      isValid: true,
      cabinClass: str as CabinClass,
    };
  }

  for (const { pattern, cabin } of CABIN_PATTERNS) {
    if (pattern.test(str)) {
      return {
        isValid: true,
        cabinClass: cabin,
      };
    }
  }

  return {
    isValid: false,
    errorMessage: `Unrecognized cabin class '${raw}'. Valid options are: economy, premium_economy, business, first.`,
  };
}
