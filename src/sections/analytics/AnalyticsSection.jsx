import { useState } from 'react'
import TrainingAdaptation from '../athlete/TrainingAdaptation'

const TABS = ['Load', 'Performance', 'Health']

export default function AnalyticsSection({ embedded = false }) {
  const [activeTab, setActiveTab] = useState('Load')

  return (
    <div className={embedded ? '' : 'max-w-6xl mx-auto px-6 py-6'}>
      {/* Page header — hidden when embedded as a sub-tab */}
      {!embedded && (
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="section-title mb-1">Analytics</p>
            <h1 className="text-2xl font-semibold">Training Insights</h1>
          </div>
        </div>
      )}

      {/* Sub-tabs */}
      <div
        className="flex items-center gap-0.5 px-1.5 py-1.5 rounded-2xl mb-6 w-fit"
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

      {activeTab === 'Load'        && <LoadTab />}
      {activeTab === 'Performance' && <PerformanceTab />}
      {activeTab === 'Health'      && <HealthTab />}
    </div>
  )
}

// ─── Load tab ─────────────────────────────────────────────────────────────────

function LoadTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'CTL', value: '72', unit: 'Fitness', trend: '+3', pos: true },
          { label: 'ATL', value: '88', unit: 'Fatigue', trend: '+12', pos: true },
          { label: 'TSB', value: '−16', unit: 'Form',   trend: '−9', pos: false },
        ].map(({ label, value, unit, trend, pos }) => (
          <div key={label} className="card p-5">
            <p className="section-title mb-3">{unit}</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-semibold data-value">{value}</span>
              <span
                className="text-xs font-medium data-value px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: pos ? 'rgba(0,200,150,0.12)' : 'rgba(232,85,85,0.10)',
                  color: pos ? 'var(--color-accent-dim)' : '#C94444',
                }}
              >
                {trend}
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      <ChartPlaceholder label="Fitness curve" sublabel="CTL / ATL / TSB over the season" />
      <ChartPlaceholder label="Weekly TSS history" sublabel="Rolling 16-week load history" />
    </div>
  )
}

// ─── Performance tab ──────────────────────────────────────────────────────────

function PerformanceTab() {
  return (
    <div className="space-y-4">
      <div className="card p-5 flex items-end gap-4">
        <div>
          <p className="section-title mb-3">Watts</p>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-semibold data-value">278</span>
            <span
              className="text-xs font-medium data-value px-2 py-0.5 rounded-full mb-1"
              style={{ backgroundColor: 'rgba(0,200,150,0.12)', color: 'var(--color-accent-dim)' }}
            >
              +4
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>FTP · Last tested Apr 14</p>
        </div>
        <div className="ml-6 pb-1">
          <p className="section-title mb-1">W/kg</p>
          <span className="data-value text-xl font-semibold">4.1</span>
        </div>
      </div>

      <TrainingAdaptation />
      <ChartPlaceholder label="Power profile" sublabel="90-day peak power curve by duration" />

      <div className="card p-5">
        <p className="section-title mb-4">Race results</p>
        <div
          className="rounded-xl p-8 text-center"
          style={{ backgroundColor: 'rgba(15,31,28,0.03)', border: 'var(--border)' }}
        >
          <p className="text-sm font-medium mb-1">No race results yet</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Results will appear here after you log a race finish.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Health tab ───────────────────────────────────────────────────────────────

function HealthTab() {
  return (
    <div className="space-y-4">
      <ChartPlaceholder label="HRV trend" sublabel="Daily heart rate variability — connect a wearable to populate" />
      <ChartPlaceholder label="Sleep quality" sublabel="Duration and quality score — connect a wearable to populate" />
    </div>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function ChartPlaceholder({ label, sublabel }) {
  return (
    <div className="card p-5">
      <p className="section-title mb-1">{label}</p>
      <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>{sublabel}</p>
      <div
        className="rounded-xl h-36 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(15,31,28,0.03)', border: '0.5px dashed var(--color-border)' }}
      >
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Chart coming soon</p>
      </div>
    </div>
  )
}
