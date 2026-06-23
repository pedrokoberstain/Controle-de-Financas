import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import {
  AI_MODELS,
  getApiKey,
  getModel,
  setApiKey,
  setModel,
  type AiModel,
} from './aiConfig'

interface ApiKeySheetProps {
  onSaved: () => void
  onClose: () => void
}

/** Configuração da chave da API e do modelo do assistente. */
export function ApiKeySheet({ onSaved, onClose }: ApiKeySheetProps) {
  const [key, setKey] = useState(getApiKey())
  const [model, setModelState] = useState<AiModel>(getModel())

  function handleSave() {
    setApiKey(key.trim())
    setModel(model)
    onSaved()
    onClose()
  }

  return (
    <Sheet
      title="Assistente de IA"
      subtitle="Use sua própria chave da Anthropic. Ela fica só neste aparelho e não entra no backup."
      onClose={onClose}
    >
      <label className="block text-xs text-muted">Chave da API</label>
      <input
        type="password"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="sk-ant-..."
        className="mb-1 w-full rounded-xl border border-border bg-bg px-4 py-3 outline-none focus:border-brand"
      />
      <a
        href="https://console.anthropic.com/settings/keys"
        target="_blank"
        rel="noopener noreferrer"
        className="mb-4 inline-block text-xs text-brand"
      >
        Onde consigo uma chave? ↗
      </a>

      <label className="block text-xs text-muted">Modelo</label>
      <div className="mb-4 flex flex-col gap-2">
        {AI_MODELS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setModelState(m.id)}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
              model === m.id
                ? 'border-brand bg-brand/10'
                : 'border-border bg-bg'
            }`}
          >
            <span className="text-sm font-medium">{m.label}</span>
            <span className="text-xs text-muted">{m.hint}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="ghost" className="flex-1" onClick={onClose}>
          Cancelar
        </Button>
        <Button className="flex-1" onClick={handleSave}>
          Salvar
        </Button>
      </div>
    </Sheet>
  )
}
