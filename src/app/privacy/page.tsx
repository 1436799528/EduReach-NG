import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy — EduReach Hub" };

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb items={[{ label: "Privacy Policy" }]} />
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
        <div className="prose prose-slate prose-sm max-w-none space-y-6 text-slate-600 leading-relaxed">
          <p>Last updated: January 2025</p>
          <h2 className="text-lg font-bold text-slate-900">1. Information We Collect</h2>
          <p>We collect your name, email address, university, department, and level when you create an account. We also collect usage data such as questions viewed, practice sessions completed, and bookmarks.</p>
          <h2 className="text-lg font-bold text-slate-900">2. How We Use Your Information</h2>
          <p>Your information is used to personalize your experience, track your study progress, and improve the platform. We never sell your personal data.</p>
          <h2 className="text-lg font-bold text-slate-900">3. Content You Upload</h2>
          <p>When you upload past questions, notes, or solutions, your name is associated with the contribution. You can delete your own uploads at any time. Approved content becomes visible to all users.</p>
          <h2 className="text-lg font-bold text-slate-900">4. Data Security</h2>
          <p>Passwords are hashed using industry-standard bcrypt. We implement reasonable measures to protect your data but cannot guarantee absolute security.</p>
          <h2 className="text-lg font-bold text-slate-900">5. Contact</h2>
          <p>For privacy concerns, contact us at <strong>privacy@edureachhub.com</strong>.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
