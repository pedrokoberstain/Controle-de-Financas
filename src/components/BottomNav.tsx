export type Tab = 'home' | 'month' | 'projects' | 'assistant' | 'settings'

interface BottomNavProps {
  active: Tab
  onChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Início', icon: '🏠' },
  { id: 'month', label: 'Mês', icon: '📅' },
  { id: 'projects', label: 'Projetos', icon: '🎯' },
  { id: 'assistant', label: 'IA', icon: '🤖' },
  { id: 'settings', label: 'Ajustes', icon: '⚙️' },
]

/** Barra de navegação inferior, padrão mobile. */
export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur">
      <div
        className="mx-auto flex max-w-md"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {TABS.map((tab) => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs transition ${
                isActive ? 'text-brand' : 'text-muted'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
