# CLAUDE.md

Slide de telão para feiras/eventos do segmento de açaí e alimentos regionais.
Exibe, em loop infinito, os logos das marcas parceiras. Para contexto de produto
e princípios de design, veja `PRODUCT.md` e `DESIGN.md` — leia-os antes de mexer
no visual.

## Comandos

```bash
npm run dev        # servidor de dev (Next 16, Turbopack) — porta 3000
npm run build      # build de produção
npm run start      # serve o build
npm run lint       # ESLint (flat config)
npm run typecheck  # tsc --noEmit
npm run format     # Prettier em **/*.{ts,tsx}
```

Antes de afirmar "feito": rode `npm run typecheck` e `npm run lint`.

## Arquitetura

Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui (estilo `radix-luma`).

Fluxo de uma tela única (`app/page.tsx`, RSC):

```
page.tsx (server)
 └─ readClients()  →  lê public/brand-logos/ + data/clients.json
 └─ EventCarouselStage (client)        ← estado: speed, selectedClient
     ├─ LogoMarquee        (carrossel padrão, loop infinito)
     ├─ ClientSpotlight    (renderiza quando há cliente selecionado)
     ├─ Sheet esquerdo     (controle de velocidade)
     └─ ClientSearchSheet  (Sheet direito, busca fuzzy via Fuse.js)
```

`EventCarouselStage` alterna entre `LogoMarquee` e `ClientSpotlight` conforme
`selectedClient`. A velocidade vira a CSS var `--brand-marquee-duration` no
elemento `<main>`, consumida pela animação `brand-marquee-scroll` em
`app/globals.css`.

## Fonte de dados dos logos

- **Verdade primária:** arquivos de imagem em `public/brand-logos/`
  (extensões aceitas: png, jpg, jpeg, webp, avif, gif, svg).
- **Enriquecimento opcional:** `data/clients.json` — array de
  `{ name, logo, aliases? }`. `logo` deve ser o nome de arquivo exato dentro de
  `public/brand-logos/`. Entradas sem arquivo correspondente são ignoradas (e
  emitem `console.warn` em dev).
- Logo **sem** entrada no JSON ainda aparece: o `name` é derivado do nome do
  arquivo (`acai-do-nelson.png` → "Acai Do Nelson"). O JSON serve para corrigir
  acentuação/capitalização e adicionar `aliases` de busca.

## Gotchas

- **`lib/clients.ts` vs `lib/clients-shared.ts`:** `clients.ts` usa Node `fs` e
  só pode ser importado em código de servidor. `clients-shared.ts` é isomórfico
  (`Client` type + `normalize()`) e é o que componentes `"use client"` importam.
  Não importe `lib/clients.ts` em componente client — quebra o build.
- **Fonte de dados única:** `readClients()` em `lib/clients.ts` é a única
  leitura do filesystem. `app/page.tsx` chama essa função e repassa a mesma
  lista `Client[]` para `LogoMarquee` e `ClientSearchSheet` via prop — não
  releia o diretório de logos em outro lugar.
- **Velocidade é exponencial:** o slider (1–50) mapeia para duração via
  interpolação exponencial (`SLOW_DURATION` 360s → `FAST_DURATION` 18s), então
  cada passo é uma variação percentual constante. Ver `getDurationSeconds()` em
  `event-carousel-stage.tsx`.
- **Velocidade persiste em `localStorage`** (`brand-carousel-speed`). A escrita
  espera o primeiro carregamento (`hasLoadedSavedSpeed`) para não sobrescrever o
  valor salvo com o default no mount.
- **Tema:** o palco usa o scope claro (`:root`); os Sheets de controle forçam
  `.dark` na `className` para a UI do operador parecer distinta da tela ao vivo.

## Convenções

- Sem ponto-e-vírgula, aspas duplas (config Prettier).
- Imports via alias `@/*` (raiz do projeto).
- Texto de UI em PT-BR com acentuação completa.
- shadcn/ui: adicionar componentes com `npx shadcn@latest add <nome>` →
  vão para `components/ui/`.
- Cores em `oklch` via CSS vars em `app/globals.css`; não hardcode hex.
