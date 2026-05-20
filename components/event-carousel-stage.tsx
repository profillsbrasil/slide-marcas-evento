"use client"

import * as React from "react"
import Image from "next/image"
import { MaximizeIcon, MenuIcon, MinimizeIcon } from "lucide-react"

import { ClientSearchSheet } from "@/components/client-search-sheet"
import { ClientSpotlight } from "@/components/client-spotlight"
import { Button } from "@/components/ui/button"
import { GridPattern } from "@/components/ui/grid-pattern"
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
import type { Client } from "@/lib/clients"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "brand-carousel-speed"
const MIN_SPEED = 1
const MAX_SPEED = 50
const DEFAULT_SPEED = 6
// duration in seconds at the slow end (speed=MIN) and fast end (speed=MAX).
// Exponential interpolation: each step is a constant percentage change rather
// than constant seconds, so "1 → 2" feels as different as "49 → 50".
const SLOW_DURATION = 600
const FAST_DURATION = 18

function clampSpeed(value: number) {
  return Math.min(MAX_SPEED, Math.max(MIN_SPEED, Math.round(value)))
}

function getDurationSeconds(speed: number) {
  const normalized = (clampSpeed(speed) - MIN_SPEED) / (MAX_SPEED - MIN_SPEED)
  return SLOW_DURATION * Math.pow(FAST_DURATION / SLOW_DURATION, normalized)
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

/*
 * Spotlight overlay that mounts when there is a client and stays mounted
 * through its exit animation. The marquee underneath is never unmounted,
 * so it keeps its scroll position and never re-runs the entrance cascade
 * just because someone closed a spotlight.
 */
function SpotlightOverlay({ client }: { client: Client | null }) {
  const [rendered, setRendered] = React.useState<Client | null>(null)

  // Adopt the active client during render. When `client` is null, leave
  // `rendered` set so the previous spotlight can play its exit animation;
  // unmount happens on `animationend` below.
  if (client && client.logo !== rendered?.logo) {
    setRendered(client)
  }

  if (!rendered) return null

  const exiting = client === null

  return (
    <div
      key={rendered.logo}
      className={cn(
        "stage-layer",
        exiting ? "stage-layer--exit" : "stage-layer--enter"
      )}
      onAnimationEnd={(event) => {
        if (event.target !== event.currentTarget) return
        if (exiting) setRendered(null)
      }}
    >
      <ClientSpotlight client={rendered} />
    </div>
  )
}

// Fixed reference duration that the CSS animation runs at; the speed slider
// scales `playbackRate` around it so changing speed never restarts the loop.
const REFERENCE_DURATION = SLOW_DURATION

function getTrackAnimation(): Animation | null {
  if (typeof document === "undefined") return null
  const track = document.querySelector(".brand-marquee__track")
  if (!track || typeof track.getAnimations !== "function") return null
  return track.getAnimations()[0] ?? null
}

function toggleFullscreen() {
  if (typeof document === "undefined") return
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {})
  } else {
    document.documentElement.requestFullscreen().catch(() => {})
  }
}

export function EventCarouselStage({
  clients,
  children,
}: Readonly<{
  clients: Client[]
  children: React.ReactNode
}>) {
  const [speed, setSpeed] = React.useState(DEFAULT_SPEED)
  const [hasLoadedSavedSpeed, setHasLoadedSavedSpeed] = React.useState(false)
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(
    null
  )
  const [isFullscreen, setIsFullscreen] = React.useState(false)

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

  // Drive the marquee speed without restarting its animation. Changing the
  // CSS `animation-duration` re-seeks to position 0 on every slider tick;
  // adjusting `playbackRate` on the running animation does not.
  const playbackRate = REFERENCE_DURATION / getDurationSeconds(speed)
  React.useEffect(() => {
    const anim = getTrackAnimation()
    if (anim) anim.playbackRate = playbackRate
  }, [playbackRate])

  // Per DESIGN.md, the marquee stops fully while a client spotlight is up.
  // Pausing the WAAPI animation preserves its position so it resumes from
  // exactly where it was when the operator returns to the carousel.
  React.useEffect(() => {
    const anim = getTrackAnimation()
    if (!anim) return
    if (selectedClient) anim.pause()
    else anim.play()
  }, [selectedClient])

  // Keep the screen awake while the slide is up. Venue laptops often have
  // aggressive sleep settings, and a black telão mid-event is a public
  // failure with no easy recovery from the operator side.
  React.useEffect(() => {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) {
      return
    }
    let sentinel: WakeLockSentinel | null = null
    const acquire = async () => {
      try {
        sentinel = await navigator.wakeLock.request("screen")
      } catch (err) {
        console.warn("[stage] wake lock unavailable:", err)
      }
    }
    const onVisibility = () => {
      if (
        document.visibilityState === "visible" &&
        (!sentinel || sentinel.released)
      ) {
        acquire()
      }
    }
    acquire()
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      sentinel?.release().catch(() => {})
    }
  }, [])

  // Track fullscreen so the button label reflects current state.
  React.useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  // Operator shortcuts so the slide can be driven without touching the mouse
  // in front of the audience. Ignored while typing in an input or while a
  // sheet is open (Radix handles its own keys then).
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      if (typing) return

      // Fullscreen is global on purpose: the operator must be able to
      // exit fullscreen even with a sheet open.
      if (event.key === "f" || event.key === "F") {
        event.preventDefault()
        toggleFullscreen()
        return
      }

      // Radix owns Escape, Tab, etc. inside its open sheets.
      if (document.querySelector('[role="dialog"][data-state="open"]')) {
        return
      }

      if (event.key === "/") {
        event.preventDefault()
        document
          .querySelector<HTMLButtonElement>('[aria-label="Buscar cliente"]')
          ?.click()
      } else if (event.key === "s" || event.key === "S") {
        event.preventDefault()
        document
          .querySelector<HTMLButtonElement>(
            '[aria-label="Abrir controles do carrossel"]'
          )
          ?.click()
      } else if (event.key === "Escape" && selectedClient) {
        event.preventDefault()
        setSelectedClient(null)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [selectedClient])

  return (
    <main className="event-stage relative flex h-svh w-full flex-col overflow-hidden">
      <GridPattern
        width={40}
        height={40}
        x={-1}
        y={-1}
        className="stage-grid !fill-current !stroke-current"
      />

      <Sheet>
        <header className="relative flex min-h-[clamp(5.5rem,12svh,9rem)] items-center justify-center px-16 py-5 sm:px-24">
          <h1 className="sr-only">Marcas parceiras PROFILLS</h1>
          <Image
            src="/logo.png"
            alt="PROFILLS"
            width={512}
            height={113}
            priority
            sizes="(min-width: 1024px) 42vw, 64vw"
            className="h-auto w-[clamp(14rem,34vw,32rem)] object-contain select-none"
            draggable={false}
          />
        </header>

        <div className="relative flex flex-1 overflow-hidden">
          {/* Marquee is permanent — fades and pauses, but never unmounts. */}
          <div
            className={cn(
              "stage-marquee-layer",
              selectedClient && "stage-marquee-layer--hidden"
            )}
            aria-hidden={selectedClient ? true : undefined}
          >
            {children}
          </div>
          <SpotlightOverlay client={selectedClient} />
        </div>

        <span className="sr-only" aria-live="polite">
          {selectedClient
            ? `Mostrando cliente ${selectedClient.name}`
            : "Carrossel restaurado"}
        </span>

        <SheetTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="fixed top-5 left-5 z-30 size-11 rounded-full border border-transparent bg-primary text-primary-foreground shadow-[0_10px_28px_rgb(0_0_0_/_0.22)] transition-colors duration-150 hover:bg-primary/90 hover:text-primary-foreground sm:top-7 sm:left-7"
            aria-label="Abrir controles do carrossel"
          >
            <MenuIcon className="size-6" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="dark control-sheet w-[min(88vw,24rem)] border-border/60 bg-popover p-0 text-popover-foreground shadow-[0_18px_60px_rgb(0_0_0_/_0.28)] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-md"
        >
          <SheetHeader className="relative gap-2 border-b border-border/60 px-6 py-6">
            <span className="font-mono text-[0.62rem] tracking-[0.32em] text-primary/80 uppercase">
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
            <div className="rounded-lg border border-border/60 bg-card/70 p-6">
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
                <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-sm font-medium text-primary">
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

              <div className="mt-4 flex justify-between font-mono text-[0.62rem] tracking-[0.32em] text-muted-foreground/80 uppercase">
                <span>Lento</span>
                <span>Rápido</span>
              </div>

              <button
                type="button"
                onClick={() => setSpeed(DEFAULT_SPEED)}
                className="mt-5 w-full rounded-md border border-border/60 bg-transparent px-3 py-2 font-mono text-[0.62rem] tracking-[0.32em] text-muted-foreground uppercase transition-colors duration-150 hover:bg-secondary hover:text-foreground"
              >
                Voltar ao padrão ({DEFAULT_SPEED})
              </button>
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border/60 bg-card/70 px-4 py-3 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-secondary"
            >
              {isFullscreen ? (
                <MinimizeIcon className="size-4" />
              ) : (
                <MaximizeIcon className="size-4" />
              )}
              {isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
              <span className="ml-1 font-mono text-[0.62rem] tracking-[0.32em] text-muted-foreground/80 uppercase">
                F
              </span>
            </button>

            <div className="space-y-2 px-1 text-xs leading-relaxed text-muted-foreground/70">
              <p>Salvo neste navegador. Continua na próxima abertura.</p>
              <p>
                <span className="font-mono text-[0.62rem] tracking-[0.32em] text-muted-foreground/80 uppercase">
                  Atalhos
                </span>
                {" · "}
                <kbd className="font-mono">/</kbd> busca{" · "}
                <kbd className="font-mono">S</kbd> velocidade{" · "}
                <kbd className="font-mono">F</kbd> tela cheia{" · "}
                <kbd className="font-mono">Esc</kbd> volta ao carrossel
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ClientSearchSheet
        clients={clients}
        selectedClient={selectedClient}
        onSelect={setSelectedClient}
        onClear={() => setSelectedClient(null)}
      />
    </main>
  )
}
