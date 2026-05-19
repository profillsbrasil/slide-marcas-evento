"use client"

import * as React from "react"
import Image from "next/image"
import Fuse from "fuse.js"
import { ArrowLeftIcon, SearchIcon } from "lucide-react"

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
import { type Client, normalize } from "@/lib/clients-shared"

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

  // keep the keyboard-highlighted option scrolled into view
  React.useEffect(() => {
    if (!open) return
    document
      .getElementById(`client-option-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" })
  }, [activeIndex, open, results])

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
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        setActiveIndex(0)
      }}
    >
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="fixed top-5 right-5 z-30 size-11 rounded-full border border-border bg-card text-foreground shadow-[0_10px_28px_color-mix(in_oklch,var(--foreground)_12%,transparent)] transition-colors duration-150 hover:bg-[var(--operator-popover)] hover:text-[var(--operator-popover-foreground)] sm:top-7 sm:right-7"
          aria-label="Buscar cliente"
        >
          <SearchIcon className="size-6" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="dark control-sheet flex w-[min(88vw,24rem)] flex-col border-border/60 bg-popover p-0 text-popover-foreground shadow-[0_18px_60px_rgb(0_0_0_/_0.28)] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-md"
      >
        <SheetHeader className="relative gap-2 border-b border-border/60 px-6 py-6">
          <span className="font-mono text-[0.62rem] tracking-[0.32em] text-primary/80 uppercase">
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
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
            }}
            placeholder="Buscar por nome…"
            aria-label="Buscar cliente por nome"
            aria-controls="client-listbox"
            aria-autocomplete="list"
            aria-activedescendant={
              results.length > 0 ? `client-option-${activeIndex}` : undefined
            }
            autoFocus
          />

          <ul
            id="client-listbox"
            role="listbox"
            aria-label="Clientes"
            className="scrollbar-stage flex flex-1 flex-col gap-1 overflow-y-auto pr-1"
          >
            {results.length === 0 ? (
              <li
                role="presentation"
                className="px-3 py-4 text-sm text-muted-foreground"
              >
                Nenhum cliente encontrado.
              </li>
            ) : (
              results.map((client, index) => {
                const isActive = index === activeIndex
                const isSelected = selectedClient?.logo === client.logo
                return (
                  <li
                    key={client.logo}
                    id={`client-option-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(client)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex cursor-pointer items-center gap-3 rounded-md border border-transparent px-3 py-2 transition-colors duration-100 ${
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
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-black/20 transition-colors duration-150 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover focus-visible:outline-none"
            >
              <ArrowLeftIcon className="size-4" />
              Voltar ao carrossel
            </button>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
