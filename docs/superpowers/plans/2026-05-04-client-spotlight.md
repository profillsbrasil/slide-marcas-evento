# Spotlight Cliente Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar lupa fixa no canto superior direito que abre drawer de busca fuzzy de clientes; ao selecionar, palco substitui carrossel por logo único estático até o operador clicar "Voltar ao carrossel".

**Architecture:** Estado `selectedClient` adicionado ao `EventCarouselStage`. Quando set, palco renderiza `<ClientSpotlight>` no lugar de `{children}`. Lista de clientes vem de `data/clients.json` (com fallback automático para logos sem entry). Busca via `fuse.js` com normalização de acentos. Dois `<Sheet>` independentes coexistem (hamburger left, lupa right).

**Tech Stack:** Next.js 16 (App Router, RSC), React 19, TypeScript, shadcn/ui (Sheet/Input/Button), Tailwind v4, fuse.js, lucide-react, bun.

**Validação neste repo:** Sem framework de testes (não tem vitest/jest). Validação = `bun run typecheck`, `bun run lint`, e smoke test em browser via `agent-browser` ou manual. Não introduzir test framework para esta feature (scope creep).

**Spec de referência:** `docs/superpowers/specs/2026-05-04-client-spotlight-design.md`

---

## File Structure

| File | Status | Responsabilidade |
|---|---|---|
| `data/clients.json` | criar | Dataset de clientes (nome + logo + aliases). Editado à mão. |
| `lib/clients.ts` | criar | `readClients()` server-side + tipo `Client` + `normalize()` (strip diacritics). |
| `components/client-spotlight.tsx` | criar | Componente estático que renderiza logo único centralizado. |
| `components/client-search-sheet.tsx` | criar | Drawer de busca + lupa trigger. Cliente component. |
| `components/event-carousel-stage.tsx` | editar | Aceitar prop `clients`, gerenciar `selectedClient`, integrar sheet + spotlight. |
| `app/page.tsx` | editar | Chamar `readClients()` e passar `clients` para `EventCarouselStage`. |
| `package.json` | editar | Adicionar `fuse.js`. |

---

## Task 1: Adicionar dependência `fuse.js`

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Instalar fuse.js**

```bash
bun add fuse.js
```

- [ ] **Step 2: Verificar entrada no package.json**

Run: `grep fuse package.json`
Expected: linha tipo `"fuse.js": "^7.x.x"` em `dependencies`.

- [ ] **Step 3: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: adiciona fuse.js para busca fuzzy de clientes"
```

---

## Task 2: Seed `data/clients.json`

**Files:**
- Create: `data/clients.json`

- [ ] **Step 1: Listar logos existentes**

Run: `ls public/brand-logos/`
Anotar 2–3 nomes de arquivo reais para popular o seed.

- [ ] **Step 2: Criar arquivo**

Conteúdo (substituir os filenames pelos reais detectados no Step 1; se a pasta estiver vazia, criar JSON `[]`):

```json
[
  {
    "name": "Açaí Norte",
    "logo": "acai-norte.png",
    "aliases": ["acai do norte"]
  },
  {
    "name": "Polpa Real",
    "logo": "polpa-real.jpg"
  }
]
```

> Nota: as entries são exemplo. Se nenhum dos filenames existe em `/public/brand-logos/`, deixar `[]` — `readClients()` vai autogerar entries pelos filenames reais.

- [ ] **Step 3: Commit**

```bash
git add data/clients.json
git commit -m "chore: adiciona seed de data/clients.json"
```

---

## Task 3: `lib/clients.ts`

**Files:**
- Create: `lib/clients.ts`

- [ ] **Step 1: Escrever módulo completo**

```ts
import { readdirSync, readFileSync } from "fs"
import { join } from "path"

export type Client = {
  name: string
  logo: string
  aliases: string[]
}

type ClientEntry = {
  name: string
  logo: string
  aliases?: string[]
}

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"])

export function normalize(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
}

function formatFilename(filename: string): string {
  const base = filename.slice(0, filename.lastIndexOf("."))
  return base
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function readJsonEntries(): ClientEntry[] {
  try {
    const raw = readFileSync(join(process.cwd(), "data", "clients.json"), "utf-8")
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (entry): entry is ClientEntry =>
        entry &&
        typeof entry.name === "string" &&
        typeof entry.logo === "string"
    )
  } catch {
    return []
  }
}

function readLogoFiles(): string[] {
  const dir = join(process.cwd(), "public", "brand-logos")
  try {
    return readdirSync(dir).filter((file) => {
      const ext = file.slice(file.lastIndexOf(".")).toLowerCase()
      return IMAGE_EXTENSIONS.has(ext)
    })
  } catch {
    return []
  }
}

export function readClients(): Client[] {
  const entries = readJsonEntries()
  const logoFiles = new Set(readLogoFiles())
  const entryByLogo = new Map(entries.map((e) => [e.logo, e]))

  if (process.env.NODE_ENV === "development") {
    for (const entry of entries) {
      if (!logoFiles.has(entry.logo)) {
        console.warn(
          `[clients] entry "${entry.name}" referencia logo "${entry.logo}" que nao existe em /public/brand-logos/`
        )
      }
    }
  }

  const clients: Client[] = []
  for (const file of logoFiles) {
    const entry = entryByLogo.get(file)
    clients.push({
      name: entry?.name ?? formatFilename(file),
      logo: `/brand-logos/${file}`,
      aliases: entry?.aliases ?? [],
    })
  }

  return clients.sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add lib/clients.ts
git commit -m "feat: adiciona readClients e tipo Client em lib/clients.ts"
```

---

## Task 4: `components/client-spotlight.tsx`

**Files:**
- Create: `components/client-spotlight.tsx`

- [ ] **Step 1: Escrever componente completo**

```tsx
import Image from "next/image"

import type { Client } from "@/lib/clients"

export function ClientSpotlight({ client }: { client: Client }) {
  return (
    <section
      aria-label={`Logo do cliente ${client.name}`}
      className="flex flex-1 items-center justify-center px-12"
    >
      <Image
        src={client.logo}
        alt={`Logo ${client.name}`}
        width={1400}
        height={500}
        priority
        sizes="(min-width: 1400px) 1200px, 60vw"
        className="h-auto w-full max-h-[clamp(360px,70svh,720px)] max-w-[clamp(540px,60vw,1200px)] object-contain"
        draggable={false}
      />
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add components/client-spotlight.tsx
git commit -m "feat: adiciona ClientSpotlight (logo unico estatico)"
```

---

## Task 5: `components/client-search-sheet.tsx`

**Files:**
- Create: `components/client-search-sheet.tsx`

- [ ] **Step 1: Escrever componente completo**

```tsx
"use client"

import * as React from "react"
import Image from "next/image"
import Fuse from "fuse.js"
import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { type Client, normalize } from "@/lib/clients"

type Props = {
  clients: Client[]
  selectedClient: Client | null
  onSelect: (client: Client) => void
  onClear: () => void
}

export function ClientSearchSheet({
  clients,
  selectedClient,
  onSelect,
  onClear,
}: Props) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [activeIndex, setActiveIndex] = React.useState(0)

  const indexed = React.useMemo(
    () =>
      clients.map((client) => ({
        client,
        nameNorm: normalize(client.name),
        aliasesNorm: client.aliases.map(normalize),
      })),
    [clients]
  )

  const fuse = React.useMemo(
    () =>
      new Fuse(indexed, {
        keys: ["nameNorm", "aliasesNorm"],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [indexed]
  )

  const results = React.useMemo<Client[]>(() => {
    const q = normalize(query.trim())
    if (q === "") return clients
    return fuse.search(q).map((r) => r.item.client)
  }, [clients, fuse, query])

  React.useEffect(() => {
    setActiveIndex(0)
  }, [query, open])

  function handleSelect(client: Client) {
    onSelect(client)
    setOpen(false)
    setQuery("")
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (results.length === 0) return
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((i) => Math.min(results.length - 1, i + 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((i) => Math.max(0, i - 1))
    } else if (event.key === "Enter") {
      event.preventDefault()
      const client = results[activeIndex]
      if (client) handleSelect(client)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="fixed top-6 right-6 z-30 size-12 rounded-full border border-border/70 bg-card/80 text-foreground shadow-sm backdrop-blur-sm transition-colors duration-300 hover:bg-secondary sm:top-8 sm:right-8"
          aria-label="Buscar cliente"
        >
          <SearchIcon className="size-6" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="dark control-sheet flex w-[min(88vw,24rem)] flex-col border-border/60 bg-popover p-0 text-popover-foreground shadow-2xl shadow-black/40 duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-md"
      >
        <SheetHeader className="relative gap-2 border-b border-border/60 px-6 py-6">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-primary/80">
            Painel do operador
          </span>
          <SheetTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Selecionar cliente
          </SheetTitle>
          <SheetDescription className="text-sm leading-relaxed text-muted-foreground">
            Coloca o logo do cliente em destaque no telão durante a conversa.
          </SheetDescription>
        </SheetHeader>

        <div
          className="flex flex-1 flex-col gap-4 overflow-hidden p-6"
          onKeyDown={handleKeyDown}
        >
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome…"
            aria-label="Buscar cliente por nome"
            autoFocus
          />

          <ul
            role="listbox"
            aria-label="Clientes"
            className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1"
          >
            {results.length === 0 ? (
              <li className="px-3 py-4 text-sm text-muted-foreground">
                Nenhum cliente encontrado.
              </li>
            ) : (
              results.map((client, index) => {
                const isActive = index === activeIndex
                const isSelected = selectedClient?.logo === client.logo
                return (
                  <li key={client.logo}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(client)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-left transition-colors ${
                        isActive
                          ? "border-border/60 bg-secondary text-foreground"
                          : "hover:bg-secondary/60"
                      }`}
                    >
                      <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-card/60">
                        <Image
                          src={client.logo}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-contain p-1"
                        />
                      </span>
                      <span className="text-sm font-medium">{client.name}</span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>

          {selectedClient ? (
            <button
              type="button"
              onClick={() => {
                onClear()
                setOpen(false)
              }}
              className="w-full rounded-full border border-border/60 bg-transparent px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.32em] text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground"
            >
              Voltar ao carrossel
            </button>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`
Expected: 0 errors.

- [ ] **Step 3: Lint**

Run: `bun run lint`
Expected: 0 errors no escopo do arquivo novo.

- [ ] **Step 4: Commit**

```bash
git add components/client-search-sheet.tsx
git commit -m "feat: adiciona ClientSearchSheet com busca fuzzy"
```

---

## Task 6: Integrar em `event-carousel-stage.tsx`

**Files:**
- Modify: `components/event-carousel-stage.tsx`

- [ ] **Step 1: Adicionar imports**

Topo do arquivo, junto com imports existentes:

```tsx
import { ClientSearchSheet } from "@/components/client-search-sheet"
import { ClientSpotlight } from "@/components/client-spotlight"
import type { Client } from "@/lib/clients"
```

- [ ] **Step 2: Adicionar prop `clients` à signature**

Substituir a assinatura existente do componente:

```tsx
export function EventCarouselStage({
  clients,
  children,
}: Readonly<{
  clients: Client[]
  children: React.ReactNode
}>) {
```

- [ ] **Step 3: Adicionar state `selectedClient`**

Logo abaixo dos states existentes (`speed`, `hasLoadedSavedSpeed`):

```tsx
const [selectedClient, setSelectedClient] = React.useState<Client | null>(null)
```

- [ ] **Step 4: Trocar `{children}` por render condicional**

Encontrar `{children}` no JSX (linha ~113) e substituir por:

```tsx
{selectedClient ? <ClientSpotlight client={selectedClient} /> : children}

<span className="sr-only" aria-live="polite">
  {selectedClient
    ? `Mostrando cliente ${selectedClient.name}`
    : "Carrossel restaurado"}
</span>
```

- [ ] **Step 5: Adicionar `<ClientSearchSheet>` ao final do `<main>`**

Logo antes do `</main>` (após o `</Sheet>` do hamburger):

```tsx
<ClientSearchSheet
  clients={clients}
  selectedClient={selectedClient}
  onSelect={setSelectedClient}
  onClear={() => setSelectedClient(null)}
/>
```

- [ ] **Step 6: Typecheck**

Run: `bun run typecheck`
Expected: 0 errors.

- [ ] **Step 7: Lint**

Run: `bun run lint`
Expected: 0 errors.

- [ ] **Step 8: Commit**

```bash
git add components/event-carousel-stage.tsx
git commit -m "feat: integra spotlight de cliente no EventCarouselStage"
```

---

## Task 7: Editar `app/page.tsx`

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Substituir conteúdo**

```tsx
import { EventCarouselStage } from "@/components/event-carousel-stage"
import { LogoMarquee } from "@/components/logo-marquee"
import { readClients } from "@/lib/clients"

export default function Page() {
  const clients = readClients()

  return (
    <EventCarouselStage clients={clients}>
      <LogoMarquee />
    </EventCarouselStage>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: passa clients da raiz pro EventCarouselStage"
```

---

## Task 8: Smoke test no browser

**Files:** nenhum.

- [ ] **Step 1: Subir dev server**

Run: `bun dev` (background)
Esperar log "Ready in …".

- [ ] **Step 2: Abrir página**

```bash
agent-browser --auto-connect open http://localhost:3000
```

- [ ] **Step 3: Verificar lupa visível e marquee rodando**

Inspecionar visualmente:
- Lupa redonda no canto superior direito.
- Hamburger redondo no canto superior esquerdo (inalterado).
- Marquee de logos rodando normalmente.

- [ ] **Step 4: Abrir drawer de busca**

Click na lupa. Esperado:
- Sheet abre `side="right"`.
- Input com autofocus.
- Lista de clientes alfabética com thumbnails.

- [ ] **Step 5: Buscar fuzzy**

Digitar "aca" (ou termo equivalente do dataset real). Esperado:
- Lista filtra para clientes batendo "Açaí" (acento-insensível).
- Setas ↑↓ movem destaque.
- Enter seleciona o destacado.

- [ ] **Step 6: Selecionar cliente**

Click num item. Esperado:
- Sheet fecha.
- Marquee some, logo único do cliente aparece centralizado.
- Header continua "Marcas Parceiras".

- [ ] **Step 7: Voltar ao carrossel**

Reabrir lupa. Esperado:
- Botão "Voltar ao carrossel" visível no rodapé.
- Click no botão: sheet fecha, marquee volta.

- [ ] **Step 8: Refresh persistência**

`F5` ou recarregar. Esperado:
- Carrossel ativo (não persiste seleção).
- Velocidade do slider preservada (separado, não regrediu).

- [ ] **Step 9: Console limpo**

Run: `agent-browser console snapshot`
Expected: sem erros / hydration warnings vermelhos.

- [ ] **Step 10: Encerrar dev server**

Encerrar o processo background do `bun dev` (ou deixar rodando se for continuar).

---

## Task 9: Atualizar `DESIGN.md`

**Files:**
- Modify: `DESIGN.md`

- [ ] **Step 1: Adicionar seção sobre Spotlight**

Inserir nova seção (sob heading apropriado, p.ex. após a seção de Surfaces):

```markdown
## Spotlight Cliente

Lupa fixa `top-right` (espelho do hamburger `top-left`) abre drawer
`side="right"` com busca fuzzy de clientes. Lista vem de
`data/clients.json` com fallback automático: logos sem entry no JSON
geram entrada de busca pelo filename formatado.

Ao selecionar, marquee é substituído por logo único centralizado
(`<ClientSpotlight>`), estático intencionalmente — palco em modo
conversa não pisca, não anima. Header continua "Marcas Parceiras".
Voltar ao carrossel via botão dentro da drawer. Seleção não persiste:
refresh sempre volta ao carrossel.

Busca: `fuse.js` com normalização NFD + strip diacritics, threshold
0.4, match em `name + aliases`.
```

- [ ] **Step 2: Commit**

```bash
git add DESIGN.md
git commit -m "docs: registra spotlight cliente no DESIGN.md"
```

---

## Self-Review

**Spec coverage:**
- Estado `selectedClient` + render condicional → Task 6.
- `data/clients.json` schema → Task 2 + Task 3 (parser).
- `lib/clients.ts` com `readClients` + autogeração → Task 3.
- `ClientSpotlight` estático com clamps → Task 4.
- `ClientSearchSheet` (lupa + busca fuzzy + lista + footer condicional) → Task 5.
- Fuse com normalização de acentos → Task 5 (`normalize` de Task 3).
- Navegação por teclado ↑↓ Enter → Task 5.
- `aria-live` anúncio → Task 6 Step 4.
- `app/page.tsx` passando `clients` → Task 7.
- `fuse.js` dep → Task 1.
- Smoke test browser → Task 8.
- DESIGN.md update → Task 9.

**Placeholder scan:** nenhum TBD/TODO/"add error handling"/"similar to". Todos blocos de código completos.

**Type consistency:**
- `Client` definido em Task 3, importado em Task 4/5/6 com mesma forma.
- `normalize` exportado em Task 3, importado em Task 5.
- `readClients()` retorna `Client[]`, consumido em Task 7.
- `selectedClient: Client | null` consistente entre Task 6 (state) e Task 5 (prop).
- Props do `ClientSearchSheet`: `clients`, `selectedClient`, `onSelect`, `onClear` — Task 5 define, Task 6 passa todas as quatro.

Sem inconsistências.

---

## Execution Handoff

**Plan saved to `docs/superpowers/plans/2026-05-04-client-spotlight.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — Dispatch fresh subagent per task, review entre tasks, iteração rápida.

**2. Inline Execution** — Executa tasks nesta sessão via executing-plans, batch com checkpoints para revisão.

**Qual abordagem?**
