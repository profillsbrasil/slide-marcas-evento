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
const DEFAULT_SPEED = 5
const MIN_SPEED = 1
const MAX_SPEED = 10

function clampSpeed(value: number) {
  return Math.min(MAX_SPEED, Math.max(MIN_SPEED, value))
}

function getDuration(speed: number) {
  const normalized = (clampSpeed(speed) - MIN_SPEED) / (MAX_SPEED - MIN_SPEED)
  const duration = 144 - normalized * 108

  return `${Math.round(duration)}s`
}

function getSpeedLabel(speed: number) {
  if (speed <= 3) {
    return "Lento"
  }

  if (speed >= 8) {
    return "Rápido"
  }

  return "Equilibrado"
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
      className="dark event-stage relative grid min-h-svh place-items-center overflow-hidden"
      style={
        {
          "--brand-marquee-duration": getDuration(speed),
        } as React.CSSProperties
      }
    >
      <div className="event-stage-grain" aria-hidden />

      <Sheet>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="fixed top-5 left-5 z-40 border-border/60 bg-background/40 text-foreground/80 shadow-xl shadow-background/50 backdrop-blur-md transition-colors duration-300 hover:bg-background/70 hover:text-foreground"
            aria-label="Abrir controles do carrossel"
          >
            <MenuIcon className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="dark control-sheet w-[min(88vw,24rem)] border-border/60 bg-popover/95 p-0 shadow-2xl shadow-background/50 backdrop-blur-2xl duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-md"
        >
          <SheetHeader className="relative gap-2 border-b border-border/60 px-6 py-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
            />
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
            <div className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-inner shadow-background/30">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <Label
                    htmlFor="carousel-speed"
                    className="font-heading text-base text-foreground"
                  >
                    Velocidade
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {getSpeedLabel(speed)} · ciclo em {getDuration(speed)}
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
            </div>

            <p className="px-1 text-xs leading-relaxed text-muted-foreground/70">
              Mudanças aplicam ao vivo e ficam salvas neste navegador.
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {children}
    </main>
  )
}
