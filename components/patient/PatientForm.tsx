"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  UserRound, 
  CalendarDays, 
  Phone, 
  Mail, 
  MapPin, 
  Languages, 
  Globe, 
  Heart, 
  Sparkles,
  CheckCircle2,
  Wifi
} from "lucide-react";

import { realtime, PatientStatus } from "@/lib/realtime";
import { translations, Language } from "@/lib/i18n";
import LanguageToggle from "../ui/LanguageToggle";
import Card from "../ui/Card";
import Input from "../ui/Input";
import DatePicker from "../ui/DatePicker";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

interface FormState {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  preferredLanguage: string;
  nationality: string;
  emergencyName: string;
  emergencyRelationship: string;
  religion: string;
}

const initialFormState: FormState = {
  firstName: "",
  middleName: "",
  lastName: "",
  dob: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  preferredLanguage: "",
  nationality: "",
  emergencyName: "",
  emergencyRelationship: "",
  religion: "",
};

export default function PatientForm() {
  const [sessionId, setSessionId] = useState<string>("");
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<PatientStatus>("filling");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lang, setLang] = useState<Language>("th");

  const t = translations[lang];

// ข้อมูลอ้างอิงสำหรับตัวจับเวลาดีบาวซ์และตัวจับเวลาการไม่ใช้งาน
  const debounceTimeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      let sid = params.get("sessionId");
      
      if (!sid) {
        sid = localStorage.getItem("agnos_patient_session");
        if (!sid) {
          const randomNum = Math.floor(1000 + Math.random() * 9000);
          sid = `P-${randomNum}`;
          localStorage.setItem("agnos_patient_session", sid);
        }
      }
      
      setSessionId(sid);
      const newUrl = `${window.location.pathname}?sessionId=${sid}`;
      window.history.replaceState({ path: newUrl }, "", newUrl);
    }

    return () => {
      window.removeEventListener("agnos_lang_change", syncLang);
      window.removeEventListener("storage", syncLang);
    };
  }, []);

  const handleLanguageSwitch = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("agnos_lang", newLang);
    }
  };

  //ตั้งค่าตัวรับฟังการเชื่อมต่อแบบเรียลไทม์
  useEffect(() => {
    if (!sessionId) return;

    const connCheck = setInterval(() => {
      setIsConnected(realtime.isConnected());
    }, 1500);

    const sendInitialPresence = () => {
      const pName = `${formData.firstName} ${formData.lastName}`.trim();
      realtime.send("presence", sessionId, {
        status: "filling",
        patientName: pName || "Anonymous Patient",
      });
    };

    const initialTimeout = setTimeout(sendInitialPresence, 500);

    const unsubscribe = realtime.subscribe((msg) => {
      if (msg.type === "request_sync" && (msg.sessionId === sessionId || msg.sessionId === "all")) {
        const pName = `${formData.firstName} ${formData.lastName}`.trim();
        realtime.send("sync_response", sessionId, {
          formData,
          status,
          patientName: pName || "Anonymous Patient",
        });
      }
    });

    resetInactivityTimer();

    const handleUnload = () => {
      realtime.send("presence", sessionId, {
        status: "inactive",
      });
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      clearInterval(connCheck);
      clearTimeout(initialTimeout);
      unsubscribe();
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
      
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      Object.values(debounceTimeoutRefs.current).forEach(clearTimeout);
    };
  }, [sessionId, formData, status]);

  // ตัวตรวจสอบกิจกรรม/การไม่ใช้งานของผู้ใช้
  const resetInactivityTimer = () => {
    if (status === "submitted") return;

    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    if (status === "inactive") {
      setStatus("filling");
      const pName = `${formData.firstName} ${formData.lastName}`.trim();
      realtime.send("presence", sessionId, {
        status: "filling",
        patientName: pName || "Anonymous Patient",
      });
    }

    inactivityTimeoutRef.current = setTimeout(() => {
      setStatus("inactive");
      realtime.send("presence", sessionId, {
        status: "inactive",
      });
    }, 10000);
  };

  //ตัวช่วยตรวจสอบความถูกต้องของแบบฟอร์มพร้อมการรองรับหลายภาษา (i18n)
  const validateField = (name: keyof FormState, value: string): string => {
    switch (name) {
      case "firstName":
        return value.trim() ? "" : t.errFirstName;
      case "lastName":
        return value.trim() ? "" : t.errLastName;
      case "dob":
        if (!value) return t.errDob;
        if (new Date(value) > new Date()) return t.errDobFuture;
        return "";
      case "gender":
        return value ? "" : t.errGender;
      case "phone":
        if (!value.trim()) return t.errPhone;
        const phoneDigits = value.replace(/\D/g, "");
        if (phoneDigits.length < 9) return t.errPhoneInvalid;
        return "";
      case "email":
        if (!value.trim()) return "";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? "" : t.errEmailInvalid;
      case "preferredLanguage":
        return value ? "" : t.errLanguage;
      case "nationality":
        return value ? "" : t.errNationality;
      case "address":
        return value.trim() ? "" : t.errAddress;
      default:
        return "";
    }
  };

  // จัดการการเปลี่ยนแปลงอินพุตด้วย Debounce Sync
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormState;

    resetInactivityTimer();

    setFormData((prev) => {
      const updated = { ...prev, [fieldName]: value };
      
      if (fieldName === "firstName" || fieldName === "lastName") {
        const pName = `${updated.firstName} ${updated.lastName}`.trim();
        realtime.send("presence", sessionId, {
          status: "filling",
          patientName: pName || "Anonymous Patient",
        });
      }

      return updated;
    });

    const fieldError = validateField(fieldName, value);
    setErrors((prev) => ({ ...prev, [fieldName]: fieldError }));

    if (debounceTimeoutRefs.current[fieldName]) {
      clearTimeout(debounceTimeoutRefs.current[fieldName]);
    }

    debounceTimeoutRefs.current[fieldName] = setTimeout(() => {
      realtime.send("field_update", sessionId, {
        field: fieldName,
        value: value,
      });
    }, 150);
  };

  const handleInputFocus = (name: keyof FormState) => {
    resetInactivityTimer();
    realtime.send("field_focus", sessionId, { field: name });
  };

  const handleInputBlur = () => {
    realtime.send("field_focus", sessionId, { field: null });
  };

  // 6. Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    const newErrors: Partial<Record<keyof FormState, string>> = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key as keyof FormState, formData[key as keyof FormState]);
      if (error) {
        newErrors[key as keyof FormState] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    setStatus("submitted");
    setIsSubmitted(true);
    setIsSubmitting(false);
    
    const pName = `${formData.firstName} ${formData.lastName}`.trim();
    realtime.send("presence", sessionId, {
      status: "submitted",
      patientName: pName,
      formData: formData,
    });

    localStorage.removeItem("agnos_patient_session");
  };

  // Confirmation 
  if (isSubmitted) {
    return (
      <div className="rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-12">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} onLanguageChange={handleLanguageSwitch} />
        </div>

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-inner">
          <CheckCircle2 className="h-10 w-10 animate-bounce" />
        </div>
        <h2 className="mt-8 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {t.submittedSuccess}
        </h2>
        <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base max-w-md mx-auto">
          {t.thankYouMessage}
        </p>

        <Badge tone="slate" className="mt-8">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          {t.queueRef}: {sessionId}
        </Badge>

        <div className="mt-10 border-t border-slate-100 pt-8">
          <button
            onClick={() => {
              setFormData(initialFormState);
              setIsSubmitted(false);
              setStatus("filling");
              window.location.reload();
            }}
            className="rounded-2xl bg-[#0f6efd] hover:bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            {t.fillAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
     {/* แถบแสดงสถานะและเซสชัน */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 px-4 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs text-slate-500 font-medium">
            {t.yourQueue}: <strong className="font-semibold text-slate-800 tracking-wide">{sessionId || "P-..."}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge tone="slate">
            <Wifi className="h-3 w-3 text-emerald-500" />
            <span className="font-medium">{t.liveConnected}</span>
          </Badge>

          <Badge tone="slate" className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${status === "inactive" ? "bg-slate-400" : "bg-blue-500 animate-ping"}`} />
            <span className="font-medium">{status === "inactive" ? t.statusInactive : t.statusFilling}</span>
          </Badge>
        </div>
      </div>

      {/* ส่วนที่ 1 ของแบบฟอร์ม: ข้อมูลส่วนบุคคล */}
      <Card className="sm:p-8">
        <div className="border-b border-slate-100 pb-5">
          <h2 className="flex items-center gap-2.5 text-lg font-bold text-slate-900">
            <UserRound className="h-5 w-5 text-blue-600" />
            {t.personalInfo}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {t.patientFormSubtitle}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input
            label={t.firstName}
            name="firstName"
            id="firstName"
            placeholder={t.firstNamePlaceholder}
            value={formData.firstName}
            onChange={handleInputChange}
            onFocus={() => handleInputFocus("firstName")}
            onBlur={handleInputBlur}
            error={errors.firstName}
            icon={UserRound}
          />

          <Input
            label={t.middleName}
            name="middleName"
            id="middleName"
            placeholder={t.middleNamePlaceholder}
            optional={true}
            value={formData.middleName}
            onChange={handleInputChange}
            onFocus={() => handleInputFocus("middleName")}
            onBlur={handleInputBlur}
            error={errors.middleName}
          />

          <Input
            label={t.lastName}
            name="lastName"
            id="lastName"
            placeholder={t.lastNamePlaceholder}
            value={formData.lastName}
            onChange={handleInputChange}
            onFocus={() => handleInputFocus("lastName")}
            onBlur={handleInputBlur}
            error={errors.lastName}
          />

          <DatePicker
            label={t.dob}
            name="dob"
            id="dob"
            value={formData.dob}
            onChange={handleInputChange}
            onFocus={() => handleInputFocus("dob")}
            onBlur={handleInputBlur}
            error={errors.dob}
            locale={lang}
          />

          <Select
            label={t.gender}
            name="gender"
            id="gender"
            value={formData.gender}
            onChange={handleInputChange}
            onFocus={() => handleInputFocus("gender")}
            onBlur={handleInputBlur}
            error={errors.gender}
          >
            <option value="">{t.selectGender}</option>
            <option value="Female">{t.female}</option>
            <option value="Male">{t.male}</option>
            <option value="Other">{t.otherGender}</option>
          </Select>

          <Input
            label={t.phone}
            name="phone"
            id="phone"
            type="tel"
            placeholder={t.phonePlaceholder}
            value={formData.phone}
            onChange={handleInputChange}
            onFocus={() => handleInputFocus("phone")}
            onBlur={handleInputBlur}
            error={errors.phone}
            icon={Phone}
          />

          <Input
            label={t.email}
            name="email"
            id="email"
            type="email"
            placeholder={t.emailPlaceholder}
            optional={true}
            value={formData.email}
            onChange={handleInputChange}
            onFocus={() => handleInputFocus("email")}
            onBlur={handleInputBlur}
            error={errors.email}
            icon={Mail}
          />

          <Select
            label={t.preferredLanguage}
            name="preferredLanguage"
            id="preferredLanguage"
            value={formData.preferredLanguage}
            onChange={handleInputChange}
            onFocus={() => handleInputFocus("preferredLanguage")}
            onBlur={handleInputBlur}
            error={errors.preferredLanguage}
          >
            <option value="">{t.selectLanguage}</option>
            <option value="Thai">{t.langThai}</option>
            <option value="English">{t.langEnglish}</option>
            <option value="Chinese">{t.langChinese}</option>
            <option value="Japanese">{t.langJapanese}</option>
            <option value="Other">{t.langOther}</option>
          </Select>

          <Select
            label={t.nationality}
            name="nationality"
            id="nationality"
            value={formData.nationality}
            onChange={handleInputChange}
            onFocus={() => handleInputFocus("nationality")}
            onBlur={handleInputBlur}
            error={errors.nationality}
          >
            <option value="">{t.selectNationality}</option>
            <option value="Thai">{t.natThai}</option>
            <option value="American">{t.natAmerican}</option>
            <option value="British">{t.natBritish}</option>
            <option value="Chinese">{t.natChinese}</option>
            <option value="Japanese">{t.natJapanese}</option>
            <option value="Other">{t.natOther}</option>
          </Select>

          <div className="md:col-span-2">
            <label htmlFor="address" className="mb-2 block text-sm font-medium text-slate-700">
              {t.address} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4.5 h-4.5 w-4.5 text-slate-400" />
              <textarea
                name="address"
                id="address"
                rows={3}
                placeholder={t.addressPlaceholder}
                value={formData.address}
                onChange={handleInputChange}
                onFocus={() => handleInputFocus("address")}
                onBlur={handleInputBlur}
                className={`w-full rounded-2xl border bg-slate-50/50 py-3.5 pl-11 pr-4 text-sm text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                  errors.address 
                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10" 
                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                }`}
              />
            </div>
            {errors.address && (
              <p className="mt-1.5 text-xs text-rose-500">{errors.address}</p>
            )}
          </div>
        </div>
      </Card>

     {/* ส่วนที่ 2 ของแบบฟอร์ม: ข้อมูลติดต่อในกรณีฉุกเฉินและข้อมูลเพิ่มเติม */}
      <Card className="sm:p-8">
        <div className="border-b border-slate-100 pb-5">
          <h2 className="flex items-center gap-2.5 text-lg font-bold text-slate-900">
            <Heart className="h-5 w-5 text-rose-500" />
            {t.emergencyInfo}
          </h2>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input
            label={t.emergencyName}
            name="emergencyName"
            id="emergencyName"
            placeholder={t.emergencyNamePlaceholder}
            optional={true}
            value={formData.emergencyName}
            onChange={handleInputChange}
            onFocus={() => handleInputFocus("emergencyName")}
            onBlur={handleInputBlur}
          />

          <Input
            label={t.emergencyRelationship}
            name="emergencyRelationship"
            id="emergencyRelationship"
            placeholder={t.emergencyRelPlaceholder}
            optional={true}
            value={formData.emergencyRelationship}
            onChange={handleInputChange}
            onFocus={() => handleInputFocus("emergencyRelationship")}
            onBlur={handleInputBlur}
          />

          <Input
            label={t.religion}
            name="religion"
            id="religion"
            placeholder={t.religionPlaceholder}
            optional={true}
            value={formData.religion}
            onChange={handleInputChange}
            onFocus={() => handleInputFocus("religion")}
            onBlur={handleInputBlur}
          />
        </div>
      </Card>

     {/* Submission Controls */}
<div className="flex w-full items-center justify-center sm:justify-end">
  <Button
    type="submit"
    variant="primary"
    loading={isSubmitting}
    className="px-5 py-2 text-sm sm:px-6 sm:py-2.5"
  >
    {t.submitForm}
  </Button>
</div>
    </form>
  );
}