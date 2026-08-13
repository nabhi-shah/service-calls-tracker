export const WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbxe7AJCIJ8fw25_8GWD9FyBv-lytPjyMyWsDjBDU-P3kSI8gTgdJmDFl-AHiXDgdcwh/exec'

// ── Service Calls ──────────────────────────────────────────
export async function fetchServiceCalls() {
  const res = await fetch(WEBHOOK_URL)
  if (!res.ok) throw new Error('Failed to fetch service calls')
  return res.json()
}

export async function pushServiceCalls(data) {
  await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(data),
  })
}

// ── Locations ─────────────────────────────────────────────
export async function fetchLocations() {
  const res = await fetch(WEBHOOK_URL + '?sheet=locations')
  if (!res.ok) throw new Error('Failed to fetch locations')
  const rows = await res.json()
  if (!Array.isArray(rows) || rows.length === 0) return null
  return rows
}

export async function pushLocations(rows) {
  await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ type: 'locations', rows }),
  })
}
