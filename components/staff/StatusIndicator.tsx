import type { LucideIcon } from "lucide-react";

type StatusTone = "blue" | "green" | "amber" | "slate";

type StatusIndicatorProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  tone?: StatusTone;
};

const toneStyles: Record<StatusTone, { badge: string; icon: string }> = {
  blue: {
    badge: "bg-blue-50 text-blue-600",
    icon: "text-blue-600",
  },
  green: {
    badge: "bg-emerald-50 text-emerald-600",
    icon: "text-emerald-600",
  },
  amber: {
    badge: "bg-amber-50 text-amber-600",
    icon: "text-amber-600",
  },
  slate: {
    badge: "bg-slate-100 text-slate-600",
    icon: "text-slate-600",
  },
};

export default function StatusIndicator({
  icon: Icon,
  label,
  value,
  detail,
  tone = "blue",
}: StatusIndicatorProps) {
  const styles = toneStyles[tone];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <p className="text-sm text-slate-500">{label}</p>

      <div className="mt-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles.badge}`}>
          <Icon className={`h-5 w-5 ${styles.icon}`} />
        </div>

        <div>
          <p className="font-semibold text-slate-900">{value}</p>
          <p className="text-xs text-slate-400">{detail}</p>
        </div>
      </div>
    </div>
  );
}
