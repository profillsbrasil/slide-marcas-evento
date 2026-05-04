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
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
            }}
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
