export type Grade = { grade: string; point: number }

export function calculateGpa(rows: { units: number; point: number }[]) {
  const validRows = rows.filter((row) => Number.isFinite(row.units) && Number.isFinite(row.point) && row.units > 0 && row.point >= 0)
  const units = validRows.reduce((sum, row) => sum + row.units, 0)
  if (!units) return 0
  return validRows.reduce((sum, row) => sum + row.units * row.point, 0) / units
}

export function calculateRequiredGpa(currentCgpa: number, completedCredits: number, remainingCredits: number, targetCgpa: number) {
  if (![currentCgpa, completedCredits, remainingCredits, targetCgpa].every(Number.isFinite)) return null
  if (completedCredits < 0 || remainingCredits <= 0) return null
  if (currentCgpa < 0 || targetCgpa < 0) return null
  return (targetCgpa * (completedCredits + remainingCredits) - currentCgpa * completedCredits) / remainingCredits
}

export function targetStatus(required: number | null, scale: number) {
  if (required === null || !Number.isFinite(required) || scale <= 0) return { label: 'Enter valid values', tone: 'bad' as const }
  if (required <= 0) return { label: 'Already achieved', tone: 'good' as const }
  if (required <= scale) return { label: 'Possible', tone: 'good' as const }
  return { label: 'Not mathematically possible', tone: 'bad' as const }
}

export function renderTemplate(template: string, data: Record<string, string | undefined>) {
  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => data[key] ?? `[${key.toUpperCase()}]`)
}
