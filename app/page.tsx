"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../components/ui/Header";
import { ArrowRight, Stethoscope, UserRound } from "lucide-react";
import { translations, Language } from "@/lib/i18n";

export default function Home() {
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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f5f9ff] text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-200/20 blur-3xl" />
      </div>

      <Header />
      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-8 sm:px-8 lg:px-12 mt-6">
        <section className="flex flex-1 flex-col items-center justify-center py-14 text-center">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            {t.welcomeTitle}{" "}
            <span className="text-blue-600">{t.welcomeBrand}</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
            {t.systemSubtitle}
          </p>

          {/* Role Cards */}
          <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-5 md:grid-cols-2">
            {/* Patient Card */}
            <Link
              href="/patient"
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/10 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:p-8"
            >
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-blue-50 transition-transform duration-500 group-hover:scale-150" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <UserRound className="h-7 w-7" strokeWidth={2} />
                  </div>

                  <ArrowRight className="h-5 w-5 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-600" />
                </div>

                <h2 className="mt-7 text-2xl font-semibold text-slate-900">
                  {t.rolePatient}
                </h2>

                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                  {t.rolePatientDesc}
                </p>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                  {t.continueAsPatient}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>

            {/* Staff Card */}
            <Link
              href="/staff"
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/10 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:p-8"
            >
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-blue-50 transition-transform duration-500 group-hover:scale-150" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <Stethoscope className="h-7 w-7" strokeWidth={2} />
                  </div>

                  <ArrowRight className="h-5 w-5 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-600" />
                </div>

                <h2 className="mt-7 text-2xl font-semibold text-slate-900">
                  {t.roleStaff}
                </h2>

                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                  {t.roleStaffDesc}
                </p>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                  {t.continueAsStaff}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </div>
        </section>
      </div>

      <footer className="relative mt-auto border-t border-slate-200/60 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-[11px] text-slate-400">AGNOS Healthcare System &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}