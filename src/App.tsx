import { useState } from 'react'
import { BottomNav, type Tab } from './components/BottomNav'
import { AssistantScreen } from './features/assistant/AssistantScreen'
import { Dashboard } from './features/dashboard/Dashboard'
import { MonthlyScreen } from './features/monthly/MonthlyScreen'
import { ProjectsScreen } from './features/projects/ProjectsScreen'
import { SettingsScreen } from './features/settings/SettingsScreen'

export default function App() {
  const [tab, setTab] = useState<Tab>('home')

  return (
    <>
      {tab === 'home' && <Dashboard />}
      {tab === 'month' && <MonthlyScreen />}
      {tab === 'projects' && <ProjectsScreen />}
      {tab === 'assistant' && <AssistantScreen />}
      {tab === 'settings' && <SettingsScreen />}
      <BottomNav active={tab} onChange={setTab} />
    </>
  )
}
