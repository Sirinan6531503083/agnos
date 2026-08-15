"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, UserRound } from "lucide-react";
import Header from "../../components/ui/Header";
import PatientForm from "../../components/patient/PatientForm";
import { translations, Language } from "@/lib/i18n";

export default function PatientPage() {
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

      <div className="mx-auto min-h-[calc(100vh-136px)] w-full max-w-5xl px-4 py-3 sm:px-6 lg:px-8">
        <section className="py-2 sm:py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-blue-600 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t.backToHome}
          </Link>

          <div className="mt-3 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/5">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl text-slate-900">
                {t.patientFormTitle}
              </h1>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                {t.patientPageDesc}
              </p>
            </div>
          </div>
        </section>

        {/* Patient Intake Form Component */}
        <div className="mt-2">
          <PatientForm />
        </div>
      </div>

      <footer className="border-t border-slate-200/60 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-[11px] text-slate-400">
            AGNOS Healthcare System &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </main>
  );
}