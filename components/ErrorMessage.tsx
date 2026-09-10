"use client";

import React from "react";
import { AlertTriangle, RefreshCw, KeyRound, Clock, ServerOff, UserX, Compass } from "lucide-react";
import { SystemErrorCode } from "@/lib/types/flight";

interface ErrorMessageProps {
  errorCode?: SystemErrorCode | string;
  message?: string;
  details?: Record<string, unknown>;
  onRetry?: () => void;
}

export function ErrorMessage({
  errorCode,
  message,
  details,
  onRetry,
}: ErrorMessageProps) {
  const getErrorMeta = () => {
    switch (errorCode) {
      case "DUFFEL_AUTH_ERROR":
        return {
          title: "Provider Authentication Error",
          icon: KeyRound,
          bannerBg: "bg-amber-50 border-amber-200 text-amber-900",
          iconBg: "bg-amber-100 text-amber-800",
          advice: "The Duffel API key is invalid or unauthorized. Please verify DUFFEL_ACCESS_TOKEN in .env.local.",
        };
      case "DUFFEL_TIMEOUT":
        return {
          title: "Provider Search Timeout",
          icon: Clock,
          bannerBg: "bg-orange-50 border-orange-200 text-orange-900",
          iconBg: "bg-orange-100 text-orange-800",
          advice: "The flight aggregator took too long to respond. The network may be experiencing latency.",
        };
      case "DUFFEL_RATE_LIMIT":
        return {
          title: "Rate Limit Exceeded",
          icon: AlertTriangle,
          bannerBg: "bg-yellow-50 border-yellow-200 text-yellow-900",
          iconBg: "bg-yellow-100 text-yellow-800",
          advice: "Too many flight requests sent to Duffel sandbox. Please wait a moment before trying again.",
        };
      case "DUFFEL_PROVIDER_ERROR":
        return {
          title: "Duffel Provider Failure",
          icon: ServerOff,
          bannerBg: "bg-red-50 border-red-200 text-red-900",
          iconBg: "bg-red-100 text-red-800",
          advice: "The upstream airline GDS encountered an issue. Notice: BR-009 dictates this is distinct from 'No flights available'.",
        };
      case "AI_SERVICE_ERROR":
        return {
          title: "AI Extraction Service Unavailable",
          icon: ServerOff,
          bannerBg: "bg-indigo-50 border-indigo-200 text-indigo-900",
          iconBg: "bg-indigo-100 text-indigo-800",
          advice: "DeepSeek via OpenRouter is currently unreachable. You can use the structured search form directly.",
        };
      case "INVALID_PASSENGER_COUNT":
        return {
          title: "Invalid Passenger Count",
          icon: UserX,
          bannerBg: "bg-rose-50 border-rose-200 text-rose-900",
          iconBg: "bg-rose-100 text-rose-800",
          advice: "Flight requests require between 1 and 9 passengers, with infants not exceeding adult passengers.",
        };
      case "AMBIGUOUS_LOCATION":
        return {
          title: "Ambiguous Location",
          icon: Compass,
          bannerBg: "bg-sky-50 border-sky-200 text-sky-900",
          iconBg: "bg-sky-100 text-sky-800",
          advice: "The requested city or airport name has multiple interpretations. Please specify the 3-letter IATA airport code.",
        };
      default:
        return {
          title: "System Notification",
          icon: AlertTriangle,
          bannerBg: "bg-storm-50 border-storm-200 text-storm-900",
          iconBg: "bg-storm-100 text-storm-800",
          advice: "An issue occurred while processing your request.",
        };
    }
  };

  const meta = getErrorMeta();
  const Icon = meta.icon;

  return (
    <div className={`rounded-2xl border p-5 max-w-xl mx-auto my-4 shadow-sm ${meta.bannerBg}`}>
      <div className="flex items-start space-x-3.5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-bold tracking-tight">{meta.title}</h4>
            {errorCode && (
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/70 border border-current/20">
                {errorCode}
              </span>
            )}
          </div>
          <p className="text-xs mt-1 leading-relaxed opacity-95">{message || meta.advice}</p>
          <div className="text-[11px] mt-2 pt-2 border-t border-current/15 opacity-85 font-medium">
            💡 {meta.advice}
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3.5 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-current/20 text-storm hover:bg-storm-50 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Search</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
