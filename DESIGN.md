# Design

## Theme

Dark sempre. Cena: pavilhão de feira regional ao fim da tarde, palco iluminado,
público circulando, telão precisa puxar o olhar do canto sem ofuscar os logos.

## Color strategy

**Committed warm dusk.** Um saffron / âmbar saturado carrega 30 a 50% das
superfícies de controle (sheet header, slider, badge de velocidade, anéis de
foco). O stage de fundo é carvão quente com leve viés laranja, lambido por
gradientes radiais cálidos que sugerem luz de fim de tarde.

A categoria-reflex óbvia desse domínio é "evento de açaí → roxo". Foi
explicitamente abandonada.

### Tokens (dark, único theme suportado)

- `--background` `oklch(0.135 0.012 60)` — carvão quente
- `--foreground` `oklch(0.96 0.012 80)` — creme quente
- `--card` `oklch(0.185 0.018 55)` — cacau profundo
- `--popover` `oklch(0.18 0.018 55)`
- `--primary` `oklch(0.78 0.165 65)` — saffron / âmbar de pôr-do-sol
- `--primary-foreground` `oklch(0.18 0.05 50)`
- `--accent` casado com `--primary`
- `--secondary` `oklch(0.245 0.015 60)`
- `--muted` `oklch(0.225 0.012 60)`
- `--muted-foreground` `oklch(0.7 0.018 75)`
- `--border` `oklch(0.32 0.022 60)`
- `--ring` `--primary`
- `--destructive` `oklch(0.62 0.215 28)`

## Typography

- **Heading** (sheet title, badges de velocidade): `IBM Plex Sans` — pega o
  peso regional sem ser caricato. Tracking levemente apertado nos títulos,
  generoso em uppercase de label (`tracking-[0.22em]`).
- **Body / UI**: Geist Sans.
- **Mono** (números de velocidade, duração): Geist Mono.

## Motion

Easing exclusivo: `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quart) para tudo
que entra. Nada de bounce, nada de spring.

- `brand-marquee-scroll` linear, infinito, controlado pelo usuário (1–10 →
  144s–36s).
- `brand-marquee-bob` por logo: ±5px no Y, 5–8s, fase decalada por índice.
  Vida sem alarde.
- `brand-marquee-spotlight` em camada própria sobre o viewport: gradiente
  radial quente atravessando da esquerda para a direita em ~22s, totalmente
  desacoplado do scroll dos logos.
- `event-stage-breath` 60s nos gradientes radiais do fundo: respiração lenta
  da cena.
- Entrada inicial: cascata de fade + translate-y nos logos com stagger
  determinístico (`--i` × 28ms), 700ms ease-out-quart.
- Sheet: ease já existente, nada a mudar além do conteúdo.

Tudo respeita `prefers-reduced-motion: reduce` — bob, breath, spotlight,
entrada e o próprio marquee são desativados.

## Surfaces

- **Stage** (`.event-stage`): fundo com 4 camadas combinadas — radiais quentes
  alternando, varredura linear sutil, e respiração de 60s.
- **Marquee row** (`.brand-marquee`): faixa horizontal centralizada, altura
  fluida (`33vh` clampada 260–390px), borda quente, sheen interno mínimo,
  spotlight superposto.
- **Logo item** (`.brand-marquee__item`): largura fluida (`clamp(220, 16vw,
  340)`), halo radial quente atrás do logo, bob individual.
- **Sheet de controle**: `popover` escuro, header com âmbar discreto,
  cartão interno de velocidade com badge mono.

## Anti-patterns banidos

- Roxo, azul SaaS, qualquer cor sem ligação com o evento.
- Cards aninhados, side-stripe borders, gradient text.
- Modal de confirmação para mudanças de velocidade — ajuste é instantâneo e
  reversível, nada de fricção.
