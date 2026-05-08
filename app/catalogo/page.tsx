import { CatalogFilters } from "@/components/marketplace/catalog-filters"
import { ProductGrid } from "@/components/marketplace/product-grid"
import { getCategories, getEquipmentList, type CatalogFilters as Filters } from "@/lib/queries"

type CatalogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams
  const filters: Filters = {
    q: getParam(params.q),
    category: getParam(params.category),
    condition: getParam(params.condition),
    location: getParam(params.location),
    min: getParam(params.min),
    max: getParam(params.max),
    sort: getParam(params.sort),
  }
  const [categories, equipment] = await Promise.all([getCategories(), getEquipmentList(filters)])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 border-b pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Catalogo</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Maquinaria disponible</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">Filtra por categoria, precio, condicion y ubicacion. Todas las ofertas activas estan listas para evaluarse y agendarse.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <CatalogFilters categories={categories} filters={filters} />
        <ProductGrid equipment={equipment} />
      </div>
    </div>
  )
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
