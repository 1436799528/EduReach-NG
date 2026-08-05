import Link from "next/link";
import { BookOpen, Brain, Upload, Bookmark, FileText, Calendar } from "lucide-react";

const ACTIONS = [
  { href: "/courses", icon: BookOpen, label: "Courses", bg: "bg-brand-50" },
  { href: "/search", icon: Brain, label: "Search", bg: "bg-purple-50" },
  { href: "/upload", icon: Upload, label: "Upload", bg: "bg-green-50" },
  { href: "/bookmarks", icon: Bookmark, label: "Bookmarks", bg: "bg-amber-50" },
  { href: "/my-uploads", icon: FileText, label: "My Uploads", bg: "bg-blue-50" },
  { href: "/calendar", icon: Calendar, label: "Calendar", bg: "bg-pink-50" },
];

export default function QuickActions() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
      <h2 className="font-bold text-slate-900 mb-3 text-sm">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map(({ href, icon: Icon, label, bg }) => (
          <Link key={href} href={href} className={`flex items-center gap-3 p-3 rounded-lg transition hover:shadow-sm ${bg}`}>
            <Icon className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-800">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
