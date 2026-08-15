"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HeartPulse } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import { Language } from "@/lib/i18n";

interface HeaderProps {
  onLanguageChange?: (lang: Language) => void;
}

export default function Header({ onLanguageChange }: HeaderProps) {
  const [lang, setLang] = useState<Language>("th");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = (localStorage.getItem("agnos_lang") as Language) || "th";
      setLang(savedLang);
    }
  }, []);

  const handleLangSwitch = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("agnos_lang", newLang);
      window.dispatchEvent(new Event("agnos_lang_change"));
    }
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f6efd] shadow-sm shadow-blue-500/20 group-hover:bg-blue-700 transition">
            <HeartPulse className="h-5 w-5 text-white" />
          </div>

          <div>
            <p className="text-base font-bold tracking-tight text-slate-900">AGNOS</p>
            <p className="text-[10px] font-medium tracking-[0.18em] text-slate-400">
              HEALTHCARE SYSTEM
            </p>
          </div>
        </Link>

        {/* Language Switcher on Far Right of Header */}
        <LanguageToggle currentLang={lang} onLanguageChange={handleLangSwitch} />
      </div>
    </header>
  );
}
