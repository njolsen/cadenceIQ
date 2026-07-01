// All requests go through the Vite proxy → Express server on :3001

export async function getWhoopStatus() {
  const r = await fetch('/api/whoop/status')
  if (!r.ok) return { connected: false }
  return r.json()
}

export function connectWhoop() {
  // Opens the Whoop OAuth page in the same window.
  // After authorization, Whoop redirects back to /auth/whoop/callback on the
  // Express server, which exchanges the code and redirects to the frontend
  // with ?whoop=connected in the URL.
  window.location.href = '/auth/whoop/login'
}

export async function disconnectWhoop() {
  const r = await fetch('/api/whoop/disconnect', { method: 'POST' })
  return r.json()
}

export async function getWhoopRecovery() {
  const r = await fetch('/api/whoop/recovery')
  if (!r.ok) throw new Error(`Whoop recovery error ${r.status}`)
  return r.json()
}
