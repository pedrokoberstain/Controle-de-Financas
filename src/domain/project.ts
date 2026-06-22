import type { ProjectItem } from './types'

export interface ProjectTotals {
  /** Soma dos itens já comprados (centavos). */
  spentCents: number
  /** Soma dos itens pendentes (centavos). */
  pendingCents: number
  /** Total geral do projeto: gasto + pendente (centavos). */
  totalCents: number
  /** Quantidade de itens comprados. */
  boughtCount: number
  /** Quantidade de itens pendentes. */
  pendingCount: number
  /** Fração concluída por valor (gasto / total), 0..1. */
  progress: number
}

/** Agrega os totais de um projeto a partir dos seus itens. */
export function computeProjectTotals(items: ProjectItem[]): ProjectTotals {
  let spentCents = 0
  let pendingCents = 0
  let boughtCount = 0
  let pendingCount = 0

  for (const item of items) {
    if (item.status === 'bought') {
      spentCents += item.amountCents
      boughtCount += 1
    } else {
      pendingCents += item.amountCents
      pendingCount += 1
    }
  }

  const totalCents = spentCents + pendingCents
  const progress = totalCents > 0 ? spentCents / totalCents : 0

  return {
    spentCents,
    pendingCents,
    totalCents,
    boughtCount,
    pendingCount,
    progress,
  }
}
