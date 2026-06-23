import type {
  Budget,
  Card,
  Category,
  FixedExpense,
  MonthlySettings,
  Project,
  ProjectItem,
  Transaction,
} from '../domain/types'
import { DEFAULT_CATEGORIES } from './defaultCategories'
import { DEFAULT_CARDS, DEFAULT_FIXED_EXPENSES } from './defaultMonthly'
import type {
  BackupData,
  FinanceRepository,
  NewCard,
  NewFixedExpense,
  NewProject,
  NewProjectItem,
  NewTransaction,
} from './repository'

const BACKUP_VERSION = 1

const KEYS = {
  transactions: 'cf:transactions',
  categories: 'cf:categories',
  budget: 'cf:budget',
  projects: 'cf:projects',
  projectItems: 'cf:projectItems',
  monthlySettings: 'cf:monthlySettings',
  fixedExpenses: 'cf:fixedExpenses',
  cards: 'cf:cards',
} as const

const DEFAULT_BUDGET: Budget = { monthlyLimitCents: 300000 } // R$ 3.000,00
const DEFAULT_MONTHLY_SETTINGS: MonthlySettings = { salaryCents: 0 }

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function makeId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`
}

/**
 * Implementação de persistência baseada em localStorage do navegador.
 * Funciona 100% offline e permite usar o app no celular antes de
 * configurarmos o Supabase. A API é assíncrona de propósito, para casar
 * com a futura implementação de rede sem mudar os chamadores.
 */
export class LocalStorageRepository implements FinanceRepository {
  // ---------------------------------------------------------------- Transações
  async listTransactions(): Promise<Transaction[]> {
    const items = read<Transaction[]>(KEYS.transactions, [])
    return items.sort((a, b) =>
      b.date === a.date
        ? b.createdAt.localeCompare(a.createdAt)
        : b.date.localeCompare(a.date),
    )
  }

  async addTransaction(input: NewTransaction): Promise<Transaction> {
    const transaction: Transaction = {
      ...input,
      id: makeId(),
      createdAt: new Date().toISOString(),
    }
    const items = read<Transaction[]>(KEYS.transactions, [])
    items.push(transaction)
    write(KEYS.transactions, items)
    return transaction
  }

  async updateTransaction(
    id: string,
    patch: Partial<NewTransaction>,
  ): Promise<Transaction> {
    const items = read<Transaction[]>(KEYS.transactions, [])
    const idx = items.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error('Transação não encontrada')
    items[idx] = { ...items[idx], ...patch }
    write(KEYS.transactions, items)
    return items[idx]
  }

  async deleteTransaction(id: string): Promise<void> {
    const items = read<Transaction[]>(KEYS.transactions, [])
    write(
      KEYS.transactions,
      items.filter((t) => t.id !== id),
    )
  }

  // ---------------------------------------------------------------- Categorias
  async listCategories(): Promise<Category[]> {
    const stored = read<Category[] | null>(KEYS.categories, null)
    if (stored && stored.length > 0) return stored
    write(KEYS.categories, DEFAULT_CATEGORIES)
    return DEFAULT_CATEGORIES
  }

  // ----------------------------------------------------------------- Orçamento
  async getBudget(): Promise<Budget> {
    return read<Budget>(KEYS.budget, DEFAULT_BUDGET)
  }

  async setBudget(budget: Budget): Promise<Budget> {
    write(KEYS.budget, budget)
    return budget
  }

  // ------------------------------------------------------------------ Projetos
  async listProjects(): Promise<Project[]> {
    return read<Project[]>(KEYS.projects, []).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    )
  }

  async addProject(input: NewProject): Promise<Project> {
    const project: Project = {
      ...input,
      id: makeId(),
      createdAt: new Date().toISOString(),
    }
    const projects = read<Project[]>(KEYS.projects, [])
    projects.push(project)
    write(KEYS.projects, projects)
    return project
  }

  async updateProject(id: string, patch: Partial<NewProject>): Promise<Project> {
    const projects = read<Project[]>(KEYS.projects, [])
    const idx = projects.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Projeto não encontrado')
    projects[idx] = { ...projects[idx], ...patch }
    write(KEYS.projects, projects)
    return projects[idx]
  }

  async deleteProject(id: string): Promise<void> {
    const projects = read<Project[]>(KEYS.projects, [])
    write(
      KEYS.projects,
      projects.filter((p) => p.id !== id),
    )
    // Remove os itens órfãos do projeto.
    const items = read<ProjectItem[]>(KEYS.projectItems, [])
    write(
      KEYS.projectItems,
      items.filter((i) => i.projectId !== id),
    )
  }

  // ----------------------------------------------------------- Itens de projeto
  async listProjectItems(projectId: string): Promise<ProjectItem[]> {
    return read<ProjectItem[]>(KEYS.projectItems, [])
      .filter((i) => i.projectId === projectId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }

  async addProjectItem(input: NewProjectItem): Promise<ProjectItem> {
    const item: ProjectItem = {
      ...input,
      id: makeId(),
      createdAt: new Date().toISOString(),
    }
    const items = read<ProjectItem[]>(KEYS.projectItems, [])
    items.push(item)
    write(KEYS.projectItems, items)
    return item
  }

  async addProjectItems(inputs: NewProjectItem[]): Promise<ProjectItem[]> {
    const items = read<ProjectItem[]>(KEYS.projectItems, [])
    const created = inputs.map((input, offset) => ({
      ...input,
      id: makeId(),
      // Garante ordem estável mesmo com criação no mesmo milissegundo.
      createdAt: new Date(Date.now() + offset).toISOString(),
    }))
    items.push(...created)
    write(KEYS.projectItems, items)
    return created
  }

  async updateProjectItem(
    id: string,
    patch: Partial<NewProjectItem>,
  ): Promise<ProjectItem> {
    const items = read<ProjectItem[]>(KEYS.projectItems, [])
    const idx = items.findIndex((i) => i.id === id)
    if (idx === -1) throw new Error('Item não encontrado')
    items[idx] = { ...items[idx], ...patch }
    write(KEYS.projectItems, items)
    return items[idx]
  }

  async deleteProjectItem(id: string): Promise<void> {
    const items = read<ProjectItem[]>(KEYS.projectItems, [])
    write(
      KEYS.projectItems,
      items.filter((i) => i.id !== id),
    )
  }

  // -------------------------------------------------------- Planejamento mensal
  async getMonthlySettings(): Promise<MonthlySettings> {
    return read<MonthlySettings>(KEYS.monthlySettings, DEFAULT_MONTHLY_SETTINGS)
  }

  async setMonthlySettings(
    settings: MonthlySettings,
  ): Promise<MonthlySettings> {
    write(KEYS.monthlySettings, settings)
    return settings
  }

  // --------------------------------------------------------------- Contas fixas
  async listFixedExpenses(): Promise<FixedExpense[]> {
    // Seed apenas na primeira vez (chave ausente), respeitando lista vazia.
    if (localStorage.getItem(KEYS.fixedExpenses) === null) {
      const seeded = DEFAULT_FIXED_EXPENSES.map((f, i) => ({
        ...f,
        paidMonth: null,
        id: makeId(),
        createdAt: new Date(Date.now() + i).toISOString(),
      }))
      write(KEYS.fixedExpenses, seeded)
      return seeded
    }
    return read<FixedExpense[]>(KEYS.fixedExpenses, []).sort(
      (a, b) => (a.dueDay ?? 99) - (b.dueDay ?? 99),
    )
  }

  async addFixedExpense(input: NewFixedExpense): Promise<FixedExpense> {
    const created: FixedExpense = {
      ...input,
      id: makeId(),
      createdAt: new Date().toISOString(),
    }
    const items = read<FixedExpense[]>(KEYS.fixedExpenses, [])
    items.push(created)
    write(KEYS.fixedExpenses, items)
    return created
  }

  async addFixedExpenses(inputs: NewFixedExpense[]): Promise<FixedExpense[]> {
    const items = read<FixedExpense[]>(KEYS.fixedExpenses, [])
    const created = inputs.map((input, i) => ({
      ...input,
      id: makeId(),
      createdAt: new Date(Date.now() + i).toISOString(),
    }))
    items.push(...created)
    write(KEYS.fixedExpenses, items)
    return created
  }

  async updateFixedExpense(
    id: string,
    patch: Partial<NewFixedExpense>,
  ): Promise<FixedExpense> {
    const items = read<FixedExpense[]>(KEYS.fixedExpenses, [])
    const idx = items.findIndex((i) => i.id === id)
    if (idx === -1) throw new Error('Conta fixa não encontrada')
    items[idx] = { ...items[idx], ...patch }
    write(KEYS.fixedExpenses, items)
    return items[idx]
  }

  async deleteFixedExpense(id: string): Promise<void> {
    const items = read<FixedExpense[]>(KEYS.fixedExpenses, [])
    write(
      KEYS.fixedExpenses,
      items.filter((i) => i.id !== id),
    )
  }

  // -------------------------------------------------------------------- Cartões
  async listCards(): Promise<Card[]> {
    if (localStorage.getItem(KEYS.cards) === null) {
      const seeded = DEFAULT_CARDS.map((c, i) => ({
        ...c,
        limitCents: 0,
        billCents: 0,
        billMonth: null,
        paidMonth: null,
        id: makeId(),
        createdAt: new Date(Date.now() + i).toISOString(),
      }))
      write(KEYS.cards, seeded)
      return seeded
    }
    return read<Card[]>(KEYS.cards, []).sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    )
  }

  async addCard(input: NewCard): Promise<Card> {
    const created: Card = {
      ...input,
      id: makeId(),
      createdAt: new Date().toISOString(),
    }
    const cards = read<Card[]>(KEYS.cards, [])
    cards.push(created)
    write(KEYS.cards, cards)
    return created
  }

  async updateCard(id: string, patch: Partial<NewCard>): Promise<Card> {
    const cards = read<Card[]>(KEYS.cards, [])
    const idx = cards.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Cartão não encontrado')
    cards[idx] = { ...cards[idx], ...patch }
    write(KEYS.cards, cards)
    return cards[idx]
  }

  async deleteCard(id: string): Promise<void> {
    const cards = read<Card[]>(KEYS.cards, [])
    write(
      KEYS.cards,
      cards.filter((c) => c.id !== id),
    )
  }

  // --------------------------------------------------------------------- Backup
  async exportData(): Promise<BackupData> {
    const data: Record<string, unknown> = {}
    for (const key of Object.values(KEYS)) {
      const raw = localStorage.getItem(key)
      if (raw !== null) data[key] = JSON.parse(raw)
    }
    return {
      app: 'controle-de-financas',
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data,
    }
  }

  async importData(backup: BackupData): Promise<void> {
    if (backup?.app !== 'controle-de-financas') {
      throw new Error('Arquivo de backup inválido.')
    }
    const validKeys = new Set<string>(Object.values(KEYS))
    for (const [key, value] of Object.entries(backup.data ?? {})) {
      // Só restaura chaves conhecidas do app.
      if (validKeys.has(key)) write(key, value)
    }
  }
}
