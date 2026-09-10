"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { ConversationPanel, ChatMessage } from "@/components/ConversationPanel";
import { FlightSearchForm } from "@/components/FlightSearchForm";
import { RequestSummary } from "@/components/RequestSummary";
import { FlightResults } from "@/components/FlightResults";
import { AlternativeFlights } from "@/components/AlternativeFlights";
import { LoadingState } from "@/components/LoadingState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { FlightSearchRequest, AvailabilityDecision, SystemErrorCode } from "@/lib/types/flight";
import { Sparkles, FormInput, MessageSquareQuote } from "lucide-react";

export default function FlightSearchPage() {
  const [activeMode, setActiveMode] = useState<"conversational" | "structured">("conversational");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init_1",
      sender: "assistant",
      text: "Hello! Where would you like to fly? You can tell me your travel requirements naturally (e.g., 'I need 3 business class tickets from Lagos to Dubai next Saturday').",
      timestamp: "Just now",
    },
  ]);

  const [currentRequest, setCurrentRequest] = useState<FlightSearchRequest | null>(null);
  const [searchDecision, setSearchDecision] = useState<AvailabilityDecision | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState<string>("");
  const [systemError, setSystemError] = useState<{
    code?: SystemErrorCode | string;
    message?: string;
  } | null>(null);

  // Handles natural language message from ConversationPanel
  const handleNaturalLanguageMessage = async (userMessage: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsgObj: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "customer",
      text: userMessage,
      timestamp,
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setIsLoading(true);
    setSystemError(null);
    setSearchDecision(null);

    try {
      // Step 1: Call /api/normalize
      const normalizeRes = await fetch("/api/normalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const normData = await normalizeRes.json();

      if (normData.status === "INCOMPLETE") {
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `asst_${Date.now()}`,
            sender: "assistant",
            text: normData.clarification_prompt || "I need a few more details to search for flights.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isClarification: true,
            missingFields: normData.missing_fields,
          },
        ]);
        return;
      }

      if (normData.status === "AMBIGUOUS" || normData.status === "INVALID") {
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `asst_${Date.now()}`,
            sender: "assistant",
            text: normData.clarification_prompt || normData.error_message || "Unable to validate flight request.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isClarification: true,
          },
        ]);
        if (normData.error_code) {
          setSystemError({
            code: normData.error_code,
            message: normData.error_message,
          });
        }
        return;
      }

      if (normData.status === "VALID" && normData.request) {
        const canonical: FlightSearchRequest = normData.request;
        setCurrentRequest(canonical);
        setLoadingRoute(`${canonical.origin.city} (${canonical.origin.iataCode}) → ${canonical.destination.city} (${canonical.destination.iataCode})`);

        setMessages((prev) => [
          ...prev,
          {
            id: `asst_${Date.now()}`,
            sender: "assistant",
            text: `Understood! Searching flights for ${canonical.passengers.adults} traveler(s) from ${canonical.origin.city} (${canonical.origin.iataCode}) to ${canonical.destination.city} (${canonical.destination.iataCode}) on ${canonical.departureDate} in ${canonical.cabinClass} class.`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);

        // Step 2: Execute Search Orchestrator via /api/flights/search
        await executeFlightSearch(canonical);
      }
    } catch (err: any) {
      console.error(err);
      setIsLoading(false);
      setSystemError({
        code: "INTERNAL_ERROR",
        message: err.message || "Failed to communicate with the normalization API.",
      });
    }
  };

  // Handles structured form submission
  const handleStructuredSubmit = async (formData: any) => {
    setIsLoading(true);
    setSystemError(null);
    setSearchDecision(null);

    try {
      // Direct call to /api/flights/search
      await executeFlightSearch(formData);
    } catch (err: any) {
      console.error(err);
      setIsLoading(false);
      setSystemError({
        code: "INTERNAL_ERROR",
        message: err.message || "Failed to execute flight search.",
      });
    }
  };

  // Internal search execution routine
  const executeFlightSearch = async (requestPayload: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setSystemError({
          code: data.error_code || "DUFFEL_PROVIDER_ERROR",
          message: data.message || "Flight provider error occurred.",
        });
        setIsLoading(false);
        return;
      }

      setSearchDecision(data as AvailabilityDecision);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setSystemError({
        code: "INTERNAL_ERROR",
        message: err.message || "Failed to query flight search endpoint.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFB]">
      <Header />

      {/* Hero Section with Brand Gradient */}
      <section className="bg-gradient-to-r from-storm via-storm-700 to-storm-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-storm-700 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan/15 text-cyan border border-cyan/30 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DeepSeek AI + Duffel Aggregator</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Intelligent Flight Search & Availability
            </h1>
            <p className="text-sm sm:text-base text-storm-200 mt-2 max-w-2xl leading-relaxed">
              Express requirements in natural language. Our system normalizes and validates parameters, searches Duffel, and automatically finds alternatives on D-1 / D+1 dates if your requested date is unavailable.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="bg-storm-800/90 p-1.5 rounded-2xl border border-storm-700 flex items-center space-x-1 shrink-0">
            <button
              onClick={() => setActiveMode("conversational")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMode === "conversational"
                  ? "bg-cyan text-storm shadow-cyan-sm"
                  : "text-storm-300 hover:text-white"
              }`}
            >
              <MessageSquareQuote className="w-4 h-4" />
              <span>Conversational</span>
            </button>
            <button
              onClick={() => setActiveMode("structured")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMode === "structured"
                  ? "bg-cyan text-storm shadow-cyan-sm"
                  : "text-storm-300 hover:text-white"
              }`}
            >
              <FormInput className="w-4 h-4" />
              <span>Structured Form</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Panel (Conversation or Structured Form) */}
          <div className="lg:col-span-6 space-y-6">
            {activeMode === "conversational" ? (
              <ConversationPanel
                messages={messages}
                onSendMessage={handleNaturalLanguageMessage}
                isLoading={isLoading}
                onSelectScenario={(prompt) => handleNaturalLanguageMessage(prompt)}
              />
            ) : (
              <FlightSearchForm
                initialValues={currentRequest || undefined}
                onSubmit={handleStructuredSubmit}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Right Column: Summaries, Loading State, and Flight Results */}
          <div className="lg:col-span-6 space-y-4">
            {/* System Error Banner */}
            {systemError && (
              <ErrorMessage
                errorCode={systemError.code}
                message={systemError.message}
                onRetry={() => {
                  if (currentRequest) executeFlightSearch(currentRequest);
                }}
              />
            )}

            {/* Normalized Canonical Request Card */}
            {currentRequest && (
              <RequestSummary
                request={currentRequest}
                onEdit={() => setActiveMode("structured")}
              />
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <LoadingState
                requestedDate={currentRequest?.departureDate}
                routeText={loadingRoute}
              />
            )}

            {/* Exact Date Available Offers */}
            {!isLoading && searchDecision && searchDecision.status === "AVAILABLE" && (
              <FlightResults
                offers={searchDecision.offers || []}
                requestedDate={searchDecision.requested_date}
              />
            )}

            {/* Alternative Flights (D-1 and D+1) or No Availability */}
            {!isLoading && searchDecision && (searchDecision.status === "ALTERNATIVES_FOUND" || searchDecision.status === "NO_AVAILABILITY") && (
              <AlternativeFlights
                requestedDate={searchDecision.requested_date}
                alternatives={searchDecision.alternatives || { previous_day: [], next_day: [] }}
              />
            )}

            {/* Default Placeholder when Idle */}
            {!isLoading && !searchDecision && !systemError && !currentRequest && (
              <div className="bg-white rounded-2xl border border-dashed border-storm-200 p-8 text-center text-storm-400 my-6">
                <div className="w-12 h-12 rounded-2xl bg-storm-50 text-storm-400 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-cyan-600" />
                </div>
                <h4 className="text-sm font-bold text-storm-700">Ready for Your Flight Request</h4>
                <p className="text-xs text-storm-500 mt-1 max-w-sm mx-auto">
                  Type a natural language request on the left or select a demo preset to see AI extraction, canonical normalization, and live Duffel availability in action.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-storm border-t border-storm-700/60 py-6 text-center text-xs text-storm-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AI-Assisted Conversational Flight Search & Availability Platform</span>
          <span className="font-mono text-[11px] text-cyan">Next.js • DeepSeek via OpenRouter • Duffel Sandbox</span>
        </div>
      </footer>
    </div>
  );
}
