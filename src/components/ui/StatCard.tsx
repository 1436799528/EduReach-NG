import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  sublabel?: string;
  color?: string; // Tailwind color classes e.g. "text-brand-600 bg-brand-50"
}

export default function StatCard({
  icon: Icon,
  value,
  label,
  sublabel,
  color = "text-brand-600 bg-brand-50",
}: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
      {sublabel && (
        <div className="text-xs text-slate-400 mt-0.5">{sublabel}</div>
      )}
    </div>
  );
}
