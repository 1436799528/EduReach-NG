import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import {
  Target,
  Users,
  BookOpen,
  Shield,
  Zap,
  Heart,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — EduReach Hub",
  description:
    "EduReach Hub is an exam preparation platform for Nigerian university students.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb items={[{ label: "About" }]} />

        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            About EduReach Hub
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            EduReach Hub is not a file-sharing website. It is an exam
            preparation platform built around structured past questions,
            verified solutions, and guided practice for Nigerian university
            students.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-8 mb-10">
          <h2 className="text-xl font-bold text-brand-800 mb-3 flex items-center gap-2">
            <Target className="w-6 h-6" />
            Our Mission
          </h2>
          <p className="text-brand-700 leading-relaxed">
            Help students find past questions, understand them, practice them,
            and pass exams. Every feature exists to help students revise more
            efficiently, understand recurring exam patterns, and improve their
            chances of passing.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[
            {
              icon: BookOpen,
              title: "Structured Knowledge",
              description:
                "Every question is individually stored with its topic, difficulty, solution, and exam history — not just a PDF dump.",
            },
            {
              icon: Shield,
              title: "Verified Content",
              description:
                "All contributions go through moderation to ensure accuracy. Students can trust the solutions they study.",
            },
            {
              icon: Zap,
              title: "Focus on Speed",
              description:
                "Minimal design, fast loading, no clutter. Every page asks one question: Will this help a student pass?",
            },
            {
              icon: Heart,
              title: "Community-Driven",
              description:
                "Students help students. Upload past questions, contribute solutions, and earn recognition from your peers.",
            },
          ].map((value) => (
            <div
              key={value.title}
              className="bg-white border border-slate-200 rounded-xl p-6"
            >
              <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center mb-4">
                <value.icon className="w-5 h-5 text-brand-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {value.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        {/* Initial Launch */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-600" />
            Initial Launch
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">University</p>
              <p className="font-semibold text-slate-900">
                University of Calabar
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Faculty</p>
              <p className="font-semibold text-slate-900">
                Faculty of Engineering
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Department</p>
              <p className="font-semibold text-slate-900">
                Electrical &amp; Electronics Engineering (300L)
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-4 leading-relaxed">
            After validating the product with this initial cohort, we plan to
            expand gradually to other departments, faculties, polytechnics, and
            colleges of education across Nigeria.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
