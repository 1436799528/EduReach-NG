/** GPA engine types — pure domain model, no I/O. */

export interface GradeBand {
  letter: string;
  points: number;
  min: number; // inclusive score floor (0-100)
  max: number; // inclusive score ceiling (0-100)
}

export interface GradingScheme {
  key: string;
  name: string;
  /** Maximum attainable grade point (e.g. 5 for a 5.0 scale). */
  maxPoints: number;
  /** Ordered highest → lowest. */
  bands: GradeBand[];
}

export interface CourseEntry {
  creditUnits: number;
  gradePoints: number;
}

export interface GpaResult {
  gpa: number;
  qualityPoints: number;
  totalUnits: number;
}

export interface SemesterEntry {
  creditUnits: number;
  gpa: number;
}

export type TargetVerdict =
  | 'ALREADY_MET'
  | 'ACHIEVABLE'
  | 'CHALLENGING'
  | 'HARD'
  | 'VERY_HARD'
  | 'IMPOSSIBLE';

export interface TargetInput {
  currentCgpa: number;
  completedUnits: number;
  remainingUnits: number;
  targetCgpa: number;
  maxPoints: number;
}

export interface TargetScenario {
  averageGpa: number;
  finalCgpa: number;
  label: string;
}

export interface TargetResult {
  possible: boolean;
  verdict: TargetVerdict;
  requiredGpa: number;
  finalIfMax: number;
  scenarios: TargetScenario[];
  message: string;
}

export class GpaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GpaError';
  }
}
