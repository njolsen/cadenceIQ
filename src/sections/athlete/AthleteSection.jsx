import { useState, useEffect, useRef } from 'react'
import WeeklyCalendar from './WeeklyCalendar'
import SeasonSetupModal from './SeasonSetupModal'
import TrainingAdaptation from './TrainingAdaptation'
import AnalyticsSection from '../analytics/AnalyticsSection'
import { fetchActivities } from '../../services/activitiesApi'
import { useProfile } from '../../context/ProfileContext'
import Avatar from '../../components/Avatar'

const TABS = ['Overview', 'Training & Racing Calendar', 'Analytics']

// Shared week data (used by Overview glance + Calendar)
export const SESSIONS = [
  { day: 'Mon', type: 'Endurance', intensity: 'low' },
  { day: 'Tue', type: 'Intervals', intensity: 'high' },
  { day: 'Wed', type: 'Recovery',  intensity: 'low', adjusted: true },
  { day: 'Thu', type: 'Threshold', intensity: 'med' },
  { day: 'Fri', type: null,        intensity: null },
  { day: 'Sat', type: 'Long Ride', intensity: 'med' },
  { day: 'Sun', type: 'Easy Spin', intensity: 'low' },
]

const INTENSITY_COLOR = {
  low:  { bar: '#00C896' },
  med:  { bar: '#F5A623' },
  high: { bar: '#E85555' },
}

// Default season — pre-seeded so the arc renders immediately
const DEFAULT_SEASON = {
  season: { start: '2026-01-01', end: '2026-11-30' },
  races: [],
}

// ─── Main section ─────────────────────────────────────────────────────────────

export default function AthleteSection() {
  const { profile, garminStatus } = useProfile()
  const [activeTab, setActiveTab]     = useState('Overview')
  const [highlightDay, setHighlightDay] = useState(null)
  const [seasonData, setSeasonData]   = useState(DEFAULT_SEASON)
  const [showSeasonModal, setShowSeasonModal] = useState(false)
  const [showSeasonDateModal, setShowSeasonDateModal] = useState(false)
  const [activityByDate, setActivityByDate] = useState({})

  useEffect(() => {
    refreshActivities()
  }, [garminStatus.connected])

  function refreshActivities() {
    fetchActivities('2026-06-01', '2026-06-30')
      .then(data => setActivityByDate(data.byDate || {}))
      .catch(() => {})
  }

  function goToCalendar(dayIndex) {
    setHighlightDay(dayIndex)
    setActiveTab('Calendar')
  }

  function handleAddCalendarEvent(event) {
    setSeasonData(prev => ({
      ...prev,
      races: [...(prev.races ?? []), event],
    }))
  }

  function handleRemoveCalendarEvent(eventId) {
    setSeasonData(prev => ({
      ...prev,
      races: (prev.races ?? []).filter(r => r.id !== eventId),
    }))
  }

  const pageHeader = (
    <div className="flex items-end justify-between mb-6">
      <div className="flex items-center gap-3">
        <Avatar firstName={profile.firstName} lastName={profile.lastName} avatarUrl={profile.avatarUrl} size={52} />
        <div>
          <p className="section-title mb-1">Athlete</p>
          <h1 className="text-2xl font-semibold">{profile.firstName} {profile.lastName}</h1>
        </div>
      </div>
      <span
        className="text-xs px-3 py-1 rounded-full font-medium"
        style={{ backgroundColor: 'rgba(0,200,150,0.12)', color: 'var(--color-accent-dim)' }}
      >
        Cat 1 Road
      </span>
    </div>
  )

  const subTabs = (
    <div
      className="flex items-center gap-0.5 px-1.5 py-1.5 rounded-2xl mb-6"
      style={{ backgroundColor: '#0A1628' }}
    >
      {TABS.map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
          style={{
            backgroundColor: activeTab === tab ? '#ffffff' : 'transparent',
            color:            activeTab === tab ? '#0A1628' : '#ffffff',
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  )

  if (activeTab === 'Analytics') {
    return (
      <div className="max-w-6xl w-full mx-auto px-6 pt-6">
        {pageHeader}
        {subTabs}
        <AnalyticsSection embedded />
      </div>
    )
  }

  if (activeTab === 'Training & Racing Calendar') {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        {/* Static: header + tabs + season arc */}
        <div className="shrink-0 max-w-6xl w-full mx-auto px-6 pt-6">
          {pageHeader}
          {subTabs}
          <div className="card mb-4 px-6 py-3">
            <SeasonArc seasonData={seasonData} onEditDates={() => setShowSeasonDateModal(true)} />
          </div>
        </div>
        {/* Scrollable: calendar only */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 pb-6">
            <WeeklyCalendar
              seasonData={seasonData}
              onSetupSeason={() => setShowSeasonModal(true)}
              highlightDay={highlightDay}
              onClearHighlight={() => setHighlightDay(null)}
              activityByDate={activityByDate}
              athleteFtp={profile.ftp}
              readinessScore={WHOOP_DATA.recovery}
              onAddCalendarEvent={handleAddCalendarEvent}
              onRemoveCalendarEvent={handleRemoveCalendarEvent}
            />
          </div>
        </div>
        {showSeasonDateModal && (
          <SeasonDateModal
            season={seasonData.season}
            onClose={() => setShowSeasonDateModal(false)}
            onSave={season => { setSeasonData(prev => ({ ...prev, season })); setShowSeasonDateModal(false) }}
          />
        )}
        {showSeasonModal && (
          <SeasonSetupModal
            onClose={() => setShowSeasonModal(false)}
            onConfirm={data => { setSeasonData(data); setShowSeasonModal(false) }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {pageHeader}
      {subTabs}
      {activeTab === 'Overview' && (
        <OverviewTab
          seasonData={seasonData}
          onSetupSeason={() => setShowSeasonModal(true)}
          onDayClick={goToCalendar}
        />
      )}
      {showSeasonModal && (
        <SeasonSetupModal
          onClose={() => setShowSeasonModal(false)}
          onConfirm={data => { setSeasonData(data); setShowSeasonModal(false) }}
        />
      )}
    </div>
  )
}

// ─── Season Arc (shared between Overview + Calendar) ─────────────────────────

export function SeasonArc({ seasonData, onEditDates, onSetupSeason, onRaceClick }) {
  if (!seasonData) {
    return (
      <div className="flex items-center gap-3 mb-1">
        <span className="section-title whitespace-nowrap">Season</span>
        <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(15,31,28,0.08)' }} />
        <button
          onClick={onSetupSeason}
          className="text-xs font-medium px-3 py-1 rounded-full transition-colors shrink-0"
          style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)', border: 'var(--border)' }}
        >
          Set up season
        </button>
      </div>
    )
  }

  const today = new Date(new Date().toISOString().slice(0, 10))
  const start = new Date(seasonData.season.start)
  const end   = new Date(seasonData.season.end)
  const totalMs = end - start
  const elapsed = today - start
  const pct = Math.min(Math.max((elapsed / totalMs) * 100, 0), 100)

  function racePct(dateStr) {
    return Math.min(Math.max(((new Date(dateStr) - start) / totalMs) * 100, 0), 100)
  }

  function daysUntil(dateStr) {
    const d = new Date(dateStr)
    return Math.ceil((d - today) / (1000 * 60 * 60 * 24))
  }

  const upcoming = (seasonData.races ?? [])
    .map(r => ({ ...r, days: daysUntil(r.date) }))
    .filter(r => r.days >= 0)
    .sort((a, b) => a.days - b.days)

  function countdownLabel(days) {
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    return `${days}d`
  }

  const next = upcoming[0] ?? null

  return (
    <div className="flex items-center gap-3">
      <span className="section-title whitespace-nowrap">Season</span>
      <div className="flex-1 relative h-1.5 rounded-full" style={{ backgroundColor: 'rgba(15,31,28,0.08)' }}>
        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: '#FF2D78' }} />
        {/* Event/race dot markers */}
        {(seasonData.races ?? []).map((r, i) => {
          const rp = racePct(r.date)
          const isA = r.priority === 'A race'
          return (
            <span
              key={r.id ?? i}
              title={`${r.name} · ${r.date}`}
              style={{
                position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                left: `${rp}%`, marginLeft: '-4px',
                width: isA ? '10px' : '7px',
                height: isA ? '10px' : '7px',
                borderRadius: '50%',
                backgroundColor: isA ? '#FF2D78' : 'rgba(15,31,28,0.35)',
                border: '2px solid white',
                display: 'inline-block',
                zIndex: 1,
              }}
            />
          )
        })}
        {/* Today marker */}
        <span
          className="absolute top-1/2 -translate-y-1/2"
          style={{
            left: `${pct}%`, marginLeft: '-4px',
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: '#FF2D78', border: '2px solid white',
            display: 'inline-block', zIndex: 2,
          }}
        />
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {next && (
          <div className="flex items-center gap-1.5">
            <span
              className="data-value text-xs font-semibold"
              style={{ color: '#FF2D78' }}
            >
              {next.name}
            </span>
            <span
              className="data-value text-[11px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: 'rgba(255,45,120,0.10)', color: '#FF2D78' }}
            >
              {countdownLabel(next.days)}
            </span>
          </div>
        )}
        <button
          onClick={onEditDates ?? onSetupSeason}
          className="text-[11px] px-2 py-0.5 rounded-full transition-colors"
          style={{ backgroundColor: 'rgba(15,31,28,0.05)', color: 'var(--color-text-muted)', border: 'var(--border)' }}
        >
          Edit
        </button>
      </div>
    </div>
  )
}

function SeasonDateModal({ season, onClose, onSave }) {
  const [start, setStart] = useState(season?.start ?? '')
  const [end,   setEnd]   = useState(season?.end   ?? '')
  const canSave = start && end && new Date(start) < new Date(end)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(10,22,40,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm rounded-2xl p-6 relative" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 8px 40px rgba(15,31,28,0.16)' }}>
        <button onClick={onClose}
          className="absolute top-5 right-5 w-7 h-7 rounded-full flex items-center justify-center text-sm"
          style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)' }}>✕</button>
        <p className="font-semibold text-base mb-1">Season dates</p>
        <p className="text-xs mb-5" style={{ color: 'var(--color-text-muted)' }}>Set the start and end of your racing season.</p>
        <div className="space-y-4">
          <div>
            <p className="section-title mb-1.5">Season start</p>
            <input type="date" value={start} onChange={e => setStart(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.03)' }} />
          </div>
          <div>
            <p className="section-title mb-1.5">Season end</p>
            <input type="date" value={end} onChange={e => setEnd(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.03)' }} />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-full text-sm font-medium"
            style={{ backgroundColor: 'rgba(15,31,28,0.05)', color: 'var(--color-text-muted)' }}>Cancel</button>
          <button onClick={() => canSave && onSave({ start, end })}
            className="flex-1 py-2 rounded-full text-sm font-semibold"
            style={{ backgroundColor: canSave ? '#0A1628' : 'rgba(15,31,28,0.1)', color: canSave ? '#fff' : 'var(--color-text-muted)', cursor: canSave ? 'pointer' : 'not-allowed' }}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

// Whoop mock data — in production this comes from the Whoop API
const WHOOP_DATA = {
  syncedAt: '6:42 am',
  wakeTime: '05:32',      // Detected from sleep data — read-only
  recovery: 78,           // Whoop Recovery % (0–100)
  hrv: { value: 68, unit: 'ms',    baseline: 65, trend: 'up'   },
  sleep: { value: 7.4, unit: 'h',  baseline: 8,  trend: 'down' },
  sleepQuality: { value: 84, unit: '%', baseline: 80, trend: 'up' },
  restingHR: { value: 48, unit: 'bpm', baseline: 51, trend: 'up' },
  respiratoryRate: { value: 14.2, unit: '/min', baseline: 14.5, trend: 'flat' },
}

// Internal health score derived from Whoop recovery %
const INTERNAL_HEALTH_SCORE = WHOOP_DATA.recovery  // 78

function readinessColor(score) {
  if (score >= 75) return { stroke: '#00C896', text: '#00A87E', bg: 'rgba(0,200,150,0.08)' }
  if (score >= 50) return { stroke: '#F5A623', text: '#B87000', bg: 'rgba(245,166,35,0.08)' }
  return               { stroke: '#E85555', text: '#C94444', bg: 'rgba(232,85,85,0.08)' }
}

function readinessLabel(score) {
  if (score >= 85) return 'Primed to train'
  if (score >= 75) return 'Good to train'
  if (score >= 60) return 'Train with care'
  if (score >= 45) return 'Take it easy today'
  return 'Rest recommended'
}

// External load modifier penalties (subtracted from time-availability score)
const STRESS_PENALTY  = { none: 0, mild: 10, moderate: 25, severe: 45 }
const INJURY_PENALTY  = { none: 0, minor: 15, major: 45 }

// ─── Time helpers ────────────────────────────────────────────────────────────

function toDec(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h + m / 60
}

function toLabel(dec) {
  const h24 = Math.floor(dec)
  const m   = Math.round((dec - h24) * 60)
  const ampm = h24 >= 12 ? 'pm' : 'am'
  const h12  = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${String(m).padStart(2, '0')}${ampm}`
}

function toHHMM(dec) {
  const h = Math.floor(dec)
  const m = Math.round((dec - h) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Parse human-typed times: "8am", "8:30pm", "9:30 pm", "17:00", "8:00", "8"
function parseHuman(str) {
  if (!str) return null
  const s = str.trim().toLowerCase().replace(/\s+/g, '')
  const ampm = s.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)$/)
  if (ampm) {
    let h = parseInt(ampm[1], 10)
    const m = ampm[2] ? parseInt(ampm[2], 10) : 0
    if (ampm[3] === 'pm' && h !== 12) h += 12
    if (ampm[3] === 'am' && h === 12) h = 0
    if (h < 0 || h > 23 || m < 0 || m > 59) return null
    return h + m / 60
  }
  const hhmm = s.match(/^(\d{1,2}):(\d{2})$/)
  if (hhmm) {
    const h = parseInt(hhmm[1], 10), m = parseInt(hhmm[2], 10)
    if (h < 0 || h > 23 || m < 0 || m > 59) return null
    return h + m / 60
  }
  const bare = s.match(/^(\d{1,2})$/)
  if (bare) {
    const h = parseInt(bare[1], 10)
    if (h < 0 || h > 23) return null
    return h
  }
  return null
}

// Generate time options in 30-min increments between two decimal hours
function timeOptions(fromDec, toDec_) {
  const opts = []
  for (let t = fromDec; t <= toDec_; t += 0.5) {
    const h = Math.floor(t)
    const m = Math.round((t - h) * 60)
    opts.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
  }
  return opts
}

// Detect free training windows in the waking day
function detectWindows(wake, bed, workStart, workEnd, commitments) {
  const wD  = toDec(wake)
  const bD  = toDec(bed)
  const wsD = toDec(workStart)
  const weD = toDec(workEnd)

  const busy = [
    { start: wsD, end: weD },
    ...commitments.map(c => ({ start: toDec(c.start), end: toDec(c.start) + c.duration })),
  ].sort((a, b) => a.start - b.start)

  const windows = []
  let cur = wD

  for (const block of busy) {
    if (block.start > cur + 0.25) {
      windows.push({ start: cur, end: block.start, duration: Math.round((block.start - cur) * 2) / 2 })
    }
    cur = Math.max(cur, block.end)
  }
  if (bD > cur + 0.25) {
    windows.push({ start: cur, end: bD, duration: Math.round((bD - cur) * 2) / 2 })
  }
  return windows
}

// Detect windows from a unified blocks array (type: 'work' | 'commitment')
function detectWindowsFromBlocks(wake, bed, blocks) {
  const busy = blocks
    .map(b => ({ start: toDec(b.start), end: toDec(b.end) }))
    .filter(b => b.end > b.start)
    .sort((a, z) => a.start - z.start)
  return detectWindows(wake, bed,
    busy[0]?.start ? String(Math.floor(busy[0].start)).padStart(2,'0') + ':' + String(Math.round((busy[0].start%1)*60)).padStart(2,'0') : wake,
    busy[0]?.end   ? String(Math.floor(busy[0].end)).padStart(2,'0')   + ':' + String(Math.round((busy[0].end%1)*60)).padStart(2,'0')   : wake,
    []
  ).concat(
    // Just re-run the proper way: build gap list directly
    []
  )
  // Simpler re-implementation using raw busy list:
}

function gapsFromBlocks(wake, bed, blocks) {
  const wD = toDec(wake)
  const bD = toDec(bed)
  const busy = blocks
    .map(b => ({ start: toDec(b.start), end: toDec(b.end) }))
    .filter(b => b.end > b.start)
    .sort((a, z) => a.start - z.start)

  const windows = []
  let cur = wD
  for (const block of busy) {
    if (block.start > cur + 0.25) {
      windows.push({ start: cur, end: block.start, duration: Math.round((block.start - cur) * 2) / 2 })
    }
    cur = Math.max(cur, block.end)
  }
  if (bD > cur + 0.25) {
    windows.push({ start: cur, end: bD, duration: Math.round((bD - cur) * 2) / 2 })
  }
  return windows.sort((a, b) => b.duration - a.duration) // largest first
}

// External load penalty based on total committed waking hours
function externalPenalty(workHours, commitHours) {
  const committed = workHours + commitHours
  return Math.min(25, Math.max(0, Math.round((committed - 8) * 2.2)))
}

function computeReadiness(workHours, commitHours) {
  return Math.max(20, Math.min(100, INTERNAL_HEALTH_SCORE - externalPenalty(workHours, commitHours)))
}

function metricStatus(metric) {
  const delta = metric.value - metric.baseline
  if (metric.unit === 'bpm') {
    // Lower resting HR = better
    if (delta <= -2) return 'good'
    if (delta <= 2)  return 'fair'
    return 'poor'
  }
  if (metric.unit === '%' || metric.unit === 'ms' || metric.unit === 'h') {
    if (delta >= 0)   return 'good'
    if (delta >= -5)  return 'fair'
    return 'poor'
  }
  // respiratory rate — closer to baseline is better
  return Math.abs(delta) < 0.5 ? 'good' : Math.abs(delta) < 1 ? 'fair' : 'poor'
}

const STATUS_DOT = {
  good: '#00C896',
  fair: '#F5A623',
  poor: '#E85555',
}

// Training recommendation based on best available window + readiness
function trainingRec(availHours, readiness) {
  if (readiness < 45) return { label: 'Rest day', desc: 'Readiness is low — even a short ride may compound fatigue. Prioritise sleep and recovery today.', color: '#E85555' }
  if (availHours < 0.75) return { label: 'No time today', desc: 'Largest gap is under 45 min. Log it as a rest day — a rushed session adds stress without adaptation.', color: 'var(--color-text-muted)' }
  if (availHours < 1.25) return { label: 'Easy spin · 45–60 min', desc: 'Short window. A Z1–Z2 spin keeps the legs moving without digging into fatigue.', color: '#00C896' }
  if (availHours < 2) {
    if (readiness >= 75) return { label: 'Intervals · 60–90 min', desc: 'Solid readiness + tight window. A structured interval session delivers quality over duration.', color: '#E85555' }
    return { label: 'Endurance · 60–90 min', desc: 'Moderate readiness. Keep it Z2 — steady aerobic work fits your current recovery state.', color: '#00C896' }
  }
  if (availHours < 3) {
    if (readiness >= 75) return { label: 'Threshold / tempo · 90–120 min', desc: 'Good readiness + 2h gap. Sweet spot or threshold work — your best adaptation window today.', color: '#F5A623' }
    return { label: 'Endurance · 2h', desc: 'Moderate readiness. Long Z2 — don\'t force intensity on a tired system.', color: '#00C896' }
  }
  if (readiness >= 75) return { label: 'Long ride · 3h+', desc: '3h+ gap and high readiness. Build the aerobic base that race fitness is built on.', color: '#1B6FD8' }
  return { label: 'Endurance · 2–3h', desc: 'Long window but moderate readiness. Cap at 2.5h in Z2 — volume without intensity suits your current state.', color: '#00C896' }
}

// Waking-day timeline bar using unified blocks array
function buildSegs(wake, bed, blocks, windows) {
  const BLOCK_COLOR = { work: 'rgba(15,31,28,0.28)', school: 'rgba(15,31,28,0.28)', social: 'rgba(15,31,28,0.28)', family: 'rgba(15,31,28,0.28)', other: 'rgba(15,31,28,0.28)' }
  const BLOCK_LABEL = { work: 'Work', school: 'School', social: 'Social', family: 'Family', other: 'Other' }
  const wD = toDec(wake), bD = toDec(bed), span = bD - wD
  // Clamp blocks to the waking day — skip anything starting after bed, trim anything ending past bed
  const clampedBlocks = blocks
    .filter(b => toDec(b.start) < bD && toDec(b.end) > wD)
    .map(b => ({ ...b, start: toHHMM(Math.max(toDec(b.start), wD)), end: toHHMM(Math.min(toDec(b.end), bD)) }))
  const raw = [
    ...clampedBlocks.map(b => ({
      start: toDec(b.start), end: toDec(b.end),
      color: BLOCK_COLOR[b.type] ?? 'rgba(15,31,28,0.20)',
      label: b.label || BLOCK_LABEL[b.type] || 'Block',
      kind: 'block',
    })),
    ...windows.map(w => ({
      start: w.start, end: w.end,
      color: '#00C896',
      label: `${w.duration}h`,
      kind: 'gap',
    })),
  ].sort((a, b) => a.start - b.start)
  const segs = []
  let cur = wD
  for (const block of raw) {
    if (block.start > cur) segs.push({ start: cur, end: block.start, color: 'rgba(15,31,28,0.07)', label: null, kind: 'filler' })
    segs.push(block)
    cur = Math.max(cur, block.end)
  }
  if (cur < bD) segs.push({ start: cur, end: bD, color: 'rgba(15,31,28,0.07)', label: null, kind: 'filler' })
  return { segs, span }
}

function MiniTimeline({ wake, bed, blocks, windows, dark = false }) {
  const wD = toDec(wake), bD = toDec(bed)
  const { segs: rawSegs, span } = buildSegs(wake, bed, blocks, windows)

  // On dark backgrounds swap the near-black committed/filler colors to white-tinted
  const segs = dark ? rawSegs.map(s => ({
    ...s,
    color: s.kind === 'gap'    ? s.color                      // keep green
         : s.kind === 'block'  ? 'rgba(255,255,255,0.22)'     // visible on dark
         :                       'rgba(255,255,255,0.07)',     // filler
  })) : rawSegs

  const labelSegs = segs.filter(s => s.kind === 'gap' && s.label && (s.end - s.start) / span >= 0.07)
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const labelColor     = dark ? 'rgba(0,200,150,0.90)' : '#004d35'
  const subLabelColor  = dark ? 'rgba(0,200,150,0.60)' : '#006644'
  const timeLabelColor = dark ? 'rgba(255,255,255,0.30)' : 'rgba(15,31,28,0.30)'

  return (
    <div className="flex-1 flex flex-col gap-1">
      {/* Outer wrapper: relative but NO overflow-hidden so tooltip can escape upward */}
      <div className="relative" style={{ height: 36 }}>

        {/* Layer 1 — colored segments, clipped to rounded bar shape */}
        <div className="absolute inset-0 rounded-xl overflow-hidden flex gap-px">
          {segs.map((s, i) => (
            <div key={i} style={{ flex: Math.max((s.end - s.start) / span, 0.01), backgroundColor: s.color, transition: 'flex 0.3s ease' }} />
          ))}
        </div>

        {/* Layer 2 — gap labels, also clipped */}
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          {labelSegs.map((s, i) => {
            const centerPct = ((s.start + s.end) / 2 - wD) / span * 100
            return (
              <div key={i} className="absolute flex flex-col"
                style={{ left: `${centerPct}%`, top: '50%', transform: 'translate(-50%, -50%)', alignItems: 'center' }}>
                <span className="data-value font-semibold leading-none" style={{ fontSize: 9, whiteSpace: 'nowrap', color: labelColor }}>{s.label}</span>
                <span className="leading-none mt-0.5" style={{ fontSize: 8, color: subLabelColor, opacity: 0.75 }}>free</span>
              </div>
            )
          })}
        </div>

        {/* Layer 3 — hover zones + tooltip, NOT clipped so tooltip floats above bar */}
        <div className="absolute inset-0 flex rounded-xl" style={{ cursor: 'default' }}>
          {segs.map((s, i) => {
            const hrs = Math.round((s.end - s.start) * 10) / 10
            const show = hoveredIdx === i && s.kind !== 'filler'
            return (
              <div key={i} className="relative"
                style={{ flex: Math.max((s.end - s.start) / span, 0.01) }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {show && (
                  <div className="absolute pointer-events-none"
                    style={{ bottom: 'calc(100% + 5px)', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                    <div className="data-value px-1.5 py-0.5 rounded-md font-semibold"
                      style={{ fontSize: 10, whiteSpace: 'nowrap', backgroundColor: '#0A1628', color: '#fff' }}>
                      {hrs}h
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
      <div className="flex justify-between">
        <span className="data-value text-[9px]" style={{ color: timeLabelColor }}>{toLabel(wD)}</span>
        <span className="data-value text-[9px]" style={{ color: timeLabelColor }}>{toLabel(bD)}</span>
      </div>
    </div>
  )
}

function DayTimeline({ wake, bed, blocks, windows }) {
  const wD = toDec(wake), bD = toDec(bed)
  const { segs, span } = buildSegs(wake, bed, blocks, windows)
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="data-value text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{toLabel(wD)}</span>
        <span className="data-value text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{toLabel(bD)}</span>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden gap-px">
        {segs.map((s, i) => (
          <div key={i} style={{ flex: Math.max((s.end - s.start) / span, 0.01), backgroundColor: s.color, transition: 'flex 0.3s ease' }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {[{ color: '#1B6FD8', label: 'Work' }, { color: '#F5A623', label: 'Commitments' }, { color: '#00C896', label: 'Free gaps' }].map(l => (
          <span key={l.label} className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            <span className="w-1.5 h-1.5 rounded-sm inline-block shrink-0" style={{ backgroundColor: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// Custom time picker — 20-minute increments, no native clock UI
const TIME_OPTIONS = (() => {
  const opts = []
  for (let h = 4; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      opts.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
    }
  }
  return opts
})()

function fmtTime(v) {
  if (!v) return '—'
  const [h, m] = v.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${ampm}`
}

function TimeInput({ value, onChange }) {
  const [open, setOpen]   = useState(false)
  const wrapRef           = useRef(null)
  const selRef            = useRef(null)

  useEffect(() => {
    if (!open) return
    selRef.current?.scrollIntoView({ block: 'center' })
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="data-value text-xs rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 transition-colors"
        style={{
          border: open ? '0.5px solid var(--color-accent)' : 'var(--border)',
          backgroundColor: '#FFFFFF',
          color: 'var(--color-text)',
          minWidth: 88,
        }}
      >
        <span className="flex-1 text-left">{fmtTime(value)}</span>
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ opacity: 0.35, flexShrink: 0 }}>
          <path d="M1 3L4 6L7 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div
          className="absolute z-50 overflow-y-auto rounded-xl py-1 mt-1"
          style={{
            top: '100%', left: 0,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            border: 'var(--border)',
            maxHeight: 192,
            minWidth: 110,
          }}
        >
          {TIME_OPTIONS.map(opt => {
            const selected = opt === value
            return (
              <button
                key={opt}
                ref={selected ? selRef : undefined}
                onClick={() => { onChange(opt); setOpen(false) }}
                className="w-full text-left px-3 py-1.5 data-value text-xs transition-colors"
                style={{
                  backgroundColor: selected ? 'rgba(0,200,150,0.08)' : 'transparent',
                  color: selected ? '#00A87E' : 'var(--color-text)',
                  fontWeight: selected ? 600 : 400,
                }}
              >
                {fmtTime(opt)}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DateInput({ value, onChange }) {
  return (
    <input
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="data-value text-xs rounded-lg px-2.5 py-1.5 outline-none"
      style={{ border: 'var(--border)', backgroundColor: '#FFFFFF', color: 'var(--color-text)', cursor: 'pointer' }}
    />
  )
}

function ReadinessRing({ score }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const c = readinessColor(score)
  return (
    <div className="relative shrink-0" style={{ width: 96, height: 96 }}>
      <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(15,31,28,0.07)" strokeWidth="9" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={c.stroke} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="data-value text-2xl font-bold leading-none" style={{ color: c.text }}>{score}</span>
        <span className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Ready</span>
      </div>
    </div>
  )
}

function WhoopMetricRow({ label, metric }) {
  const status = metricStatus(metric)
  const dot    = STATUS_DOT[status]
  const trendArrow = metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'
  const trendColor = metric.unit === 'bpm'
    ? (metric.trend === 'down' ? '#00A87E' : metric.trend === 'up' ? '#C94444' : 'var(--color-text-muted)')
    : (metric.trend === 'up' ? '#00A87E' : metric.trend === 'down' ? '#C94444' : 'var(--color-text-muted)')
  return (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: 'var(--border)' }}>
      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <div className="flex items-center gap-2">
        <span className="data-value text-xs font-semibold">{metric.value}{metric.unit}</span>
        <span className="text-[11px] font-medium" style={{ color: trendColor }}>{trendArrow}</span>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dot }} />
      </div>
    </div>
  )
}

// Duration stepper (for commitment duration)
function DurationStepper({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onChange(Math.max(0.5, value - 0.5))}
        className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
        style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)' }}>−</button>
      <span className="data-value text-xs w-7 text-center">{value}h</span>
      <button onClick={() => onChange(Math.min(8, value + 0.5))}
        className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
        style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text)' }}>+</button>
    </div>
  )
}

const BLOCK_DEFAULTS = { type: 'work', label: '', start: '08:00', end: '17:00' }

// Shared form used for both Add and Edit
function BlockForm({ initial, onSave, onCancel, onDelete, saveLabel = 'Save' }) {
  const [form, setForm] = useState({ ...initial })

  const typeChipStyle = (t) => ({
    backgroundColor: form.type === t ? '#0A1628' : 'rgba(15,31,28,0.05)',
    color:           form.type === t ? '#ffffff'  : 'var(--color-text)',
    border:          form.type === t ? 'none'     : 'var(--border)',
    fontWeight:      form.type === t ? 600        : 400,
  })

  return (
    <div className="rounded-xl p-3 space-y-2.5" style={{ backgroundColor: 'rgba(15,31,28,0.03)', border: 'var(--border)' }}>
      {/* Type chips */}
      <div className="flex gap-2">
        {['work', 'commitment'].map(t => (
          <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
            className="flex-1 py-1.5 rounded-full text-xs transition-all"
            style={typeChipStyle(t)}>
            {t === 'work' ? 'Work' : 'Commitment'}
          </button>
        ))}
      </div>

      {/* Label */}
      <input
        className="w-full rounded-lg px-2.5 py-1.5 text-xs outline-none"
        style={{ border: '0.5px solid rgba(15,31,28,0.12)', backgroundColor: '#FFFFFF' }}
        placeholder={form.type === 'work' ? 'e.g. Office, Client calls' : 'e.g. School run, Gym class'}
        value={form.label}
        onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
      />

      {/* Times */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <p className="text-[10px] mb-1" style={{ color: 'var(--color-text-muted)' }}>Start</p>
          <TextTimeInput value={form.start} onChange={v => setForm(f => ({ ...f, start: v }))} placeholder="e.g. 8am" />
        </div>
        <span className="text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>→</span>
        <div className="flex-1">
          <p className="text-[10px] mb-1" style={{ color: 'var(--color-text-muted)' }}>End</p>
          <TextTimeInput value={form.end} onChange={v => setForm(f => ({ ...f, end: v }))} placeholder="e.g. 5pm" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-0.5">
        {onDelete && (
          <button onClick={onDelete}
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: 'rgba(232,85,85,0.08)', color: '#C94444' }}>
            Delete
          </button>
        )}
        <button onClick={onCancel}
          className="flex-1 py-1.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: 'rgba(15,31,28,0.05)', color: 'var(--color-text-muted)' }}>
          Cancel
        </button>
        <button onClick={() => onSave(form)}
          className="flex-1 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'var(--color-header)', color: 'var(--color-accent)' }}>
          {saveLabel}
        </button>
      </div>
    </div>
  )
}

function ModifierRow({ label, options, value, onChange }) {
  function optStyle(opt) {
    const active = value === opt.value
    if (!active) return { backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '0.5px solid transparent' }
    if (opt.value === 'none') return { backgroundColor: 'rgba(0,200,150,0.10)', color: '#00A87E', border: '0.5px solid rgba(0,200,150,0.25)' }
    if (opt.value === 'mild' || opt.value === 'light' || opt.value === 'minor')
      return { backgroundColor: 'rgba(245,166,35,0.12)', color: '#B87000', border: '0.5px solid rgba(245,166,35,0.30)' }
    return { backgroundColor: 'rgba(232,85,85,0.12)', color: '#C94444', border: '0.5px solid rgba(232,85,85,0.25)' }
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] w-14 shrink-0" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <div className="flex items-center gap-1">
        {options.map(opt => (
          <button key={opt.value} onClick={() => onChange(opt.value)}
            className="text-[11px] px-2 py-0.5 rounded-full transition-colors"
            style={{ fontWeight: value === opt.value ? 600 : 400, ...optStyle(opt) }}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function DailyReadiness({ seasonData, onSetupSeason }) {
  const [planDate, setPlanDate] = useState(new Date().toISOString().slice(0, 10))
  const planDateObj = new Date(planDate + 'T12:00:00')
  const dayName = planDateObj.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = planDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

  // Wake is auto-set from Whoop — read-only
  const wake = WHOOP_DATA.wakeTime

  const [bed,     setBed]     = useState('21:30')
  const [blocks,  setBlocks]  = useState([
    { id: 1, type: 'work',   label: 'Work',   start: '08:00', end: '17:00' },
    { id: 2, type: 'family', label: 'Family', start: '19:00', end: '20:30' },
  ])
  const [addForm,    setAddForm]    = useState({ ...BLOCK_DEFAULTS })
  const [editingId,  setEditingId]  = useState(null)
  const [editForm,   setEditForm]   = useState({})
  const [stress,       setStress]       = useState('none')
  const [injury,       setInjury]       = useState('none')
  const [hasCheckedIn, setHasCheckedIn] = useState(false)

  // Computed values
  const windows    = gapsFromBlocks(wake, bed, blocks)
  const bestWindow = windows[0] ?? { duration: 0 }
  const availHours = bestWindow.duration

  // External load score: how much quality training time does the day allow?
  // Base = free hours scored against a 7h reference (a full Cat 1 training day).
  // Commitments already reduce free hours — no separate penalty needed.
  // Modifiers (illness/alcohol/injury) subtract because body state caps what time allows.
  const totalFreeHours = windows.reduce((s, w) => s + w.duration, 0)
  const FREE_HOURS_REF = 7
  const baseScore  = Math.min(100, Math.round((totalFreeHours / FREE_HOURS_REF) * 100))
  const modPenalty = STRESS_PENALTY[stress] + INJURY_PENALTY[injury]
  const externalScore = Math.max(0, Math.min(100, baseScore - modPenalty))
  const rideAvailPct = baseScore  // kept for display in the hero
  const extScoreColor = readinessColor(externalScore)

  // Training readiness: average of Whoop internal score + external score
  // Only revealed once the user explicitly logs their day
  const readiness = hasCheckedIn ? Math.round((WHOOP_DATA.recovery + externalScore) / 2) : null
  const c = readiness !== null
    ? readinessColor(readiness)
    : { stroke: 'rgba(255,255,255,0.18)', text: 'rgba(255,255,255,0.18)', bg: 'rgba(255,255,255,0.05)' }
  const rec = trainingRec(availHours, readiness ?? WHOOP_DATA.recovery)

  const BLOCK_COLOR = { work: '#1B6FD8', school: '#A78BFA', social: '#F5A623', family: '#E86D2E', other: '#94A3B8' }
  const BLOCK_LABEL = { work: 'Work', school: 'School', social: 'Social', family: 'Family', other: 'Other' }
  const TAG_OPTIONS = ['work', 'school', 'social', 'family', 'other']

  return (
    <div className="card overflow-hidden">

      {/* ── Dark hero header ── */}
      <div style={{ backgroundColor: '#0A1628' }}>
        <div className="px-5 pt-4 pb-4">
          <p className="data-value text-sm font-bold mb-3" style={{ color: '#ffffff' }}>
            {dayName}, {dateStr}
          </p>
          <div className="flex items-stretch">

            {/* ── Left — Training Readiness ring ── */}
            <div className="flex flex-col items-center justify-center pr-6 py-1">
              <p className="text-[9px] uppercase tracking-widest font-semibold mb-3"
                style={{ color: 'rgba(255,255,255,0.45)' }}>Today's Training Readiness</p>
              <div className="relative" style={{ width: 148, height: 148 }}>
                <svg width="148" height="148" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Track */}
                  <circle cx="74" cy="74" r="60" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="11" />
                  {/* Whoop base arc */}
                  <circle cx="74" cy="74" r="60" fill="none"
                    stroke="rgba(0,200,150,0.25)" strokeWidth="11" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 60 * WHOOP_DATA.recovery / 100} ${2 * Math.PI * 60}`}
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                  {/* Combined readiness arc */}
                  <circle cx="74" cy="74" r="60" fill="none"
                    stroke={c.stroke} strokeWidth="11" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 60 * (readiness ?? 0) / 100} ${2 * Math.PI * 60}`}
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="data-value font-bold" style={{ fontSize: 46, lineHeight: 1, color: c.text }}>
                    {readiness !== null ? readiness : '—'}
                  </span>
                  {readiness !== null ? (
                    <p className="text-[10px] font-semibold mt-1 text-center px-2 leading-tight" style={{ color: c.text }}>
                      {readinessLabel(readiness)}
                    </p>
                  ) : (
                    <p className="text-[9px] text-center px-4 mt-1 leading-snug" style={{ color: 'rgba(255,255,255,0.30)' }}>
                      Log load<br />to unlock
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <span className="data-value text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(0,200,150,0.18)', color: '#00C896' }}>
                  {WHOOP_DATA.recovery} Whoop
                </span>
                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.20)' }}>+</span>
                {readiness !== null ? (
                  <span className="data-value text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${extScoreColor.stroke}25`, color: extScoreColor.text }}>
                    {externalScore} day load
                  </span>
                ) : (
                  <span className="data-value text-[10px] px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}>
                    ? day load
                  </span>
                )}
              </div>
            </div>

            {/* Vertical divider */}
            <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.12)', flexShrink: 0, alignSelf: 'stretch' }} />

            {/* ── Right column: Internal Health + External Load side by side, My Day below ── */}
            <div className="flex-1 flex flex-col pl-6">

              {/* Top row: Internal Health | divider | External Load */}
              <div className="flex items-start gap-0 flex-1">

                {/* Internal Health */}
                <div className="flex flex-col gap-2 flex-1">
                  <p className="data-value text-[9px] uppercase tracking-widest font-semibold"
                    style={{ color: 'rgba(255,255,255,0.45)' }}>Internal Health</p>
                  <div className="flex items-start gap-5">
                    {[
                      { label: 'HRV',   val: WHOOP_DATA.hrv.value,      unit: 'ms',  trend: WHOOP_DATA.hrv.trend,      inverted: false },
                      { label: 'Sleep', val: WHOOP_DATA.sleep.value,     unit: 'h',   trend: WHOOP_DATA.sleep.trend,    inverted: false },
                      { label: 'RHR',   val: WHOOP_DATA.restingHR.value, unit: 'bpm', trend: WHOOP_DATA.restingHR.trend, inverted: true  },
                    ].map(m => {
                      const isPositive = m.inverted ? m.trend === 'down' : m.trend !== 'down'
                      const col = m.trend === 'flat' ? 'rgba(255,255,255,0.45)' : isPositive ? '#00C896' : '#E85555'
                      const arrow = m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '→'
                      return (
                        <div key={m.label}>
                          <p className="data-value text-[9px] uppercase tracking-wider mb-1"
                            style={{ color: 'rgba(255,255,255,0.30)' }}>{m.label}</p>
                          <p className="data-value font-bold" style={{ fontSize: 18, lineHeight: 1, color: col }}>
                            {m.val}<span className="font-normal ml-0.5" style={{ fontSize: 9, color: 'rgba(255,255,255,0.30)' }}>{m.unit}</span>
                          </p>
                          <p className="data-value text-[10px] mt-0.5" style={{ color: col }}>{arrow}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Inner vertical divider */}
                <div style={{ width: '1px', alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.10)', flexShrink: 0, marginLeft: 20, marginRight: 20 }} />

                {/* External Load */}
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="data-value text-[9px] uppercase tracking-widest font-semibold"
                      style={{ color: 'rgba(255,255,255,0.45)' }}>External Load</p>
                    <span className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: hasCheckedIn ? '#00C896' : 'rgba(255,255,255,0.18)' }} />
                    <span className="data-value text-[9px]"
                      style={{ color: hasCheckedIn ? '#00C896' : 'rgba(255,255,255,0.25)' }}>
                      {hasCheckedIn ? 'Day logged' : 'Log below ↓'}
                    </span>
                  </div>
                  <div className="flex items-start gap-5">
                    <div>
                      <p className="data-value text-[9px] uppercase tracking-wider mb-1"
                        style={{ color: 'rgba(255,255,255,0.30)' }}>Commitments</p>
                      <p className="data-value font-bold" style={{ fontSize: 18, lineHeight: 1, color: blocks.length > 3 ? '#F5A623' : 'rgba(255,255,255,0.75)' }}>
                        {blocks.length}<span className="font-normal ml-0.5" style={{ fontSize: 9, color: 'rgba(255,255,255,0.30)' }}>{blocks.length === 1 ? 'blk' : 'blks'}</span>
                      </p>
                    </div>
                    <div>
                      <p className="data-value text-[9px] uppercase tracking-wider mb-1"
                        style={{ color: 'rgba(255,255,255,0.30)' }}>Free Time</p>
                      <p className="data-value font-bold"
                        style={{ fontSize: 18, lineHeight: 1, color: totalFreeHours >= 4 ? '#00C896' : totalFreeHours >= 2 ? '#F5A623' : '#E85555' }}>
                        {totalFreeHours.toFixed(1)}<span className="font-normal ml-0.5" style={{ fontSize: 9, color: 'rgba(255,255,255,0.30)' }}>h</span>
                      </p>
                    </div>
                    <div>
                      <p className="data-value text-[9px] uppercase tracking-wider mb-1"
                        style={{ color: 'rgba(255,255,255,0.30)' }}>Modifiers</p>
                      {modPenalty > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          {stress !== 'none' && <span className="data-value text-[10px] font-semibold capitalize" style={{ color: '#F5A623' }}>{stress} stress</span>}
                          {injury !== 'none' && <span className="data-value text-[10px] font-semibold capitalize" style={{ color: '#F5A623' }}>{injury} injury</span>}
                        </div>
                      ) : (
                        <p className="data-value text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>None</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Horizontal divider */}
              <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.10)', flexShrink: 0, marginTop: 16, marginBottom: 16 }} />

              {/* My Day — timeline anchored at bottom */}
              <div className="flex items-center gap-4">
                <p className="data-value text-[9px] uppercase tracking-widest font-semibold shrink-0"
                  style={{ color: 'rgba(255,255,255,0.45)' }}>My Day</p>
                <MiniTimeline wake={wake} bed={bed} blocks={blocks} windows={windows} dark={true} />
                <div className="flex items-baseline gap-0.5 shrink-0">
                  <span className="data-value text-2xl font-bold leading-none" style={{ color: extScoreColor.text }}>
                    {externalScore}
                  </span>
                  <span className="text-[10px] ml-1" style={{ color: 'rgba(255,255,255,0.30)' }}>/ 100</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* ── My Day body ── */}
      <div style={{ borderBottom: 'var(--border)' }}>
        <div className="px-6 py-5">

          {/* ── Step 1: Bedtime ── */}
          <div className="mb-5">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                style={{ backgroundColor: 'var(--color-accent)', color: '#0A1628' }}>1</span>
              <p className="section-title">Expected bedtime</p>
            </div>
            <div className="pl-7 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] w-14 shrink-0" style={{ color: 'var(--color-text-muted)' }}>Bedtime</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shrink-0"
                  style={{ backgroundColor: 'rgba(0,200,150,0.05)', border: '0.5px solid rgba(0,200,150,0.15)' }}>
                  <span className="text-[10px]" style={{ color: '#00A87E' }}>⌚ Wake</span>
                  <span className="data-value text-xs font-semibold" style={{ color: '#00C896' }}>{toLabel(toDec(wake))}</span>
                </div>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>→</span>
                <TimeInput value={bed} onChange={setBed} />
                <span className="data-value text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  {Math.round((toDec(bed) - toDec(wake)) * 10) / 10}h day
                </span>
              </div>
            </div>
          </div>

          {/* ── Step 2: Schedule ── */}
          <div className="mb-5 pt-5" style={{ borderTop: 'var(--border)' }}>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                style={{ backgroundColor: 'var(--color-accent)', color: '#0A1628' }}>2</span>
              <p className="section-title">Set your schedule</p>
            </div>

            <div className="pl-7 space-y-2">

              {/* Committed items */}
              {blocks.map(b => {
                const dur = Math.max(0, toDec(b.end) - toDec(b.start))
                const isEditing = editingId === b.id

                if (isEditing) {
                  return (
                    <div key={b.id} className="rounded-xl px-3 py-2.5 space-y-2"
                      style={{ border: '0.5px solid rgba(0,200,150,0.35)', backgroundColor: 'rgba(0,200,150,0.03)' }}>
                      <div className="flex flex-wrap gap-1.5">
                        {TAG_OPTIONS.map(t => {
                          const active = editForm.type === t
                          return (
                            <button key={t}
                              onClick={() => setEditForm(f => ({
                                ...f, type: t,
                                label: !f.label || Object.values(BLOCK_LABEL).includes(f.label) ? BLOCK_LABEL[t] : f.label,
                              }))}
                              className="px-2.5 py-0.5 rounded-full text-[11px] capitalize transition-colors"
                              style={active
                                ? { backgroundColor: '#0A1628', color: '#ffffff', fontWeight: 600 }
                                : { backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)' }
                              }
                            >{BLOCK_LABEL[t]}</button>
                          )
                        })}
                      </div>
                      <input
                        value={editForm.label || ''}
                        onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))}
                        placeholder={`Name (e.g. "${BLOCK_LABEL[editForm.type]}")`}
                        className="w-full text-xs rounded-lg px-2.5 py-1.5 outline-none"
                        style={{ border: 'var(--border)', backgroundColor: '#FFFFFF', color: 'var(--color-text)' }}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] shrink-0" style={{ color: 'var(--color-text-muted)' }}>Start</span>
                        <TimeInput value={editForm.start} onChange={v => setEditForm(f => ({ ...f, start: v }))} />
                        <span className="text-[10px] shrink-0" style={{ color: 'var(--color-text-muted)' }}>End</span>
                        <TimeInput value={editForm.end} onChange={v => setEditForm(f => ({ ...f, end: v }))} />
                        <div className="ml-auto flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 rounded-lg text-[11px] shrink-0"
                            style={{ color: 'var(--color-text-muted)', backgroundColor: 'rgba(15,31,28,0.06)' }}
                          >Cancel</button>
                          <button
                            onClick={() => {
                              setBlocks(prev => prev.map(x => x.id !== b.id ? x : {
                                ...x, ...editForm,
                                label: editForm.label?.trim() || BLOCK_LABEL[editForm.type],
                              }))
                              setEditingId(null)
                            }}
                            className="px-3 py-1 rounded-lg text-[11px] font-semibold shrink-0 hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: 'var(--color-accent)', color: '#0A1628' }}
                          >Save</button>
                        </div>
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={b.id}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer group"
                    style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.07)' }}
                    onClick={() => { setEditingId(b.id); setEditForm({ type: b.type, label: b.label, start: b.start, end: b.end }) }}>
                    <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: BLOCK_COLOR[b.type] ?? '#94A3B8' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{b.label}</p>
                      <p className="data-value text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        {toLabel(toDec(b.start))} – {toLabel(toDec(b.end))} · {dur.toFixed(1)}h
                      </p>
                    </div>
                    <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity mr-1"
                      style={{ color: 'var(--color-text-muted)' }}>Edit</span>
                    <button
                      onClick={e => { e.stopPropagation(); setBlocks(prev => prev.filter(x => x.id !== b.id)) }}
                      className="text-sm leading-none shrink-0 hover:opacity-50 transition-opacity"
                      style={{ color: 'var(--color-text-muted)' }}
                    >×</button>
                  </div>
                )
              })}

              {/* Inline add form — feels like the next item in the list */}
              <div className="rounded-xl px-3 py-2.5 space-y-2"
                style={{ border: '0.5px dashed rgba(15,31,28,0.18)', backgroundColor: 'rgba(15,31,28,0.02)' }}>
                <div className="flex flex-wrap gap-1.5">
                  {TAG_OPTIONS.map(t => {
                    const active = addForm.type === t
                    return (
                      <button key={t}
                        onClick={() => setAddForm(f => ({
                          ...f, type: t,
                          label: !f.label || Object.values(BLOCK_LABEL).includes(f.label) ? BLOCK_LABEL[t] : f.label,
                        }))}
                        className="px-2.5 py-0.5 rounded-full text-[11px] capitalize transition-colors"
                        style={active
                          ? { backgroundColor: '#0A1628', color: '#ffffff', fontWeight: 600 }
                          : { backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)' }
                        }
                      >{BLOCK_LABEL[t]}</button>
                    )
                  })}
                </div>
                <input
                  value={addForm.label}
                  onChange={e => setAddForm(f => ({ ...f, label: e.target.value }))}
                  placeholder={`Name (e.g. "${BLOCK_LABEL[addForm.type]}")`}
                  className="w-full text-xs rounded-lg px-2.5 py-1.5 outline-none"
                  style={{ border: 'var(--border)', backgroundColor: '#FFFFFF', color: 'var(--color-text)' }}
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] shrink-0" style={{ color: 'var(--color-text-muted)' }}>Start</span>
                  <TimeInput value={addForm.start} onChange={v => setAddForm(f => ({ ...f, start: v }))} />
                  <span className="text-[10px] shrink-0" style={{ color: 'var(--color-text-muted)' }}>End</span>
                  <TimeInput value={addForm.end} onChange={v => setAddForm(f => ({ ...f, end: v }))} />
                  <button
                    onClick={() => {
                      setBlocks(prev => [...prev, {
                        ...addForm,
                        label: addForm.label.trim() || BLOCK_LABEL[addForm.type],
                        id: Date.now(),
                      }])
                      setAddForm({ ...BLOCK_DEFAULTS })
                    }}
                    className="ml-auto px-3 py-1 rounded-lg text-[11px] font-semibold shrink-0 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'var(--color-accent)', color: '#0A1628' }}
                  >+ Add</button>
                </div>
              </div>

              {/* Best ride window */}
              {windows.length > 0 && (
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2"
                  style={{ backgroundColor: 'rgba(0,200,150,0.06)', border: '0.5px solid rgba(0,200,150,0.18)' }}>
                  <span className="text-[10px] font-medium" style={{ color: '#00A87E' }}>Best window</span>
                  <span className="data-value text-xs font-bold" style={{ color: '#00C896' }}>{bestWindow.duration}h</span>
                  <span className="data-value text-[10px]" style={{ color: 'rgba(0,168,126,0.70)' }}>
                    {toLabel(bestWindow.start)} – {toLabel(bestWindow.end)}
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* ── Step 3: Modifiers ── */}
          <div className="mb-5 pt-5" style={{ borderTop: 'var(--border)' }}>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                style={{ backgroundColor: 'var(--color-accent)', color: '#0A1628' }}>3</span>
              <p className="section-title">Enter Modifiers</p>
            </div>
            <div className="pl-7 space-y-1.5">
              <ModifierRow
                label="Stress"
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'mild', label: 'Mild' },
                  { value: 'moderate', label: 'Moderate' },
                  { value: 'severe', label: 'Severe' },
                ]}
                value={stress}
                onChange={setStress}
              />
              <ModifierRow
                label="Injury"
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'minor', label: 'Minor' },
                  { value: 'major', label: 'Major' },
                ]}
                value={injury}
                onChange={setInjury}
              />
            </div>
          </div>

          {/* ── Score breakdown + Log ── */}
          <div className="pt-4" style={{ borderTop: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-4 text-[11px] flex-wrap">
              <div className="flex items-baseline gap-0.5 px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(0,200,150,0.08)' }}>
                <span style={{ color: '#00A87E' }}>Free time</span>
                <span className="data-value font-bold ml-1" style={{ color: '#00C896' }}>{totalFreeHours.toFixed(1)}h</span>
              </div>
              {modPenalty > 0 && <>
                <span style={{ color: 'var(--color-text-muted)' }}>−</span>
                <div className="flex items-baseline gap-0.5 px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(232,85,85,0.06)' }}>
                  <span style={{ color: '#C94444' }}>Modifiers</span>
                  <span className="data-value font-bold ml-1" style={{ color: '#E85555' }}>{modPenalty}</span>
                </div>
              </>}
              <span style={{ color: 'var(--color-text-muted)' }}>=</span>
              <div className="flex items-baseline gap-0.5 px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: `${extScoreColor.stroke}15` }}>
                <span className="data-value font-bold" style={{ color: extScoreColor.text }}>{externalScore}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>/100</span>
              </div>
            </div>

            {hasCheckedIn ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px]" style={{ color: '#00C896' }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#00C896' }} />
                  Day logged · readiness active
                </div>
                <button
                  onClick={() => setHasCheckedIn(false)}
                  className="text-[11px] px-2.5 py-1 rounded-full transition-colors"
                  style={{ border: 'var(--border)', color: 'var(--color-text-muted)' }}
                >
                  Update
                </button>
              </div>
            ) : (
              <button
                onClick={() => setHasCheckedIn(true)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-90"
                style={{ backgroundColor: '#00C896', color: '#0A1628' }}
              >
                Log today's readiness →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Recommendation footer ── */}
      <div className="px-5 py-3.5 flex items-start gap-3">
        <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: rec.color }} />
        <div>
          <span className="text-sm font-semibold mr-2">{rec.label}</span>
          <span className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{rec.desc}</span>
        </div>
      </div>
    </div>
  )
}

function AlertCard() {
  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-start gap-3"
      style={{ backgroundColor: 'rgba(245,166,35,0.07)', border: '0.5px solid rgba(245,166,35,0.25)' }}
    >
      <span className="text-base mt-0.5 shrink-0">⚡</span>
      <p className="text-sm" style={{ color: 'var(--color-text)' }}>
        <span className="font-medium">Wednesday was auto-adjusted</span>
        <span style={{ color: 'var(--color-text-muted)' }}> due to Tuesday's team dinner — recovery session shortened to 45 min and capped at Z1.</span>
      </p>
    </div>
  )
}

function OverviewTab({ seasonData, onSetupSeason }) {
  return (
    <div className="space-y-4">
      <DailyReadiness seasonData={seasonData} onSetupSeason={onSetupSeason} />
      <AlertCard />
    </div>
  )
}
