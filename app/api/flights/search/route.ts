import { NextRequest, NextResponse } from "next/server";
import { FlightSearchOrchestrator } from "@/lib/flights/search-orchestrator";
import { FlightSearchRequest, AirportLocation } from "@/lib/types/flight";
import { normalizeLocation } from "@/lib/normalization/location";
import { normalizeCabinClass } from "@/lib/normalization/cabin";
import { normalizePassengers } from "@/lib/normalization/passenger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Map input to canonical FlightSearchRequest shape
    const canonical = parseCanonicalRequest(body);
    if (!canonical) {
      return NextResponse.json(
        {
          error: true,
          error_code: "INTERNAL_ERROR",
          message: "Malformed flight search request payload. Please verify required fields.",
        },
        { status: 400 }
      );
    }

    const orchestrator = new FlightSearchOrchestrator();
    const result = await orchestrator.search(canonical);

    if (result.systemError) {
      const statusCode = result.systemError.error_code === "DUFFEL_TIMEOUT" ? 504 : 502;
      return NextResponse.json(result.systemError, { status: statusCode });
    }

    return NextResponse.json(result.decision);
  } catch (err: any) {
    console.error("Error in /api/flights/search:", err);
    return NextResponse.json(
      {
        error: true,
        error_code: "INTERNAL_ERROR",
        message: err.message || "An unexpected error occurred during flight search orchestration.",
      },
      { status: 500 }
    );
  }
}

function parseCanonicalRequest(body: any): FlightSearchRequest | null {
  if (!body) return null;

  // Origin resolution
  let origin: AirportLocation;
  if (typeof body.origin === "object" && body.origin?.iataCode) {
    origin = body.origin;
  } else if (typeof body.origin === "string") {
    const resolved = normalizeLocation(body.origin);
    if (!resolved.location) return null;
    origin = resolved.location;
  } else {
    return null;
  }

  // Destination resolution
  let destination: AirportLocation;
  if (typeof body.destination === "object" && body.destination?.iataCode) {
    destination = body.destination;
  } else if (typeof body.destination === "string") {
    const resolved = normalizeLocation(body.destination);
    if (!resolved.location) return null;
    destination = resolved.location;
  } else {
    return null;
  }

  // Passengers
  const passRes = normalizePassengers(body.passengers);
  if (!passRes.isValid || !passRes.passengers) return null;

  // Cabin
  const cabinRes = normalizeCabinClass(body.cabinClass || body.cabin_class);
  if (!cabinRes.isValid || !cabinRes.cabinClass) return null;

  // Date
  const departureDate = body.departureDate || body.departure_date;
  if (!departureDate || typeof departureDate !== "string") return null;

  return {
    requestId: body.requestId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    origin,
    destination,
    passengers: passRes.passengers,
    cabinClass: cabinRes.cabinClass,
    departureDate,
    tripType: "one_way",
  };
}
