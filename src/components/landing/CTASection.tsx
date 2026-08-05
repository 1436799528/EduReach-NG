import Link from "next/link";
import { Upload } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-brand-700 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="font-heading text-xl md:text-2xl font-bold text-white mb-2">
            Have Past Questions?
          </h2>
          <p className="text-sm text-white/60 mb-6 max-w-md mx-auto">
            Help thousands of students prepare for exams. Upload your papers today.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 text-white font-bold text-sm rounded-lg hover:bg-accent-600 transition"
          >
            <Upload className="w-4 h-4" />
            Upload Past Questions
          </Link>
        </div>
      </div>
    </section>
  );
}
