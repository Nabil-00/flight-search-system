"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, ShieldCheck, Plane, Search } from "lucide-react";

interface LoadingStateProps {
  currentStage?: "interpreting" | "normalizing" | "searching" | "alternatives";
  requestedDate?: string;
  routeText?: string;
}

export function LoadingState({
  currentStage = "searching",
  requestedDate,
  routeText,
}: LoadingStateProps) {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const t1 = setTimeout(() => setActiveStep(2), 600);
    const t2 = setTimeout(() => setActiveStep(3), 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const steps = [
    {
      id: 1,
      title: "AI Interpretation",
      desc: "DeepSeek extracting route, cabin, passengers & date",
      icon: Sparkles,
    },
    {
      id: 2,
      title: "Deterministic Validation",
      desc: "Checking canonical schema, IATA codes & business rules",
      icon: ShieldCheck,
    },
    {
      id: 3,
      title: "Duffel Availability Search",
      desc: requestedDate ? `Searching live offers for ${requestedDate}` : "Querying Duffel Test API sandbox",
      icon: Plane,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-8 border border-storm-100 shadow-storm-card text-center max-w-xl mx-auto my-6">
      <div className="relative w-16 h-16 mx-auto mb-5">
        <div className="absolute inset-0 rounded-2xl bg-cyan/20 animate-ping" />
        <div className="relative w-16 h-16 rounded-2xl bg-storm flex items-center justify-center text-cyan shadow-cyan-sm border border-cyan/40">
          <Search className="w-8 h-8 animate-pulse" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-storm mb-1">
        Searching Available Flights
      </h3>
      {routeText && (
        <p className="text-sm font-semibold text-storm-600 mb-6 font-mono">
          {routeText}
        </p>
      )}

      {/* Progress Steps */}
      <div className="space-y-3 text-left mt-6">
        {steps.map((step) => {
          const Icon = step.icon;
          const isDone = activeStep > step.id;
          const isCurrent = activeStep === step.id;

          return (
            <div
              key={step.id}
              className={`flex items-start p-3 rounded-xl transition-all duration-300 ${
                isCurrent
                  ? "bg-storm-50 border border-cyan/40 shadow-sm"
                  : isDone
                  ? "bg-storm-50/50 opacity-90"
                  : "opacity-40"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center mr-3 mt-0.5 shrink-0 ${
                  isCurrent
                    ? "bg-cyan text-storm font-bold shadow-cyan-sm animate-pulse"
                    : isDone
                    ? "bg-storm text-white"
                    : "bg-storm-200 text-storm-600"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isCurrent ? "text-storm font-bold" : "text-storm-700"}`}>
                    {step.title}
                  </span>
                  {isDone && <span className="text-[10px] font-bold text-cyan-700 uppercase">✓ Verified</span>}
                  {isCurrent && <span className="text-[10px] font-bold text-cyan-600 uppercase animate-pulse">Running...</span>}
                </div>
                <p className="text-[11px] text-storm-500 truncate">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
