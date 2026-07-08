import { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useProfile, computeZones } from '../../context/ProfileContext'
import Avatar from '../Avatar'

const NAV_ITEMS = [
  { to: '/athlete',   label: 'Athlete' },
  { to: '/social',    label: 'Social' },
  { to: '/equipment', label: 'My Garage' },
]

// ─── Profile Drawer ────────────────────────────────────────────────────────────

function ProfileModal({ onClose }) {
  const { profile, updateProfile } = useProfile()
  const [form, setForm] = useState({
    firstName: profile.firstName,
    lastName:  profile.lastName,
    location:  profile.location,
    ftp:       profile.ftp,
    weight:    profile.weight,
    zones:     profile.zones,
  })

  function patch(key, val) {
    setForm(prev => {
      const next = { ...prev, [key]: val }
      if (key === 'ftp') next.zones = computeZones(Number(val) || prev.ftp)
      return next
    })
  }

  function resetZones() {
    setForm(prev => ({ ...prev, zones: computeZones(Number(prev.ftp) || 360) }))
  }

  function patchZone(id, field, val) {
    setForm(prev => ({
      ...prev,
      zones: prev.zones.map(z => z.id === id ? { ...z, [field]: val === '' ? '' : Number(val) } : z),
    }))
  }

  function handleSave() {
    updateProfile({ ...form, ftp: Number(form.ftp) || 360, weight: Number(form.weight) || 0 })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end"
      style={{ backgroundColor: 'rgba(10,22,40,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="h-full flex flex-col"
        style={{
          width: 420,
          backgroundColor: '#FFFFFF',
          boxShadow: '-12px 0 48px rgba(0,0,0,0.18)',
        }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 shrink-0" style={{ borderBottom: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-base">Profile</h2>
            <button onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
              style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)' }}>
              ✕
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Avatar
              firstName={profile.firstName} lastName={profile.lastName} avatarUrl={profile.avatarUrl}
              size={56}
              onChange={url => updateProfile({ avatarUrl: url })}
            />
            <div>
              <p className="font-semibold text-sm">{profile.firstName} {profile.lastName}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{profile.location}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Click photo to change</p>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

          {/* Personal */}
          <section>
            <p className="section-title mb-3">Personal</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--color-text-muted)' }}>First Name</label>
                  <input className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                    style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.03)' }}
                    value={form.firstName}
                    onChange={e => patch('firstName', e.target.value)} />
                </div>
                <div>
                  <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--color-text-muted)' }}>Last Name</label>
                  <input className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                    style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.03)' }}
                    value={form.lastName}
                    onChange={e => patch('lastName', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--color-text-muted)' }}>Location</label>
                <input className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.03)' }}
                  placeholder="City, State"
                  value={form.location}
                  onChange={e => patch('location', e.target.value)} />
              </div>
            </div>
          </section>

          {/* Performance */}
          <section>
            <p className="section-title mb-3">Performance</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--color-text-muted)' }}>FTP</label>
                <div className="flex items-center gap-1.5">
                  <input type="number" min="50" max="600"
                    className="data-value w-full rounded-xl px-3 py-2 text-sm outline-none"
                    style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.03)' }}
                    value={form.ftp}
                    onChange={e => patch('ftp', e.target.value)} />
                  <span className="text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>W</span>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--color-text-muted)' }}>Weight</label>
                <div className="flex items-center gap-1.5">
                  <input type="number" min="30" max="200"
                    className="data-value w-full rounded-xl px-3 py-2 text-sm outline-none"
                    style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.03)' }}
                    value={form.weight}
                    onChange={e => patch('weight', e.target.value)} />
                  <span className="text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>kg</span>
                </div>
              </div>
            </div>
          </section>

          {/* Training Zones */}
          <section>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="section-title">Training Zones</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  Auto-set from {form.ftp}W FTP · manually adjustable
                </p>
              </div>
              <button onClick={resetZones}
                className="text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 mt-0.5"
                style={{ backgroundColor: 'rgba(15,31,28,0.05)', color: 'var(--color-text-muted)', border: 'var(--border)' }}>
                Reset to FTP
              </button>
            </div>

            <div className="space-y-1.5">
              {form.zones.map(z => (
                <div key={z.id}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                  style={{ backgroundColor: 'rgba(15,31,28,0.02)', border: 'var(--border)' }}>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: z.color }} />
                  <span className="text-xs font-bold w-5 shrink-0">{z.name}</span>
                  <span className="text-xs flex-1 truncate" style={{ color: 'var(--color-text-muted)' }}>{z.label}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <input type="number"
                      className="data-value text-[11px] w-14 rounded-lg px-1.5 py-1 outline-none text-center"
                      style={{ border: 'var(--border)', backgroundColor: '#FFFFFF' }}
                      value={z.low}
                      onChange={e => patchZone(z.id, 'low', e.target.value)} />
                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>–</span>
                    {z.high !== null ? (
                      <input type="number"
                        className="data-value text-[11px] w-14 rounded-lg px-1.5 py-1 outline-none text-center"
                        style={{ border: 'var(--border)', backgroundColor: '#FFFFFF' }}
                        value={z.high}
                        onChange={e => patchZone(z.id, 'high', e.target.value)} />
                    ) : (
                      <span className="data-value text-[11px] w-14 text-center" style={{ color: 'var(--color-text-muted)' }}>max</span>
                    )}
                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>W</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 shrink-0" style={{ borderTop: 'var(--border)' }}>
          <button onClick={handleSave} className="btn-primary w-full justify-center">
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Settings Modal ────────────────────────────────────────────────────────────

function SettingsModal({ onClose }) {
  const { garminStatus, handleGarminConnect, handleGarminDisconnect } = useProfile()
  const [showGarminForm, setShowGarminForm] = useState(false)
  const [garminUser, setGarminUser]         = useState('')
  const [garminPass, setGarminPass]         = useState('')
  const [connecting, setConnecting]         = useState(false)
  const [garminError, setGarminError]       = useState(null)

  async function doConnect(e) {
    e.preventDefault()
    if (!garminUser || !garminPass) return
    setConnecting(true)
    setGarminError(null)
    try {
      await handleGarminConnect(garminUser, garminPass)
      setShowGarminForm(false)
      setGarminUser('')
      setGarminPass('')
    } catch (err) {
      setGarminError(err.message || 'Login failed — check your credentials')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(10,22,40,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-sm rounded-2xl"
        style={{ backgroundColor: '#FFFFFF', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: 'var(--border)' }}>
          <h2 className="font-semibold text-base">Settings</h2>
          <button onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
            style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)' }}>
            ✕
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <p className="section-title">Wearables</p>

          {/* Whoop */}
          <div className="rounded-2xl p-4"
            style={{ border: 'var(--border)', backgroundColor: 'rgba(0,200,150,0.03)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: 'rgba(0,200,150,0.10)' }}>
                💚
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Whoop</p>
                <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Connected · synced 6:42 am</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0"
                style={{ backgroundColor: 'rgba(0,200,150,0.10)', border: '0.5px solid rgba(0,200,150,0.25)', color: '#00A87E' }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: '#00C896' }} />
                Live
              </div>
            </div>
          </div>

          {/* Garmin */}
          <div className="rounded-2xl p-4"
            style={{ border: 'var(--border)', backgroundColor: 'rgba(26,111,216,0.03)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: 'rgba(26,111,216,0.10)' }}>
                ⌚
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Garmin Connect</p>
                <p className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                  {garminStatus.connected
                    ? `Connected as ${garminStatus.name ?? 'Athlete'}`
                    : 'Not connected'}
                </p>
              </div>
              {garminStatus.connected ? (
                <button onClick={handleGarminDisconnect}
                  className="text-[11px] px-2.5 py-1 rounded-full font-medium shrink-0 transition-opacity hover:opacity-70"
                  style={{ backgroundColor: 'rgba(232,85,85,0.08)', color: '#C94444', border: '0.5px solid rgba(232,85,85,0.2)' }}>
                  Disconnect
                </button>
              ) : (
                <button onClick={() => setShowGarminForm(v => !v)}
                  className="text-[11px] px-2.5 py-1 rounded-full font-medium shrink-0 transition-colors"
                  style={{ backgroundColor: 'rgba(26,111,216,0.10)', color: '#1B6FD8', border: '0.5px solid rgba(26,111,216,0.25)' }}>
                  {showGarminForm ? 'Cancel' : 'Connect'}
                </button>
              )}
            </div>

            {showGarminForm && !garminStatus.connected && (
              <form onSubmit={doConnect} className="mt-3 space-y-2.5 pt-3"
                style={{ borderTop: 'var(--border)' }}>
                <input type="email" required autoComplete="username"
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.03)' }}
                  placeholder="Garmin email"
                  value={garminUser}
                  onChange={e => setGarminUser(e.target.value)} />
                <input type="password" required autoComplete="current-password"
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.03)' }}
                  placeholder="Password"
                  value={garminPass}
                  onChange={e => setGarminPass(e.target.value)} />
                {garminError && (
                  <p className="text-xs rounded-xl px-3 py-2"
                    style={{ backgroundColor: 'rgba(232,85,85,0.08)', color: '#C94444' }}>
                    {garminError}
                  </p>
                )}
                <button type="submit"
                  disabled={connecting || !garminUser || !garminPass}
                  className="btn-primary w-full justify-center"
                  style={{ opacity: connecting || !garminUser || !garminPass ? 0.5 : 1 }}>
                  {connecting ? 'Connecting…' : 'Connect Garmin'}
                </button>
              </form>
            )}
          </div>

          {/* Oura Ring */}
          <div className="rounded-2xl p-4"
            style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.02)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: 'rgba(15,31,28,0.06)' }}>
                💍
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Oura Ring</p>
                <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Not connected</p>
              </div>
              <button
                className="text-[11px] px-2.5 py-1 rounded-full font-medium shrink-0 transition-colors"
                style={{ backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)', border: 'var(--border)' }}>
                Connect
              </button>
            </div>
          </div>

          <p className="section-title pt-1">Training Platforms</p>

          {/* Zwift */}
          <div className="rounded-2xl p-4"
            style={{ border: 'var(--border)', backgroundColor: 'rgba(252,103,25,0.02)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: 'rgba(252,103,25,0.10)' }}>
                🚴
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Zwift</p>
                <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  Connected · local .fit files
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0"
                style={{ backgroundColor: 'rgba(252,103,25,0.10)', border: '0.5px solid rgba(252,103,25,0.25)', color: '#D94F00' }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: '#FC6719' }} />
                Live
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── TopNav ────────────────────────────────────────────────────────────────────

export default function TopNav() {
  const { profile } = useProfile()
  const [dropOpen, setDropOpen] = useState(false)
  const [panel, setPanel]       = useState(null) // 'profile' | 'settings' | null
  const dropRef = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function openPanel(name) {
    setPanel(name)
    setDropOpen(false)
  }

  return (
    <header
      className="h-14 px-6 flex items-center justify-between shrink-0"
      style={{ backgroundColor: '#0A1628', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}
    >
      {/* Wordmark */}
      <div className="flex items-center gap-2.5">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="5.5" cy="15.5" r="3.5" stroke="#FF2D78" strokeWidth="1.75"/>
          <circle cx="18.5" cy="15.5" r="3.5" stroke="#FF2D78" strokeWidth="1.75"/>
          <path d="M5.5 15.5L9 8h5l2 4" stroke="#FF2D78" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 8l4.5 7.5" stroke="#FF2D78" strokeWidth="1.75" strokeLinecap="round"/>
          <path d="M13 8h3.5L18.5 15.5" stroke="#FF2D78" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="14" cy="5.5" r="1.5" stroke="#FF2D78" strokeWidth="1.5"/>
        </svg>
        <span className="font-bold tracking-tight text-base" style={{ color: '#FF2D78' }}>
          CadenceIQ
        </span>
      </div>

      {/* Primary nav */}
      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive ? '' : 'text-white hover:bg-white/10'
              }`
            }
            style={({ isActive }) =>
              isActive ? { backgroundColor: '#FFFFFF', color: '#0A1628' } : {}
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Avatar + dropdown */}
      <div ref={dropRef} className="relative flex items-center">
        <button
          onClick={() => setDropOpen(o => !o)}
          className="rounded-full transition-all"
          style={{ outline: dropOpen ? '2px solid rgba(255,255,255,0.50)' : '2px solid rgba(255,255,255,0.22)', outlineOffset: 2 }}
        >
          <Avatar
            firstName={profile.firstName} lastName={profile.lastName} avatarUrl={profile.avatarUrl}
            size={32} bgColor="rgba(255,255,255,0.18)"
          />
        </button>

        {dropOpen && (
          <div
            className="absolute right-0 top-10 w-36 rounded-2xl overflow-hidden z-50 py-1"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              border: 'var(--border)',
            }}
          >
            {[
              { label: 'Profile',  key: 'profile'  },
              { label: 'Settings', key: 'settings' },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => openPanel(item.key)}
                className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-black/[0.04]"
                style={{ color: 'var(--color-text)' }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {panel === 'profile'  && <ProfileModal  onClose={() => setPanel(null)} />}
      {panel === 'settings' && <SettingsModal onClose={() => setPanel(null)} />}
    </header>
  )
}
