"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  Search,
  RefreshCw,
  Wifi
} from "lucide-react";

import { realtime, SyncMessage, PatientStatus } from "@/lib/realtime";
import { translations, Language } from "@/lib/i18n";
import LanguageToggle from "../ui/LanguageToggle";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import PatientInfo from "./PatientInfo";
import StatusIndicator from "./StatusIndicator";

interface PatientSession {
  sessionId: string;
  status: PatientStatus;
  patientName: string;
  lastActive: string;
  formData: Record<string, any>;
  activeField: string | null;
}

export default function StaffDashboard() {
  const [sessions, setSessions] = useState<Record<string, PatientSession>>({});
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
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

  // 1. การตรวจสอบสถานะ WebSocket และการเชื่อมต่อคำขอซิงค์
  useEffect(() => {
    const connCheck = setInterval(() => {
      setIsConnected(realtime.isConnected());
    }, 1500);

    const requestSyncOnMount = () => {
      realtime.send("request_sync", "all", {});
    };
    
    const syncTimeout = setTimeout(requestSyncOnMount, 800);
   // การร้องขอการซิงค์เป็นระยะเพื่อให้แน่ใจว่าเจ้าหน้าที่เห็นเซสชันล่าสุดโดยไม่ต้องรีเฟรชด้วยตนเอง
    const periodicSync = setInterval(() => {
      realtime.send("request_sync", "all", {});
    }, 5000);

    // 2. สมัครรับข้อมูลเหตุการณ์แบบเรียลไทม์
    const unsubscribe = realtime.subscribe((msg: SyncMessage) => {
      const { type, sessionId, payload, timestamp } = msg;

      setSessions((prev) => {
        const existing = prev[sessionId] || {
          sessionId,
          status: "filling",
          patientName: "Anonymous Patient",
          lastActive: timestamp,
          formData: {},
          activeField: null,
        };

        const updated = { ...existing };
        updated.lastActive = timestamp;

        switch (type) {
          case "presence":
            updated.status = payload.status;
            if (payload.patientName) {
              updated.patientName = payload.patientName;
            }
            if (payload.formData) {
              updated.formData = { ...updated.formData, ...payload.formData };
            }
            break;

          case "field_update":
            updated.status = "filling";
            updated.formData = {
              ...updated.formData,
              [payload.field]: payload.value,
            };
            break;

          case "field_focus":
            updated.activeField = payload.field;
            break;

          case "sync_response":
            updated.status = payload.status;
            updated.patientName = payload.patientName;
            updated.formData = payload.formData;
            break;

          default:
            break;
        }

        return {
          ...prev,
          [sessionId]: updated,
        };
      });

      setSelectedSessionId((current) => current || sessionId);
    });

    return () => {
      clearInterval(connCheck);
      clearTimeout(syncTimeout);
      clearInterval(periodicSync);
      unsubscribe();
    };
  }, []);

  const handleForceSync = () => {
    realtime.send("request_sync", "all", {});
  };

  const sessionList = Object.values(sessions).sort(
    (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
  );

  const filteredSessions = sessionList.filter(
    (s) =>
      s.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sessionId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = sessionList.filter((s) => s.status === "filling").length;
  const submittedCount = sessionList.filter((s) => s.status === "submitted").length;
  const selectedSession = selectedSessionId ? sessions[selectedSessionId] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">{t.staffTitle}</h1>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatusIndicator
          icon={Activity}
          label={t.activePatients}
          value={`${activeCount}`}
          detail={t.activePatientsDetail}
          tone={activeCount > 0 ? "blue" : "slate"}
        />
        <StatusIndicator
          icon={CheckCircle2}
          label={t.submittedFormsCount}
          value={`${submittedCount}`}
          detail={t.submittedFormsDetail}
          tone={submittedCount > 0 ? "green" : "slate"}
        />
        <StatusIndicator
          icon={Wifi}
          label={t.syncConnection}
          value="Realtime Active"
          detail={t.syncActiveDetail}
          tone="green"
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <div className="flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[500px]">
          {/* Header & Search */}
          <div className="border-b border-slate-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Intake Queue</h2>
                <p className="text-xs text-slate-400">Monitor client session statuses</p>
              </div>

              <button
                onClick={handleForceSync}
                title="Refresh and request sync from active tabs"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 active:scale-95 transition"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Sessions Queue List */}
           <div className="flex-1 overflow-y-auto divide-y divide-slate-50 p-2 max-h-[600px]">
              <Card className="p-0 overflow-hidden min-h-[500px]">
            {filteredSessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active patient sessions found. Open Patient Form in another tab to test.
              </div>
            ) : (
              filteredSessions.map((s) => {
                const isSelected = selectedSessionId === s.sessionId;
                return (
                  <button
                    key={s.sessionId}
                    onClick={() => setSelectedSessionId(s.sessionId)}
                    className={`w-full cursor-pointer rounded-2xl p-4 text-left transition-all ${
                      isSelected
                        ? "bg-blue-50/70 border border-blue-200/60 shadow-sm"
                        : "hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {s.patientName}
                      </span>
                      <Badge
                        tone={s.status === "submitted" ? "green" : s.status === "inactive" ? "slate" : "blue"}
                        className="px-2 py-0.5 text-[10px] font-bold"
                      >
                        {s.status === "submitted" ? t.statusSubmitted : s.status === "inactive" ? t.statusInactive : t.statusFilling}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>ID: {s.sessionId}</span>
                      <span>{new Date(s.lastActive).toLocaleTimeString()}</span>
                    </div>
                  </button>
                );
              })
            )}
              </Card>
          </div>
        </div>

        {/* รายละเอียดข้อมูลผู้ป่วย */}
        <div className="lg:col-span-2">
          <PatientInfo
            sessionId={selectedSession?.sessionId || null}
            formData={selectedSession?.formData || null}
            activeField={selectedSession?.activeField || null}
            status={selectedSession?.status || null}
            lastActive={selectedSession?.lastActive || null}
            lang={lang}
          />
        </div>
      </div>
    </div>
  );
}
