"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Upload, Bookmark, User } from "lucide-react";

const ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/upload", icon: Upload, label: "Upload" },
  { href: "/bookmarks", icon: Bookmark, label: "Saved" },
  { href: "/dashboard", icon: User, label: "Profile" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-bottom">
      <div className="flex items-center justify-around h-12">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center w-full h-full gap-0.5 ${active ? "text-brand-700" : "text-slate-400"}`}>
              <item.icon className="w-4 h-4" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
