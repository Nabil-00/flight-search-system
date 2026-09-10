import { describe, it, expect } from "vitest";
import { normalizeLocation } from "../../lib/normalization/location";

describe("Location Normalization", () => {
  it("resolves exact 3-letter IATA codes", () => {
    const res = normalizeLocation("LOS");
    expect(res.location).toBeDefined();
    expect(res.location?.iataCode).toBe("LOS");
    expect(res.location?.city).toBe("Lagos");
  });

  it("resolves city names to IATA codes", () => {
    const lagos = normalizeLocation("Lagos");
    expect(lagos.location?.iataCode).toBe("LOS");

    const dxb = normalizeLocation("Dubai");
    expect(dxb.location?.iataCode).toBe("DXB");

    const abuja = normalizeLocation("Abuja");
    expect(abuja.location?.iataCode).toBe("ABV");

    const london = normalizeLocation("London");
    expect(london.location?.iataCode).toBe("LHR");
  });

  it("resolves full airport names", () => {
    const murtala = normalizeLocation("Murtala Muhammed Airport");
    expect(murtala.location?.iataCode).toBe("LOS");

    const heathrow = normalizeLocation("London Heathrow Airport");
    expect(heathrow.location?.iataCode).toBe("LHR");
  });

  it("handles prefixes like 'from' and 'to'", () => {
    const fromLagos = normalizeLocation("from Lagos");
    expect(fromLagos.location?.iataCode).toBe("LOS");

    const toDubai = normalizeLocation("to Dubai");
    expect(toDubai.location?.iataCode).toBe("DXB");
  });

  it("returns error for completely unknown locations", () => {
    const unknown = normalizeLocation("Atlantis Wonderland");
    expect(unknown.location).toBeUndefined();
    expect(unknown.error).toBeDefined();
  });
});
