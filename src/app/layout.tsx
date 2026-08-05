import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";
import MobileBottomNav from "@/components/MobileBottomNav";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "EduReach Hub | Nigeria's Past Questions Platform",
  description:
    "Search verified university, polytechnic, and college past questions across Nigeria.",
  openGraph: {
    title: "EduReach Hub | Nigeria's Past Questions Platform",
    description: "Search verified university, polytechnic, and college past questions across Nigeria.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="pb-12 md:pb-0">
        <ToastProvider>{children}</ToastProvider>
        <MobileBottomNav />
      </body>
    </html>
  );
}
