import type { Category } from '../domain/types'

/** Categorias iniciais sugeridas para um novo usuário. */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Alimentação', icon: '🍽️', color: '#f97316' },
  { id: 'cat-transport', name: 'Transporte', icon: '🚗', color: '#3b82f6' },
  { id: 'cat-home', name: 'Casa', icon: '🏠', color: '#8b5cf6' },
  { id: 'cat-leisure', name: 'Lazer', icon: '🎮', color: '#ec4899' },
  { id: 'cat-health', name: 'Saúde', icon: '💊', color: '#10b981' },
  { id: 'cat-market', name: 'Mercado', icon: '🛒', color: '#eab308' },
  { id: 'cat-bills', name: 'Contas', icon: '🧾', color: '#64748b' },
  { id: 'cat-income', name: 'Receita', icon: '💰', color: '#22c55e' },
  { id: 'cat-other', name: 'Outros', icon: '📦', color: '#94a3b8' },
]
