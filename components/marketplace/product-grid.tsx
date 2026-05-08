import type { EquipmentCardRecord } from "@/lib/queries"
import { ProductCard } from "@/components/marketplace/product-card"

type ProductGridProps = {
  equipment: EquipmentCardRecord[]
}

export function ProductGrid({ equipment }: ProductGridProps) {
  if (equipment.length === 0) {
    return (
      <div className="flex min-h-80 items-center justify-center border bg-muted/20 p-10 text-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Sin resultados</p>
          <h3 className="mt-3 text-xl font-semibold">No hay maquinaria con esos filtros.</h3>
          <p className="mt-2 text-sm text-muted-foreground">Ajusta la busqueda o publica la primera oferta.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
      {equipment.map((item) => (
        <ProductCard key={item.id} equipment={item} />
      ))}
    </div>
  )
}
