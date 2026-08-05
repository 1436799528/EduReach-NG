// Safe localStorage helper — never crashes
export interface StoredUser {
  id: number;
  email: string;
  fullName: string;
  role: string;
  level: number | null;
  points: number;
  currentStreak: number;
  onboardingComplete: boolean;
  universityId: number | null;
  departmentId: number | null;
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem("edureach_user");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!parsed || !parsed.id || !parsed.email) return null;
    return parsed as StoredUser;
  } catch {
    // Corrupted data — clear it
    try {
      localStorage.removeItem("edureach_user");
    } catch {
      // Ignore
    }
    return null;
  }
}

export function setStoredUser(user: StoredUser): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("edureach_user", JSON.stringify(user));
  } catch {
    // Storage full or blocked
  }
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("edureach_user");
  } catch {
    // Ignore
  }
}
