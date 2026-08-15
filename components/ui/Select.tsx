import React, { forwardRef, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  optional?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, optional = false, className = "", id, children, value, onChange, disabled, ...props }, ref) => {
    const [isMobile, setIsMobile] = useState(false);
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const mq = window.matchMedia("(max-width: 640px)");
      const handler = () => setIsMobile(mq.matches);
      handler();
      mq.addEventListener?.("change", handler);
      return () => mq.removeEventListener?.("change", handler);
    }, []);

    useEffect(() => {
      const onDocClick = (e: MouseEvent) => {
        if (!open) return;
        if (!wrapperRef.current) return;
        if (!wrapperRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener("click", onDocClick);
      return () => document.removeEventListener("click", onDocClick);
    }, [open]);

    const options = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<{
      value?: string | number;
      children?: React.ReactNode;
    }>[];

    const selectedOption = options.find((opt) => String(opt.props.value) === String(value));

    const displayLabel = selectedOption
      ? selectedOption.props.children
      : options.length
      ? options[0].props.children
      : "";

    const handleSelect = (val: string) => {
      // สร้างเหตุการณ์จำลองเพื่อเรียก onChange ของเหตุการณ์หลัก
      const synthetic = {
        target: { value: val },
      } as unknown as React.ChangeEvent<HTMLSelectElement>;
      onChange?.(synthetic);
      setOpen(false);
    };

    return (
      <div className="w-full" ref={wrapperRef}>
        {label && (
          <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
            {label} {optional === false ? <span className="text-red-500">*</span> : <span className="ml-2 text-xs font-normal text-slate-400">Optional</span>}
          </label>
        )}

        <div className="relative">
          {!isMobile && (
            <>
              <select
                id={id}
                ref={ref}
                className={`
              w-full appearance-none rounded-2xl border bg-white py-3.5 pl-4 pr-10 text-base sm:text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 min-h-[48px]
              focus:bg-white focus:ring-4 focus:ring-blue-500/10
              disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400
              ${error ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-blue-500"}
              ${className}
            `}
                value={value}
                onChange={onChange}
                disabled={disabled}
                {...props}
              >
                {children}
              </select>

              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                <ChevronDown className="h-5 w-5 sm:h-4 sm:w-4" />
              </div>
            </>
          )}

          {isMobile && (
            <>
              <button
                type="button"
                onClick={() => setOpen((s) => !s)}
                disabled={disabled}
                className={`w-full text-left appearance-none rounded-2xl border bg-white py-4 pl-4 pr-10 text-lg text-slate-900 shadow-sm outline-none transition-all duration-200 min-h-[56px] ${
                  error ? "border-rose-300" : "border-slate-200"
                } ${className}`}
              >
                <span className="flex items-center justify-between">
                  <span className="truncate">{displayLabel}</span>
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                </span>
              </button>

              {open && (
                <div className="absolute left-0 right-0 z-50 mt-2 rounded-2xl bg-white shadow-lg border border-slate-100">
                  <div className="flex max-h-[60vh] flex-col overflow-auto">
                    {options.map((opt) => (
                      <button
                        key={String(opt.props.value)}
                        onClick={() => handleSelect(String(opt.props.value || ""))}
                        className={`w-full text-left px-4 py-4 text-lg hover:bg-slate-50 ${String(opt.props.value) === String(value) ? "bg-slate-50 font-semibold" : ""}`}
                      >
                        {opt.props.children}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <select aria-hidden="true" tabIndex={-1} className="hidden" value={value} disabled>
          {children}
        </select>

        {error && (
          <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-rose-500" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
