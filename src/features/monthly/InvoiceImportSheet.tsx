import { useMemo, useRef, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { formatBRL } from '../../domain/money'
import { parseInvoice } from '../../domain/parseInvoice'

interface InvoiceImportSheetProps {
  /** Recebe o total apurado (centavos) para preencher a fatura. */
  onImport: (totalCents: number) => void
  onClose: () => void
}

const PLACEHOLDER = `Cole a fatura ou suba o CSV do banco, ex.:

12/06  IFOOD              R$ 45,90
15/06  AMAZON BR 3x       99,99
18/06  POSTO SHELL        80,00`

/**
 * Importa uma fatura de cartão (texto colado ou CSV): extrai os itens,
 * soma o total e permite usar esse total como valor da fatura do mês.
 */
export function InvoiceImportSheet({
  onImport,
  onClose,
}: InvoiceImportSheetProps) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [text, setText] = useState('')

  const parsed = useMemo(
    () => (text.trim() ? parseInvoice(text) : { items: [], totalCents: 0 }),
    [text],
  )

  async function handleFile(file: File) {
    setText(await file.text())
  }

  return (
    <Sheet
      title="Importar fatura"
      subtitle="Cole o texto da fatura ou suba o CSV do banco. O total é somado automaticamente."
      onClose={onClose}
    >
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={6}
        className="mb-2 w-full resize-none rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none focus:border-brand"
      />

      <button
        onClick={() => fileInput.current?.click()}
        className="mb-4 text-xs text-brand"
      >
        ou subir arquivo (CSV/TXT)
      </button>
      <input
        ref={fileInput}
        type="file"
        accept=".csv,.txt,text/csv,text/plain"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ''
        }}
      />

      {parsed.items.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-xs text-muted">
            <span>
              {parsed.items.length}{' '}
              {parsed.items.length === 1 ? 'item' : 'itens'}
            </span>
            <span className="font-semibold text-text">
              {formatBRL(parsed.totalCents)}
            </span>
          </div>
          <ul className="flex max-h-56 flex-col gap-1 overflow-y-auto">
            {parsed.items.map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-xl border border-border bg-bg p-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{item.description}</p>
                  {item.date && (
                    <p className="text-xs text-muted">{item.date}</p>
                  )}
                </div>
                <span
                  className={`shrink-0 text-sm font-semibold ${
                    item.amountCents < 0 ? 'text-brand' : ''
                  }`}
                >
                  {formatBRL(item.amountCents)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="ghost" className="flex-1" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          className="flex-1"
          onClick={() => onImport(parsed.totalCents)}
          disabled={parsed.items.length === 0}
        >
          Usar total {parsed.items.length > 0 && formatBRL(parsed.totalCents)}
        </Button>
      </div>
    </Sheet>
  )
}
