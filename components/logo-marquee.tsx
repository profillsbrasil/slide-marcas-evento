import { readdirSync } from "fs"
import { join } from "path"
import Image from "next/image"

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"])

type BrandLogo = { name: string; src: string }

function readBrandLogos(): BrandLogo[] {
  const dir = join(process.cwd(), "public", "brand-logos")

  let files: string[] = []
  try {
    files = readdirSync(dir)
  } catch {
    return []
  }

  return files
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
          style={{ "--i": String(startIndex + index) } as React.CSSProperties}
        >
          <Image
            src={logo.src}
            alt={hidden ? "" : `Logo ${logo.name}`}
            width={1400}
            height={500}
            loading="eager"
            sizes="(min-width: 1400px) 880px, 34vw"
            className="brand-marquee__logo h-auto w-full object-contain"
            draggable={false}
          />
        </li>
      ))}
    </ul>
  )
}

export function LogoMarquee() {
  const logos = readBrandLogos()

  if (logos.length === 0) {
    if (process.env.NODE_ENV !== "development") {
      return (
        <section
          aria-label="Marcas parceiras"
          className="brand-marquee relative flex w-full items-center overflow-hidden"
        />
      )
    }

    return (
      <section
        aria-label="Marcas parceiras"
        className="brand-marquee relative flex w-full items-center justify-center overflow-hidden"
      >
        <p className="brand-marquee__empty">
          Adicione logos em{" "}
          <code className="font-mono">/public/brand-logos/</code>
          {" "}para preencher o palco.
        </p>
      </section>
    )
  }

  return (
    <section
      aria-label="Marcas parceiras"
      className="brand-marquee relative flex w-full items-center overflow-hidden"
    >
      <div className="brand-marquee__viewport relative w-full overflow-hidden">
        <div className="brand-marquee__track flex w-max items-center">
          <LogoSet logos={logos} startIndex={0} />
          <LogoSet logos={logos} hidden startIndex={logos.length} />
        </div>
      </div>
    </section>
  )
}
