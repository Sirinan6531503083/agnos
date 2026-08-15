import React from "react";

type Tone = "blue" | "green" | "slate" | "amber";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  children: React.ReactNode;
}

const toneMap: Record<Tone, string> = {
  blue: "bg-blue-50 text-blue-700 border border-blue-100",
  green: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  slate: "bg-slate-50 text-slate-600 border border-slate-200",
  amber: "bg-amber-50 text-amber-700 border border-amber-100",
};

export default function Badge({ tone = "blue", children, className = "", ...props }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${toneMap[tone]} ${className}`} {...props}>
      {children}
    </span>
  );
}
