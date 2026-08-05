// ============================================
// EDUREACH HUB — CONSTANTS
// ============================================

export const SUPER_ADMIN_EMAIL = "jamesjulius176@gmail.com";

export const UPLOAD_TYPES = [
  { key: "past_question", label: "Past Question", points: 15, emoji: "📝" },
  { key: "solution", label: "Solution", points: 20, emoji: "✅" },
  { key: "notes", label: "Notes", points: 10, emoji: "📒" },
  { key: "material", label: "Material", points: 10, emoji: "📄" },
  { key: "correction", label: "Correction", points: 5, emoji: "🔧" },
] as const;

export const DIFFICULTY_COLORS = {
  easy: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  hard: "bg-red-100 text-red-700 border-red-200",
} as const;

export const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
} as const;

export const ALLOWED_FILE_EXTENSIONS = [
  "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx",
  "txt", "csv", "zip", "rar",
  "png", "jpg", "jpeg", "webp", "svg",
] as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const LEVELS = [100, 200, 300, 400, 500] as const;

export const SEMESTERS = ["First", "Second"] as const;

export const EVENT_TYPES = [
  { key: "exam", label: "Exam", emoji: "📝", color: "border-l-red-500 bg-red-50" },
  { key: "registration", label: "Registration", emoji: "📋", color: "border-l-blue-500 bg-blue-50" },
  { key: "lecture", label: "Lecture", emoji: "📚", color: "border-l-green-500 bg-green-50" },
  { key: "siwes", label: "SIWES", emoji: "🏭", color: "border-l-purple-500 bg-purple-50" },
  { key: "holiday", label: "Holiday", emoji: "🎉", color: "border-l-amber-500 bg-amber-50" },
  { key: "deadline", label: "Deadline", emoji: "⏰", color: "border-l-orange-500 bg-orange-50" },
] as const;

export const COMMAND_WORDS = [
  "Explain", "State", "Derive", "Design", "Calculate",
  "Compare", "Simplify", "Define", "List", "Describe",
  "Solve", "Find", "Determine", "Show", "Prove",
  "Convert", "Implement", "Sketch", "Draw",
] as const;

export const WARNING_LEVELS = {
  1: { label: "Friendly Warning", icon: "⚠️" },
  2: { label: "Temporary Restriction", icon: "🚫" },
  3: { label: "Account Suspension", icon: "🔒" },
  4: { label: "Permanent Ban", icon: "❌" },
} as const;

export const POINTS_TABLE = {
  upload_question: 15,
  upload_solution: 20,
  upload_notes: 10,
  upload_material: 10,
  upload_correction: 5,
  upload_approved: 10,
  practice_completed: 2,
  perfect_score: 5,
  onboarding_complete: 5,
  daily_login: 1,
  community_post: 2,
} as const;
