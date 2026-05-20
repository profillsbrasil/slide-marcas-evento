import { EventCarouselStage } from "@/components/event-carousel-stage"
import { LogoMarquee } from "@/components/logo-marquee"
import { readClients } from "@/lib/clients"

// Os logos não mudam durante o evento: renderiza uma vez no build,
// sem reler public/brand-logos/ a cada request.
export const dynamic = "force-static"

export default function Page() {
  const clients = readClients()

  return (
    <EventCarouselStage clients={clients}>
      <LogoMarquee clients={clients} />
    </EventCarouselStage>
  )
}
