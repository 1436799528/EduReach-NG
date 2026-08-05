"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, BookOpen, Search, Shield } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isLoggedIn, isAdmin } = useAuth();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? "bg-white border-b border-slate-200 shadow-sm" : "bg-white/80 backdrop-blur border-b border-transparent"}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between" style={{ height: 72 }}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-accent-500" />
            <span className="font-heading font-extrabold text-lg text-brand-700">
              EduReach<span className="text-accent-500">Hub</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-700 rounded-lg transition">Home</Link>
            <Link href="/browse" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-700 rounded-lg transition">Browse</Link>
            <Link href="/upload" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-700 rounded-lg transition">Upload</Link>
            <Link href="/about" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-700 rounded-lg transition">About</Link>
            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 rounded-lg transition">
                <Shield className="w-3.5 h-3.5" />Admin
              </Link>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {isLoggedIn && <NotificationBell />}
            {isLoggedIn ? (
              <Link href="/dashboard" className="hidden md:inline-flex px-4 py-2 text-sm font-semibold text-white bg-accent-500 rounded-lg hover:bg-accent-600 transition">
                Dashboard
              </Link>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-brand-700 transition">Login</Link>
                <Link href="/register" className="px-4 py-2 text-sm font-semibold text-white bg-accent-500 rounded-lg hover:bg-accent-600 transition">Sign Up</Link>
              </div>
            )}
            <button className="md:hidden p-2 text-slate-600" onClick={() => setOpen(!open)}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-slate-100 py-3 pb-16 space-y-1">
            {[
              { href: "/", label: "Home" },
              { href: "/browse", label: "Browse" },
              { href: "/upload", label: "Upload" },
              { href: "/about", label: "About" },
              { href: "/help", label: "FAQ" },
              ...(isLoggedIn ? [
                { href: "/dashboard", label: "Dashboard" },
                { href: "/bookmarks", label: "Saved" },
                { href: "/my-uploads", label: "My Uploads" },
                { href: "/settings", label: "Settings" },
              ] : [
                { href: "/login", label: "Login" },
                { href: "/register", label: "Sign Up" },
              ]),
              ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
            ].map((item) => (
              <Link key={item.href} href={item.href} className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-50 rounded-lg" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
