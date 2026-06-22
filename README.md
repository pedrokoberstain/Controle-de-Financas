# Controle de Finanças

App de finanças pessoais (PWA) com três pilares:

1. **Início:** gastos do dia a dia, categorias e quanto pode gastar.
2. **Mês:** fluxo de caixa — salário − contas fixas − faturas de cartão =
   **sobra do mês**, com vencimentos, ✓ pago e **projeção do próximo mês**.
3. **Projetos:** metas com lista de itens (comprados/pendentes), totais
   automáticos e **importador inteligente** — cola a lista do WhatsApp e o
   sistema extrai itens, valores e links.

Mobile-first, instalável na tela inicial do celular, custo de hospedagem R$ 0.

## Stack

- **React 19 + Vite + TypeScript**
- **Tailwind CSS v4**
- **PWA** (vite-plugin-pwa) — instalável e com cache offline
- **Persistência:** `localStorage` hoje; **Supabase** (PostgreSQL) depois,
  trocável sem mexer na UI (ver `src/data/`)

## Arquitetura

```
src/
  config/      # acesso tipado a variáveis de ambiente
  domain/      # regras de negócio puras (tipos, dinheiro, períodos, orçamento)
  data/        # contrato de persistência + implementações (local / supabase)
  hooks/       # estado e ações (useFinance)
  components/  # UI reutilizável (Card, Button, ...)
  features/    # telas por funcionalidade (dashboard)
  lib/         # integrações externas (cliente supabase)
```

Princípios: dinheiro sempre em **centavos (inteiros)**; a UI depende de uma
**interface de repositório**, não da fonte de dados concreta; regras de
negócio ficam em `domain/`, isoladas de React.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra a URL mostrada no terminal. Para testar no celular na mesma rede, use
`npm run dev -- --host` e acesse o IP da sua máquina pelo navegador do celular.

## Ambiente

Copie `.env.example` para `.env.local`. Enquanto as chaves do Supabase
estiverem vazias, o app usa `localStorage`. Ao preenchê-las, passará a usar a
nuvem (quando o `SupabaseRepository` estiver implementado).

## Roadmap

- [x] Fase 1 — MVP: lançamentos, categorias, orçamento, "quanto posso gastar"
- [x] Fase 1.5 — Projetos com itens, totais e importador inteligente de listas
- [x] Fase 2 — Aba Mês: salário, contas fixas, faturas de cartão, sobra do mês
      e projeção do próximo mês
- [ ] Fase 3 — Sync na nuvem (Supabase), gráficos e recorrências automáticas
- [ ] Fase 3 — Gráficos, metas, recorrências (salário, assinaturas)
- [ ] Fase 4 — Integração automática (Open Finance / notificações)
