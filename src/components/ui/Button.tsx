import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: Variant
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand text-bg font-semibold hover:brightness-110 active:brightness-95',
  ghost:
    'bg-surface-2 text-text hover:bg-border active:brightness-95',
  danger: 'bg-transparent text-danger hover:bg-danger/10',
}

/** Botão padrão com variantes e estados de toque amigáveis ao mobile. */
export function Button({
  children,
  variant = 'primary',
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
