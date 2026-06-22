import type { ReactNode } from 'react'

interface SheetProps {
  title?: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
}

/**
 * Bottom-sheet padrão (modal que sobe de baixo), usado pelos formulários.
 * Cuida do overlay, do fechar ao tocar fora, do "grabber" e do cabeçalho.
 */
export function Sheet({ title, subtitle, onClose, children }: SheetProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-border bg-surface p-5 pb-8"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-surface-2" />
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        {subtitle && <p className="mb-4 mt-1 text-sm text-muted">{subtitle}</p>}
        {children}
      </div>
    </div>
  )
}
