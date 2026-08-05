import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";
import { HelpCircle, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & FAQ — EduReach Hub",
};

const FAQS = [
  { q: "How do I find past questions for my course?", a: "Use the search bar on the homepage or go to Courses > select your course > Past Questions. You can also browse by Subject or Topic." },
  { q: "Do I need an account to view questions?", a: "No. You can browse courses, topics, questions, and solutions without an account. You only need to sign in to bookmark, upload, or track practice progress." },
  { q: "How do I upload past questions?", a: "Go to Upload, choose the type (Past Question, Notes, Solution, etc.), give it a clear title, paste the content, and submit. An admin will review it before publishing." },
  { q: "Can I delete my uploaded content?", a: "Yes. Go to My Uploads to see all your submissions. You can delete any of them at any time." },
  { q: "How do points work?", a: "You earn points for uploading (+10-20 pts), getting uploads approved (+5-15 bonus), completing practice sessions (+2), and maintaining study streaks (+1/day)." },
  { q: "What is the Exam Intelligence feature?", a: "It analyzes past questions to show you which topics are tested most, which questions repeat, and generates a smart revision priority list." },
  { q: "Is EduReach Hub only for UNICAL?", a: "We launched with University of Calabar, EEE 300L. The platform architecture supports multiple universities and will expand based on student demand." },
  { q: "How can I report an incorrect solution?", a: "Click 'Report Error' on any question page, or upload a Correction through the Upload page." },
];

export default function HelpPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb items={[{ label: "Help & FAQ" }]} />
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Help &amp; FAQ</h1>
        <p className="text-slate-500 mb-8">Common questions about using EduReach Hub.</p>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <details key={i} className="group bg-white border border-slate-200 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition">
                <span className="font-medium text-slate-900 text-sm pr-4">{faq.q}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform shrink-0" />
              </summary>
              <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                {faq.a}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-10 p-6 bg-brand-50 border border-brand-200 rounded-xl text-center">
          <HelpCircle className="w-8 h-8 text-brand-600 mx-auto mb-2" />
          <h3 className="font-bold text-brand-800 mb-1">Still have questions?</h3>
          <p className="text-sm text-brand-600">Email us at <strong>support@edureachhub.com</strong></p>
        </div>
      </main>
      <Footer />
    </>
  );
}
