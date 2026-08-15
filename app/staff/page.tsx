"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Stethoscope } from "lucide-react";
import Header from "../../components/ui/Header";
import StaffDashboard from "../../components/staff/StaffDashboard";
import { translations, Language } from "@/lib/i18n";

export default function StaffPage() {
  const [lang, setLang] = useState<Language>("th");
  const t = translations[lang];

  useEffect(() => {
    const syncLang = () => {
      const saved = localStorage.getItem("agnos_lang") as Language;
      if (saved === "en" || saved === "th") {
        setLang(saved);
      }
    };
    syncLang();
    window.addEventListener("agnos_lang_change", syncLang);
    window.addEventListener("storage", syncLang);
    return () => {
      window.removeEventListener("agnos_lang_change", syncLang);
      window.removeEventListener("storage", syncLang);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f5f9ff] text-slate-900">
      <Header />

      <div className="mx-auto min-h-[calc(100vh-136px)] w-full max-w-5xl px-4 py-3 sm:px-6 lg:px-8 mt-6">
        <section className="py-2 sm:py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-blue-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t.backToHome}
          </Link>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm">
                <Stethoscope className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  {t.staffTitle}
                </h1>
                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                  {t.staffPageDesc}
                </p>
              </div>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {t.liveConnected}
            </div>
          </div>
        </section>

        {/* แถบข้อมูลขนาดเล็ก */}
        <div className="mt-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 flex items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">รหัสคิว:</p>
                <p className="text-sm font-semibold text-slate-800">P-----</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {"Realtime Active"}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <StaffDashboard />
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-200/60 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-[11px] text-slate-400">AGNOS Healthcare System &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </main>
  );
}