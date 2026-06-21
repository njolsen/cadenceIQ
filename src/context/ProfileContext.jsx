import { createContext, useContext, useState, useEffect } from 'react'
import { getGarminStatus, connectGarmin as connectGarminApi, disconnectGarmin as disconnectGarminApi } from '../services/activitiesApi'

const ProfileContext = createContext(null)

export function computeZones(ftp) {
  const f = Number(ftp) || 360
  return [
    { id: 'z1', name: 'Z1', label: 'Active Recovery', low: 0,                        high: Math.round(f * 0.55), color: '#4CC9A0' },
    { id: 'z2', name: 'Z2', label: 'Endurance',       low: Math.round(f * 0.55) + 1, high: Math.round(f * 0.75), color: '#00C896' },
    { id: 'z3', name: 'Z3', label: 'Tempo',           low: Math.round(f * 0.75) + 1, high: Math.round(f * 0.90), color: '#F5A623' },
    { id: 'z4', name: 'Z4', label: 'Threshold',       low: Math.round(f * 0.90) + 1, high: Math.round(f * 1.05), color: '#E8803A' },
    { id: 'z5', name: 'Z5', label: 'VO2 Max',         low: Math.round(f * 1.05) + 1, high: Math.round(f * 1.20), color: '#E85555' },
    { id: 'z6', name: 'Z6', label: 'Anaerobic',       low: Math.round(f * 1.20) + 1, high: Math.round(f * 1.50), color: '#C93030' },
    { id: 'z7', name: 'Z7', label: 'Neuromuscular',   low: Math.round(f * 1.50) + 1, high: null,                 color: '#8B1010' },
  ]
}

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState({
    firstName: 'Nick',
    lastName:  'Olsen',
    location:  'Austin, TX',
    ftp:       360,
    weight:    75,
    zones:     computeZones(360),
    avatarUrl: null,
  })
  const [garminStatus, setGarminStatus] = useState({ connected: false })

  useEffect(() => {
    getGarminStatus().then(setGarminStatus).catch(() => {})
  }, [])

  function updateProfile(patch) {
    setProfile(prev => {
      const next = { ...prev, ...patch }
      // Auto-recalculate zones when FTP changes, unless caller provided explicit zones
      if (patch.ftp !== undefined && patch.zones === undefined) {
        next.zones = computeZones(patch.ftp)
      }
      return next
    })
  }

  async function handleGarminConnect(username, password) {
    const result = await connectGarminApi(username, password)
    setGarminStatus({ connected: true, name: result.name, connectedAt: result.connectedAt })
    return result
  }

  async function handleGarminDisconnect() {
    await disconnectGarminApi().catch(() => {})
    setGarminStatus({ connected: false })
  }

  return (
    <ProfileContext.Provider value={{
      profile, updateProfile,
      garminStatus, handleGarminConnect, handleGarminDisconnect,
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  return useContext(ProfileContext)
}
