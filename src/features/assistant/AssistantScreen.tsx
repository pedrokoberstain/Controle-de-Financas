import { useEffect, useRef, useState } from 'react'
import { useAssistant } from '../../hooks/useAssistant'
import { hasApiKey } from './aiConfig'
import { ApiKeySheet } from './ApiKeySheet'

const SUGGESTIONS = [
  'Quanto eu ainda posso gastar esse mês?',
  'Pra onde foi mais dinheiro esse mês?',
  'Lança 35 de almoço hoje',
  'Minha renda é 3000',
]

export function AssistantScreen() {
  const { messages, streaming, error, send, reset } = useAssistant()
  const [input, setInput] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [configured, setConfigured] = useState(hasApiKey())
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function submit(text: string) {
    if (!text.trim() || streaming) return
    setInput('')
    void send(text)
  }

  if (!configured) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 pb-28 text-center">
        <p className="text-5xl">🤖</p>
        <h1 className="mt-3 text-xl font-bold">Assistente de IA</h1>
        <p className="mt-2 text-sm text-muted">
          Pergunte sobre suas finanças em português. Para usar, conecte sua
          própria chave da Anthropic — ela fica só neste aparelho.
        </p>
        <button
          onClick={() => setShowConfig(true)}
          className="mt-5 rounded-xl bg-brand px-5 py-3 font-semibold text-bg"
        >
          Conectar chave de API
        </button>

        {showConfig && (
          <ApiKeySheet
            onSaved={() => setConfigured(hasApiKey())}
            onClose={() => setShowConfig(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-28 pt-6">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Assistente</h1>
          <p className="text-sm text-muted">Pergunte sobre suas finanças</p>
        </div>
        <div className="flex gap-1">
          {messages.length > 0 && (
            <button
              onClick={reset}
              className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-muted"
            >
              Limpar
            </button>
          )}
          <button
            onClick={() => setShowConfig(true)}
            aria-label="Configurar"
            className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-muted"
          >
            ⚙️
          </button>
        </div>
      </header>

      <div className="flex-1">
        {messages.length === 0 ? (
          <div className="mt-6 flex flex-col gap-2">
            <p className="mb-1 text-sm text-muted">Experimente perguntar:</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => submit(s)}
                className="rounded-2xl border border-border bg-surface p-3 text-left text-sm transition active:scale-[0.99]"
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <li
                key={i}
                className={m.role === 'user' ? 'flex justify-end' : 'flex'}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                    m.role === 'user'
                      ? 'bg-brand text-bg'
                      : 'border border-border bg-surface'
                  }`}
                >
                  {m.content ||
                    (streaming && i === messages.length - 1 ? '…' : '')}
                </div>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        <div ref={endRef} />
      </div>

      {/* Campo de pergunta fixo acima da navegação. */}
      <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit(input)
          }}
          className="flex gap-2 rounded-2xl border border-border bg-surface p-2 shadow-lg"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte algo..."
            className="flex-1 bg-transparent px-2 outline-none"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-bg disabled:opacity-40"
          >
            {streaming ? '…' : '↑'}
          </button>
        </form>
      </div>

      {showConfig && (
        <ApiKeySheet
          onSaved={() => setConfigured(hasApiKey())}
          onClose={() => setShowConfig(false)}
        />
      )}
    </div>
  )
}
