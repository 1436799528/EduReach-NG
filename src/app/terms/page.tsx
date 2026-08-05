import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service — EduReach Hub" };

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb items={[{ label: "Terms of Service" }]} />
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Terms of Service</h1>
        <div className="prose prose-slate prose-sm max-w-none space-y-6 text-slate-600 leading-relaxed">
          <p>Last updated: January 2025</p>
          <h2 className="text-lg font-bold text-slate-900">1. Acceptance</h2>
          <p>By using EduReach Hub, you agree to these terms. If you do not agree, please do not use the platform.</p>
          <h2 className="text-lg font-bold text-slate-900">2. User Accounts</h2>
          <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials.</p>
          <h2 className="text-lg font-bold text-slate-900">3. Content</h2>
          <p>You retain ownership of content you upload. By uploading, you grant EduReach Hub a non-exclusive license to display, distribute, and modify the content for platform purposes. You must not upload copyrighted material without permission.</p>
          <h2 className="text-lg font-bold text-slate-900">4. Academic Integrity</h2>
          <p>EduReach Hub is a study aid, not a cheating tool. Users must not use the platform to violate academic integrity policies of their institutions. Past questions are shared for revision purposes only.</p>
          <h2 className="text-lg font-bold text-slate-900">5. Moderation</h2>
          <p>All uploaded content is reviewed by moderators before publishing. We reserve the right to remove content that is inaccurate, inappropriate, or violates these terms.</p>
          <h2 className="text-lg font-bold text-slate-900">6. Limitation of Liability</h2>
          <p>EduReach Hub provides educational content as-is. We do not guarantee the accuracy of solutions or exam outcomes. Use the platform as a supplement to your studies, not a replacement for attending lectures.</p>
          <h2 className="text-lg font-bold text-slate-900">7. Contact</h2>
          <p>For questions about these terms, contact <strong>legal@edureachhub.com</strong>.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
