import { PassengerCount } from "../types/flight";

const NUMBER_WORDS: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  single: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

export interface PassengerNormalizationResult {
  passengers?: PassengerCount;
  isValid: boolean;
  errorCode?: "INVALID_PASSENGER_COUNT";
  errorMessage?: string;
}

/**
 * Normalizes raw passenger input (number, string phrase, or object)
 * into a canonical PassengerCount object.
 */
export function normalizePassengers(
  raw: unknown
): PassengerNormalizationResult {
  if (raw === undefined || raw === null || raw === "") {
    return {
      isValid: false,
      errorMessage: "Passenger count is missing",
    };
  }

  // Case 1: Already an object with adults/children/infants
  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    const adults = typeof obj.adults === "number" ? obj.adults : parseInt(String(obj.adults || 0), 10);
    const children = typeof obj.children === "number" ? obj.children : parseInt(String(obj.children || 0), 10);
    const infants = typeof obj.infants === "number" ? obj.infants : parseInt(String(obj.infants || 0), 10);

    return validatePassengerCount({
      adults: isNaN(adults) ? 0 : adults,
      children: isNaN(children) ? 0 : children,
      infants: isNaN(infants) ? 0 : infants,
    });
  }

  // Case 2: Direct Number
  if (typeof raw === "number") {
    return validatePassengerCount({ adults: raw, children: 0, infants: 0 });
  }

  // Case 3: String representation
  const str = String(raw).trim().toLowerCase();

  // Negative number check e.g. "-2"
  if (/-\s*\d+/.test(str)) {
    return {
      isValid: false,
      errorCode: "INVALID_PASSENGER_COUNT",
      errorMessage: "Passenger count cannot be negative",
    };
  }

  // "me and my wife" / "me and my husband" / "myself and my partner" / "2 of us"
  if (/me\s+and\s+my\s+(wife|husband|partner|friend|colleague)/i.test(str) || /2 of us/i.test(str)) {
    return validatePassengerCount({ adults: 2, children: 0, infants: 0 });
  }

  // "just me" / "for myself" / "solo"
  if (/(just me|myself|solo|alone|1 person)/i.test(str)) {
    return validatePassengerCount({ adults: 1, children: 0, infants: 0 });
  }

  // Check for multi-category: e.g. "2 adults and 1 child"
  const adultMatch = str.match(/(\d+|one|two|three|four|five|six|seven|eight|nine)\s*(?:adults?|passengers?|people|tickets?|travelers?)/i);
  const childMatch = str.match(/(\d+|one|two|three|four|five|six|seven|eight|nine)\s*(?:child(?:ren)?|kids?)/i);
  const infantMatch = str.match(/(\d+|one|two|three|four|five|six|seven|eight|nine)\s*(?:infants?|bab(?:y|ies))/i);

  if (adultMatch || childMatch || infantMatch) {
    const parseWordOrNum = (val?: string) => {
      if (!val) return 0;
      const lower = val.toLowerCase();
      if (NUMBER_WORDS[lower] !== undefined) return NUMBER_WORDS[lower];
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 0 : parsed;
    };

    const adults = adultMatch ? parseWordOrNum(adultMatch[1]) : (childMatch || infantMatch ? 1 : 0);
    const children = childMatch ? parseWordOrNum(childMatch[1]) : 0;
    const infants = infantMatch ? parseWordOrNum(infantMatch[1]) : 0;

    return validatePassengerCount({ adults, children, infants });
  }

  // Check for simple number word: e.g. "two", "three"
  for (const [word, num] of Object.entries(NUMBER_WORDS)) {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(str)) {
      return validatePassengerCount({ adults: num, children: 0, infants: 0 });
    }
  }

  // Check for plain digits
  const digitMatch = str.match(/\b(\d+)\b/);
  if (digitMatch) {
    const count = parseInt(digitMatch[1], 10);
    return validatePassengerCount({ adults: count, children: 0, infants: 0 });
  }

  return {
    isValid: false,
    errorCode: "INVALID_PASSENGER_COUNT",
    errorMessage: `Could not determine passenger count from '${raw}'`,
  };
}

function validatePassengerCount(passengers: PassengerCount): PassengerNormalizationResult {
  const { adults, children, infants } = passengers;
  const total = adults + children + infants;

  if (adults < 1) {
    return {
      isValid: false,
      errorCode: "INVALID_PASSENGER_COUNT",
      errorMessage: "At least one adult passenger is required.",
    };
  }

  if (adults < 0 || children < 0 || infants < 0) {
    return {
      isValid: false,
      errorCode: "INVALID_PASSENGER_COUNT",
      errorMessage: "Passenger count cannot be negative.",
    };
  }

  if (total > 9) {
    return {
      isValid: false,
      errorCode: "INVALID_PASSENGER_COUNT",
      errorMessage: "Flight searches cannot exceed 9 passengers per booking.",
    };
  }

  if (infants > adults) {
    return {
      isValid: false,
      errorCode: "INVALID_PASSENGER_COUNT",
      errorMessage: "The number of infants cannot exceed the number of adult passengers.",
    };
  }

  return {
    isValid: true,
    passengers,
  };
}
