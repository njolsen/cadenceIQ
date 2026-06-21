// Strava activities snapshot — fetched 2026-06-17 via Strava MCP
// Production path: OAuth 2.0 → Strava REST API → /athlete/activities

function fmtTime(s) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h ? `${h}h ${m}m` : `${m}m`
}

function toMiles(meters) {
  return (meters / 1609.344).toFixed(1)
}

function sportLabel(type) {
  if (type === 'VirtualRide') return 'Zwift'
  if (type === 'VirtualRun')  return 'Virtual Run'
  return type
}

function inferIntensity(name) {
  const n = name.toLowerCase()
  if (n.includes('vo2') || n.includes('sprint') || n.includes('race') || n.includes('interval')) return 'high'
  if (n.includes('threshold') || n.includes('tempo') || n.includes('opener')) return 'med'
  if (n.includes('recovery') || (n.includes('spin') && !n.includes('endurance'))) return 'low'
  return 'low'
}

function estTSS(name, seconds) {
  const h = seconds / 3600
  const n = name.toLowerCase()
  if (n.includes('vo2') || n.includes('race') || n.includes('interval')) return Math.round(h * 90)
  if (n.includes('threshold') || n.includes('opener') || n.includes('tempo')) return Math.round(h * 78)
  if (n.includes('recovery') || (n.includes('spin') && !n.includes('endurance'))) return Math.round(h * 36)
  return Math.round(h * 52)
}

const RAW = [
  { date:'2026-06-01', id:'18741859224', name:'Monday (Race Block 3) - 2hr Endurance w Sprints',          sport_type:'VirtualRide', moving_time:8092,  distance_m:84883, elev_m:132, calories:1845, cadence:85  },
  { date:'2026-06-02', id:'18755576652', name:'Zwift - Tuesday (Race Block 3) - 6 x 3min @ Vo2',           sport_type:'VirtualRide', moving_time:4053,  distance_m:16441, elev_m:956, calories:968,  cadence:81  },
  { date:'2026-06-03', id:'18769601306', name:'Zwift - Wednesday (Race Block 3) - 2hr Endurance',          sport_type:'VirtualRide', moving_time:7249,  distance_m:75689, elev_m:117, calories:1606, cadence:84  },
  { date:'2026-06-05', id:'18796694127', name:'Strava Bug Out',                                            sport_type:'Run',         moving_time:1838,  distance_m:4480,  elev_m:30,  calories:468,  cadence:null },
  { date:'2026-06-08', id:'18836489972', name:'Monday (Race Block 3) - 2hr Endurance w Sprints',          sport_type:'VirtualRide', moving_time:8113,  distance_m:85040, elev_m:131, calories:1843, cadence:87  },
  { date:'2026-06-09', id:'18850527704', name:'Tuesday (Race Block 3) - 1.5hr Endurance w VO2',           sport_type:'VirtualRide', moving_time:6195,  distance_m:65768, elev_m:100, calories:1421, cadence:83  },
  { date:'2026-06-10', id:'18865007074', name:'Wednesday (Race Block 3) - 1.5hr Endurance',               sport_type:'VirtualRide', moving_time:5472,  distance_m:57099, elev_m:85,  calories:1171, cadence:86  },
  { date:'2026-06-10', id:'18877182245', name:'Ault Park',                                                 sport_type:'Ride',        moving_time:3679,  distance_m:40137, elev_m:496, calories:1221, cadence:82,  desc:'Chase duty and a team win with Matt!' },
  { date:'2026-06-12', id:'18895063342', name:'Friday (Race Block 3) - 2.5hr Endurance w opener efforts', sport_type:'VirtualRide', moving_time:9017,  distance_m:94404, elev_m:144, calories:2048, cadence:87  },
  { date:'2026-06-13', id:'18907285318', name:'Saturday (Race Block 3) - Morning Spin',                   sport_type:'VirtualRide', moving_time:2661,  distance_m:25691, elev_m:39,  calories:508,  cadence:86  },
  { date:'2026-06-13', id:'18913734979', name:'Tour de Grandview 1/2/3',                                  sport_type:'Ride',        moving_time:4106,  distance_m:48696, elev_m:190, calories:1325, cadence:80,  pr_count:9, desc:'Guest riding with the SustainableSquade — chased with the team, too many hard efforts, rolled in back of the pack. Cool course!' },
  { date:'2026-06-15', id:'18935884816', name:'Monday (Race Block 3) - 1.5hr Endurance',                  sport_type:'VirtualRide', moving_time:5414,  distance_m:55861, elev_m:85,  calories:1182, cadence:86  },
  { date:'2026-06-16', id:'18943475181', name:'Tuesday (Race Block 3) - 2hr Endurance w Sprints',         sport_type:'VirtualRide', moving_time:6647,  distance_m:69036, elev_m:105, calories:1434, cadence:86  },
]

function mapAct(raw) {
  return {
    id:            raw.id,
    name:          raw.name,
    desc:          raw.desc ?? null,
    sport:         sportLabel(raw.sport_type),
    sport_type:    raw.sport_type,
    intensity:     inferIntensity(raw.name),
    duration:      fmtTime(raw.moving_time),
    moving_time_s: raw.moving_time,
    distance_mi:   toMiles(raw.distance_m),
    elevation_ft:  Math.round(raw.elev_m * 3.28084),
    calories:      raw.calories,
    cadence:       raw.cadence ? Math.round(raw.cadence) : null,
    est_tss:       estTSS(raw.name, raw.moving_time),
    pr_count:      raw.pr_count ?? 0,
  }
}

// Keyed by ISO date → array of mapped activities
export const STRAVA_BY_DATE = RAW.reduce((acc, raw) => {
  ;(acc[raw.date] ??= []).push(mapAct(raw))
  return acc
}, {})

// Day-level summary (primary = longest activity)
export function getDaySummary(dateStr) {
  const acts = STRAVA_BY_DATE[dateStr]
  if (!acts?.length) return null
  const sorted     = [...acts].sort((a, b) => b.moving_time_s - a.moving_time_s)
  const totalTSS   = acts.reduce((s, a) => s + a.est_tss, 0)
  const totalSecs  = acts.reduce((s, a) => s + a.moving_time_s, 0)
  const totalDist  = acts.reduce((s, a) => s + parseFloat(a.distance_mi), 0)
  return {
    count:         acts.length,
    totalTSS,
    totalDuration: fmtTime(totalSecs),
    totalDist:     totalDist.toFixed(1),
    primary:       sorted[0],
    all:           sorted,
  }
}

export const STRAVA_META = {
  athlete:    { name: 'Nick Olsen', id: 22846145 },
  syncedAt:   '2026-06-17T00:00:00',
  activityCount: RAW.length,
}
