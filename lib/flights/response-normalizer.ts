import { FlightOffer, CabinClass } from "../types/flight";

/**
 * Section 12: Response Normalizer
 * Converts raw provider response into the internal canonical FlightOffer.
 */
export function normalizeDuffelOffer(rawOffer: any, fallbackCabin: CabinClass = "economy"): FlightOffer {
  const slice = rawOffer.slices?.[0];
  const segments = slice?.segments || [];
  const firstSegment = segments[0] || {};
  const lastSegment = segments[segments.length - 1] || firstSegment;

  const airlineName =
    rawOffer.owner?.name ||
    firstSegment.marketing_carrier?.name ||
    firstSegment.operating_carrier?.name ||
    "Global Airways";

  const flightNumber =
    (firstSegment.marketing_carrier?.iata_code || "FL") +
    (firstSegment.marketing_carrier_flight_number || "101");

  const departure = firstSegment.departing_at || slice?.departing_at || new Date().toISOString();
  const arrival = lastSegment.arriving_at || slice?.arriving_at || new Date().toISOString();

  const stops = Math.max(0, segments.length - 1);

  // Format ISO duration like "PT6H30M" to "6h 30m"
  const formattedDuration = formatIsoDuration(slice?.duration);

  // Cabin class determination
  const cabinClass =
    firstSegment.passengers?.[0]?.cabin_class ||
    rawOffer.cabin_class ||
    fallbackCabin;

  return {
    offerId: rawOffer.id || `offer_${Math.random().toString(36).substring(2, 9)}`,
    airline: airlineName,
    airlineCode: firstSegment.marketing_carrier?.iata_code || rawOffer.owner?.iata_code,
    flightNumber,
    origin: slice?.origin?.iata_code || firstSegment.origin?.iata_code || "XXX",
    destination: slice?.destination?.iata_code || lastSegment.destination?.iata_code || "YYY",
    departure,
    arrival,
    duration: formattedDuration,
    stops,
    cabinClass,
    price: {
      amount: rawOffer.total_amount ? Number(rawOffer.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "1,250.00",
      currency: rawOffer.total_currency || "USD",
    },
    aircraft: firstSegment.aircraft?.name || undefined,
    slices: segments.map((seg: any) => ({
      origin: seg.origin?.iata_code || "",
      destination: seg.destination?.iata_code || "",
      departure: seg.departing_at || "",
      arrival: seg.arriving_at || "",
      flightNumber: `${seg.marketing_carrier?.iata_code || ""}${seg.marketing_carrier_flight_number || ""}`,
      airline: seg.marketing_carrier?.name || airlineName,
      duration: formatIsoDuration(seg.duration),
    })),
  };
}

/**
 * Converts ISO 8601 duration "PT6H30M" or minutes to "6h 30m"
 */
function formatIsoDuration(isoDuration?: string | null): string {
  if (!isoDuration) return "6h 15m";
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return isoDuration;
  const hours = match[1] ? `${match[1]}h` : "";
  const minutes = match[2] ? ` ${match[2]}m` : "";
  const res = `${hours}${minutes}`.trim();
  return res || "5h 45m";
}
