"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { fetchProfile } from "@/services/auth";
import type { DashboardData } from "@/types";

export function useDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchProfile(user.id)
      .then((res) => {
        if (res.success) {
          setData(res.data as DashboardData);
        } else {
          setError(res.message || "Failed to load dashboard.");
        }
      })
      .catch(() => setError("Could not connect to server."))
      .finally(() => setLoading(false));
  }, [user]);

  return { user, data, loading, error };
}
