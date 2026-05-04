export type Client = {
  name: string
  logo: string
  aliases: string[]
}

export function normalize(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
}
