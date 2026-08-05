import type { ReactNode } from "react";
import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import Button from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  children?: ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  children,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <Icon className="w-14 h-14 text-slate-200 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
      )}
      {actionLabel && actionHref && (
        <div className="mt-6">
          <Link href={actionHref}>
            <Button variant="primary">{actionLabel}</Button>
          </Link>
        </div>
      )}
      {children}
    </div>
  );
}
