export function parsePid(pid: string): number {
  const parts = pid.split('-')
  const numeric = parseInt(parts[parts.length - 1], 10)
  if (isNaN(numeric)) throw new Error(`Invalid pid format: "${pid}"`)
  return numeric
}
