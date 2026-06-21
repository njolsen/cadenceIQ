import { useState } from 'react'

const DISTANCES = [
  'Sprint tri', 'Olympic tri', '70.3 Half-Iron', 'Full Ironman',
  'Gran fondo', 'Century', 'Road race', 'Criterium', 'Other',
]

const PRIORITIES = ['A race', 'B race', 'C race / training race']

const EMPTY_RACE = {
  name: '', date: '', distance: '', priority: 'A race', goal: '', location: '',
}

export default function SeasonSetupModal({ onClose, onConfirm }) {
  const [step, setStep] = useState(1)
  const [season, setSeason] = useState({ start: '', end: '' })
  const [races, setRaces] = useState([{ ...EMPTY_RACE }])

  function updateRace(i, field, val) {
    setRaces(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  }

  function addRace() {
    setRaces(prev => [...prev, { ...EMPTY_RACE }])
  }

  function removeRace(i) {
    setRaces(prev => prev.filter((_, idx) => idx !== i))
  }

  const canProceedStep1 = season.start && season.end
  const canConfirm = races.some(r => r.name && r.date)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(10,22,40,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 relative max-h-[85vh] flex flex-col"
        style={{ backgroundColor: '#FFFFFF', boxShadow: '0 8px 40px rgba(15,31,28,0.16)' }}
      >
        {/* Step bar */}
        <div className="flex items-center gap-2 mb-5 shrink-0">
          {[1, 2].map(s => (
            <div
              key={s}
              className="h-1 flex-1 rounded-full transition-all"
              style={{ backgroundColor: s <= step ? '#0A1628' : 'rgba(15,31,28,0.10)' }}
            />
          ))}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-7 h-7 rounded-full flex items-center justify-center text-sm"
          style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)' }}
        >✕</button>

        {/* ── Step 1: Season dates ── */}
        {step === 1 && (
          <>
            <p className="font-semibold text-base mb-0.5">Set up your season</p>
            <p className="text-xs mb-5" style={{ color: 'var(--color-text-muted)' }}>
              Step 1 of 2 — Season window
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div>
                <p className="section-title mb-2">Season start</p>
                <input
                  type="date"
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.03)', fontFamily: 'var(--font-data)' }}
                  value={season.start}
                  onChange={e => setSeason(s => ({ ...s, start: e.target.value }))}
                />
              </div>
              <div>
                <p className="section-title mb-2">Season end</p>
                <input
                  type="date"
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.03)', fontFamily: 'var(--font-data)' }}
                  value={season.end}
                  onChange={e => setSeason(s => ({ ...s, end: e.target.value }))}
                />
              </div>
            </div>

            <button
              className="btn-primary w-full justify-center"
              disabled={!canProceedStep1}
              style={{ opacity: canProceedStep1 ? 1 : 0.4 }}
              onClick={() => setStep(2)}
            >
              Continue to race calendar
            </button>
          </>
        )}

        {/* ── Step 2: Race calendar ── */}
        {step === 2 && (
          <>
            <p className="font-semibold text-base mb-0.5">Race calendar</p>
            <p className="text-xs mb-4 shrink-0" style={{ color: 'var(--color-text-muted)' }}>
              Step 2 of 2 — Add your target races
            </p>

            {/* Scrollable race list */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
              {races.map((race, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.02)' }}
                >
                  {/* Race header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                      Race {i + 1}
                    </span>
                    {races.length > 1 && (
                      <button
                        onClick={() => removeRace(i)}
                        className="text-xs px-2 py-0.5 rounded-full transition-colors"
                        style={{ color: '#C94444', backgroundColor: 'rgba(232,85,85,0.08)' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {/* Name + Date */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="section-title mb-1.5">Race name</p>
                        <input
                          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                          style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.04)' }}
                          placeholder="e.g. 70.3 Austin"
                          value={race.name}
                          onChange={e => updateRace(i, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <p className="section-title mb-1.5">Race date</p>
                        <input
                          type="date"
                          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                          style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.04)', fontFamily: 'var(--font-data)' }}
                          value={race.date}
                          onChange={e => updateRace(i, 'date', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Distance + Priority */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="section-title mb-1.5">Distance / format</p>
                        <select
                          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                          style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.04)' }}
                          value={race.distance}
                          onChange={e => updateRace(i, 'distance', e.target.value)}
                        >
                          <option value="">Select…</option>
                          {DISTANCES.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="section-title mb-1.5">Priority</p>
                        <select
                          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                          style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.04)' }}
                          value={race.priority}
                          onChange={e => updateRace(i, 'priority', e.target.value)}
                        >
                          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Goal + Location */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="section-title mb-1.5">Goal <span className="normal-case font-normal tracking-normal">(optional)</span></p>
                        <input
                          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                          style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.04)' }}
                          placeholder="e.g. Sub 4:30, Top 10 AG"
                          value={race.goal}
                          onChange={e => updateRace(i, 'goal', e.target.value)}
                        />
                      </div>
                      <div>
                        <p className="section-title mb-1.5">Location <span className="normal-case font-normal tracking-normal">(optional)</span></p>
                        <input
                          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                          style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.04)' }}
                          placeholder="e.g. Austin, TX"
                          value={race.location}
                          onChange={e => updateRace(i, 'location', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addRace}
                className="w-full rounded-xl py-2.5 text-sm font-medium transition-colors"
                style={{
                  border: '0.5px dashed var(--color-border)',
                  color: 'var(--color-text-muted)',
                  backgroundColor: 'transparent',
                }}
              >
                + Add another race
              </button>
            </div>

            {/* Footer */}
            <div className="flex gap-2 shrink-0">
              <button
                className="btn-ghost flex-1 justify-center"
                style={{ border: 'var(--border)' }}
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                className="btn-primary flex-1 justify-center"
                disabled={!canConfirm}
                style={{ opacity: canConfirm ? 1 : 0.4 }}
                onClick={() => onConfirm({ season, races: races.filter(r => r.name && r.date) })}
              >
                Save season
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
