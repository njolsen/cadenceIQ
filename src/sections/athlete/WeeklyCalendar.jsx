import { useState, useRef, useEffect } from 'react'
import { SeasonArc } from './AthleteSection'

function BikeIcon({ size = 11, color = 'currentColor' }) {
  const s = { stroke: color }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', flexShrink: 0, verticalAlign: 'middle', overflow: 'visible' }}>
      <circle cx="6" cy="17" r="4.5" style={{ ...s, strokeWidth: 2 }}/>
      <circle cx="18" cy="17" r="4.5" style={{ ...s, strokeWidth: 2 }}/>
      <path d="M6,17 L11,17 L8.5,9 L6,17" style={{ fill: color, stroke: color, strokeWidth: 0.5 }}/>
      <line x1="8.5" y1="9" x2="16" y2="9" style={{ ...s, strokeWidth: 2 }}/>
      <line x1="11" y1="17" x2="17" y2="12" style={{ ...s, strokeWidth: 2 }}/>
      <line x1="17" y1="12" x2="18" y2="17" style={{ ...s, strokeWidth: 2 }}/>
      <line x1="8.5" y1="9" x2="8.5" y2="6" style={{ ...s, strokeWidth: 2 }}/>
      <line x1="6" y1="6" x2="11" y2="6" style={{ ...s, strokeWidth: 2 }}/>
      <line x1="16" y1="9" x2="16" y2="6" style={{ ...s, strokeWidth: 2 }}/>
      <line x1="14" y1="6" x2="19" y2="6" style={{ ...s, strokeWidth: 2 }}/>
    </svg>
  )
}

function DumbbellIcon({ size = 11, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ display: 'inline', flexShrink: 0, verticalAlign: 'middle', fill: color }}>
      <rect x="1" y="7" width="3" height="6" rx="1"/>
      <rect x="4" y="8.5" width="4" height="3" rx="0.5"/>
      <rect x="8" y="9" width="4" height="2" rx="0.5"/>
      <rect x="12" y="8.5" width="4" height="3" rx="0.5"/>
      <rect x="16" y="7" width="3" height="6" rx="1"/>
    </svg>
  )
}

function FlagIcon({ size = 11, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ display: 'inline', flexShrink: 0, verticalAlign: 'middle', fill: color }}>
      <rect x="3" y="2" width="2" height="16" rx="1"/>
      <path d="M5 2 L17 2 L17 10 L5 10 Z"/>
      <rect x="5" y="2" width="4" height="4" style={{ fill: 'white' }}/>
      <rect x="9" y="6" width="4" height="4" style={{ fill: 'white' }}/>
      <rect x="13" y="2" width="4" height="4" style={{ fill: 'white' }}/>
    </svg>
  )
}

function CalendarIcon({ size = 11, color = 'currentColor' }) {
  const s = { stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ display: 'inline', flexShrink: 0, verticalAlign: 'middle', overflow: 'visible' }}>
      <rect x="3" y="4" width="18" height="18" rx="2" style={s} />
      <line x1="16" y1="2" x2="16" y2="6" style={s} />
      <line x1="8" y1="2" x2="8" y2="6" style={s} />
      <line x1="3" y1="10" x2="21" y2="10" style={s} />
    </svg>
  )
}

function SportIcon({ sport, type, size = 11, color }) {
  const s = (sport || type || '').toLowerCase()
  if (s.includes('cycling') || s.includes('bike') || s.includes('virtual') || s.includes('ride')) {
    return <BikeIcon size={size} color={color ?? 'currentColor'} />
  }
  if (s.includes('gym') || s.includes('strength') || s.includes('weight')) {
    return <DumbbellIcon size={size} color={color ?? 'currentColor'} />
  }
  if (s.includes('event') || s.includes('race') || s.includes('flag')) {
    return <FlagIcon size={size} color={color ?? 'currentColor'} />
  }
  if (s.includes('plan')) {
    return <CalendarIcon size={size} color={color ?? 'currentColor'} />
  }
  return null
}

function localIso(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
const TODAY = localIso()

// ─── Training plan data ───────────────────────────────────────────────────────
// Full June 2026 training plan — keyed by ISO date string

const TRAINING_PLAN = {}

const LIFE_EVENTS = [
  { date: '2026-06-02', name: 'Team dinner', type: 'social', time: 'Evening' },
  { date: '2026-06-05', name: 'School play', type: 'family', time: 'Evening' },
]

const LIFE_TYPE_STYLE = {
  social:  { bg: '#FEF3E0', text: '#9A5800' },
  family:  { bg: '#F0ECFA', text: '#5C3A9A' },
  illness: { bg: '#FDECEA', text: '#B02A20' },
  travel:  { bg: '#EEF2F7', text: '#3D5166' },
  work:    { bg: '#FEF3E0', text: '#9A5800' },
  sleep:   { bg: '#F0ECFA', text: '#5C3A9A' },
  other:   { bg: '#F0F2F1', text: '#637068' },
}

const STATUS_STYLE = {
  'On plan':       { bg: 'rgba(0,200,150,0.10)',    text: '#00A87E' },
  'Key session':   { bg: 'rgba(255,45,120,0.10)',   text: '#CC1A5C' },
  'Auto-adjusted': { bg: 'rgba(245,166,35,0.12)',   text: '#B87000' },
  'Protected':     { bg: 'rgba(92,58,154,0.10)',    text: '#5C3A9A' },
}

const INTENSITY_COLOR = {
  low:  { bar: '#00C896', bg: 'rgba(0,200,150,0.07)' },
  med:  { bar: '#F5A623', bg: 'rgba(245,166,35,0.07)' },
  high: { bar: '#E85555', bg: 'rgba(232,85,85,0.07)' },
}

// ─── Life event modal data ────────────────────────────────────────────────────

const EVENT_TYPES = [
  { id: 'social',  label: 'Social / celebration' },
  { id: 'travel',  label: 'Travel' },
  { id: 'family',  label: 'Family commitment' },
  { id: 'work',    label: 'Work stress' },
  { id: 'illness', label: 'Illness' },
  { id: 'sleep',   label: 'Poor sleep' },
  { id: 'other',   label: 'Other' },
]
const SLEEP_OPTS   = ['None', '1–2 nights', 'Several nights']
const ALCOHOL_OPTS = ['None', 'A little', 'Moderate', 'Significant']
const TRAIN_OPTS   = ['Yes fully', 'Modified only', 'No training']

function lifeLoadScore(form) {
  let s = 0
  s += { None: 0, '1–2 nights': 18, 'Several nights': 35 }[form.sleep] ?? 0
  s += { None: 0, 'A little': 8, Moderate: 18, Significant: 30 }[form.alcohol] ?? 0
  s += Math.round((form.stress / 10) * 25)
  s += { 'Yes fully': 0, 'Modified only': 5, 'No training': 10 }[form.canTrain] ?? 0
  return Math.min(s, 100)
}
function severityLabel(score) {
  if (score < 20) return { label: 'Low',      color: '#00A87E', bg: 'rgba(0,200,150,0.10)' }
  if (score < 45) return { label: 'Moderate', color: '#B87000', bg: 'rgba(245,166,35,0.12)' }
  if (score < 70) return { label: 'High',     color: '#C02020', bg: 'rgba(232,85,85,0.12)' }
  return               { label: 'Very high', color: '#900000', bg: 'rgba(192,32,32,0.14)' }
}
function trainingImpacts(form, score) {
  const i = []
  if (form.sleep === 'Several nights') i.push('Recovery sessions extended by 20–30 min for the next 2 days')
  if (form.sleep !== 'None')           i.push('High-intensity intervals moved or reduced in volume')
  if (form.alcohol === 'Significant')  i.push('Threshold and VO2 sessions reduced by one interval block')
  if (form.alcohol !== 'None')         i.push('Hydration targets increased +500ml for 24 hours post-event')
  if (form.stress > 6)                 i.push('Mental stress flag added — coach notified if stress > 7')
  if (form.canTrain === 'No training') i.push('Training paused for the event day; auto-resuming the following day')
  if (form.canTrain === 'Modified only') i.push('Sessions on the event day auto-adjusted to Z1 recovery only')
  if (score > 60)                      i.push('Weekly TSS target reduced by ~15% to manage overall life load')
  if (i.length === 0)                  i.push('No automatic adjustments required — training continues as planned')
  return i
}

// ─── Calendar helpers ─────────────────────────────────────────────────────────

function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function getMonthDays(year, month) {
  const first  = new Date(year, month, 1)
  const last   = new Date(year, month + 1, 0)
  const offset = (first.getDay() + 6) % 7 // Mon-first
  const days   = Array(offset).fill(null)
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d))
  return days
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

// ─── Workout session types ────────────────────────────────────────────────────

const WO_TYPES = ['Endurance','Threshold','Intervals','VO2max','Tempo','Recovery','Race Sim','Custom']
const WO_ZONES = ['Z1','Z2','Z3','Z3–4','Z4','Z4–5','Z5']

// ─── Today's workout recommendation ──────────────────────────────────────────

function TodayRecommendation({ readinessScore, activityByDate, userWorkouts, athleteFtp, seasonData, scheduleBlocks = [] }) {
  const d = new Date(TODAY + 'T12:00:00')
  d.setDate(d.getDate() - 1)
  const yesterdayStr = isoDate(d)

  const stravaYest = activityByDate[yesterdayStr] ?? []
  const userYest   = userWorkouts[yesterdayStr] ?? []

  const stravaTSS  = stravaYest.reduce((s, a) => s + (a.est_tss || 0), 0)
  const stravaSecs = stravaYest.reduce((s, a) => s + (a.moving_time_s || 0), 0)
  const userBikeMins = userYest.filter(w => w.type === 'bike').reduce((s, w) => s + (w.totalMin || 0), 0)

  const yesterdayTSS   = Math.round(stravaTSS)
  const hadWorkout     = stravaSecs > 0 || userBikeMins > 0 || userYest.some(w => w.type !== 'event' && w.type !== 'plan')
  const isHighIntensity = yesterdayTSS > 100 ||
    stravaYest.some(a => a.est_tss && a.moving_time_s && (a.est_tss / (a.moving_time_s / 3600)) > 70)

  let yesterdayLabel = 'Rest day'
  if (hadWorkout) {
    const mins = Math.round(stravaSecs / 60) || userBikeMins
    const h = Math.floor(mins / 60), m = mins % 60
    const durStr = h ? (m ? `${h}h ${m}m` : `${h}h`) : (m ? `${m}m` : '')
    const name = stravaYest[0]?.name || userYest.find(w => w.type !== 'event')?.name || 'Workout'
    yesterdayLabel = [name, durStr && `· ${durStr}`, yesterdayTSS && `· ${yesterdayTSS} TSS`].filter(Boolean).join(' ')
  }

  const today = new Date(TODAY + 'T12:00:00')
  const nextRace = (seasonData?.races ?? [])
    .map(r => ({ ...r, days: Math.ceil((new Date(r.date + 'T12:00:00') - today) / 86400000) }))
    .filter(r => r.days >= 0)
    .sort((a, b) => a.days - b.days)[0] ?? null

  const ftp = athleteFtp || 295
  const W = (lo, hi) => ({ lo: Math.round(ftp * lo), hi: Math.round(ftp * hi) })
  const daysToRace = nextRace?.days ?? null

  const todayPlanEvent = (userWorkouts[TODAY] ?? []).find(w => w.type === 'plan')

  let rec
  if (todayPlanEvent) {
    const emoji = todayPlanEvent.name === 'Travel' ? '✈️' : todayPlanEvent.name === 'Vacation' ? '🌴' : todayPlanEvent.name === 'Event' ? '🎉' : '😴'
    rec = { type: `${emoji} ${todayPlanEvent.name}`, duration: null, zone: null, watts: null,
      rationale: `${todayPlanEvent.name} day — take the day completely off from training. Come back fresh tomorrow.`,
      color: '#F59E0B' }
  } else if (daysToRace === 0) {
    rec = { type: 'Race day', duration: null, zone: null, watts: null,
      rationale: `Today is ${nextRace.name}. Rest until your start — do a short warm-up only, keep legs fresh.`,
      color: '#FF2D78' }
  } else if (daysToRace !== null && daysToRace <= 2) {
    rec = { type: 'Race openers', duration: '45 min', zone: 'Z2 + Z4–5', watts: W(0.55, 1.20),
      rationale: `Race in ${daysToRace} day${daysToRace === 1 ? '' : 's'} — ${nextRace.name}. Short activation with a few 30-sec efforts to keep legs snappy without adding fatigue.`,
      color: '#FF2D78' }
  } else if (daysToRace !== null && daysToRace <= 6) {
    rec = { type: 'Easy endurance', duration: '1h', zone: 'Z2', watts: W(0.55, 0.75),
      rationale: `Race in ${daysToRace} days. Accumulate easy aerobic work — no intensity this close to ${nextRace.name}.`,
      color: '#00C896' }
  } else if (readinessScore < 50) {
    rec = { type: 'Rest day', duration: null, zone: null, watts: null,
      rationale: 'Recovery score is below 50. A rest day compounds fitness faster than any session — let your body adapt from recent training.',
      color: '#E85555' }
  } else if (isHighIntensity) {
    rec = readinessScore >= 75
      ? { type: 'Endurance ride', duration: '1h 30m', zone: 'Z2', watts: W(0.55, 0.75),
          rationale: 'High-intensity effort yesterday. Even with good readiness, stay aerobic today — adaptation from yesterday\'s work happens during recovery, not more intensity.',
          color: '#00C896' }
      : { type: 'Recovery spin', duration: '30–45 min', zone: 'Z1', watts: W(0.45, 0.55),
          rationale: 'Hard effort yesterday with moderate readiness. A short, easy spin flushes lactate without adding training stress.',
          color: '#00C896' }
  } else if (!hadWorkout) {
    rec = readinessScore >= 80
      ? { type: 'Threshold intervals', duration: '1h 15m', zone: 'Z4', watts: W(0.90, 1.05),
          rationale: 'Rest day yesterday + high readiness — optimal conditions for structured intensity. This is your best adaptation window this week.',
          color: '#E85555' }
      : readinessScore >= 65
        ? { type: 'Sweet spot', duration: '1h 30m', zone: 'Z3–4', watts: W(0.84, 0.97),
            rationale: 'Fresh legs after rest with solid readiness. Sustained effort in sweet spot maximises aerobic adaptation per hour.',
            color: '#F5A623' }
        : { type: 'Endurance ride', duration: '1h 30m', zone: 'Z2', watts: W(0.55, 0.75),
            rationale: 'Rest day yesterday but readiness is moderate. Build aerobic base steadily — save intensity for when you\'re more recovered.',
            color: '#00C896' }
  } else if (yesterdayTSS > 60) {
    rec = readinessScore >= 75
      ? { type: 'Endurance ride', duration: '1h 30m', zone: 'Z2', watts: W(0.55, 0.75),
          rationale: 'Solid effort yesterday. High readiness supports aerobic work — no intensity today, let the adaptation from yesterday settle.',
          color: '#00C896' }
      : { type: 'Easy ride', duration: '1h', zone: 'Z1–Z2', watts: W(0.45, 0.70),
          rationale: 'Solid effort yesterday with moderate readiness. Keep the legs moving without adding stress.',
          color: '#00C896' }
  } else {
    rec = readinessScore >= 75
      ? { type: 'Tempo / Sweet spot', duration: '1h 30m', zone: 'Z3–4', watts: W(0.84, 0.97),
          rationale: 'Light load yesterday + good readiness. Sweet spot work sits in your optimal adaptation window today.',
          color: '#F5A623' }
      : { type: 'Endurance ride', duration: '1h 15m', zone: 'Z2', watts: W(0.55, 0.75),
          rationale: 'Light load from yesterday. Steady aerobic work — keep intensity in check and give the body room to recover.',
          color: '#00C896' }
  }

  // Compute largest free training window from today's schedule blocks
  if (scheduleBlocks.length > 0 && rec.type !== 'Race day' && rec.type !== 'Race openers') {
    const tD = s => { const [h, m] = (s || '00:00').split(':').map(Number); return h + m / 60 }
    const wakeH = tD('05:32'), bedH = tD('21:30')
    const busy = scheduleBlocks
      .map(b => ({ start: tD(b.start), end: tD(b.end) }))
      .filter(b => b.end > b.start)
      .sort((a, z) => a.start - z.start)
    let cur = wakeH, bestGap = 0
    for (const blk of busy) {
      if (blk.start > cur + 0.25) bestGap = Math.max(bestGap, blk.start - cur)
      cur = Math.max(cur, blk.end)
    }
    if (bedH > cur + 0.25) bestGap = Math.max(bestGap, bedH - cur)
    const avail = bestGap
    if (avail < 0.75 && rec.type !== 'Rest day') {
      rec = { type: 'No time today', duration: null, zone: null, color: 'var(--color-text-muted)',
        rationale: `Only ${Math.round(avail * 60)} min gap in today's schedule. Log it as a rest day.` }
    } else if (avail < 1.25 && !['Rest day', 'No time today', 'Easy spin · 45–60 min'].includes(rec.type)) {
      rec = { ...rec, duration: '45–60 min', zone: 'Z1–Z2',
        rationale: `${rec.rationale} Schedule only allows ~${avail.toFixed(1)}h today.` }
    } else if (avail < 2 && rec.duration && (rec.duration.includes('2h') || rec.duration.includes('3h'))) {
      rec = { ...rec, duration: `${Math.floor(avail)}h ${Math.round((avail % 1) * 60)}m max`,
        rationale: `${rec.rationale} Capped to your ${avail.toFixed(1)}h window today.` }
    }
  }

  const rColor = readinessScore >= 75 ? '#00C896' : readinessScore >= 50 ? '#F5A623' : '#E85555'
  const rBg    = readinessScore >= 75 ? 'rgba(0,200,150,0.10)' : readinessScore >= 50 ? 'rgba(245,166,35,0.10)' : 'rgba(232,85,85,0.10)'

  return (
    <div className="flex items-center gap-4 w-full min-w-0">

      {/* Yesterday */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[9px] font-medium uppercase tracking-widest"
          style={{ color: 'rgba(15,31,28,0.28)' }}>Yesterday</span>
        <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{yesterdayLabel}</span>
      </div>

      {/* Thin vertical rule */}
      <div className="shrink-0 w-px h-3.5 rounded-full" style={{ backgroundColor: 'rgba(15,31,28,0.13)' }} />

      {/* Today */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <span className="text-[9px] font-medium uppercase tracking-widest shrink-0"
          style={{ color: 'rgba(15,31,28,0.28)' }}>Today</span>
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: rec.color }} />
        <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--color-text)' }}>{rec.type}</span>
        {rec.duration && (
          <span className="data-value text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>{rec.duration}</span>
        )}
        {rec.zone && (
          <span className="data-value text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0"
            style={{ backgroundColor: `${rec.color}13`, color: rec.color }}>{rec.zone}</span>
        )}
      </div>

      {/* Readiness ring — no label, the circle is self-evident */}
      <span className="data-value text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: rBg, color: rColor }}>{readinessScore}</span>

    </div>
  )
}

// ─── Commitment blocks (mirrors Overview defaults) ────────────────────────────

const CALENDAR_BLOCKS = [
  { id: 1, type: 'work',   label: 'Work',   start: '08:00', end: '17:00' },
  { id: 2, type: 'family', label: 'Family', start: '19:00', end: '20:30' },
]
const COMMITMENT_COLOR = {
  work: '#1B6FD8', school: '#A78BFA', social: '#F5A623', family: '#E86D2E', other: '#94A3B8'
}
function fmtBlock(start, end) {
  function fmt(t) {
    const [h, m] = t.split(':').map(Number)
    const ap = h >= 12 ? 'PM' : 'AM'
    return `${h % 12 || 12}${m ? ':' + String(m).padStart(2,'0') : ''} ${ap}`
  }
  return `${fmt(start)} – ${fmt(end)}`
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WeeklyCalendar({
  seasonData,
  onSetupSeason,
  highlightDay = null,
  onClearHighlight,
  activityByDate = {},
  athleteFtp = 295,
  readinessScore = 78,
  onAddCalendarEvent,
  onRemoveCalendarEvent,
  onAddPlanEvent,
  onRemovePlanEvent,
  scheduleBlocks = [],
  onActivitySelect,
}) {
  const [currentMonth, setCurrentMonth] = useState({ year: 2026, month: 5 }) // June 2026
  const [showModal, setShowModal]   = useState(false)
  const [pendingEvents, setPendingEvents] = useState([])
  const [dayModal, setDayModal] = useState(null)   // null | { date, mode: 'pick'|'bike'|'gym'|'event'|'plan' }
  const [userWorkouts, setUserWorkouts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ciq_user_workouts') ?? '{}') }
    catch { return {} }
  }) // { dateStr: [workout] }
  const [sessionOverrides, setSessionOverrides] = useState({}) // { dateStr: { ...override fields } }
  const [copiedItem, setCopiedItem] = useState(null) // item copied for paste to another day

  function persist(next) {
    try { localStorage.setItem('ciq_user_workouts', JSON.stringify(next)) } catch {}
  }

  function handleUpdateSession(dateStr, updates) {
    setSessionOverrides(prev => ({ ...prev, [dateStr]: { ...(prev[dateStr] ?? {}), ...updates } }))
  }

  function handleSaveWorkout(dateStr, workout) {
    const id = Date.now()
    const next = { ...userWorkouts, [dateStr]: [...(userWorkouts[dateStr] ?? []), { id, ...workout }] }
    setUserWorkouts(next)
    persist(next)
    if (workout.type === 'event') {
      onAddCalendarEvent?.({ id, date: dateStr, name: workout.name, distance: workout.eventType, priority: workout.priority, location: workout.location, goal: '' })
    }
    if (workout.type === 'plan') {
      onAddPlanEvent?.({ id, date: dateStr, name: workout.name })
    }
  }
  function handleRemoveWorkout(dateStr, workoutId) {
    const removed = userWorkouts[dateStr]?.find(w => w.id === workoutId)
    const next = { ...userWorkouts, [dateStr]: (userWorkouts[dateStr] ?? []).filter(w => w.id !== workoutId) }
    setUserWorkouts(next)
    persist(next)
    if (removed?.type === 'event') onRemoveCalendarEvent?.(workoutId)
    if (removed?.type === 'plan') onRemovePlanEvent?.(workoutId)
  }
  function handleUpdateWorkout(dateStr, updatedWorkout) {
    const next = { ...userWorkouts, [dateStr]: (userWorkouts[dateStr] ?? []).map(w => w.id === updatedWorkout.id ? updatedWorkout : w) }
    setUserWorkouts(next)
    persist(next)
  }

  const allEvents = [...LIFE_EVENTS, ...pendingEvents]

  // ── Scroll state (lifted from MonthView) ───────────────────────────────────
  const scrollRef    = useRef(null)
  const dividerRefs  = useRef({})
  const todayRowRef  = useRef(null)
  const [displayYear,  setDisplayYear]  = useState(currentMonth.year)
  const [displayMonth, setDisplayMonth] = useState(currentMonth.month)

  const getRelativeTop = el => {
    const scroller = scrollRef.current
    return scroller.scrollTop + el.getBoundingClientRect().top - scroller.getBoundingClientRect().top
  }

  useEffect(() => {
    const el = todayRowRef.current
    if (el && scrollRef.current) scrollRef.current.scrollTop = getRelativeTop(el) - 8
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const root = scrollRef.current
    if (!root) return
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          const [y, m] = e.target.dataset.monthKey.split('-').map(Number)
          setDisplayYear(y); setDisplayMonth(m)
        }
      }),
      { root, threshold: 0, rootMargin: '0px 0px -88% 0px' }
    )
    Object.values(dividerRefs.current).forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const jumpMonth = dir => {
    const idx  = MONTHS_RANGE.findIndex(r => r.year === displayYear && r.month === displayMonth)
    const next = MONTHS_RANGE[Math.max(0, Math.min(MONTHS_RANGE.length - 1, idx + dir))]
    const el   = dividerRefs.current[next.key]
    if (el && scrollRef.current) scrollRef.current.scrollTo({ top: getRelativeTop(el) - 4, behavior: 'smooth' })
  }

  function fmtSecs(s) {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
    return h ? `${h}h ${m}m` : `${m}m`
  }

  function getDaySummary(dateStr) {
    const acts = activityByDate[dateStr]
    if (!acts?.length) return null
    const sorted = [...acts].sort((a, b) => b.moving_time_s - a.moving_time_s)
    const totalTSS  = acts.reduce((s, a) => s + (a.est_tss || 0), 0)
    const totalSecs = acts.reduce((s, a) => s + (a.moving_time_s || 0), 0)
    const totalDist = acts.reduce((s, a) => s + parseFloat(a.distance_mi || 0), 0)
    return {
      count: acts.length,
      totalTSS: Math.round(totalTSS),
      totalDuration: fmtSecs(totalSecs),
      totalDist: totalDist.toFixed(1),
      primary: sorted[0],
      all: sorted,
    }
  }

  // Week view derived state
  const WEEK_START = new Date('2026-05-31') // Sunday before Mon May 26?
  const TODAY_STR  = TODAY

  function handleDaySelect(dateStr) {
    const hasUserItems = (userWorkouts[dateStr]?.length ?? 0) > 0
    const hasPlanned = !!TRAINING_PLAN[dateStr] && !sessionOverrides[dateStr]?.skipped
    if (!hasUserItems && !hasPlanned) return
    setDayModal({ date: dateStr, mode: 'pick', addMode: false })
  }

  function handleDayAdd(dateStr) {
    setDayModal({ date: dateStr, mode: 'pick', addMode: true })
  }

  function handleDaySelectItem(dateStr, itemId) {
    const item = userWorkouts[dateStr]?.find(w => w.id === itemId)
    if (item?.type === 'bike') {
      setDayModal({ date: dateStr, mode: 'edit_bike', addMode: false, selectedItemId: itemId })
    } else {
      setDayModal({ date: dateStr, mode: 'pick', addMode: false, selectedItemId: itemId })
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden rounded-2xl"
      style={{ backgroundColor: '#FFFFFF', border: 'var(--border)', boxShadow: '0 1px 6px rgba(15,31,28,0.07)' }}>

      {/* ── FROZEN: everything above the day grid ── */}
      <div className="shrink-0">

        {/* Yesterday → Today recommendation */}
        <div className="px-4 py-2.5" style={{ borderBottom: 'var(--border)' }}>
          <TodayRecommendation
            readinessScore={readinessScore}
            activityByDate={activityByDate}
            userWorkouts={userWorkouts}
            athleteFtp={athleteFtp}
            seasonData={seasonData}
            scheduleBlocks={scheduleBlocks}
          />
        </div>

        {/* Month nav — centered */}
        <div className="flex items-center justify-center gap-2 py-1.5" style={{ borderBottom: 'var(--border)' }}>
          <button onClick={() => jumpMonth(-1)}
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)' }}>‹</button>
          <p className="font-semibold text-sm w-28 text-center">{MONTH_NAMES[displayMonth]} {displayYear}</p>
          <button onClick={() => jumpMonth(1)}
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)' }}>›</button>
        </div>

        {/* Day-of-week headers */}
        <div className="flex items-stretch" style={{ borderBottom: '1px solid rgba(15,31,28,0.20)' }}>
          <div className="grid flex-1" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-xs font-semibold uppercase tracking-wide py-2"
                style={{ color: 'var(--color-text-muted)', borderRight: '1px solid rgba(15,31,28,0.20)' }}>{d}</div>
            ))}
          </div>
          <div className="text-center text-xs font-semibold uppercase tracking-wide py-2 flex items-center justify-center"
            style={{ width: 112, color: 'var(--color-text-muted)', backgroundColor: 'rgba(15,31,28,0.09)' }}>
            Total
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE: month grids ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <MonthView
          dividerRefs={dividerRefs}
          todayRowRef={todayRowRef}
          allEvents={allEvents}
          seasonData={seasonData}
          onDaySelect={handleDaySelect}
          onDayAdd={handleDayAdd}
          onDaySelectItem={handleDaySelectItem}
          onRemoveItem={handleRemoveWorkout}
          onCopyItem={item => setCopiedItem(item)}
          onSkipSession={dateStr => handleUpdateSession(dateStr, { skipped: true })}
          onPasteToDay={dateStr => { if (copiedItem) { const { id, ...rest } = copiedItem; handleSaveWorkout(dateStr, rest); setCopiedItem(null) } }}
          copiedItem={copiedItem}
          getDaySummary={getDaySummary}
          userWorkouts={userWorkouts}
          sessionOverrides={sessionOverrides}
          scheduleBlocks={scheduleBlocks}
          onActivitySelect={onActivitySelect}
        />
      </div>

      {/* ── Day add modal ── */}
      {dayModal && (
        <DayAddModal
          date={dayModal.date}
          mode={dayModal.mode}
          onSetMode={mode => setDayModal({ ...dayModal, mode })}
          onSave={w => { handleSaveWorkout(dayModal.date, w); setDayModal(null) }}
          onClose={() => setDayModal(null)}
          athleteFtp={athleteFtp}
          dayWorkouts={userWorkouts[dayModal.date] ?? []}
          onRemoveWorkout={id => handleRemoveWorkout(dayModal.date, id)}
          onUpdateWorkout={w => handleUpdateWorkout(dayModal.date, w)}
          plannedSession={TRAINING_PLAN[dayModal.date] ?? null}
          sessionOverride={sessionOverrides[dayModal.date] ?? null}
          onUpdateSession={updates => handleUpdateSession(dayModal.date, updates)}
          addMode={dayModal.addMode ?? true}
          selectedItemId={dayModal.selectedItemId ?? null}
          copiedItem={copiedItem}
          onCopyItem={item => setCopiedItem(item)}
          onPasteItem={() => { if (copiedItem) { const { id, ...rest } = copiedItem; handleSaveWorkout(dayModal.date, rest) } }}
          seasonRaces={seasonData?.races ?? []}
        />
      )}

      {showModal && (
        <LifeEventModal
          onClose={() => setShowModal(false)}
          onConfirm={evt => { setPendingEvents(prev => [...prev, evt]); setShowModal(false) }}
        />
      )}
    </div>
  )
}

// ─── Week view ────────────────────────────────────────────────────────────────

const WEEK_DAYS = [
  { label: 'Mon', date: '2026-06-01' },
  { label: 'Tue', date: '2026-06-02' },
  { label: 'Wed', date: '2026-06-03' },
  { label: 'Thu', date: '2026-06-04' },
  { label: 'Fri', date: '2026-06-05' },
  { label: 'Sat', date: '2026-06-06' },
  { label: 'Sun', date: '2026-06-07' },
]

function WeekView({ allEvents, selectedDate, onDaySelect, buildingDate, onBuild, getDaySummary }) {
  const maxTSS = Math.max(...WEEK_DAYS.map(d => {
    const act = getDaySummary(d.date)
    return Math.max(TRAINING_PLAN[d.date]?.tss ?? 0, act?.totalTSS ?? 0)
  }))
  const totalTSS = WEEK_DAYS.reduce((s, d) => {
    const act = getDaySummary(d.date)
    return s + (act?.totalTSS ?? TRAINING_PLAN[d.date]?.tss ?? 0)
  }, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="font-medium text-sm">May 26 – Jun 1, 2026</p>
        <div className="flex items-center gap-3">
          <span className="data-value text-sm font-semibold">
            {totalTSS} <span className="font-normal text-xs" style={{ color: 'var(--color-text-muted)' }}>TSS</span>
          </span>
          <button className="btn-primary text-xs px-3 py-1.5">+ Log Workout</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {WEEK_DAYS.map(({ label, date }) => {
          const session    = TRAINING_PLAN[date]
          const actDay     = getDaySummary(date)

          // Actual wins over planned for display
          const displayTSS       = actDay?.totalTSS ?? session?.tss
          const displayDuration  = actDay?.totalDuration ?? session?.duration
          const displayType      = actDay ? actDay.primary.sport : session?.type
          const displayIntensity = actDay ? actDay.primary.intensity : session?.intensity

          const hasActivity = !!session?.type || !!actDay
          const colors      = hasActivity && displayIntensity ? INTENSITY_COLOR[displayIntensity] : null
          const isActive    = selectedDate === date
          const dayEvents   = allEvents.filter(e => e.date === date)

          const isToday   = date === TODAY
          const selBg     = hasActivity ? colors.bg.replace(/[\d.]+\)$/, '0.22)') : 'rgba(15,31,28,0.10)'
          const selBorder = hasActivity ? colors.bar : 'rgba(15,31,28,0.35)'

          return (
            <button
              key={date}
              onClick={() => onDaySelect(date)}
              className="flex flex-col rounded-xl p-3 text-left transition-all"
              style={{
                backgroundColor: '#FFFFFF',
                border: isToday ? '1.5px solid #FF2D78' : '1px solid #0A1628',
              }}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                {actDay && (
                  <span className="text-[9px] font-bold leading-none" style={{ color: '#00A87E' }}>✓</span>
                )}
              </div>
              {hasActivity ? (
                <>
                  <span className="text-xs font-semibold data-value" style={{ color: 'var(--color-text)' }}>
                    {displayTSS}<span className="font-normal text-[10px] ml-0.5" style={{ opacity: 0.6 }}>TSS</span>
                  </span>
                  <span className="text-[11px] mt-0.5 font-medium truncate w-full" style={{ color: 'var(--color-text-muted)' }}>
                    {displayType}
                  </span>
                  <span className="text-[11px] data-value" style={{ color: 'var(--color-text-muted)' }}>
                    {displayDuration}
                  </span>
                </>
              ) : (
                <span className="text-[11px]" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}>Rest</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Months range (static, centered on today June 2026) ─────────────────────

const MONTHS_RANGE = (() => {
  const result = []
  for (let offset = -3; offset <= 14; offset++) {
    let y = 2026, m = 5 + offset
    while (m > 11) { m -= 12; y++ }
    while (m < 0)  { m += 12; y-- }
    result.push({ year: y, month: m, key: `${y}-${m}` })
  }
  return result
})()

// ─── Month view (continuous scroll) ──────────────────────────────────────────

// MonthView renders only the scrollable grid content — nav/headers live in WeeklyCalendar
function MonthView({ dividerRefs, todayRowRef, allEvents, seasonData, onDaySelect, onDayAdd, onDaySelectItem, onRemoveItem, onCopyItem, onSkipSession, onPasteToDay, getDaySummary, userWorkouts, sessionOverrides, copiedItem, scheduleBlocks = [], onActivitySelect }) {
  const today = TODAY
  const races = seasonData?.races ?? []
  const [contextMenu, setContextMenu] = useState(null)

  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [contextMenu])

  // Generate all complete Mon–Sun weeks covering the full MONTHS_RANGE
  const allWeeks = (() => {
    const first = MONTHS_RANGE[0]
    const last  = MONTHS_RANGE[MONTHS_RANGE.length - 1]
    const start = new Date(first.year, first.month, 1)
    // rewind to the Monday of that week
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
    const end = new Date(last.year, last.month + 1, 0) // last day of last month
    const weeks = []
    const cur = new Date(start)
    while (cur <= end) {
      const week = []
      for (let i = 0; i < 7; i++) { week.push(new Date(cur)); cur.setDate(cur.getDate() + 1) }
      weeks.push(week)
    }
    return weeks
  })()

  return (
    <div>
        {allWeeks.map((weekDays, wi) => {
          // Month labels: insert above any week that contains a 1st-of-month
          const monthStarts = weekDays.filter(d => d.getDate() === 1)

          const userBikeMins = weekDays.reduce((s, d) => {
            const wos = userWorkouts[isoDate(d)] ?? []
            return s + wos.filter(w => w.type === 'bike').reduce((t, w) => t + (w.totalMin ?? 0), 0)
          }, 0)
          const userWorkoutTSS = weekDays.reduce((s, d) => {
            const wos = userWorkouts[isoDate(d)] ?? []
            return s + wos.reduce((t, w) => t + (w.tss ?? 0), 0)
          }, 0)
          const planTSS  = weekDays.reduce((s, d) => { const ses = TRAINING_PLAN[isoDate(d)]; return s + (ses?.tss ?? 0) }, 0) + userWorkoutTSS
          const planSecs = userBikeMins > 0 ? userBikeMins * 60 : weekDays.reduce((s, d) => { const ses = TRAINING_PLAN[isoDate(d)]; return s + (ses ? parsePlanSecs(ses.duration) : 0) }, 0)
          const actTSS   = weekDays.reduce((s, d) => { const a = getDaySummary(isoDate(d)); return s + (a?.totalTSS ?? 0) }, 0)
          const stravaActSecs = weekDays.reduce((s, d) => { const a = getDaySummary(isoDate(d)); return s + (a ? parsePlanSecs(a.totalDuration) : 0) }, 0)
          const actSecs  = stravaActSecs > 0 ? stravaActSecs : userBikeMins * 60
          const actMiles = weekDays.reduce((s, d) => { const a = getDaySummary(isoDate(d)); return s + parseFloat(a?.totalDist ?? 0) }, 0)

          const isThisWeek = weekDays.some(d => isoDate(d) === today)
          // Primary month = month of Wednesday (middle of week)
          const primaryMonth = weekDays[2].getMonth()
          const primaryYear  = weekDays[2].getFullYear()

          return (
            <div key={wi}>
              {/* Invisible sentinels for IntersectionObserver — keeps ‹ Month Year › header in sync */}
              {monthStarts.map(d => {
                const my = d.getFullYear(), mm = d.getMonth(), key = `${my}-${mm}`
                return <div key={key} ref={el => { dividerRefs.current[key] = el }} data-month-key={key} style={{ height: 0 }} />
              })}
              <div ref={isThisWeek ? todayRowRef : null} className="flex"
                style={{ borderBottom: '1px solid rgba(15,31,28,0.20)', borderTop: wi === 0 ? '1px solid rgba(15,31,28,0.20)' : 'none' }}>
                <div className="grid flex-1" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
                {weekDays.map((date, i) => {
                  const dateStr = isoDate(date)
                  const session = TRAINING_PLAN[dateStr]
                  const actDay  = getDaySummary(dateStr)
                  const isToday = dateStr === today
                  const race    = races.find(r => r.date === dateStr && !r.id)
                  const displayIntensity = actDay ? actDay.primary.intensity : session?.intensity
                  const dotColor = displayIntensity ? INTENSITY_COLOR[displayIntensity].bar : null
                  const isSecondaryMonth = date.getMonth() !== primaryMonth || date.getFullYear() !== primaryYear
                  return (
                          <button
                            key={dateStr}
                            onClick={() => copiedItem ? onPasteToDay(dateStr) : onDaySelect(dateStr)}
                            className="relative flex flex-col text-left transition-colors group"
                            style={{
                              backgroundColor: copiedItem ? 'rgba(0,200,150,0.05)' : isToday ? 'rgba(255,45,120,0.04)' : isSecondaryMonth ? 'rgba(15,31,28,0.025)' : '#FFFFFF',
                              borderRight: '1px solid rgba(15,31,28,0.20)',
                              padding: '10px 10px 26px 10px',
                              minHeight: '140px',
                              cursor: copiedItem ? 'copy' : 'pointer',
                              overflow: 'hidden',
                            }}
                          >
                            {/* Date + tick */}
                            <div className="flex items-center justify-between w-full mb-1.5">
                              <span className={`data-value text-sm font-bold${isToday ? ' w-6 h-6 rounded-full flex items-center justify-center text-white text-xs' : ''}`}
                                style={{ backgroundColor: isToday ? '#FF2D78' : 'transparent', color: isToday ? '#FFFFFF' : 'var(--color-text-muted)' }}>
                                {date.getDate()}
                              </span>
                              {actDay && !race && (
                                <span className="text-[10px] font-bold" style={{ color: '#00A87E' }}>✓</span>
                              )}
                            </div>

                            {/* Race — its own mini-box */}
                            {race && (
                              <div className="rounded-lg px-2 py-1.5 mb-1" style={{ backgroundColor: 'rgba(255,45,120,0.06)', border: '0.5px solid rgba(255,45,120,0.2)' }}>
                                <p className="text-xs font-semibold truncate" style={{ color: race.priority === 'A race' ? '#CC1A5C' : '#0A1628' }}>🏁 {race.name}</p>
                              </div>
                            )}

                            {/* Completed activity — mini-box */}
                            {actDay && !race && (
                              <div
                                className="rounded-lg px-2 py-1.5 flex-1 flex flex-col justify-between cursor-pointer"
                                style={{ backgroundColor: 'rgba(0,168,126,0.06)', border: '0.5px solid rgba(0,168,126,0.2)' }}
                                onClick={e => { e.stopPropagation(); onActivitySelect?.(actDay) }}
                              >
                                <p className="text-xs font-semibold leading-tight flex items-center gap-1" style={{ color: 'var(--color-text)' }}>
                                  <SportIcon sport={actDay.primary.sport} size={12} color="#1A2421" />
                                  {actDay.primary.sport}
                                </p>
                                {actDay.totalDuration && (
                                  <p className="data-value text-sm font-bold leading-none mt-1" style={{ color: 'var(--color-text)' }}>{actDay.totalDuration}</p>
                                )}
                                <div className="flex items-center gap-1 mt-1 flex-wrap">
                                  {actDay.totalDist > 0 && (
                                    <span className="data-value text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{parseFloat(actDay.totalDist).toFixed(1)} mi</span>
                                  )}
                                  <span className="data-value text-[10px] font-semibold" style={{ color: '#00A87E' }}>{actDay.totalTSS} TSS</span>
                                </div>
                              </div>
                            )}

                            {/* Planned — compact 1-line so user items fit below */}
                            {!actDay && session && !race && !sessionOverrides?.[dateStr]?.skipped && (
                              <div className="rounded-lg px-2 py-1.5 flex items-center justify-between gap-1 cursor-pointer" style={{ backgroundColor: 'rgba(15,31,28,0.03)', border: '0.5px solid rgba(15,31,28,0.12)' }}
                                onClick={e => { e.stopPropagation(); onDaySelect(dateStr) }}
                                onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setContextMenu({ dateStr, itemId: '__planned__', label: session.type, x: e.clientX, y: e.clientY }) }}>
                                <p className="text-xs font-semibold leading-none truncate" style={{ color: 'var(--color-text)' }}>{session.type}</p>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="data-value text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{session.duration}</span>
                                  {session?.adjusted && <span className="text-[9px]" style={{ color: '#B87000' }}>⚡</span>}
                                </div>
                              </div>
                            )}

                            {/* Today's schedule blocks (work/family/etc from Overview) */}
                            {isToday && scheduleBlocks.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-1">
                                {scheduleBlocks.map(blk => {
                                  const blkColor = { work: '#1B6FD8', family: '#E86D2E', school: '#A78BFA', social: '#F5A623', commitment: '#94A3B8' }[blk.type] ?? '#637068'
                                  return (
                                    <span key={blk.id} className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                                      style={{ backgroundColor: `${blkColor}14`, color: blkColor }}>
                                      {blk.label || blk.type}
                                    </span>
                                  )
                                })}
                              </div>
                            )}

                            {/* User-added items — each in its own mini-box */}
                            {(userWorkouts[dateStr] ?? []).map((w, wi2) => {
                              const color  = ITEM_TYPE_COLOR[w.type] ?? '#00C896'
                              const bg     = w.type === 'gym'   ? 'rgba(167,139,250,0.08)'
                                           : w.type === 'event' ? 'rgba(255,45,120,0.06)'
                                           : w.type === 'plan'  ? 'rgba(245,158,11,0.08)'
                                           : 'rgba(0,200,150,0.06)'
                              const border = w.type === 'gym'   ? 'rgba(167,139,250,0.25)'
                                           : w.type === 'event' ? 'rgba(255,45,120,0.2)'
                                           : w.type === 'plan'  ? 'rgba(245,158,11,0.3)'
                                           : 'rgba(0,200,150,0.2)'
                              const label = w.name || (w.type === 'gym' ? 'Gym' : w.type === 'event' ? 'Event' : w.type === 'plan' ? 'Life Event' : 'Ride')
                              return (
                                <div key={wi2} className="rounded-lg px-2 py-1.5 mt-1 cursor-pointer"
                                  style={{ backgroundColor: bg, border: `0.5px solid ${border}` }}
                                  onClick={e => { e.stopPropagation(); onDaySelectItem(dateStr, w.id) }}
                                  onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setContextMenu({ dateStr, itemId: w.id, item: w, label, x: e.clientX, y: e.clientY }) }}>
                                  <div className="flex items-center gap-1.5">
                                    <SportIcon type={w.type} size={12} color={color} />
                                    <span className="text-xs font-medium truncate" style={{ color }}>{label}</span>
                                  </div>
                                  {w.tss > 0 && (
                                    <p className="data-value text-[10px] font-semibold mt-0.5" style={{ color }}>~{w.tss} TSS</p>
                                  )}
                                </div>
                              )
                            })}

                            {/* Hover + add button */}
                            <div
                              className="absolute bottom-1.5 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={e => { e.stopPropagation(); onDayAdd(dateStr) }}
                              title="Add to this day"
                            >
                              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold leading-none"
                                style={{ backgroundColor: '#0F1F1C', color: '#ffffff' }}>
                                +
                              </span>
                            </div>
                          </button>
                        )
                      })}
                      </div>

                      {/* Week total */}
                      <div className="flex flex-col justify-center gap-3" style={{ width: 112, paddingLeft: 12, backgroundColor: 'rgba(15,31,28,0.09)' }}>
                        {(planTSS > 0 || actTSS > 0 || userBikeMins > 0) && (
                          <>
                            <div>
                              <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>Plan</p>
                              {planSecs > 0 ? (
                                <>
                                  {planTSS > 0 && (
                                    <div className="flex items-baseline gap-0.5">
                                      <span className="data-value text-sm font-bold" style={{ color: 'var(--color-text)' }}>{planTSS}</span>
                                      <span className="text-[10px] uppercase" style={{ color: 'var(--color-text-muted)' }}>TSS</span>
                                    </div>
                                  )}
                                  <div className="flex items-baseline gap-0.5">
                                    <span className="data-value text-sm font-bold" style={{ color: 'var(--color-text)' }}>{(planSecs / 3600).toFixed(1)}</span>
                                    <span className="text-[10px] uppercase" style={{ color: 'var(--color-text-muted)' }}>h</span>
                                  </div>
                                  <div className="flex items-baseline gap-0.5">
                                    <span className="data-value text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>—</span>
                                    <span className="text-[10px] uppercase" style={{ color: 'var(--color-text-muted)' }}>mi</span>
                                  </div>
                                </>
                              ) : (
                                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>—</span>
                              )}
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: '#00A87E', letterSpacing: '0.06em' }}>Actual</p>
                              {actSecs > 0 ? (
                                <>
                                  {actTSS > 0 && (
                                    <div className="flex items-baseline gap-0.5">
                                      <span className="data-value text-sm font-bold" style={{ color: '#00A87E' }}>{actTSS}</span>
                                      <span className="text-[10px] uppercase" style={{ color: 'rgba(0,168,126,0.6)' }}>TSS</span>
                                    </div>
                                  )}
                                  <div className="flex items-baseline gap-0.5">
                                    <span className="data-value text-sm font-bold" style={{ color: '#00A87E' }}>{(actSecs / 3600).toFixed(1)}</span>
                                    <span className="text-[10px] uppercase" style={{ color: 'rgba(0,168,126,0.6)' }}>h</span>
                                  </div>
                                  <div className="flex items-baseline gap-0.5">
                                    {actMiles > 0 ? (
                                      <span className="data-value text-sm font-bold" style={{ color: '#00A87E' }}>{actMiles.toFixed(0)}</span>
                                    ) : (
                                      <span className="data-value text-sm font-bold" style={{ color: 'rgba(0,168,126,0.4)' }}>—</span>
                                    )}
                                    <span className="text-[10px] uppercase" style={{ color: 'rgba(0,168,126,0.6)' }}>mi</span>
                                  </div>
                                </>
                              ) : (
                                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>—</span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
              </div>
            )
          })}

      {/* Right-click context menu */}
      {contextMenu && (
        <div
          className="fixed z-[200] rounded-xl overflow-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x, backgroundColor: '#FFFFFF', boxShadow: '0 4px 20px rgba(15,31,28,0.18)', border: 'var(--border)', minWidth: 160 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="px-3 py-2" style={{ borderBottom: 'var(--border)' }}>
            <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: 'var(--color-text-muted)' }}>{contextMenu.label}</p>
          </div>
          {contextMenu.itemId !== '__planned__' && (
            <button
              className="w-full text-left px-3 py-2.5 text-xs font-medium flex items-center gap-2"
              style={{ color: 'var(--color-text)' }}
              onClick={() => { onCopyItem(contextMenu.item); setContextMenu(null) }}
            >
              ⎘ Copy to another day
            </button>
          )}
          <button
            className="w-full text-left px-3 py-2.5 text-xs font-medium flex items-center gap-2"
            style={{ color: '#e05252', borderTop: contextMenu.itemId !== '__planned__' ? 'var(--border)' : 'none' }}
            onClick={() => {
              if (contextMenu.itemId === '__planned__') {
                onSkipSession(contextMenu.dateStr)
              } else {
                onRemoveItem(contextMenu.dateStr, contextMenu.itemId)
              }
              setContextMenu(null)
            }}
          >
            ✕ Delete
          </button>
        </div>
      )}
    </div>
  )
}


// ─── Day Add Modal ────────────────────────────────────────────────────────────

const ITEM_TYPE_COLOR = { bike: '#00C896', gym: '#A78BFA', event: '#FF2D78', plan: '#F59E0B' }
const ITEM_TYPE_ICON  = { bike: '🚴', gym: '🏋️', event: '🏁', plan: '📅' }

function DayAddModal({ date, mode, onSetMode, onSave, onClose, athleteFtp, dayWorkouts = [], onRemoveWorkout, onUpdateWorkout, plannedSession = null, sessionOverride = null, onUpdateSession, addMode = true, selectedItemId = null, copiedItem = null, onCopyItem, onPasteItem, seasonRaces = [] }) {
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState(null)
  const [editBikeItem, setEditBikeItem] = useState(null)
  const [editGymItem, setEditGymItem] = useState(null)
  const [modalContextMenu, setModalContextMenu] = useState(null)

  useEffect(() => {
    if (!modalContextMenu) return
    const close = () => setModalContextMenu(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [modalContextMenu])

  // Merge base plan with any user overrides
  const effectiveSession = plannedSession ? { ...plannedSession, ...(sessionOverride ?? {}) } : null

  function startEdit(w) { setEditingId(w.id); setEditDraft({ ...w }) }
  function cancelEdit() { setEditingId(null); setEditDraft(null) }
  function saveEdit() { onUpdateWorkout(editDraft); setEditingId(null); setEditDraft(null) }

  const d = new Date(date + 'T00:00:00')
  const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const isBike = mode === 'bike' || mode === 'edit_plan' || mode === 'edit_bike'
  const isGym  = mode === 'gym' || mode === 'edit_gym'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ backgroundColor: 'rgba(15,31,28,0.45)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full rounded-t-2xl sm:rounded-2xl"
        style={{
          backgroundColor: '#FFFFFF',
          boxShadow: '0 20px 60px rgba(15,31,28,0.25)',
          maxWidth: isBike ? 680 : isGym ? 480 : 400,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            {mode !== 'pick' && (
              <button onClick={() => onSetMode('pick')}
                className="text-xs flex items-center gap-1 pr-3"
                style={{ color: 'var(--color-text-muted)', borderRight: 'var(--border)' }}>
                ← Back
              </button>
            )}
            <p className="font-semibold text-sm">{label}</p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
            style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)' }}>✕</button>
        </div>

        {/* Pick mode — existing items + three add options */}
        {mode === 'pick' && (
          <div className="p-5">

            {/* Existing user-added items for this day */}
            {dayWorkouts.length > 0 && !addMode && (
              <div className="mb-5">
                {!selectedItemId && <p className="section-title mb-3">On this day</p>}
                <div className="space-y-2">
                  {dayWorkouts.filter(w => !selectedItemId || w.id === selectedItemId).map(w => {
                    const color = ITEM_TYPE_COLOR[w.type] ?? '#637068'
                    const displayName = w.name || (w.type === 'bike' ? 'Bike Workout' : w.type === 'gym' ? 'Gym / Strength' : 'Event')
                    const isEditing = editingId === w.id
                    return (
                      <div key={w.id} className="rounded-xl overflow-hidden"
                        style={{ border: isEditing ? `1.5px solid ${color}` : 'var(--border)', backgroundColor: 'rgba(15,31,28,0.02)' }}
                        onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setModalContextMenu({ itemId: w.id, x: e.clientX, y: e.clientY }) }}>

                        {/* Header row — always visible */}
                        <div className="flex items-center gap-3 px-3 py-2.5">
                          <span className="text-sm">{ITEM_TYPE_ICON[w.type] ?? '📌'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{displayName}</p>
                            {w.type === 'gym' && !isEditing && (
                              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                                {w.duration ? `${w.duration} min` : ''}
                                {w.blocks?.length > 0 && ` · ${w.blocks.length} block${w.blocks.length !== 1 ? 's' : ''}`}
                              </p>
                            )}
                            {w.type === 'event' && w.eventType && !isEditing && <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{w.eventType} · {w.priority}</p>}
                            {w.type === 'plan' && !isEditing && <p className="text-[10px]" style={{ color: '#B45309' }}>Appears in today's schedule</p>}
                          </div>
                          {!isEditing && (
                            <div className="flex items-center gap-2">
                              <button className="text-[10px] font-medium px-2 py-1 rounded-lg"
                                style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)' }}
                                onClick={() => {
                                  if (w.type === 'bike') { setEditBikeItem(w); onSetMode('edit_bike') }
                                  else if (w.type === 'gym') { setEditGymItem(w); onSetMode('edit_gym') }
                                  else startEdit(w)
                                }}>Edit</button>
                              <button className="text-[10px] font-medium px-2 py-1 rounded-lg"
                                style={{ backgroundColor: 'rgba(224,82,82,0.08)', color: '#e05252' }}
                                onClick={() => onRemoveWorkout(w.id)}>Delete</button>
                            </div>
                          )}
                        </div>

                        {/* Expanded detail view — shown when this specific item is selected */}
                        {selectedItemId && !isEditing && (w.notes || w.location || w.type === 'bike') && (
                          <div className="px-3 pb-3" style={{ borderTop: '0.5px solid rgba(15,31,28,0.08)' }}>
                            {w.type === 'gym' && (
                              w.blocks?.length > 0 ? (
                                <div className="mt-2 space-y-2.5">
                                  {w.blocks.map((block, bi) => (
                                    block.type === 'single' ? (
                                      <div key={block.id}>
                                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: GYM_ACCENT }}>{block.exercise?.name || 'Exercise'}</p>
                                        {(block.exercise?.sets ?? []).map((s, si) => (
                                          <p key={s.id} className="data-value text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                                            Set {si + 1}: {s.reps} reps{s.weight ? ` × ${s.weight} lbs` : ''}
                                          </p>
                                        ))}
                                      </div>
                                    ) : (
                                      <div key={block.id}>
                                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: GYM_ACCENT }}>
                                          Superset {bi + 1}
                                        </p>
                                        {(block.exercises ?? []).map((ex, ei) => (
                                          <div key={ex.id} className={ei > 0 ? 'mt-1.5' : ''}>
                                            <p className="text-[10px] font-semibold" style={{ color: 'var(--color-text)' }}>{ex.name || 'Exercise'}</p>
                                            {(ex.sets ?? []).map((s, si) => (
                                              <p key={s.id} className="data-value text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                                                Set {si + 1}: {s.reps} reps{s.weight ? ` × ${s.weight} lbs` : ''}
                                              </p>
                                            ))}
                                          </div>
                                        ))}
                                      </div>
                                    )
                                  ))}
                                </div>
                              ) : w.notes ? (
                                <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{w.notes}</p>
                              ) : null
                            )}
                            {w.type === 'event' && (
                              <div className="mt-2 space-y-1">
                                {w.location && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>📍 {w.location}</p>}
                              </div>
                            )}
                            {w.type === 'bike' && (
                              <p className="text-[10px] mt-2" style={{ color: 'var(--color-text-muted)' }}>Tap Edit to open the full workout builder.</p>
                            )}
                          </div>
                        )}

                        {/* Edit form */}
                        {isEditing && editDraft && (
                          <div className="px-3 pb-3" style={{ borderTop: `0.5px solid ${color}33` }}>
                            {w.type === 'bike' && (
                              <div className="space-y-2 pt-2">
                                <div>
                                  <label className="text-[10px] uppercase tracking-wide mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Name</label>
                                  <input className="w-full text-xs rounded-lg px-2.5 py-1.5 outline-none" style={{ border: 'var(--border)', backgroundColor: '#FFFFFF' }}
                                    value={editDraft.name || ''} onChange={e => setEditDraft({ ...editDraft, name: e.target.value })} />
                                </div>
                                <div>
                                  <label className="text-[10px] uppercase tracking-wide mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Notes</label>
                                  <textarea className="w-full text-xs rounded-lg px-2.5 py-1.5 outline-none resize-none" rows={2} style={{ border: 'var(--border)', backgroundColor: '#FFFFFF' }}
                                    value={editDraft.notes || ''} onChange={e => setEditDraft({ ...editDraft, notes: e.target.value })} />
                                </div>
                              </div>
                            )}
                            {w.type === 'gym' && (
                              <div className="pt-2">
                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                  Use the Edit button above to open the full workout builder.
                                </p>
                              </div>
                            )}
                            {w.type === 'plan' && (
                              <div className="space-y-2 pt-2">
                                <div>
                                  <label className="text-[10px] uppercase tracking-wide mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Name</label>
                                  <input className="w-full text-xs rounded-lg px-2.5 py-1.5 outline-none" style={{ border: 'var(--border)', backgroundColor: '#FFFFFF' }}
                                    value={editDraft.name || ''} onChange={e => setEditDraft({ ...editDraft, name: e.target.value })} />
                                </div>
                              </div>
                            )}
                            {w.type === 'event' && (
                              <div className="space-y-2 pt-2">
                                <div>
                                  <label className="text-[10px] uppercase tracking-wide mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Name</label>
                                  <input className="w-full text-xs rounded-lg px-2.5 py-1.5 outline-none" style={{ border: 'var(--border)', backgroundColor: '#FFFFFF' }}
                                    value={editDraft.name || ''} onChange={e => setEditDraft({ ...editDraft, name: e.target.value })} />
                                </div>
                                <div>
                                  <label className="text-[10px] uppercase tracking-wide mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Location</label>
                                  <input className="w-full text-xs rounded-lg px-2.5 py-1.5 outline-none" style={{ border: 'var(--border)', backgroundColor: '#FFFFFF' }}
                                    value={editDraft.location || ''} onChange={e => setEditDraft({ ...editDraft, location: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] uppercase tracking-wide mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Type</label>
                                    <select className="w-full text-xs rounded-lg px-2 py-1.5 outline-none" style={{ border: 'var(--border)', backgroundColor: '#FFFFFF' }}
                                      value={editDraft.eventType || ''} onChange={e => setEditDraft({ ...editDraft, eventType: e.target.value })}>
                                      {['Road Race','Gran Fondo','Time Trial','Criterium','Cyclocross','Gravel','Triathlon','Other'].map(t => <option key={t}>{t}</option>)}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[10px] uppercase tracking-wide mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Priority</label>
                                    <select className="w-full text-xs rounded-lg px-2 py-1.5 outline-none" style={{ border: 'var(--border)', backgroundColor: '#FFFFFF' }}
                                      value={editDraft.priority || ''} onChange={e => setEditDraft({ ...editDraft, priority: e.target.value })}>
                                      {['A Race','B Race','C Race','Training'].map(p => <option key={p}>{p}</option>)}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="flex gap-2 mt-3">
                              <button className="flex-1 text-xs font-semibold py-1.5 rounded-lg"
                                style={{ backgroundColor: 'var(--color-accent)', color: '#0F1F1C' }}
                                onClick={saveEdit}>Save</button>
                              <button className="flex-1 text-xs font-medium py-1.5 rounded-lg"
                                style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)' }}
                                onClick={cancelEdit}>Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Planned session view — shown when opening a day with a plan (and not skipped) */}
            {!addMode && effectiveSession && !effectiveSession.skipped && (
              <div className={dayWorkouts.length > 0 ? 'mt-4' : ''}>
                {dayWorkouts.length > 0 && <p className="section-title mb-3">Planned</p>}
                <div className="rounded-xl overflow-hidden" style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.02)' }}>
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <span className="text-sm">📋</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{effectiveSession.type}</p>
                      <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        {effectiveSession.duration}{effectiveSession.tss ? ` · ${effectiveSession.tss} TSS` : ''}
                        {effectiveSession.adjusted && <span style={{ color: '#B87000' }}> ⚡ Adjusted</span>}
                      </p>
                    </div>
                    <button className="text-[10px] font-medium px-2 py-1 rounded-lg"
                      style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)' }}
                      onClick={() => onSetMode('edit_plan')}>Edit</button>
                  </div>
                </div>
              </div>
            )}

            {addMode && (
              <>
                <p className="section-title mb-3">What would you like to add?</p>
                <div className="space-y-2.5">
                  <button onClick={() => onSetMode('bike')}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left"
                    style={{ border: '1px solid #0A1628', backgroundColor: '#FFFFFF' }}>
                    <span className="text-base">🚴</span>
                    <div>
                      <p className="font-semibold text-sm">Bike Workout</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Opens the workout builder</p>
                    </div>
                  </button>
                  <button onClick={() => onSetMode('gym')}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left"
                    style={{ border: '1px solid #0A1628', backgroundColor: '#FFFFFF' }}>
                    <span className="text-base">🏋️</span>
                    <div>
                      <p className="font-semibold text-sm">Gym / Strength</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Log a strength session</p>
                    </div>
                  </button>
                  <button onClick={() => onSetMode('event')}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left"
                    style={{ border: '1px solid #0A1628', backgroundColor: '#FFFFFF' }}>
                    <span className="text-base">🏁</span>
                    <div>
                      <p className="font-semibold text-sm">New Event</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Add a race or event</p>
                    </div>
                  </button>
                  <button onClick={() => onSetMode('plan')}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left"
                    style={{ border: '1px solid #0A1628', backgroundColor: '#FFFFFF' }}>
                    <span className="text-base">📅</span>
                    <div>
                      <p className="font-semibold text-sm">Life Event</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Travel, vacation, schedule block</p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Bike: WorkoutBuilder inside modal — parent onSave handles close */}
        {mode === 'bike' && (
          <div className="p-4">
            <WorkoutBuilder
              dateStr={date}
              existing={null}
              ftp={athleteFtp}
              onClose={() => onSetMode('pick')}
              onSave={w => onSave({ ...w, type: 'bike', name: w.name || 'Bike Workout' })}
            />
          </div>
        )}

        {/* Edit planned session via WorkoutBuilder */}
        {mode === 'edit_plan' && effectiveSession && (
          <div className="p-4">
            <WorkoutBuilder
              dateStr={date}
              existing={effectiveSession}
              ftp={athleteFtp}
              onClose={() => onSetMode('pick')}
              onSave={w => { onUpdateSession({ type: w.name || effectiveSession.type }); onSetMode('pick') }}
            />
          </div>
        )}

        {/* Edit user-added bike workout — derive item from selectedItemId so clicking the tile mini-box opens WorkoutBuilder directly */}
        {mode === 'edit_bike' && (() => {
          const bikeItem = editBikeItem ?? dayWorkouts.find(w => w.id === selectedItemId)
          if (!bikeItem) return null
          return (
            <div className="p-4">
              <WorkoutBuilder
                dateStr={date}
                existing={bikeItem}
                ftp={athleteFtp}
                onClose={() => { setEditBikeItem(null); onClose() }}
                onSave={w => { onUpdateWorkout({ ...bikeItem, ...w, id: bikeItem.id, type: 'bike', name: w.name || bikeItem.name }); setEditBikeItem(null); onClose() }}
              />
            </div>
          )
        })()}

        {/* Gym form — add new */}
        {mode === 'gym' && (
          <div className="p-5">
            <GymForm onSave={onSave} onCancel={() => onSetMode('pick')} />
          </div>
        )}

        {/* Gym form — edit existing */}
        {mode === 'edit_gym' && (() => {
          const gymItem = editGymItem ?? dayWorkouts.find(w => w.id === selectedItemId)
          if (!gymItem) return null
          return (
            <div className="p-5">
              <GymForm
                initial={gymItem}
                onSave={updated => {
                  onUpdateWorkout({ ...gymItem, ...updated, id: gymItem.id })
                  setEditGymItem(null)
                  onClose()
                }}
                onCancel={() => { setEditGymItem(null); onSetMode('pick') }}
              />
            </div>
          )
        })()}

        {/* Event form */}
        {mode === 'event' && (
          <div className="p-5">
            <EventForm onSave={onSave} onCancel={() => onSetMode('pick')} seasonRaces={seasonRaces} />
          </div>
        )}

        {mode === 'plan' && (
          <div className="p-5">
            <PlanForm onSave={onSave} onCancel={() => onSetMode('pick')} />
          </div>
        )}
      </div>

      {/* Right-click context menu for modal items */}
      {modalContextMenu && (
        <div
          className="fixed z-[300] rounded-xl overflow-hidden"
          style={{ top: modalContextMenu.y, left: modalContextMenu.x, backgroundColor: '#FFFFFF', boxShadow: '0 4px 20px rgba(15,31,28,0.18)', border: 'var(--border)', minWidth: 160 }}
          onClick={e => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-3 py-2.5 text-xs font-medium flex items-center gap-2"
            style={{ color: 'var(--color-text)' }}
            onClick={() => {
              const item = dayWorkouts.find(w => w.id === modalContextMenu.itemId)
              if (item && onCopyItem) onCopyItem(item)
              setModalContextMenu(null)
            }}
          >
            ⎘ Copy to another day
          </button>
          <button
            className="w-full text-left px-3 py-2.5 text-xs font-medium flex items-center gap-2"
            style={{ color: '#e05252', borderTop: 'var(--border)' }}
            onClick={() => { onRemoveWorkout(modalContextMenu.itemId); setModalContextMenu(null) }}
          >
            ✕ Delete
          </button>
        </div>
      )}
    </div>
  )
}

// ─── (legacy) MonthDayDetail — kept for reference ────────────────────────────

function MonthDayDetail({ dateStr, session, activityDay, lifeEvents, race, buildingDate, onBuild, onCloseBuild, athleteFtp, dayUserWorkouts = [], onSaveWorkout, onRemoveWorkout }) {
  const [addingType, setAddingType] = useState(null) // 'gym'|'race'|null

  const d = new Date(dateStr + 'T00:00:00')
  const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  if (buildingDate === dateStr) {
    return <WorkoutBuilder dateStr={dateStr} existing={session} onClose={onCloseBuild} ftp={athleteFtp} />
  }

  const tssVariance = activityDay && session ? activityDay.totalTSS - session.tss : null
  const tssVarColor = tssVariance === null ? null
    : Math.abs(tssVariance) <= 10 ? '#00A87E'
    : tssVariance > 0 ? '#F5A623'
    : '#E85555'
  const sourceLabel = activityDay?.primary?.source
    ? activityDay.primary.source.charAt(0).toUpperCase() + activityDay.primary.source.slice(1)
    : 'Actual'

  return (
    <div className="rounded-2xl" style={{ border: 'var(--border)', backgroundColor: '#FFFFFF' }}>
      <div className="flex items-start justify-between p-4 pb-3">
        <div>
          <p className="font-semibold text-sm">{label}</p>
          {race && <p className="text-xs mt-0.5 font-medium" style={{ color: '#0A1628' }}>🏁 {race.name} · {race.distance} · {race.priority}</p>}
        </div>
        <div className="flex items-center gap-2">
          {activityDay && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ backgroundColor: 'rgba(0,200,150,0.10)', color: '#00A87E' }}>
              ✓ Done
            </span>
          )}
          <button onClick={onBuild}
            className="text-xs px-3 py-1.5 rounded-full font-medium transition-colors"
            style={{ backgroundColor: 'rgba(10,22,40,0.07)', color: 'var(--color-text)' }}>
            {session ? 'Edit workout' : '+ Plan workout'}
          </button>
        </div>
      </div>

      {/* Planned session */}
      {session && (
        <div className="px-4 pb-3">
          {activityDay && <p className="section-title mb-2">Planned</p>}
          <div className="grid grid-cols-4 gap-2 mb-2">
            {[['Duration', session.duration], ['TSS', session.tss], ['IF', session.if_], ['Zone', session.zone]].map(([l, v]) => (
              <div key={l} className="rounded-xl px-3 py-2" style={{ backgroundColor: 'rgba(15,31,28,0.03)', border: 'var(--border)' }}>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>{l}</p>
                <p className="data-value text-sm font-semibold">{v}</p>
              </div>
            ))}
          </div>
          {!activityDay && <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{session.note}</p>}
        </div>
      )}

      {/* Actual section */}
      {activityDay && (
        <div className="px-4 py-3" style={{ borderTop: 'var(--border)', backgroundColor: 'rgba(0,200,150,0.025)' }}>
          <p className="section-title mb-2">Strava · Actual</p>
          {activityDay.all.map(act => (
            <div key={act.id} className="mb-2 last:mb-0">
              <p className="text-[11px] font-medium mb-1.5 truncate" style={{ color: 'var(--color-text)' }}>
                {act.pr_count > 0 && <span className="mr-1">🏅 {act.pr_count} PR ·</span>}
                {act.name}
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {[['Time', act.duration], ['Dist', `${act.distance_mi} mi`], ['Elev', `${act.elevation_ft} ft`], ['Cal', act.calories]].map(([l, v]) => (
                  <div key={l} className="rounded-lg px-2 py-1.5" style={{ backgroundColor: 'rgba(0,200,150,0.06)', border: '0.5px solid rgba(0,200,150,0.15)' }}>
                    <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-text-muted)' }}>{l}</p>
                    <p className="data-value text-xs font-semibold">{v}</p>
                  </div>
                ))}
              </div>
              {act.desc && <p className="text-[11px] mt-1 italic" style={{ color: 'var(--color-text-muted)' }}>{act.desc}</p>}
            </div>
          ))}
          {session && tssVariance !== null && (
            <div className="flex items-center gap-4 mt-2 pt-2" style={{ borderTop: '0.5px solid rgba(0,200,150,0.15)' }}>
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                TSS: <span className="data-value font-semibold" style={{ color: tssVarColor }}>
                  {tssVariance > 0 ? '+' : ''}{tssVariance}
                </span> vs {session.tss} planned
              </span>
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                Time: <span className="data-value font-semibold">{activityDay.totalDuration}</span> vs {session.duration}
              </span>
            </div>
          )}
        </div>
      )}

      {!session && !activityDay && dayUserWorkouts.length === 0 && (
        <p className="text-xs px-4 pb-2" style={{ color: 'var(--color-text-muted)' }}>Rest day — no training planned.</p>
      )}

      {/* ── Commitments for the day ── */}
      <div className="px-4 py-3" style={{ borderTop: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.02)' }}>
        <p className="section-title mb-2">Today's commitments</p>
        <div className="flex flex-wrap gap-2">
          {CALENDAR_BLOCKS.map(b => (
            <div key={b.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: COMMITMENT_COLOR[b.type] + '18', color: COMMITMENT_COLOR[b.type] }}>
              <span className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: COMMITMENT_COLOR[b.type] }} />
              {b.label} · {fmtBlock(b.start, b.end)}
            </div>
          ))}
        </div>
      </div>

      {/* ── User-added workouts ── */}
      {dayUserWorkouts.length > 0 && (
        <div className="px-4 py-3" style={{ borderTop: 'var(--border)' }}>
          <p className="section-title mb-2">Added to this day</p>
          <div className="space-y-1.5">
            {dayUserWorkouts.map(w => {
              const dotColor = w.type === 'gym' ? '#A78BFA' : w.type === 'race' ? '#FF2D78' : '#00C896'
              const typeLabel = w.type === 'gym' ? 'Gym / Strength' : w.type === 'race' ? 'Race / Event' : 'Ride'
              return (
                <div key={w.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                  style={{ border: 'var(--border)', backgroundColor: '#FFFFFF' }}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{w.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      {typeLabel}{w.duration ? ` · ${w.duration}m` : ''}{w.distance ? ` · ${w.distance}` : ''}
                    </p>
                  </div>
                  <button onClick={() => onRemoveWorkout(w.id)}
                    className="text-[11px] w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)' }}>✕</button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Add to this day ── */}
      <div className="px-4 py-3" style={{ borderTop: 'var(--border)' }}>
        {addingType === null && (
          <>
            <p className="section-title mb-2">Add to this day</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => { setAddingType(null); onBuild() }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
                style={{ border: 'var(--border)', backgroundColor: '#FFFFFF', color: 'var(--color-text)' }}>
                <span style={{ color: '#00C896' }}>🚴</span> Bike Workout
              </button>
              <button onClick={() => setAddingType('gym')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
                style={{ border: 'var(--border)', backgroundColor: '#FFFFFF', color: 'var(--color-text)' }}>
                <span style={{ color: '#A78BFA' }}>🏋️</span> Gym / Strength
              </button>
              <button onClick={() => setAddingType('race')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
                style={{ border: 'var(--border)', backgroundColor: '#FFFFFF', color: 'var(--color-text)' }}>
                <span style={{ color: '#FF2D78' }}>🏁</span> Race / Event
              </button>
            </div>
          </>
        )}

        {addingType === 'gym' && (
          <GymForm onSave={w => { onSaveWorkout(w); setAddingType(null) }} onCancel={() => setAddingType(null)} />
        )}
        {addingType === 'race' && (
          <RaceForm onSave={w => { onSaveWorkout(w); setAddingType(null) }} onCancel={() => setAddingType(null)} />
        )}
      </div>
    </div>
  )
}

// ─── GymForm ─────────────────────────────────────────────────────────────────

const GYM_ACCENT = '#A78BFA'

function SetRow({ num, set, onUpdate, onRemove, canRemove }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="data-value text-[10px] w-5 text-right shrink-0" style={{ color: 'var(--color-text-muted)' }}>
        {num}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onUpdate({ ...set, reps: Math.max(1, set.reps - 1) })}
          className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
          style={{ backgroundColor: 'rgba(15,31,28,0.07)', color: 'var(--color-text-muted)' }}>−</button>
        <span className="data-value text-xs font-bold w-5 text-center">{set.reps}</span>
        <button
          onClick={() => onUpdate({ ...set, reps: Math.min(50, set.reps + 1) })}
          className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
          style={{ backgroundColor: 'rgba(15,31,28,0.07)', color: 'var(--color-text)' }}>+</button>
        <span className="text-[10px] ml-0.5 shrink-0" style={{ color: 'var(--color-text-muted)' }}>reps</span>
      </div>
      <input
        type="text"
        inputMode="decimal"
        placeholder="— lbs"
        value={set.weight}
        onChange={e => onUpdate({ ...set, weight: e.target.value })}
        className="data-value text-xs rounded-lg px-2 py-1 outline-none flex-1 min-w-0 text-right"
        style={{ border: 'var(--border)', backgroundColor: '#FFFFFF', color: 'var(--color-text)' }}
      />
      <button
        onClick={onRemove}
        className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 transition-opacity"
        style={{
          backgroundColor: canRemove ? 'rgba(232,85,85,0.08)' : 'transparent',
          color: canRemove ? '#C94444' : 'transparent',
          cursor: canRemove ? 'pointer' : 'default',
        }}
        disabled={!canRemove}
      >×</button>
    </div>
  )
}

function ExerciseBlock({ exercise, onUpdate }) {
  function updateSet(setId, updated) {
    onUpdate({ ...exercise, sets: exercise.sets.map(s => s.id !== setId ? s : updated) })
  }
  function removeSet(setId) {
    const sets = exercise.sets.filter(s => s.id !== setId)
    if (sets.length === 0) return
    onUpdate({ ...exercise, sets })
  }
  function addSet() {
    const last = exercise.sets[exercise.sets.length - 1]
    onUpdate({ ...exercise, sets: [...exercise.sets, { id: Date.now() + Math.random(), reps: last?.reps ?? 8, weight: last?.weight ?? '' }] })
  }
  return (
    <div className="space-y-0.5">
      <input
        type="text"
        placeholder="Exercise name"
        value={exercise.name}
        onChange={e => onUpdate({ ...exercise, name: e.target.value })}
        className="w-full text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none"
        style={{ border: 'var(--border)', backgroundColor: '#FFFFFF', color: 'var(--color-text)' }}
      />
      <div className="pl-1">
        {exercise.sets.map((s, i) => (
          <SetRow
            key={s.id}
            num={i + 1}
            set={s}
            onUpdate={updated => updateSet(s.id, updated)}
            onRemove={() => removeSet(s.id)}
            canRemove={exercise.sets.length > 1}
          />
        ))}
        <button
          onClick={addSet}
          className="text-[10px] font-semibold px-2 py-0.5 rounded mt-0.5"
          style={{ color: GYM_ACCENT, backgroundColor: `${GYM_ACCENT}12` }}
        >+ set</button>
      </div>
    </div>
  )
}

function GymForm({ onSave, onCancel, initial = null }) {
  const makeId  = () => Date.now() + Math.random()
  const makeSet = (prev = null) => ({ id: makeId(), reps: prev?.reps ?? 8, weight: prev?.weight ?? '' })
  const makeExercise = (name = '') => ({ id: makeId(), name, sets: [makeSet()] })

  const [sessionName, setSessionName] = useState(initial?.name ?? 'Gym / Strength')
  const [duration, setDuration]       = useState(initial?.duration ?? 60)
  const [blocks, setBlocks]           = useState(initial?.blocks ?? [])

  function addSingleBlock() {
    setBlocks(b => [...b, { id: makeId(), type: 'single', exercise: makeExercise() }])
  }
  function addSupersetBlock() {
    setBlocks(b => [...b, { id: makeId(), type: 'superset', exercises: [makeExercise(), makeExercise()] }])
  }
  function removeBlock(blockId) {
    setBlocks(b => b.filter(x => x.id !== blockId))
  }
  function updateSingleExercise(blockId, updated) {
    setBlocks(b => b.map(x => x.id !== blockId ? x : { ...x, exercise: updated }))
  }
  function updateSupersetExercise(blockId, exId, updated) {
    setBlocks(b => b.map(x => {
      if (x.id !== blockId) return x
      return { ...x, exercises: x.exercises.map(e => e.id !== exId ? e : updated) }
    }))
  }
  function addExerciseToSuperset(blockId) {
    setBlocks(b => b.map(x => {
      if (x.id !== blockId) return x
      return { ...x, exercises: [...x.exercises, makeExercise()] }
    }))
  }
  function removeExerciseFromSuperset(blockId, exId) {
    setBlocks(b => b.map(x => {
      if (x.id !== blockId) return x
      const exercises = x.exercises.filter(e => e.id !== exId)
      return { ...x, exercises: exercises.length ? exercises : [makeExercise()] }
    }))
  }

  const canSave = blocks.length > 0

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          value={sessionName}
          onChange={e => setSessionName(e.target.value)}
          className="flex-1 text-sm font-semibold rounded-lg px-3 py-2 outline-none"
          style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.03)', color: 'var(--color-text)' }}
          placeholder="Session name"
        />
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => setDuration(v => Math.max(15, v - 15))}
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
            style={{ backgroundColor: 'rgba(15,31,28,0.07)', color: 'var(--color-text-muted)' }}>−</button>
          <span className="data-value text-xs font-bold w-10 text-center">{duration}m</span>
          <button onClick={() => setDuration(v => Math.min(180, v + 15))}
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
            style={{ backgroundColor: 'rgba(15,31,28,0.07)', color: 'var(--color-text)' }}>+</button>
        </div>
      </div>

      {/* Workout blocks */}
      {blocks.length > 0 && (
        <div className="space-y-3">
          {blocks.map((block, bi) => (
            <div key={block.id} className="rounded-xl p-3 space-y-2.5"
              style={{ border: `1px solid ${GYM_ACCENT}30`, backgroundColor: `${GYM_ACCENT}06` }}>
              {/* Block header */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GYM_ACCENT }}>
                  {block.type === 'single' ? `Block ${bi + 1} · Single Set` : `Block ${bi + 1} · Superset`}
                </span>
                <button onClick={() => removeBlock(block.id)}
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ color: '#C94444', backgroundColor: 'rgba(232,85,85,0.08)' }}>Remove</button>
              </div>

              {block.type === 'single' && (
                <ExerciseBlock
                  exercise={block.exercise}
                  onUpdate={updated => updateSingleExercise(block.id, updated)}
                />
              )}

              {block.type === 'superset' && (
                <div className="space-y-3">
                  {block.exercises.map((ex, ei) => (
                    <div key={ex.id}>
                      {block.exercises.length > 1 && (
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase tracking-wider font-semibold"
                            style={{ color: 'var(--color-text-muted)' }}>Exercise {ei + 1}</span>
                          <button onClick={() => removeExerciseFromSuperset(block.id, ex.id)}
                            className="text-[10px] px-1 py-0.5 rounded"
                            style={{ color: 'var(--color-text-muted)' }}>✕</button>
                        </div>
                      )}
                      <ExerciseBlock
                        exercise={ex}
                        onUpdate={updated => updateSupersetExercise(block.id, ex.id, updated)}
                      />
                      {ei < block.exercises.length - 1 && (
                        <div className="mt-2.5 mb-1 flex items-center gap-2">
                          <div className="flex-1 h-px" style={{ backgroundColor: `${GYM_ACCENT}25` }} />
                          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: `${GYM_ACCENT}80` }}>then</span>
                          <div className="flex-1 h-px" style={{ backgroundColor: `${GYM_ACCENT}25` }} />
                        </div>
                      )}
                    </div>
                  ))}
                  <button onClick={() => addExerciseToSuperset(block.id)}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ color: GYM_ACCENT, backgroundColor: `${GYM_ACCENT}12` }}>
                    + Add exercise
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add block buttons */}
      <div className="flex gap-2">
        <button onClick={addSingleBlock}
          className="flex-1 py-2 rounded-xl text-xs font-semibold border-2 border-dashed transition-colors"
          style={{ borderColor: `${GYM_ACCENT}40`, color: GYM_ACCENT, backgroundColor: `${GYM_ACCENT}06` }}>
          + Single Set
        </button>
        <button onClick={addSupersetBlock}
          className="flex-1 py-2 rounded-xl text-xs font-semibold border-2 border-dashed transition-colors"
          style={{ borderColor: `${GYM_ACCENT}40`, color: GYM_ACCENT, backgroundColor: `${GYM_ACCENT}06` }}>
          + Superset
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-full text-sm font-medium"
          style={{ backgroundColor: 'rgba(15,31,28,0.05)', color: 'var(--color-text-muted)' }}>Cancel</button>
        <button
          onClick={() => onSave({ type: 'gym', name: sessionName.trim() || 'Gym / Strength', duration, blocks })}
          disabled={!canSave}
          className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-opacity"
          style={{ backgroundColor: GYM_ACCENT, color: '#fff', opacity: canSave ? 1 : 0.4 }}>
          {initial ? 'Save session' : 'Add session'}
        </button>
      </div>
    </div>
  )
}

// ─── PlanForm ─────────────────────────────────────────────────────────────────

const PLAN_ACCENT   = '#F59E0B'
const PLAN_PRESETS  = ['Travel', 'Vacation', 'Event', 'Rest Day']

function PlanForm({ onSave, onCancel }) {
  const [name, setName] = useState('')
  const canSave = name.trim().length > 0
  return (
    <div className="space-y-4">
      <div>
        <p className="font-semibold text-sm mb-0.5">All-day event</p>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Marks this as an off day — no training recommended.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {PLAN_PRESETS.map(p => (
          <button key={p} onClick={() => setName(p)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-left transition-all"
            style={{
              backgroundColor: name === p ? PLAN_ACCENT : 'rgba(15,31,28,0.04)',
              border: name === p ? `1.5px solid ${PLAN_ACCENT}` : '1px solid rgba(15,31,28,0.10)',
              color: name === p ? '#fff' : 'var(--color-text)',
            }}>
            <span className="text-base leading-none">
              {p === 'Travel' ? '✈️' : p === 'Vacation' ? '🌴' : p === 'Event' ? '🎉' : '😴'}
            </span>
            <span className="font-semibold text-sm">{p}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-full text-sm font-medium"
          style={{ backgroundColor: 'rgba(15,31,28,0.05)', color: 'var(--color-text-muted)' }}>Cancel</button>
        <button
          onClick={() => { if (canSave) onSave({ type: 'plan', name: name.trim() }) }}
          className="flex-1 py-2.5 rounded-full text-sm font-semibold"
          style={{ backgroundColor: PLAN_ACCENT, color: '#fff', opacity: canSave ? 1 : 0.45 }}>
          Add to calendar
        </button>
      </div>
    </div>
  )
}

// ─── EventForm ────────────────────────────────────────────────────────────────

const CAL_BIKEREG_EVENTS = [
  { id: 'br001', name: 'Battenkill Road Race',             date: '2026-04-11', location: 'Cambridge, NY',        eventType: 'Road Race',  distance: '62 mi',       fee: '$70',  status: 'open'     },
  { id: 'br002', name: 'Gran Fondo New York',              date: '2026-05-17', location: 'Fort Lee, NJ',         eventType: 'Gran Fondo', distance: '100 mi',      fee: '$150', status: 'open'     },
  { id: 'br003', name: 'Somerville Criterium',             date: '2026-05-25', location: 'Somerville, NJ',       eventType: 'Crit',       distance: '50 min + 5',  fee: '$40',  status: 'open'     },
  { id: 'br004', name: 'Air Force Cycling Classic',        date: '2026-05-30', location: 'Arlington, VA',        eventType: 'Crit',       distance: '40 min + 5',  fee: '$35',  status: 'waitlist' },
  { id: 'br005', name: 'Philly Bike Race',                 date: '2026-06-07', location: 'Philadelphia, PA',     eventType: 'Crit',       distance: '60 min + 5',  fee: '$45',  status: 'open'     },
  { id: 'br006', name: 'Tour de Cure New York',            date: '2026-06-13', location: 'Saratoga Springs, NY', eventType: 'Gran Fondo', distance: '100 mi',      fee: '$55',  status: 'open'     },
  { id: 'br007', name: 'Intelligentsia Cup',               date: '2026-07-10', location: 'Chicago, IL',          eventType: 'Crit',       distance: '8 days',      fee: '$85',  status: 'open'     },
  { id: 'br008', name: 'Cascade Cycling Classic',          date: '2026-07-17', location: 'Bend, OR',             eventType: 'Road Race',  distance: '5-day stage', fee: '$140', status: 'open'     },
  { id: 'br009', name: 'Louisville Criterium',             date: '2026-07-25', location: 'Louisville, KY',       eventType: 'Crit',       distance: '50 min + 5',  fee: '$38',  status: 'open'     },
  { id: 'br010', name: 'Tour of the Catskills',            date: '2026-08-14', location: 'Arkville, NY',         eventType: 'Road Race',  distance: '85 mi',       fee: '$65',  status: 'open'     },
  { id: 'br011', name: 'Mt. Washington Hillclimb',         date: '2026-08-22', location: 'Gorham, NH',           eventType: 'Time Trial', distance: '7.6 mi',      fee: '$80',  status: 'waitlist' },
  { id: 'br012', name: 'Green Mountain Stage Race',        date: '2026-08-27', location: 'Burlington, VT',       eventType: 'Road Race',  distance: '4-day stage', fee: '$130', status: 'open'     },
  { id: 'br013', name: 'Tour of Somerville',               date: '2026-09-12', location: 'Somerville, NJ',       eventType: 'Road Race',  distance: '62 mi',       fee: '$60',  status: 'open'     },
  { id: 'br014', name: 'USA Cycling Masters TT Nationals', date: '2026-09-19', location: 'Winston-Salem, NC',    eventType: 'Time Trial', distance: '20 km',       fee: '$55',  status: 'open'     },
  { id: 'br015', name: 'Gateway Cup',                      date: '2026-09-04', location: 'St. Louis, MO',        eventType: 'Crit',       distance: '4 days',      fee: '$80',  status: 'open'     },
  { id: 'br016', name: 'Hincapie Gran Fondo',              date: '2026-10-03', location: 'Greenville, SC',       eventType: 'Gran Fondo', distance: '80 mi',       fee: '$95',  status: 'open'     },
  { id: 'br017', name: 'Joe Martin Stage Race',            date: '2026-04-23', location: 'Fayetteville, AR',     eventType: 'Road Race',  distance: '4-day stage', fee: '$120', status: 'open'     },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  'DC',
]

function EventForm({ onSave, onCancel, seasonRaces = [] }) {
  const [tab,       setTab]       = useState('manual')  // 'manual' | 'bikereg'
  const [name,      setName]      = useState('')
  const [city,      setCity]      = useState('')
  const [stateCode, setStateCode] = useState('')
  const [eventType, setEventType] = useState('Road Race')
  const [priority,  setPriority]  = useState('B Race')
  const [brSearch,  setBrSearch]  = useState('')
  const EVENT_TYPES = ['Crit', 'Road Race', 'Time Trial', 'Gran Fondo', 'Other']
  const PRIORITIES  = ['A Race', 'B Race', 'C Race']
  const canSubmit = name.trim().length > 0
  const location  = [city.trim(), stateCode].filter(Boolean).join(', ')

  const addedNames = new Set(seasonRaces.map(r => r.name.toLowerCase()))
  const q = brSearch.trim().toLowerCase()
  const brResults = CAL_BIKEREG_EVENTS
    .filter(e => e.status !== 'closed' && (!q || e.name.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)))
    .sort((a, b) => a.date.localeCompare(b.date))

  function fillFromBikeReg(e) {
    const [loc, st] = e.location.split(', ')
    setName(e.name)
    setCity(loc ?? '')
    setStateCode(st ?? '')
    setEventType(e.eventType === 'Gran Fondo' ? 'Other' : e.eventType)
    setTab('manual')
  }

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-0 -mx-1" style={{ borderBottom: 'var(--border)' }}>
        {[
          { key: 'manual', label: 'Manual' },
          { key: 'bikereg', label: 'Find on BikeReg', badge: 'BR' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium relative"
            style={{
              color: tab === t.key ? 'var(--color-text)' : 'var(--color-text-muted)',
              borderBottom: tab === t.key ? '2px solid #0A1628' : '2px solid transparent',
              marginBottom: '-1px',
            }}>
            {t.label}
            {t.badge && (
              <span className="text-[8px] font-bold px-1 py-px rounded"
                style={{ backgroundColor: '#FF6B00', color: '#fff' }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* BikeReg search panel */}
      {tab === 'bikereg' && (
        <div className="space-y-2">
          <input
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.03)' }}
            placeholder="Search events or locations…"
            value={brSearch} onChange={e => setBrSearch(e.target.value)}
            autoFocus
          />
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-0.5">
            {brResults.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-muted)' }}>No events found.</p>
            )}
            {brResults.map(e => {
              const isAdded = addedNames.has(e.name.toLowerCase())
              const d = new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              const statusColor = e.status === 'waitlist' ? '#F5A623' : '#00C896'
              return (
                <div key={e.id}
                  className="rounded-xl px-3 py-2.5 flex items-start justify-between gap-2"
                  style={{ border: 'var(--border)', backgroundColor: '#FFFFFF' }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs leading-tight truncate">{e.name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {d} · {e.eventType} · <span style={{ color: statusColor }}>{e.status === 'waitlist' ? 'Waitlist' : 'Open'}</span>
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>📍 {e.location}</p>
                  </div>
                  {isAdded ? (
                    <span className="shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(0,200,150,0.1)', color: '#00C896' }}>✓ In season</span>
                  ) : (
                    <button onClick={ev => { ev.stopPropagation(); fillFromBikeReg(e) }}
                      className="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: '#0A1628', color: '#fff' }}>Select</button>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-full text-sm font-medium"
              style={{ backgroundColor: 'rgba(15,31,28,0.05)', color: 'var(--color-text-muted)' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Manual entry form */}
      {tab === 'manual' && (
        <div className="space-y-3">
          <input
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.03)' }}
            placeholder="Event name (e.g. Tour of Somerville)"
            value={name} onChange={e => setName(e.target.value)}
          />
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.03)' }}
              placeholder="City"
              value={city} onChange={e => setCity(e.target.value)}
            />
            <select
              value={stateCode} onChange={e => setStateCode(e.target.value)}
              className="rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.03)', color: stateCode ? '#1A2421' : '#637068', width: 80 }}>
              <option value="">State</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Event Type</p>
            <div className="flex gap-2 flex-wrap">
              {EVENT_TYPES.map(t => (
                <button key={t} onClick={() => setEventType(t)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    backgroundColor: eventType === t ? '#0A1628' : 'rgba(15,31,28,0.05)',
                    color: eventType === t ? '#fff' : 'var(--color-text)',
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Race Priority</p>
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button key={p} onClick={() => setPriority(p)}
                  className="flex-1 py-2 rounded-full text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: priority === p ? '#FF2D78' : 'rgba(15,31,28,0.05)',
                    color: priority === p ? '#fff' : 'var(--color-text)',
                  }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-full text-sm font-medium"
              style={{ backgroundColor: 'rgba(15,31,28,0.05)', color: 'var(--color-text-muted)' }}>Cancel</button>
            <button
              onClick={() => { if (canSubmit) onSave({ type: 'event', name: name.trim(), location, eventType, priority }) }}
              className="flex-1 py-2.5 rounded-full text-sm font-semibold"
              style={{ backgroundColor: '#FF2D78', color: '#fff', opacity: canSubmit ? 1 : 0.45 }}>
              Add event
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


// ─── Recommendations logic ────────────────────────────────────────────────────

function buildRecommendations(session, lifeEvents) {
  const recs = []

  if (session.adjusted) {
    recs.push({
      icon: '⚡', color: '#B87000', bg: 'rgba(245,166,35,0.07)', border: 'rgba(245,166,35,0.25)',
      title: 'Session auto-adjusted',
      body: session.adjustedReason,
    })
  }

  lifeEvents.forEach(e => {
    const timing = e.time?.toLowerCase() ?? 'today'
    const ls = LIFE_TYPE_STYLE[e.type] ?? LIFE_TYPE_STYLE.other
    const suggestions = {
      social:  `${e.name} ${timing} — try to complete the session in the morning before the event to avoid arriving fatigued.`,
      family:  `${e.name} ${timing} — plan your training window before this commitment. Light snack 30 min pre-ride if timing is tight.`,
      illness: `${e.name} flagged — listen to your body. Drop to easy spin or rest if energy or breathing feels off during warm-up.`,
      travel:  `Travel day — if training on the road, focus on effort feel over power targets. A hotel treadmill or bike count.`,
      work:    `High work load today — if fatigue is elevated by the session window, reduce intensity by one zone rather than skip.`,
      sleep:   `Poor sleep noted — start easy and reassess at the 15-min mark. Quality at reduced load beats forcing full intensity.`,
      other:   `${e.name} today — factor this into how you pace the session.`,
    }
    recs.push({
      icon: '●', color: ls.text, bg: ls.bg + '99', border: ls.text + '33',
      title: e.name,
      body: suggestions[e.type] ?? suggestions.other,
    })
  })

  if (PRIOR_DAY_LOAD.impact === 'moderate' || PRIOR_DAY_LOAD.impact === 'high') {
    recs.push({
      icon: '◷', color: '#637068', bg: 'rgba(15,31,28,0.04)', border: 'rgba(15,31,28,0.10)',
      title: 'Prior day load',
      body: `Yesterday: ${PRIOR_DAY_LOAD.totalHours}h of commitments. If you feel flat in the warm-up, drop intensity by one zone — don't fight a tired system.`,
    })
  }

  if (session.status === 'Key session' && recs.length === 0) {
    recs.push({
      icon: '★', color: '#CC1A5C', bg: 'rgba(255,45,120,0.06)', border: 'rgba(255,45,120,0.2)',
      title: 'Key session',
      body: 'Prioritize quality over completion. End an interval early rather than reduce power across all sets — a partial rep at target intensity is worth more than a full rep below it.',
    })
  }

  return recs
}

// ─── Helpers for plan/actual comparison ──────────────────────────────────────

function parsePlanSecs(str) {
  if (!str) return 0
  let s = 0
  const h = str.match(/(\d+)h/)
  const m = str.match(/(\d+)m/)
  if (h) s += parseInt(h[1]) * 3600
  if (m) s += parseInt(m[1]) * 60
  return s
}

function fmtDurDelta(secs) {
  const abs  = Math.abs(secs)
  const h    = Math.floor(abs / 3600)
  const m    = Math.floor((abs % 3600) / 60)
  const sign = secs >= 0 ? '+' : '−'
  if (h > 0 && m > 0) return `${sign}${h}h ${m}m`
  if (h > 0) return `${sign}${h}h`
  return `${sign}${m}m`
}

// ─── Session Drawer (week view) ───────────────────────────────────────────────

function SessionDrawer({ dateStr, session, activityDay, lifeEvents, onClose, onBuild }) {
  const d        = new Date(dateStr + 'T00:00:00')
  const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const ss       = session ? (STATUS_STYLE[session.status] ?? STATUS_STYLE['On plan']) : null
  const recs     = session && !activityDay ? buildRecommendations(session, lifeEvents) : []

  const title = session?.type ?? activityDay?.primary?.sport ?? 'Activity'
  const sport = session?.sport ?? activityDay?.primary?.sport

  const sourceLabel = activityDay?.primary?.source
    ? activityDay.primary.source.charAt(0).toUpperCase() + activityDay.primary.source.slice(1)
    : 'Actual'

  // Aggregate actual totals across all activities that day
  const actSecs   = activityDay?.all.reduce((s, a) => s + (a.moving_time_s || 0), 0) ?? 0
  const actElevFt = activityDay?.all.reduce((s, a) => s + (a.elevation_ft || 0), 0) ?? 0
  const actCals   = activityDay?.all.reduce((s, a) => s + (a.calories || 0), 0) ?? 0
  const actPower  = activityDay?.primary?.avg_power || 0
  const actIF     = activityDay?.primary?.intensity_factor ?? null

  // Comparison rows — built when both plan and actual exist
  let compRows = []
  if (session && activityDay) {
    const planSecs = parsePlanSecs(session.duration)
    const durDelta = actSecs - planSecs
    const tssDelta = activityDay.totalTSS - session.tss
    const durColor = Math.abs(durDelta) < 600 ? '#00A87E' : durDelta > 0 ? '#F5A623' : '#E85555'
    const tssColor = Math.abs(tssDelta) <= 10 ? '#00A87E' : tssDelta > 0 ? '#F5A623' : '#E85555'

    compRows = [
      { label: 'Duration',     planned: session.duration,           actual: activityDay.totalDuration,                       delta: fmtDurDelta(durDelta),                    deltaColor: durColor },
      { label: 'TSS',          planned: String(session.tss),        actual: String(activityDay.totalTSS),                    delta: `${tssDelta >= 0 ? '+' : ''}${tssDelta}`, deltaColor: tssColor },
      { label: 'Zone / Power', planned: `${session.zone} · ${session.if_} IF`, actual: actPower > 0 ? `${actPower}W${actIF != null ? ` · ${actIF} IF` : ''}` : null, delta: null },
      { label: 'Distance',     planned: null, actual: parseFloat(activityDay.totalDist) > 0 ? `${activityDay.totalDist} mi` : null, delta: null },
      { label: 'Elevation',    planned: null, actual: actElevFt > 0 ? `${actElevFt} ft` : null, delta: null },
      { label: 'Calories',     planned: null, actual: actCals   > 0 ? String(actCals)   : null, delta: null },
    ].filter(r => r.planned != null || r.actual != null)
  }

  const COL = '1.5fr 1fr 1fr 0.65fr'

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: 'var(--border)', boxShadow: '0 4px 20px rgba(15,31,28,0.10)', backgroundColor: '#FFFFFF' }}>

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="font-semibold text-base">{title}</p>
              {ss && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: ss.bg, color: ss.text }}>
                  {session.status}
                </span>
              )}
              {activityDay && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(0,200,150,0.10)', color: '#00A87E' }}>
                  ✓ Done
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {dayLabel}{sport ? ` · ${sport}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onBuild}
              className="text-xs px-3 py-1.5 rounded-full font-medium transition-colors"
              style={{ backgroundColor: 'rgba(10,22,40,0.07)', color: 'var(--color-text)' }}>
              {session ? 'Edit workout' : '+ Plan workout'}
            </button>
            <button onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
              style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)' }}>✕</button>
          </div>
        </div>
      </div>

      {/* ── CASE 1: Comparison table (plan + actual on same day) ── */}
      {session && activityDay && (
        <div className="px-5 pb-5">
          <div className="rounded-xl overflow-hidden" style={{ border: 'var(--border)' }}>
            {/* Column headers */}
            <div className="grid px-4 py-2.5"
              style={{ gridTemplateColumns: COL, borderBottom: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.03)' }}>
              <span />
              <p className="section-title text-right">Planned</p>
              <p className="section-title text-right">{sourceLabel}</p>
              <p className="section-title text-right">vs plan</p>
            </div>
            {compRows.map((row, i) => (
              <div key={i} className="grid px-4 py-3 items-baseline"
                style={{ gridTemplateColumns: COL, borderBottom: i < compRows.length - 1 ? 'var(--border)' : 'none' }}>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{row.label}</span>
                <span className="data-value text-sm text-right"
                  style={{ color: 'var(--color-text)', opacity: row.planned != null ? 0.45 : 0 }}>
                  {row.planned ?? ''}
                </span>
                <span className="data-value text-sm font-semibold text-right">
                  {row.actual ?? '—'}
                </span>
                <span className="data-value text-xs font-semibold text-right"
                  style={{ color: row.deltaColor }}>
                  {row.delta ?? ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CASE 2: Plan only (future / unstarted session) ── */}
      {session && !activityDay && (
        <div className="px-5 pb-5">
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[['Duration', session.duration], ['TSS', session.tss], ['IF', session.if_], ['Zone', session.zone]].map(([l, v]) => (
              <div key={l} className="rounded-xl px-3 py-2.5" style={{ backgroundColor: 'rgba(15,31,28,0.03)', border: 'var(--border)' }}>
                <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>{l}</p>
                <p className="data-value text-base font-semibold">{v}</p>
              </div>
            ))}
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{session.note}</p>
        </div>
      )}

      {/* ── CASE 3: Actual only (unplanned completed day) ── */}
      {!session && activityDay && (
        <div className="px-5 pb-5">
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              ['Duration', activityDay.totalDuration],
              ['Distance', `${activityDay.totalDist} mi`],
              ['Elevation', `${actElevFt} ft`],
              ['Calories', actCals],
            ].map(([l, v]) => (
              <div key={l} className="rounded-xl px-3 py-2.5"
                style={{ backgroundColor: 'rgba(0,200,150,0.05)', border: '0.5px solid rgba(0,200,150,0.15)' }}>
                <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>{l}</p>
                <p className="data-value text-base font-semibold">{v}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {actPower > 0 && <span className="text-[11px] data-value" style={{ color: 'var(--color-text-muted)' }}>{actPower}W avg</span>}
            {activityDay.primary?.cadence > 0 && <span className="text-[11px] data-value" style={{ color: 'var(--color-text-muted)' }}>{activityDay.primary.cadence} rpm</span>}
            <span className="text-[11px] data-value" style={{ color: 'var(--color-text-muted)' }}>~{activityDay.totalTSS} TSS</span>
          </div>
        </div>
      )}

      {/* ── Recommendations (future sessions only) ── */}
      {session && !activityDay && (
        <div style={{ borderTop: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.02)' }} className="px-5 py-4">
          <p className="section-title mb-3">Recommendations</p>
          {recs.length === 0 ? (
            <div className="flex items-center gap-2">
              <span style={{ color: '#00A87E' }}>✓</span>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Session looks good — no adjustments needed. Execute as planned.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recs.map((r, i) => (
                <div key={i} className="rounded-xl px-4 py-3 flex items-start gap-3"
                  style={{ backgroundColor: r.bg, border: `0.5px solid ${r.border}` }}>
                  <span className="text-xs mt-0.5 shrink-0" style={{ color: r.color }}>{r.icon}</span>
                  <div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: r.color }}>{r.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{r.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Workout Builder ──────────────────────────────────────────────────────────

const INTERVAL_TYPES = [
  { id: 'warmup',           label: 'Warmup',           desc: 'Gradual ramp from easy to target intensity' },
  { id: 'cooldown',         label: 'Cooldown',         desc: 'Progressive ease-down from working pace' },
  { id: 'recovery',         label: 'Recovery',         desc: 'Sustained easy effort — HR low throughout' },
  { id: 'hard',             label: 'Hard',             desc: 'Single sustained hard effort block' },
  { id: 'hard_easy',        label: 'Hard-Easy',        desc: 'Alternating work and rest intervals' },
  { id: 'hard_harder_easy', label: 'Hard-Harder-Easy', desc: 'Escalating blocks — hard, harder, recovery' },
  { id: 'ramp_up',          label: 'Ramp Up',          desc: 'Step-wise intensity increases' },
  { id: 'ramp_down',        label: 'Ramp Down',        desc: 'Step-wise intensity decreases' },
]

const ATHLETE_FTP    = 360
const ATHLETE_MAX_HR = 187

const INTERVAL_DEFAULTS = {
  warmup:           15,
  cooldown:         10,
  recovery:         20,
  hard:             10,
  hard_easy:        28,
  hard_harder_easy: 24,
  ramp_up:          20,
  ramp_down:        15,
}

const INTERVAL_SHAPE = {
  warmup:           [{ dur: 1, v: 0.15 }, { dur: 1, v: 0.30 }, { dur: 1, v: 0.48 }, { dur: 1, v: 0.64 }, { dur: 1, v: 0.78 }],
  cooldown:         [{ dur: 1, v: 0.78 }, { dur: 1, v: 0.64 }, { dur: 1, v: 0.48 }, { dur: 1, v: 0.30 }, { dur: 1, v: 0.15 }],
  recovery:         [{ dur: 1, v: 0.22 }],
  hard:             [{ dur: 1, v: 0.92 }],
  hard_easy:        [{ dur: 2, v: 0.88 }, { dur: 1.5, v: 0.28 }, { dur: 2, v: 0.88 }, { dur: 1.5, v: 0.28 }],
  hard_harder_easy: [{ dur: 1.5, v: 0.78 }, { dur: 1, v: 0.96 }, { dur: 1.5, v: 0.22 }],
  ramp_up:          [{ dur: 1, v: 0.35 }, { dur: 1, v: 0.52 }, { dur: 1, v: 0.70 }, { dur: 1, v: 0.88 }],
  ramp_down:        [{ dur: 1, v: 0.88 }, { dur: 1, v: 0.70 }, { dur: 1, v: 0.52 }, { dur: 1, v: 0.35 }],
}

function zoneColor(v) {
  if (v < 0.56) return '#9CA8A4'   // Z1 — grey
  if (v < 0.76) return '#4A9EE8'   // Z2 — blue
  if (v < 0.88) return '#22C55E'   // Z3 — green
  if (v < 1.06) return '#F5A623'   // Z4 — yellow
  return '#E85555'                  // Z5+ — red
}

function fmtDurShort(min) {
  const totalSec = Math.round(min * 60)
  const m = Math.floor(totalSec / 60), s = totalSec % 60
  return s > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${m}m`
}

function stepDur(val, dir, minVal = 0.25, maxVal = 30) {
  const step = val < 2 ? 0.25 : val < 5 ? 0.5 : 1
  return dir > 0 ? Math.min(maxVal, val + step) : Math.max(minVal, val - step)
}

function fmtDurHMS(min) {
  const totalSec = Math.round((min ?? 0) * 60)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function parseDurInput(str, minVal, maxVal) {
  const t = str.trim()
  // H:MM:SS
  const hmsMatch = t.match(/^(\d+):(\d{1,2}):(\d{1,2})$/)
  if (hmsMatch) {
    const h = parseInt(hmsMatch[1]), m = parseInt(hmsMatch[2]), s = parseInt(hmsMatch[3])
    if (m >= 60 || s >= 60) return null
    const res = h * 60 + m + s / 60
    return Math.max(minVal, Math.min(maxVal, res))
  }
  // M:SS
  const msMatch = t.match(/^(\d+):(\d{1,2})$/)
  if (msMatch) {
    const m = parseInt(msMatch[1]), s = parseInt(msMatch[2])
    if (s >= 60) return null
    const res = m + s / 60
    return Math.max(minVal, Math.min(maxVal, res))
  }
  const num = parseFloat(t)
  if (!isNaN(num) && num > 0) return Math.max(minVal, Math.min(maxVal, num))
  return null
}

function DurInput({ val, onChange, minVal = 0.25, maxVal = 30 }) {
  const displayKey = fmtDurShort(val ?? minVal)
  const editDefault = fmtDurHMS(val ?? minVal)
  return (
    <div className="flex items-center gap-0.5">
      <button onClick={() => onChange(stepDur(val ?? minVal, -1, minVal, maxVal))}
        className="w-5 h-5 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)', fontSize: 12 }}>−</button>
      <input
        key={displayKey}
        type="text"
        defaultValue={editDefault}
        className="data-value text-xs font-semibold text-center"
        style={{ width: '4.5rem', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(15,31,28,0.15)', outline: 'none', color: 'var(--color-text)', padding: '0 2px' }}
        onFocus={e => e.target.select()}
        onBlur={e => {
          const parsed = parseDurInput(e.target.value, minVal, maxVal)
          if (parsed !== null) onChange(parsed)
          else e.target.value = editDefault
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); e.target.blur() }
          if (e.key === 'Escape') { e.target.value = editDefault; e.target.blur() }
        }}
      />
      <button onClick={() => onChange(stepDur(val ?? minVal, 1, minVal, maxVal))}
        className="w-5 h-5 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text)', fontSize: 12 }}>+</button>
    </div>
  )
}

function DropGap({ index, dragOverIndex, setDragOverIndex, onDrop }) {
  const active = dragOverIndex === index
  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOverIndex(index) }}
      onDragLeave={() => setDragOverIndex(null)}
      onDrop={e => onDrop(e, index)}
      style={{
        height: active ? '28px' : '6px',
        borderRadius: 8,
        backgroundColor: active ? 'rgba(0,200,150,0.07)' : 'transparent',
        border: active ? '1.5px dashed var(--color-accent)' : '1.5px solid transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}
    >
      {active && <p className="text-[10px]" style={{ color: 'var(--color-accent)' }}>Drop here</p>}
    </div>
  )
}

function WorkoutBuilder({ dateStr, existing, onClose, onSave, ftp = ATHLETE_FTP }) {
  const d = new Date(dateStr + 'T00:00:00')
  const dayLabel = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  function fmtMin(min) {
    if (!min) return '0m'
    if (min < 1) return `${Math.round(min * 60)}s`
    const h = Math.floor(min / 60), m = Math.floor(min % 60), s = Math.round((min % 1) * 60)
    if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`
    return s > 0 ? `${m}m ${s}s` : `${m}m`
  }

  // Returns shape segments for a block, using its live interval config
  function getBlockShape(b) {
    const s = b.sets ?? 4, st = b.steps ?? 4
    switch (b.type) {
      case 'hard_easy':
        return Array.from({ length: s }, () => [
          { dur: b.workMin ?? 4, v: (b.workFtpPct ?? 95) / 100 },
          { dur: b.restMin ?? 2, v: (b.restFtpPct ?? 55) / 100 },
        ]).flat()
      case 'hard_harder_easy':
        return Array.from({ length: s }, () => [
          { dur: b.hardMin ?? 3,   v: (b.hardFtpPct ?? 85) / 100 },
          { dur: b.harderMin ?? 2, v: (b.harderFtpPct ?? 100) / 100 },
          { dur: b.easyMin ?? 2,   v: (b.easyFtpPct ?? 50) / 100 },
        ]).flat()
      case 'ramp_up': {
        const lo = (b.ftpLow ?? 35) / 100, hi = (b.ftpHigh ?? 88) / 100
        return Array.from({ length: st }, (_, i) => ({
          dur: b.stepMin ?? 5, v: lo + (i / Math.max(st - 1, 1)) * (hi - lo),
        }))
      }
      case 'ramp_down': {
        const hi = (b.ftpHigh ?? 88) / 100, lo = (b.ftpLow ?? 35) / 100
        return Array.from({ length: st }, (_, i) => ({
          dur: b.stepMin ?? 5, v: hi - (i / Math.max(st - 1, 1)) * (hi - lo),
        }))
      }
      default:
        return [{ dur: b.durationMin ?? 15, v: (b.ftpPct ?? 60) / 100 }]
    }
  }

  // Calculated total minutes for a block
  function calcBlockDuration(b) {
    switch (b.type) {
      case 'hard_easy':        return (b.sets ?? 4) * ((b.workMin ?? 4) + (b.restMin ?? 2))
      case 'hard_harder_easy': return (b.sets ?? 3) * ((b.hardMin ?? 3) + (b.harderMin ?? 2) + (b.easyMin ?? 2))
      case 'ramp_up':
      case 'ramp_down':        return (b.steps ?? 4) * (b.stepMin ?? 5)
      default:                 return b.durationMin ?? 15
    }
  }

  const [name,          setName]          = useState(existing?.name ?? existing?.type ?? '')
  const [blocks,        setBlocks]        = useState(existing?.blocks ?? [])
  // Workout-level intensity
  const [intensityMode, setIntensityMode] = useState(existing?.intensityMode ?? 'ftp_pct')
  const [ftpPct,        setFtpPct]        = useState(existing?.ftpPct ?? 80)
  const [powerLow,      setPowerLow]      = useState(existing?.powerLow ?? 200)
  const [powerHigh,     setPowerHigh]     = useState(existing?.powerHigh ?? 250)
  const [hrPct,         setHrPct]         = useState(existing?.hrPct ?? 75)
  const [hrLow,         setHrLow]         = useState(existing?.hrLow ?? 140)
  const [hrHigh,        setHrHigh]        = useState(existing?.hrHigh ?? 160)

  const totalMin = blocks.reduce((s, b) => s + calcBlockDuration(b), 0)

  function addBlock(typeId) {
    const defaults = {
      warmup:           { durationMin: 15, ftpPct: 60 },
      cooldown:         { durationMin: 10, ftpPct: 50 },
      recovery:         { durationMin: 20, ftpPct: 40 },
      hard:             { durationMin: 10, ftpPct: 105 },
      hard_easy:        { sets: 4, workMin: 4, restMin: 2, workFtpPct: 95, restFtpPct: 55 },
      hard_harder_easy: { sets: 3, hardMin: 3, harderMin: 2, easyMin: 2, hardFtpPct: 85, harderFtpPct: 100, easyFtpPct: 50 },
      ramp_up:          { steps: 4, stepMin: 5, ftpLow: 35, ftpHigh: 88 },
      ramp_down:        { steps: 4, stepMin: 5, ftpHigh: 88, ftpLow: 35 },
    }
    setBlocks(prev => [...prev, { id: Date.now() + Math.random(), type: typeId, ...defaults[typeId] }])
  }

  function updateBlock(id, patch) {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b))
  }

  function removeBlock(id) {
    setBlocks(prev => prev.filter(b => b.id !== id))
  }

  // Preview: flatten all blocks into proportional segments
  const allPreviewSegs = blocks.flatMap(b => getBlockShape(b))
  const previewTotal   = allPreviewSegs.reduce((s, x) => s + x.dur, 0)
  // Auto-TSS: TSS = sum of (durHours × IF² × 100) per segment, where IF = v (FTP fraction)
  const autoTSS = Math.round(allPreviewSegs.reduce((s, seg) => s + (seg.dur / 60) * seg.v * seg.v * 100, 0))
  const PH = 52

  return (
    <div className="rounded-2xl p-5" style={{ border: 'var(--border)', boxShadow: '0 4px 20px rgba(15,31,28,0.10)', backgroundColor: '#FFFFFF' }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-semibold text-base">{existing ? 'Edit workout' : 'Plan workout'}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{dayLabel}</p>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
          style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)' }}>✕</button>
      </div>

      {/* Prior load note */}
      <div className="rounded-xl px-3 py-2.5 mb-5 flex items-start gap-2"
        style={{ backgroundColor: 'rgba(245,166,35,0.06)', border: '0.5px solid rgba(245,166,35,0.2)' }}>
        <span className="text-xs mt-0.5">⚡</span>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          <span className="font-medium" style={{ color: '#B87000' }}>Prior day load moderate.</span>
          {' '}Yesterday's 10.5h of commitments may reduce adaptability — consider keeping intensity at the lower end of the target range.
        </p>
      </div>

      <div className="space-y-5">

        {/* Workout name */}
        <div>
          <p className="section-title mb-2">Workout name</p>
          <input
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.03)' }}
            placeholder="e.g. Tuesday intervals, Pre-race activation"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>


        {/* Interval palette — click to add */}
        <div>
          <p className="section-title mb-2">Add interval blocks</p>
          <div className="flex flex-wrap gap-1.5">
            {INTERVAL_TYPES.map((it, idx) => (
              <button key={it.id}
                onClick={() => addBlock(it.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: 'rgba(15,31,28,0.05)',
                  border: 'var(--border)',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                }}
                title={it.desc}>
                <span style={{ color: 'var(--color-accent)', fontSize: 9, fontWeight: 700 }}>{idx + 1}</span>
                {it.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="section-title">Workout timeline</p>
            {blocks.length > 0 && (
              <span className="data-value text-xs font-bold" style={{ color: 'var(--color-accent)' }}>
                {fmtMin(totalMin)} total
              </span>
            )}
          </div>

          {blocks.length === 0 ? (
            <div className="rounded-xl flex flex-col items-center justify-center gap-1.5 py-8"
              style={{ border: '1.5px dashed rgba(15,31,28,0.15)', backgroundColor: 'rgba(15,31,28,0.02)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>No blocks yet</p>
              <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Click an interval block above to add it</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {blocks.map((block) => {
                const it    = INTERVAL_TYPES.find(t => t.id === block.type)
                const shape = getBlockShape(block)
                const tot   = shape.reduce((s, x) => s + x.dur, 0)
                const dur   = calcBlockDuration(block)
                const MH    = 24
                const isStructured = ['hard_easy','hard_harder_easy','ramp_up','ramp_down'].includes(block.type)

                function Stepper({ val, onDec, onInc, suffix = 'm', minW = 'w-8', isDur = false }) {
                  return (
                    <div className="flex items-center gap-0.5">
                      <button onClick={onDec} className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)', fontSize: 12 }}>−</button>
                      <span className={`data-value text-xs font-semibold ${minW} text-center`}>{isDur ? fmtDurShort(val) : `${val}${suffix}`}</span>
                      <button onClick={onInc} className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text)', fontSize: 12 }}>+</button>
                    </div>
                  )
                }

                return (
                  <div key={block.id} className="rounded-xl overflow-hidden"
                    style={{ border: 'var(--border)', backgroundColor: '#FFFFFF' }}>

                    {/* Header row */}
                    <div className="flex items-center gap-2.5 px-3 py-2" style={{ borderBottom: isStructured ? '0.5px solid rgba(15,31,28,0.06)' : 'none', backgroundColor: isStructured ? 'rgba(15,31,28,0.02)' : 'transparent' }}>
                      <div style={{ display: 'flex', height: MH + 'px', gap: '1.5px', alignItems: 'flex-end', flexShrink: 0 }}>
                        {shape.map((s, si) => (
                          <div key={si} style={{
                            width: Math.max((s.dur / tot) * 36, 2) + 'px',
                            height: Math.max(s.v * MH, 2) + 'px',
                            backgroundColor: zoneColor(s.v),
                            borderRadius: '1px 1px 0 0',
                          }} />
                        ))}
                      </div>
                      <p className="text-xs font-semibold flex-1">{it?.label}</p>
                      <span className="data-value text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: 'rgba(0,200,150,0.08)', color: '#00A87E' }}>
                        {fmtMin(dur)}
                      </span>
                      <button onClick={() => removeBlock(block.id)}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] ml-0.5 flex-shrink-0"
                        style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)' }}>✕</button>
                    </div>

                    {/* Config row — duration + intensity for simple types, interval config for structured */}
                    <div className="px-3 py-2 space-y-2">
                      {!isStructured && (
                        <>
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Duration</p>
                              <DurInput
                                val={block.durationMin}
                                onChange={v => updateBlock(block.id, { durationMin: v })}
                                minVal={0.25}
                                maxVal={180}
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>% FTP</p>
                              <Stepper
                                val={block.ftpPct ?? 60}
                                suffix="%"
                                onDec={() => updateBlock(block.id, { ftpPct: Math.max(10, (block.ftpPct ?? 60) - 5) })}
                                onInc={() => updateBlock(block.id, { ftpPct: Math.min(120, (block.ftpPct ?? 60) + 5) })}
                                minW="w-10"
                              />
                              {ftp > 0 && (
                                <span className="data-value text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                                  {Math.round((block.ftpPct ?? 60) / 100 * ftp)}w
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {block.type === 'hard_easy' && (
                        <>
                          <div className="flex items-center gap-3 flex-wrap">
                            <div>
                              <p className="text-[10px] mb-1" style={{ color: 'var(--color-text-muted)' }}>Sets</p>
                              <Stepper val={block.sets ?? 4} suffix=""
                                onDec={() => updateBlock(block.id, { sets: Math.max(1, (block.sets ?? 4) - 1) })}
                                onInc={() => updateBlock(block.id, { sets: Math.min(20, (block.sets ?? 4) + 1) })} />
                            </div>
                            <span className="text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>×</span>
                            <div>
                              <p className="text-[10px] mb-1" style={{ color: 'var(--color-text-muted)' }}>Work</p>
                              <DurInput val={block.workMin ?? 4}
                                onChange={v => updateBlock(block.id, { workMin: v })} />
                            </div>
                            <div>
                              <p className="text-[10px] mb-1" style={{ color: 'var(--color-text-muted)' }}>Rest</p>
                              <DurInput val={block.restMin ?? 2}
                                onChange={v => updateBlock(block.id, { restMin: v })} />
                            </div>
                            <p className="text-[10px] mt-4 data-value" style={{ color: 'var(--color-text-muted)' }}>
                              = {fmtMin(dur)} total
                            </p>
                          </div>
                          <div className="flex items-center gap-4 flex-wrap pt-1" style={{ borderTop: '0.5px solid rgba(15,31,28,0.06)' }}>
                            <div className="flex items-center gap-1.5">
                              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Work % FTP</p>
                              <Stepper val={block.workFtpPct ?? 95} suffix="%"
                                onDec={() => updateBlock(block.id, { workFtpPct: Math.max(50, (block.workFtpPct ?? 95) - 5) })}
                                onInc={() => updateBlock(block.id, { workFtpPct: Math.min(150, (block.workFtpPct ?? 95) + 5) })}
                                minW="w-10" />
                              {ftp > 0 && <span className="data-value text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{Math.round((block.workFtpPct ?? 95) / 100 * ftp)}w</span>}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Rest % FTP</p>
                              <Stepper val={block.restFtpPct ?? 55} suffix="%"
                                onDec={() => updateBlock(block.id, { restFtpPct: Math.max(10, (block.restFtpPct ?? 55) - 5) })}
                                onInc={() => updateBlock(block.id, { restFtpPct: Math.min(100, (block.restFtpPct ?? 55) + 5) })}
                                minW="w-10" />
                              {ftp > 0 && <span className="data-value text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{Math.round((block.restFtpPct ?? 55) / 100 * ftp)}w</span>}
                            </div>
                          </div>
                        </>
                      )}

                      {block.type === 'hard_harder_easy' && (
                        <>
                          <div className="flex items-center gap-3 flex-wrap">
                            <div>
                              <p className="text-[10px] mb-1" style={{ color: 'var(--color-text-muted)' }}>Sets</p>
                              <Stepper val={block.sets ?? 3} suffix=""
                                onDec={() => updateBlock(block.id, { sets: Math.max(1, (block.sets ?? 3) - 1) })}
                                onInc={() => updateBlock(block.id, { sets: Math.min(10, (block.sets ?? 3) + 1) })} />
                            </div>
                            <span className="text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>×</span>
                            <div>
                              <p className="text-[10px] mb-1" style={{ color: 'var(--color-text-muted)' }}>Hard</p>
                              <DurInput val={block.hardMin ?? 3}
                                onChange={v => updateBlock(block.id, { hardMin: v })} />
                            </div>
                            <div>
                              <p className="text-[10px] mb-1" style={{ color: 'var(--color-text-muted)' }}>Harder</p>
                              <DurInput val={block.harderMin ?? 2}
                                onChange={v => updateBlock(block.id, { harderMin: v })} />
                            </div>
                            <div>
                              <p className="text-[10px] mb-1" style={{ color: 'var(--color-text-muted)' }}>Easy</p>
                              <DurInput val={block.easyMin ?? 2}
                                onChange={v => updateBlock(block.id, { easyMin: v })} />
                            </div>
                            <p className="text-[10px] mt-4 data-value" style={{ color: 'var(--color-text-muted)' }}>
                              = {fmtMin(dur)} total
                            </p>
                          </div>
                          <div className="flex items-center gap-4 flex-wrap pt-1" style={{ borderTop: '0.5px solid rgba(15,31,28,0.06)' }}>
                            <div className="flex items-center gap-1.5">
                              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Hard % FTP</p>
                              <Stepper val={block.hardFtpPct ?? 85} suffix="%"
                                onDec={() => updateBlock(block.id, { hardFtpPct: Math.max(50, (block.hardFtpPct ?? 85) - 5) })}
                                onInc={() => updateBlock(block.id, { hardFtpPct: Math.min(150, (block.hardFtpPct ?? 85) + 5) })}
                                minW="w-10" />
                              {ftp > 0 && <span className="data-value text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{Math.round((block.hardFtpPct ?? 85) / 100 * ftp)}w</span>}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Harder % FTP</p>
                              <Stepper val={block.harderFtpPct ?? 100} suffix="%"
                                onDec={() => updateBlock(block.id, { harderFtpPct: Math.max(50, (block.harderFtpPct ?? 100) - 5) })}
                                onInc={() => updateBlock(block.id, { harderFtpPct: Math.min(150, (block.harderFtpPct ?? 100) + 5) })}
                                minW="w-10" />
                              {ftp > 0 && <span className="data-value text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{Math.round((block.harderFtpPct ?? 100) / 100 * ftp)}w</span>}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Easy % FTP</p>
                              <Stepper val={block.easyFtpPct ?? 50} suffix="%"
                                onDec={() => updateBlock(block.id, { easyFtpPct: Math.max(10, (block.easyFtpPct ?? 50) - 5) })}
                                onInc={() => updateBlock(block.id, { easyFtpPct: Math.min(100, (block.easyFtpPct ?? 50) + 5) })}
                                minW="w-10" />
                              {ftp > 0 && <span className="data-value text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{Math.round((block.easyFtpPct ?? 50) / 100 * ftp)}w</span>}
                            </div>
                          </div>
                        </>
                      )}

                      {(block.type === 'ramp_up' || block.type === 'ramp_down') && (
                        <>
                          <div className="flex items-center gap-3 flex-wrap">
                            <div>
                              <p className="text-[10px] mb-1" style={{ color: 'var(--color-text-muted)' }}>Steps</p>
                              <Stepper val={block.steps ?? 4} suffix=""
                                onDec={() => updateBlock(block.id, { steps: Math.max(2, (block.steps ?? 4) - 1) })}
                                onInc={() => updateBlock(block.id, { steps: Math.min(12, (block.steps ?? 4) + 1) })} />
                            </div>
                            <span className="text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>×</span>
                            <div>
                              <p className="text-[10px] mb-1" style={{ color: 'var(--color-text-muted)' }}>Per step</p>
                              <DurInput val={block.stepMin ?? 5}
                                onChange={v => updateBlock(block.id, { stepMin: v })} />
                            </div>
                            <p className="text-[10px] mt-4 data-value" style={{ color: 'var(--color-text-muted)' }}>
                              = {fmtMin(dur)} total
                            </p>
                          </div>
                          <div className="flex items-center gap-4 flex-wrap pt-1" style={{ borderTop: '0.5px solid rgba(15,31,28,0.06)' }}>
                            <div className="flex items-center gap-1.5">
                              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{block.type === 'ramp_up' ? 'Start' : 'Start'} % FTP</p>
                              <Stepper
                                val={block.type === 'ramp_up' ? (block.ftpLow ?? 35) : (block.ftpHigh ?? 88)}
                                suffix="%"
                                onDec={() => block.type === 'ramp_up'
                                  ? updateBlock(block.id, { ftpLow: Math.max(10, (block.ftpLow ?? 35) - 5) })
                                  : updateBlock(block.id, { ftpHigh: Math.max(40, (block.ftpHigh ?? 88) - 5) })}
                                onInc={() => block.type === 'ramp_up'
                                  ? updateBlock(block.id, { ftpLow: Math.min(80, (block.ftpLow ?? 35) + 5) })
                                  : updateBlock(block.id, { ftpHigh: Math.min(150, (block.ftpHigh ?? 88) + 5) })}
                                minW="w-10"
                              />
                              {ftp > 0 && (
                                <span className="data-value text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                                  {Math.round((block.type === 'ramp_up' ? (block.ftpLow ?? 35) : (block.ftpHigh ?? 88)) / 100 * ftp)}w
                                </span>
                              )}
                            </div>
                            <span className="text-xs mt-0" style={{ color: 'var(--color-text-muted)' }}>→</span>
                            <div className="flex items-center gap-1.5">
                              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>End % FTP</p>
                              <Stepper
                                val={block.type === 'ramp_up' ? (block.ftpHigh ?? 88) : (block.ftpLow ?? 35)}
                                suffix="%"
                                onDec={() => block.type === 'ramp_up'
                                  ? updateBlock(block.id, { ftpHigh: Math.max(40, (block.ftpHigh ?? 88) - 5) })
                                  : updateBlock(block.id, { ftpLow: Math.max(10, (block.ftpLow ?? 35) - 5) })}
                                onInc={() => block.type === 'ramp_up'
                                  ? updateBlock(block.id, { ftpHigh: Math.min(150, (block.ftpHigh ?? 88) + 5) })
                                  : updateBlock(block.id, { ftpLow: Math.min(80, (block.ftpLow ?? 35) + 5) })}
                                minW="w-10"
                              />
                              {ftp > 0 && (
                                <span className="data-value text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                                  {Math.round((block.type === 'ramp_up' ? (block.ftpHigh ?? 88) : (block.ftpLow ?? 35)) / 100 * ftp)}w
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Workout shape preview */}
        {blocks.length > 0 && (
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(15,31,28,0.03)', border: 'var(--border)', padding: '10px 12px 8px' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="section-title">Workout shape</p>
              {autoTSS > 0 && (
                <span className="data-value text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(0,200,150,0.10)', color: '#00A87E' }}>
                  ~{autoTSS} TSS
                </span>
              )}
            </div>
            <div style={{ display: 'flex', height: PH + 'px', gap: '2px', alignItems: 'flex-end' }}>
              {allPreviewSegs.map((s, i) => (
                <div key={i} style={{
                  flex: s.dur / previewTotal,
                  height: Math.max(s.v * PH, 3) + 'px',
                  backgroundColor: zoneColor(s.v),
                  borderRadius: '2px 2px 0 0',
                  minWidth: '3px',
                }} />
              ))}
            </div>
            <div style={{ height: '1px', backgroundColor: 'rgba(15,31,28,0.10)', margin: '0 0 4px' }} />
            <div className="flex items-center justify-between">
              <span className="data-value text-[9px]" style={{ color: 'var(--color-text-muted)' }}>Start</span>
              <div className="flex items-center gap-2.5">
                {[['#9CA8A4','Z1'],['#4A9EE8','Z2'],['#22C55E','Z3'],['#F5A623','Z4'],['#E85555','Z5+']].map(([c,l]) => (
                  <span key={l} className="flex items-center gap-1 text-[9px]" style={{ color: 'var(--color-text-muted)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: 1, backgroundColor: c, display: 'inline-block' }} />{l}
                  </span>
                ))}
              </div>
              <span className="data-value text-[9px]" style={{ color: 'var(--color-text-muted)' }}>Finish</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-full text-sm font-medium"
            style={{ backgroundColor: 'rgba(15,31,28,0.05)', color: 'var(--color-text-muted)' }}>
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 opacity-50 cursor-not-allowed"
            style={{ backgroundColor: '#FC6719', color: '#fff' }}
            disabled
            title="Zwift integration coming soon">
            <span className="text-base">⚡</span> Send to Zwift
          </button>
          <button
            onClick={() => { if (onSave) onSave({ name, blocks, intensityMode, ftpPct, powerLow, powerHigh, hrPct, hrLow, hrHigh, totalMin, tss: autoTSS }); else onClose() }}
            className="flex-1 py-2 rounded-full text-sm font-semibold"
            style={{ backgroundColor: 'var(--color-header)', color: 'var(--color-accent)' }}>
            Save workout
          </button>
        </div>

      </div>
    </div>
  )
}

// ─── Life event modal ─────────────────────────────────────────────────────────

function LifeEventModal({ onClose, onConfirm }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ type: '', name: '', day: '2026-06-02', sleep: 'None', alcohol: 'None', stress: 3, canTrain: 'Yes fully' })
  const score    = lifeLoadScore(form)
  const severity = severityLabel(score)
  const impacts  = trainingImpacts(form, score)

  function chip(label, field, val) {
    const active = form[field] === val
    return (
      <button key={val} onClick={() => setForm(f => ({ ...f, [field]: val }))}
        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
        style={{
          backgroundColor: active ? '#0A1628' : 'rgba(15,31,28,0.05)',
          color:            active ? '#ffffff'  : 'var(--color-text)',
          border:           active ? 'none'     : 'var(--border)',
          fontWeight:       active ? 600        : 400,
        }}>
        {label}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(10,22,40,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 relative"
        style={{ backgroundColor: '#FFFFFF', boxShadow: '0 4px 20px rgba(15,31,28,0.10)' }}>
        <div className="flex items-center gap-2 mb-5">
          {[1,2,3].map(s => (
            <div key={s} className="h-1 flex-1 rounded-full transition-all"
              style={{ backgroundColor: s <= step ? 'var(--color-header)' : 'rgba(15,31,28,0.10)' }} />
          ))}
        </div>
        <button onClick={onClose} className="absolute top-5 right-5 w-7 h-7 rounded-full flex items-center justify-center text-sm"
          style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)' }}>✕</button>

        {step === 1 && <>
          <p className="font-semibold text-base mb-1">Log a life event</p>
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>Step 1 of 3 — What happened?</p>
          <p className="section-title mb-2">Event type</p>
          <div className="flex flex-wrap gap-2 mb-4">{EVENT_TYPES.map(et => chip(et.label, 'type', et.id))}</div>
          <p className="section-title mb-2">Name</p>
          <input className="w-full rounded-xl px-3 py-2.5 text-sm mb-4 outline-none"
            style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.03)' }}
            placeholder="e.g. Wedding weekend, Business trip" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <button className="btn-primary w-full justify-center" disabled={!form.type}
            style={{ opacity: form.type ? 1 : 0.4 }} onClick={() => setStep(2)}>Continue</button>
        </>}

        {step === 2 && <>
          <p className="font-semibold text-base mb-1">Training impact</p>
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>Step 2 of 3 — Help us adjust your plan</p>
          <p className="section-title mb-2">Sleep impact</p>
          <div className="flex gap-2 flex-wrap mb-4">{SLEEP_OPTS.map(o => chip(o, 'sleep', o))}</div>
          <p className="section-title mb-2">Alcohol / nutrition</p>
          <div className="flex gap-2 flex-wrap mb-4">{ALCOHOL_OPTS.map(o => chip(o, 'alcohol', o))}</div>
          <p className="section-title mb-2">Mental stress <span className="ml-2 data-value font-semibold normal-case tracking-normal" style={{ color: 'var(--color-text)' }}>{form.stress}/10</span></p>
          <input type="range" min="1" max="10" step="1" value={form.stress}
            onChange={e => setForm(f => ({ ...f, stress: Number(e.target.value) }))}
            className="w-full mb-4" style={{ accentColor: 'var(--color-header)' }} />
          <p className="section-title mb-2">Can you train?</p>
          <div className="flex gap-2 flex-wrap mb-6">{TRAIN_OPTS.map(o => chip(o, 'canTrain', o))}</div>
          <div className="flex gap-2">
            <button className="btn-ghost flex-1 justify-center" style={{ border: 'var(--border)' }} onClick={() => setStep(1)}>Back</button>
            <button className="btn-primary flex-1 justify-center" onClick={() => setStep(3)}>Calculate impact</button>
          </div>
        </>}

        {step === 3 && <>
          <p className="font-semibold text-base mb-1">Life Load Score</p>
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>Step 3 of 3 — Review training adjustments</p>
          <div className="flex items-center gap-4 mb-2">
            <span className="data-value text-4xl font-semibold">{score}</span>
            <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: severity.bg, color: severity.color }}>{severity.label}</span>
          </div>
          <div className="h-2 rounded-full mb-4" style={{ backgroundColor: 'rgba(15,31,28,0.08)' }}>
            <div className="h-2 rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: severity.color }} />
          </div>
          <p className="section-title mb-2">Training adjustments</p>
          <ul className="space-y-1.5 mb-6">
            {impacts.map((imp, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <span className="mt-0.5 shrink-0" style={{ color: 'var(--color-accent)' }}>✓</span>{imp}
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button className="btn-ghost flex-1 justify-center" style={{ border: 'var(--border)' }} onClick={() => setStep(2)}>Back</button>
            <button className="btn-primary flex-1 justify-center"
              onClick={() => onConfirm({ date: form.day, name: form.name || 'Life event', type: form.type, time: 'TBD' })}>
              Confirm & apply
            </button>
          </div>
        </>}
      </div>
    </div>
  )
}
