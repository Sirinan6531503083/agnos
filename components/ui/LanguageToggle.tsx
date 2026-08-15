"use client";

import React from "react";
import { Globe } from "lucide-react";
import { Language } from "@/lib/i18n";

interface LanguageToggleProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function LanguageToggle({
  currentLang,
  onLanguageChange,
}: LanguageToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 p-1 shadow-sm backdrop-blur-sm">
      <Globe className="ml-2 h-3.5 w-3.5 text-slate-400" />
      <button
        type="button"
        onClick={() => onLanguageChange("en")}
        className={`rounded-full px-2.5 py-1 text-xs font-bold transition-all ${
          currentLang === "en"
            ? "bg-blue-600 text-white shadow-sm"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        🇬🇧 EN
      </button>
      <button
        type="button"
        onClick={() => onLanguageChange("th")}
        className={`rounded-full px-2.5 py-1 text-xs font-bold transition-all ${
          currentLang === "th"
            ? "bg-blue-600 text-white shadow-sm"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        🇹🇭 TH
      </button>
    </div>
  );
}
