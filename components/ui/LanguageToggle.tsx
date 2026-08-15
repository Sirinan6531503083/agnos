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
  const nextLang: Language = currentLang === "en" ? "th" : "en";

  return (
    <button
      type="button"
      onClick={() => onLanguageChange(nextLang)}
      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:border-blue-200 hover:text-blue-600 active:scale-95 sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs"
    >
      <Globe className="h-3 w-3 text-slate-400 sm:h-3.5 sm:w-3.5" />
      <span>{currentLang === "en" ? "🇬🇧 EN" : "🇹🇭 TH"}</span>
    </button>
  );
}