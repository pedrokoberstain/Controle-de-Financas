import type { Card, FixedExpense } from '../domain/types'

type SeedFixed = Pick<FixedExpense, 'name' | 'amountCents' | 'dueDay'>
type SeedCard = Pick<Card, 'name' | 'dueDay'>

/** Contas fixas iniciais (informadas pelo usuário). */
export const DEFAULT_FIXED_EXPENSES: SeedFixed[] = [
  { name: 'Tiger 800', amountCents: 126292, dueDay: 21 },
  { name: 'VIVO', amountCents: 4700, dueDay: 18 },
  { name: 'Netflix', amountCents: 2090, dueDay: 15 },
  { name: 'YouTube', amountCents: 1690, dueDay: 28 },
  { name: 'Spotify', amountCents: 2390, dueDay: 13 },
  { name: 'Abastecimento', amountCents: 8000, dueDay: null },
]

/** Cartões iniciais (fatura você lança a cada mês). */
export const DEFAULT_CARDS: SeedCard[] = [
  { name: 'Inter', dueDay: null },
  { name: 'Mercado Pago', dueDay: null },
]
