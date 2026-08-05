import { Search, ShieldCheck, Users, Globe } from "lucide-react";

const REASONS = [
  { icon: Search, title: "Fast Search", desc: "Find any past question in seconds by course, topic, or institution." },
  { icon: ShieldCheck, title: "Verified Materials", desc: "Every paper is reviewed by admins before publishing." },
  { icon: Users, title: "Student Contributions", desc: "Students upload and share papers to help each other." },
  { icon: Globe, title: "Nationwide Coverage", desc: "Universities, polytechnics, and colleges across Nigeria." },
];

export default function WhySection() {
  return (
    <section className="py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="font-heading text-base font-bold text-slate-900 mb-4 text-center">Why EduReach Hub</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {REASONS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center p-4 bg-white border border-slate-200 rounded-lg">
              <Icon className="w-6 h-6 text-accent-500 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
