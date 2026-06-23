import { useCallback, useState } from 'react'
import { getApiKey, getModel } from '../features/assistant/aiConfig'
import {
  describeError,
  streamAnswer,
  type ChatMessage,
} from '../features/assistant/assistantClient'
import { buildFinancialContext } from '../features/assistant/buildContext'

/** Gerencia a conversa com o assistente de IA e o streaming das respostas. */
export function useAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = useCallback(
    async (text: string) => {
      const question = text.trim()
      if (!question || streaming) return

      const apiKey = getApiKey()
      if (!apiKey) {
        setError('Configure sua chave de API primeiro.')
        return
      }

      setError(null)
      const history: ChatMessage[] = [
        ...messages,
        { role: 'user', content: question },
      ]
      // Adiciona a pergunta e um placeholder de resposta.
      setMessages([...history, { role: 'assistant', content: '' }])
      setStreaming(true)

      try {
        const context = await buildFinancialContext()
        let answer = ''
        for await (const chunk of streamAnswer({
          apiKey,
          model: getModel(),
          context,
          history,
        })) {
          answer += chunk
          setMessages((m) => {
            const copy = [...m]
            copy[copy.length - 1] = { role: 'assistant', content: answer }
            return copy
          })
        }
        if (!answer) {
          setMessages((m) => {
            const copy = [...m]
            copy[copy.length - 1] = {
              role: 'assistant',
              content: '(sem resposta)',
            }
            return copy
          })
        }
      } catch (err) {
        const msg = describeError(err)
        setError(msg)
        // Remove o placeholder vazio da resposta.
        setMessages((m) => m.slice(0, -1))
      } finally {
        setStreaming(false)
      }
    },
    [messages, streaming],
  )

  const reset = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, streaming, error, send, reset }
}
