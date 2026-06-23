import Anthropic from '@anthropic-ai/sdk'
import type { AiModel } from './aiConfig'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `Você é um assistente financeiro pessoal em português do Brasil, dentro de um app de controle de finanças. Responda SOMENTE com base nos dados financeiros fornecidos no contexto; se algo não estiver nos dados, diga que não tem essa informação. Seja direto, claro e use R$ no formato brasileiro. Pode fazer contas simples. Quando perguntarem "posso comprar/gastar X", compare com a sobra do mês e/ou a margem de crédito disponível e dê uma recomendação objetiva. Não invente valores.`

/**
 * Faz uma pergunta ao modelo com o contexto financeiro, transmitindo a
 * resposta em pedaços (streaming). A chave é do próprio usuário e roda no
 * navegador (uso pessoal).
 */
export async function* streamAnswer(params: {
  apiKey: string
  model: AiModel
  context: string
  history: ChatMessage[]
}): AsyncGenerator<string> {
  const client = new Anthropic({
    apiKey: params.apiKey,
    dangerouslyAllowBrowser: true,
  })

  const system = `${SYSTEM_PROMPT}\n\n--- CONTEXTO FINANCEIRO ATUAL ---\n${params.context}`

  const stream = client.messages.stream({
    model: params.model,
    max_tokens: 2048,
    system,
    messages: params.history.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text
    }
  }
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
