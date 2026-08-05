"use client";

import { useAuth } from "@/hooks/useAuth";

// Hides guest content when student is logged in
export function HideWhenLoggedIn({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return null; // Brief flash prevention
  if (isLoggedIn) return null;
  return <>{children}</>;
}

// Shows student content only when logged in
export function ShowWhenLoggedIn({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return null;
  if (!isLoggedIn) return null;
  return <>{children}</>;
}
