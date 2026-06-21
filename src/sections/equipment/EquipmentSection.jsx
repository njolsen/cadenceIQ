import { useState } from 'react'

// ─── Data ────────────────────────────────────────────────────────────────────

const INITIAL_BIKES = [
  { id: 'speedmax', name: 'Canyon Speedmax', type: 'TT',      color: '#1B6FD8', miles: 2100 },
  { id: 'emonda',   name: 'Trek Emonda',     type: 'Road',    color: '#E85555', miles: 890  },
  { id: 'zwift',    name: 'Zwift / Trainer', type: 'Trainer', color: '#00C896', miles: 6200 },
]

const OUTDOOR_TYPES = ['Road', 'TT', 'Gravel Bike', 'Mountain Bike']
const INDOOR_TYPES  = ['Trainer', 'Stationary Bike']
const TYPE_COLORS   = { Road: '#E85555', TT: '#1B6FD8', 'Gravel Bike': '#C07A3A', 'Mountain Bike': '#7C5CBF', Trainer: '#00C896', 'Stationary Bike': '#F5A623' }
const TYPE_PLACEHOLDERS = {
  Road: 'e.g. Trek Emonda SL 6',
  TT: 'e.g. Canyon Speedmax CF SLX',
  'Gravel Bike': 'e.g. Specialized Diverge STR',
  'Mountain Bike': 'e.g. Santa Cruz Tallboy',
  Trainer: 'e.g. Wahoo KICKR Core',
  'Stationary Bike': 'e.g. Peloton Bike+',
}
const TYPE_DESCS = {
  Road: 'Pavement, endurance, or criterium',
  TT: 'Time trial or triathlon aero setup',
  'Gravel Bike': 'Mixed terrain, bikepacking, or gravel racing',
  'Mountain Bike': 'Trail, XC, or enduro off-road',
  Trainer: 'Smart or wheel-on trainer',
  'Stationary Bike': 'Peloton, spin bike, or stationary',
}

// status: 'good' | 'soon' | 'now' | 'overdue'
const INITIAL_COMPONENTS = {
  speedmax: [
    {
      name: 'Chain',
      miles: 1820, limit: 2500,
      status: 'good',
      note: 'Chain is at 73% wear. Measured at 0.5% stretch. Replace at 2,500 mi or 0.75% stretch to protect the cassette.',
    },
    {
      name: 'Rear Tyre (GP5000 TT)',
      miles: 2100, limit: 2500,
      status: 'soon',
      note: 'Getting close to replacement threshold. Inspect tread depth — if centre knob is worn flat, replace before next race.',
    },
    {
      name: 'Front Tyre (GP5000 TT)',
      miles: 2100, limit: 3000,
      status: 'good',
      note: 'Front tyre wears slower than rear. Still well within range. Check for cuts or embedded debris after each outdoor ride.',
    },
    {
      name: 'Brake Pads',
      miles: 2100, limit: 5000,
      status: 'good',
      note: 'Rim brake pads are at ~42% wear. Inspect pad groove depth — replace when grooves disappear.',
    },
    {
      name: 'Bar Tape',
      miles: 2100, limit: 2000,
      status: 'overdue',
      note: 'Bar tape is overdue for replacement. Worn tape affects grip and can introduce small handling imprecision — worth doing before a race block.',
    },
    {
      name: 'Cassette (11-28)',
      miles: 4200, limit: 5000,
      status: 'soon',
      note: 'Cassette is typically replaced every 2nd chain. This is the second chain cycle — inspect for shark-fin tooth profile.',
    },
  ],
  emonda: [
    {
      name: 'Chain',
      miles: 3800, limit: 2500,
      status: 'overdue',
      note: 'Chain is past its replacement interval. At this point, a stretched chain accelerates cassette and chainring wear significantly. Replace immediately.',
    },
    {
      name: 'Rear Tyre (GP5000)',
      miles: 2900, limit: 3000,
      status: 'now',
      note: 'At 97% of replacement limit. Do not use for an outdoor ride without inspecting for cuts. Replace before next road session.',
    },
    {
      name: 'Front Tyre (GP5000)',
      miles: 2900, limit: 3500,
      status: 'good',
      note: 'Front tyre is in good condition. Continue monitoring.',
    },
    {
      name: 'Brake Pads (Rim)',
      miles: 3800, limit: 5000,
      status: 'good',
      note: 'Pad wear is normal. Re-inspect after any wet weather riding.',
    },
    {
      name: 'Handlebar Tape',
      miles: 1200, limit: 2000,
      status: 'good',
      note: 'Bar tape in good condition.',
    },
    {
      name: 'Cables & Housing',
      miles: 3800, limit: 4000,
      status: 'soon',
      note: 'Shift and brake cable housing should be replaced annually or at ~4,000 mi. Inspect for fraying at clamp points.',
    },
  ],
  zwift: [
    {
      name: 'Trainer Tyre (Tacx)',
      miles: 6200, limit: 5000,
      status: 'overdue',
      note: 'Trainer tyres wear differently from road tyres — flat spots and rubber debris are signs of wear. This one is past limit; replace to prevent slippage during ERG sessions.',
    },
    {
      name: 'Drive Belt',
      miles: 6200, limit: 8000,
      status: 'good',
      note: 'KICKR drive belt is within range. Listen for clicking or resistance variation — early signs of belt wear.',
    },
    {
      name: 'Cassette (11-28)',
      miles: 4100, limit: 5000,
      status: 'good',
      note: 'Trainer cassette is separate from road cassettes. It sees consistent ERG load — inspect for wear at common resistance zones.',
    },
    {
      name: 'Trainer Chain',
      miles: 2200, limit: 2500,
      status: 'soon',
      note: 'Dedicated trainer chain approaching replacement. Indoor riding is consistent load so chains wear predictably here — plan replacement within 200 mi.',
    },
  ],
}

function getDefaultComponents(type) {
  const chain = { name: 'Chain', miles: 0, limit: 2500, status: 'good', note: 'Replace at 2,500 mi or when stretch reaches 0.75%.' }

  if (type === 'TT') return [
    chain,
    { name: 'Rear Tyre (TT)',  miles: 0, limit: 2500, status: 'good', note: 'Inspect tread depth regularly. Replace if centre knob is worn flat before a race.' },
    { name: 'Front Tyre (TT)', miles: 0, limit: 3000, status: 'good', note: 'Front tyre wears slower. Check for cuts or embedded debris after each outdoor ride.' },
    { name: 'Bar Tape',        miles: 0, limit: 2000, status: 'good', note: 'Replace when grip feels worn or tape is fraying at the ends.' },
    { name: 'Cassette',        miles: 0, limit: 5000, status: 'good', note: 'Typically replaced every 2nd chain cycle. Inspect for shark-fin tooth profile.' },
  ]

  if (type === 'Gravel Bike') return [
    chain,
    { name: 'Rear Tyre',    miles: 0, limit: 3000, status: 'good', note: 'Gravel tyre wear depends on surface. Check tread depth and sidewalls after long rides.' },
    { name: 'Front Tyre',   miles: 0, limit: 3500, status: 'good', note: 'Front tyre wears slower on mixed terrain. Check sealant monthly if running tubeless.' },
    { name: 'Bar Tape',     miles: 0, limit: 2000, status: 'good', note: 'Gravel riding is hard on tape. Replace when grip or cushioning feels worn.' },
    { name: 'Brake Pads',   miles: 0, limit: 4000, status: 'good', note: 'Disc or rim — inspect pad material thickness after wet or muddy rides.' },
    { name: 'Cassette',     miles: 0, limit: 5000, status: 'good', note: 'Typically replaced every 2nd chain cycle.' },
  ]

  if (type === 'Mountain Bike') return [
    chain,
    { name: 'Rear Tyre',          miles: 0, limit: 2000, status: 'good', note: 'MTB tyres wear faster. Inspect knob depth after muddy rides.' },
    { name: 'Front Tyre',         miles: 0, limit: 2500, status: 'good', note: 'Check sealant levels monthly if running tubeless.' },
    { name: 'Brake Pads (disc)',   miles: 0, limit: 3000, status: 'good', note: 'Replace when pad material is under 1 mm. Bed in new pads before trail riding.' },
    { name: 'Cassette',           miles: 0, limit: 4000, status: 'good', note: 'Inspect for shark-fin tooth profile at each chain swap.' },
    { name: 'Fork Service',        miles: 0, limit: 5000, status: 'good', note: 'Lower leg service every 50 hrs, full rebuild every 200 hrs.' },
  ]

  if (type === 'Trainer') return [
    { name: 'Trainer Tyre',    miles: 0, limit: 5000, status: 'good', note: 'Trainer tyres wear faster indoors. Replace when flat spots appear or grip diminishes.' },
    { name: 'Drive Belt',      miles: 0, limit: 8000, status: 'good', note: 'Listen for clicking or resistance variation — early signs of belt wear.' },
    { name: 'Cassette',        miles: 0, limit: 5000, status: 'good', note: 'Trainer cassette sees consistent ERG load. Inspect at each chain swap.' },
    { name: 'Trainer Chain',   miles: 0, limit: 2500, status: 'good', note: 'Dedicated trainer chain. Indoor riding is consistent load — chains wear predictably.' },
  ]

  if (type === 'Stationary Bike') return [
    { name: 'Drive Belt',         miles: 0, limit: 10000, status: 'good', note: 'Replace if you hear squeaking or feel inconsistent resistance.' },
    { name: 'Brake / Resistance', miles: 0, limit: 5000,  status: 'good', note: 'Friction felt or magnetic resistance system. Service if resistance feels uneven.' },
    { name: 'Pedals',             miles: 0, limit: 8000,  status: 'good', note: 'Check pedal bearings annually. Replace if you feel play or grinding.' },
  ]

  // Road (default)
  return [
    chain,
    { name: 'Rear Tyre',  miles: 0, limit: 3000, status: 'good', note: 'Inspect tread depth — replace when centre knob is worn flat.' },
    { name: 'Front Tyre', miles: 0, limit: 3500, status: 'good', note: 'Front tyre wears slower than rear. Check for cuts after rides.' },
    { name: 'Bar Tape',   miles: 0, limit: 2000, status: 'good', note: 'Replace when grip feels worn or tape is fraying.' },
    { name: 'Brake Pads', miles: 0, limit: 5000, status: 'good', note: 'Inspect pad groove depth — replace when grooves disappear.' },
    { name: 'Cassette',   miles: 0, limit: 5000, status: 'good', note: 'Typically replaced every 2nd chain cycle.' },
  ]
}

// Bike Fit data per bike
// Current athlete profile — weight drives refit logic
const ATHLETE_PROFILE = { weightKg: 76 }

function isRefitNeeded(fit) {
  if (!fit?.fitDate) return false
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const olderThan6Mo = new Date(fit.fitDate) < sixMonthsAgo
  const weightDrift  = Math.abs(ATHLETE_PROFILE.weightKg - fit.fitWeightKg) >= 2
  return olderThan6Mo && weightDrift
}

const FIT_DATA = {
  speedmax: {
    lastFit:      'March 2025',
    fitDate:      '2025-03-01',
    fitWeightKg:  76,
    fitter:       'Retül @ Trek Store',
    measurements: [
      { label: 'Saddle Height',  value: '710 mm' },
      { label: 'Saddle Setback', value: '−12 mm' },
      { label: 'Stack',          value: '548 mm' },
      { label: 'Reach',          value: '392 mm' },
      { label: 'Pad Width',      value: '84 mm' },
      { label: 'Pad Offset',     value: '+5 mm' },
    ],
  },
  emonda: {
    lastFit:      'November 2023',
    fitDate:      '2023-11-01',
    fitWeightKg:  72,
    fitter:       'Retül @ Trek Store',
    measurements: [
      { label: 'Saddle Height',  value: '725 mm', flagged: true },
      { label: 'Saddle Setback', value: '+8 mm',  flagged: true },
      { label: 'Stack',          value: '530 mm' },
      { label: 'Reach',          value: '380 mm' },
      { label: 'Bar Width',      value: '42 cm' },
      { label: 'Cleat Float',    value: '4.5°' },
    ],
  },
}


// ─── Status config ────────────────────────────────────────────────────────────

const STATUS = {
  good:    { bar: '#00C896', label: 'Good',         badge: { bg: 'rgba(0,200,150,0.10)',  text: '#00A87E' } },
  soon:    { bar: '#F5A623', label: 'Replace soon',  badge: { bg: 'rgba(245,166,35,0.12)', text: '#B87000' } },
  now:     { bar: '#E85555', label: 'Replace now',   badge: { bg: 'rgba(232,85,85,0.12)',  text: '#C02020' } },
  overdue: { bar: '#C02020', label: 'Overdue',       badge: { bg: 'rgba(192,32,32,0.14)', text: '#900000' } },
}

// ─── Add bike modal ───────────────────────────────────────────────────────────

function AddBikeModal({ group, onAdd, onClose }) {
  const types = group === 'Outdoor' ? OUTDOOR_TYPES : INDOOR_TYPES
  const [type,  setType]  = useState(types[0])
  const [name,  setName]  = useState('')
  const [miles, setMiles] = useState('')

  function handleAdd() {
    onAdd({ id: `bike-${Date.now()}`, name: name.trim(), type, color: TYPE_COLORS[type], miles: Number(miles) || 0 })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(10,22,40,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-2xl p-6"
        style={{ backgroundColor: '#FFFFFF', boxShadow: '0 8px 40px rgba(15,31,28,0.16)' }}>

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="section-title mb-0.5">Add to {group}</p>
            <p className="font-semibold text-base">New bike</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5"
            style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: '#637068' }}>✕</button>
        </div>

        {/* Bike type */}
        <div className="mb-4">
          <p className="section-title mb-2">Bike type</p>
          <div className="space-y-2">
            {types.map(t => (
              <button key={t} onClick={() => setType(t)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                style={{
                  border: `0.5px solid ${type === t ? '#0A1628' : 'rgba(15,31,28,0.10)'}`,
                  backgroundColor: type === t ? 'rgba(10,22,40,0.04)' : 'transparent',
                }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: TYPE_COLORS[t] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: '#1A2421' }}>{t}</p>
                  <p className="text-[11px]" style={{ color: '#637068' }}>{TYPE_DESCS[t]}</p>
                </div>
                {type === t && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                    <circle cx="8" cy="8" r="7.25" stroke="#0A1628" strokeWidth="1.5"/>
                    <path d="M5 8l2 2 4-4" stroke="#0A1628" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="mb-4">
          <p className="section-title mb-2">Bike name</p>
          <input
            autoFocus
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{ border: '0.5px solid rgba(15,31,28,0.12)', backgroundColor: 'rgba(15,31,28,0.03)', color: '#1A2421' }}
            placeholder={TYPE_PLACEHOLDERS[type]}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && name.trim()) handleAdd() }}
          />
        </div>

        {/* Starting mileage */}
        <div className="mb-6">
          <p className="section-title mb-2">Starting mileage <span className="normal-case font-normal tracking-normal">(optional)</span></p>
          <input type="number" min="0"
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none data-value"
            style={{ border: '0.5px solid rgba(15,31,28,0.12)', backgroundColor: 'rgba(15,31,28,0.03)', color: '#1A2421' }}
            placeholder="0"
            value={miles}
            onChange={e => setMiles(e.target.value)}
          />
        </div>

        <button onClick={handleAdd} disabled={!name.trim()}
          className="btn-primary w-full justify-center"
          style={{ opacity: name.trim() ? 1 : 0.4 }}>
          Add to garage
        </button>
      </div>
    </div>
  )
}

// ─── Component accordion ──────────────────────────────────────────────────────

function deriveStatus(miles, limit) {
  const pct = miles / limit
  if (pct >= 1)    return 'overdue'
  if (pct >= 0.9)  return 'now'
  if (pct >= 0.75) return 'soon'
  return 'good'
}

function ComponentAccordion({ bikes, setBikes, components, setComponents }) {
  const [openBike,    setOpenBike]    = useState(null)
  const [openComp,    setOpenComp]    = useState(null)
  const [edits,       setEdits]       = useState({})
  const [addingTo,    setAddingTo]    = useState(null)
  const [confirmDel,  setConfirmDel]  = useState(null)
  const [fitEdits,    setFitEdits]    = useState({})
  const [fitEditOpen, setFitEditOpen] = useState(null)

  function getComps(bikeId) {
    return (components[bikeId] ?? []).map(c => {
      const e = edits[`${bikeId}:${c.name}`]
      if (!e) return c
      const miles = Number(e.miles), limit = Number(e.limit)
      return { ...c, miles, limit, lastReplaced: e.lastReplaced, status: deriveStatus(miles, limit) }
    })
  }

  function toggleComp(bikeId, comp) {
    const key = `${bikeId}:${comp.name}`
    if (!edits[key]) {
      setEdits(prev => ({ ...prev, [key]: { miles: comp.miles, limit: comp.limit, lastReplaced: comp.lastReplaced ?? '' } }))
    }
    setOpenComp(prev => (prev === key ? null : key))
  }

  function patch(bikeId, name, field, val) {
    const key = `${bikeId}:${name}`
    setEdits(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } }))
  }

  function markReplaced(bikeId, name) {
    const key = `${bikeId}:${name}`
    setEdits(prev => ({ ...prev, [key]: { ...prev[key], miles: 0, lastReplaced: new Date().toISOString().slice(0, 10) } }))
  }

  const groups = [
    { label: 'Outdoor', bikes: bikes.filter(b => OUTDOOR_TYPES.includes(b.type)) },
    { label: 'Indoor',  bikes: bikes.filter(b => INDOOR_TYPES.includes(b.type))  },
  ]

  function handleAddBike(newBike) {
    setBikes(prev => [...prev, newBike])
    setComponents(prev => ({ ...prev, [newBike.id]: getDefaultComponents(newBike.type) }))
    setOpenBike(newBike.id)
  }

  function handleDeleteBike(bikeId) {
    setBikes(prev => prev.filter(b => b.id !== bikeId))
    setComponents(prev => { const next = { ...prev }; delete next[bikeId]; return next })
    if (openBike === bikeId) setOpenBike(null)
    setConfirmDel(null)
  }

  function getMergedFit(bikeId) {
    const base = FIT_DATA[bikeId]
    const e    = fitEdits[bikeId] ?? {}
    if (!base && !Object.keys(e).length) return null
    return {
      fitDate:      e.fitDate     ?? base?.fitDate      ?? '',
      lastFit:      e.lastFit     ?? base?.lastFit      ?? '',
      fitWeightKg:  base?.fitWeightKg,
      fitter:       e.fitter      ?? base?.fitter       ?? '',
      email:        e.email       ?? '',
      phone:        e.phone       ?? '',
      pdfName:      e.pdfName     ?? '',
      measurements: base?.measurements ?? [],
    }
  }

  function patchFit(bikeId, updates) {
    setFitEdits(prev => ({ ...prev, [bikeId]: { ...prev[bikeId], ...updates } }))
  }

  return (
    <>
    {addingTo && (
      <AddBikeModal
        group={addingTo}
        onAdd={handleAddBike}
        onClose={() => setAddingTo(null)}
      />
    )}
    <div className="space-y-5">
      {groups.map(group => (
        <div key={group.label}>
          <div className="flex items-center justify-between mb-2">
            <p className="section-title">{group.label}</p>
            <button
              onClick={() => setAddingTo(group.label)}
              className="text-[11px] font-medium px-3 py-1 rounded-full transition-colors"
              style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: '#637068' }}
            >
              + Add
            </button>
          </div>
          <div className="space-y-2">
          {group.bikes.map(bike => {
        const comps      = getComps(bike.id)
        const isOpen     = openBike === bike.id
        const hasUrgent  = comps.some(c => c.status === 'overdue' || c.status === 'now')
        const hasSoon    = comps.some(c => c.status === 'soon')
        const issueCount = comps.filter(c => c.status !== 'good').length
        const healthColor = hasUrgent ? '#E85555' : hasSoon ? '#F5A623' : '#00C896'
        const fit        = OUTDOOR_TYPES.includes(bike.type) ? getMergedFit(bike.id) : null
        const refit      = isRefitNeeded(fit)

        return (
          <div key={bike.id} className="group rounded-2xl overflow-hidden"
            style={{ border: '0.5px solid rgba(15,31,28,0.12)', boxShadow: '0 1px 6px rgba(15,31,28,0.07)' }}>

            {/* ── Bike header ── */}
            <div
              onClick={() => { setOpenBike(isOpen ? null : bike.id); setOpenComp(null); setConfirmDel(null) }}
              className="w-full px-5 py-4 flex items-center gap-3 cursor-pointer transition-colors"
              style={{ backgroundColor: isOpen ? '#0A1628' : '#FFFFFF' }}
            >
              <span className="font-semibold text-sm" style={{ color: isOpen ? '#FFFFFF' : '#1A2421' }}>
                {bike.name}
              </span>
              <span className="data-value text-[11px]" style={{ color: isOpen ? 'rgba(255,255,255,0.40)' : '#637068' }}>
                {bike.type} · {bike.miles.toLocaleString()} mi
              </span>

              <div className="flex-1" />

              <div className="flex items-center gap-1.5">
                <span className="text-[11px]" style={{ color: isOpen ? 'rgba(255,255,255,0.45)' : healthColor }}>
                  {issueCount > 0 ? `${issueCount} item${issueCount > 1 ? 's' : ''} need attention` : 'All good'}
                </span>
              </div>

              {/* Delete — two-step inline confirm */}
              {confirmDel === bike.id ? (
                <div className="flex items-center gap-1.5 ml-3" onClick={e => e.stopPropagation()}>
                  <span className="text-[11px]" style={{ color: isOpen ? 'rgba(255,255,255,0.55)' : '#637068' }}>Remove?</span>
                  <button
                    onClick={() => handleDeleteBike(bike.id)}
                    className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: '#E85555', color: '#FFFFFF' }}
                  >Yes</button>
                  <button
                    onClick={() => setConfirmDel(null)}
                    className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: isOpen ? 'rgba(255,255,255,0.15)' : 'rgba(15,31,28,0.10)', color: isOpen ? '#FFFFFF' : '#1A2421' }}
                  >No</button>
                </div>
              ) : (
                <button
                  onClick={e => { e.stopPropagation(); setConfirmDel(bike.id) }}
                  className="ml-3 w-6 h-6 rounded-full flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: 'rgba(232,85,85,0.12)', color: '#E85555' }}
                >
                  <svg width="9" height="10" viewBox="0 0 9 10" fill="none">
                    <path d="M1 2h7M3 2V1h3v1M2 2l.5 6.5h4L7 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}

              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="ml-2 shrink-0 transition-transform"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'none', opacity: 0.4 }}>
                <path d="M1 1l4 4 4-4" stroke={isOpen ? '#fff' : '#1A2421'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* ── Component Wear label ── */}
            {isOpen && (
              <div className="px-5 pt-3.5 pb-2"
                style={{ borderTop: '0.5px solid rgba(15,31,28,0.08)', backgroundColor: '#FFFFFF' }}>
                <p className="section-title">Component Wear</p>
              </div>
            )}

            {/* ── Component rows ── */}
            {isOpen && comps.map(c => {
              const key       = `${bike.id}:${c.name}`
              const s         = STATUS[c.status]
              const pct       = Math.min(Math.round((c.miles / c.limit) * 100), 100)
              const editOpen  = openComp === key
              const e         = edits[key] ?? {}
              const ePct      = Math.min(Math.round((Number(e.miles || c.miles) / Number(e.limit || c.limit)) * 100), 100)
              const eStatus   = STATUS[deriveStatus(Number(e.miles || c.miles), Number(e.limit || c.limit))]

              return (
                <div key={c.name}>
                  {/* Row */}
                  <button
                    onClick={() => toggleComp(bike.id, c)}
                    className="w-full flex items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-black/[0.015]"
                    style={{
                      borderTop: '0.5px solid rgba(15,31,28,0.07)',
                      backgroundColor: editOpen ? 'rgba(15,31,28,0.025)' : 'transparent',
                    }}
                  >
                    {/* Name */}
                    <span className="text-sm font-medium shrink-0" style={{ width: 188, color: '#1A2421' }}>{c.name}</span>

                    {/* Bar */}
                    <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(15,31,28,0.07)' }}>
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: s.bar }} />
                    </div>

                    {/* Pct */}
                    <span className="data-value text-xs shrink-0 text-right" style={{ width: 32, color: s.badge.text }}>{pct}%</span>

                    {/* Badge */}
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0"
                      style={{ backgroundColor: s.badge.bg, color: s.badge.text, minWidth: 72, textAlign: 'center' }}>
                      {s.label}
                    </span>

                    {/* Miles */}
                    <span className="data-value text-[10px] shrink-0 text-right" style={{ width: 100, color: '#637068' }}>
                      {c.miles.toLocaleString()} / {c.limit.toLocaleString()} mi
                    </span>
                  </button>

                  {/* Inline edit panel */}
                  {editOpen && (
                    <div className="px-5 pb-4 pt-3" style={{ borderTop: '0.5px solid rgba(15,31,28,0.06)', backgroundColor: 'rgba(15,31,28,0.025)' }}>
                      <p className="text-xs leading-relaxed mb-3" style={{ color: '#637068' }}>{c.note}</p>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {[['Miles used','miles','number'],['Mile limit','limit','number'],['Last replaced','lastReplaced','date']].map(([label, field, type]) => (
                          <div key={field}>
                            <p className="section-title mb-1.5">{label}</p>
                            <input type={type}
                              className="w-full rounded-xl px-3 py-2 text-sm outline-none data-value"
                              style={{ backgroundColor: '#FFFFFF', border: '0.5px solid rgba(15,31,28,0.12)', color: '#1A2421' }}
                              value={e[field] ?? ''}
                              onChange={ev => patch(bike.id, c.name, field, ev.target.value)} />
                          </div>
                        ))}
                      </div>

                      {/* Live bar */}
                      <div className="h-1.5 rounded-full mb-3" style={{ backgroundColor: 'rgba(15,31,28,0.08)' }}>
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${ePct}%`, backgroundColor: eStatus.bar }} />
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => markReplaced(bike.id, c.name)}
                          className="flex-1 rounded-xl py-2 text-sm font-medium"
                          style={{ backgroundColor: 'rgba(0,200,150,0.10)', color: '#00A87E', border: '0.5px solid rgba(0,200,150,0.25)' }}>
                          Mark as replaced today
                        </button>
                        <button onClick={() => setOpenComp(null)}
                          className="flex-1 rounded-xl py-2 text-sm font-medium"
                          style={{ backgroundColor: '#0A1628', color: '#FFFFFF' }}>
                          Save changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* ── Bike Fit ── */}
            {isOpen && OUTDOOR_TYPES.includes(bike.type) && (
              <div style={{ borderTop: '0.5px solid rgba(15,31,28,0.10)', backgroundColor: '#F4F6F5' }}>
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="section-title">Bike Fit</p>
                    <button
                      onClick={() => setFitEditOpen(fitEditOpen === bike.id ? null : bike.id)}
                      className="text-[11px] px-3 py-1 rounded-full font-medium transition-colors"
                      style={{ backgroundColor: 'rgba(15,31,28,0.07)', color: '#637068' }}
                    >
                      {fitEditOpen === bike.id ? 'Done' : 'Edit'}
                    </button>
                  </div>

                  {fitEditOpen === bike.id ? (
                    /* ── Edit form ── */
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="section-title mb-1.5">Last Fit Date</p>
                          <input
                            type="date"
                            className="w-full rounded-xl px-3 py-2 text-sm outline-none data-value"
                            style={{ backgroundColor: '#FFFFFF', border: '0.5px solid rgba(15,31,28,0.12)', color: '#1A2421' }}
                            value={fitEdits[bike.id]?.fitDate ?? fit?.fitDate ?? ''}
                            onChange={ev => {
                              const iso = ev.target.value
                              const label = iso ? new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''
                              patchFit(bike.id, { fitDate: iso, lastFit: label })
                            }}
                          />
                        </div>
                        <div>
                          <p className="section-title mb-1.5">Fitter Name</p>
                          <input
                            type="text"
                            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                            style={{ backgroundColor: '#FFFFFF', border: '0.5px solid rgba(15,31,28,0.12)', color: '#1A2421' }}
                            placeholder="e.g. Retül @ Trek Store"
                            value={fitEdits[bike.id]?.fitter ?? fit?.fitter ?? ''}
                            onChange={ev => patchFit(bike.id, { fitter: ev.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="section-title mb-1.5">Fitter Email</p>
                          <input
                            type="email"
                            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                            style={{ backgroundColor: '#FFFFFF', border: '0.5px solid rgba(15,31,28,0.12)', color: '#1A2421' }}
                            placeholder="fitter@studio.com"
                            value={fitEdits[bike.id]?.email ?? ''}
                            onChange={ev => patchFit(bike.id, { email: ev.target.value })}
                          />
                        </div>
                        <div>
                          <p className="section-title mb-1.5">Fitter Phone</p>
                          <input
                            type="tel"
                            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                            style={{ backgroundColor: '#FFFFFF', border: '0.5px solid rgba(15,31,28,0.12)', color: '#1A2421' }}
                            placeholder="+1 (512) 555-0100"
                            value={fitEdits[bike.id]?.phone ?? ''}
                            onChange={ev => patchFit(bike.id, { phone: ev.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="section-title mb-1.5">Fit Report</p>
                        <label
                          className="flex items-center gap-3 w-full rounded-xl px-4 py-3 cursor-pointer"
                          style={{ backgroundColor: '#FFFFFF', border: '0.5px solid rgba(15,31,28,0.12)' }}
                        >
                          <svg width="13" height="15" viewBox="0 0 14 16" fill="none" style={{ color: '#637068', flexShrink: 0 }}>
                            <path d="M8 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6M8 1l5 5M8 1v5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="text-sm" style={{ color: fitEdits[bike.id]?.pdfName ? '#1A2421' : '#637068' }}>
                            {fitEdits[bike.id]?.pdfName ?? 'Upload fit report (PDF)…'}
                          </span>
                          <input
                            type="file" accept=".pdf" className="sr-only"
                            onChange={ev => {
                              const file = ev.target.files?.[0]
                              if (file) patchFit(bike.id, { pdfName: file.name })
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    /* ── Read view ── */
                    !fit ? (
                      <p className="text-sm" style={{ color: '#637068' }}>No fit data recorded — click Edit to add.</p>
                    ) : (
                      <div className="space-y-3">
                        {refit && (
                          <div className="rounded-xl px-4 py-3 flex items-start gap-3"
                            style={{ backgroundColor: 'rgba(245,166,35,0.08)', border: '0.5px solid rgba(245,166,35,0.3)' }}>
                            <span className="text-sm mt-0.5">⚠</span>
                            <div>
                              <p className="text-sm font-medium" style={{ color: '#B87000' }}>Refit recommended</p>
                              <p className="text-xs mt-0.5" style={{ color: '#637068' }}>
                                Weight has changed {Math.abs(ATHLETE_PROFILE.weightKg - (fit.fitWeightKg ?? ATHLETE_PROFILE.weightKg))} kg since your {fit.lastFit} fit.
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-x-8 gap-y-2">
                          {fit.lastFit && (
                            <div>
                              <p className="section-title mb-1">Last Fit</p>
                              <p className="text-sm font-semibold">{fit.lastFit}</p>
                            </div>
                          )}
                          {fit.fitter && (
                            <div>
                              <p className="section-title mb-1">Fitter</p>
                              <p className="text-sm font-medium">{fit.fitter}</p>
                            </div>
                          )}
                          {fit.email && (
                            <div>
                              <p className="section-title mb-1">Email</p>
                              <p className="text-sm">{fit.email}</p>
                            </div>
                          )}
                          {fit.phone && (
                            <div>
                              <p className="section-title mb-1">Phone</p>
                              <p className="text-sm">{fit.phone}</p>
                            </div>
                          )}
                        </div>
                        {fit.pdfName && (
                          <div className="inline-flex items-center gap-2 rounded-xl px-3 py-2"
                            style={{ backgroundColor: '#FFFFFF', border: '0.5px solid rgba(15,31,28,0.10)' }}>
                            <svg width="12" height="14" viewBox="0 0 14 16" fill="none" style={{ color: '#00A87E', flexShrink: 0 }}>
                              <path d="M8 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6M8 1l5 5M8 1v5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="text-sm font-medium" style={{ color: '#1A2421' }}>{fit.pdfName}</span>
                          </div>
                        )}
                        {fit.measurements?.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {fit.measurements.map(m => (
                              <div key={m.label} className="rounded-xl px-3 py-2.5"
                                style={{
                                  backgroundColor: (refit && m.flagged) ? 'rgba(245,166,35,0.07)' : '#FFFFFF',
                                  border: (refit && m.flagged) ? '0.5px solid rgba(245,166,35,0.3)' : '0.5px solid rgba(15,31,28,0.10)',
                                }}>
                                <p className="text-[11px] font-medium uppercase tracking-wider mb-1"
                                  style={{ color: (refit && m.flagged) ? '#B87000' : '#637068' }}>
                                  {m.label}{(refit && m.flagged) && ' ⚠'}
                                </p>
                                <p className="data-value text-base font-semibold"
                                  style={{ color: (refit && m.flagged) ? '#B87000' : '#1A2421' }}>
                                  {m.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
          </div>
        </div>
      ))}
    </div>
    </>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

export default function EquipmentSection() {
  const [bikes,      setBikes]      = useState(INITIAL_BIKES)
  const [components, setComponents] = useState(INITIAL_COMPONENTS)

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <p className="section-title mb-1">Equipment</p>
        <h1 className="text-2xl font-semibold mb-1">My Garage</h1>
        <p className="text-sm" style={{ color: '#637068' }}>
          All your bikes in one place — expand any bike to check component wear and fit measurements.
        </p>
      </div>

      <ComponentAccordion
        bikes={bikes}
        setBikes={setBikes}
        components={components}
        setComponents={setComponents}
      />
    </div>
  )
}

