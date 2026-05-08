import { redirect } from "next/navigation"

import { ProductForm } from "@/components/marketplace/product-form"
import { getCategories, getCurrentUserProfile } from "@/lib/queries"

export default async function PublishPage() {
  console.log("[PublishPage] Cargando pagina de publicar")
  const [{ user }, categories] = await Promise.all([getCurrentUserProfile(), getCategories()])
  console.log("[PublishPage] Usuario:", user ? user.id : "no autenticado")
  console.log("[PublishPage] Categorias cargadas:", categories.length)
  if (!user) {
    console.log("[PublishPage] Redirigiendo a login")
    redirect("/login?next=/publicar")
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 border-b pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Owner</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Publicar oferta de maquinaria</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">Crea la ficha, agrega imagenes y define horarios disponibles para agendamiento.</p>
      </div>
      <ProductForm categories={categories} />
    </div>
  )
}
