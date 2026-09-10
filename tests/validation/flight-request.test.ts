import { describe, it, expect } from "vitest";
import { validateFlightRequest } from "../../lib/validation/flight-request";

describe("Validation Engine", () => {
  const REF_DATE = "2026-09-10";

  it("validates a complete request and returns VALID canonical request", () => {
    const input = {
      origin: "Lagos",
      destination: "Dubai",
      passengers: 3,
      cabin_class: "business",
      departure_date: "2026-09-12",
    };

    const res = validateFlightRequest(input, { referenceDate: REF_DATE });
    expect(res.status).toBe("VALID");
    expect(res.request).toBeDefined();
    expect(res.request?.origin.iataCode).toBe("LOS");
    expect(res.request?.destination.iataCode).toBe("DXB");
    expect(res.request?.passengers.adults).toBe(3);
    expect(res.request?.cabinClass).toBe("business");
    expect(res.request?.departureDate).toBe("2026-09-12");
  });

  it("identifies missing fields and returns INCOMPLETE with clarification prompt", () => {
    const input = {
      origin: "Lagos",
      destination: "London",
      departure_date: "next Friday",
    };

    const res = validateFlightRequest(input, { referenceDate: REF_DATE });
    expect(res.status).toBe("INCOMPLETE");
    expect(res.missing_fields).toContain("passengers");
    expect(res.missing_fields).toContain("cabin_class");
    expect(res.clarification_prompt).toBeDefined();
    expect(res.clarification_prompt).toContain("How many passengers");
  });

  it("rejects identical origin and destination with INVALID status", () => {
    const input = {
      origin: "Lagos",
      destination: "LOS",
      passengers: 1,
      cabin_class: "economy",
      departure_date: "tomorrow",
    };

    const res = validateFlightRequest(input, { referenceDate: REF_DATE });
    expect(res.status).toBe("INVALID");
    expect(res.error_message).toContain("Origin and destination cannot be the same");
  });

  it("rejects invalid passenger count with INVALID_PASSENGER_COUNT", () => {
    const input = {
      origin: "Lagos",
      destination: "Dubai",
      passengers: -2,
      cabin_class: "economy",
      departure_date: "tomorrow",
    };

    const res = validateFlightRequest(input, { referenceDate: REF_DATE });
    expect(res.status).toBe("INVALID");
    expect(res.error_code).toBe("INVALID_PASSENGER_COUNT");
  });

  it("handles ambiguous date with AMBIGUOUS status", () => {
    const input = {
      origin: "Lagos",
      destination: "London",
      passengers: 2,
      cabin_class: "economy",
      departure_date: "next week",
    };

    const res = validateFlightRequest(input, { referenceDate: REF_DATE });
    expect(res.status).toBe("AMBIGUOUS");
    expect(res.clarification_prompt).toBeDefined();
  });
});
