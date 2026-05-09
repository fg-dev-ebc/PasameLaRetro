import type { Tables } from "@/lib/supabase/database.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { conditionLabels } from "@/lib/constants"
import type { CatalogFilters } from "@/lib/queries"

type CatalogFiltersProps = {
  categories: Tables<"categories">[]
  filters: CatalogFilters
}

export function CatalogFilters({ categories, filters }: CatalogFiltersProps) {
  return (
    <aside className="border bg-background p-4 lg:sticky lg:top-20 lg:self-start">
      <form action="/catalogo" className="space-y-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Filtros</p>
          <h2 className="mt-2 text-lg font-semibold">Disponibilidad operativa</h2>
        </div>

        <div className="space-y-2">
          <Label htmlFor="q">Busqueda</Label>
          <Input id="q" name="q" defaultValue={filters.q} placeholder="Modelo, uso, zona" className="rounded-none" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <select id="category" name="category" defaultValue={filters.category ?? ""} className="h-9 w-full rounded-none border bg-background px-3 text-sm">
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>{category.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition">Condicion</Label>
          <select id="condition" name="condition" defaultValue={filters.condition ?? ""} className="h-9 w-full rounded-none border bg-background px-3 text-sm">
            <option value="">Todas</option>
            {Object.entries(conditionLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Ubicacion</Label>
          <Input id="location" name="location" defaultValue={filters.location} placeholder="CDMX, Monterrey" className="rounded-none" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="min">Min/h</Label>
            <Input id="min" name="min" type="number" min="0" defaultValue={filters.min} className="rounded-none" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max">Max/h</Label>
            <Input id="max" name="max" type="number" min="0" defaultValue={filters.max} className="rounded-none" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sort">Orden</Label>
          <select id="sort" name="sort" defaultValue={filters.sort ?? "recent"} className="h-9 w-full rounded-none border bg-background px-3 text-sm">
            <option value="recent">Mas recientes</option>
            <option value="price_asc">Precio menor</option>
            <option value="price_desc">Precio mayor</option>
          </select>
        </div>

        <Button type="submit" className="w-full rounded-none">Aplicar filtros</Button>
      </form>
    </aside>
  )
}
