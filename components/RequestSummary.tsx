"use client";

import React from "react";
import { Plane, Users, Calendar, Armchair, ArrowRight, CheckCircle2 } from "lucide-react";
import { FlightSearchRequest } from "@/lib/types/flight";

interface RequestSummaryProps {
  request: FlightSearchRequest;
  onEdit?: () => void;
}

export function RequestSummary({ request, onEdit }: RequestSummaryProps) {
  const totalPass = request.passengers.adults + request.passengers.children + request.passengers.infants;

  const formatCabin = (c: string) => {
    switch (c) {
      case "business": return "Business Class";
      case "first": return "First Class";
      case "premium_economy": return "Premium Economy";
      default: return "Economy";
    }
  };

  const formatDate = (d: string) => {
    try {
      const parsed = new Date(`${d}T00:00:00Z`);
      return parsed.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-storm-200/80 shadow-storm-card overflow-hidden my-4">
      {/* Top Header Banner */}
      <div className="bg-storm px-5 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Normalized Flight Request
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-[11px] font-medium text-cyan bg-cyan/10 px-2.5 py-0.5 rounded-full border border-cyan/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Validated Canonical Data</span>
        </div>
      </div>

      {/* Main Parameters Grid */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-storm-100">
          {/* Origin -> Destination */}
          <div className="flex items-center space-x-3.5">
            <div className="text-left">
              <span className="text-2xl font-mono font-extrabold text-storm tracking-tight">
                {request.origin.iataCode}
              </span>
              <p className="text-xs text-storm-500 font-medium truncate max-w-[120px]">
                {request.origin.city}
              </p>
            </div>

            <div className="flex flex-col items-center px-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-storm-400">One-way</span>
              <div className="flex items-center space-x-1 text-cyan-600 my-0.5">
                <div className="w-6 h-px bg-storm-200" />
                <Plane className="w-4 h-4 text-cyan-500" />
                <ArrowRight className="w-3 h-3 text-cyan-500" />
              </div>
            </div>

            <div className="text-left">
              <span className="text-2xl font-mono font-extrabold text-storm tracking-tight">
                {request.destination.iataCode}
              </span>
              <p className="text-xs text-storm-500 font-medium truncate max-w-[120px]">
                {request.destination.city}
              </p>
            </div>
          </div>

          {/* Quick Edit if provided */}
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-xs font-semibold text-storm-600 hover:text-cyan-700 underline self-start sm:self-center"
            >
              Adjust Parameters
            </button>
          )}
        </div>

        {/* Details Pills */}
        <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
          <div className="flex items-center space-x-2 bg-storm-50/70 p-2.5 rounded-xl border border-storm-100/80">
            <Calendar className="w-4 h-4 text-storm-600 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-semibold text-storm-400">Departure</p>
              <p className="font-bold text-storm truncate">{formatDate(request.departureDate)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-storm-50/70 p-2.5 rounded-xl border border-storm-100/80">
            <Users className="w-4 h-4 text-storm-600 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-semibold text-storm-400">Passengers</p>
              <p className="font-bold text-storm">
                {totalPass} {totalPass === 1 ? "Traveler" : "Travelers"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-storm-50/70 p-2.5 rounded-xl border border-storm-100/80">
            <Armchair className="w-4 h-4 text-storm-600 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-semibold text-storm-400">Cabin</p>
              <p className="font-bold text-storm truncate">{formatCabin(request.cabinClass)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
