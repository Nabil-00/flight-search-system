import { describe, it, expect } from "vitest";
import { fallbackDeterministicExtractor } from "../../lib/ai/deepseek";

describe("AI Natural Language Extraction (Deterministic Fallback Engine)", () => {
  it("extracts origin and destination from 'I need 2 tickets from Lagos to London.'", () => {
    const res = fallbackDeterministicExtractor("I need 2 tickets from Lagos to London.");
    expect(res.origin?.toLowerCase()).toBe("lagos");
    expect(res.destination?.toLowerCase()).toBe("london");
    expect(res.passengers).toBe("2");
  });

  it("extracts entities from 'Book a flight for three people from Lagos to Dubai.'", () => {
    const res = fallbackDeterministicExtractor("Book a flight for three people from Lagos to Dubai.");
    expect(res.origin?.toLowerCase()).toBe("lagos");
    expect(res.destination?.toLowerCase()).toBe("dubai");
    expect(res.passengers).toBe("three");
  });

  it("extracts cabin and colloquial passengers from 'Can you find business class for me and my wife?'", () => {
    const res = fallbackDeterministicExtractor("Can you find business class for me and my wife?");
    expect(res.cabin_class).toBe("business");
    expect(res.passengers).toBe(2);
  });

  it("extracts relative date from 'I want to travel from Abuja to London next Friday.'", () => {
    const res = fallbackDeterministicExtractor("I want to travel from Abuja to London next Friday.");
    expect(res.origin?.toLowerCase()).toBe("abuja");
    expect(res.destination?.toLowerCase()).toBe("london");
    expect(res.departure_date?.toLowerCase()).toBe("next friday");
  });

  it("identifies incomplete input 'I need to go to London next week.' without guessing origin", () => {
    const res = fallbackDeterministicExtractor("I need to go to London next week.");
    expect(res.destination?.toLowerCase()).toBe("london");
    expect(res.origin).toBeNull();
    expect(res.passengers).toBeNull();
    expect(res.cabin_class).toBeNull();
    expect(res.departure_date?.toLowerCase()).toBe("next week");
  });
});
