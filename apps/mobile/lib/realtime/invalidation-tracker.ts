const lastSettled = new Map<string, number>()

export function markMutationSettled(table: string) {
  lastSettled.set(table, Date.now())
}

export function wasMutationSettled(table: string, windowMs = 2000): boolean {
  const ts = lastSettled.get(table)
  if (!ts) return false
  return Date.now() - ts < windowMs
}
