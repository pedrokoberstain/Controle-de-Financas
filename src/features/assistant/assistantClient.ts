import Anthropic from '@anthropic-ai/sdk'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/** Traduz erros do SDK em mensagens amigáveis. */
export function describeError(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) {
    return 'Chave de API inválida. Confira em Ajustes.'
  }
  if (err instanceof Anthropic.RateLimitError) {
    return 'Muitas requisições. Tente de novo em instantes.'
  }
  if (err instanceof Anthropic.APIError) {
    return `Erro da API (${err.status}): ${err.message}`
  }
  return 'Não foi possível obter resposta. Verifique sua conexão e a chave.'
}
