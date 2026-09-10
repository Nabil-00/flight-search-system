import { AirportLocation } from "../types/flight";

export interface AirportEntry extends AirportLocation {
  aliases?: string[];
}

/**
 * Standard Airport Database for canonical location normalization
 */
export const AIRPORT_DATABASE: AirportEntry[] = [
  // Nigeria
  {
    city: "Lagos",
    iataCode: "LOS",
    airportName: "Murtala Muhammed International Airport",
    aliases: ["murtala muhammed", "murtala muhammad", "murtala muhammed airport", "los", "lagos airport", "mma", "mma2"],
  },
  {
    city: "Abuja",
    iataCode: "ABV",
    airportName: "Nnamdi Azikiwe International Airport",
    aliases: ["nnamdi azikiwe", "nnamdi azikiwe airport", "abuja airport", "abv"],
  },
  {
    city: "Port Harcourt",
    iataCode: "PHC",
    airportName: "Port Harcourt International Airport",
    aliases: ["port harcourt", "phc", "omagwa"],
  },
  {
    city: "Kano",
    iataCode: "KAN",
    airportName: "Mallam Aminu Kano International Airport",
    aliases: ["aminu kano", "kano airport", "kan"],
  },
  {
    city: "Enugu",
    iataCode: "ENU",
    airportName: "Akanu Ibiam International Airport",
    aliases: ["akanu ibiam", "enugu airport", "enu"],
  },
  {
    city: "Asaba",
    iataCode: "ABB",
    airportName: "Asaba International Airport",
    aliases: ["asaba airport", "abb"],
  },

  // Middle East
  {
    city: "Dubai",
    iataCode: "DXB",
    airportName: "Dubai International Airport",
    aliases: ["dubai", "dxb", "dubai international"],
  },
  {
    city: "Doha",
    iataCode: "DOH",
    airportName: "Hamad International Airport",
    aliases: ["doha", "doh", "hamad international"],
  },
  {
    city: "Abu Dhabi",
    iataCode: "AUH",
    airportName: "Zayed International Airport",
    aliases: ["abu dhabi", "auh", "zayed international"],
  },
  {
    city: "Riyadh",
    iataCode: "RUH",
    airportName: "King Khalid International Airport",
    aliases: ["riyadh", "ruh", "king khalid"],
  },
  {
    city: "Jeddah",
    iataCode: "JED",
    airportName: "King Abdulaziz International Airport",
    aliases: ["jeddah", "jed", "king abdulaziz"],
  },

  // United Kingdom & Europe
  {
    city: "London",
    iataCode: "LHR",
    airportName: "London Heathrow Airport",
    aliases: ["heathrow", "london heathrow", "lhr", "heathrow airport"],
  },
  {
    city: "London",
    iataCode: "LGW",
    airportName: "London Gatwick Airport",
    aliases: ["gatwick", "london gatwick", "lgw", "gatwick airport"],
  },
  {
    city: "London",
    iataCode: "STN",
    airportName: "London Stansted Airport",
    aliases: ["stansted", "london stansted", "stn"],
  },
  {
    city: "Manchester",
    iataCode: "MAN",
    airportName: "Manchester Airport",
    aliases: ["manchester", "man"],
  },
  {
    city: "Paris",
    iataCode: "CDG",
    airportName: "Paris Charles de Gaulle Airport",
    aliases: ["charles de gaulle", "cdg", "roissy", "paris cdg"],
  },
  {
    city: "Paris",
    iataCode: "ORY",
    airportName: "Paris Orly Airport",
    aliases: ["orly", "ory", "paris orly"],
  },
  {
    city: "Amsterdam",
    iataCode: "AMS",
    airportName: "Amsterdam Airport Schiphol",
    aliases: ["schiphol", "ams", "amsterdam airport"],
  },
  {
    city: "Frankfurt",
    iataCode: "FRA",
    airportName: "Frankfurt Airport",
    aliases: ["frankfurt", "fra"],
  },
  {
    city: "Istanbul",
    iataCode: "IST",
    airportName: "Istanbul Airport",
    aliases: ["istanbul", "ist"],
  },

  // North America
  {
    city: "New York",
    iataCode: "JFK",
    airportName: "John F. Kennedy International Airport",
    aliases: ["jfk", "kennedy airport", "john f kennedy"],
  },
  {
    city: "New York",
    iataCode: "EWR",
    airportName: "Newark Liberty International Airport",
    aliases: ["newark", "ewr"],
  },
  {
    city: "Atlanta",
    iataCode: "ATL",
    airportName: "Hartsfield-Jackson Atlanta International Airport",
    aliases: ["atlanta", "atl", "hartsfield"],
  },
  {
    city: "Chicago",
    iataCode: "ORD",
    airportName: "O'Hare International Airport",
    aliases: ["chicago", "ord", "o'hare", "ohare"],
  },
  {
    city: "Toronto",
    iataCode: "YYZ",
    airportName: "Toronto Pearson International Airport",
    aliases: ["toronto", "yyz", "pearson"],
  },

  // Africa
  {
    city: "Accra",
    iataCode: "ACC",
    airportName: "Kotoka International Airport",
    aliases: ["accra", "acc", "kotoka"],
  },
  {
    city: "Nairobi",
    iataCode: "NBO",
    airportName: "Jomo Kenyatta International Airport",
    aliases: ["nairobi", "nbo", "jomo kenyatta"],
  },
  {
    city: "Johannesburg",
    iataCode: "JNB",
    airportName: "O. R. Tambo International Airport",
    aliases: ["johannesburg", "jnb", "or tambo", "tambo"],
  },
  {
    city: "Cairo",
    iataCode: "CAI",
    airportName: "Cairo International Airport",
    aliases: ["cairo", "cai"],
  },
  {
    city: "Addis Ababa",
    iataCode: "ADD",
    airportName: "Addis Ababa Bole International Airport",
    aliases: ["addis ababa", "add", "bole"],
  },

  // Asia
  {
    city: "Singapore",
    iataCode: "SIN",
    airportName: "Singapore Changi Airport",
    aliases: ["singapore", "sin", "changi"],
  },
  {
    city: "Tokyo",
    iataCode: "HND",
    airportName: "Tokyo Haneda Airport",
    aliases: ["haneda", "hnd", "tokyo haneda"],
  },
  {
    city: "Tokyo",
    iataCode: "NRT",
    airportName: "Narita International Airport",
    aliases: ["narita", "nrt"],
  },
];

export interface LocationResolutionResult {
  location?: AirportLocation;
  isAmbiguous?: boolean;
  candidates?: AirportLocation[];
  error?: string;
}

/**
 * Normalizes a raw string (city name, airport name, alias, or 3-letter IATA code)
 * into a canonical AirportLocation.
 */
export function normalizeLocation(raw: string | undefined | null): LocationResolutionResult {
  if (!raw || typeof raw !== "string" || !raw.trim()) {
    return { error: "Missing location" };
  }

  const cleaned = raw.trim().replace(/^from\s+/i, "").replace(/^to\s+/i, "").trim();
  const upper = cleaned.toUpperCase();

  // 1. Direct IATA 3-letter code match
  if (/^[A-Z]{3}$/.test(upper)) {
    const directIata = AIRPORT_DATABASE.find(item => item.iataCode === upper);
    if (directIata) {
      return { location: directIata };
    }
    return {
      location: {
        city: upper,
        iataCode: upper,
        airportName: `${upper} Airport`,
      }
    };
  }

  const normalizedLower = cleaned.toLowerCase().replace(/airport$/i, "").trim();

  // 2. Exact match on aliases or airportName
  for (const entry of AIRPORT_DATABASE) {
    if (entry.aliases?.some(a => a === cleaned.toLowerCase() || a === normalizedLower)) {
      return { location: entry };
    }
    if (entry.airportName?.toLowerCase().includes(normalizedLower) && normalizedLower.length > 3) {
      return { location: entry };
    }
  }

  // 3. Exact match on city name
  const exactCityMatches = AIRPORT_DATABASE.filter(
    item => item.city.toLowerCase() === cleaned.toLowerCase() || item.city.toLowerCase() === normalizedLower
  );

  if (exactCityMatches.length === 1) {
    return { location: exactCityMatches[0] };
  }

  if (exactCityMatches.length > 1) {
    return {
      location: exactCityMatches[0],
      candidates: exactCityMatches,
    };
  }

  // 4. Partial / Substring match
  const partialMatches = AIRPORT_DATABASE.filter(item =>
    item.city.toLowerCase().includes(normalizedLower) ||
    item.airportName?.toLowerCase().includes(normalizedLower) ||
    item.aliases?.some(a => a.includes(normalizedLower))
  );

  if (partialMatches.length === 1) {
    return { location: partialMatches[0] };
  }

  if (partialMatches.length > 1) {
    const firstCity = partialMatches[0].city;
    const sameCity = partialMatches.every(m => m.city === firstCity);
    if (sameCity) {
      return { location: partialMatches[0], candidates: partialMatches };
    }
    return {
      isAmbiguous: true,
      candidates: partialMatches,
      error: `Location '${raw}' is ambiguous. Did you mean ${partialMatches.map(m => `${m.city} (${m.iataCode})`).join(", ")}?`
    };
  }

  return {
    error: `Unable to resolve airport or city for '${raw}'`
  };
}
