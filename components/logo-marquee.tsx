import Image from "next/image"

import type { Client } from "@/lib/clients-shared"

function LogoSet({
  clients,
  hidden = false,
  startIndex = 0,
}: {
  clients: Client[]
  hidden?: boolean
  startIndex?: number
}) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="brand-marquee__group flex shrink-0 items-center"
    >
      {clients.map((client, index) => (
        <li
          key={`${startIndex}-${client.logo}`}
          className="brand-marquee__item shrink-0"
          style={{ "--i": String(startIndex + index) } as React.CSSProperties}
        >
          <Image
            src={client.logo}
            alt={hidden ? "" : `Logo ${client.name}`}
            fill
            loading={hidden ? "lazy" : "eager"}
            // matches the CSS box `clamp(540px, 34vw, 880px)`: floor and
            // ceiling kick in at 1588px and 2588px viewport widths.
            sizes="(min-width: 2588px) 880px, (min-width: 1588px) 34vw, 540px"
            className="brand-marquee__logo object-contain"
            draggable={false}
          />
        </li>
      ))}
    </ul>
  )
}

export function LogoMarquee({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    if (process.env.NODE_ENV !== "development") {
      return (
        <section
          aria-label="Marcas parceiras"
          className="brand-marquee relative flex w-full items-center justify-center overflow-hidden"
        >
          <p className="brand-marquee__placeholder">
            As marcas parceiras aparecem aqui durante o evento.
          </p>
        </section>
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
          <LogoSet clients={clients} startIndex={0} />
          <LogoSet clients={clients} hidden startIndex={clients.length} />
        </div>
      </div>
    </section>
  )
}
