"use client";

import { useState, useEffect } from "react";
import { getStoredUser, clearStoredUser, setStoredUser } from "@/lib/auth";
import type { StoredUser } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    clearStoredUser();
    window.location.href = "/";
  };

  const updateUser = (data: Partial<StoredUser>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setStoredUser(updated);
    setUser(updated);
  };

  return {
    user,
    loading,
    isLoggedIn: !!user,
    isAdmin: user?.role === "admin" || user?.role === "moderator",
    logout,
    updateUser,
  };
}
