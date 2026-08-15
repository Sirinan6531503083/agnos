import React, { forwardRef, useRef } from "react";
import type { LucideIcon } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  optional?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, optional = false, className = "", id, type, ...props }, ref) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const isDate = type === "date";

    const setRefs = (node: HTMLInputElement) => {
      internalRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    };

    const openDatePicker = () => {
      if (internalRef.current?.showPicker) {
        try {
          internalRef.current.showPicker();
        } catch {
          internalRef.current.focus();
        }
      } else {
        internalRef.current?.focus();
      }
    };

    return (
      <div className="w-full min-w-0">
        {label && (
          <label
            htmlFor={id}
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            {label} {optional === false ? <span className="text-red-500">*</span> : <span className="ml-2 text-xs font-normal text-slate-400">Optional</span>}
          </label>
        )}

        <div className="relative w-full min-w-0 group">
          {Icon && (
            <div
              onClick={isDate ? openDatePicker : undefined}
              className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-500 ${
                isDate ? "cursor-pointer z-10 group-hover:text-blue-400" : "pointer-events-none"
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
            </div>
          )}
          <input
            id={id}
            type={type}
            ref={setRefs}
            onClick={isDate ? openDatePicker : props.onClick}
            className={`
              w-full min-w-0 box-border appearance-none rounded-2xl border bg-white py-3.5 px-4 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200
              placeholder:text-slate-400
              hover:border-slate-300 hover:shadow-md
              focus:bg-white focus:ring-4 focus:ring-blue-500/10
              disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:hover:shadow-sm disabled:hover:border-slate-200
              ${Icon ? "pl-11" : ""}
              ${isDate ? `
                cursor-pointer
                [&::-webkit-calendar-picker-indicator]:absolute
                [&::-webkit-calendar-picker-indicator]:right-0
                [&::-webkit-calendar-picker-indicator]:h-full
                [&::-webkit-calendar-picker-indicator]:w-full
                [&::-webkit-calendar-picker-indicator]:opacity-0
                [&::-webkit-calendar-picker-indicator]:cursor-pointer
                [&::-webkit-datetime-edit]:text-slate-900
                [&::-webkit-datetime-edit-fields-wrapper]:tracking-wide
              ` : ""}
              ${error 
                ? "border-rose-300 hover:border-rose-400 focus:border-rose-500 focus:ring-rose-500/10" 
                : "border-slate-200 focus:border-blue-500"
              }
              ${className}
            `}
            {...props}
          />
          {isDate && !props.value && (
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-300 group-hover:text-slate-400 transition-colors">
              เลือกวันที่
            </span>
          )}
        </div>

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

Input.displayName = "Input";
export default Input;