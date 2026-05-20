# Paleta azul-gelo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar paleta do slide (palco creme + tijolo, painel saffron) para branco-gelo + navy, auditar tipografia, atualizar DESIGN.md.

**Architecture:** Mudanças puramente em design tokens (`app/globals.css`) preservando luminância e estrutura. Spec [`docs/superpowers/specs/2026-05-19-paleta-azul-gelo-design.md`](../specs/2026-05-19-paleta-azul-gelo-design.md) define todos os valores `oklch` finais. Verificação por `typecheck` + `lint` + smoke visual em browser.

**Tech Stack:** Next.js 16 (App Router), Tailwind v4 com CSS vars `oklch`, shadcn/ui.

---

## File Structure

- **Modify:** `app/globals.css` — blocos `:root` (linhas ~14–55), `.dark` (~62–82), e o comment header do tema (~5–14).
- **Modify:** `DESIGN.md` — seções `## Theme`, `## Color strategy`, `### Tokens (light)`, `### Tokens (dark — apenas operator sheet)`.
- **Read-only audit:** `components/event-carousel-stage.tsx`, `components/client-search-sheet.tsx`, `components/client-spotlight.tsx`, `components/logo-marquee.tsx`, `app/page.tsx`, `app/layout.tsx`. Modificar apenas se a auditoria encontrar desvio tipográfico.

Nenhum arquivo novo. Sem testes unitários (mudança puramente visual de tokens).

---

### Task 1: Reescrever bloco `:root` em globals.css

**Files:**
- Modify: `app/globals.css` (bloco `:root`)

- [ ] **Step 1: Substituir o bloco `:root` inteiro**

Localize o bloco `:root { ... }` (após o comentário inicial e o `@custom-variant dark`). Substitua o conteúdo inteiro por:

```css
:root {
    --background: oklch(0.985 0.004 240);
    --foreground: oklch(0.22 0.020 250);
    --card: oklch(0.99 0.003 240);
    --card-foreground: oklch(0.22 0.020 250);
    --popover: oklch(0.99 0.003 240);
    --popover-foreground: oklch(0.22 0.020 250);
    --operator-popover: oklch(0.24 0.020 250);
    --operator-popover-foreground: oklch(0.96 0.008 240);
    --primary: oklch(0.32 0.14 255);
    --primary-foreground: oklch(0.985 0.004 240);
    --secondary: oklch(0.93 0.010 240);
    --secondary-foreground: oklch(0.22 0.020 250);
    --muted: oklch(0.93 0.010 240);
    --muted-foreground: oklch(0.46 0.020 250);
    --accent: oklch(0.32 0.14 255);
    --accent-foreground: oklch(0.985 0.004 240);
    --destructive: oklch(0.55 0.22 28);
    --border: oklch(0.86 0.012 240);
    --input: oklch(0.86 0.012 240);
    --ring: oklch(0.32 0.14 255);
    --chart-1: oklch(0.32 0.14 255);
    --chart-2: oklch(0.45 0.13 240);
    --chart-3: oklch(0.58 0.11 220);
    --chart-4: oklch(0.65 0.09 200);
    --chart-5: oklch(0.70 0.08 180);
    --radius: 0.625rem;
    --sidebar: oklch(0.22 0.020 250);
    --sidebar-foreground: oklch(0.96 0.008 240);
    --sidebar-primary: oklch(0.72 0.14 250);
    --sidebar-primary-foreground: oklch(0.22 0.020 250);
    --sidebar-accent: oklch(0.30 0.018 250);
    --sidebar-accent-foreground: oklch(0.96 0.008 240);
    --sidebar-border: oklch(0.38 0.020 250);
    --sidebar-ring: oklch(0.72 0.14 250);
}
```

Nota: `--destructive` permanece warm intencionalmente (vermelho de erro é sinal universal).

- [ ] **Step 2: Verificar build**

Run: `npm run typecheck`
Expected: PASS (mudança em CSS não afeta TS).

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 3: Não commitar ainda** — Task 2 mexe no mesmo arquivo.

---

### Task 2: Reescrever bloco `.dark` em globals.css

**Files:**
- Modify: `app/globals.css` (bloco `.dark`)

- [ ] **Step 1: Substituir o bloco `.dark` inteiro**

Localize `.dark { ... }` (após o comentário do operator sheet). Substitua o conteúdo por:

```css
.dark {
    --background: oklch(0.22 0.020 250);
    --foreground: oklch(0.96 0.008 240);
    --card: oklch(0.27 0.018 250);
    --card-foreground: oklch(0.96 0.008 240);
    --popover: oklch(0.24 0.020 250);
    --popover-foreground: oklch(0.96 0.008 240);
    --primary: oklch(0.72 0.14 250);
    --primary-foreground: oklch(0.22 0.020 250);
    --secondary: oklch(0.32 0.018 250);
    --secondary-foreground: oklch(0.96 0.008 240);
    --muted: oklch(0.30 0.018 250);
    --muted-foreground: oklch(0.74 0.014 240);
    --accent: oklch(0.72 0.14 250);
    --accent-foreground: oklch(0.22 0.020 250);
    --destructive: oklch(0.66 0.20 28);
    --border: oklch(0.38 0.020 250);
    --input: oklch(0.38 0.020 250);
    --ring: oklch(0.72 0.14 250);
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

---

### Task 3: Atualizar comment header do tema em globals.css

**Files:**
- Modify: `app/globals.css` (comentário multi-line antes de `:root`)

- [ ] **Step 1: Substituir o comentário do tema**

Localize o comentário que começa com `* Light stage tuned for big-screen broadcast at trade events.` (antes do `:root`). Substitua o bloco inteiro de comentário por:

```css
/*
 * Light stage tuned for big-screen broadcast at trade events. The slide
 * references printed sponsor walls and stadium scoreboards: cool ice-white
 * surface, charcoal text, single deep-navy accent. No ambient gradients,
 * no glow halos. Logos sit directly on the stage so the screen reads like
 * a sponsor wall instead of a generated dashboard.
 *
 * The control sheet still uses the dark scope (.dark) with a luminous
 * blue accent so the operator UI feels distinct from the live stage.
 */
```

E o comentário antes do `.dark` block:

```css
/*
 * .dark scope is used only by the operator's control sheet. Cool dark
 * surface with luminous blue accent — distinct from the ice-white stage
 * so the panel reads as a separate piece of UI floating over it.
 */
```

- [ ] **Step 2: Commit globals.css**

```bash
git add app/globals.css
git commit -m "refactor(theme): migra paleta para branco-gelo + navy"
```

---

### Task 4: Atualizar DESIGN.md

**Files:**
- Modify: `DESIGN.md` (seções `## Theme`, `## Color strategy`, `### Tokens (light)`, `### Tokens (dark — apenas operator sheet)`)

- [ ] **Step 1: Atualizar seção `## Theme`**

Substitua o parágrafo que começa com `**Light stage**, sempre.` por:

```markdown
**Light stage**, sempre. O slide é exibido em telão grande no pavilhão da
feira. Ambiente de pavilhão tem luz mista (palco iluminado, gente circulando,
às vezes janela), e o tipo de marcas exibidas (alimentos regionais, açaí,
sorvete, polpa) já são logos coloridos, geralmente sobre branco — fundo
branco-gelo casa com a maioria dos arquivos `.jpg` e mantém o slide legível
mesmo com luz ambiente alta.

O painel de controle do operador (sheet lateral) é dark, em propósito: separa
visualmente a UI administrativa da superfície de exibição ao vivo.
```

- [ ] **Step 2: Atualizar seção `## Color strategy`**

Substitua o parágrafo `**Restrained.** ...` por:

```markdown
**Restrained.** A superfície inteira é branco-gelo levemente azulado
(`oklch(0.985 0.004 240)`), foreground carvão frio, e um único accent navy
profundo (`oklch(0.32 0.14 255)`) cuida das raríssimas marcações de
identidade — bolinha da label do header, foco, hover. Nenhum gradiente
decorativo, nenhum halo, nenhuma atmosfera. Os logos coloridos das marcas
carregam toda a informação visual.

A categoria-reflex óbvia ("evento de açaí → roxo, neon, atmosférico, glow") foi
explicitamente abandonada. Referência mental: parede de patrocinadores em
transmissão esportiva, cartaz de feira impresso, scoreboard.
```

- [ ] **Step 3: Atualizar `### Tokens (light)`**

Substitua a lista por:

```markdown
- `--background` `oklch(0.985 0.004 240)` — branco-gelo
- `--foreground` `oklch(0.22 0.020 250)` — carvão frio
- `--card` / `--popover` `oklch(0.99 0.003 240)`
- `--primary` `oklch(0.32 0.14 255)` — navy profundo
- `--primary-foreground` `oklch(0.985 0.004 240)`
- `--muted` `oklch(0.93 0.010 240)`
- `--muted-foreground` `oklch(0.46 0.020 250)`
- `--border` `oklch(0.86 0.012 240)`
- `--ring` casado com `--primary`
```

- [ ] **Step 4: Atualizar `### Tokens (dark — apenas operator sheet)`**

Substitua por:

```markdown
- `--background` `oklch(0.22 0.020 250)`
- `--primary` `oklch(0.72 0.14 250)` — azul luminoso, distingue painel do palco
- demais tokens em rampa fria compatível
```

- [ ] **Step 5: Verificar e commitar**

```bash
git diff DESIGN.md
```

Expected: apenas os 4 trechos acima alterados.

```bash
git add DESIGN.md
git commit -m "docs(design): atualiza DESIGN.md para paleta azul-gelo"
```

---

### Task 5: Auditoria tipográfica

**Files:**
- Read-only audit: `app/layout.tsx`, `app/page.tsx`, `components/event-carousel-stage.tsx`, `components/client-search-sheet.tsx`, `components/client-spotlight.tsx`, `components/logo-marquee.tsx`.

Regras (de DESIGN.md `## Typography` + CLAUDE.md):
1. Heading visual (header do palco, título de Sheet) → classe `font-heading` (IBM Plex Sans).
2. Mini-labels uppercase (kicker/eyebrow/hint) → `font-mono text-[0.62rem] tracking-[0.32em] uppercase`.
3. Body/UI sem classe explícita → herda Geist via `<html className="font-sans">`.
4. Números isolados (duração, velocidade, badge) → `font-mono`.

- [ ] **Step 1: Verificar layout root**

Read `app/layout.tsx`. Confirmar que:
- `IBM_Plex_Sans` está importada com `variable: "--font-heading"`.
- `Geist` com `variable: "--font-sans"`.
- `Geist_Mono` com `variable: "--font-mono"`.
- `<html>` recebe as três variables + `className="font-sans"`.

Expected: tudo já correto (estado atual).

- [ ] **Step 2: Auditar event-carousel-stage.tsx**

Read `components/event-carousel-stage.tsx`. Para cada uso de tipografia, checar contra as 4 regras. Casos esperados de bater:
- `SheetTitle` → `font-heading text-xl font-semibold tracking-tight`.
- Kickers uppercase → `font-mono text-[0.62rem] tracking-[0.32em] uppercase`.
- Badges de número (velocidade, duração) → `font-mono`.
- `<kbd>` → `font-mono`.

Anote linhas com desvio (se houver).

- [ ] **Step 3: Auditar client-search-sheet.tsx**

Read `components/client-search-sheet.tsx`. Mesmas regras. Mesmo padrão esperado.

- [ ] **Step 4: Auditar client-spotlight.tsx e logo-marquee.tsx e app/page.tsx**

Read os três. `logo-marquee.tsx` linha 64 já usa `font-mono` em código inline — correto. `client-spotlight.tsx` provavelmente é apenas imagem + nome (heading) — checar nome usa `font-heading`. `app/page.tsx` é RSC com cabeçalho do palco — confirmar uso de `font-heading` no título e `font-mono tracking-[0.32em] uppercase` em qualquer kicker.

- [ ] **Step 5: Corrigir desvios (se houver)**

Se a auditoria nas Tasks 5.2–5.4 encontrou desvio, edite o componente correspondente para alinhar. Para cada correção:

```bash
git diff <arquivo>
git add <arquivo>
git commit -m "style(typography): alinha <componente> com DESIGN.md"
```

Se nenhum desvio: registrar no relatório final "auditoria limpa, sem mudanças".

- [ ] **Step 6: Verificar build após qualquer correção**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

---

### Task 6: Verificação visual no browser

**Files:** nenhum a editar — apenas inspeção.

- [ ] **Step 1: Subir dev server**

Run: `npm run dev` (em background ou outro terminal).
Expected: server em `http://localhost:3000`.

- [ ] **Step 2: Carregar skill do agent-browser**

Run: `agent-browser skills get core`
Expected: workflow oficial impresso.

- [ ] **Step 3: Conectar Brave + abrir página**

```bash
brave --remote-debugging-port=9222 --user-data-dir=$HOME/.config/BraveSoftware/Brave-Browser >/dev/null 2>&1 &
sleep 2
agent-browser --cdp 9222 navigate http://localhost:3000
agent-browser --cdp 9222 snapshot
```

(Ou `agent-browser --auto-connect` se Brave já estiver com `--remote-debugging-port=9222`.)

Expected: snapshot do palco. Confirmar visualmente:
- Background branco-gelo (não creme, não branco puro).
- Header lê em carvão frio.
- Logos do marquee não "queimam" — contraste alto, leitura nítida.

- [ ] **Step 4: Abrir Sheet de velocidade (esquerdo)**

```bash
agent-browser --cdp 9222 click "@<ref do botão hamburger superior esquerdo>"
agent-browser --cdp 9222 snapshot
```

Expected: Sheet dark frio com accent azul luminoso. Slider, labels mono e botões lêem.

- [ ] **Step 5: Abrir Sheet de busca (direito) e selecionar cliente**

```bash
agent-browser --cdp 9222 click "@<ref da lupa superior direita>"
agent-browser --cdp 9222 type "@<ref do input>" "acai"
agent-browser --cdp 9222 click "@<ref do primeiro resultado>"
agent-browser --cdp 9222 snapshot
```

Expected: `ClientSpotlight` sobre branco-gelo, logo centralizado nítido.

- [ ] **Step 6: Voltar ao carrossel e parar o dev server**

```bash
agent-browser --cdp 9222 click "@<ref do botão voltar dentro do sheet>"
# stop dev server (Ctrl-C no terminal correspondente ou kill do PID)
```

- [ ] **Step 7: Resumo final**

Reportar ao usuário: paleta migrada, tipografia auditada (limpa OU N correções), build verde, smoke visual passou. Listar commits criados:
- `refactor(theme): migra paleta para branco-gelo + navy`
- `docs(design): atualiza DESIGN.md para paleta azul-gelo`
- (opcional) `style(typography): ...` se a auditoria fez correções.

---

## Self-Review

- **Spec coverage:** todas as 32 trocas de token de `:root`, todas as 17 de `.dark`, comments header, DESIGN.md (4 seções), auditoria tipográfica, verificação `typecheck/lint/visual` — cobertos em Tasks 1–6.
- **Placeholders:** nenhum "TBD"/"TODO"/"implementar depois". Refs `@<ref>` em Task 6 são placeholders esperados em workflow agent-browser (refs vêm do snapshot ao vivo, não dá para hardcodar).
- **Type consistency:** sem types/funções neste plano (CSS-only + docs).
- **Riscos cobertos:** `--destructive` mantido warm intencionalmente (documentado na Task 1).
