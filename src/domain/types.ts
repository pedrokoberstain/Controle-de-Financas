/**
 * Entidades do domínio.
 *
 * Convenções:
 * - Valores monetários são SEMPRE inteiros em centavos (`amountCents`),
 *   nunca float — evita erros de arredondamento (0.1 + 0.2 !== 0.3).
 * - Datas são strings ISO 8601 (`YYYY-MM-DD` ou ISO completo), para
 *   serializar bem em localStorage e no Postgres/Supabase.
 */

export type TransactionType = 'expense' | 'income'

/** Identificador de período usado nos cálculos e na UI. */
export type PeriodKey = 'day' | 'week' | 'month'

export interface Category {
  id: string
  name: string
  /** Emoji ou ícone curto para exibição. */
  icon: string
  /** Cor em hex para gráficos/realce. */
  color: string
}

export interface Transaction {
  id: string
  type: TransactionType
  /** Valor em centavos, sempre positivo. O sinal vem do `type`. */
  amountCents: number
  description: string
  categoryId: string | null
  /** Data do gasto/receita em ISO (YYYY-MM-DD). */
  date: string
  /** Timestamp de criação em ISO completo. */
  createdAt: string
}

/**
 * Orçamento por período. No MVP usamos um orçamento mensal global; os
 * limites de dia/semana são derivados proporcionalmente quando não há
 * limite explícito.
 */
export interface Budget {
  /** Limite mensal global em centavos. */
  monthlyLimitCents: number
}

export interface CreditCard {
  id: string
  name: string
  /** Limite total do cartão em centavos. */
  limitCents: number
  /** Dia do mês em que a fatura fecha (1-31). */
  closingDay: number
  /** Dia do mês de vencimento da fatura (1-31). */
  dueDay: number
}

/**
 * Conta fixa recorrente (assinatura, financiamento, etc.). Repete todo mês
 * com o mesmo valor e dia de vencimento.
 */
export interface FixedExpense {
  id: string
  name: string
  /** Valor mensal em centavos. */
  amountCents: number
  /** Dia de vencimento (1-31) ou null se não tiver. */
  dueDay: number | null
  /** "YYYY-MM" do mês em que foi marcada como paga; null = não paga. */
  paidMonth: string | null
  createdAt: string
}

/**
 * Cartão de crédito com fatura variável por mês. O usuário lança quanto
 * deve no mês corrente.
 */
export interface Card {
  id: string
  name: string
  /** Limite total do cartão em centavos (0 = não informado). */
  limitCents: number
  /** Dia de vencimento da fatura (1-31) ou null. */
  dueDay: number | null
  /** Valor da fatura lançada, em centavos. */
  billCents: number
  /** "YYYY-MM" a que a fatura lançada se refere; null = nenhuma. */
  billMonth: string | null
  /** "YYYY-MM" em que a fatura foi marcada como paga; null = não paga. */
  paidMonth: string | null
  createdAt: string
}

/**
 * Compra parcelada: lançada uma vez e distribuída por N meses. Aparece
 * como uma parcela nas contas de cada mês dentro do intervalo.
 */
export interface InstallmentPurchase {
  id: string
  name: string
  /** Valor de cada parcela em centavos. */
  installmentCents: number
  /** Número total de parcelas. */
  installments: number
  /** Mês da 1ª parcela, no formato "YYYY-MM". */
  startMonth: string
  /** Dia de vencimento (1-31) ou null. */
  dueDay: number | null
  /** Meses ("YYYY-MM") já marcados como pagos. */
  paidMonths: string[]
  createdAt: string
}

/** Configurações do planejamento mensal. */
export interface MonthlySettings {
  /** Salário/renda mensal em centavos. */
  salaryCents: number
}

/** Situação de um item dentro de um projeto. */
export type ProjectItemStatus = 'bought' | 'pending'

/**
 * Projeto: um conjunto de gastos com objetivo comum (ex.: restaurar uma
 * moto, montar um setup, uma viagem). Tem seus próprios totais, separados
 * do orçamento mensal do dia a dia.
 */
export interface Project {
  id: string
  name: string
  /** Emoji para identificação visual rápida. */
  icon: string
  /** Cor de destaque em hex. */
  color: string
  /** Observação livre (modelo, ano, placa...). */
  notes: string
  /** Meta de orçamento opcional para o projeto, em centavos. */
  targetCents: number | null
  createdAt: string
}

export interface ProjectItem {
  id: string
  projectId: string
  name: string
  /** Valor do item em centavos. */
  amountCents: number
  status: ProjectItemStatus
  /** Link de compra opcional. */
  url: string | null
  /** Loja/origem opcional (ex.: Mercado Livre, AliExpress). */
  store: string | null
  createdAt: string
}
