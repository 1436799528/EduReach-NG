// ============================================
// EDUREACH HUB — TYPE DEFINITIONS
// Single source of truth for all data shapes
// ============================================

// === User ===
export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  gender?: string | null;
  role: "student" | "contributor" | "moderator" | "admin";
  level: number | null;
  programme?: string | null;
  semester?: string | null;
  points: number;
  currentStreak: number;
  longestStreak: number;
  questionsViewed: number;
  questionsSolved: number;
  practiceSessionsCompleted: number;
  onboardingComplete: boolean;
  universityId: number | null;
  departmentId: number | null;
  universityName?: string | null;
  departmentName?: string | null;
}

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

// === Academic ===
export interface University {
  id: number;
  name: string;
  shortName: string;
  location: string | null;
}

export interface Department {
  id: number;
  name: string;
  facultyName?: string;
  universityShortName?: string;
}

export interface Subject {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  fieldOfStudy: string | null;
  iconEmoji: string | null;
}

export interface Topic {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  notes?: string | null;
  formulas?: string | null;
  examTips?: string | null;
}

export interface Course {
  id: number;
  courseCode: string;
  courseTitle: string;
  creditUnit: number | null;
  semester: string | null;
  level: number | null;
  subjectName?: string;
  universityShortName?: string;
  questionCount?: number;
}

// === Questions ===
export interface Question {
  id: number;
  questionText: string;
  questionType?: string | null;
  marks: number | null;
  difficulty: "easy" | "medium" | "hard" | null;
  commandWord?: string | null;
  topicId: number;
}

export interface QuestionWithMeta extends Question {
  year?: number;
  hasSolution?: boolean;
  appearanceCount?: number;
  topicName?: string;
  subjectName?: string;
}

export interface Solution {
  id: number;
  questionId: number;
  solutionText: string;
  explanation?: string | null;
  commonMistakes?: string | null;
  marksAllocation?: string | null;
  hints?: string | null;
}

// === Uploads ===
export interface Upload {
  id: number;
  title: string;
  type: string;
  content: string;
  status: "pending" | "approved" | "rejected" | null;
  year?: number | null;
  userId: number;
  contributorName?: string;
  createdAt: string;
}

export interface FileUpload {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  title: string | null;
  status: "pending" | "approved" | "rejected" | null;
  createdAt: string;
}

// === Community ===
export interface CommunityPost {
  id: number;
  title: string | null;
  content: string;
  postType: string;
  upvotes: number;
  downvotes: number;
  isAcceptedAnswer: boolean;
  createdAt: string;
  authorName: string;
  authorId: number;
  authorPoints: number | null;
  replyCount: number;
}

// === Calendar ===
export interface AcademicEvent {
  id: number;
  title: string;
  description: string | null;
  eventType: string;
  startDate: string;
  endDate: string | null;
  semester: string | null;
  session: string | null;
  universityShortName: string | null;
}

// === Dashboard ===
export interface DashboardData {
  profile: User;
  stats: {
    bookmarkCount: number;
    uploadCount: number;
    approvedUploads: number;
    avgScore: number;
  };
  recentSessions: PracticeSession[];
  recentUploads: Upload[];
  recentFiles: FileUpload[];
  achievements: Achievement[];
}

export interface PracticeSession {
  id: number;
  totalQuestions: number;
  correctAnswers: number | null;
  score: number | null;
  createdAt: string;
}

export interface Achievement {
  name: string;
  iconEmoji: string;
  description: string;
  earnedAt?: string;
}

// === Leaderboard ===
export interface LeaderEntry {
  id: number;
  fullName: string;
  points: number | null;
  currentStreak?: number | null;
  longestStreak?: number | null;
  questionsSolved?: number | null;
  level: number | null;
  departmentName: string | null;
  universityShortName: string | null;
  totalUploads?: number;
  approvedUploads?: number;
}

// === API Response ===
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// === Intelligence ===
export interface ExamInsights {
  totalExamsAnalyzed: number;
  totalQuestions: number;
  yearsRange: string;
  mostTestedTopic: string;
  mostTestedTopicPercentage: number;
  dominantDifficulty: string;
  mostCommonCommandWord: string;
  questionsRepeated4Plus: number;
}

export interface TopicFrequency {
  name: string;
  count: number;
  percentage: number;
}
