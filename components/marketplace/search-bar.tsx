import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type SearchBarProps = {
  defaultValue?: string
  large?: boolean
}

export function SearchBar({ defaultValue = "", large = false }: SearchBarProps) {
  return (
    <form action="/catalogo" className="flex w-full flex-col gap-2 border bg-background p-2 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={defaultValue}
          placeholder="Buscar excavadora, montacargas, generador..."
          className={large ? "h-12 rounded-none border-0 pl-10 text-base ring-0 focus-visible:ring-0" : "rounded-none border-0 pl-10 ring-0 focus-visible:ring-0"}
        />
      </div>
      <Button type="submit" className={large ? "h-12 rounded-none px-6" : "rounded-none"}>
        Buscar
      </Button>
    </form>
  )
}
