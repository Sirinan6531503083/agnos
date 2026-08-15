import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  optional?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, optional = false, className = "", id, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            {label} {optional === false ? <span className="text-red-500">*</span> : <span className="ml-2 text-xs font-normal text-slate-400">Optional</span>}
          </label>
        )}

        <div className="relative">
          <select
            id={id}
            ref={ref}
            className={`
              w-full appearance-none rounded-2xl border bg-white py-3.5 pl-4 pr-10 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200
              focus:bg-white focus:ring-4 focus:ring-blue-500/10
              disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400
              ${error 
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10" 
                : "border-slate-200 focus:border-blue-500"
              }
              ${className}
            `}
            {...props}
          >
            {children}
          </select>
          
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            <ChevronDown className="h-4 w-4" />
          </div>
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

Select.displayName = "Select";
export default Select;
