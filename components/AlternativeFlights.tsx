"use client";

import React, { useState } from "react";
import { Calendar, AlertCircle, ArrowLeft, ArrowRight, Plane, Clock } from "lucide-react";
import { FlightOffer } from "@/lib/types/flight";

interface AlternativeFlightsProps {
  requestedDate: string;
  alternatives: {
    previous_day: FlightOffer[];
    next_day: FlightOffer[];
  };
}

export function AlternativeFlights({
  requestedDate,
  alternatives,
}: AlternativeFlightsProps) {
  const [activeTab, setActiveTab] = useState<"previous" | "next">(
    alternatives.next_day.length > 0 ? "next" : "previous"
  );

  const prevOffers = alternatives.previous_day || [];
  const nextOffers = alternatives.next_day || [];
  const totalAlternatives = prevOffers.length + nextOffers.length;

  const formatDateLabel = (isoDate?: string) => {
    if (!isoDate) return "";
    try {
      const d = new Date(`${isoDate}T00:00:00Z`);
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    } catch {
      return isoDate;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return isoString.substring(11, 16) || "12:00";
    }
  };

  // If both D-1 and D+1 have no flights
  if (totalAlternatives === 0) {
    return (
      <div className="bg-white rounded-2xl border border-storm-200 p-8 text-center max-w-xl mx-auto my-6 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-storm">No Flight Availability</h3>
        <p className="text-xs text-storm-500 mt-1 max-w-md mx-auto">
          No suitable flights were found for your requested date ({formatDateLabel(requestedDate)}) or for adjacent dates (D-1 and D+1).
        </p>
        <div className="mt-4 text-xs font-medium text-storm-600 bg-storm-50 p-3 rounded-xl inline-block border border-storm-100">
          Tip: Try changing cabin class, choosing a different destination hub, or searching a wider date range.
        </div>
      </div>
    );
  }

  const currentOffers = activeTab === "previous" ? prevOffers : nextOffers;
  const prevDate = prevOffers[0]?.departure.split("T")[0];
  const nextDate = nextOffers[0]?.departure.split("T")[0];

  return (
    <div className="space-y-4 my-6">
      {/* Notice Banner */}
      <div className="bg-gradient-to-r from-storm to-storm-700 text-white rounded-2xl p-5 shadow-storm-card border border-storm-600">
        <div className="flex items-start space-x-3.5">
          <div className="w-9 h-9 rounded-xl bg-cyan/20 text-cyan flex items-center justify-center shrink-0 border border-cyan/40">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              No Direct Availability on {formatDateLabel(requestedDate)}
            </h4>
            <p className="text-xs text-storm-200 mt-0.5 leading-relaxed">
              We could not find flights on your exact departure date. Per business rules (BR-005), we automatically searched adjacent dates and found <span className="text-cyan font-bold">{totalAlternatives} alternative flight{totalAlternatives > 1 ? "s" : ""}</span>:
            </p>
          </div>
        </div>

        {/* Date Selector Tabs */}
        <div className="flex space-x-2 mt-4 pt-3 border-t border-storm-600/80">
          <button
            onClick={() => setActiveTab("previous")}
            disabled={prevOffers.length === 0}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === "previous"
                ? "bg-cyan text-storm shadow-cyan-sm"
                : prevOffers.length === 0
                ? "opacity-40 cursor-not-allowed bg-storm-800 text-storm-400"
                : "bg-storm-800/80 hover:bg-storm-700 text-storm-100"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Day (D-1)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-storm-900/40">
              {prevOffers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("next")}
            disabled={nextOffers.length === 0}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === "next"
                ? "bg-cyan text-storm shadow-cyan-sm"
                : nextOffers.length === 0
                ? "opacity-40 cursor-not-allowed bg-storm-800 text-storm-400"
                : "bg-storm-800/80 hover:bg-storm-700 text-storm-100"
            }`}
          >
            <span>Next Day (D+1)</span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-storm-900/40">
              {nextOffers.length}
            </span>
          </button>
        </div>
      </div>

      {/* Alternative Offers List */}
      <div className="grid gap-3">
        {currentOffers.map((offer) => (
          <div
            key={offer.offerId}
            className="bg-white rounded-2xl border border-storm-200/80 p-5 shadow-sm hover:shadow-storm-card transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5 min-w-[200px]">
                <div className="w-11 h-11 rounded-xl bg-storm text-cyan flex items-center justify-center font-mono font-bold text-sm">
                  {offer.airlineCode || offer.airline.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h5 className="text-sm font-bold text-storm">{offer.airline}</h5>
                  <p className="text-xs text-storm-500 font-mono">{offer.flightNumber}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-center flex-1 px-2">
                <div className="text-left sm:text-right">
                  <span className="text-lg font-bold font-mono text-storm block">
                    {formatTime(offer.departure)}
                  </span>
                  <span className="text-xs font-mono text-storm-600 block">{offer.origin}</span>
                </div>

                <div className="flex flex-col items-center px-4 min-w-[120px]">
                  <span className="text-[11px] text-storm-500 font-medium flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-storm-400" />
                    <span>{offer.duration || "6h 15m"}</span>
                  </span>
                  <div className="relative w-full flex items-center my-1">
                    <div className="w-full h-0.5 bg-storm-200" />
                    <Plane className="w-3.5 h-3.5 text-cyan-600 absolute left-1/2 -translate-x-1/2" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 uppercase">
                    {offer.stops === 0 ? "Direct" : `${offer.stops} Stop`}
                  </span>
                </div>

                <div className="text-right sm:text-left">
                  <span className="text-lg font-bold font-mono text-storm block">
                    {formatTime(offer.arrival)}
                  </span>
                  <span className="text-xs font-mono text-storm-600 block">{offer.destination}</span>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end space-x-4 pt-3 md:pt-0 border-t md:border-t-0 border-storm-100">
                <div className="text-left md:text-right">
                  <span className="text-xl font-extrabold text-storm font-mono block">
                    ${offer.price.amount}
                  </span>
                  <span className="text-[10px] text-storm-400 font-medium block">
                    {offer.cabinClass}
                  </span>
                </div>

                <button
                  onClick={() => alert(`Alternative flight selected: ${offer.airline} (${offer.flightNumber}) for $${offer.price.amount}`)}
                  className="px-4 py-2 rounded-xl font-bold text-xs bg-cyan text-storm hover:bg-cyan-500 shadow-sm transition-all"
                >
                  Select Alternative
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
