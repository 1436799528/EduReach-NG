import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-white mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-accent-500" />
              <span className="font-heading font-bold">EduReach<span className="text-accent-500">Hub</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nigeria&apos;s most organized past questions platform for tertiary institutions.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold text-slate-300 mb-3">Explore</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/search" className="hover:text-white transition">Search</Link></li>
              <li><Link href="/courses" className="hover:text-white transition">Institutions</Link></li>
              <li><Link href="/courses" className="hover:text-white transition">Faculties</Link></li>
              <li><Link href="/courses" className="hover:text-white transition">Popular Courses</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-slate-300 mb-3">Support</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/help" className="hover:text-white transition">FAQ</Link></li>
              <li><Link href="/about" className="hover:text-white transition">About</Link></li>
              <li><Link href="/upload" className="hover:text-white transition">Upload</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-slate-300 mb-3">Legal</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/privacy" className="hover:text-white transition">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-5 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} EduReach Hub. Made in Nigeria.
        </div>
      </div>
    </footer>
  );
}
