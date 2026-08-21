export type Grade = { grade: string; point: number }

export function calculateGpa(rows: { units: number; point: number }[]) {
  const units = rows.reduce((s, r) => s + r.units, 0)
  if (!units) return 0
  return rows.reduce((s, r) => s + r.units * r.point, 0) / units
}

export function calculateRequiredGpa(currentCgpa: number, completedCredits: number, remainingCredits: number, targetCgpa: number) {
  if (remainingCredits <= 0) return null
  return (targetCgpa * (completedCredits + remainingCredits) - currentCgpa * completedCredits) / remainingCredits
}

export function targetStatus(required: number, scale: number) {
  if (required <= 0) return { label: 'Already achieved', tone: 'good' as const }
  if (required <= scale) return { label: 'Possible', tone: 'good' as const }
  return { label: 'Not mathematically possible', tone: 'bad' as const }
}

export function renderTemplate(template: string, data: Record<string, string | undefined>) {
  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => data[key] ?? `[${key.toUpperCase()}]`)
}
