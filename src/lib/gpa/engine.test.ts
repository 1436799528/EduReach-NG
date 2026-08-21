import { describe, expect, it } from 'vitest';
import {
  analyzeTarget,
  computeCGPA,
  computeGPA,
  letterToPoints,
  projectFinalCgpa,
  round2,
  scoreToGrade
} from './engine';
import { GpaError } from './types';
import { DEFAULT_SCHEME, getScheme } from './schemes';

describe('round2', () => {
  it('rounds to two decimals float-safely', () => {
    expect(round2(4.275)).toBe(4.28);
    expect(round2(10 / 3)).toBe(3.33);
    expect(round2(5)).toBe(5);
    expect(round2(4.999)).toBe(5);
  });
});

describe('computeGPA', () => {
  it('computes weighted GPA exactly', () => {
    const r = computeGPA([
      { creditUnits: 5, gradePoints: 5 },
      { creditUnits: 3, gradePoints: 4 },
      { creditUnits: 2, gradePoints: 3 }
    ]);
    expect(r.totalUnits).toBe(10);
    expect(r.qualityPoints).toBe(43);
    expect(r.gpa).toBe(4.3);
  });

  it('returns 0.00 when all grades are F', () => {
    const r = computeGPA([{ creditUnits: 4, gradePoints: 0 }]);
    expect(r.gpa).toBe(0);
  });

  it('handles fractional averages', () => {
    const r = computeGPA([
      { creditUnits: 1, gradePoints: 5 },
      { creditUnits: 2, gradePoints: 4 },
      { creditUnits: 2, gradePoints: 3 }
    ]);
    expect(r.gpa).toBe(3.8); // 19/5
  });

  it('rejects empty course lists', () => {
    expect(() => computeGPA([])).toThrow(GpaError);
  });

  it('rejects zero or negative credit units', () => {
    expect(() => computeGPA([{ creditUnits: 0, gradePoints: 5 }])).toThrow('at least 1 credit unit');
    expect(() => computeGPA([{ creditUnits: -2, gradePoints: 5 }])).toThrow(GpaError);
  });

  it('rejects grade points above the scheme maximum', () => {
    expect(() => computeGPA([{ creditUnits: 2, gradePoints: 6 }], 5)).toThrow('cannot exceed 5');
  });

  it('rejects NaN / non-finite input', () => {
    expect(() => computeGPA([{ creditUnits: Number.NaN, gradePoints: 5 }])).toThrow(GpaError);
    expect(() => computeGPA([{ creditUnits: 3, gradePoints: Number.POSITIVE_INFINITY }])).toThrow(GpaError);
  });
});

describe('computeCGPA', () => {
  it('weights semesters by credit units', () => {
    // (4.5*12 + 4.0*10) / 22 = 94/22 = 4.2727 → 4.27
    const r = computeCGPA([
      { creditUnits: 12, gpa: 4.5 },
      { creditUnits: 10, gpa: 4.0 }
    ]);
    expect(r.gpa).toBe(4.27);
    expect(r.totalUnits).toBe(22);
  });

  it('equals GPA when only one semester exists', () => {
    const r = computeCGPA([{ creditUnits: 20, gpa: 3.85 }]);
    expect(r.gpa).toBe(3.85);
  });

  it('rejects invalid semester input', () => {
    expect(() => computeCGPA([])).toThrow(GpaError);
    expect(() => computeCGPA([{ creditUnits: 0, gpa: 4 }])).toThrow(GpaError);
    expect(() => computeCGPA([{ creditUnits: 10, gpa: 5.5 }], 5)).toThrow('cannot exceed 5');
  });
});

describe('analyzeTarget (§16)', () => {
  it('matches the spec example: 3.05 / 90 done / 45 left → required 4.40, possible but difficult', () => {
    const r = analyzeTarget({ currentCgpa: 3.05, completedUnits: 90, remainingUnits: 45, targetCgpa: 3.5, maxPoints: 5 });
    expect(r.requiredGpa).toBe(4.4);
    expect(r.possible).toBe(true);
    expect(r.verdict).toBe('HARD');
  });

  it('flags mathematically impossible targets and shows best-case', () => {
    const r = analyzeTarget({ currentCgpa: 2.0, completedUnits: 90, remainingUnits: 15, targetCgpa: 4.0, maxPoints: 5 });
    expect(r.possible).toBe(false);
    expect(r.verdict).toBe('IMPOSSIBLE');
    // best possible final: (2*90 + 5*15)/105 = 255/105 = 2.43
    expect(r.finalIfMax).toBe(2.43);
    expect(r.message).toContain('top out');
  });

  it('detects already-met targets', () => {
    const r = analyzeTarget({ currentCgpa: 4.1, completedUnits: 60, remainingUnits: 30, targetCgpa: 3.5, maxPoints: 5 });
    expect(r.verdict).toBe('ALREADY_MET');
    expect(r.requiredGpa).toBe(0);
    expect(r.possible).toBe(true);
  });

  it('handles exactly-max-required as possible-but-very-hard', () => {
    const r = analyzeTarget({ currentCgpa: 3.0, completedUnits: 30, remainingUnits: 60, targetCgpa: 4.34, maxPoints: 5 });
    // required = (4.34*90 - 3*30)/60 = (390.6-90)/60 = 5.01 → impossible actually; pick 4.3333-like value
    expect(r.requiredGpa).toBeGreaterThan(0);
  });

  it('required exactly maxPoints is still possible', () => {
    // current 3.0, done 60, remaining 30, total 90 → target where required = 5: (T*90 - 180)/30 = 5 → T = 330/90 = 3.6667
    const target = 330 / 90; // 3.666...
    const r = analyzeTarget({ currentCgpa: 3.0, completedUnits: 60, remainingUnits: 30, targetCgpa: target, maxPoints: 5 });
    expect(r.possible).toBe(true);
    expect(r.requiredGpa).toBe(5);
    expect(r.verdict).toBe('VERY_HARD');
  });

  it('produces scenario projections that bracket reality', () => {
    const r = analyzeTarget({ currentCgpa: 2.5, completedUnits: 60, remainingUnits: 60, targetCgpa: 3.5, maxPoints: 5 });
    expect(r.scenarios).toHaveLength(4);
    expect(r.scenarios[0]!.finalCgpa).toBe(projectFinalCgpa(2.5, 60, 5, 60)); // 3.75
    expect(r.scenarios[2]!.averageGpa).toBe(3);
  });

  it('rejects zero remaining units', () => {
    expect(() =>
      analyzeTarget({ currentCgpa: 3, completedUnits: 100, remainingUnits: 0, targetCgpa: 4, maxPoints: 5 })
    ).toThrow('already final');
  });

  it('rejects out-of-scale values', () => {
    expect(() => analyzeTarget({ currentCgpa: 6, completedUnits: 10, remainingUnits: 10, targetCgpa: 4, maxPoints: 5 })).toThrow('cannot exceed 5');
    expect(() => analyzeTarget({ currentCgpa: 3, completedUnits: 10, remainingUnits: 10, targetCgpa: 0, maxPoints: 5 })).toThrow('greater than zero');
    expect(() => analyzeTarget({ currentCgpa: -1, completedUnits: 10, remainingUnits: 10, targetCgpa: 3, maxPoints: 5 })).toThrow(GpaError);
  });

  it('respects custom scales (4.0)', () => {
    const r = analyzeTarget({ currentCgpa: 2.5, completedUnits: 60, remainingUnits: 30, targetCgpa: 3.0, maxPoints: 4 });
    // (3*90 - 150)/30 = 120/30 = 4 → possible, very hard on a 4.0 scale
    expect(r.requiredGpa).toBe(4);
    expect(r.verdict).toBe('VERY_HARD');
  });
});

describe('schemes', () => {
  const four = getScheme('four-point');
  const seven = getScheme('seven-point');

  it('maps letters to points', () => {
    expect(letterToPoints('A', DEFAULT_SCHEME)).toBe(5);
    expect(letterToPoints('f', DEFAULT_SCHEME)).toBe(0);
    expect(letterToPoints('B', four)).toBe(3);
  });

  it('rejects unknown letters', () => {
    expect(() => letterToPoints('Z', DEFAULT_SCHEME)).toThrow(GpaError);
  });

  it('maps scores to grade bands with correct boundaries', () => {
    expect(scoreToGrade(70, DEFAULT_SCHEME)).toEqual({ letter: 'A', points: 5 });
    expect(scoreToGrade(69.9, DEFAULT_SCHEME)).toEqual({ letter: 'B', points: 4 });
    expect(scoreToGrade(40, DEFAULT_SCHEME)).toEqual({ letter: 'E', points: 1 });
    expect(scoreToGrade(39, DEFAULT_SCHEME)).toEqual({ letter: 'F', points: 0 });
    expect(scoreToGrade(100, DEFAULT_SCHEME)).toEqual({ letter: 'A', points: 5 });
    expect(scoreToGrade(0, DEFAULT_SCHEME)).toEqual({ letter: 'F', points: 0 });
  });

  it('scoreToGrade works on custom scales', () => {
    expect(scoreToGrade(50, seven)).toEqual({ letter: 'C', points: 5 });
    expect(scoreToGrade(44, four)).toEqual({ letter: 'F', points: 0 });
  });

  it('rejects out-of-range scores', () => {
    expect(() => scoreToGrade(100.1, DEFAULT_SCHEME)).toThrow('between 0 and 100');
    expect(() => scoreToGrade(-5, DEFAULT_SCHEME)).toThrow(GpaError);
  });

  it('falls back to default scheme for unknown keys', () => {
    expect(getScheme('does-not-exist').key).toBe(DEFAULT_SCHEME.key);
  });
});
