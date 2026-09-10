import {
  FlightSearchRequest,
  AvailabilityDecision,
  SystemErrorResponse,
} from "../types/flight";
import { FlightProvider } from "./provider";
import { DuffelProvider } from "./duffel";
import { getAdjacentDates } from "../normalization/date";
import { validateFlightRequest } from "../validation/flight-request";

export interface OrchestratorResult {
  decision?: AvailabilityDecision;
  systemError?: SystemErrorResponse;
}

/**
 * Section 9: Flight Search Orchestrator
 * Central business logic component enforcing BR-004, BR-005, BR-006, BR-009.
 */
export class FlightSearchOrchestrator {
  private provider: FlightProvider;

  constructor(provider?: FlightProvider) {
    this.provider = provider || new DuffelProvider();
  }

  async search(request: FlightSearchRequest): Promise<OrchestratorResult> {
    // 1. Enforce BR-003: Deterministic Validation Before Search
    const validation = validateFlightRequest(request);
    if (validation.status !== "VALID" || !validation.request) {
      return {
        systemError: {
          error: true,
          error_code: validation.error_code || "INTERNAL_ERROR",
          message: validation.error_message || "Flight search request validation failed.",
          details: { missing_fields: validation.missing_fields },
        },
      };
    }

    const canonical = validation.request;
    const requestedDate = canonical.departureDate;
    const searchedDates: string[] = [requestedDate];

    // 2. Enforce BR-004: Search requested date D first
    const primaryResult = await this.provider.searchFlights(canonical);

    // Enforce BR-009: Provider failures must never be represented as NO_AVAILABILITY
    if (!primaryResult.success) {
      return {
        systemError: {
          error: true,
          error_code: primaryResult.errorCode || "DUFFEL_PROVIDER_ERROR",
          message: primaryResult.errorMessage || "Error received from flight provider.",
        },
      };
    }

    // Scenario A: Requested date has availability
    if (primaryResult.offers && primaryResult.offers.length > 0) {
      return {
        decision: {
          status: "AVAILABLE",
          requested_date: requestedDate,
          searched_dates: searchedDates,
          offers: primaryResult.offers,
        },
      };
    }

    // 3. Enforce BR-005 & BR-006: Search D-1 and D+1 (and strictly no further dates)
    const { previousDay, nextDay } = getAdjacentDates(requestedDate);
    searchedDates.push(previousDay, nextDay);

    // Execute adjacent searches
    const [prevResult, nextResult] = await Promise.all([
      this.provider.searchFlights({ ...canonical, departureDate: previousDay }),
      this.provider.searchFlights({ ...canonical, departureDate: nextDay }),
    ]);

    // Check for provider error during alternative search
    if (!prevResult.success && prevResult.errorCode !== undefined) {
      return {
        systemError: {
          error: true,
          error_code: prevResult.errorCode,
          message: prevResult.errorMessage || "Provider error occurred searching previous day.",
        },
      };
    }
    if (!nextResult.success && nextResult.errorCode !== undefined) {
      return {
        systemError: {
          error: true,
          error_code: nextResult.errorCode,
          message: nextResult.errorMessage || "Provider error occurred searching next day.",
        },
      };
    }

    const prevOffers = prevResult.offers || [];
    const nextOffers = nextResult.offers || [];

    // Scenario B: Alternatives found on D-1 or D+1
    if (prevOffers.length > 0 || nextOffers.length > 0) {
      return {
        decision: {
          status: "ALTERNATIVES_FOUND",
          requested_date: requestedDate,
          searched_dates: searchedDates,
          alternatives: {
            previous_day: prevOffers,
            next_day: nextOffers,
          },
        },
      };
    }

    // Scenario C: No availability anywhere in [D, D-1, D+1]
    return {
      decision: {
        status: "NO_AVAILABILITY",
        requested_date: requestedDate,
        searched_dates: searchedDates,
        alternatives: {
          previous_day: [],
          next_day: [],
        },
      },
    };
  }
}
