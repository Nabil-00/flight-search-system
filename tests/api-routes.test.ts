import { describe, it, expect } from "vitest";
import { POST as normalizeHandler } from "../app/api/normalize/route";
import { POST as searchHandler } from "../app/api/flights/search/route";
import { NextRequest } from "next/server";

describe("API Routes End-to-End Handlers", () => {
  it("POST /api/normalize - Scenario 1: parses and validates complete request", async () => {
    const req = new NextRequest("http://localhost:3000/api/normalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "I need 3 business class tickets from Lagos to Dubai next Saturday.",
      }),
    });

    const res = await normalizeHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe("VALID");
    expect(json.request).toBeDefined();
    expect(json.request.origin.iataCode).toBe("LOS");
    expect(json.request.destination.iataCode).toBe("DXB");
    expect(json.request.passengers.adults).toBe(3);
    expect(json.request.cabinClass).toBe("business");
  });

  it("POST /api/normalize - Scenario 3: handles incomplete request with clarification prompt", async () => {
    const req = new NextRequest("http://localhost:3000/api/normalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "I need to go to London next week.",
      }),
    });

    const res = await normalizeHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe("INCOMPLETE");
    expect(json.missing_fields).toContain("origin");
    expect(json.missing_fields).toContain("passengers");
    expect(json.missing_fields).toContain("cabin_class");
    expect(json.clarification_prompt).toBeDefined();
  });

  it("POST /api/flights/search - Scenario 1: returns AVAILABLE offers on requested date", async () => {
    const req = new NextRequest("http://localhost:3000/api/flights/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: "LOS",
        destination: "DXB",
        departure_date: "2026-09-12",
        passengers: { adults: 3, children: 0, infants: 0 },
        cabin_class: "business",
      }),
    });

    const res = await searchHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe("AVAILABLE");
    expect(json.requested_date).toBe("2026-09-12");
    expect(json.searched_dates).toEqual(["2026-09-12"]);
    expect(json.offers).toBeDefined();
    expect(json.offers.length).toBeGreaterThan(0);
    expect(json.offers[0].airline).toBeDefined();
    expect(json.offers[0].price.amount).toBeDefined();
  });

  it("POST /api/flights/search - Scenario 2: returns ALTERNATIVES_FOUND (D-1 and D+1) when requested date is unavailable", async () => {
    // Dates ending in "-18" are simulated as unavailable on D
    const req = new NextRequest("http://localhost:3000/api/flights/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: "LOS",
        destination: "LHR",
        departure_date: "2026-09-18",
        passengers: { adults: 1, children: 0, infants: 0 },
        cabin_class: "economy",
      }),
    });

    const res = await searchHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe("ALTERNATIVES_FOUND");
    expect(json.requested_date).toBe("2026-09-18");
    expect(json.searched_dates).toEqual(["2026-09-18", "2026-09-17", "2026-09-19"]);
    expect(json.alternatives).toBeDefined();
    expect(json.alternatives.previous_day.length).toBeGreaterThan(0);
    expect(json.alternatives.next_day.length).toBeGreaterThan(0);
  });

  it("POST /api/flights/search - rejects invalid passenger count", async () => {
    const req = new NextRequest("http://localhost:3000/api/flights/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: "LOS",
        destination: "DXB",
        departure_date: "2026-09-12",
        passengers: -2,
        cabin_class: "business",
      }),
    });

    const res = await searchHandler(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe(true);
  });
});
