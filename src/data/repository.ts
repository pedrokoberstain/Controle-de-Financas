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

/** Dados de entrada para criar uma transação (id/createdAt são gerados). */
export type NewTransaction = Omit<Transaction, 'id' | 'createdAt'>

/** Dados de entrada para criar um projeto. */
export type NewProject = Omit<Project, 'id' | 'createdAt'>

/** Dados de entrada para criar um item de projeto. */
export type NewProjectItem = Omit<ProjectItem, 'id' | 'createdAt'>

/** Dados de entrada para criar uma conta fixa. */
export type NewFixedExpense = Omit<FixedExpense, 'id' | 'createdAt'>

/** Dados de entrada para criar um cartão. */
export type NewCard = Omit<Card, 'id' | 'createdAt'>

/** Pacote de backup com todos os dados do app. */
export interface BackupData {
  app: 'controle-de-financas'
  version: number
  exportedAt: string
  data: Record<string, unknown>
}

/**
 * Contrato de persistência do app. A UI depende apenas desta interface,
 * nunca da implementação concreta. Hoje usamos localStorage; amanhã
 * trocamos por Supabase implementando o mesmo contrato — sem tocar na UI.
 */
export interface FinanceRepository {
  // Transações
  listTransactions(): Promise<Transaction[]>
  addTransaction(input: NewTransaction): Promise<Transaction>
  updateTransaction(
    id: string,
    patch: Partial<NewTransaction>,
  ): Promise<Transaction>
  deleteTransaction(id: string): Promise<void>

  // Categorias
  listCategories(): Promise<Category[]>

  // Orçamento
  getBudget(): Promise<Budget>
  setBudget(budget: Budget): Promise<Budget>

  // Projetos
  listProjects(): Promise<Project[]>
  addProject(input: NewProject): Promise<Project>
  updateProject(id: string, patch: Partial<NewProject>): Promise<Project>
  deleteProject(id: string): Promise<void>

  // Itens de projeto
  listProjectItems(projectId: string): Promise<ProjectItem[]>
  addProjectItem(input: NewProjectItem): Promise<ProjectItem>
  addProjectItems(inputs: NewProjectItem[]): Promise<ProjectItem[]>
  updateProjectItem(
    id: string,
    patch: Partial<NewProjectItem>,
  ): Promise<ProjectItem>
  deleteProjectItem(id: string): Promise<void>

  // Planejamento mensal
  getMonthlySettings(): Promise<MonthlySettings>
  setMonthlySettings(settings: MonthlySettings): Promise<MonthlySettings>

  // Contas fixas
  listFixedExpenses(): Promise<FixedExpense[]>
  addFixedExpense(input: NewFixedExpense): Promise<FixedExpense>
  addFixedExpenses(inputs: NewFixedExpense[]): Promise<FixedExpense[]>
  updateFixedExpense(
    id: string,
    patch: Partial<NewFixedExpense>,
  ): Promise<FixedExpense>
  deleteFixedExpense(id: string): Promise<void>

  // Cartões
  listCards(): Promise<Card[]>
  addCard(input: NewCard): Promise<Card>
  updateCard(id: string, patch: Partial<NewCard>): Promise<Card>
  deleteCard(id: string): Promise<void>

  // Backup
  exportData(): Promise<BackupData>
  importData(backup: BackupData): Promise<void>
}
