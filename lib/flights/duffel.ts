import { FlightSearchRequest, FlightOffer, SystemErrorCode, CabinClass } from "../types/flight";
import { FlightProvider, FlightSearchResult } from "./provider";
import { normalizeDuffelOffer } from "./response-normalizer";

const DUFFEL_API_URL = "https://api.duffel.com/air/offer_requests";

/**
 * Section 11: Duffel Provider Implementation
 * Communicates with Duffel Test/Sandbox API using DUFFEL_ACCESS_TOKEN.
 * Contains sandbox simulation capabilities when offline or without active token.
 */
export class DuffelProvider implements FlightProvider {
  private token: string | undefined;

  constructor(token?: string) {
    this.token = token || process.env.DUFFEL_ACCESS_TOKEN;
  }

  async searchFlights(request: FlightSearchRequest): Promise<FlightSearchResult> {
    const hasLiveToken = this.token && this.token.trim() && !this.token.includes("your_duffel_access_token");

    if (hasLiveToken) {
      return this.executeLiveDuffelSearch(request);
    }

    // Offline / Sandbox Simulator Mode
    return this.executeMockSearch(request);
  }

  /**
   * Sends request to Duffel Live Sandbox API
   */
  private async executeLiveDuffelSearch(request: FlightSearchRequest): Promise<FlightSearchResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

    try {
      // Build passengers array according to Duffel specifications
      const passengers: Array<{ type: string }> = [];
      for (let i = 0; i < request.passengers.adults; i++) {
        passengers.push({ type: "adult" });
      }
      for (let i = 0; i < request.passengers.children; i++) {
        passengers.push({ type: "child" });
      }
      for (let i = 0; i < request.passengers.infants; i++) {
        passengers.push({ type: "infant_without_seat" });
      }

      const payload = {
        data: {
          slices: [
            {
              origin: request.origin.iataCode,
              destination: request.destination.iataCode,
              departure_date: request.departureDate,
            },
          ],
          passengers,
          cabin_class: request.cabinClass,
        },
      };

      const res = await fetch(DUFFEL_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Duffel-Version": "v2",
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return this.mapHttpError(res.status, await res.text(), request.departureDate);
      }

      const json = await res.json();
      const rawOffers = json.data?.offers || [];
      const normalizedOffers: FlightOffer[] = rawOffers.map((raw: any) =>
        normalizeDuffelOffer(raw, request.cabinClass)
      );

      return {
        success: true,
        offers: normalizedOffers,
        searchedDate: request.departureDate,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError" || err.message?.includes("abort")) {
        return {
          success: false,
          offers: [],
          searchedDate: request.departureDate,
          errorCode: "DUFFEL_TIMEOUT",
          errorMessage: "Duffel API request timed out after 12 seconds.",
        };
      }

      return {
        success: false,
        offers: [],
        searchedDate: request.departureDate,
        errorCode: "DUFFEL_PROVIDER_ERROR",
        errorMessage: `Duffel connection error: ${err.message || "Failed to reach Duffel API"}`,
      };
    }
  }

  /**
   * Maps HTTP status codes to canonical system error codes per Section 14
   */
  private mapHttpError(status: number, responseText: string, date: string): FlightSearchResult {
    let errorCode: SystemErrorCode = "INTERNAL_ERROR";
    let message = `Duffel API error (${status})`;

    if (status === 401 || status === 403) {
      errorCode = "DUFFEL_AUTH_ERROR";
      message = "Duffel authentication failed. Please verify DUFFEL_ACCESS_TOKEN.";
    } else if (status === 429) {
      errorCode = "DUFFEL_RATE_LIMIT";
      message = "Duffel API rate limit exceeded. Please try again in a few moments.";
    } else if (status >= 500) {
      errorCode = "DUFFEL_PROVIDER_ERROR";
      message = "Duffel provider is experiencing downtime or internal error.";
    }

    return {
      success: false,
      offers: [],
      searchedDate: date,
      errorCode,
      errorMessage: `${message} - ${responseText.substring(0, 100)}`,
    };
  }

  /**
   * Sandbox simulator for local demo scenarios and test environments
   */
  private async executeMockSearch(request: FlightSearchRequest): Promise<FlightSearchResult> {
    // Artificial small latency to simulate realistic network trip (150ms)
    await new Promise(r => setTimeout(r, 150));

    const date = request.departureDate;
    const origin = request.origin.iataCode;
    const dest = request.destination.iataCode;

    // Simulation Scenario 2 Support:
    // If date is "2026-09-18" or has query flag "test_unavailable" on D, return 0 offers on requested date,
    // but return offers on previous day (2026-09-17) and next day (2026-09-19).
    // Also support custom mock testing via date pattern: dates ending in "-18" or "-25" have 0 flights on D.
    const isExplicitlyUnavailableDate = date.endsWith("-18") || date.endsWith("-25");

    if (isExplicitlyUnavailableDate) {
      return {
        success: true,
        offers: [],
        searchedDate: date,
      };
    }

    // Generate realistic flight offers
    const offers = generateMockOffers(origin, dest, date, request.cabinClass, request.passengers.adults);

    return {
      success: true,
      offers,
      searchedDate: date,
    };
  }
}

/**
 * Generates realistic airline offers based on origin and destination
 */
function generateMockOffers(
  origin: string,
  dest: string,
  date: string,
  cabinClass: CabinClass,
  passengers: number
): FlightOffer[] {
  const multipliers: Record<CabinClass, number> = {
    economy: 1,
    premium_economy: 1.6,
    business: 3.2,
    first: 5.5,
  };

  const mult = multipliers[cabinClass] || 1;

  // Realistic airline networks based on route
  const airlines = getAirlinesForRoute(origin, dest);

  return airlines.map((a, idx) => {
    const basePrice = Math.round((a.basePriceUSD * mult * passengers));
    const depHour = 8 + idx * 4;
    const depTime = `${date}T${String(depHour).padStart(2, "0")}:${idx % 2 === 0 ? "15" : "45"}:00`;
    const arrHour = (depHour + a.flightDurationHours) % 24;
    const nextDayOffset = (depHour + a.flightDurationHours >= 24) ? 1 : 0;
    
    // Arrival date calculation
    const arrDateObj = new Date(`${date}T00:00:00Z`);
    arrDateObj.setUTCDate(arrDateObj.getUTCDate() + nextDayOffset);
    const arrDateStr = arrDateObj.toISOString().split("T")[0];
    const arrTime = `${arrDateStr}T${String(arrHour).padStart(2, "0")}:${idx % 2 === 0 ? "35" : "10"}:00`;

    return {
      offerId: `off_duffel_${date}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
      airline: a.name,
      airlineCode: a.code,
      flightNumber: `${a.code}${100 + idx * 35}`,
      origin,
      destination: dest,
      departure: depTime,
      arrival: arrTime,
      duration: `${a.flightDurationHours}h ${idx % 2 === 0 ? "20m" : "55m"}`,
      stops: a.stops,
      cabinClass,
      price: {
        amount: basePrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        currency: "USD",
      },
      aircraft: a.aircraft,
    };
  });
}

function getAirlinesForRoute(origin: string, dest: string) {
  // Routes from Nigeria (LOS / ABV) to Middle East (DXB)
  if ((origin === "LOS" || origin === "ABV") && dest === "DXB") {
    return [
      { name: "Emirates", code: "EK", basePriceUSD: 850, flightDurationHours: 7, stops: 0, aircraft: "Boeing 777-300ER" },
      { name: "Qatar Airways", code: "QR", basePriceUSD: 780, flightDurationHours: 8, stops: 1, aircraft: "Airbus A350-900" },
      { name: "EgyptAir", code: "MS", basePriceUSD: 640, flightDurationHours: 9, stops: 1, aircraft: "Boeing 787-9" },
    ];
  }

  // Routes from Nigeria to London (LHR / LGW)
  if ((origin === "LOS" || origin === "ABV") && (dest === "LHR" || dest === "LGW")) {
    return [
      { name: "British Airways", code: "BA", basePriceUSD: 920, flightDurationHours: 6, stops: 0, aircraft: "Boeing 787-10" },
      { name: "Virgin Atlantic", code: "VS", basePriceUSD: 890, flightDurationHours: 6, stops: 0, aircraft: "Airbus A350-1000" },
      { name: "Air Peace", code: "P4", basePriceUSD: 720, flightDurationHours: 6, stops: 0, aircraft: "Boeing 777-200" },
    ];
  }

  // Domestic Nigeria (LOS <-> ABV)
  if ((origin === "LOS" && dest === "ABV") || (origin === "ABV" && dest === "LOS")) {
    return [
      { name: "Air Peace", code: "P4", basePriceUSD: 95, flightDurationHours: 1, stops: 0, aircraft: "Embraer 195-E2" },
      { name: "Ibom Air", code: "QI", basePriceUSD: 110, flightDurationHours: 1, stops: 0, aircraft: "Airbus A220-300" },
      { name: "United Nigeria", code: "UN", basePriceUSD: 85, flightDurationHours: 1, stops: 0, aircraft: "Embraer ERJ-145" },
    ];
  }

  // Generic international routes
  return [
    { name: "Skyline Global", code: "SG", basePriceUSD: 750, flightDurationHours: 7, stops: 0, aircraft: "Airbus A330neo" },
    { name: "AeroConnect", code: "AC", basePriceUSD: 620, flightDurationHours: 9, stops: 1, aircraft: "Boeing 737 MAX 8" },
  ];
}
