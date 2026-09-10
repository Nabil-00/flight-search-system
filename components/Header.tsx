"use client";

import React from "react";
import { Plane, ShieldCheck, Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="bg-storm border-b border-storm-700/60 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-cyan-200 flex items-center justify-center shadow-cyan-sm text-storm">
            <Plane className="w-6 h-6 transform -rotate-45 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white font-mono">
                AERO<span className="text-cyan">PULSE</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan/15 text-cyan border border-cyan/30">
                AI + Duffel
              </span>
            </div>
            <p className="text-xs text-storm-200">Conversational Flight Search & Availability System</p>
          </div>
        </div>

        {/* System Architecture Badges */}
        <div className="hidden md:flex items-center space-x-6 text-xs text-storm-200">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan" />
            <span>DeepSeek AI NLU</span>
          </div>
          <div className="h-4 w-px bg-storm-700" />
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan" />
            <span>Deterministic Validation</span>
          </div>
          <div className="h-4 w-px bg-storm-700" />
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
            <span className="text-white font-medium">Duffel Test Sandbox</span>
          </div>
        </div>
      </div>
    </header>
  );
}
