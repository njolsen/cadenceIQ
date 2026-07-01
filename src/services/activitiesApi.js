// Requests go through the Vite dev-server proxy → Express on :3001
// In production, set up a real reverse proxy (nginx, etc.)

export async function fetchActivities(startDate, endDate, ftp = 260) {
  const params = new URLSearchParams({ ftp })
  if (startDate) params.set('start', startDate)
  if (endDate)   params.set('end', endDate)
  const r = await fetch(`/api/activities?${params}`)
  if (!r.ok) throw new Error(`API error ${r.status}`)
  return r.json()
}

export async function connectGarmin(username, password) {
  const r = await fetch('/api/garmin/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data.error || 'Login failed')
  return data
}

export async function getGarminStatus() {
  const r = await fetch('/api/garmin/status')
  if (!r.ok) return { connected: false }
  return r.json()
}

export async function disconnectGarmin() {
  const r = await fetch('/api/garmin/disconnect', { method: 'POST' })
  return r.json()
}
