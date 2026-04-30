import { readdirSync } from "fs"
import { join } from "path"
import Image from "next/image"

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"])

type BrandLogo = { name: string; src: string }

function readBrandLogos(): BrandLogo[] {
  const dir = join(process.cwd(), "public", "brand-logos")
  return readdirSync(dir)
    .filter((file) => {
      const ext = file.slice(file.lastIndexOf(".")).toLowerCase()
      return IMAGE_EXTENSIONS.has(ext)
    })
    .sort()
    .map((file) => {
      const base = file.slice(0, file.lastIndexOf("."))
      const name = base
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
      return { name, src: `/brand-logos/${file}` }
    })
}

// Deterministic per-item bob variation. We want each logo to feel alive
// without a synchronized "wave" — so duration cycles through a few prime-ish
// seconds and the start offset spreads phases across the row.
const BOB_DURATIONS = ["5.4s", "6.2s", "7.1s", "5.8s", "6.7s", "7.6s"]
const BOB_AMPLITUDES = ["4px", "5px", "6px", "5px", "4px", "6px"]

function bobStyleFor(index: number): React.CSSProperties {
  const duration = BOB_DURATIONS[index % BOB_DURATIONS.length]
  const amplitude = BOB_AMPLITUDES[index % BOB_AMPLITUDES.length]
  // Spread phase: each item starts somewhere in its own cycle.
  const delay = `-${((index * 0.73) % 6).toFixed(2)}s`

  return {
    "--i": String(index),
    "--bob-duration": duration,
    "--bob-delay": delay,
    "--bob-amplitude": amplitude,
  } as React.CSSProperties
}

function LogoSet({
  logos,
  hidden = false,
  startIndex = 0,
}: {
  logos: BrandLogo[]
  hidden?: boolean
  startIndex?: number
}) {
  return (
    <ul
      aria-hidden={hidden}
      className="brand-marquee__group flex shrink-0 items-center"
    >
      {logos.map((logo, index) => (
        <li
          key={logo.src}
          className="brand-marquee__item shrink-0"
          style={bobStyleFor(startIndex + index)}
        >
          <Image
            src={logo.src}
            alt={hidden ? "" : `Logo ${logo.name}`}
            width={900}
            height={320}
            loading="eager"
            sizes="260px"
            className="brand-marquee__logo relative z-10 h-auto w-full object-contain"
            draggable={false}
          />
        </li>
      ))}
    </ul>
  )
}

export function LogoMarquee() {
  const logos = readBrandLogos()

  return (
    <section
      aria-label="Marcas parceiras"
      className="brand-marquee relative flex w-full items-center overflow-hidden border-y backdrop-blur-lg"
    >
      <div className="brand-marquee__sheen pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />

      <div className="brand-marquee__viewport relative w-full overflow-hidden">
        <div className="brand-marquee__spotlight" aria-hidden />
        <div className="brand-marquee__track flex w-max items-center">
          <LogoSet logos={logos} startIndex={0} />
          <LogoSet logos={logos} hidden startIndex={logos.length} />
        </div>
      </div>
    </section>
  )
}
