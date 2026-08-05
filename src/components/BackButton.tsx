"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ label }: { label?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-700 transition mb-4"
    >
      <ArrowLeft className="w-4 h-4" />
      {label || "Back"}
    </button>
  );
}
