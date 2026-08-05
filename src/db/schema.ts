import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);

export const uploadStatusEnum = pgEnum("upload_status", [
  "pending",
  "approved",
  "rejected",
]);

export const userRoleEnum = pgEnum("user_role", [
  "student",
  "contributor",
  "moderator",
  "admin",
]);

// ============================================
// INSTITUTIONAL HIERARCHY
// ============================================

export const universities = pgTable("universities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  shortName: varchar("short_name", { length: 50 }).notNull().unique(),
  location: varchar("location", { length: 255 }),
  logoUrl: varchar("logo_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const faculties = pgTable("faculties", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  universityId: integer("university_id")
    .references(() => universities.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  facultyId: integer("faculty_id")
    .references(() => faculties.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// ACADEMIC KNOWLEDGE HIERARCHY (Universal)
// ============================================

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  fieldOfStudy: varchar("field_of_study", { length: 255 }),
  iconEmoji: varchar("icon_emoji", { length: 10 }).default("📚"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  subjectId: integer("subject_id")
    .references(() => subjects.id)
    .notNull(),
  orderIndex: integer("order_index").default(0),
  // Topic-level content
  notes: text("notes"),
  formulas: text("formulas"),
  examTips: text("exam_tips"),
  // AI Knowledge Base fields
  definitions: text("definitions"),
  examples: text("examples"),
  revisionNotes: text("revision_notes"),
  aiGenerated: boolean("ai_generated").default(false),
  aiReviewedBy: integer("ai_reviewed_by"),
  aiReviewedAt: timestamp("ai_reviewed_at"),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// UNIVERSITY-SPECIFIC COURSE MAPPING
// ============================================

export const universityCourses = pgTable("university_courses", {
  id: serial("id").primaryKey(),
  courseCode: varchar("course_code", { length: 20 }).notNull(),
  courseTitle: varchar("course_title", { length: 255 }).notNull(),
  departmentId: integer("department_id")
    .references(() => departments.id)
    .notNull(),
  subjectId: integer("subject_id")
    .references(() => subjects.id)
    .notNull(),
  creditUnit: integer("credit_unit"),
  semester: varchar("semester", { length: 20 }),
  level: integer("level"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// QUESTIONS (Belong to Topics)
// ============================================

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  questionText: text("question_text").notNull(),
  questionNumber: integer("question_number"),
  questionType: varchar("question_type", { length: 50 }).default("theory"),
  marks: integer("marks"),
  difficulty: difficultyEnum("difficulty").default("medium"),
  topicId: integer("topic_id")
    .references(() => topics.id)
    .notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  // Command word analysis
  commandWord: varchar("command_word", { length: 50 }), // Explain, Derive, State, Design, Calculate
  status: uploadStatusEnum("status").default("approved"),
  contributorId: integer("contributor_id").references(() => users.id),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questionAppearances = pgTable("question_appearances", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id")
    .references(() => questions.id)
    .notNull(),
  universityCourseId: integer("university_course_id")
    .references(() => universityCourses.id)
    .notNull(),
  year: integer("year").notNull(),
  examType: varchar("exam_type", { length: 50 }).default("main"), // main, resit, test
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// SOLUTIONS
// ============================================

export const solutions = pgTable("solutions", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id")
    .references(() => questions.id)
    .notNull(),
  solutionText: text("solution_text").notNull(),
  explanation: text("explanation"),
  alternativeSolution: text("alternative_solution"),
  commonMistakes: text("common_mistakes"),
  marksAllocation: text("marks_allocation"),
  hints: text("hints"),
  status: uploadStatusEnum("status").default("approved"),
  contributorId: integer("contributor_id").references(() => users.id),
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// USERS & GAMIFICATION
// ============================================

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  gender: varchar("gender", { length: 20 }),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  role: userRoleEnum("role").default("student"),
  // Institution context
  universityId: integer("university_id").references(() => universities.id),
  departmentId: integer("department_id").references(() => departments.id),
  level: integer("level"),
  programme: varchar("programme", { length: 255 }),
  semester: varchar("semester", { length: 20 }),
  academicSession: varchar("academic_session", { length: 20 }), // e.g. 2024/2025
  // Verification
  isVerified: boolean("is_verified").default(false),
  verificationDoc: varchar("verification_doc", { length: 500 }),
  // Preferences
  theme: varchar("theme", { length: 20 }).default("light"),
  notifyEmail: boolean("notify_email").default(true),
  notifyPractice: boolean("notify_practice").default(true),
  notifyUploads: boolean("notify_uploads").default(true),
  // Contribution Economy
  credits: integer("credits").default(5), // New users start with 5 free credits
  totalDownloads: integer("total_downloads").default(0),
  // Gamification
  points: integer("points").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActiveDate: varchar("last_active_date", { length: 20 }),
  questionsViewed: integer("questions_viewed").default(0),
  questionsSolved: integer("questions_solved").default(0),
  practiceSessionsCompleted: integer("practice_sessions_completed").default(0),
  // Status
  onboardingComplete: boolean("onboarding_complete").default(false),
  emailVerified: boolean("email_verified").default(false),
  // Moderation
  warningCount: integer("warning_count").default(0),
  isSuspended: boolean("is_suspended").default(false),
  suspendedUntil: timestamp("suspended_until"),
  isBanned: boolean("is_banned").default(false),
  // Deletion
  isDeleted: boolean("is_deleted").default(false),
  deletionRequestedAt: timestamp("deletion_requested_at"),
  deletionScheduledFor: timestamp("deletion_scheduled_for"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User achievements/badges
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  iconEmoji: varchar("icon_emoji", { length: 10 }).notNull(),
  requirement: varchar("requirement", { length: 100 }).notNull(), // e.g., "questions_viewed:100"
  points: integer("points").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  achievementId: integer("achievement_id")
    .references(() => achievements.id)
    .notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// ============================================
// USER ACTIVITY
// ============================================

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  questionId: integer("question_id")
    .references(() => questions.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const practiceAttempts = pgTable("practice_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  questionId: integer("question_id")
    .references(() => questions.id)
    .notNull(),
  userAnswer: text("user_answer"),
  isCorrect: boolean("is_correct"),
  timeTaken: integer("time_taken"), // seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const practiceSessions = pgTable("practice_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  subjectId: integer("subject_id").references(() => subjects.id),
  topicId: integer("topic_id").references(() => topics.id),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").default(0),
  score: integer("score").default(0),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Track which questions user has viewed (for recommendations)
export const questionViews = pgTable("question_views", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  questionId: integer("question_id")
    .references(() => questions.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// CONTINUE LEARNING / STUDY PROGRESS
// ============================================

// Tracks the last thing a student was studying
export const studyProgress = pgTable("study_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  subjectId: integer("subject_id").references(() => subjects.id),
  topicId: integer("topic_id").references(() => topics.id),
  universityCourseId: integer("university_course_id").references(
    () => universityCourses.id
  ),
  lastQuestionId: integer("last_question_id").references(() => questions.id),
  progressPercent: integer("progress_percent").default(0),
  questionsCompleted: integer("questions_completed").default(0),
  totalQuestions: integer("total_questions").default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Course code aliases — maps alternative codes to the same subject
export const courseAliases = pgTable("course_aliases", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id")
    .references(() => subjects.id)
    .notNull(),
  courseCode: varchar("course_code", { length: 20 }).notNull(),
  universityShortName: varchar("university_short_name", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Track what users search for — drives "Popular Topics"
export const searchLog = pgTable("search_log", {
  id: serial("id").primaryKey(),
  query: varchar("query", { length: 255 }).notNull(),
  userId: integer("user_id").references(() => users.id),
  resultCount: integer("result_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// CONTRIBUTIONS & MODERATION
// ============================================

export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // past_question, solution, notes, material
  content: text("content").notNull(),
  topicId: integer("topic_id").references(() => topics.id),
  universityCourseId: integer("university_course_id").references(
    () => universityCourses.id
  ),
  year: integer("year"),
  status: uploadStatusEnum("status").default("pending"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewNote: text("review_note"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// reports table removed — V2

// ============================================
// NOTIFICATIONS
// ============================================

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  link: varchar("link", { length: 500 }),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// AUDIT LOG
// ============================================

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: integer("entity_id"),
  details: text("details"),
  ipAddress: varchar("ip_address", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// FILE UPLOADS (Supabase Storage metadata)
// ============================================

export const fileUploads = pgTable("file_uploads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  fileName: varchar("file_name", { length: 500 }).notNull(),
  fileType: varchar("file_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(),
  storagePath: varchar("storage_path", { length: 1000 }).notNull(),
  publicUrl: varchar("public_url", { length: 1000 }),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  category: varchar("category", { length: 50 }),
  uploadId: integer("upload_id").references(() => uploads.id),
  status: uploadStatusEnum("status").default("pending"),
  downloadCount: integer("download_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// V2 tables removed: academic_events, community_posts, community_votes, reports

// ============================================
// USER WARNINGS & MODERATION
// ============================================

export const userWarnings = pgTable("user_warnings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  issuedBy: integer("issued_by").references(() => users.id),
  level: integer("level").notNull(), // 1=warning, 2=restriction, 3=suspension, 4=ban
  reason: varchar("reason", { length: 255 }).notNull(),
  details: text("details"),
  postId: integer("post_id"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// CAMPUS UPDATES (Admin-posted announcements)
// ============================================

export const campusUpdates = pgTable("campus_updates", {
  id: serial("id").primaryKey(),
  universityId: integer("university_id").references(() => universities.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  category: varchar("category", { length: 50 }).default("academic"), // academic, scholarship, general, exam
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// MISSING PAPERS (what students need most)
// ============================================

export const missingPapers = pgTable("missing_papers", {
  id: serial("id").primaryKey(),
  courseCode: varchar("course_code", { length: 20 }),
  courseTitle: varchar("course_title", { length: 255 }).notNull(),
  universityShortName: varchar("university_short_name", { length: 50 }),
  year: integer("year"),
  requestCount: integer("request_count").default(1),
  isFulfilled: boolean("is_fulfilled").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// DOWNLOAD LOG (tracks credit usage)
// ============================================

export const downloadLog = pgTable("download_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  uploadId: integer("upload_id").references(() => uploads.id),
  fileUploadId: integer("file_upload_id").references(() => fileUploads.id),
  creditsCost: integer("credits_cost").default(5),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
