export interface DateNormalizationResult {
  isoDate?: string; // YYYY-MM-DD
  isValid: boolean;
  isAmbiguous?: boolean;
  errorMessage?: string;
}

const DAYS_OF_WEEK: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

const MONTHS: Record<string, number> = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sep: 9,
  sept: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
};

/**
 * Normalizes raw date expressions into canonical ISO YYYY-MM-DD.
 * @param raw - The natural language date or ISO date string
 * @param refDate - Reference anchor date (defaults to current date or 2026-09-10)
 */
export function normalizeDate(
  raw: unknown,
  refDate?: Date | string
): DateNormalizationResult {
  if (raw === undefined || raw === null || raw === "") {
    return {
      isValid: false,
      errorMessage: "Departure date is missing",
    };
  }

  const baseDate = refDate
    ? (typeof refDate === "string" ? new Date(`${refDate}T00:00:00Z`) : new Date(refDate))
    : new Date();

  // Reset to midnight UTC
  const ref = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate()));

  const str = String(raw).trim().toLowerCase();

  // 1. Direct ISO match: YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const year = parseInt(y, 10);
    const month = parseInt(m, 10);
    const day = parseInt(d, 10);
    if (isValidCalendarDate(year, month, day)) {
      return { isValid: true, isoDate: `${y}-${m}-${d}` };
    }
    return { isValid: false, errorMessage: `Invalid calendar date '${str}'` };
  }

  // 2. Relative keywords
  if (str === "today") {
    return { isValid: true, isoDate: formatDate(ref) };
  }

  if (str === "tomorrow") {
    const target = addDays(ref, 1);
    return { isValid: true, isoDate: formatDate(target) };
  }

  if (str === "day after tomorrow") {
    const target = addDays(ref, 2);
    return { isValid: true, isoDate: formatDate(target) };
  }

  // 3. Day of week expressions: "next saturday", "this friday", "next week friday", "friday next week"
  for (const [dayName, dayIndex] of Object.entries(DAYS_OF_WEEK)) {
    // "friday next week" or "next week friday"
    if (str.includes("next week") && str.includes(dayName)) {
      const currentDay = ref.getUTCDay();
      let daysUntil = (dayIndex - currentDay + 7) % 7;
      if (daysUntil === 0) daysUntil = 7;
      daysUntil += 7; // advance by full next week
      const target = addDays(ref, daysUntil);
      return { isValid: true, isoDate: formatDate(target) };
    }

    // "next <day>" (e.g. "next saturday")
    if (new RegExp(`\\bnext\\s+${dayName}\\b`, "i").test(str)) {
      const currentDay = ref.getUTCDay();
      let daysUntil = (dayIndex - currentDay + 7) % 7;
      if (daysUntil === 0) daysUntil = 7; // If today is saturday, "next saturday" is 7 days ahead
      const target = addDays(ref, daysUntil);
      return { isValid: true, isoDate: formatDate(target) };
    }

    // "this <day>" or simply "<day>" (e.g. "saturday", "this saturday")
    if (new RegExp(`\\b(this\\s+)?${dayName}\\b`, "i").test(str)) {
      const currentDay = ref.getUTCDay();
      let daysUntil = (dayIndex - currentDay + 7) % 7;
      if (daysUntil === 0) daysUntil = 7; // default to upcoming
      const target = addDays(ref, daysUntil);
      return { isValid: true, isoDate: formatDate(target) };
    }
  }

  // 4. "18th September" or "18 September 2026" or "September 18"
  for (const [monthName, monthNum] of Object.entries(MONTHS)) {
    // Format: "18th september" or "18 september" or "18 september 2026"
    const regex1 = new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?\\s+${monthName}(?:\\s+(\\d{4}))?`, "i");
    const m1 = str.match(regex1);
    if (m1) {
      const day = parseInt(m1[1], 10);
      const year = m1[2] ? parseInt(m1[2], 10) : ref.getUTCFullYear();
      if (isValidCalendarDate(year, monthNum, day)) {
        return { isValid: true, isoDate: formatYMD(year, monthNum, day) };
      }
    }

    // Format: "september 18" or "september 18th 2026"
    const regex2 = new RegExp(`${monthName}\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+(\\d{4}))?`, "i");
    const m2 = str.match(regex2);
    if (m2) {
      const day = parseInt(m2[1], 10);
      const year = m2[2] ? parseInt(m2[2], 10) : ref.getUTCFullYear();
      if (isValidCalendarDate(year, monthNum, day)) {
        return { isValid: true, isoDate: formatYMD(year, monthNum, day) };
      }
    }
  }

  // Ambiguous vague dates: e.g. "next week", "sometime soon", "in a few weeks", "next month"
  if (/(next week|sometime|in a few days|next month|later)/i.test(str)) {
    return {
      isValid: false,
      isAmbiguous: true,
      errorMessage: `The date '${raw}' is ambiguous. Please specify a specific day or date.`,
    };
  }

  return {
    isValid: false,
    errorMessage: `Unable to understand departure date '${raw}'`,
  };
}

/**
 * Calculates D-1 and D+1 dates in ISO format.
 */
export function getAdjacentDates(isoDate: string): { previousDay: string; nextDay: string } {
  const d = new Date(`${isoDate}T00:00:00Z`);
  const prev = addDays(d, -1);
  const next = addDays(d, 1);
  return {
    previousDay: formatDate(prev),
    nextDay: formatDate(next),
  };
}

function addDays(d: Date, days: number): Date {
  const res = new Date(d.getTime());
  res.setUTCDate(res.getUTCDate() + days);
  return res;
}

function formatDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatYMD(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function isValidCalendarDate(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const test = new Date(Date.UTC(y, m - 1, d));
  return test.getUTCFullYear() === y && test.getUTCMonth() === m - 1 && test.getUTCDate() === d;
}
