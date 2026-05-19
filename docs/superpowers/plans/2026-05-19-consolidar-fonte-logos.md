# Consolidar fonte de dados dos logos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar `readClients()` a única leitura do filesystem, transformando `LogoMarquee` em componente apresentacional, e atualizar README/CLAUDE.md.

**Architecture:** `LogoMarquee` deixa de usar `fs` e passa a receber `clients: Client[]` via prop. `app/page.tsx` repassa a lista que já obtém de `readClients()`. Carrossel e busca ficam sincronizados.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript.

**Nota sobre testes:** o projeto não tem framework de testes. A verificação de cada task é `npm run typecheck` + `npm run lint` + `npm run build`.

---

### Task 1: `LogoMarquee` vira componente apresentacional

**Files:**
- Modify: `components/logo-marquee.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Reescrever `components/logo-marquee.tsx`**

Substituir o conteúdo inteiro do arquivo por:

```tsx
import Image from "next/image"

import type { Client } from "@/lib/clients-shared"

function LogoSet({
  clients,
  hidden = false,
  startIndex = 0,
}: {
  clients: Client[]
  hidden?: boolean
  startIndex?: number
}) {
  return (
    <ul
      aria-hidden={hidden}
      className="brand-marquee__group flex shrink-0 items-center"
    >
      {clients.map((client, index) => (
        <li
          key={client.logo}
          className="brand-marquee__item shrink-0"
          style={{ "--i": String(startIndex + index) } as React.CSSProperties}
        >
          <Image
            src={client.logo}
            alt={hidden ? "" : `Logo ${client.name}`}
            width={1400}
            height={500}
            loading="eager"
            sizes="(min-width: 1400px) 880px, 34vw"
            className="brand-marquee__logo h-auto w-full object-contain"
            draggable={false}
          />
        </li>
      ))}
    </ul>
  )
}

export function LogoMarquee({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    if (process.env.NODE_ENV !== "development") {
      return (
        <section
          aria-label="Marcas parceiras"
          className="brand-marquee relative flex w-full items-center overflow-hidden"
        />
      )
    }

    return (
      <section
        aria-label="Marcas parceiras"
        className="brand-marquee relative flex w-full items-center justify-center overflow-hidden"
      >
        <p className="brand-marquee__empty">
          Adicione logos em{" "}
          <code className="font-mono">/public/brand-logos/</code>
          {" "}para preencher o palco.
        </p>
      </section>
    )
  }

  return (
    <section
      aria-label="Marcas parceiras"
      className="brand-marquee relative flex w-full items-center overflow-hidden"
    >
      <div className="brand-marquee__viewport relative w-full overflow-hidden">
        <div className="brand-marquee__track flex w-max items-center">
          <LogoSet clients={clients} startIndex={0} />
          <LogoSet clients={clients} hidden startIndex={clients.length} />
        </div>
      </div>
    </section>
  )
}
```

Isso remove `readdirSync`, `join`, `IMAGE_EXTENSIONS`, o tipo `BrandLogo` e a função `readBrandLogos()`.

- [ ] **Step 2: Atualizar `app/page.tsx`**

Trocar `<LogoMarquee />` por `<LogoMarquee clients={clients} />`. O resultado final do arquivo:

```tsx
import { EventCarouselStage } from "@/components/event-carousel-stage"
import { LogoMarquee } from "@/components/logo-marquee"
import { readClients } from "@/lib/clients"

export default function Page() {
  const clients = readClients()

  return (
    <EventCarouselStage clients={clients}>
      <LogoMarquee clients={clients} />
    </EventCarouselStage>
  )
}
```

- [ ] **Step 3: Verificar typecheck e lint**

Run: `npm run typecheck && npm run lint`
Expected: ambos sem erros.

- [ ] **Step 4: Verificar build**

Run: `npm run build`
Expected: build conclui sem erros.

- [ ] **Step 5: Commit**

```bash
git add components/logo-marquee.tsx app/page.tsx
git commit -m "refactor: LogoMarquee recebe clients via prop"
```

---

### Task 2: Reescrever `README.md`

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Substituir o conteúdo de `README.md` por:**

```markdown
# Slide de Marcas — Feiras e Eventos

Slide de telão para feiras e eventos do segmento de açaí, polpas, sorvetes e
alimentos regionais. Exibe, em loop infinito, os logos das marcas parceiras do
evento. Veja `PRODUCT.md` e `DESIGN.md` para contexto de produto e design, e
`CLAUDE.md` para detalhes técnicos.

## Rodar localmente

```bash
npm install
npm run dev   # http://localhost:3000
```

## Adicionar uma marca

1. Coloque o arquivo de imagem do logo em `public/brand-logos/`
   (png, jpg, jpeg, webp, avif, gif ou svg).
2. O logo já aparece no carrossel — o nome é derivado do nome do arquivo
   (`acai-do-nelson.png` → "Acai Do Nelson").
3. Opcional: para corrigir acentuação/capitalização ou adicionar termos de
   busca, acrescente uma entrada em `data/clients.json`:

   ```json
   {
     "name": "Açaí do Nelson",
     "logo": "acai-do-nelson.png",
     "aliases": ["nelson açaí"]
   }
   ```

   O campo `logo` deve ser o nome de arquivo exato dentro de
   `public/brand-logos/`.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: reescreve README para o produto real"
```

---

### Task 3: Atualizar gotcha no `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Substituir o bullet "Duas leituras do diretório de logos"**

Localizar este bullet na seção `## Gotchas`:

```markdown
- **Duas leituras do diretório de logos:** `LogoMarquee` relê
  `public/brand-logos/` por conta própria (não recebe props), enquanto
  `ClientSearchSheet` recebe a lista `clients` da raiz. São caminhos de dados
  independentes — alterar um não afeta o outro.
```

Substituir por:

```markdown
- **Fonte de dados única:** `readClients()` em `lib/clients.ts` é a única
  leitura do filesystem. `app/page.tsx` chama essa função e repassa a mesma
  lista `Client[]` para `LogoMarquee` e `ClientSearchSheet` via prop — não
  releia o diretório de logos em outro lugar.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: atualiza gotcha de fonte de dados no CLAUDE.md"
```

---

## Verificação final

- [ ] `npm run typecheck` — sem erros.
- [ ] `npm run lint` — sem erros.
- [ ] `npm run build` — build conclui.
- [ ] `npm run dev` — o carrossel renderiza os logos ordenados por nome;
  a busca continua funcionando e o spotlight de cliente abre normalmente.
