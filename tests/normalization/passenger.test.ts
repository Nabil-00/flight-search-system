import { describe, it, expect } from "vitest";
import { normalizePassengers } from "../../lib/normalization/passenger";

describe("Passenger Normalization", () => {
  it("normalizes digits and number words", () => {
    expect(normalizePassengers(1).passengers).toEqual({ adults: 1, children: 0, infants: 0 });
    expect(normalizePassengers("2").passengers).toEqual({ adults: 2, children: 0, infants: 0 });
    expect(normalizePassengers("three passengers").passengers).toEqual({ adults: 3, children: 0, infants: 0 });
    expect(normalizePassengers("3 tickets").passengers).toEqual({ adults: 3, children: 0, infants: 0 });
    expect(normalizePassengers("2 people").passengers).toEqual({ adults: 2, children: 0, infants: 0 });
  });

  it("normalizes colloquial relationship phrases", () => {
    expect(normalizePassengers("me and my wife").passengers).toEqual({ adults: 2, children: 0, infants: 0 });
    expect(normalizePassengers("me and my partner").passengers).toEqual({ adults: 2, children: 0, infants: 0 });
    expect(normalizePassengers("2 of us").passengers).toEqual({ adults: 2, children: 0, infants: 0 });
    expect(normalizePassengers("just me").passengers).toEqual({ adults: 1, children: 0, infants: 0 });
    expect(normalizePassengers("solo").passengers).toEqual({ adults: 1, children: 0, infants: 0 });
  });

  it("normalizes family groupings with children and infants", () => {
    const res = normalizePassengers("2 adults and 1 child");
    expect(res.passengers).toEqual({ adults: 2, children: 1, infants: 0 });
  });

  it("rejects negative numbers with INVALID_PASSENGER_COUNT", () => {
    const res = normalizePassengers(-2);
    expect(res.isValid).toBe(false);
    expect(res.errorCode).toBe("INVALID_PASSENGER_COUNT");

    const strRes = normalizePassengers("-2 passengers");
    expect(strRes.isValid).toBe(false);
    expect(strRes.errorCode).toBe("INVALID_PASSENGER_COUNT");
  });

  it("rejects 0 adults", () => {
    const res = normalizePassengers(0);
    expect(res.isValid).toBe(false);
    expect(res.errorCode).toBe("INVALID_PASSENGER_COUNT");
  });

  it("rejects excessive passengers (> 9)", () => {
    const res = normalizePassengers(15);
    expect(res.isValid).toBe(false);
    expect(res.errorCode).toBe("INVALID_PASSENGER_COUNT");
  });
});
