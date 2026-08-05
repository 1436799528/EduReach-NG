import type { ReactNode } from "react";

type Variant =
  | "default"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "purple"
  | "accent";

const variantStyles: Record<Variant, string> = {
  default: "bg-slate-100 text-slate-600 border-slate-200",
  brand: "bg-brand-50 text-brand-700 border-brand-200",
  success: "bg-green-100 text-green-700 border-green-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  danger: "bg-red-100 text-red-700 border-red-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  accent: "bg-accent-100 text-accent-700 border-accent-200",
};

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

export default function Badge({
  variant = "default",
  children,
  className = "",
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === "success"
              ? "bg-green-500"
              : variant === "danger"
                ? "bg-red-500"
                : variant === "warning"
                  ? "bg-amber-500"
                  : "bg-slate-400"
          }`}
        />
      )}
      {children}
    </span>
  );
}

// Convenience exports for difficulty badges
export function DifficultyBadge({ difficulty }: { difficulty: string | null }) {
  const d = difficulty || "medium";
  const variant: Variant =
    d === "easy" ? "success" : d === "hard" ? "danger" : "warning";
  return <Badge variant={variant}>{d}</Badge>;
}

// Status badge
export function StatusBadge({ status }: { status: string | null }) {
  const s = status || "pending";
  const variant: Variant =
    s === "approved" ? "success" : s === "rejected" ? "danger" : "warning";
  return (
    <Badge variant={variant} dot>
      {s}
    </Badge>
  );
}
