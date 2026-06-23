import Anthropic from '@anthropic-ai/sdk'
import { repository } from '../../data'
import { todayISO } from '../../domain/period'
import type { AiModel } from './aiConfig'
import type { ChatMessage } from './assistantClient'

const SYSTEM_PROMPT = `Você é um assistente financeiro pessoal em português do Brasil, dentro de um app de controle de finanças.
- Responda com base nos dados financeiros do contexto; se algo não estiver lá, diga que não tem a informação.
- Você PODE executar ações usando as ferramentas disponíveis quando o usuário pedir para registrar, criar ou definir algo (ex.: "lança 35 de almoço", "minha renda é 3000", "cria conta fixa da academia 90 reais dia 10"). Use a ferramenta e depois confirme em uma frase curta o que fez.
- Para perguntas (quanto posso gastar, pra onde foi o dinheiro, posso comprar X), apenas responda — não use ferramentas.
- Seja direto e use R$ no formato brasileiro. Não invente valores.`

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'add_transaction',
    description: 'Registra um gasto (expense) ou uma receita (income).',
    input_schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['expense', 'income'] },
        amount: { type: 'number', description: 'Valor em reais' },
        description: { type: 'string' },
        category: { type: 'string', description: 'Nome da categoria (opcional)' },
        date: { type: 'string', description: 'Data YYYY-MM-DD (opcional)' },
      },
      required: ['type', 'amount', 'description'],
    },
  },
  {
    name: 'add_fixed_expense',
    description: 'Cria uma conta fixa mensal recorrente (ex.: assinatura).',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        amount: { type: 'number', description: 'Valor em reais' },
        dueDay: { type: 'number', description: 'Dia de vencimento 1-31 (opcional)' },
      },
      required: ['name', 'amount'],
    },
  },
  {
    name: 'set_salary',
    description: 'Define a renda/salário mensal do usuário.',
    input_schema: {
      type: 'object',
      properties: { amount: { type: 'number', description: 'Valor em reais' } },
      required: ['amount'],
    },
  },
]

function reais(input: unknown): number {
  const n = Number(input)
  return Number.isFinite(n) ? Math.round(n * 100) : 0
}

/** Executa uma ferramenta e devolve um rótulo curto do que foi feito. */
async function executeTool(
  name: string,
  input: Record<string, unknown>,
): Promise<string> {
  if (name === 'add_transaction') {
    const cents = reais(input.amount)
    const type = input.type === 'income' ? 'income' : 'expense'
    const desc = String(input.description ?? 'Lançamento')
    let categoryId: string | null = null
    if (input.category) {
      const cats = await repository.listCategories()
      categoryId =
        cats.find(
          (c) => c.name.toLowerCase() === String(input.category).toLowerCase(),
        )?.id ?? null
    }
    const date =
      typeof input.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.date)
        ? input.date
        : todayISO()
    await repository.addTransaction({
      type,
      amountCents: cents,
      description: desc,
      categoryId,
      date,
    })
    return `${type === 'expense' ? 'Gasto' : 'Receita'} de R$ ${(cents / 100).toFixed(2)} — ${desc}`
  }

  if (name === 'add_fixed_expense') {
    const cents = reais(input.amount)
    const dueDay =
      Number.isInteger(input.dueDay) &&
      Number(input.dueDay) >= 1 &&
      Number(input.dueDay) <= 31
        ? Number(input.dueDay)
        : null
    await repository.addFixedExpense({
      name: String(input.name ?? 'Conta fixa'),
      amountCents: cents,
      dueDay,
      paidMonth: null,
    })
    return `Conta fixa "${input.name}" de R$ ${(cents / 100).toFixed(2)} criada`
  }

  if (name === 'set_salary') {
    const cents = reais(input.amount)
    await repository.setMonthlySettings({ salaryCents: cents })
    return `Renda mensal definida em R$ ${(cents / 100).toFixed(2)}`
  }

  return 'Ação desconhecida'
}

interface RunCallbacks {
  onText: (chunk: string) => void
  onAction: (label: string) => void
}

/**
 * Roda a conversa com ferramentas: transmite o texto e executa as ações
 * que o modelo pedir, em loop, até a resposta final.
 */
export async function runAgent(
  params: {
    apiKey: string
    model: AiModel
    context: string
    history: ChatMessage[]
  },
  cb: RunCallbacks,
): Promise<void> {
  const client = new Anthropic({
    apiKey: params.apiKey,
    dangerouslyAllowBrowser: true,
  })
  const system = `${SYSTEM_PROMPT}\n\n--- CONTEXTO FINANCEIRO ATUAL ---\n${params.context}`

  const messages: Anthropic.MessageParam[] = params.history.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  for (let i = 0; i < 5; i++) {
    const stream = client.messages.stream({
      model: params.model,
      max_tokens: 2048,
      system,
      tools: TOOLS,
      messages,
    })

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        cb.onText(event.delta.text)
      }
    }

    const final = await stream.finalMessage()
    messages.push({ role: 'assistant', content: final.content })

    if (final.stop_reason !== 'tool_use') break

    const results: Anthropic.ToolResultBlockParam[] = []
    for (const block of final.content) {
      if (block.type === 'tool_use') {
        const label = await executeTool(
          block.name,
          block.input as Record<string, unknown>,
        )
        cb.onAction(label)
        results.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: 'OK: ' + label,
        })
      }
    }
    messages.push({ role: 'user', content: results })
  }
}
