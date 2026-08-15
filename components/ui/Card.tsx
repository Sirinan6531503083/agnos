import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  variant?: "surface" | "ghost";
}

export default function Card({ children, className = "", size = "md", variant = "surface", ...props }: CardProps) {
  const base = "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm";
  const sizes: Record<string, string> = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const variants: Record<string, string> = {
    surface: base,
    ghost: "rounded-3xl",
  };

  return (
    <div className={`${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </div>
  );
}
