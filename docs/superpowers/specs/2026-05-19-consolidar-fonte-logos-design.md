# Consolidar fonte de dados dos logos + atualizar docs

**Data:** 2026-05-19

## Problema

O projeto lê o diretório `public/brand-logos/` por dois caminhos independentes:

- `lib/clients.ts` → `readClients()`, chamado em `app/page.tsx`, alimenta
  `EventCarouselStage` e `ClientSearchSheet`.
- `components/logo-marquee.tsx` → `readBrandLogos()`, faz sua própria leitura
  via `fs` e monta `{ name, src }`.

Consequência: nomes e ordenação podem divergir entre o carrossel e a busca, e
qualquer ajuste em `readClients()` (acentuação, aliases, filtros) não chega ao
carrossel. O `README.md` também é o boilerplate genérico do template Next.js,
sem relação com o produto real.

## Objetivo

Tornar `readClients()` a **única** leitura do filesystem. `LogoMarquee` vira um
componente puramente apresentacional que recebe a lista pronta. Atualizar
`README.md` e `CLAUDE.md` para refletir o estado consolidado.

## Mudanças

### 1. `components/logo-marquee.tsx` — componente apresentacional

- Remover: `import { readdirSync }`, `import { join }`, `IMAGE_EXTENSIONS`,
  o tipo `BrandLogo` e a função `readBrandLogos()`.
- `LogoMarquee` passa a receber `clients: Client[]` via prop
  (`import type { Client } from "@/lib/clients-shared"`).
- `LogoSet` passa a iterar `Client[]`: usa `client.logo` (caminho já no formato
  `/brand-logos/...`) no `src` e `key`, e `client.name` no `alt`.
- Empty state: trocar a checagem `logos.length === 0` por `clients.length === 0`.
  Manter o aviso de dev e o `<section>` vazio em produção.
- Continua server component (sem `"use client"`); apenas recebe props.

### 2. `app/page.tsx` — passar `clients` ao marquee

- Trocar `<LogoMarquee />` por `<LogoMarquee clients={clients} />`.
  `clients` já existe na função (vem de `readClients()`).

### 3. `README.md` — reescrever para o produto real

Substituir o boilerplate por: descrição do slide de marcas, `npm run dev`, e
como adicionar uma marca (imagem em `public/brand-logos/` + entrada opcional em
`data/clients.json` para acentuação/aliases). Apontar para `PRODUCT.md`,
`DESIGN.md` e `CLAUDE.md`.

### 4. `CLAUDE.md` — atualizar gotcha

O gotcha "Duas leituras do diretório de logos" deixa de existir. Substituir por
uma nota curta: `readClients()` em `lib/clients.ts` é a fonte única; o marquee
recebe a lista por prop.

## Efeito colateral aceito

A ordem do carrossel passa de ordenação por nome de arquivo para ordenação por
nome em pt-BR (`readClients()` já ordena com `localeCompare`). Decisão
confirmada: ordem por nome pt-BR, consistente com a busca.

## Não-objetivos

- Ordem manual de logos controlável pelos organizadores (projeto próprio).
- Qualquer mudança de animação, estilo ou layout do carrossel.

## Verificação

- `npm run typecheck` — sem erros.
- `npm run lint` — sem erros.
- `npm run build` — build conclui.
- `npm run dev` — carrossel renderiza os logos; busca continua funcionando.
