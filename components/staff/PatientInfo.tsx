"use client";

import React from "react";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Languages, 
  Globe, 
  Heart, 
  ShieldAlert,
  Flame,
  Calendar,
  Sparkles,
  BookOpen
} from "lucide-react";
import { PatientStatus } from "@/lib/realtime";
import { translations, Language } from "@/lib/i18n";
import Card from "../ui/Card";
import Badge from "../ui/Badge";

interface PatientInfoProps {
  sessionId: string | null;
  formData: Record<string, any> | null;
  activeField: string | null;
  status: PatientStatus | null;
  lastActive: string | null;
  lang?: Language;
}

export default function PatientInfo({
  sessionId,
  formData,
  activeField,
  status,
  lastActive,
  lang = "th",
}: PatientInfoProps) {
  const t = translations[lang];

  // สถานะว่าง: ไม่ได้เลือกผู้ป่วย
  if (!sessionId || !formData) {
    return (
      <Card className="text-center" size="lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
          <BookOpen className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-lg font-bold text-slate-900">{t.noPatientSelected}</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          {t.selectPatientPrompt}
        </p>
      </Card>
    );
  }

  // ตัวช่วยในการจัดรูปแบบค่า
  const formatValue = (val: any) => {
    if (val === undefined || val === null || val === "") return "-";
    return String(val);
  };

  // ตัวกำหนดฟิลด์พร้อมไอคอนและป้ายกำกับ
  const fields = [
    { key: "firstName", label: t.firstName, icon: User },
    { key: "middleName", label: t.middleName, icon: User },
    { key: "lastName", label: t.lastName, icon: User },
    { key: "dob", label: t.dob, icon: Calendar },
    { key: "gender", label: t.gender, icon: User },
    { key: "phone", label: t.phone, icon: Phone },
    { key: "email", label: t.email, icon: Mail },
    { key: "preferredLanguage", label: t.preferredLanguage, icon: Languages },
    { key: "nationality", label: t.nationality, icon: Globe },
    { key: "religion", label: t.religion, icon: Flame },
  ];

  return (
    <Card className="space-y-8" size="md">
      {/* Detail Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              {formData.firstName || formData.lastName
                ? `${formatValue(formData.firstName)} ${formatValue(formData.lastName)}`
                : t.patientIdentityAwaiting}
            </h2>
            <span className="text-xs font-semibold text-slate-400">({sessionId})</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {t.lastUpdate}: {lastActive ? new Date(lastActive).toLocaleTimeString() : "-"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={status === "submitted" ? "green" : status === "inactive" ? "slate" : "blue"}>
            <span className={`h-1.5 w-1.5 rounded-full ${status === "submitted" ? "bg-emerald-500" : status === "inactive" ? "bg-slate-400" : "bg-blue-500 animate-ping"}`} />
            {status === "submitted" ? t.statusSubmitted : status === "inactive" ? t.statusInactive : t.statusFilling}
          </Badge>
        </div>
      </div>

      {/* Grid of Fields */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-500" />
          {t.intakeParticulars}
        </h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {fields.map(({ key, label, icon: Icon }) => {
            const isEditing = activeField === key;
            const value = formData[key];

            return (
              <div 
                key={key} 
                className={`group rounded-2xl border p-4 transition-all duration-300 ${
                  isEditing 
                    ? "border-blue-400 bg-blue-50/20 shadow-sm ring-4 ring-blue-500/5 translate-y-[-2px]" 
                    : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/30"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Icon className={`h-3.5 w-3.5 ${isEditing ? "text-blue-500" : "text-slate-400"}`} />
                    {label}
                  </span>
                  
                  {isEditing && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-600 uppercase bg-blue-100/50 px-2 py-0.5 rounded-full animate-pulse">
                      {t.typingIndicator}
                    </span>
                  )}
                </div>

                <p className={`mt-2.5 text-sm font-semibold tracking-wide ${
                  value ? "text-slate-800" : "text-slate-300 italic font-normal"
                }`}>
                  {formatValue(value)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Address Block */}
      <div className={`rounded-2xl border p-5 transition-all duration-300 ${
        activeField === "address" 
          ? "border-blue-400 bg-blue-50/20 shadow-sm ring-4 ring-blue-500/5" 
          : "border-slate-100"
      }`}>
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <MapPin className={`h-3.5 w-3.5 ${activeField === "address" ? "text-blue-500" : "text-slate-400"}`} />
            {t.address}
          </span>
          {activeField === "address" && (
            <span className="text-[9px] font-bold text-blue-600 uppercase bg-blue-100/50 px-2 py-0.5 rounded-full animate-pulse">
              {t.typingIndicator}
            </span>
          )}
        </div>
        <p className={`mt-3.5 text-sm font-semibold leading-6 ${
          formData.address ? "text-slate-800" : "text-slate-300 italic font-normal"
        }`}>
          {formatValue(formData.address)}
        </p>
      </div>

      {/* Emergency Contact */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Heart className="h-4 w-4 text-rose-500" />
          {t.emergencyInfo}
        </h3>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Contact Name */}
          <div className={`rounded-xl border p-4 bg-white transition-all ${
            activeField === "emergencyName" ? "border-blue-400 ring-2 ring-blue-500/5" : "border-slate-100"
          }`}>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>{t.emergencyName}</span>
              {activeField === "emergencyName" && (
                <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded animate-pulse">{t.typingIndicator}</span>
              )}
            </span>
            <p className={`mt-2 text-sm font-semibold ${
              formData.emergencyName ? "text-slate-800" : "text-slate-300 italic font-normal"
            }`}>
              {formatValue(formData.emergencyName)}
            </p>
          </div>

          {/* Relationship */}
          <div className={`rounded-xl border p-4 bg-white transition-all ${
            activeField === "emergencyRelationship" ? "border-blue-400 ring-2 ring-blue-500/5" : "border-slate-100"
          }`}>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>{t.emergencyRelationship}</span>
              {activeField === "emergencyRelationship" && (
                <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded animate-pulse">{t.typingIndicator}</span>
              )}
            </span>
            <p className={`mt-2 text-sm font-semibold ${
              formData.emergencyRelationship ? "text-slate-800" : "text-slate-300 italic font-normal"
            }`}>
              {formatValue(formData.emergencyRelationship)}
            </p>
          </div>
        </div>
      </div>

      {/* ประกาศด้านความปลอดภัยสำหรับสถานะการส่ง */}
      {status === "submitted" && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-emerald-800 text-xs font-semibold">
          <ShieldAlert className="h-4.5 w-4.5 text-emerald-500" />
          {t.lockedNotice}
        </div>
      )}
    </Card>
  );
}
