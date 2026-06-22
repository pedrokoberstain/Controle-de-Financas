interface ProgressBarProps {
  /** Fração preenchida, 0..1 (valores acima de 1 saturam). */
  value: number
  /** Cor do preenchimento (CSS color). Default: cor de marca. */
  color?: string
}

/** Barra de progresso simples para uso do orçamento. */
export function ProgressBar({ value, color }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value * 100))
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{
          width: `${pct}%`,
          backgroundColor: color ?? 'var(--color-brand)',
        }}
      />
    </div>
  )
}
