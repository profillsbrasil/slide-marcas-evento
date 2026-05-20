# Design

## Theme

**Light stage**, sempre. O slide é exibido em telão grande no pavilhão da
feira. Ambiente de pavilhão tem luz mista (palco iluminado, gente circulando,
às vezes janela), e o tipo de marcas exibidas (alimentos regionais, açaí,
sorvete, polpa) já são logos coloridos, geralmente sobre branco — fundo
branco-gelo casa com a maioria dos arquivos `.jpg` e mantém o slide legível
mesmo com luz ambiente alta.

O painel de controle do operador (sheet lateral) é dark, em propósito: separa
visualmente a UI administrativa da superfície de exibição ao vivo.

## Color strategy

**Restrained.** A superfície inteira é branco-gelo levemente azulado
(`oklch(0.985 0.004 240)`), foreground carvão frio, e um único accent navy
profundo (`oklch(0.32 0.14 255)`) cuida das raríssimas marcações de
identidade — bolinha da label do header, foco, hover. Nenhum gradiente
decorativo, nenhum halo, nenhuma atmosfera. Os logos coloridos das marcas
carregam toda a informação visual.

A categoria-reflex óbvia ("evento de açaí → roxo, neon, atmosférico, glow") foi
explicitamente abandonada. Referência mental: parede de patrocinadores em
transmissão esportiva, cartaz de feira impresso, scoreboard.

### Tokens (light)

- `--background` `oklch(0.985 0.004 240)` — branco-gelo
- `--foreground` `oklch(0.22 0.020 250)` — carvão frio
- `--card` / `--popover` `oklch(0.99 0.003 240)`
- `--primary` `oklch(0.32 0.14 255)` — navy profundo
- `--primary-foreground` `oklch(0.985 0.004 240)`
- `--muted` `oklch(0.93 0.010 240)`
- `--muted-foreground` `oklch(0.46 0.020 250)`
- `--border` `oklch(0.86 0.012 240)`
- `--ring` casado com `--primary`

### Tokens (dark — apenas operator sheet)

- `--background` `oklch(0.22 0.020 250)`
- `--primary` `oklch(0.72 0.14 250)` — azul luminoso, distingue painel do palco
- demais tokens em rampa fria compatível

## Typography

- **Heading** (header do palco, título do sheet): `IBM Plex Sans` — referência
  regional, peso semibold, uppercase com `tracking-[0.32em]` no header.
- **Body / UI**: Geist Sans.
- **Mono** (números de velocidade, duração, badges no header): Geist Mono
  uppercase com tracking idêntico, dialoga com o heading.

## Motion

Easing único: `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quart). Nada de
bounce, nada de spring, nada decorativo.

- `brand-marquee-scroll` linear, infinito, controlado pelo usuário. Range
  1–50, ciclo 600s (mais lento) → 18s (mais rápido), interpolação exponencial
  (cada step é uma diferença percentual constante). Marquee **nunca pausa**:
  sheet aberto, hover, foco — todos seguem rodando. O palco é superfície
  pública e não pode congelar enquanto operador ajusta.
- Entrada inicial: cascata sutil de fade + translate-y (16px → 0) por logo
  com stagger determinístico (`--i × 28ms`), 700ms ease-out-quart.
- **Removido** em relação às iterações anteriores: bob por logo, spotlight
  sweep, breath dos gradientes do stage, film grain. Tudo isso foi
  classificado como "cara de IA" e cortado.

Tudo respeita `prefers-reduced-motion: reduce`.

## Surfaces

- **Stage** (`.event-stage`): coluna flex ocupando 100svh, fundo sólido creme.
- **Header**: logo PROFILLS (`/public/logo.png`) centralizado, em escala contida
  para sinalizar o organizador sem competir com os logos parceiros. Sem label,
  sem bolinha, sem fio/borda abaixo — header respira direto pro palco, sem
  moldura.
- **Marquee** (`.brand-marquee`): `flex: 1` — toma todo o espaço vertical
  restante. Sem fundo, sem borda, sem sombra de container.
- **Logo item**: `clamp(540, 34vw, 880)px` largura, altura clampada a
  `clamp(340, 52svh, 640)px`, drop-shadow neutro discreto direto no logo
  (estilo cartaz impresso), gap entre logos `clamp(7, 10vw, 14)rem`.
  **Sem plate / card / container atrás do logo** — testado e rejeitado:
  encaixotar o logo o torna menor, contraria o princípio "logo é rei".
  `.jpg` com fundo branco sólido sobre creme vira retângulo branco
  aceito como estética scoreboard/parede de patrocinadores.
- **Sheet de controle**: dark, header com âmbar discreto, cartão interno de
  velocidade. Aparece à esquerda ao clicar no botão fixed top-left
  (hamburger). Trigger e sheet do mesmo lado pra leitura natural. Overlay sem
  blur e animação curta só em transform/opacity, para não pesar sobre o
  marquee em telão.

## Spotlight Cliente

Lupa fixed `top-right` (espelho do hamburger `top-left`) abre drawer
`side="right"` com busca de clientes. Lista vem de `data/clients.json`
com fallback automático: logos sem entry no JSON geram entrada de busca
pelo filename formatado. Mesma estética dark do operator sheet.

Ao selecionar cliente, marquee é substituído por logo único centralizado
(`<ClientSpotlight>`) — estático intencionalmente. Palco em modo
conversa não pisca, não anima, não roda. Inverso da regra "marquee nunca
pausa" — quando spotlight ativo, palco para totalmente. Header continua
"Marcas Parceiras" (não troca pelo nome do cliente; foco é o logo).

Voltar ao carrossel: botão dentro da própria drawer, visível só quando
há cliente selecionado. Seleção **não persiste** — refresh sempre volta
ao carrossel. Velocidade do marquee continua persistindo (separado).

Busca: `fuse.js`, threshold `0.4`, match em `name + aliases` com
normalização NFD + strip diacritics (aceita "acai" → "Açaí"). Navegação
keyboard ↑/↓/Enter dentro da lista.

## Anti-patterns banidos

- Gradientes radiais decorativos (blobs).
- Halos coloridos atrás dos logos.
- Spotlight sweeps, glow trails, breath ambiental.
- Film grain decorativo.
- Glassmorphism, gradient text, side-stripe borders.
- Cards aninhados, modal de confirmação para ajustes reversíveis.
