import type { GradingScheme } from './types';

/**
 * Configurable grading schemes (§15). The engine never hard-codes one
 * institution's scale — schemes are data. Admins can register more later.
 */
export const GRADING_SCHEMES: GradingScheme[] = [
  {
    key: 'five-point',
    name: '5.0 scale (A–F)',
    maxPoints: 5,
    bands: [
      { letter: 'A', points: 5, min: 70, max: 100 },
      { letter: 'B', points: 4, min: 60, max: 69.99 },
      { letter: 'C', points: 3, min: 50, max: 59.99 },
      { letter: 'D', points: 2, min: 45, max: 49.99 },
      { letter: 'E', points: 1, min: 40, max: 44.99 },
      { letter: 'F', points: 0, min: 0, max: 39.99 }
    ]
  },
  {
    key: 'four-point',
    name: '4.0 scale (A–F)',
    maxPoints: 4,
    bands: [
      { letter: 'A', points: 4, min: 70, max: 100 },
      { letter: 'B', points: 3, min: 60, max: 69.99 },
      { letter: 'C', points: 2, min: 50, max: 59.99 },
      { letter: 'D', points: 1, min: 45, max: 49.99 },
      { letter: 'F', points: 0, min: 0, max: 44.99 }
    ]
  },
  {
    key: 'seven-point',
    name: '7.0 scale',
    maxPoints: 7,
    bands: [
      { letter: 'A', points: 7, min: 70, max: 100 },
      { letter: 'B', points: 6, min: 60, max: 69.99 },
      { letter: 'C', points: 5, min: 50, max: 59.99 },
      { letter: 'D', points: 4, min: 45, max: 49.99 },
      { letter: 'E', points: 3, min: 40, max: 44.99 },
      { letter: 'P', points: 2, min: 35, max: 39.99 },
      { letter: 'F', points: 0, min: 0, max: 34.99 }
    ]
  }
];

export const DEFAULT_SCHEME = GRADING_SCHEMES[0]!;

export function getScheme(key: string): GradingScheme {
  const scheme = GRADING_SCHEMES.find((s) => s.key === key);
  return scheme ?? DEFAULT_SCHEME;
}
