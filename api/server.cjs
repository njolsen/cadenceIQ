'use strict'

const express = require('express')
const cors = require('cors')
const { getZwiftActivities } = require('./zwift.cjs')
const { connectGarmin, getGarminStatus, disconnectGarmin, getGarminActivities } = require('./garmin.cjs')

const app = express()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// Merge and index activities by date
function indexByDate(activities) {
  const byDate = {}
  for (const act of activities) {
    if (!act.date) continue
    ;(byDate[act.date] ??= []).push(act)
  }
  // Sort each day: longest activity first
  for (const date of Object.keys(byDate)) {
    byDate[date].sort((a, b) => b.moving_time_s - a.moving_time_s)
  }
  return byDate
}

// GET /api/activities?start=YYYY-MM-DD&end=YYYY-MM-DD&ftp=260
app.get('/api/activities', async (req, res) => {
  const { start, end, ftp: ftpStr } = req.query
  const ftp = parseInt(ftpStr || '260', 10)

  try {
    const [zwiftResult, garminResult] = await Promise.all([
      getZwiftActivities(start, end, ftp),
      getGarminActivities(start, end, ftp),
    ])

    const all = [...zwiftResult.activities, ...garminResult.activities]
    const byDate = indexByDate(all)

    res.json({
      byDate,
      meta: {
        zwift: { count: zwiftResult.activities.length, dir: zwiftResult.dir, error: zwiftResult.error },
        garmin: { connected: garminResult.connected, count: garminResult.activities.length },
        ftp,
      },
    })
  } catch (err) {
    console.error('/api/activities error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/garmin/connect { username, password }
app.post('/api/garmin/connect', async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' })
  }
  try {
    const result = await connectGarmin(username, password)
    res.json(result)
  } catch (err) {
    console.error('/api/garmin/connect error:', err.message)
    res.status(401).json({ error: err.message || 'Login failed' })
  }
})

// GET /api/garmin/status
app.get('/api/garmin/status', async (_req, res) => {
  try {
    const status = await getGarminStatus()
    res.json(status)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/garmin/disconnect
app.post('/api/garmin/disconnect', (_req, res) => {
  disconnectGarmin()
  res.json({ success: true })
})

app.listen(PORT, () => {
  console.log(`CadenceIQ API running on http://localhost:${PORT}`)
})
