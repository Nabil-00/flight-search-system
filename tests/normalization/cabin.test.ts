import { describe, it, expect } from "vitest";
import { normalizeCabinClass } from "../../lib/normalization/cabin";

describe("Cabin Normalization", () => {
  it("normalizes business class variations", () => {
    expect(normalizeCabinClass("business").cabinClass).toBe("business");
    expect(normalizeCabinClass("business class").cabinClass).toBe("business");
    expect(normalizeCabinClass("biz class").cabinClass).toBe("business");
    expect(normalizeCabinClass("executive").cabinClass).toBe("business");
  });

  it("normalizes economy class variations", () => {
    expect(normalizeCabinClass("economy").cabinClass).toBe("economy");
    expect(normalizeCabinClass("economy class").cabinClass).toBe("economy");
    expect(normalizeCabinClass("coach").cabinClass).toBe("economy");
    expect(normalizeCabinClass("standard").cabinClass).toBe("economy");
  });

  it("normalizes premium economy variations", () => {
    expect(normalizeCabinClass("premium economy").cabinClass).toBe("premium_economy");
    expect(normalizeCabinClass("premium").cabinClass).toBe("premium_economy");
    expect(normalizeCabinClass("comfort").cabinClass).toBe("premium_economy");
  });

  it("normalizes first class variations", () => {
    expect(normalizeCabinClass("first").cabinClass).toBe("first");
    expect(normalizeCabinClass("first class").cabinClass).toBe("first");
    expect(normalizeCabinClass("suite").cabinClass).toBe("first");
  });

  it("rejects invalid cabin values", () => {
    const res = normalizeCabinClass("space ship");
    expect(res.isValid).toBe(false);
    expect(res.cabinClass).toBeUndefined();
  });
});
