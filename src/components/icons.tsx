import React from 'react';

/** Inline SVG icon set — restrained line style, 1.6px stroke. */
function Svg({ children, size = 20 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export const IconPen = (p: { size?: number }) => (
  <Svg size={p.size}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></Svg>
);
export const IconSearch = (p: { size?: number }) => (
  <Svg size={p.size}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Svg>
);
export const IconCheck = (p: { size?: number }) => (
  <Svg size={p.size}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 9h18" /><path d="m9 15 2 2 4-4" /></Svg>
);
export const IconCalc = (p: { size?: number }) => (
  <Svg size={p.size}><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 18.5h8" /></Svg>
);
export const IconFolder = (p: { size?: number }) => (
  <Svg size={p.size}><path d="M4 20V6a2 2 0 0 1 2-2h4l2 3h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" /><path d="M9 13h6M9 16.5h4" /></Svg>
);
export const IconQuestion = (p: { size?: number }) => (
  <Svg size={p.size}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.35c-.83.33-1.4 1.06-1.4 2v.4" /><path d="M12 17h.01" /></Svg>
);
export const IconHome = (p: { size?: number }) => (
  <Svg size={p.size}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9 21v-6h6v6" /></Svg>
);
export const IconBell = (p: { size?: number }) => (
  <Svg size={p.size}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" /><path d="M13.7 20a2 2 0 0 1-3.4 0" /></Svg>
);
export const IconSchool = (p: { size?: number }) => (
  <Svg size={p.size}><path d="M12 3 2 8l10 5 10-5Z" /><path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5" /><path d="M22 8v6" /></Svg>
);
export const IconDoc = (p: { size?: number }) => (
  <Svg size={p.size}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h6" /></Svg>
);
export const IconCalendar = (p: { size?: number }) => (
  <Svg size={p.size}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 9h18" /></Svg>
);
export const IconUser = (p: { size?: number }) => (
  <Svg size={p.size}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></Svg>
);
export const IconShield = (p: { size?: number }) => (
  <Svg size={p.size}><path d="M12 2 4 5.5v6c0 5 3.4 8.6 8 10.5 4.6-1.9 8-5.5 8-10.5v-6Z" /><path d="m9 12 2 2 4-4" /></Svg>
);
export const IconArrowRight = (p: { size?: number }) => (
  <Svg size={p.size}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Svg>
);
export const IconDownload = (p: { size?: number }) => (
  <Svg size={p.size}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></Svg>
);
export const IconClock = (p: { size?: number }) => (
  <Svg size={p.size}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>
);
export const IconSettings = (p: { size?: number }) => (
  <Svg size={p.size}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h0a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55h0a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v0a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z" /></Svg>
);
export const IconActivity = (p: { size?: number }) => (
  <Svg size={p.size}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></Svg>
);
export const IconTasks = (p: { size?: number }) => (
  <Svg size={p.size}><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /><path d="M13 6h8" /><path d="M13 12h8" /><path d="M13 18h8" /></Svg>
);
