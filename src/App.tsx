import { useState } from 'react'
import { BottomNav, type Tab } from './components/BottomNav'
import { Dashboard } from './features/dashboard/Dashboard'
import { MonthlyScreen } from './features/monthly/MonthlyScreen'
import { ProjectsScreen } from './features/projects/ProjectsScreen'

export default function App() {
  const [tab, setTab] = useState<Tab>('home')

  return (
    <>
      {tab === 'home' && <Dashboard />}
      {tab === 'month' && <MonthlyScreen />}
      {tab === 'projects' && <ProjectsScreen />}
      <BottomNav active={tab} onChange={setTab} />
    </>
  )
}
