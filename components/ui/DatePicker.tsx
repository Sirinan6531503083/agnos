"use client";

import React, { useState, useRef, useEffect } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  label?: string;
  error?: string;
  optional?: boolean;
  name: string;
  id?: string;
  value: string; // ISO format: YYYY-MM-DD
  onChange: (e: { target: { name: string; value: string } }) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  locale?: "th" | "en";
  minYear?: number; // ปี ค.ศ. เก่าสุดที่เลือกได้
  maxDate?: Date; // ค่าเริ่มต้น = วันนี้
}

const TH_MONTHS_FULL = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];
const TH_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];
const TH_WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

const EN_MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const EN_MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const EN_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type ViewMode = "days" | "months" | "years";

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function DatePicker({
  label,
  error,
  optional = false,
  name,
  id,
  value,
  onChange,
  onFocus,
  onBlur,
  locale = "th",
  minYear = new Date().getFullYear() - 120,
  maxDate = new Date(),
}: DatePickerProps) {
  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("days");
  const [viewDate, setViewDate] = useState<Date>(selectedDate ?? new Date());
  const [yearPage, setYearPage] = useState<number>(
    Math.floor((selectedDate ?? new Date()).getFullYear() / 12) * 12
  );
  const wrapperRef = useRef<HTMLDivElement>(null);

  const months = locale === "th" ? TH_MONTHS_FULL : EN_MONTHS_FULL;
  const monthsShort = locale === "th" ? TH_MONTHS_SHORT : EN_MONTHS_SHORT;
  const weekdays = locale === "th" ? TH_WEEKDAYS : EN_WEEKDAYS;
  const yearOffset = locale === "th" ? 543 : 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setView("days");
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setView("days");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const openPicker = () => {
    setViewDate(selectedDate ?? new Date());
    setYearPage(Math.floor((selectedDate ?? new Date()).getFullYear() / 12) * 12);
    setView("days");
    setIsOpen(true);
    onFocus?.();
  };

  const closePicker = () => {
    setIsOpen(false);
    setView("days");
    onBlur?.();
  };

  const selectDay = (d: Date) => {
    onChange({ target: { name, value: toISO(d) } });
    closePicker();
  };

  const goToPrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const goToNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  // สร้างตารางวันของเดือนที่แสดง (รวมวันจากเดือนก่อน/ถัดไปให้เต็มสัปดาห์)
  const buildDaysGrid = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay(); // 0 = อาทิตย์
    const gridStart = new Date(year, month, 1 - startOffset);

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      days.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
    }
    return days;
  };

  const displayValue = () => {
    if (!selectedDate) return "";
    const d = selectedDate.getDate();
    const m = monthsShort[selectedDate.getMonth()];
    const y = selectedDate.getFullYear() + yearOffset;
    return locale === "th" ? `${d} ${m} ${y}` : `${m} ${d}, ${y}`;
  };

  const daysGrid = buildDaysGrid();
  const yearsList = Array.from({ length: 12 }, (_, i) => yearPage + i);

  return (
    <div className="w-full min-w-0" ref={wrapperRef}>
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
          {label}{" "}
          {optional === false ? (
            <span className="text-red-500">*</span>
          ) : (
            <span className="ml-2 text-xs font-normal text-slate-400">Optional</span>
          )}
        </label>
      )}

      <div className="relative w-full min-w-0">
        <button
          type="button"
          id={id}
          onClick={() => (isOpen ? closePicker() : openPicker())}
          className={`
            w-full min-w-0 box-border flex items-center gap-3 rounded-2xl border bg-white py-3.5 pl-11 pr-4 text-left text-sm shadow-sm outline-none transition-all duration-200
            hover:border-slate-300 hover:shadow-md
            ${isOpen ? "border-blue-500 ring-4 ring-blue-500/10" : ""}
            ${error ? "border-rose-300 hover:border-rose-400" : "border-slate-200"}
          `}
        >
          <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
          <span className={selectedDate ? "text-slate-900" : "text-slate-400"}>
            {selectedDate ? displayValue() : locale === "th" ? "เลือกวันเกิด" : "Select date"}
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-20 mt-2 w-fit min-w-[220px] rounded-lg border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
            {/* Header: เดือน / ปี + ปุ่มเลื่อน */}
            <div className="mb-1.5 flex items-center justify-between">
              <button
                type="button"
                onClick={goToPrevMonth}
                className="rounded-full p-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>

              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setView(view === "months" ? "days" : "months")}
                  className="rounded px-1 py-0.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  {months[viewDate.getMonth()]}
                </button>
                <button
                  type="button"
                  onClick={() => setView(view === "years" ? "days" : "years")}
                  className="rounded px-1 py-0.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  {viewDate.getFullYear() + yearOffset}
                </button>
              </div>

              <button
                type="button"
                onClick={goToNextMonth}
                className="rounded-full p-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {/* มุมมองวัน */}
            {view === "days" && (
              <div>
                <div className="grid grid-cols-7 text-center">
                  {weekdays.map((wd) => (
                    <div key={wd} className="flex h-6 w-6 items-center justify-center text-[9px] font-medium text-slate-400">
                      {wd}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {daysGrid.map((d, idx) => {
                    const inCurrentMonth = d.getMonth() === viewDate.getMonth();
                    const isSelected = selectedDate && isSameDay(d, selectedDate);
                    const isToday = isSameDay(d, new Date());
                    const isDisabled = d > maxDate;

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => selectDay(d)}
                        className={`
                          flex h-6 w-6 items-center justify-center rounded-full text-[11px] transition-colors
                          ${!inCurrentMonth ? "text-slate-300" : "text-slate-700"}
                          ${isDisabled ? "cursor-not-allowed opacity-30" : "hover:bg-blue-50 hover:text-blue-600"}
                          ${isToday && !isSelected ? "font-semibold text-blue-600" : ""}
                          ${isSelected ? "bg-blue-600 text-white hover:bg-blue-600 hover:text-white font-semibold" : ""}
                        `}
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* มุมมองเดือน */}
            {view === "months" && (
              <div className="grid grid-cols-3 gap-0.5">
                {monthsShort.map((m, idx) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setViewDate(new Date(viewDate.getFullYear(), idx, 1));
                      setView("days");
                    }}
                    className={`
                      rounded-md py-1 text-[11px] transition-colors
                      ${idx === viewDate.getMonth()
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                      }
                    `}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            {/* มุมมองปี */}
            {view === "years" && (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setYearPage((p) => p - 12)}
                    className="rounded-full p-1 text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[10px] text-slate-400">
                    {yearsList[0] + yearOffset} – {yearsList[11] + yearOffset}
                  </span>
                  <button
                    type="button"
                    onClick={() => setYearPage((p) => p + 12)}
                    className="rounded-full p-1 text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {yearsList.map((y) => (
                    <button
                      key={y}
                      type="button"
                      disabled={y < minYear || y > maxDate.getFullYear()}
                      onClick={() => {
                        setViewDate(new Date(y, viewDate.getMonth(), 1));
                        setView("months");
                      }}
                      className={`
                        rounded-lg py-1.5 text-xs transition-colors
                        ${y === viewDate.getFullYear()
                          ? "bg-blue-600 text-white font-semibold"
                          : "text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                        }
                        ${(y < minYear || y > maxDate.getFullYear()) ? "cursor-not-allowed opacity-30 hover:bg-transparent hover:text-slate-700" : ""}
                      `}
                    >
                      {y + yearOffset}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ปุ่มวันนี้ */}
            <div className="mt-2 flex justify-center border-t border-slate-100 pt-2">
              <button
                type="button"
                onClick={() => selectDay(new Date())}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                {locale === "th" ? "วันนี้" : "Today"}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
          <span className="h-1 w-1 rounded-full bg-rose-500" />
          {error}
        </p>
      )}
    </div>
  );
}