"use client";

import React, { useState, useEffect } from "react";
import { Plane, Calendar, Users, Armchair, ArrowRightLeft, Search } from "lucide-react";
import { FlightSearchRequest, CabinClass } from "@/lib/types/flight";

interface FlightSearchFormProps {
  initialValues?: Partial<FlightSearchRequest>;
  onSubmit: (formData: any) => void;
  isLoading?: boolean;
}

export function FlightSearchForm({
  initialValues,
  onSubmit,
  isLoading = false,
}: FlightSearchFormProps) {
  const [origin, setOrigin] = useState("Lagos (LOS)");
  const [destination, setDestination] = useState("Dubai (DXB)");
  const [departureDate, setDepartureDate] = useState("2026-09-12");
  const [adults, setAdults] = useState(3);
  const [children, setChildren] = useState(0);
  const [cabinClass, setCabinClass] = useState<CabinClass>("business");

  // Sync when initial values change from conversational extraction
  useEffect(() => {
    if (initialValues) {
      if (initialValues.origin) {
        setOrigin(`${initialValues.origin.city} (${initialValues.origin.iataCode})`);
      }
      if (initialValues.destination) {
        setDestination(`${initialValues.destination.city} (${initialValues.destination.iataCode})`);
      }
      if (initialValues.departureDate) {
        setDepartureDate(initialValues.departureDate);
      }
      if (initialValues.passengers) {
        setAdults(initialValues.passengers.adults || 1);
        setChildren(initialValues.passengers.children || 0);
      }
      if (initialValues.cabinClass) {
        setCabinClass(initialValues.cabinClass);
      }
    }
  }, [initialValues]);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      origin,
      destination,
      departure_date: departureDate,
      passengers: {
        adults,
        children,
        infants: 0,
      },
      cabin_class: cabinClass,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-storm-200/80 shadow-storm-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-storm-100">
        <div>
          <h3 className="text-base font-bold text-storm flex items-center space-x-2">
            <span>Structured Flight Search</span>
          </h3>
          <p className="text-xs text-storm-500">Fast entry for travel agents and exact itineraries</p>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-storm-100 text-storm-700 uppercase">
          Agent Mode
        </span>
      </div>

      {/* Row 1: Origin, Swap, Destination */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
        {/* Origin */}
        <div className="md:col-span-5 relative">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-storm-600 mb-1">
            From (Origin)
          </label>
          <div className="relative">
            <Plane className="w-4 h-4 text-storm-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Lagos, LOS"
              required
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-storm-200 bg-storm-50/50 text-sm font-semibold text-storm focus:bg-white focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-all"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex justify-center pt-4 md:pt-4">
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap origin and destination"
            className="w-9 h-9 rounded-full bg-storm-50 hover:bg-storm-100 text-storm-600 border border-storm-200 flex items-center justify-center transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Destination */}
        <div className="md:col-span-5 relative">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-storm-600 mb-1">
            To (Destination)
          </label>
          <div className="relative">
            <Plane className="w-4 h-4 text-storm-400 absolute left-3.5 top-1/2 -translate-y-1/2 transform rotate-90" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Dubai, DXB"
              required
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-storm-200 bg-storm-50/50 text-sm font-semibold text-storm focus:bg-white focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Row 2: Date, Passengers, Cabin */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Date */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-storm-600 mb-1">
            Departure Date
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-storm-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-storm-200 bg-storm-50/50 text-sm font-semibold text-storm focus:bg-white focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-all"
            />
          </div>
        </div>

        {/* Passengers */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-storm-600 mb-1">
            Passengers
          </label>
          <div className="relative">
            <Users className="w-4 h-4 text-storm-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={adults}
              onChange={(e) => setAdults(parseInt(e.target.value, 10))}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-storm-200 bg-storm-50/50 text-sm font-semibold text-storm focus:bg-white focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-all"
            >
              <option value={1}>1 Adult (Solo)</option>
              <option value={2}>2 Adults</option>
              <option value={3}>3 Adults</option>
              <option value={4}>4 Adults</option>
              <option value={5}>5 Adults</option>
            </select>
          </div>
        </div>

        {/* Cabin Class */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-storm-600 mb-1">
            Cabin Class
          </label>
          <div className="relative">
            <Armchair className="w-4 h-4 text-storm-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={cabinClass}
              onChange={(e) => setCabinClass(e.target.value as CabinClass)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-storm-200 bg-storm-50/50 text-sm font-semibold text-storm focus:bg-white focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-all"
            >
              <option value="economy">Economy</option>
              <option value="premium_economy">Premium Economy</option>
              <option value="business">Business Class</option>
              <option value="first">First Class</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary CTA (Section 21: Background #02EFF0, Text #0F282F) */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide bg-cyan text-storm hover:bg-cyan-500 shadow-cyan-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-storm border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>SEARCH FLIGHTS</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
