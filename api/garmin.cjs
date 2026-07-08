'use strict'

const { GarminConnect } = require('../node_modules/garmin-connect/dist/index.js')
const { fmtTime, metersToMiles, metersToFeet, inferIntensity, estTSS } = require('./utils.cjs')
const fs   = require('fs')
const path = require('path')

const SESSION_FILE = path.join(__dirname, '..', '.garmin-session.json')

let session = null // { client, name, connectedAt }

function persistSession() {
  if (!session) return
  try {
    const tokens = session.client.exportToken()
    fs.writeFileSync(SESSION_FILE, JSON.stringify({ tokens, name: session.name, connectedAt: session.connectedAt }))
  } catch (e) {
    console.warn('[Garmin] Could not persist session:', e.message)
  }
}

function clearPersistedSession() {
  try { if (fs.existsSync(SESSION_FILE)) fs.unlinkSync(SESSION_FILE) } catch (_) {}
}

// Restore session from disk on startup
try {
  if (fs.existsSync(SESSION_FILE)) {
    const saved = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'))
    const client = new GarminConnect({})
    client.loadToken(saved.tokens.oauth1, saved.tokens.oauth2)
    session = { client, name: saved.name, connectedAt: saved.connectedAt }
    console.log('[Garmin] Session restored —', saved.name ?? 'unknown user')
  }
} catch (e) {
  console.warn('[Garmin] Could not restore session:', e.message)
}

function mapActivity(a, ftp) {
  // startTimeLocal: "2026-06-15 07:30:00"
  const dateStr = a.startTimeLocal ? a.startTimeLocal.substring(0, 10) : null
  if (!dateStr) return null

  const movingSecs = Math.round(a.movingDuration || a.duration || 0)
  if (movingSecs < 300) return null

  const avgPower = a.avgPower || 0
  const tss = a.trainingStressScore != null
    ? Math.round(a.trainingStressScore)
    : estTSS(movingSecs, avgPower, ftp)

  const ifVal = a.intensityFactor != null
    ? parseFloat(Number(a.intensityFactor).toFixed(3))
    : (ftp > 0 && avgPower > 0 ? parseFloat((avgPower / ftp).toFixed(3)) : null)

  const typeKey = a.activityType?.typeKey || 'cycling'
  let sport = typeKey
  let sportType = typeKey

  // Normalize Garmin type keys
  if (typeKey.includes('cycling') || typeKey === 'road_biking' || typeKey === 'gravel_cycling') {
    sport = 'cycling'
    sportType = typeKey
  } else if (typeKey.includes('run')) {
    sport = 'running'
    sportType = typeKey
  }

  const intensity = inferIntensity(avgPower || a.averageHR, ftp)

  return {
    id: `garmin_${a.activityId}`,
    source: 'garmin',
    name: a.activityName || 'Garmin Activity',
    sport,
    sport_type: sportType,
    date: dateStr,
    start_time: a.startTimeGMT ? new Date(a.startTimeGMT.replace(' ', 'T') + 'Z') : null,
    moving_time_s: movingSecs,
    duration: fmtTime(movingSecs),
    distance_mi: metersToMiles(a.distance || 0),
    elevation_ft: metersToFeet(a.elevationGain || 0),
    calories: a.calories || 0,
    cadence: a.averageBikingCadenceInRevPerMinute || a.averageRunningCadenceInStepsPerMinute || 0,
    heart_rate: a.averageHR || 0,
    avg_power: avgPower,
    intensity,
    est_tss: tss,
    intensity_factor: ifVal,
  }
}

async function connectGarmin(username, password) {
  const client = new GarminConnect({})
  await client.login(username, password)
  const profile = await client.getUserProfile()
  session = {
    client,
    name: profile?.displayName || profile?.fullName || username,
    connectedAt: new Date().toISOString(),
  }
  persistSession()
  return { success: true, name: session.name, connectedAt: session.connectedAt }
}

async function getGarminStatus() {
  if (!session) return { connected: false }
  return { connected: true, name: session.name, connectedAt: session.connectedAt }
}

function disconnectGarmin() {
  session = null
  clearPersistedSession()
  return { success: true }
}

async function getGarminActivities(startDate, endDate, ftp = 260) {
  if (!session) return { activities: [], connected: false }

  // Garmin doesn't support date-range filtering in getActivities,
  // so fetch in batches of 100 and stop when we're past the date range
  const allActivities = []
  let start = 0
  const limit = 100

  while (true) {
    const batch = await session.client.getActivities(start, limit)
    if (!batch || batch.length === 0) break

    for (const a of batch) {
      const dateStr = a.startTimeLocal?.substring(0, 10)
      if (!dateStr) continue
      if (endDate && dateStr > endDate) continue // future activity, skip
      if (startDate && dateStr < startDate) {
        // We've gone past our range — Garmin returns newest first
        return { activities: allActivities, connected: true }
      }
      const mapped = mapActivity(a, ftp)
      if (mapped) allActivities.push(mapped)
    }

    if (batch.length < limit) break
    start += limit
  }

  return { activities: allActivities, connected: true }
}

module.exports = { connectGarmin, getGarminStatus, disconnectGarmin, getGarminActivities }
