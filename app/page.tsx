import { EventCarouselStage } from "@/components/event-carousel-stage"
import { LogoMarquee } from "@/components/logo-marquee"
import { readClients } from "@/lib/clients"

export default function Page() {
  const clients = readClients()

  return (
    <EventCarouselStage clients={clients}>
      <LogoMarquee clients={clients} />
    </EventCarouselStage>
  )
}
