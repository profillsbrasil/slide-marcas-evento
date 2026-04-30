import Image from "next/image"

const brandLogos = [
  { name: "Alume", src: "/brand-logos/alume.png" },
  { name: "Bravio", src: "/brand-logos/bravio.png" },
  { name: "Candea", src: "/brand-logos/candea.png" },
  { name: "Dobra", src: "/brand-logos/dobra.png" },
  { name: "Eloar", src: "/brand-logos/eloar.png" },
  { name: "Firme", src: "/brand-logos/firme.png" },
  { name: "Gravia", src: "/brand-logos/gravia.png" },
  { name: "Ibera", src: "/brand-logos/ibera.png" },
  { name: "Lumera", src: "/brand-logos/lumera.png" },
  { name: "Mavon", src: "/brand-logos/mavon.png" },
  { name: "Noria", src: "/brand-logos/noria.png" },
  { name: "Orvila", src: "/brand-logos/orvila.png" },
  { name: "Pontal", src: "/brand-logos/pontal.png" },
  { name: "Quara", src: "/brand-logos/quara.png" },
  { name: "Raizel", src: "/brand-logos/raizel.png" },
  { name: "Savia", src: "/brand-logos/savia.png" },
  { name: "Toren", src: "/brand-logos/toren.png" },
  { name: "Valora", src: "/brand-logos/valora.png" },
  { name: "Zelar", src: "/brand-logos/zelar.png" },
  { name: "Vivarae", src: "/brand-logos/vivarae.png" },
] as const

type BrandLogo = (typeof brandLogos)[number]

function LogoSet({
  logos,
  hidden = false,
}: {
  logos: readonly BrandLogo[]
  hidden?: boolean
}) {
  return (
    <ul
      aria-hidden={hidden}
      className="brand-marquee__group flex shrink-0 items-center"
    >
      {logos.map((logo) => (
        <li key={logo.name} className="brand-marquee__item shrink-0">
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
  return (
    <section
      aria-label="Marcas parceiras"
      className="brand-marquee relative flex w-full items-center overflow-hidden border-y backdrop-blur-lg"
    >
      <div className="brand-marquee__sheen pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="brand-marquee__viewport relative w-full overflow-hidden">
        <div className="brand-marquee__track flex w-max items-center">
          <LogoSet logos={brandLogos} />
          <LogoSet logos={brandLogos} hidden />
        </div>
      </div>
    </section>
  )
}
