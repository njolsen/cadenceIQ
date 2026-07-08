'use strict'

const fetch = require('node-fetch')
const fs    = require('fs')
const path  = require('path')
const { fmtTime, inferIntensity, estTSS } = require('./utils.cjs')

const WHOOP_BASE    = 'https://api.prod.whoop.com/developer/v2'
const TOKEN_URL     = 'https://api.prod.whoop.com/oauth/oauth2/token'
const AUTH_BASE_URL = 'https://api.prod.whoop.com/oauth/oauth2/auth'
const SCOPES        = 'read:recovery read:sleep read:workout read:profile read:cycles offline'

// Token persistence — survives server restarts
const SESSION_FILE = path.join(__dirname, '..', '.whoop-session.json')

let session = null // { accessToken, refreshToken, expiresAt, profile }

function persistSession() {
  if (!session) return
  try { fs.writeFileSync(SESSION_FILE, JSON.stringify(session)) }
  catch (e) { console.warn('[Whoop] Could not persist session:', e.message) }
}

function clearPersistedSession() {
  try { if (fs.existsSync(SESSION_FILE)) fs.unlinkSync(SESSION_FILE) }
  catch (_) {}
}

// Restore session from disk on startup
try {
  if (fs.existsSync(SESSION_FILE)) {
    session = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'))
    console.log('[Whoop] Session restored —', session.profile?.first_name ?? 'unknown user')
  }
} catch (e) {
  console.warn('[Whoop] Could not restore session:', e.message)
}

// ─── OAuth helpers ─────────────────────────────────────────────────────────────

function getClientId()     { return process.env.WHOOP_CLIENT_ID }
function getClientSecret() { return process.env.WHOOP_CLIENT_SECRET }
function getRedirectUri()  { return process.env.WHOOP_REDIRECT_URI || 'http://localhost:3001/auth/whoop/callback' }

function buildAuthUrl(state = 'cadenceiq') {
  const params = new URLSearchParams({
    client_id:     getClientId(),
    redirect_uri:  getRedirectUri(),
    response_type: 'code',
    scope:         SCOPES,
    state,
  })
  return `${AUTH_BASE_URL}?${params.toString()}`
}

async function tokenRequest(body) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     getClientId(),
      client_secret: getClientSecret(),
      ...body,
    }).toString(),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Whoop token error ${res.status}: ${txt}`)
  }
  return res.json()
}

async function exchangeCode(code) {
  return tokenRequest({
    grant_type:   'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
  })
}

async function refreshAccessToken() {
  if (!session?.refreshToken) throw new Error('No refresh token')
  const data = await tokenRequest({
    grant_type:    'refresh_token',
    refresh_token: session.refreshToken,
  })
  session.accessToken = data.access_token
  session.refreshToken = data.refresh_token || session.refreshToken
  session.expiresAt    = Date.now() + (data.expires_in - 60) * 1000
  persistSession()
  return session.accessToken
}

async function getAccessToken() {
  if (!session) throw new Error('Not connected to Whoop')
  if (Date.now() >= session.expiresAt) await refreshAccessToken()
  return session.accessToken
}

// ─── API fetch helper ──────────────────────────────────────────────────────────

async function whoopFetch(path, params = {}) {
  const token = await getAccessToken()
  const url = new URL(`${WHOOP_BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v))
  console.log('[Whoop fetch]', url.toString())
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const txt = await res.text()
    console.log('[Whoop fetch] error body:', txt.substring(0, 200))
    throw new Error(`Whoop API ${res.status}: ${txt}`)
  }
  return res.json()
}

// Paginate through a collection endpoint until we have all records in range
async function fetchAll(path, params = {}) {
  const records = []
  let nextToken = null
  do {
    const p = { limit: 25, ...params }
    if (nextToken) p.nextToken = nextToken
    const page = await whoopFetch(path, p)
    records.push(...(page.records ?? []))
    nextToken = page.next_token ?? null
  } while (nextToken)
  return records
}

// ─── Data mappers ──────────────────────────────────────────────────────────────

function isoToDateStr(iso) {
  return iso ? iso.substring(0, 10) : null
}

function mapRecovery(r) {
  const score = r.score ?? {}
  return {
    cycleId:        r.cycle_id,
    date:           isoToDateStr(r.created_at),
    recoveryScore:  score.recovery_score ?? null,
    rhr:            score.resting_heart_rate ?? null,
    hrv:            score.hrv_rmssd_milli != null ? Math.round(score.hrv_rmssd_milli) : null,
    spo2:           score.spo2_percentage ?? null,
    skinTemp:       score.skin_temp_celsius != null
                      ? parseFloat((score.skin_temp_celsius * 9/5 + 32).toFixed(1))
                      : null,
    state:          r.score_state,
  }
}

function mapSleep(s) {
  const score   = s.score ?? {}
  const stages  = score.stage_summary ?? {}
  // v2 API dropped hours_of_sleep — compute from stage millis
  const sleepMs = (stages.total_light_sleep_time_milli ?? 0)
                + (stages.total_slow_wave_sleep_time_milli ?? 0)
                + (stages.total_rem_sleep_time_milli ?? 0)
  const hoursOfSleep = sleepMs > 0 ? +(sleepMs / 3600000).toFixed(2) : null

  return {
    id:              s.id,
    date:            isoToDateStr(s.start),
    wakeAt:          s.end ?? null,
    nap:             s.nap ?? false,
    hoursOfSleep,
    efficiency:      score.sleep_efficiency_percentage ?? null,
    performance:     score.sleep_performance_percentage ?? null,
    respiratoryRate: score.respiratory_rate ?? null,
    state:           s.score_state,
  }
}

function mapWorkout(w, ftp = 295) {
  const score = w.score ?? {}
  const movingSecs = score.duration ? Math.round(score.duration / 1000) : 0
  const avgPower = score.average_force ?? 0 // Whoop doesn't give watts; placeholder
  const tss = estTSS(movingSecs, avgPower, ftp)

  // Whoop sport IDs → readable types
  const sportMap = {
    0: 'Activity', 1: 'Cycling', 71: 'Cycling', 72: 'Mountain Biking',
    96: 'Running', 44: 'Weightlifting', 45: 'CrossFit', 63: 'Yoga',
  }

  return {
    id:         `whoop_${w.id}`,
    source:     'whoop',
    name:       sportMap[w.sport_id] ?? 'Whoop Workout',
    sport:      w.sport_id === 1 || w.sport_id === 71 || w.sport_id === 72 ? 'cycling' : 'other',
    date:       isoToDateStr(w.start),
    moving_time_s: movingSecs,
    duration:   fmtTime(movingSecs),
    heart_rate: score.average_heart_rate ?? 0,
    max_hr:     score.max_heart_rate ?? 0,
    strain:     score.strain ?? null,
    calories:   score.kilojoules ? Math.round(score.kilojoules * 0.239006) : 0,
    intensity:  inferIntensity(score.average_heart_rate, ftp),
    est_tss:    tss,
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────

function getAuthUrl() {
  if (!getClientId()) throw new Error('WHOOP_CLIENT_ID not set')
  return buildAuthUrl()
}

async function connectWhoop(code) {
  const data = await exchangeCode(code)
  session = {
    accessToken:  data.access_token,
    refreshToken: data.refresh_token,
    expiresAt:    Date.now() + (data.expires_in - 60) * 1000,
  }
  // Fetch profile to store name
  try {
    const profile = await whoopFetch('/user/profile/basic')
    session.profile = profile
  } catch (_) {}
  persistSession()
  return { success: true, name: session.profile?.first_name }
}

function getWhoopStatus() {
  if (!session) return { connected: false }
  return {
    connected:   true,
    name:        session.profile ? `${session.profile.first_name} ${session.profile.last_name}` : 'Whoop User',
    connectedAt: new Date(session.expiresAt - 3600 * 1000).toISOString(),
  }
}

function disconnectWhoop() {
  session = null
  clearPersistedSession()
}

async function getLatestRecovery() {
  const end   = new Date()
  const start = new Date(end - 7 * 86400000)
  const records = await fetchAll('/recovery', {
    start: start.toISOString(),
    end:   end.toISOString(),
  })
  const scored = records.map(mapRecovery).filter(r => r.state === 'SCORED' && r.recoveryScore != null)
  scored.sort((a, b) => b.date.localeCompare(a.date)) // newest first

  const today     = scored[0] ?? null
  const yesterday = scored[1] ?? null

  function trend(a, b, key) {
    if (!a || !b || a[key] == null || b[key] == null) return 'flat'
    const delta = a[key] - b[key]
    if (delta > 2) return 'up'
    if (delta < -2) return 'down'
    return 'flat'
  }

  return {
    recovery:    today?.recoveryScore ?? null,
    hrv:         today?.hrv ?? null,
    rhr:         today?.rhr ?? null,
    spo2:        today?.spo2 ?? null,
    skinTemp:    today?.skinTemp ?? null,
    hrvTrend:    trend(today, yesterday, 'hrv'),
    rhrTrend:    trend(yesterday, today, 'rhr'), // lower RHR is better, so inverted
    syncedAt:    new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase(),
  }
}

async function getLatestSleep() {
  const end   = new Date()
  const start = new Date(end - 3 * 86400000)
  const records = await fetchAll('/activity/sleep', {
    start: start.toISOString(),
    end:   end.toISOString(),
  })
  const mapped = records.map(mapSleep)
  const nights = mapped.filter(s => !s.nap && s.state === 'SCORED' && s.hoursOfSleep != null)
  nights.sort((a, b) => b.date.localeCompare(a.date))
  const last  = nights[0] ?? null
  const prev  = nights[1] ?? null
  const trend = !last || !prev ? 'flat'
    : last.hoursOfSleep > prev.hoursOfSleep + 0.25 ? 'up'
    : last.hoursOfSleep < prev.hoursOfSleep - 0.25 ? 'down'
    : 'flat'

  // Wake time: use the most recent non-nap sleep's end timestamp regardless of scoring state
  // (end is available immediately; scoring takes longer)
  const recentSleeps = mapped.filter(s => !s.nap && s.wakeAt).sort((a, b) => b.wakeAt.localeCompare(a.wakeAt))
  let wakeTime = null
  if (recentSleeps[0]?.wakeAt) {
    const d = new Date(recentSleeps[0].wakeAt)
    wakeTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return {
    sleep:      last?.hoursOfSleep ?? null,
    sleepTrend: trend,
    wakeTime,
  }
}

async function getWhoopActivities(startDate, endDate, ftp = 295) {
  if (!session) return { activities: [], connected: false }
  const records = await fetchAll('/activity/workout', {
    start: `${startDate}T00:00:00Z`,
    end:   `${endDate}T23:59:59Z`,
  })
  const activities = records.map(w => mapWorkout(w, ftp)).filter(w => w.date && w.moving_time_s > 300)
  return { activities, connected: true }
}

async function getWhoopHistory(days = 180) {
  if (!session) return { recovery: [], sleep: [], cycles: [] }
  const end   = new Date()
  const start = new Date(end - days * 86400000)
  const [recoveryRecs, sleepRecs, cycleRecs] = await Promise.all([
    fetchAll('/recovery',        { start: start.toISOString(), end: end.toISOString() }),
    fetchAll('/activity/sleep',  { start: start.toISOString(), end: end.toISOString() }),
    fetchAll('/cycle',           { start: start.toISOString(), end: end.toISOString() }),
  ])
  const recovery = recoveryRecs
    .map(mapRecovery)
    .filter(r => r.state === 'SCORED' && r.recoveryScore != null)
    .sort((a, b) => a.date.localeCompare(b.date))
  const sleep = sleepRecs
    .map(mapSleep)
    .filter(s => !s.nap && s.state === 'SCORED' && s.hoursOfSleep != null)
    .sort((a, b) => a.date.localeCompare(b.date))
  const cycles = cycleRecs
    .filter(c => c.score_state === 'SCORED' && c.score)
    .map(c => ({
      date:     isoToDateStr(c.start),
      strain:   c.score.strain   != null ? +c.score.strain.toFixed(1)                    : null,
      calories: c.score.kilojoule != null ? Math.round(c.score.kilojoule * 0.239006)    : null,
    }))
    .filter(c => c.date)
    .sort((a, b) => a.date.localeCompare(b.date))
  return { recovery, sleep, cycles }
}

module.exports = {
  getAuthUrl,
  connectWhoop,
  getWhoopStatus,
  disconnectWhoop,
  getLatestRecovery,
  getLatestSleep,
  getWhoopActivities,
  getWhoopHistory,
}
