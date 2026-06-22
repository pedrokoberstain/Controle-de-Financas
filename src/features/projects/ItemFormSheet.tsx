import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { formatAmount, parseToCents } from '../../domain/money'
import type { ProjectItem, ProjectItemStatus } from '../../domain/types'
import type { NewProjectItem } from '../../data'

interface ItemFormSheetProps {
  projectId: string
  /** Quando presente, o formulário entra em modo de edição. */
  item?: ProjectItem
  onSubmit: (input: NewProjectItem) => Promise<unknown>
  onClose: () => void
}

/** Bottom-sheet para adicionar ou editar um item de projeto. */
export function ItemFormSheet({
  projectId,
  item,
  onSubmit,
  onClose,
}: ItemFormSheetProps) {
  const editing = Boolean(item)
  const [name, setName] = useState(item?.name ?? '')
  const [amount, setAmount] = useState(
    item ? formatAmount(item.amountCents) : '',
  )
  const [status, setStatus] = useState<ProjectItemStatus>(
    item?.status ?? 'pending',
  )
  const [url, setUrl] = useState(item?.url ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amountCents = parseToCents(amount)
    if (!name.trim() || amountCents === null) {
      setError('Preencha nome e valor.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        projectId,
        name: name.trim(),
        amountCents,
        status,
        url: url.trim() || null,
        store: item?.store ?? null,
      })
      onClose()
    } catch {
      setError('Não foi possível salvar.')
      setSubmitting(false)
    }
  }

  return (
    <Sheet title={editing ? 'Editar item' : 'Adicionar item'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1">
          {(['pending', 'bought'] as const).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setStatus(s)}
              className={`min-h-10 rounded-lg text-sm font-medium transition ${
                status === s
                  ? s === 'bought'
                    ? 'bg-brand/20 text-brand'
                    : 'bg-warning/20 text-warning'
                  : 'text-muted'
              }`}
            >
              {s === 'bought' ? '✅ Comprado' : '🕓 Pendente'}
            </button>
          ))}
        </div>

        <label className="block text-xs text-muted">Item</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Carburador (Titan 125)"
          className="mb-3 w-full rounded-xl border border-border bg-bg px-4 py-3 outline-none focus:border-brand"
        />

        <label className="block text-xs text-muted">Valor (R$)</label>
        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0,00"
          className="mb-3 w-full rounded-xl border border-border bg-bg px-4 py-3 text-xl font-semibold outline-none focus:border-brand"
        />

        <label className="block text-xs text-muted">Link (opcional)</label>
        <input
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
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
            {submitting ? 'Salvando...' : editing ? 'Salvar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
