import { env } from '../config/env'
import { LocalStorageRepository } from './localStorageRepository'
import type { FinanceRepository } from './repository'

/**
 * Seleciona a implementação de persistência conforme o ambiente.
 *
 * Hoje só temos o repositório local. Quando o Supabase estiver
 * configurado, criamos um `SupabaseRepository` (mesmo contrato) e o
 * retornamos aqui — a UI não muda em nada.
 */
function createRepository(): FinanceRepository {
  if (env.hasSupabase) {
    // TODO: return new SupabaseRepository(supabase!) quando implementarmos.
    return new LocalStorageRepository()
  }
  return new LocalStorageRepository()
}

export const repository: FinanceRepository = createRepository()

export type {
  FinanceRepository,
  NewTransaction,
  NewProject,
  NewProjectItem,
  NewFixedExpense,
  NewCard,
} from './repository'
