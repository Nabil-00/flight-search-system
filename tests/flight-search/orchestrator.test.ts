import { describe, it, expect } from "vitest";
import { FlightSearchOrchestrator } from "../../lib/flights/search-orchestrator";
import { FlightProvider, FlightSearchResult } from "../../lib/flights/provider";
import { FlightSearchRequest, FlightOffer } from "../../lib/types/flight";

// Mock Provider for deterministic unit testing
class MockFlightProvider implements FlightProvider {
  constructor(
    private dateResponses: Record<string, { success: boolean; offers?: FlightOffer[]; errorCode?: any; errorMessage?: string }>
  ) {}

  async searchFlights(request: FlightSearchRequest): Promise<FlightSearchResult> {
    const resp = this.dateResponses[request.departureDate] || { success: true, offers: [] };
    return {
      success: resp.success,
      offers: resp.offers || [],
      searchedDate: request.departureDate,
      errorCode: resp.errorCode,
      errorMessage: resp.errorMessage,
    };
  }
}

describe("Flight Search Orchestrator", () => {
  const sampleRequest: FlightSearchRequest = {
    requestId: "req_test_123",
    origin: { city: "Lagos", iataCode: "LOS" },
    destination: { city: "Dubai", iataCode: "DXB" },
    passengers: { adults: 2, children: 0, infants: 0 },
    cabinClass: "business",
    departureDate: "2026-09-12",
    tripType: "one_way",
  };

  const sampleOffer: FlightOffer = {
    offerId: "off_1",
    airline: "Emirates",
    flightNumber: "EK784",
    origin: "LOS",
    destination: "DXB",
    departure: "2026-09-12T10:30:00",
    arrival: "2026-09-12T17:45:00",
    stops: 0,
    cabinClass: "business",
    price: { amount: "2,400.00", currency: "USD" },
  };

  it("Scenario 1: returns AVAILABLE when requested date has offers (does not search D-1/D+1)", async () => {
    const mockProvider = new MockFlightProvider({
      "2026-09-12": { success: true, offers: [sampleOffer] },
    });

    const orchestrator = new FlightSearchOrchestrator(mockProvider);
    const res = await orchestrator.search(sampleRequest);

    expect(res.decision).toBeDefined();
    expect(res.decision?.status).toBe("AVAILABLE");
    expect(res.decision?.requested_date).toBe("2026-09-12");
    expect(res.decision?.searched_dates).toEqual(["2026-09-12"]);
    expect(res.decision?.offers?.length).toBe(1);
  });

  it("Scenario 2: searches D-1 and D+1 and returns ALTERNATIVES_FOUND when D is unavailable", async () => {
    const prevOffer = { ...sampleOffer, offerId: "off_prev", departure: "2026-09-11T10:30:00" };
    const nextOffer = { ...sampleOffer, offerId: "off_next", departure: "2026-09-13T10:30:00" };

    const mockProvider = new MockFlightProvider({
      "2026-09-12": { success: true, offers: [] }, // No flights on D
      "2026-09-11": { success: true, offers: [prevOffer] }, // D-1
      "2026-09-13": { success: true, offers: [nextOffer] }, // D+1
    });

    const orchestrator = new FlightSearchOrchestrator(mockProvider);
    const res = await orchestrator.search(sampleRequest);

    expect(res.decision).toBeDefined();
    expect(res.decision?.status).toBe("ALTERNATIVES_FOUND");
    expect(res.decision?.requested_date).toBe("2026-09-12");
    expect(res.decision?.searched_dates).toEqual(["2026-09-12", "2026-09-11", "2026-09-13"]);
    expect(res.decision?.alternatives?.previous_day.length).toBe(1);
    expect(res.decision?.alternatives?.next_day.length).toBe(1);
  });

  it("Scenario 3: returns NO_AVAILABILITY when neither D, D-1, nor D+1 have offers", async () => {
    const mockProvider = new MockFlightProvider({
      "2026-09-12": { success: true, offers: [] },
      "2026-09-11": { success: true, offers: [] },
      "2026-09-13": { success: true, offers: [] },
    });

    const orchestrator = new FlightSearchOrchestrator(mockProvider);
    const res = await orchestrator.search(sampleRequest);

    expect(res.decision).toBeDefined();
    expect(res.decision?.status).toBe("NO_AVAILABILITY");
    expect(res.decision?.searched_dates).toEqual(["2026-09-12", "2026-09-11", "2026-09-13"]);
    expect(res.decision?.alternatives?.previous_day).toEqual([]);
    expect(res.decision?.alternatives?.next_day).toEqual([]);
  });

  it("BR-009: never converts a provider error into NO_AVAILABILITY", async () => {
    const mockProvider = new MockFlightProvider({
      "2026-09-12": {
        success: false,
        errorCode: "DUFFEL_TIMEOUT",
        errorMessage: "Duffel API request timed out.",
      },
    });

    const orchestrator = new FlightSearchOrchestrator(mockProvider);
    const res = await orchestrator.search(sampleRequest);

    expect(res.decision).toBeUndefined();
    expect(res.systemError).toBeDefined();
    expect(res.systemError?.error_code).toBe("DUFFEL_TIMEOUT");
    expect(res.systemError?.message).toContain("timed out");
  });
});
