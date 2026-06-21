// ─── Scoring ──────────────────────────────────────────────────────────────────

const WEEK_SESSIONS = [
  { type: 'Endurance', intensity: 'low',  adjusted: false },
  { type: 'Intervals', intensity: 'high', adjusted: false },
  { type: 'Recovery',  intensity: 'low',  adjusted: true  },
  { type: 'Threshold', intensity: 'med',  adjusted: false },
  { type: null,        intensity: null,   adjusted: false },
  { type: 'Long Ride', intensity: 'med',  adjusted: false },
  { type: 'Easy Spin', intensity: 'low',  adjusted: false },
]

const SESSION_CONTRIBUTION = {
  Endurance:  { cardio: 40, lungs: 30, legs: 20, neuro:  0 },
  Intervals:  { cardio: 50, lungs:  0, legs: 40, neuro: 50 },
  Threshold:  { cardio: 35, lungs: 20, legs: 45, neuro:  0 },
  'Long Ride':{ cardio: 40, lungs: 30, legs: 30, neuro:  0 },
  'Easy Spin':{ cardio: 20, lungs: 15, legs: 10, neuro:  0 },
  'Brick Run':{ cardio: 20, lungs:  0, legs: 30, neuro:  0 },
}

const CAPS = { cardio: 200, lungs: 130, legs: 180, neuro: 100 }

function computeScores(sessions) {
  const raw = { cardio: 0, lungs: 0, legs: 0, neuro: 0 }
  sessions.forEach(s => {
    if (!s.type || s.adjusted) return
    const contrib = SESSION_CONTRIBUTION[s.type]
    if (!contrib) return
    Object.keys(raw).forEach(k => { raw[k] += contrib[k] ?? 0 })
  })
  const result = {}
  Object.keys(raw).forEach(k => {
    result[k] = Math.min(Math.round((raw[k] / CAPS[k]) * 100), 100)
  })
  return result
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TrainingAdaptation() {
  const scores          = computeScores(WEEK_SESSIONS)
  const enduranceBase   = Math.round((scores.cardio + scores.lungs) / 2)
  const muscularFitness = Math.round((scores.legs  + scores.neuro)  / 2)

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: '#0F1F1C',
        border: '0.5px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="px-5 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
        <p className="data-value text-[11px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Training adaptation — last 14 days
        </p>
      </div>
      <div className="px-5 py-5 space-y-5">
        <SummaryBar label="Endurance Base"   sub="Cardiovascular + respiratory fitness" pct={enduranceBase}   color="#00C896" />
        <SummaryBar label="Muscular Fitness" sub="Leg strength + neuromuscular power"   pct={muscularFitness} color="#1B6FD8" />
      </div>
    </div>
  )
}

// ─── Summary bar ─────────────────────────────────────────────────────────────

function SummaryBar({ label, sub, pct, color }) {
  return (
    <div>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="data-value text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>{label}</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{sub}</p>
        </div>
        <span className="data-value text-2xl font-bold leading-none ml-4" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
        />
      </div>
    </div>
  )
}
