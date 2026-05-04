# Spotlight Cliente — Design

## Objetivo

Permitir ao operador, durante reunião com cliente no estande, isolar o logo daquele cliente no palco — substituindo o carrossel por um logo único estático — via lupa fixa no canto superior direito que abre drawer de busca.

## Decisões (resumo)

| Decisão | Valor |
|---|---|
| Modo selecionado | Logo único estático no palco, header continua "Marcas Parceiras" |
| Voltar ao carrossel | Botão dentro da drawer de busca |
| Persistência da seleção | Nenhuma — refresh volta ao carrossel |
| Fonte de clientes | `data/clients.json` (dataset separado) |
| Logo sem entry no JSON | Autogera entrada de busca pelo filename formatado |
| Tipo de busca | Fuzzy (typo-tolerante) via `fuse.js` |
| Posição da lupa | `fixed top-right`, espelhando hamburger atual |
| Sheet da busca | `side="right"` (hamburger continua `side="left"`) |

## Arquitetura

### Estado

`EventCarouselStage` ganha `selectedClient: Client | null` (`useState`, default `null`).
- `null` → renderiza `{children}` (marquee atual, comportamento de hoje).
- não-null → renderiza `<ClientSpotlight client={selectedClient} />` no mesmo slot `flex-1`.

Velocidade do marquee continua persistindo em `localStorage` (separado, não muda).

### Dois sheets independentes

```tsx
<Sheet>{/* hamburger, side=left */}</Sheet>
<Sheet>{/* lupa, side=right */}</Sheet>
```

Coexistem no mesmo `<main>`. Estado de aberto/fechado próprio de cada um.

## Dados

### `data/clients.json` (novo)

Arquivo na raiz do repo. Schema:

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

- `name` (string, obrigatório): nome oficial exibido na busca.
- `logo` (string, obrigatório): filename relativo a `/public/brand-logos/`.
- `aliases` (string[], opcional): termos extras de busca (razão social, apelido).

### `lib/clients.ts` (novo)

```ts
export type Client = {
  name: string
  logo: string          // path absoluto, ex: "/brand-logos/acai-norte.png"
  aliases: string[]
}

export function readClients(): Client[]
```

Lógica server-side (chamada em RSC, não em cliente):

1. Lê `data/clients.json`. Se ausente/vazio → array vazio.
2. Lê `/public/brand-logos/` (mesma lógica que `readBrandLogos` em `logo-marquee.tsx`).
3. Para cada arquivo de logo:
   - Se existe entry no JSON com `logo === filename` → usa entry, `logo` vira `/brand-logos/<filename>`.
   - Senão → autogera `{ name: formatFilename(filename), logo: "/brand-logos/<filename>", aliases: [] }`.
4. Entries do JSON cujo `logo` não bate com nenhum arquivo real → ignoradas com `console.warn` em dev.
5. Retorna ordenado por `name` (locale-aware, `pt-BR`, case-insensitive).

`formatFilename` reaproveita lógica atual: split `-`, capitalize cada palavra, join com espaço.

## Componentes

### `components/client-search-sheet.tsx` (novo)

Props:
```ts
{
  clients: Client[]
  selectedClient: Client | null
  onSelect: (client: Client) => void
  onClear: () => void
}
```

Estrutura:
- `<Sheet>` controlado pelo trigger (botão lupa).
- `SheetTrigger`: botão `fixed top-6 right-6 z-30` (espelha hamburger), ícone `SearchIcon` do lucide, `aria-label="Buscar cliente"`.
- `SheetContent side="right"`: mesmo `dark control-sheet` styling do hamburger sheet.
- `SheetHeader`: eyebrow "Painel do operador", título "Selecionar cliente", descrição curta.
- Body:
  - `<Input>` busca, `autoFocus`, `aria-label="Buscar cliente por nome"`.
  - Lista scrollável (`role="listbox"`, `max-h` calculado pra caber em viewport pequeno).
  - Cada item: `<button role="option">` com thumbnail (40x40, `object-contain`) + nome. Hover/focus visíveis.
  - Click = `onSelect(client)` + fecha sheet.
- Footer condicional: se `selectedClient !== null`, botão "Voltar ao carrossel" → `onClear()` + fecha sheet.

### Busca fuzzy

Lib: `fuse.js` (~6KB gz). Configuração:

```ts
new Fuse(clients, {
  keys: ["name", "aliases"],
  threshold: 0.4,
  ignoreLocation: true,
  isCaseSensitive: false,
})
```

Sem query → mostra `clients` em ordem alfabética. Com query → resultado ordenado por score do Fuse.

`fuse.js` é case-insensitive nativo. Acentuação: pré-normalizar query e campos com `String.prototype.normalize("NFD").replace(/\p{Diacritic}/gu, "")` para aceitar "acai" matchar "Açaí".

### Navegação por teclado

- ↑/↓ move foco entre items.
- Enter no item focado = seleciona.
- Esc fecha sheet (comportamento padrão do shadcn `Sheet`).

### `components/client-spotlight.tsx` (novo)

Props: `{ client: Client }`.

```tsx
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
    className="h-auto w-full max-w-[clamp(540px,60vw,1200px)] max-h-[clamp(360px,70svh,720px)] object-contain"
  />
</section>
```

Sem animação de entrada (estático intencional — palco em modo conversa não pisca).

### `components/event-carousel-stage.tsx` (edit)

Mudanças:
1. Aceita prop `clients: Client[]`.
2. Adiciona `const [selectedClient, setSelectedClient] = useState<Client | null>(null)`.
3. Renderiza `selectedClient ? <ClientSpotlight client={selectedClient} /> : children`.
4. Adiciona `<ClientSearchSheet>` ao lado do `<Sheet>` do hamburger, passando estado.
5. `aria-live="polite"` num span visualmente oculto que anuncia "Mostrando cliente X" / "Carrossel restaurado" quando `selectedClient` muda.

### `app/page.tsx` (edit)

Chama `readClients()` server-side e passa para `EventCarouselStage` como prop.

## Acessibilidade

- Lupa: `aria-label="Buscar cliente"`, mesmo tamanho/contraste do hamburger.
- Input: `aria-label`, não dependente só de placeholder.
- Lista: `role="listbox"` no container, `role="option"` + `aria-selected` nos items.
- `prefers-reduced-motion`: sheet já respeita (shadcn). Spotlight é estático, sem implicação.
- Anúncio do modo via `aria-live` (item 5 acima).

## Files tocados

**Novos:**
- `data/clients.json`
- `lib/clients.ts`
- `components/client-search-sheet.tsx`
- `components/client-spotlight.tsx`

**Editados:**
- `components/event-carousel-stage.tsx`
- `app/page.tsx`

**Dependência nova:** `fuse.js`

## Não-objetivos

- Persistência da seleção (refresh sempre limpa).
- Edição de clientes via UI (JSON é editado à mão).
- Múltiplos clientes simultâneos no spotlight.
- Animação de transição carrossel↔spotlight.
- Header dinâmico mudando para nome do cliente.
- Busca por categoria, tag, ou metadata além de `name + aliases`.

## Riscos / pontos de atenção

- `data/clients.json` malformado quebra build do server component. Validar shape em `readClients` e degradar gracefully (logo só, sem aliases) se entry inválida.
- Drawer aberto enquanto marquee roda: marquee continua animando (consistente com decisão atual de "marquee nunca pausa"). Spotlight estático segue mesma filosofia inversa — quando ativo, palco para totalmente.
- Lupa `top-right` e badge/header centro: garantir z-index não conflita com header existente.
