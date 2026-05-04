"use client"

import * as React from "react"
import { MenuIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"

const STORAGE_KEY = "brand-carousel-speed"
const MIN_SPEED = 1
const MAX_SPEED = 50
const DEFAULT_SPEED = 25
// duration in seconds at the slow end (speed=MIN) and fast end (speed=MAX).
// Exponential interpolation: each step is a constant percentage change rather
// than constant seconds, so "1 → 2" feels as different as "49 → 50".
const SLOW_DURATION = 360
const FAST_DURATION = 18

function clampSpeed(value: number) {
  return Math.min(MAX_SPEED, Math.max(MIN_SPEED, Math.round(value)))
}

function getDurationSeconds(speed: number) {
  const normalized = (clampSpeed(speed) - MIN_SPEED) / (MAX_SPEED - MIN_SPEED)
  return SLOW_DURATION * Math.pow(FAST_DURATION / SLOW_DURATION, normalized)
}

function getDuration(speed: number) {
  return `${Math.round(getDurationSeconds(speed))}s`
}

function formatCycle(speed: number) {
  const total = Math.round(getDurationSeconds(speed))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  if (minutes === 0) return `${seconds}s`
  return `${minutes}m${seconds.toString().padStart(2, "0")}s`
}

function getSpeedLabel(speed: number) {
  if (speed <= 10) return "Bem lento"
  if (speed <= 20) return "Lento"
  if (speed <= 30) return "Equilibrado"
  if (speed <= 40) return "Rápido"
  return "Muito rápido"
}

export function EventCarouselStage({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [speed, setSpeed] = React.useState(DEFAULT_SPEED)
  const [hasLoadedSavedSpeed, setHasLoadedSavedSpeed] = React.useState(false)

  React.useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const savedSpeed = window.localStorage.getItem(STORAGE_KEY)

      if (savedSpeed) {
        const parsedSpeed = Number(savedSpeed)

        if (Number.isFinite(parsedSpeed)) {
          setSpeed(clampSpeed(parsedSpeed))
        }
      }

      setHasLoadedSavedSpeed(true)
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [])

  React.useEffect(() => {
    if (!hasLoadedSavedSpeed) {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, String(speed))
  }, [hasLoadedSavedSpeed, speed])

  return (
    <main
      className="event-stage relative flex h-svh w-full flex-col overflow-hidden"
      style={
        {
          "--brand-marquee-duration": getDuration(speed),
        } as React.CSSProperties
      }
    >
      <Sheet>
        <header className="relative flex items-center justify-center gap-3 px-6 py-5 sm:px-10">
          <span
            aria-hidden
            className="size-2.5 rounded-full bg-primary shadow-[0_0_0_4px_color-mix(in_oklch,var(--primary)_18%,transparent)]"
          />
          <p className="font-heading text-[clamp(1.05rem,1.5vw,1.55rem)] font-semibold uppercase tracking-[0.32em] text-foreground">
            Marcas Parceiras
          </p>
        </header>

        {children}

        <SheetTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="fixed top-6 left-6 z-30 size-12 rounded-full border border-border/70 bg-card/80 text-foreground shadow-sm backdrop-blur-sm transition-colors duration-300 hover:bg-secondary sm:top-8 sm:left-8"
            aria-label="Abrir controles do carrossel"
          >
            <MenuIcon className="size-6" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="dark control-sheet w-[min(88vw,24rem)] border-border/60 bg-popover p-0 text-popover-foreground shadow-2xl shadow-black/40 duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-md"
        >
          <SheetHeader className="relative gap-2 border-b border-border/60 px-6 py-6">
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-primary/80">
              Painel do operador
            </span>
            <SheetTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
              Controle do carrossel
            </SheetTitle>
            <SheetDescription className="text-sm leading-relaxed text-muted-foreground">
              Ajuste a velocidade enquanto os logos continuam passando no telão.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-6 p-6">
            <div className="rounded-2xl border border-border/60 bg-card/60 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <Label
                    htmlFor="carousel-speed"
                    className="font-heading text-base text-foreground"
                  >
                    Velocidade
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {getSpeedLabel(speed)} · ciclo em {formatCycle(speed)}
                  </p>
                </div>
                <div className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-sm font-medium text-primary">
                  {speed}
                </div>
              </div>

              <Slider
                id="carousel-speed"
                className="mt-7"
                min={MIN_SPEED}
                max={MAX_SPEED}
                step={1}
                value={[speed]}
                onValueChange={([nextSpeed]) => {
                  setSpeed(clampSpeed(nextSpeed ?? DEFAULT_SPEED))
                }}
                aria-label="Velocidade do carrossel"
              />

              <div className="mt-4 flex justify-between font-mono text-[0.62rem] uppercase tracking-[0.32em] text-muted-foreground/80">
                <span>Lento</span>
                <span>Rápido</span>
              </div>

              <button
                type="button"
                onClick={() => setSpeed(DEFAULT_SPEED)}
                className="mt-5 w-full rounded-full border border-border/60 bg-transparent px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.32em] text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground"
              >
                Voltar ao padrão ({DEFAULT_SPEED})
              </button>
            </div>

            <p className="px-1 text-xs leading-relaxed text-muted-foreground/70">
              Salvo neste navegador. Continua na próxima abertura.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </main>
  )
}
