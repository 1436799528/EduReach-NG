import Link from "next/link";
import { Flame, Settings } from "lucide-react";
import type { User } from "@/types";

export default function WelcomeHeader({ profile }: { profile: User }) {
  return (
    <div className="bg-brand-700 rounded-xl p-6 text-white mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold mb-1">
            Welcome back, {profile.fullName.split(" ")[0]}! 👋
          </h1>
          <p className="text-white/70 text-sm">
            {profile.departmentName || "Student"}
            {profile.universityName ? ` • ${profile.universityName}` : ""}
            {profile.level ? ` • ${profile.level}L` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
            <Flame className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-lg font-bold leading-none">{profile.currentStreak}</p>
              <p className="text-[10px] text-white/70">Streak</p>
            </div>
          </div>
          <Link href="/settings" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
