"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, AlertCircle, Eye, EyeOff, Check } from "lucide-react";
import { setStoredUser } from "@/lib/auth";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password strength
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordStrong = hasLength && hasUpper && hasLower && hasNumber;
  const passwordsMatch = password === confirmPw && confirmPw.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("All fields are required.");
      return;
    }
    if (!passwordStrong) {
      setError("Password must be at least 8 characters with uppercase, lowercase, and a number.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName: `${firstName.trim()} ${lastName.trim()}`,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Registration failed.");
      } else {
        setStoredUser(data.user);
        if (data.user.onboardingComplete) {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/onboarding";
        }
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const StrengthDot = ({ met }: { met: boolean }) => (
    <span className={`flex items-center gap-1 text-xs ${met ? "text-green-600" : "text-slate-400"}`}>
      {met ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-slate-300 inline-block" />}
    </span>
  );

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <BookOpen className="w-7 h-7 text-accent-500" />
              <span className="font-heading text-xl font-extrabold text-brand-700">
                EduReach<span className="text-accent-500">Hub</span>
              </span>
            </div>
            <h1 className="font-heading text-xl font-bold text-slate-900">Create your account</h1>
            <p className="text-sm text-slate-500 mt-1">Step 1 of 2 — Personal information</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" placeholder="you@example.com" required />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2.5 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="grid grid-cols-2 gap-1 mt-2">
                  <span className="flex items-center gap-1 text-xs"><StrengthDot met={hasLength} /> 8+ characters</span>
                  <span className="flex items-center gap-1 text-xs"><StrengthDot met={hasUpper} /> Uppercase</span>
                  <span className="flex items-center gap-1 text-xs"><StrengthDot met={hasLower} /> Lowercase</span>
                  <span className="flex items-center gap-1 text-xs"><StrengthDot met={hasNumber} /> Number</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
              <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 ${confirmPw.length > 0 && !passwordsMatch ? "border-red-300" : "border-slate-300"}`} required />
              {confirmPw.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-600 mt-1">Passwords do not match.</p>
              )}
            </div>

            <button type="submit" disabled={loading || !passwordStrong || !passwordsMatch} className="w-full py-3 bg-accent-500 text-white font-bold rounded-lg hover:bg-accent-600 transition disabled:opacity-50 text-sm">
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-xs text-center text-slate-500">
              Already have an account? <Link href="/login" className="text-accent-600 font-semibold">Login</Link>
            </p>
          </form>

          <p className="text-[10px] text-center text-slate-400 mt-3">
            By creating an account, you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
