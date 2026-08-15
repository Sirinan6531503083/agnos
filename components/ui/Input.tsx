import React, { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  optional?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, optional = false, className = "", id, ...props }, ref) => {
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
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-500">
              <Icon className="h-4.5 w-4.5" />
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={`
              w-full min-w-0 box-border rounded-2xl border bg-white py-3.5 px-4 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200
              placeholder:text-slate-400
              hover:border-slate-300 hover:shadow-md
              focus:bg-white focus:ring-4 focus:ring-blue-500/10
              disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:hover:shadow-sm disabled:hover:border-slate-200
              ${Icon ? "pl-11" : ""}
              ${error
                ? "border-rose-300 hover:border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
                : "border-slate-200 focus:border-blue-500"
              }
              ${className}
            `}
            {...props}
          />
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