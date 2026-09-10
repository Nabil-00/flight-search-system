import { ExtractedFlightData } from "../types/flight";

export interface AIExtractionResult {
  data: ExtractedFlightData;
  source: "openrouter_deepseek" | "deterministic_fallback";
  error_code?: "AI_SERVICE_ERROR";
  error_message?: string;
}

const SYSTEM_EXTRACTION_PROMPT = `
You are an expert flight search data extraction assistant.
Your sole job is to interpret the customer's natural-language flight request and extract flight parameters into a strict JSON object.

Extract only what is explicitly mentioned or clearly implied:
- "origin": The departure city, airport name, or airport code (e.g., "Lagos", "LOS"), or null if missing.
- "destination": The arrival city, airport name, or airport code (e.g., "Dubai", "DXB"), or null if missing.
- "passengers": Passenger count or description (e.g., 3, "2 people", "me and my wife"), or null if missing.
- "cabin_class": Cabin class (e.g., "economy", "premium_economy", "business", "first"), or null if missing.
- "departure_date": Departure date or day expression (e.g., "next Saturday", "2026-09-12", "tomorrow"), or null if missing.

Rules:
1. Do NOT invent missing values. If a field is not specified, set it to null.
2. Return ONLY valid JSON in this exact shape:
{
  "origin": string | null,
  "destination": string | null,
  "passengers": number | string | null,
  "cabin_class": string | null,
  "departure_date": string | null
}
`;

/**
 * Extracts structured flight search entities from natural language customer requests.
 */
export async function extractFlightData(message: string): Promise<AIExtractionResult> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.DEEPSEEK_API_KEY;

  if (apiKey && apiKey.trim() && !apiKey.includes("your_openrouter_api_key_here")) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://flight-search-system.vercel.app",
          "X-Title": "Conversational Flight Search",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat",
          models: ["deepseek/deepseek-chat", "deepseek/deepseek-r1", "nvidia/nemotron-3.5-lightning:free"],
          messages: [
            { role: "system", content: SYSTEM_EXTRACTION_PROMPT },
            { role: "user", content: message },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API responded with status ${response.status}`);
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from DeepSeek via OpenRouter");
      }

      const parsed = JSON.parse(content);
      return {
        source: "openrouter_deepseek",
        data: {
          origin: parsed.origin || null,
          destination: parsed.destination || null,
          passengers: parsed.passengers ?? null,
          cabin_class: parsed.cabin_class || null,
          departure_date: parsed.departure_date || null,
          raw_user_message: message,
        },
      };
    } catch (err: any) {
      console.warn("OpenRouter DeepSeek call failed:", err?.message);
      return {
        source: "openrouter_deepseek",
        error_code: "AI_SERVICE_ERROR",
        error_message: `AI service error: ${err?.message || "Failed to communicate with DeepSeek"}`,
        data: fallbackDeterministicExtractor(message),
      };
    }
  }

  // Offline / deterministic fallback mode
  const extracted = fallbackDeterministicExtractor(message);
  return {
    source: "deterministic_fallback",
    data: extracted,
  };
}

/**
 * Deterministic pattern-based extractor used when offline or as a fallback.
 */
export function fallbackDeterministicExtractor(message: string): ExtractedFlightData {
  const result: ExtractedFlightData = {
    origin: null,
    destination: null,
    passengers: null,
    cabin_class: null,
    departure_date: null,
    raw_user_message: message,
  };

  let cleaned = message.trim();
  cleaned = cleaned.replace(/\b(i\s+need|i\s+want|i\s+would\s+like|please\s+book|book|find)\s+to\s+go\s+to\b/i, "to ");
  cleaned = cleaned.replace(/\b(i\s+need|i\s+want|i\s+would\s+like|please|can\s+you)\s+(to\s+go\s+to|to\s+fly\s+to|to\s+travel\s+to)\b/i, "to ");
  cleaned = cleaned.replace(/\b(to\s+go\s+to|to\s+fly\s+to|to\s+travel\s+to)\b/i, "to ");

  // 1. Passenger count (handles "3 tickets", "3 business class tickets", "two passengers", etc.)
  if (/me\s+and\s+my\s+(wife|husband|partner|friend)/i.test(cleaned) || /2 of us/i.test(cleaned)) {
    result.passengers = 2;
  } else if (/(just me|solo|myself)/i.test(cleaned)) {
    result.passengers = 1;
  } else {
    const passMatch = cleaned.match(/(\d+|one|two|three|four|five|six|seven|eight|nine)\s*(?:(?:business|economy|first|premium)?\s*(?:class)?\s*)?(?:tickets?|passengers?|people|adults?|travelers?)/i);
    if (passMatch) {
      result.passengers = passMatch[1];
    }
  }

  // 2. Cabin class
  if (/\b(business(\s+class)?|biz\s+class)\b/i.test(cleaned)) {
    result.cabin_class = "business";
  } else if (/\b(first(\s+class)?|suite)\b/i.test(cleaned)) {
    result.cabin_class = "first";
  } else if (/\b(premium\s+economy|premium)\b/i.test(cleaned)) {
    result.cabin_class = "premium_economy";
  } else if (/\b(economy(\s+class)?|coach|standard)\b/i.test(cleaned)) {
    result.cabin_class = "economy";
  }

  // 3. Origin & Destination: "from <Origin> to <Destination>"
  const fromToMatch = cleaned.match(/from\s+([A-Za-z\s]+?)\s+to\s+([A-Za-z\s]+?)(?:,|\.|\s+next|\s+tomorrow|\s+on|\s+this|\s+in|\s+for|\s+business|\s+economy|\s+first|$)/i);
  if (fromToMatch) {
    result.origin = cleanLocationString(fromToMatch[1]);
    result.destination = cleanLocationString(fromToMatch[2]);
  } else {
    // Check "to <Destination>"
    const toMatch = cleaned.match(/\bto\s+([A-Za-z\s]+?)(?:,|\.|\s+next|\s+tomorrow|\s+on|\s+this|\s+in|\s+for|\s+business|\s+economy|\s+first|$)/i);
    if (toMatch) {
      result.destination = cleanLocationString(toMatch[1]);
    }
    // Check "from <Origin>"
    const fromMatch = cleaned.match(/\bfrom\s+([A-Za-z\s]+?)(?:,|\.|\s+to|\s+next|\s+tomorrow|\s+on|\s+this|\s+in|\s+for|\s+business|\s+economy|\s+first|$)/i);
    if (fromMatch) {
      result.origin = cleanLocationString(fromMatch[1]);
    }
  }

  // 4. Departure date
  if (/\btomorrow\b/i.test(cleaned)) {
    result.departure_date = "tomorrow";
  } else if (/\bday\s+after\s+tomorrow\b/i.test(cleaned)) {
    result.departure_date = "day after tomorrow";
  } else {
    const nextDayMatch = cleaned.match(/\bnext\s+(saturday|sunday|monday|tuesday|wednesday|thursday|friday)\b/i);
    if (nextDayMatch) {
      result.departure_date = nextDayMatch[0];
    } else {
      const dayNextWeekMatch = cleaned.match(/\b(saturday|sunday|monday|tuesday|wednesday|thursday|friday)\s+next\s+week\b/i);
      if (dayNextWeekMatch) {
        result.departure_date = dayNextWeekMatch[0];
      } else {
        const thisDayMatch = cleaned.match(/\b(this\s+)?(saturday|sunday|monday|tuesday|wednesday|thursday|friday)\b/i);
        if (thisDayMatch) {
          result.departure_date = thisDayMatch[0];
        } else {
          // Explicit date like "18th September" or "18 September" or "September 18"
          const explicitDateMatch = cleaned.match(/(\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+\d{4})?)/i);
          if (explicitDateMatch) {
            result.departure_date = explicitDateMatch[1];
          } else {
            // ISO date
            const isoMatch = cleaned.match(/\b\d{4}-\d{2}-\d{2}\b/);
            if (isoMatch) {
              result.departure_date = isoMatch[0];
            } else if (/next\s+week/i.test(cleaned)) {
              result.departure_date = "next week";
            }
          }
        }
      }
    }
  }

  return result;
}

function cleanLocationString(str: string): string {
  return str.replace(/^(go|fly|travel)\s+to\s+/i, "").replace(/^to\s+/i, "").replace(/^from\s+/i, "").trim();
}
