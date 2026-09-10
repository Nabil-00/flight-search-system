import { NextRequest, NextResponse } from "next/server";
import { extractFlightData } from "@/lib/ai/deepseek";
import { validateFlightRequest } from "@/lib/validation/flight-request";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        {
          status: "INVALID",
          error_message: "Message is required and must be a non-empty string.",
          clarification_prompt: "Please tell me where you'd like to fly, from where, and your desired dates.",
        },
        { status: 400 }
      );
    }

    // Step 2: AI extraction
    const aiResult = await extractFlightData(message);

    // If AI service completely failed with error_code
    if (aiResult.error_code === "AI_SERVICE_ERROR" && !aiResult.data.origin && !aiResult.data.destination) {
      return NextResponse.json(
        {
          status: "INVALID",
          error_code: "AI_SERVICE_ERROR",
          error_message: aiResult.error_message || "AI Extraction service is temporarily unavailable.",
        },
        { status: 503 }
      );
    }

    // Step 3 & 4: Normalization and deterministic validation
    // Use reference date for test predictability if needed
    const validation = validateFlightRequest(aiResult.data, {
      referenceDate: new Date(),
    });

    return NextResponse.json({
      ...validation,
      extracted_raw: aiResult.data,
      ai_source: aiResult.source,
    });
  } catch (err: any) {
    console.error("Error in /api/normalize:", err);
    return NextResponse.json(
      {
        status: "INVALID",
        error_code: "INTERNAL_ERROR",
        error_message: err.message || "An unexpected error occurred during request normalization.",
      },
      { status: 500 }
    );
  }
}
