/**
 * Configuração do assistente de IA. A chave da API e o modelo ficam só no
 * aparelho (localStorage), com prefixo próprio (`cf:ai:`) que NÃO entra no
 * backup — assim a chave nunca vaza num arquivo exportado.
 */
const KEY_API = 'cf:ai:key'
const KEY_MODEL = 'cf:ai:model'

export type AiModel =
  | 'claude-opus-4-8'
  | 'claude-sonnet-4-6'
  | 'claude-haiku-4-5'

export const AI_MODELS: { id: AiModel; label: string; hint: string }[] = [
  { id: 'claude-opus-4-8', label: 'Opus 4.8', hint: 'mais inteligente' },
  { id: 'claude-sonnet-4-6', label: 'Sonnet 4.6', hint: 'equilibrado' },
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5', hint: 'mais barato/rápido' },
]

const DEFAULT_MODEL: AiModel = 'claude-opus-4-8'

export function getApiKey(): string {
  return localStorage.getItem(KEY_API) ?? ''
}

export function setApiKey(value: string): void {
  if (value) localStorage.setItem(KEY_API, value)
  else localStorage.removeItem(KEY_API)
}

export function hasApiKey(): boolean {
  return Boolean(getApiKey())
}

export function getModel(): AiModel {
  const stored = localStorage.getItem(KEY_MODEL) as AiModel | null
  return stored ?? DEFAULT_MODEL
}

export function setModel(model: AiModel): void {
  localStorage.setItem(KEY_MODEL, model)
}
