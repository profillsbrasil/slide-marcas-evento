import Image from "next/image"

import type { Client } from "@/lib/clients"

export function ClientSpotlight({ client }: { client: Client }) {
  return (
    <section
      aria-label={`Logo do cliente ${client.name}`}
      className="flex flex-1 items-center justify-center px-12"
    >
      <div className="brand-spotlight__box h-[clamp(360px,70svh,720px)] w-[clamp(540px,60vw,1200px)]">
        <Image
          src={client.logo}
          alt={`Logo ${client.name}`}
          fill
          priority
          // matches the CSS box `clamp(540px, 60vw, 1200px)`: floor at 900px
          // viewport, ceiling at 2000px viewport.
          sizes="(min-width: 2000px) 1200px, (min-width: 900px) 60vw, 540px"
          className="brand-spotlight__logo object-contain"
          draggable={false}
        />
      </div>
    </section>
  )
}
