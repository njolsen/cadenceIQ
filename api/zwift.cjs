'use strict'

const fs = require('fs')
const path = require('path')
const os = require('os')
const FitParser = require('../node_modules/fit-file-parser/dist/cjs/fit-parser.js').default
const { fmtTime, metersToMiles, metersToFeet, inferIntensity, estTSS } = require('./utils.cjs')

// Compute normalized power from per-second power records (30s rolling average, 4th power mean)
function computeNP(records) {
  const powers = records.filter(r => r.power != null).map(r => r.power)
  if (powers.length < 30) return 0
  const W = 30
  const win = new Array(W).fill(0)
  let winSum = 0, sum4 = 0, n = 0
  for (let i = 0; i < powers.length; i++) {
    winSum = winSum - win[i % W] + powers[i]
    win[i % W] = powers[i]
    if (i >= W - 1) {
      const avg = winSum / W
      sum4 += avg * avg * avg * avg
      n++
    }
  }
  return n > 0 ? Math.round(Math.pow(sum4 / n, 0.25)) : 0
}

const ZWIFT_DIR = path.join(os.homedir(), 'Documents', 'Zwift', 'Activities')

// In-memory cache: filename → parsed activity
const cache = new Map()

function parseFitFile(filePath, ftp) {
  return new Promise((resolve, reject) => {
    const parser = new FitParser({ force: true, mode: 'list', lengthUnit: 'm', speedUnit: 'm/s' })
    let buf
    try {
      buf = fs.readFileSync(filePath)
    } catch (e) {
      return resolve(null)
    }
    parser.parse(buf, (err, data) => {
      if (err || !data?.sessions?.length) return resolve(null)
      const s = data.sessions[0]

      const filename = path.basename(filePath, '.fit')
      const dateStr = filename.substring(0, 10) // YYYY-MM-DD from filename (local time)

      const movingSecs = Math.round(s.total_timer_time || s.total_elapsed_time || 0)
      if (movingSecs < 300) return resolve(null) // skip files under 5 min

      const avgPower  = s.avg_power || 0
      // Zwift doesn't write NP to the session record — compute it from per-second records
      const normPower = computeNP(data.records || []) || avgPower
      const tss = estTSS(movingSecs, normPower, ftp)
      const intensity = inferIntensity(avgPower, ftp)
      const ifVal = ftp > 0 && normPower > 0 ? parseFloat((normPower / ftp).toFixed(3)) : null

      resolve({
        id: `zwift_${filename}`,
        source: 'zwift',
        name: 'Zwift · Virtual Ride',
        sport: 'cycling',
        sport_type: 'virtual_ride',
        date: dateStr,
        start_time: s.start_time,
        moving_time_s: movingSecs,
        duration: fmtTime(movingSecs),
        distance_mi: metersToMiles(s.total_distance || 0),
        elevation_ft: metersToFeet(s.total_ascent || 0),
        calories: s.total_calories || 0,
        cadence: s.avg_cadence || 0,
        heart_rate: s.avg_heart_rate || 0,
        avg_power: avgPower,
        normalized_power: normPower !== avgPower ? normPower : null,
        intensity,
        est_tss: tss,
        intensity_factor: ifVal,
      })
    })
  })
}

async function getZwiftActivities(startDate, endDate, ftp = 260) {
  let files
  try {
    files = fs.readdirSync(ZWIFT_DIR)
  } catch (e) {
    return { activities: [], error: `Cannot read Zwift directory: ${e.message}` }
  }

  // Filter .fit files within the date range using filename date
  const fitFiles = files
    .filter(f => f.endsWith('.fit') && f.length >= 10)
    .filter(f => {
      const d = f.substring(0, 10)
      return (!startDate || d >= startDate) && (!endDate || d <= endDate)
    })
    .map(f => path.join(ZWIFT_DIR, f))

  const results = await Promise.all(fitFiles.map(fp => parseFitFile(fp, ftp)))
  const activities = results.filter(Boolean)

  return { activities, count: activities.length, dir: ZWIFT_DIR }
}

module.exports = { getZwiftActivities }
