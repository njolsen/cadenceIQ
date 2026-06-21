import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import AthleteSection from './sections/athlete/AthleteSection'
import EquipmentSection from './sections/equipment/EquipmentSection'
import AnalyticsSection from './sections/analytics/AnalyticsSection'
import SocialSection from './sections/social/SocialSection'
import { ProfileProvider } from './context/ProfileContext'
import './styles/global.css'

export default function App() {
  return (
    <ProfileProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Navigate to="/athlete" replace />} />
            <Route path="athlete"   element={<AthleteSection />} />
            <Route path="equipment" element={<EquipmentSection />} />
            <Route path="social"    element={<SocialSection />} />
            <Route path="analytics" element={<AnalyticsSection />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProfileProvider>
  )
}
