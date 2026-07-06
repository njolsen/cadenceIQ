import { useState, useEffect, useMemo } from 'react'
import { useProfile } from '../../context/ProfileContext'
import { fetchActivities } from '../../services/activitiesApi'
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis,
  Tooltip, ReferenceLine,
  CartesianGrid,
} from 'recharts'
import TrainingAdaptation from '../athlete/TrainingAdaptation'

const TABS   = ['Load', 'Performance', 'Health']
const RANGES = [
  { label: '4W',  days: 28  },
  { label: '12W', days: 84  },
  { label: '6M',  days: 180 },
  { label: '1Y',  days: 365 },
]

// ─── PMC (Performance Management Chart) computation ───────────────────────────
// Standard TrainingPeaks model: CTL = 42-day EWA, ATL = 7-day EWA, TSB = CTL - ATL

function computePMC(activities, visibleDays) {
  const K_CTL = 1 - Math.exp(-1 / 42)
  const K_ATL = 1 - Math.exp(-1 / 7)

  const tssMap = {}
  activities.forEach(a => {
    if (!a.date) return
    tssMap[a.date] = (tssMap[a.date] || 0) + (a.est_tss || 0)
  })

  const today      = new Date()
  const primeStart = new Date(today)
  primeStart.setDate(primeStart.getDate() - (visibleDays + 120)) // 120-day warm-up
  const visStart   = new Date(today)
  visStart.setDate(visStart.getDate() - visibleDays)

  let ctl = 0, atl = 0
  const result = []
  const cur    = new Date(primeStart)

  while (cur <= today) {
    const d   = cur.toISOString().substring(0, 10)
    const tss = tssMap[d] || 0
    ctl += K_CTL * (tss - ctl)
    atl += K_ATL * (tss - atl)
    if (cur >= visStart) {
      result.push({
        date:  d,
        label: cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ctl:   Math.round(ctl),
        atl:   Math.round(atl),
        tsb:   Math.round(ctl - atl),
        tss,
      })
    }
    cur.setDate(cur.getDate() + 1)
  }
  return result
}

function groupByWeek(activities, days) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const map = {}
  activities.forEach(a => {
    if (!a.date) return
    const d   = new Date(a.date + 'T12:00:00')
    if (d < cutoff) return
    const dow = d.getDay() || 7
    d.setDate(d.getDate() - (dow - 1)) // roll back to Monday
    const key = d.toISOString().substring(0, 10)
    if (!map[key]) {
      map[key] = {
        week:  key,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tss:   0, hours: 0, rides: 0,
      }
    }
    map[key].tss   += a.est_tss || 0
    map[key].hours += (a.moving_time_s || 0) / 3600
    map[key].rides += 1
  })
  return Object.values(map)
    .sort((a, b) => a.week.localeCompare(b.week))
    .map(w => ({ ...w, tss: Math.round(w.tss), hours: +w.hours.toFixed(1) }))
}

function tickInterval(days) {
  if (days <= 28)  return 6
  if (days <= 84)  return 13
  if (days <= 180) return 29
  return 59
}

// ─── Shared tooltip ───────────────────────────────────────────────────────────

function CiqTooltip({ active, payload, label, suffixes = {} }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      backgroundColor: '#fff',
      border: '0.5px solid rgba(15,31,28,0.12)',
      borderRadius: 12,
      padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(15,31,28,0.10)',
      fontSize: 12,
      minWidth: 120,
    }}>
      <p style={{ color: '#637068', marginBottom: 6, fontFamily: 'DM Sans, system-ui' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
          <span style={{ color: p.color, display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'DM Sans, system-ui' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: p.color, display: 'inline-block', flexShrink: 0 }} />
            {p.name}
          </span>
          <span style={{ fontFamily: 'DM Mono, monospace', color: '#1A2421', fontWeight: 500 }}>
            {p.value}{suffixes[p.dataKey] || ''}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Shared components ────────────────────────────────────────────────────────

function RangeSelector({ range, onRange }) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-xl"
      style={{ backgroundColor: 'rgba(15,31,28,0.07)' }}>
      {RANGES.map(r => (
        <button key={r.label}
          onClick={() => onRange(r)}
          className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
          style={{
            backgroundColor: range.label === r.label ? '#fff' : 'transparent',
            color:            range.label === r.label ? '#0F1F1C' : '#637068',
            boxShadow:        range.label === r.label ? '0 1px 3px rgba(15,31,28,0.10)' : 'none',
          }}>
          {r.label}
        </button>
      ))}
    </div>
  )
}

function KpiTile({ label, value, unit, change, positive }) {
  return (
    <div className="card p-4">
      <p className="section-title mb-2">{label}</p>
      <div className="flex items-end justify-between gap-1">
        <div className="min-w-0">
          <span className="text-2xl font-semibold data-value leading-none">{value ?? '—'}</span>
          {unit && <span className="text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>{unit}</span>}
        </div>
        {change != null && (
          <span className="text-xs font-medium data-value px-2 py-0.5 rounded-full mb-0.5 shrink-0"
            style={{
              backgroundColor: positive ? 'rgba(0,200,150,0.12)' : 'rgba(232,85,85,0.10)',
              color:            positive ? '#00A87E' : '#C94444',
            }}>
            {positive && change > 0 ? '+' : ''}{change}
          </span>
        )}
      </div>
    </div>
  )
}

function EmptyChart({ message = 'No data in this range' }) {
  return (
    <div className="h-40 flex items-center justify-center rounded-xl"
      style={{ backgroundColor: 'rgba(15,31,28,0.03)', border: '0.5px dashed rgba(15,31,28,0.15)' }}>
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{message}</p>
    </div>
  )
}

const AXIS_STYLE = { fontSize: 11, fill: '#637068', fontFamily: 'DM Mono, monospace' }
const GRID_PROPS = { strokeDasharray: '3 0', stroke: 'rgba(15,31,28,0.06)', vertical: false }

// ─── Load tab ─────────────────────────────────────────────────────────────────

function LoadTab({ activities, range }) {
  const [show, setShow] = useState({ ctl: true, atl: true, tsb: true })
  const toggle = k => setShow(s => ({ ...s, [k]: !s[k] }))

  const pmcData    = useMemo(() => computePMC(activities, range.days),       [activities, range.days])
  const weeklyData = useMemo(() => groupByWeek(activities, range.days),      [activities, range.days])

  const today       = pmcData[pmcData.length - 1]        ?? {}
  const monthAgo    = pmcData[pmcData.length - 29]       ?? {}

  const ctlChange = today.ctl != null && monthAgo.ctl != null ? today.ctl - monthAgo.ctl : null
  const tsbColor  = (today.tsb ?? 0) >= 0 ? '#00A87E' : '#C94444'

  const lines = [
    { key: 'ctl', name: 'CTL', color: '#00C896' },
    { key: 'atl', name: 'ATL', color: '#FF8C69' },
    { key: 'tsb', name: 'TSB', color: '#94A3B8', dashed: true },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <KpiTile label="FITNESS"  value={today.ctl} unit="CTL" change={ctlChange} positive={ctlChange > 0} />
        <KpiTile label="FATIGUE"  value={today.atl} unit="ATL" />
        <KpiTile label="FORM"
          value={today.tsb != null ? (today.tsb > 0 ? `+${today.tsb}` : today.tsb) : null}
          unit="TSB"
          change={null}
        />
      </div>

      {/* PMC chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <p className="section-title">PERFORMANCE MANAGEMENT CHART</p>
          <div className="flex items-center gap-1.5">
            {lines.map(({ key, name, color }) => (
              <button key={key}
                onClick={() => toggle(key)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: show[key] ? `${color}18` : 'rgba(15,31,28,0.05)',
                  color:            show[key] ? color : '#637068',
                  border:           `0.5px solid ${show[key] ? `${color}40` : 'rgba(15,31,28,0.10)'}`,
                }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: show[key] ? color : '#9CA3AF', display: 'inline-block' }} />
                {name}
              </button>
            ))}
          </div>
        </div>
        {pmcData.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={pmcData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} interval={tickInterval(range.days)} />
              <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <Tooltip content={p => <CiqTooltip {...p} />} />
              <ReferenceLine y={0} stroke="rgba(15,31,28,0.18)" strokeDasharray="3 3" />
              {show.ctl && <Line type="monotone" dataKey="ctl" name="CTL" stroke="#00C896" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#00C896' }} />}
              {show.atl && <Line type="monotone" dataKey="atl" name="ATL" stroke="#FF8C69" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#FF8C69' }} />}
              {show.tsb && <Line type="monotone" dataKey="tsb" name="TSB" stroke="#94A3B8" strokeWidth={1.5} dot={false} strokeDasharray="4 2" activeDot={{ r: 4, fill: '#94A3B8' }} />}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Weekly TSS */}
      <div className="card p-5">
        <p className="section-title mb-4">WEEKLY LOAD (TSS)</p>
        {weeklyData.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <Tooltip content={p => <CiqTooltip {...p} suffixes={{ tss: ' TSS' }} />} />
              <Bar dataKey="tss" name="TSS" fill="#00C896" fillOpacity={0.80} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

// ─── Performance tab ──────────────────────────────────────────────────────────

function PerformanceTab({ activities, range, profile }) {
  const [metric, setMetric] = useState('tss')

  const weeklyData = useMemo(() => groupByWeek(activities, range.days), [activities, range.days])

  const ftp    = profile.ftp   ?? 260
  const weight = profile.weight ?? 70
  const wpkg   = weight > 0 ? +(ftp / weight).toFixed(1) : '—'

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - range.days)
  const periodActs = activities.filter(a => a.date && new Date(a.date + 'T12:00:00') >= cutoff)
  const totalHours = +(periodActs.reduce((s, a) => s + (a.moving_time_s || 0) / 3600, 0)).toFixed(1)
  const totalRides = periodActs.length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <KpiTile label="FTP"              value={ftp}        unit="w"   />
        <KpiTile label="W/KG"             value={wpkg}                  />
        <KpiTile label={`${range.label} HOURS`} value={totalHours} unit="h" />
        <KpiTile label={`${range.label} RIDES`} value={totalRides}       />
      </div>

      {/* Weekly volume */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="section-title">WEEKLY VOLUME</p>
          <div className="flex gap-1 p-0.5 rounded-lg" style={{ backgroundColor: 'rgba(15,31,28,0.07)' }}>
            {[{ k: 'tss', l: 'TSS' }, { k: 'hours', l: 'Hours' }].map(({ k, l }) => (
              <button key={k} onClick={() => setMetric(k)}
                className="px-2.5 py-0.5 rounded-md text-xs font-medium transition-all"
                style={{
                  backgroundColor: metric === k ? '#0F1F1C' : 'transparent',
                  color:            metric === k ? '#fff'    : '#637068',
                }}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {weeklyData.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <Tooltip content={p => <CiqTooltip {...p} suffixes={{ tss: ' TSS', hours: 'h' }} />} />
              <Bar dataKey={metric} name={metric === 'tss' ? 'TSS' : 'Hours'} fill="#0F1F1C" fillOpacity={0.75} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Training adaptation */}
      <TrainingAdaptation />
    </div>
  )
}

// ─── Health tab ───────────────────────────────────────────────────────────────

function HealthTab({ whoopHistory, range }) {
  if (!whoopHistory || (whoopHistory.recovery.length === 0 && whoopHistory.sleep.length === 0)) {
    return (
      <div className="card p-8 text-center space-y-1">
        <p className="text-sm font-semibold">Whoop not connected</p>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Go to Settings → Whoop to connect and see HRV, sleep, and recovery trends.
        </p>
      </div>
    )
  }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - range.days)
  const fmtD = d => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const recovery = whoopHistory.recovery.filter(r => new Date(r.date + 'T12:00:00') >= cutoff)
  const sleep    = whoopHistory.sleep.filter(s => new Date(s.date + 'T12:00:00') >= cutoff)
  const cycles   = (whoopHistory.cycles || []).filter(c => new Date(c.date + 'T12:00:00') >= cutoff)

  // Build a date-keyed map of cycle data for joining onto recovery chart
  const cycleByDate = {}
  for (const c of cycles) cycleByDate[c.date] = c

  const latestRec   = recovery[recovery.length - 1]
  const latestSleep = sleep[sleep.length - 1]
  const hrvArr      = recovery.filter(r => r.hrv != null)
  const avgHRV      = hrvArr.length ? Math.round(hrvArr.reduce((s, r) => s + r.hrv, 0) / hrvArr.length) : null
  const strainArr   = cycles.filter(c => c.strain != null)
  const avgStrain   = strainArr.length ? +(strainArr.reduce((s, c) => s + c.strain, 0) / strainArr.length).toFixed(1) : null

  const recChartData  = recovery.map(r => ({
    label:    fmtD(r.date),
    recovery: r.recoveryScore,
    strain:   cycleByDate[r.date]?.strain ?? null,
  }))
  const sleepChartData = sleep.map(s => ({ label: fmtD(s.date), sleep: +(s.hoursOfSleep || 0).toFixed(1) }))
  const calChartData   = cycles.filter(c => c.calories != null).map(c => ({ label: fmtD(c.date), calories: c.calories }))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <KpiTile label="RECOVERY"              value={latestRec?.recoveryScore ?? '—'}                unit="%" />
        <KpiTile label={`${range.label} AVG HRV`}    value={avgHRV}                                        unit="ms" />
        <KpiTile label="LAST SLEEP"            value={latestSleep?.hoursOfSleep?.toFixed(1) ?? '—'}   unit="h"  />
        <KpiTile label={`${range.label} AVG STRAIN`} value={avgStrain}                                      unit=""   />
      </div>

      {/* Recovery + Strain */}
      <div className="card p-5">
        <p className="section-title mb-4">RECOVERY SCORE & STRAIN</p>
        {recChartData.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={recChartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} interval={tickInterval(range.days)} />
              <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <Tooltip content={p => <CiqTooltip {...p} suffixes={{ recovery: '%', strain: '' }} />} />
              <Line type="monotone" dataKey="recovery" name="Recovery" stroke="#00C896" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#00C896' }} />
              <Line type="monotone" dataKey="strain"   name="Strain"   stroke="#FF8C69" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#FF8C69' }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Sleep */}
      <div className="card p-5">
        <p className="section-title mb-4">SLEEP DURATION</p>
        {sleepChartData.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sleepChartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} interval={tickInterval(range.days)} />
              <YAxis domain={[0, 12]} tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <Tooltip content={p => <CiqTooltip {...p} suffixes={{ sleep: 'h' }} />} />
              <ReferenceLine y={8} stroke="rgba(15,31,28,0.20)" strokeDasharray="4 2"
                label={{ value: '8h', position: 'insideTopRight', fontSize: 10, fill: '#637068', fontFamily: 'DM Mono, monospace' }} />
              <Bar dataKey="sleep" name="Sleep" fill="#4A90E2" fillOpacity={0.75} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Daily Calories */}
      <div className="card p-5">
        <p className="section-title mb-4">DAILY CALORIES</p>
        {calChartData.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={calChartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} interval={tickInterval(range.days)} />
              <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <Tooltip content={p => <CiqTooltip {...p} suffixes={{ calories: ' kcal' }} />} />
              <Bar dataKey="calories" name="Calories" fill="#FF8C69" fillOpacity={0.75} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function AnalyticsSection({ embedded = false }) {
  const { profile } = useProfile()
  const [activeTab, setActiveTab]     = useState('Load')
  const [range, setRange]             = useState(RANGES[1]) // default 12W
  const [activities, setActivities]   = useState([])
  const [whoopHistory, setWhoopHistory] = useState(null)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    const today      = new Date()
    const twoYearsAgo = new Date(today)
    twoYearsAgo.setFullYear(today.getFullYear() - 2)
    const start = twoYearsAgo.toISOString().substring(0, 10)
    const end   = today.toISOString().substring(0, 10)

    Promise.all([
      fetchActivities(start, end, profile.ftp)
        .then(data => setActivities(Object.values(data.byDate || {}).flat())),
      fetch('/api/whoop/history?days=180')
        .then(r => r.ok ? r.json() : null)
        .then(setWhoopHistory)
        .catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [profile.ftp])

  return (
    <div className={embedded ? 'pb-6' : 'max-w-4xl mx-auto px-6 py-6'}>
      {!embedded && (
        <div className="mb-6">
          <p className="section-title mb-1">Analytics</p>
          <h1 className="text-2xl font-semibold">Training Insights</h1>
        </div>
      )}

      {/* Tab bar + range selector */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-0.5 px-1.5 py-1.5 rounded-2xl w-fit"
          style={{ backgroundColor: '#0A1628' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: activeTab === tab ? '#fff' : 'transparent',
                color:            activeTab === tab ? '#0A1628' : '#ffffff',
              }}>
              {tab}
            </button>
          ))}
        </div>
        <RangeSelector range={range} onRange={setRange} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-56">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading data…</p>
        </div>
      ) : (
        <>
          {activeTab === 'Load'        && <LoadTab        activities={activities} range={range} />}
          {activeTab === 'Performance' && <PerformanceTab activities={activities} range={range} profile={profile} />}
          {activeTab === 'Health'      && <HealthTab      whoopHistory={whoopHistory} range={range} />}
        </>
      )}
    </div>
  )
}
