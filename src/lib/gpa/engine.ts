import {
  GpaError,
  type CourseEntry,
  type GpaResult,
  type GradingScheme,
  type SemesterEntry,
  type TargetInput,
  type TargetResult,
  type TargetScenario
} from './types';

/** Round to 2 decimal places in a float-safe way. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function assertFinite(value: number, label: string): void {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new GpaError(`Please enter a valid ${label}.`);
  }
}

/** Letter → grade points for a scheme. */
export function letterToPoints(letter: string, scheme: GradingScheme): number {
  const band = scheme.bands.find((b) => b.letter.toUpperCase() === letter.trim().toUpperCase());
  if (!band) throw new GpaError(`Unknown grade "${letter}" for this grading scheme.`);
  return band.points;
}

/** Score (0–100) → grade band for a scheme. */
export function scoreToGrade(score: number, scheme: GradingScheme): { letter: string; points: number } {
  assertFinite(score, 'score');
  if (score < 0 || score > 100) throw new GpaError('Scores must be between 0 and 100.');
  const band = scheme.bands.find((b) => score >= b.min && score <= b.max);
  if (!band) {
    // Defensive: schemes must cover 0..100 without gaps; treat as F-equivalent lowest band.
    const lowest = scheme.bands[scheme.bands.length - 1];
    if (!lowest) throw new GpaError('Grading scheme is not configured correctly.');
    return { letter: lowest.letter, points: lowest.points };
  }
  return { letter: band.letter, points: band.points };
}

/**
 * GPA = Σ(creditUnits × gradePoints) / Σ(creditUnits).
 * Throws GpaError on invalid/empty input.
 */
export function computeGPA(courses: CourseEntry[], maxPoints?: number): GpaResult {
  if (!Array.isArray(courses) || courses.length === 0) {
    throw new GpaError('Add at least one course to calculate GPA.');
  }
  let qualityPoints = 0;
  let totalUnits = 0;
  for (const c of courses) {
    assertFinite(c.creditUnits, 'credit unit');
    assertFinite(c.gradePoints, 'grade points');
    if (c.creditUnits <= 0) throw new GpaError('Every course must have at least 1 credit unit.');
    if (c.gradePoints < 0) throw new GpaError('Grade points cannot be negative.');
    if (maxPoints !== undefined && c.gradePoints > maxPoints) {
      throw new GpaError(`Grade points cannot exceed ${maxPoints} on this scale.`);
    }
    qualityPoints += c.creditUnits * c.gradePoints;
    totalUnits += c.creditUnits;
  }
  if (totalUnits <= 0) throw new GpaError('Total credit units must be greater than zero.');
  return { gpa: round2(qualityPoints / totalUnits), qualityPoints, totalUnits };
}

/**
 * CGPA from a list of semesters: Σ(gpa × units) / Σ(units).
 */
export function computeCGPA(semesters: SemesterEntry[], maxPoints?: number): GpaResult {
  if (!Array.isArray(semesters) || semesters.length === 0) {
    throw new GpaError('Add at least one semester to calculate CGPA.');
  }
  let qualityPoints = 0;
  let totalUnits = 0;
  for (const s of semesters) {
    assertFinite(s.creditUnits, 'credit unit');
    assertFinite(s.gpa, 'GPA');
    if (s.creditUnits <= 0) throw new GpaError('Each semester must have at least 1 credit unit.');
    if (s.gpa < 0) throw new GpaError('GPA cannot be negative.');
    if (maxPoints !== undefined && s.gpa > maxPoints) {
      throw new GpaError(`GPA cannot exceed ${maxPoints} on this scale.`);
    }
    qualityPoints += s.gpa * s.creditUnits;
    totalUnits += s.creditUnits;
  }
  if (totalUnits <= 0) throw new GpaError('Total credit units must be greater than zero.');
  return { gpa: round2(qualityPoints / totalUnits), qualityPoints, totalUnits };
}

/** Final CGPA if a student averages `averageGpa` across `remainingUnits`. */
export function projectFinalCgpa(
  currentCgpa: number,
  completedUnits: number,
  averageGpa: number,
  remainingUnits: number
): number {
  const total = completedUnits + remainingUnits;
  if (total <= 0) return 0;
  return round2((currentCgpa * completedUnits + averageGpa * remainingUnits) / total);
}

/**
 * §16 — "Can I still get this CGPA?"
 * required GPA = (target × (done + remaining) − current × done) / remaining
 */
export function analyzeTarget(input: TargetInput): TargetResult {
  const { currentCgpa, completedUnits, remainingUnits, targetCgpa, maxPoints } = input;

  assertFinite(currentCgpa, 'CGPA');
  assertFinite(completedUnits, 'credit unit');
  assertFinite(remainingUnits, 'credit unit');
  assertFinite(targetCgpa, 'target CGPA');
  assertFinite(maxPoints, 'grading scale');

  if (maxPoints <= 0) throw new GpaError('Grading scale is not configured correctly.');
  if (completedUnits < 0) throw new GpaError('Completed credit units cannot be negative.');
  if (remainingUnits <= 0) {
    throw new GpaError('Remaining credit units must be greater than zero. If you have completed your programme, your CGPA is already final.');
  }
  if (currentCgpa < 0) throw new GpaError('Your current CGPA cannot be negative.');
  if (currentCgpa > maxPoints) throw new GpaError(`Current CGPA cannot exceed ${maxPoints} on this scale.`);
  if (targetCgpa <= 0) throw new GpaError('Target CGPA must be greater than zero.');
  if (targetCgpa > maxPoints) throw new GpaError(`Target CGPA cannot exceed ${maxPoints} on this scale.`);

  const scenarios: TargetScenario[] = [
    { averageGpa: maxPoints, finalCgpa: projectFinalCgpa(currentCgpa, completedUnits, maxPoints, remainingUnits), label: 'Perfect grades from here' },
    { averageGpa: round2(maxPoints * 0.8), finalCgpa: projectFinalCgpa(currentCgpa, completedUnits, maxPoints * 0.8, remainingUnits), label: `If you average ${(maxPoints * 0.8).toFixed(1)}` },
    { averageGpa: round2(maxPoints * 0.6), finalCgpa: projectFinalCgpa(currentCgpa, completedUnits, maxPoints * 0.6, remainingUnits), label: `If you average ${(maxPoints * 0.6).toFixed(1)}` },
    { averageGpa: round2(maxPoints * 0.4), finalCgpa: projectFinalCgpa(currentCgpa, completedUnits, maxPoints * 0.4, remainingUnits), label: `If you average ${(maxPoints * 0.4).toFixed(1)}` }
  ];

  const finalIfMax = scenarios[0]!.finalCgpa;

  if (currentCgpa >= targetCgpa) {
    return {
      possible: true,
      verdict: 'ALREADY_MET',
      requiredGpa: 0,
      finalIfMax,
      scenarios,
      message: `You have already met or passed ${targetCgpa.toFixed(2)}. Hold steady at ${currentCgpa.toFixed(2)} or push higher.`
    };
  }

  const requiredRaw = (targetCgpa * (completedUnits + remainingUnits) - currentCgpa * completedUnits) / remainingUnits;
  const requiredGpa = round2(requiredRaw);

  if (requiredRaw > maxPoints) {
    return {
      possible: false,
      verdict: 'IMPOSSIBLE',
      requiredGpa,
      finalIfMax,
      scenarios,
      message: `Not mathematically possible anymore. Even perfect grades from here top out at ${finalIfMax.toFixed(2)}. Consider a more realistic target like ${finalIfMax.toFixed(2)} — still a strong finish.`
    };
  }

  const ratio = requiredRaw / maxPoints;
  if (ratio <= 0.55) {
    return { possible: true, verdict: 'ACHIEVABLE', requiredGpa, finalIfMax, scenarios, message: `Achievable with consistent effort — you need to average ${requiredGpa.toFixed(2)} over your remaining ${remainingUnits} units.` };
  }
  if (ratio <= 0.7) {
    return { possible: true, verdict: 'CHALLENGING', requiredGpa, finalIfMax, scenarios, message: `Challenging but realistic — an average of ${requiredGpa.toFixed(2)} is needed. Target mostly A/B grades.` };
  }
  if (ratio <= 0.9) {
    return { possible: true, verdict: 'HARD', requiredGpa, finalIfMax, scenarios, message: `Possible but difficult — you need an average of ${requiredGpa.toFixed(2)}. Plan your courses and protect your reading time.` };
  }
  return { possible: true, verdict: 'VERY_HARD', requiredGpa, finalIfMax, scenarios, message: `Possible, but extremely demanding — nearly perfect grades (average ${requiredGpa.toFixed(2)}) are required.` };
}
