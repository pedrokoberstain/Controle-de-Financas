import Anthropic from '@anthropic-ai/sdk'
import { getApiKey, getModel } from './aiConfig'

export interface ScannedReceipt {
  merchant: string
  /** Valor total em centavos. */
  amountCents: number
  /** Data YYYY-MM-DD ou string vazia. */
  date: string
  /** Categoria sugerida (texto livre). */
  category: string
}

const PROMPT = `Esta é a foto de uma nota/cupom fiscal ou comprovante de compra.
Extraia os dados e responda APENAS com um JSON válido (sem markdown, sem texto extra) no formato:
{"merchant": "nome do estabelecimento", "total": 0.00, "date": "YYYY-MM-DD", "category": "categoria curta em português"}
Regras:
- "total" é o valor total pago, em reais (número).
- "date" é a data da compra; se não encontrar, use "".
- "category" é uma categoria curta como Alimentação, Mercado, Transporte, Saúde, Lazer, Casa, etc.`

const ALLOWED_MEDIA = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
])

/** Lê um arquivo de imagem como base64 (sem o prefixo data:). */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result)
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json|```/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Resposta sem JSON')
  return JSON.parse(cleaned.slice(start, end + 1))
}

/**
 * Envia a foto da nota ao Claude (visão) e extrai estabelecimento, valor,
 * data e categoria sugerida. Usa a chave/modelo do próprio usuário.
 */
export async function scanReceipt(file: File): Promise<ScannedReceipt> {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('Configure sua chave de API na aba IA.')

  const mediaType = ALLOWED_MEDIA.has(file.type) ? file.type : 'image/jpeg'
  const data = await fileToBase64(file)

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  const response = await client.messages.create({
    model: getModel(),
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as
                | 'image/jpeg'
                | 'image/png'
                | 'image/gif'
                | 'image/webp',
              data,
            },
          },
          { type: 'text', text: PROMPT },
        ],
      },
    ],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  const text = textBlock && 'text' in textBlock ? textBlock.text : ''
  const parsed = extractJson(text) as {
    merchant?: string
    total?: number
    date?: string
    category?: string
  }

  const total = Number(parsed.total)
  return {
    merchant: (parsed.merchant ?? '').trim() || 'Compra',
    amountCents: Number.isFinite(total) ? Math.round(total * 100) : 0,
    date:
      parsed.date && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : '',
    category: (parsed.category ?? '').trim(),
  }
}

export { describeError } from './assistantClient'
