import React, { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", loading = false, className = "", disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold tracking-wide transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-[#0f6efd] hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 focus:ring-blue-500/20",
      secondary:
        "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus:ring-slate-100",
      danger:
        "bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700 focus:ring-rose-500/20",
      ghost:
        "text-slate-600 hover:bg-slate-100 focus:ring-slate-100",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
