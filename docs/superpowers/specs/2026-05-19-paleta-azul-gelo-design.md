# Paleta azul-gelo — design

**Data:** 2026-05-19
**Escopo:** Trocar a paleta do palco (creme quente + vermelho-tijolo) e do painel do operador (saffron sobre dark warm) por uma paleta branco-gelo + navy. Auditar tipografia.

## Motivação

O acabamento atual usa um eixo quente (creme `82` + tijolo `28` + saffron `68`). O pedido é migrar para um eixo frio: branco-gelo no palco, navy como accent único, painel do operador também em rampa azul fria. Tipografia já segue o padrão `IBM Plex Sans` (heading) + `Geist` (body) + `Geist Mono` (labels) — confirmar e corrigir desvios.

## Decisão de cores

### `:root` (palco — light)

| Token | Antes | Depois |
|---|---|---|
| `--background` | `oklch(0.965 0.012 82)` | `oklch(0.985 0.004 240)` |
| `--foreground` | `oklch(0.22 0.012 60)` | `oklch(0.22 0.020 250)` |
| `--card` | `oklch(0.98 0.008 82)` | `oklch(0.99 0.003 240)` |
| `--card-foreground` | warm | `oklch(0.22 0.020 250)` |
| `--popover` | `oklch(0.98 0.008 82)` | `oklch(0.99 0.003 240)` |
| `--popover-foreground` | warm | `oklch(0.22 0.020 250)` |
| `--operator-popover` | `oklch(0.24 0.014 62)` | `oklch(0.24 0.020 250)` |
| `--operator-popover-foreground` | warm | `oklch(0.96 0.008 240)` |
| `--primary` | `oklch(0.42 0.18 28)` | `oklch(0.32 0.14 255)` |
| `--primary-foreground` | warm | `oklch(0.985 0.004 240)` |
| `--secondary` | `oklch(0.92 0.014 80)` | `oklch(0.93 0.010 240)` |
| `--secondary-foreground` | warm | `oklch(0.22 0.020 250)` |
| `--muted` | `oklch(0.92 0.014 80)` | `oklch(0.93 0.010 240)` |
| `--muted-foreground` | `oklch(0.46 0.014 70)` | `oklch(0.46 0.020 250)` |
| `--accent` | tijolo | `oklch(0.32 0.14 255)` |
| `--accent-foreground` | warm | `oklch(0.985 0.004 240)` |
| `--destructive` | `oklch(0.55 0.22 28)` | manter (vermelho de erro segue warm — sinal universal) |
| `--border` | `oklch(0.84 0.014 75)` | `oklch(0.86 0.012 240)` |
| `--input` | idem | `oklch(0.86 0.012 240)` |
| `--ring` | tijolo | `oklch(0.32 0.14 255)` |
| `--chart-1..5` | rampa quente tijolo→verde | rampa fria navy→teal: `(0.32 0.14 255)`, `(0.45 0.13 240)`, `(0.58 0.11 220)`, `(0.65 0.09 200)`, `(0.70 0.08 180)` |
| `--sidebar` | `oklch(0.22 0.012 60)` | `oklch(0.22 0.020 250)` |
| `--sidebar-foreground` | warm | `oklch(0.96 0.008 240)` |
| `--sidebar-primary` | saffron | `oklch(0.72 0.14 250)` |
| `--sidebar-primary-foreground` | warm | `oklch(0.22 0.020 250)` |
| `--sidebar-accent` | `oklch(0.30 0.014 62)` | `oklch(0.30 0.018 250)` |
| `--sidebar-accent-foreground` | warm | `oklch(0.96 0.008 240)` |
| `--sidebar-border` | `oklch(0.38 0.018 65)` | `oklch(0.38 0.020 250)` |
| `--sidebar-ring` | saffron | `oklch(0.72 0.14 250)` |

### `.dark` (operator sheet)

| Token | Antes | Depois |
|---|---|---|
| `--background` | `oklch(0.22 0.012 60)` | `oklch(0.22 0.020 250)` |
| `--foreground` | warm 80 | `oklch(0.96 0.008 240)` |
| `--card` | `oklch(0.27 0.014 62)` | `oklch(0.27 0.018 250)` |
| `--popover` | `oklch(0.24 0.014 62)` | `oklch(0.24 0.020 250)` |
| `--primary` | `oklch(0.82 0.18 68)` saffron | `oklch(0.72 0.14 250)` azul luminoso |
| `--primary-foreground` | warm | `oklch(0.22 0.020 250)` |
| `--secondary` | `oklch(0.32 0.016 62)` | `oklch(0.32 0.018 250)` |
| `--muted` | `oklch(0.30 0.014 62)` | `oklch(0.30 0.018 250)` |
| `--muted-foreground` | `oklch(0.74 0.012 70)` | `oklch(0.74 0.014 240)` |
| `--accent` | saffron | `oklch(0.72 0.14 250)` |
| `--accent-foreground` | warm | `oklch(0.22 0.020 250)` |
| `--destructive` | `oklch(0.66 0.20 28)` | manter |
| `--border` | `oklch(0.38 0.018 65)` | `oklch(0.38 0.020 250)` |
| `--input` | idem | idem |
| `--ring` | saffron | `oklch(0.72 0.14 250)` |

**Princípio:** preservar a luminância (`L`) original em cada token e mover apenas hue (`H`) para `240–255` e ajustar `C` para soar como azul (não cinza-azulado). Isso mantém contraste e hierarquia visual idênticos.

## Tipografia

Varrer `components/event-carousel-stage.tsx`, `components/client-search-sheet.tsx`, `components/client-spotlight.tsx`, `components/logo-marquee.tsx`, `app/page.tsx`. Regras:

- Headings de Sheet, título do palco → `font-heading` (IBM Plex Sans, semibold).
- Mini-labels uppercase (kicker, eyebrow, hint) → `font-mono text-[0.62rem] tracking-[0.32em] uppercase`.
- Body/UI sem classe explícita → herda Geist via `html.font-sans` no `app/layout.tsx`.
- Números numéricos isolados (duração, velocidade) → `font-mono`.

Reportar e corrigir desvios. Esperativa: a base já está alinhada — auditoria deve achar 0–2 ajustes.

## Alterações em arquivos

1. `app/globals.css` — reescrever blocos `:root` e `.dark` e atualizar o comment header do tema (de "warm cream surface, charcoal text, single brick-red accent" para "ice white surface, cool charcoal text, single navy accent").
2. `DESIGN.md` — atualizar `## Theme`, `## Color strategy`, `### Tokens (light)`, `### Tokens (dark — apenas operator sheet)`. Substituir referências a "creme", "papel quente", "vermelho-tijolo", "saffron", "rampa quente" pelas novas descrições.
3. Componentes — apenas se a auditoria de tipografia achar desvio. Sem mudanças estruturais previstas.

## Plano de verificação

- `npm run typecheck` → sem novos erros.
- `npm run lint` → sem novos warnings.
- `npm run dev` + `agent-browser` no Brave em `localhost:3000`:
  - Confirmar palco com fundo branco-gelo, header centralizado lê bem.
  - Marquee com logos coloridos (laranjas, vermelhos, roxos das marcas de açaí) — checar se nenhum vira "manchas" sobre branco. Esperado: contraste mais alto que antes.
  - Sheet esquerdo (velocidade): fundo escuro frio, accent azul luminoso, slider e labels mono lêem.
  - Sheet direito (busca): mesmo tratamento. Selecionar um cliente, conferir `ClientSpotlight` sobre branco-gelo.
- Conferir contraste: foreground navy `0.22` sobre branco gelo `0.985` ≈ 9.5:1 (AAA). Accent navy `0.32` sobre branco gelo ≈ 7:1 (AA grande).

## Riscos e mitigação

- **Branco puro queima no telão.** `0.985` (1.5% off) com cromaticidade `0.004` em hue 240 dá um branco com leve veio azul — não é cinza, mas não queima.
- **Navy escuro em telão com luz ambiente alta pode "vibrar" sobre branco.** A escolha `0.32 0.14 255` mantém saturação contida; se em campo o azul ficar duro, alternativa é subir L para `0.36` (próxima iteração, fora desta spec).
- **Logos `.jpg` com fundo branco viram "retângulos" mais discretos sobre branco-gelo do que sobre creme.** Já é estética aceita no DESIGN.md (parede de patrocinadores). Sem mitigação necessária.

## Fora do escopo

- Trocar família tipográfica.
- Mudar layout, animações, escala de logos.
- Adicionar darkmode toggle ao palco — segue light-only por design.
