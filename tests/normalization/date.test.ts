import { describe, it, expect } from "vitest";
import { normalizeDate, getAdjacentDates } from "../../lib/normalization/date";

describe("Date Normalization", () => {
  // Reference date: Thursday, 10 September 2026
  const REF_DATE = "2026-09-10";

  it("normalizes direct ISO dates", () => {
    const res = normalizeDate("2026-09-12", REF_DATE);
    expect(res.isValid).toBe(true);
    expect(res.isoDate).toBe("2026-09-12");
  });

  it("normalizes 'tomorrow'", () => {
    const res = normalizeDate("tomorrow", REF_DATE);
    expect(res.isValid).toBe(true);
    expect(res.isoDate).toBe("2026-09-11");
  });

  it("normalizes 'next Saturday' from Thursday", () => {
    const res = normalizeDate("next Saturday", REF_DATE);
    expect(res.isValid).toBe(true);
    expect(res.isoDate).toBe("2026-09-12");
  });

  it("normalizes 'Friday next week'", () => {
    const res = normalizeDate("Friday next week", REF_DATE);
    expect(res.isValid).toBe(true);
    expect(res.isoDate).toBe("2026-09-18");
  });

  it("normalizes '18th September'", () => {
    const res = normalizeDate("18th September", REF_DATE);
    expect(res.isValid).toBe(true);
    expect(res.isoDate).toBe("2026-09-18");
  });

  it("flags ambiguous dates like 'next week'", () => {
    const res = normalizeDate("next week", REF_DATE);
    expect(res.isValid).toBe(false);
    expect(res.isAmbiguous).toBe(true);
  });

  it("calculates adjacent D-1 and D+1 dates correctly", () => {
    const adj = getAdjacentDates("2026-09-12");
    expect(adj.previousDay).toBe("2026-09-11");
    expect(adj.nextDay).toBe("2026-09-13");
  });

  it("calculates adjacent dates across month boundaries", () => {
    const adj = getAdjacentDates("2026-10-01");
    expect(adj.previousDay).toBe("2026-09-30");
    expect(adj.nextDay).toBe("2026-10-02");
  });
});
