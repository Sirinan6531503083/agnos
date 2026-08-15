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
    <header className="sticky top-4 z-50">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl rounded-3xl border border-slate-100 bg-white/90 backdrop-blur-md px-4 py-3 shadow-sm flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f6efd] shadow-sm shadow-blue-500/20 group-hover:bg-blue-700 transition">
            <HeartPulse className="h-5 w-5 text-white" />
          </div>

          <div>
            <p className="text-base font-bold tracking-tight text-slate-900">AGNOS</p>
            <p className="text-[10px] font-medium tracking-[0.18em] text-slate-400">
              HEALTHCARE SYSTEM
            </p>
          </div>
        </Link>

        {/* ตัวเลือกเปลี่ยนภาษา */}
        <LanguageToggle currentLang={lang} onLanguageChange={handleLangSwitch} />
        </div>
      </div>
    </header>
  );
}
