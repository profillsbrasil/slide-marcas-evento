import { readdirSync, readFileSync } from "fs"
import { join } from "path"

import type { Client } from "./clients-shared"

export type { Client }

type ClientEntry = {
  name: string
  logo: string
  aliases?: string[]
}

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"])

function formatFilename(filename: string): string {
  const base = filename.slice(0, filename.lastIndexOf("."))
  return base
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function readJsonEntries(): ClientEntry[] {
  try {
    const raw = readFileSync(join(process.cwd(), "data", "clients.json"), "utf-8")
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (entry): entry is ClientEntry =>
        entry &&
        typeof entry.name === "string" &&
        typeof entry.logo === "string"
    )
  } catch {
    return []
  }
}

function readLogoFiles(): string[] {
  const dir = join(process.cwd(), "public", "brand-logos")
  try {
    return readdirSync(dir).filter((file) => {
      const ext = file.slice(file.lastIndexOf(".")).toLowerCase()
      return IMAGE_EXTENSIONS.has(ext)
    })
  } catch {
    return []
  }
}

export function readClients(): Client[] {
  const entries = readJsonEntries()
  const logoFiles = new Set(readLogoFiles())
  const entryByLogo = new Map(entries.map((e) => [e.logo, e]))

  if (process.env.NODE_ENV === "development") {
    for (const entry of entries) {
      if (!logoFiles.has(entry.logo)) {
        console.warn(
          `[clients] entry "${entry.name}" referencia logo "${entry.logo}" que nao existe em /public/brand-logos/`
        )
      }
    }
  }

  const clients: Client[] = []
  for (const file of logoFiles) {
    const entry = entryByLogo.get(file)
    clients.push({
      name: entry?.name ?? formatFilename(file),
      logo: `/brand-logos/${file}`,
      aliases: entry?.aliases ?? [],
    })
  }

  return clients.sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })
  )
}
