export function parseNum(value: string): number {
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}
