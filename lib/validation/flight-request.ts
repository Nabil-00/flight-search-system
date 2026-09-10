import {
  FlightSearchRequest,
  ValidationResult,
  ExtractedFlightData,
  AirportLocation,
  PassengerCount,
  CabinClass,
} from "../types/flight";
import { normalizeLocation } from "../normalization/location";
import { normalizePassengers } from "../normalization/passenger";
import { normalizeCabinClass } from "../normalization/cabin";
import { normalizeDate } from "../normalization/date";

export interface ValidationOptions {
  referenceDate?: string | Date;
}

/**
 * Validates and transforms raw/extracted flight data into a canonical FlightSearchRequest.
 * Enforces BR-001 (Required Information) and returns status: VALID, INCOMPLETE, INVALID, or AMBIGUOUS.
 */
export function validateFlightRequest(
  input: ExtractedFlightData | FlightSearchRequest | Record<string, any>,
  options?: ValidationOptions
): ValidationResult {
  const missingFields: string[] = [];

  // 1. Origin Check & Normalization
  let originLocation: AirportLocation | undefined;
  if (!input.origin) {
    missingFields.push("origin");
  } else if (typeof input.origin === "object" && "iataCode" in (input.origin as object)) {
    originLocation = input.origin as AirportLocation;
  } else {
    const res = normalizeLocation(String(input.origin));
    if (res.isAmbiguous) {
      return {
        status: "AMBIGUOUS",
        error_code: "AMBIGUOUS_LOCATION",
        error_message: res.error || `Origin location '${input.origin}' is ambiguous.`,
        clarification_prompt: res.error,
      };
    }
    if (res.location) {
      originLocation = res.location;
    } else {
      return {
        status: "INVALID",
        error_code: "AMBIGUOUS_LOCATION",
        error_message: res.error || `Cannot find airport or city for origin: '${input.origin}'.`,
        clarification_prompt: `I couldn't locate the airport or city '${input.origin}'. Could you please clarify your departure city or airport code?`,
      };
    }
  }

  // 2. Destination Check & Normalization
  let destLocation: AirportLocation | undefined;
  if (!input.destination) {
    missingFields.push("destination");
  } else if (typeof input.destination === "object" && "iataCode" in (input.destination as object)) {
    destLocation = input.destination as AirportLocation;
  } else {
    const res = normalizeLocation(String(input.destination));
    if (res.isAmbiguous) {
      return {
        status: "AMBIGUOUS",
        error_code: "AMBIGUOUS_LOCATION",
        error_message: res.error || `Destination location '${input.destination}' is ambiguous.`,
        clarification_prompt: res.error,
      };
    }
    if (res.location) {
      destLocation = res.location;
    } else {
      return {
        status: "INVALID",
        error_code: "AMBIGUOUS_LOCATION",
        error_message: res.error || `Cannot find airport or city for destination: '${input.destination}'.`,
        clarification_prompt: `I couldn't locate the airport or city '${input.destination}'. Could you please clarify your destination city or airport code?`,
      };
    }
  }

  // Check Origin != Destination
  if (originLocation && destLocation && originLocation.iataCode === destLocation.iataCode) {
    return {
      status: "INVALID",
      error_message: "Origin and destination cannot be the same airport.",
      clarification_prompt: `Origin and destination are both set to ${originLocation.city} (${originLocation.iataCode}). Please specify different departure and arrival destinations.`,
    };
  }

  // 3. Passenger Count Check & Normalization
  let passengerCount: PassengerCount | undefined;
  const rawPass = (input as any).passengers;
  if (rawPass === undefined || rawPass === null || rawPass === "") {
    missingFields.push("passengers");
  } else {
    const res = normalizePassengers(rawPass);
    if (!res.isValid) {
      if (res.errorCode === "INVALID_PASSENGER_COUNT") {
        return {
          status: "INVALID",
          error_code: "INVALID_PASSENGER_COUNT",
          error_message: res.errorMessage || "Invalid passenger count.",
          clarification_prompt: res.errorMessage || "Please provide a valid number of passengers (1 to 9).",
        };
      }
      missingFields.push("passengers");
    } else {
      passengerCount = res.passengers;
    }
  }

  // 4. Cabin Class Check & Normalization
  let cabinClass: CabinClass | undefined;
  const rawCabin = (input as any).cabin_class || (input as any).cabinClass;
  if (!rawCabin) {
    missingFields.push("cabin_class");
  } else {
    const res = normalizeCabinClass(rawCabin);
    if (!res.isValid) {
      missingFields.push("cabin_class");
    } else {
      cabinClass = res.cabinClass;
    }
  }

  // 5. Departure Date Check & Normalization
  let departureDate: string | undefined;
  let isDateAmbiguous = false;
  let dateAmbiguousMessage: string | undefined;

  const rawDate = (input as any).departure_date || (input as any).departureDate;
  if (!rawDate) {
    missingFields.push("departure_date");
  } else {
    const res = normalizeDate(rawDate, options?.referenceDate);
    if (res.isAmbiguous) {
      isDateAmbiguous = true;
      dateAmbiguousMessage = res.errorMessage;
      missingFields.push("departure_date");
    } else if (!res.isValid || !res.isoDate) {
      missingFields.push("departure_date");
    } else {
      departureDate = res.isoDate;
    }
  }

  // If any required field is missing, return INCOMPLETE with clarification prompt
  if (missingFields.length > 0) {
    // If only departure_date is ambiguous and no other fields are missing, return AMBIGUOUS
    if (missingFields.length === 1 && missingFields[0] === "departure_date" && isDateAmbiguous) {
      return {
        status: "AMBIGUOUS",
        error_message: dateAmbiguousMessage || "Ambiguous date provided.",
        clarification_prompt: dateAmbiguousMessage || "Please specify a specific departure date (e.g. 2026-09-12 or next Saturday).",
      };
    }

    const prompt = generateClarificationPrompt(missingFields, {
      origin: originLocation?.city,
      destination: destLocation?.city,
    });
    return {
      status: "INCOMPLETE",
      missing_fields: missingFields,
      clarification_prompt: prompt,
    };
  }

  // All fields present and validated -> Return VALID canonical request
  const canonicalRequest: FlightSearchRequest = {
    requestId: (input as any).requestId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    origin: originLocation!,
    destination: destLocation!,
    passengers: passengerCount!,
    cabinClass: cabinClass!,
    departureDate: departureDate!,
    tripType: "one_way",
  };

  return {
    status: "VALID",
    request: canonicalRequest,
  };
}

/**
 * Builds polite, context-aware clarification questions based on missing fields.
 */
function generateClarificationPrompt(
  missingFields: string[],
  context: { origin?: string; destination?: string }
): string {
  const parts: string[] = [];

  const hasOrigin = !missingFields.includes("origin");
  const hasDest = !missingFields.includes("destination");

  if (missingFields.includes("origin") && missingFields.includes("destination")) {
    parts.push("Where will you be flying from, and what is your destination?");
  } else if (missingFields.includes("origin")) {
    const toClause = hasDest ? ` to ${context.destination}` : "";
    parts.push(`What city or airport will you be departing from for your trip${toClause}?`);
  } else if (missingFields.includes("destination")) {
    const fromClause = hasOrigin ? ` from ${context.origin}` : "";
    parts.push(`Where would you like to fly to${fromClause}?`);
  }

  const needDate = missingFields.includes("departure_date");
  const needPass = missingFields.includes("passengers");
  const needCabin = missingFields.includes("cabin_class");

  if (needPass && needCabin) {
    parts.push("How many passengers are travelling, and which cabin class would you like (Economy, Premium Economy, Business, or First)?");
  } else if (needPass) {
    parts.push("How many passengers will be travelling?");
  } else if (needCabin) {
    parts.push("Which cabin class would you prefer (Economy, Premium Economy, Business, or First)?");
  }

  if (needDate && (hasOrigin || hasDest)) {
    parts.push("What specific date would you like to travel?");
  }

  return parts.length === 1 ? parts[0] : `I can help with that. ${parts.join(" ")}`;
}
