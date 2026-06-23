import { useRef, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { repository, type BackupData } from '../../data'
import { todayISO } from '../../domain/period'
import { CategoriesScreen } from './CategoriesScreen'

type Status = { kind: 'idle' | 'ok' | 'error'; message?: string }

export function SettingsScreen() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [showCategories, setShowCategories] = useState(false)

  if (showCategories) {
    return <CategoriesScreen onBack={() => setShowCategories(false)} />
  }

  async function handleExport() {
    try {
      const backup = await repository.exportData()
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `financas-backup-${todayISO()}.json`
      a.click()
      URL.revokeObjectURL(url)
      setStatus({ kind: 'ok', message: 'Backup exportado.' })
    } catch {
      setStatus({ kind: 'error', message: 'Falha ao exportar.' })
    }
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text()
      const backup = JSON.parse(text) as BackupData
      await repository.importData(backup)
      setStatus({ kind: 'ok', message: 'Backup restaurado. Recarregando...' })
      // Recarrega para refletir os dados restaurados em todas as telas.
      setTimeout(() => window.location.reload(), 600)
    } catch (err) {
      setStatus({
        kind: 'error',
        message:
          err instanceof Error ? err.message : 'Arquivo inválido.',
      })
    }
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-md px-4 pb-28 pt-6">
      <header className="mb-5">
        <h1 className="text-xl font-bold">Ajustes</h1>
        <p className="text-sm text-muted">Categorias, backup e dados do app</p>
      </header>

      <button onClick={() => setShowCategories(true)} className="mb-4 w-full">
        <Card className="flex items-center justify-between transition active:scale-[0.99]">
          <div className="text-left">
            <p className="text-sm font-semibold">Categorias</p>
            <p className="text-xs text-muted">Criar, editar e remover</p>
          </div>
          <span className="text-muted">›</span>
        </Card>
      </button>

      <Card>
        <p className="text-sm font-semibold">Backup dos dados</p>
        <p className="mt-1 text-xs text-muted">
          Seus dados ficam salvos neste aparelho. Exporte um arquivo para
          guardar ou levar a outro dispositivo. Importar substitui os dados
          atuais.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <Button onClick={handleExport}>⬇️ Exportar backup</Button>
          <Button variant="ghost" onClick={() => fileInput.current?.click()}>
            ⬆️ Importar backup
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleImportFile(file)
              e.target.value = ''
            }}
          />
        </div>

        {status.kind !== 'idle' && (
          <p
            className={`mt-3 text-sm ${
              status.kind === 'ok' ? 'text-brand' : 'text-danger'
            }`}
          >
            {status.message}
          </p>
        )}
      </Card>

      <p className="mt-6 text-center text-xs text-muted">
        Controle de Finanças · dados locais (sem nuvem por enquanto)
      </p>
    </div>
  )
}
