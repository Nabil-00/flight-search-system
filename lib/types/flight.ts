/**
 * Core Domain Models for AI-Assisted Conversational Flight Search System
 */

export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export interface AirportLocation {
  city: string;
  iataCode: string;
  airportName?: string;
}

export interface PassengerCount {
  adults: number;
  children: number;
  infants: number;
}

/**
 * Section 7: Canonical Flight Request
 * The single source of truth for flight searches.
 */
export interface FlightSearchRequest {
  requestId: string;
  origin: AirportLocation;
  destination: AirportLocation;
  passengers: PassengerCount;
  cabinClass: CabinClass;
  departureDate: string; // ISO format: YYYY-MM-DD
  tripType: "one_way";
}

/**
 * Section 12: Normalized Internal Flight Offer
 */
export interface FlightOffer {
  offerId: string;
  airline: string;
  airlineCode?: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departure: string; // ISO 8601: YYYY-MM-DDTHH:mm:ss
  arrival: string;   // ISO 8601: YYYY-MM-DDTHH:mm:ss
  duration?: string; // e.g. "6h 15m"
  stops: number;
  cabinClass: CabinClass | string;
  price: {
    amount: string;
    currency: string;
  };
  aircraft?: string;
  slices?: Array<{
    origin: string;
    destination: string;
    departure: string;
    arrival: string;
    flightNumber: string;
    airline: string;
    duration?: string;
  }>;
}

/**
 * Section 8: Validation Engine Result
 */
export type ValidationStatus = "VALID" | "INCOMPLETE" | "INVALID" | "AMBIGUOUS";

export interface ValidationResult {
  status: ValidationStatus;
  request?: FlightSearchRequest;
  missing_fields?: string[];
  clarification_prompt?: string;
  error_code?: SystemErrorCode;
  error_message?: string;
}

/**
 * Section 13: Availability Decision Status & Model
 */
export type AvailabilityStatus = "AVAILABLE" | "ALTERNATIVES_FOUND" | "NO_AVAILABILITY";

export interface AvailabilityDecision {
  status: AvailabilityStatus;
  requested_date: string;
  searched_dates: string[];
  offers?: FlightOffer[];
  alternatives?: {
    previous_day: FlightOffer[];
    next_day: FlightOffer[];
  };
}

/**
 * Section 14 & 28: System and Provider Error Codes
 */
export type SystemErrorCode =
  | "DUFFEL_TIMEOUT"
  | "DUFFEL_AUTH_ERROR"
  | "DUFFEL_RATE_LIMIT"
  | "DUFFEL_PROVIDER_ERROR"
  | "INTERNAL_ERROR"
  | "AI_SERVICE_ERROR"
  | "INVALID_PASSENGER_COUNT"
  | "AMBIGUOUS_LOCATION";

export interface SystemErrorResponse {
  error: true;
  error_code: SystemErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Section 5: Raw AI Extracted Entities before Normalization
 */
export interface ExtractedFlightData {
  origin?: string | null;
  destination?: string | null;
  passengers?: number | string | { adults?: number; children?: number; infants?: number } | null;
  cabin_class?: string | null;
  departure_date?: string | null;
  raw_user_message?: string;
  ambiguous_fields?: string[];
}
