import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import type { Category } from '../../domain/types'
import type { NewCategory } from '../../data'

interface CategoryFormSheetProps {
  category?: Category
  onSubmit: (input: NewCategory) => Promise<unknown>
  onDelete?: () => void
  onClose: () => void
}

const ICONS = [
  '🍽️', '🚗', '🏠', '🎮', '💊', '🛒', '🧾', '💰', '📦', '✈️',
  '🎓', '🐶', '👕', '💻', '🎁', '🏍️', '⛽', '☕', '🍺', '💳',
]
const COLORS = [
  '#f97316', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#eab308',
  '#64748b', '#22c55e', '#ef4444', '#14b8a6', '#94a3b8', '#a855f7',
]

/** Bottom-sheet para criar/editar uma categoria. */
export function CategoryFormSheet({
  category,
  onSubmit,
  onDelete,
  onClose,
}: CategoryFormSheetProps) {
  const editing = Boolean(category)
  const [name, setName] = useState(category?.name ?? '')
  const [icon, setIcon] = useState(category?.icon ?? ICONS[0])
  const [color, setColor] = useState(category?.color ?? COLORS[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Dê um nome à categoria.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), icon, color })
      onClose()
    } catch {
      setError('Não foi possível salvar.')
      setSubmitting(false)
    }
  }

  return (
    <Sheet
      title={editing ? 'Editar categoria' : 'Nova categoria'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <label className="block text-xs text-muted">Nome</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Pet, Academia, Moto..."
          className="mb-3 w-full rounded-xl border border-border bg-bg px-4 py-3 outline-none focus:border-brand"
        />

        <label className="block text-xs text-muted">Ícone</label>
        <div className="mb-3 flex flex-wrap gap-2">
          {ICONS.map((ic) => (
            <button
              type="button"
              key={ic}
              onClick={() => setIcon(ic)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-lg transition ${
                icon === ic ? 'ring-2 ring-brand' : ''
              }`}
            >
              {ic}
            </button>
          ))}
        </div>

        <label className="block text-xs text-muted">Cor</label>
        <div className="mb-4 flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`h-8 w-8 rounded-full transition ${
                color === c
                  ? 'ring-2 ring-text ring-offset-2 ring-offset-surface'
                  : ''
              }`}
            />
          ))}
        </div>

        {error && <p className="mb-3 text-sm text-danger">{error}</p>}

        <div className="flex gap-2">
          {editing && onDelete ? (
            <Button type="button" variant="danger" onClick={onDelete}>
              Excluir
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? 'Salvando...' : editing ? 'Salvar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
