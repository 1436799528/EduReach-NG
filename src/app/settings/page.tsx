"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import {
  Settings,
  Key,
  Download,
  Trash2,
  LogOut,
  Bell,
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  User,
} from "lucide-react";

export default function SettingsPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Password form
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");

  // Notifications
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPractice, setNotifyPractice] = useState(true);
  const [notifyUploads, setNotifyUploads] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("edureach_user");
    if (stored) setUserId(JSON.parse(stored).id);
  }, []);

  const doAction = async (action: string, extra: Record<string, unknown> = {}) => {
    if (!userId) return;
    setLoading(action);
    setResult(null);
    try {
      const res = await fetch("/api/auth/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, ...extra }),
      });
      const data = await res.json();
      setResult({ success: data.success, message: data.message });

      if (data.success && action === "download_data") {
        // Download as JSON file
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `edureach-data-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }

      if (data.success && action === "signout_all") {
        localStorage.removeItem("edureach_user");
        window.location.href = "/login";
      }
    } catch {
      setResult({ success: false, message: "Action failed." });
    } finally {
      setLoading(null);
    }
  };

  const saveNotifications = async () => {
    if (!userId) return;
    setLoading("notifications");
    try {
      await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, notifyEmail, notifyPractice, notifyUploads }),
      });
      setResult({ success: true, message: "Notification preferences saved." });
    } catch {
      setResult({ success: false, message: "Failed to save." });
    } finally {
      setLoading(null);
    }
  };

  if (!userId) {
    return (
      <>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Sign in to access settings</h1>
          <a href="/login" className="inline-flex px-6 py-3 bg-brand-700 text-white font-medium rounded-lg mt-4">Login</a>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb items={[{ label: "Settings" }]} />
        <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-2">
          <Settings className="w-7 h-7 text-brand-600" />
          Account Settings
        </h1>

        {/* Result toast */}
        {result && (
          <div className={`flex items-center gap-2 p-4 rounded-xl border mb-6 ${result.success ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
            {result.success ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <p className="text-sm">{result.message}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Change Password */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-slate-500" />
              Change Password
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <input type="password" placeholder="Current password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <input type="password" placeholder="New password (min 6 chars)" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <button
              onClick={() => doAction("change_password", { currentPassword: currentPw, newPassword: newPw })}
              disabled={loading === "change_password" || !currentPw || newPw.length < 6}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-700 text-white text-sm font-semibold rounded-xl hover:bg-brand-800 transition disabled:opacity-50"
            >
              {loading === "change_password" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Update Password
            </button>
          </div>

          {/* Notifications */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-500" />
              Notification Preferences
            </h2>
            <div className="space-y-3 mb-4">
              {[
                { label: "Email notifications", value: notifyEmail, setter: setNotifyEmail },
                { label: "Practice reminders", value: notifyPractice, setter: setNotifyPractice },
                { label: "Upload status updates", value: notifyUploads, setter: setNotifyUploads },
              ].map((item) => (
                <label key={item.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
                  <span className="text-sm text-slate-700">{item.label}</span>
                  <input type="checkbox" checked={item.value} onChange={(e) => item.setter(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                </label>
              ))}
            </div>
            <button onClick={saveNotifications} disabled={loading === "notifications"} className="px-5 py-2.5 bg-brand-700 text-white text-sm font-semibold rounded-xl hover:bg-brand-800 transition disabled:opacity-50">
              Save Preferences
            </button>
          </div>

          {/* Download Data */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Download className="w-5 h-5 text-slate-500" />
              Download My Data
            </h2>
            <p className="text-sm text-slate-500 mb-4">Export all your personal data as a JSON file.</p>
            <button onClick={() => doAction("download_data")} disabled={loading === "download_data"} className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition disabled:opacity-50">
              {loading === "download_data" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download Data
            </button>
          </div>

          {/* Sign Out All Devices */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <LogOut className="w-5 h-5 text-slate-500" />
              Sign Out from All Devices
            </h2>
            <p className="text-sm text-slate-500 mb-4">This will log you out everywhere, including this device.</p>
            <button onClick={() => doAction("signout_all")} disabled={loading === "signout_all"} className="flex items-center gap-2 px-5 py-2.5 bg-amber-100 text-amber-700 text-sm font-semibold rounded-xl hover:bg-amber-200 transition disabled:opacity-50">
              {loading === "signout_all" ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              Sign Out All
            </button>
          </div>

          {/* Delete Account */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="font-bold text-red-800 mb-2 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete Account
            </h2>
            <p className="text-sm text-red-600 mb-4">
              Your account will be scheduled for permanent deletion in 30 days.
              You can cancel anytime during the grace period.
            </p>
            <button
              onClick={() => {
                if (confirm("Are you sure? Your account will be deleted in 30 days.")) {
                  doAction("request_deletion");
                }
              }}
              disabled={loading === "request_deletion"}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading === "request_deletion" ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
              Delete My Account
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
