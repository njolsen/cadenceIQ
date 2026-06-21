# Cadence IQ — Project Context

## What this is

Cadence IQ is a cycling training platform for self-coached athletes. It combines training load analytics, equipment management, and structured planning in a single clean interface. The design philosophy is "data-dense but calm" — numbers everywhere, visual noise nowhere.

---

## Philosophy

- **Data-first, not dashboard-first.** Every screen earns its data density. No padding screens out with decorative charts.
- **Monospace for numbers, sans-serif for prose.** DM Mono carries all metrics, TSS, watts, durations. DM Sans handles labels and prose.
- **Dark header, light body.** The `#0F1F1C` nav anchors the app. Sections live on `#F0F2F1` with white `#FFFFFF` cards.
- **Thin borders, generous radius.** `0.5px` borders, `border-radius` up to `24px`. Nothing feels boxy.
- **Accent means action or positive signal.** `#00C896` is used for active states, positive trends, and CTAs only. Not decoration.

---

## Design System

| Token             | Value       | Use                                  |
|-------------------|-------------|--------------------------------------|
| `--color-header`  | `#0F1F1C`   | Top nav background                   |
| `--color-accent`  | `#00C896`   | Active tabs, CTAs, positive trends   |
| `--color-accent-dim` | `#00A87E` | Hover state for accent               |
| `--color-bg`      | `#F0F2F1`   | Page background                      |
| `--color-surface` | `#FFFFFF`   | Cards, surfaces                      |
| `--color-text`    | `#1A2421`   | Body copy                            |
| `--color-text-muted` | `#637068` | Labels, secondary info               |
| `--color-border`  | `rgba(15,31,28,0.12)` | All borders          |
| `--font-ui`       | DM Sans     | All UI labels, headings, prose       |
| `--font-data`     | DM Mono     | All numeric values, durations, watts |
| `--border`        | `0.5px solid var(--color-border)` | Standard border |

### Tailwind extensions
Custom colors are aliased in `tailwind.config.js`: `header`, `accent`, `accent-dim`, `bg`, `surface`, `ink`, `muted`.

### Reusable CSS classes (in `global.css`)
- `.card` — white surface, 24px radius, 0.5px border, soft shadow
- `.btn-primary` — accent fill, rounded-full, dark text
- `.btn-ghost` — transparent, muted text, hover fill
- `.tab-pill` / `.tab-pill.active` — pill tab pattern used on every sub-nav
- `.data-value` — applies `font-family: DM Mono`
- `.section-title` — uppercase, tracked, tiny, muted — used above card metrics

---

## File Structure

```
src/
  components/
    layout/
      TopNav.jsx        — dark header, NavLink-based primary nav, avatar slot
      AppShell.jsx      — flex column, TopNav + <Outlet>
  sections/
    athlete/
      AthleteSection.jsx  — page shell, sub-tabs (Overview/Calendar/Load/Performance/Health)
      WeeklyCalendar.jsx  — 7-column week grid, TSS bars, intensity color coding
    equipment/
      EquipmentSection.jsx — Bikes / Component Wear / Bike Fit / Power Gains tabs
  styles/
    tokens.css          — CSS custom properties for all design tokens
    global.css          — Tailwind directives + component layer utilities
App.jsx                 — BrowserRouter + route tree
main.jsx                — ReactDOM root mount
```

---

## Routing

```
/             → redirect to /athlete
/athlete      → AthleteSection
/equipment    → EquipmentSection
/plans        → Placeholder
/analytics    → Placeholder
```

React Router v6 with nested routes under `AppShell` as the layout route.

---

## Feature List & Build Sequence

### Phase 1 — Foundation (done)
- [x] Vite + React scaffold
- [x] Tailwind CSS v3 + design token layer
- [x] TopNav with active state
- [x] AppShell layout
- [x] Athlete section — Overview KPIs, Weekly Calendar
- [x] Equipment section — Bikes list, Component Wear table

### Phase 2 — Athlete depth
- [ ] Training Load chart (CTL/ATL/TSB over time, line chart)
- [ ] Workout detail modal / drawer — clicking a calendar day expands structured workout
- [ ] Performance tab — power curve, W/kg, VO2 proxy
- [ ] Health tab — HRV trend, resting HR, sleep (manual or Garmin/Wahoo import)

### Phase 3 — Equipment depth
- [ ] Bike Fit — position history, saddle height, reach, stack, notes
- [ ] Power Gains — before/after FTP tests tied to equipment changes
- [ ] Service reminders — push/email when component hits threshold

### Phase 4 — Plans
- [ ] Training plan builder — drag week blocks, set periodization
- [ ] Workout library — structured intervals, endurance templates
- [ ] Calendar sync — export to Garmin/TrainerRoad/Wahoo

### Phase 5 — Analytics
- [ ] Season overview — annual TSS, race results log
- [ ] Peer benchmarking — anonymous W/kg distribution by category
- [ ] Export — PDF training summary

---

## Data model (placeholder, no backend yet)

All data is currently hardcoded in component files. When a backend is added:
- Athlete profile: `{ id, name, category, ftp, weight }`
- Workouts: `{ date, type, tss, duration, normalizedPower, intensityFactor }`
- Bikes: `{ id, name, type, components[] }`
- Components: `{ bikeId, part, installMiles, limitMiles }`

---

## Dev notes

- Node 16 constraint: using Vite 4 (not 5+). Do not upgrade Vite without first upgrading Node.
- Tailwind v3 (not v4) for the same reason.
- Google Fonts loaded via `<link>` in `index.html` — no npm font packages needed.
- CSS custom properties in `tokens.css` are the source of truth. Tailwind extensions in `tailwind.config.js` mirror them but do not replace them — inline `style={{ color: 'var(--color-accent)' }}` is fine and often cleaner for one-offs.
- Border trick: Tailwind's `border` utility adds `1px` — use `style={{ border: 'var(--border)' }}` or the `.card` / `.border-thin` classes for `0.5px` borders.
