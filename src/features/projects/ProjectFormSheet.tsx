import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { parseToCents } from '../../domain/money'
import type { NewProject } from '../../data'

interface ProjectFormSheetProps {
  onSubmit: (input: NewProject) => Promise<unknown>
  onClose: () => void
}

const ICONS = ['🏍️', '🚗', '🏠', '✈️', '💻', '🎸', '🛠️', '🎯', '💍', '🐶']
const COLORS = [
  '#22c55e',
  '#3b82f6',
  '#f97316',
  '#ec4899',
  '#8b5cf6',
  '#eab308',
  '#ef4444',
  '#14b8a6',
]

/** Bottom-sheet para criar um novo projeto. */
export function ProjectFormSheet({ onSubmit, onClose }: ProjectFormSheetProps) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(ICONS[0])
  const [color, setColor] = useState(COLORS[0])
  const [notes, setNotes] = useState('')
  const [target, setTarget] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Dê um nome ao projeto.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        icon,
        color,
        notes: notes.trim(),
        targetCents: target ? parseToCents(target) : null,
      })
      onClose()
    } catch {
      setError('Não foi possível salvar.')
      setSubmitting(false)
    }
  }

  return (
    <Sheet title="Novo projeto" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label className="block text-xs text-muted">Nome</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Honda Biz C100 — bizonhenta"
          className="mb-3 w-full rounded-xl border border-border bg-bg px-4 py-3 outline-none focus:border-brand"
        />

        <label className="block text-xs text-muted">Ícone</label>
        <div className="mb-3 flex flex-wrap gap-2">
          {ICONS.map((ic) => (
            <button
              type="button"
              key={ic}
              onClick={() => setIcon(ic)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition ${
                icon === ic ? 'bg-surface-2 ring-2 ring-brand' : 'bg-surface-2'
              }`}
            >
              {ic}
            </button>
          ))}
        </div>

        <label className="block text-xs text-muted">Cor</label>
        <div className="mb-3 flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`h-8 w-8 rounded-full transition ${
                color === c ? 'ring-2 ring-text ring-offset-2 ring-offset-surface' : ''
              }`}
            />
          ))}
        </div>

        <label className="block text-xs text-muted">Observações (opcional)</label>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Modelo, ano, placa..."
          className="mb-3 w-full rounded-xl border border-border bg-bg px-4 py-3 outline-none focus:border-brand"
        />

        <label className="block text-xs text-muted">
          Meta de orçamento (opcional, R$)
        </label>
        <input
          inputMode="decimal"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Ex.: 1500,00"
          className="mb-4 w-full rounded-xl border border-border bg-bg px-4 py-3 outline-none focus:border-brand"
        />

        {error && <p className="mb-3 text-sm text-danger">{error}</p>}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? 'Criando...' : 'Criar projeto'}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
