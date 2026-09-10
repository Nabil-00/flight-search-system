import { FlightSearchRequest, FlightOffer, SystemErrorCode } from "../types/flight";

export interface FlightSearchResult {
  success: boolean;
  offers: FlightOffer[];
  searchedDate: string;
  errorCode?: SystemErrorCode;
  errorMessage?: string;
}

/**
 * Section 10: Flight Provider Abstraction
 * Decouples business logic from specific flight aggregators.
 */
export interface FlightProvider {
  searchFlights(request: FlightSearchRequest): Promise<FlightSearchResult>;
}
