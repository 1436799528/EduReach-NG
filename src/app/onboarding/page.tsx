"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle, Loader2, ChevronRight } from "lucide-react";
import { getStoredUser, setStoredUser } from "@/lib/auth";

interface SelectItem { id: number; name: string; shortName?: string }

const LEVELS = [
  { id: 100, name: "100 Level" },
  { id: 200, name: "200 Level" },
  { id: 300, name: "300 Level" },
  { id: 400, name: "400 Level" },
  { id: 500, name: "500 Level" },
  { id: 600, name: "600 Level" },
];

const CURRENT_YEAR = new Date().getFullYear();
const ADMISSION_YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR - i);

export default function OnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);

  const [universities, setUniversities] = useState<SelectItem[]>([]);
  const [facultiesList, setFacultiesList] = useState<SelectItem[]>([]);
  const [departmentsList, setDepartmentsList] = useState<SelectItem[]>([]);

  const [universityId, setUniversityId] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [level, setLevel] = useState("");
  const [admissionYear, setAdmissionYear] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const u = getStoredUser();
    if (!u) { router.push("/login"); return; }
    if (u.onboardingComplete) { router.push("/dashboard"); return; }
    setUserId(u.id);

    fetch("/api/onboarding/universities").then((r) => r.json()).then(setUniversities).catch(() => {});
  }, [router]);

  // Cascading: university → faculties
  useEffect(() => {
    if (!universityId) { setFacultiesList([]); setFacultyId(""); return; }
    setFacultiesList([]); setFacultyId(""); setDepartmentsList([]); setDepartmentId("");
    fetch(`/api/onboarding/faculties?universityId=${universityId}`).then((r) => r.json()).then(setFacultiesList).catch(() => {});
  }, [universityId]);

  // Cascading: faculty → departments
  useEffect(() => {
    if (!facultyId) { setDepartmentsList([]); setDepartmentId(""); return; }
    setDepartmentsList([]); setDepartmentId("");
    fetch(`/api/onboarding/departments?facultyId=${facultyId}`).then((r) => r.json()).then(setDepartmentsList).catch(() => {});
  }, [facultyId]);

  const canSubmit = universityId && departmentId && level;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !canSubmit) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          universityId: parseInt(universityId),
          departmentId: parseInt(departmentId),
          level: parseInt(level),
          academicSession: admissionYear ? `${admissionYear}/${parseInt(admissionYear) + 1}` : null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStoredUser(data.user);
        router.push("/dashboard");
      } else {
        setError(data.message || "Failed.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <BookOpen className="w-7 h-7 text-accent-500" />
            <span className="font-heading text-xl font-extrabold text-brand-700">
              EduReach<span className="text-accent-500">Hub</span>
            </span>
          </div>
          <h1 className="font-heading text-xl font-bold text-slate-900">Academic Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Step 2 of 2 — Tell us about your school</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          {/* Institution */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Institution *</label>
            <select value={universityId} onChange={(e) => setUniversityId(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" required>
              <option value="">Select your institution</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>{u.shortName ? `${u.shortName} — ${u.name}` : u.name}</option>
              ))}
            </select>
          </div>

          {/* Faculty */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Faculty *</label>
            <select value={facultyId} onChange={(e) => setFacultyId(e.target.value)} disabled={!universityId} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50" required>
              <option value="">{universityId ? "Select faculty" : "Select institution first"}</option>
              {facultiesList.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} disabled={!facultyId} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50" required>
              <option value="">{facultyId ? "Select department" : "Select faculty first"}</option>
              {departmentsList.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Level + Admission Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Level *</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" required>
                <option value="">Level</option>
                {LEVELS.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admission Year</label>
              <select value={admissionYear} onChange={(e) => setAdmissionYear(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500">
                <option value="">Year</option>
                {ADMISSION_YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" disabled={submitting || !canSubmit} className="w-full py-3 bg-accent-500 text-white font-bold rounded-lg hover:bg-accent-600 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {submitting ? "Setting up..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
