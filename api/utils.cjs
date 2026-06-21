'use strict'

function fmtTime(s) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h ? `${h}h ${m}m` : `${m}m`
}

function metersToMiles(m) {
  return parseFloat((m / 1609.344).toFixed(1))
}

function metersToFeet(m) {
  return Math.round(m * 3.28084)
}

function inferIntensity(avgPower, ftp) {
  if (!avgPower || !ftp) return 'low'
  const r = avgPower / ftp
  if (r >= 0.90) return 'high'
  if (r >= 0.76) return 'med'
  return 'low'
}

function estTSS(movingSecs, avgPower, ftp) {
  if (avgPower > 0 && ftp > 0) {
    const ifVal = avgPower / ftp
    return Math.round((movingSecs / 3600) * ifVal * ifVal * 100)
  }
  // duration-based fallback (endurance estimate)
  return Math.round((movingSecs / 3600) * 52)
}

module.exports = { fmtTime, metersToMiles, metersToFeet, inferIntensity, estTSS }
