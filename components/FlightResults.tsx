"use client";

import React, { useState } from "react";
import { Plane, Clock, ShieldAlert, ArrowRight, Check, ChevronDown, ChevronUp } from "lucide-react";
import { FlightOffer } from "@/lib/types/flight";

interface FlightResultsProps {
  offers: FlightOffer[];
  requestedDate: string;
}

export function FlightResults({ offers, requestedDate }: FlightResultsProps) {
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [expandedOffer, setExpandedOffer] = useState<string | null>(null);

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

  const formatDateLabel = (isoDate: string) => {
    try {
      const d = new Date(`${isoDate}T00:00:00Z`);
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return isoDate;
    }
  };

  if (!offers || offers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-storm-100 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan inline-block shadow-cyan-sm" />
            <h3 className="text-lg font-bold text-storm">
              Available Flights
            </h3>
          </div>
          <p className="text-xs text-storm-500 font-medium mt-0.5">
            Flights found for <strong className="text-storm-800">{formatDateLabel(requestedDate)}</strong>
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-storm-100 text-storm-800 self-start sm:self-auto">
          {offers.length} {offers.length === 1 ? "Offer" : "Offers"} Available
        </span>
      </div>

      {/* Flight Cards Grid */}
      <div className="grid gap-4">
        {offers.map((offer) => {
          const isSelected = selectedOffer === offer.offerId;
          const isExpanded = expandedOffer === offer.offerId;

          return (
            <div
              key={offer.offerId}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-storm-card ${
                isSelected
                  ? "border-cyan ring-2 ring-cyan/40 bg-cyan-50/20"
                  : "border-storm-200/80 hover:border-storm-300"
              }`}
            >
              <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Airline & Flight Number */}
                  <div className="flex items-center space-x-3.5 min-w-[200px]">
                    <div className="w-12 h-12 rounded-xl bg-storm text-cyan flex items-center justify-center font-mono font-bold text-sm shadow-sm border border-storm-700">
                      {offer.airlineCode || offer.airline.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-storm tracking-tight">
                        {offer.airline}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-storm-500 mt-0.5">
                        <span className="font-mono font-medium">{offer.flightNumber}</span>
                        {offer.aircraft && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[130px]">{offer.aircraft}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Flight Times & Timeline */}
                  <div className="flex items-center justify-between sm:justify-center flex-1 max-w-md px-2">
                    {/* Departure */}
                    <div className="text-left sm:text-right">
                      <span className="text-xl font-bold font-mono text-storm block">
                        {formatTime(offer.departure)}
                      </span>
                      <span className="text-xs font-mono font-bold text-storm-600 block">
                        {offer.origin}
                      </span>
                    </div>

                    {/* Flight Duration & Stops */}
                    <div className="flex flex-col items-center px-4 min-w-[120px]">
                      <span className="text-[11px] text-storm-500 font-medium flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-storm-400" />
                        <span>{offer.duration || "6h 30m"}</span>
                      </span>

                      <div className="relative w-full flex items-center my-1">
                        <div className="w-full h-0.5 bg-storm-200" />
                        <Plane className="w-3.5 h-3.5 text-cyan-600 absolute left-1/2 -translate-x-1/2" />
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          offer.stops === 0
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {offer.stops === 0 ? "Direct" : `${offer.stops} Stop${offer.stops > 1 ? "s" : ""}`}
                      </span>
                    </div>

                    {/* Arrival */}
                    <div className="text-right sm:text-left">
                      <span className="text-xl font-bold font-mono text-storm block">
                        {formatTime(offer.arrival)}
                      </span>
                      <span className="text-xs font-mono font-bold text-storm-600 block">
                        {offer.destination}
                      </span>
                    </div>
                  </div>

                  {/* Cabin & Price & CTA */}
                  <div className="flex items-center justify-between md:justify-end space-x-4 pt-3 md:pt-0 border-t md:border-t-0 border-storm-100">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] font-semibold text-storm-400 uppercase tracking-wider block">
                        {offer.cabinClass}
                      </span>
                      <span className="text-xl font-extrabold text-storm font-mono tracking-tight block">
                        ${offer.price.amount}
                      </span>
                      <span className="text-[10px] text-storm-400 font-medium block">
                        Total per traveler
                      </span>
                    </div>

                    {/* Primary CTA (Section 21: bg #02EFF0, text #0F282F) */}
                    <button
                      onClick={() => setSelectedOffer(offer.offerId)}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-sm flex items-center space-x-1.5 ${
                        isSelected
                          ? "bg-storm text-cyan border border-cyan/40 shadow-cyan-sm"
                          : "bg-cyan text-storm hover:bg-cyan-500 hover:shadow-cyan-sm"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <>
                          <span>Select Flight</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Optional toggle for breakdown */}
                {offer.slices && offer.slices.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-storm-50 flex justify-end">
                    <button
                      onClick={() => setExpandedOffer(isExpanded ? null : offer.offerId)}
                      className="text-[11px] text-storm-500 hover:text-storm-800 font-medium flex items-center space-x-1"
                    >
                      <span>{isExpanded ? "Hide flight segments" : "View flight segments"}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Expandable Segments */}
              {isExpanded && offer.slices && (
                <div className="bg-storm-50/70 p-4 border-t border-storm-100 text-xs">
                  <h5 className="font-bold text-storm mb-2">Flight Segment Details</h5>
                  <div className="space-y-2">
                    {offer.slices.map((slice, sIdx) => (
                      <div key={sIdx} className="bg-white p-3 rounded-lg border border-storm-100 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-storm">{slice.airline} ({slice.flightNumber})</span>
                          <p className="text-storm-500 text-[11px]">{slice.origin} → {slice.destination}</p>
                        </div>
                        <div className="text-right text-storm-600 text-[11px]">
                          <p>Depart: {formatTime(slice.departure)}</p>
                          <p>Arrive: {formatTime(slice.arrival)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
