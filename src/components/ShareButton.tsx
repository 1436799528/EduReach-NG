"use client";

import { useState } from "react";
import { Share2, Check, Link as LinkIcon, X } from "lucide-react";

export default function ShareButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const shareUrl = typeof window !== "undefined" ? encodeURIComponent(window.location.href) : "";
  const shareTitle = typeof document !== "undefined" ? encodeURIComponent(document.title) : "";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-slate-400 hover:text-brand-600 transition text-xs"
      >
        <Share2 className="w-3.5 h-3.5" />Share
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
          <button onClick={copyLink} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <LinkIcon className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <a href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`} target="_blank" rel="noopener" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            WhatsApp
          </a>
          <a href={`https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noopener" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Telegram
          </a>
          <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noopener" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            X (Twitter)
          </a>
          <button onClick={() => setOpen(false)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:bg-slate-50">
            <X className="w-3 h-3" />Close
          </button>
        </div>
      )}
    </div>
  );
}
