import Image from "next/image"

import type { Client } from "@/lib/clients"

export function ClientSpotlight({ client }: { client: Client }) {
  return (
    <section
      aria-label={`Logo do cliente ${client.name}`}
      className="flex flex-1 items-center justify-center px-12"
    >
      <Image
        src={client.logo}
        alt={`Logo ${client.name}`}
        width={1400}
        height={500}
        priority
        sizes="(min-width: 1400px) 1200px, 60vw"
        className="h-auto w-full max-h-[clamp(360px,70svh,720px)] max-w-[clamp(540px,60vw,1200px)] object-contain"
        draggable={false}
      />
    </section>
  )
}
