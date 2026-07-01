'use strict'

require('dotenv').config()

const express = require('express')
const cors    = require('cors')
const { getZwiftActivities }                                                        = require('./zwift.cjs')
const { connectGarmin, getGarminStatus, disconnectGarmin, getGarminActivities }    = require('./garmin.cjs')
const { getAuthUrl, connectWhoop, getWhoopStatus, disconnectWhoop,
        getLatestRecovery, getLatestSleep, getWhoopActivities }                     = require('./whoop.cjs')

const app  = express()
const PORT = 3001
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: FRONTEND_ORIGIN }))
app.use(express.json())

// ─── Merge helpers ─────────────────────────────────────────────────────────────

function indexByDate(activities) {
  const byDate = {}
  for (const act of activities) {
    if (!act.date) continue
    ;(byDate[act.date] ??= []).push(act)
  }
  for (const date of Object.keys(byDate)) {
    byDate[date].sort((a, b) => b.moving_time_s - a.moving_time_s)
  }
  return byDate
}

// ─── Activities (Zwift + Garmin + Whoop) ──────────────────────────────────────

app.get('/api/activities', async (req, res) => {
  const { start, end, ftp: ftpStr } = req.query
  const ftp = parseInt(ftpStr || '260', 10)

  try {
    const [zwiftResult, garminResult, whoopResult] = await Promise.all([
      getZwiftActivities(start, end, ftp),
      getGarminActivities(start, end, ftp),
      getWhoopActivities(start ?? '2020-01-01', end ?? new Date().toISOString().substring(0, 10), ftp),
    ])

    const all = [
      ...zwiftResult.activities,
      ...garminResult.activities,
      ...whoopResult.activities,
    ]
    const byDate = indexByDate(all)

    res.json({
      byDate,
      meta: {
        zwift:  { count: zwiftResult.activities.length, dir: zwiftResult.dir, error: zwiftResult.error },
        garmin: { connected: garminResult.connected, count: garminResult.activities.length },
        whoop:  { connected: whoopResult.connected,  count: whoopResult.activities.length },
        ftp,
      },
    })
  } catch (err) {
    console.error('/api/activities error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─── Garmin ────────────────────────────────────────────────────────────────────

app.post('/api/garmin/connect', async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' })
  }
  try {
    res.json(await connectGarmin(username, password))
  } catch (err) {
    console.error('/api/garmin/connect error:', err.message)
    res.status(401).json({ error: err.message || 'Login failed' })
  }
})

app.get('/api/garmin/status', async (_req, res) => {
  try { res.json(await getGarminStatus()) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/garmin/disconnect', (_req, res) => {
  disconnectGarmin()
  res.json({ success: true })
})

// ─── Whoop OAuth ───────────────────────────────────────────────────────────────

// Step 1 — redirect user to Whoop's authorization page
app.get('/auth/whoop/login', (_req, res) => {
  try {
    res.redirect(getAuthUrl())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Step 2 — Whoop redirects back here with ?code=...
app.get('/auth/whoop/callback', async (req, res) => {
  const { code, error } = req.query
  console.log('[Whoop callback] hit — code:', code ? code.substring(0, 8) + '...' : 'none', 'error:', error || 'none')
  if (error || !code) {
    return res.redirect(`${FRONTEND_ORIGIN}/athlete?whoop_error=${encodeURIComponent(error || 'no_code')}`)
  }
  try {
    await connectWhoop(code)
    console.log('[Whoop callback] session stored OK —', JSON.stringify(getWhoopStatus()))
    res.redirect(`${FRONTEND_ORIGIN}/athlete?whoop=connected`)
  } catch (err) {
    console.error('/auth/whoop/callback error:', err.message)
    res.redirect(`${FRONTEND_ORIGIN}/athlete?whoop_error=${encodeURIComponent(err.message)}`)
  }
})

// ─── Whoop data ────────────────────────────────────────────────────────────────

app.get('/api/whoop/status', (_req, res) => {
  res.json(getWhoopStatus())
})

app.get('/api/whoop/recovery', async (_req, res) => {
  try {
    const [recovery, sleep] = await Promise.all([getLatestRecovery(), getLatestSleep()])
    res.json({ ...recovery, ...sleep })
  } catch (err) {
    console.error('/api/whoop/recovery error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/whoop/disconnect', (_req, res) => {
  disconnectWhoop()
  res.json({ success: true })
})

// ─── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`CadenceIQ API  →  http://localhost:${PORT}`)
  if (!process.env.WHOOP_CLIENT_ID) {
    console.warn('  ⚠  WHOOP_CLIENT_ID not set — Whoop OAuth will not work')
    console.warn('     Copy .env.example → .env and fill in your credentials')
  }
})
