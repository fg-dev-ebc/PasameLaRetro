import { notFound, redirect } from "next/navigation"

import { ProductForm } from "@/components/marketplace/product-form"
import { getCategories, getCurrentUserProfile, getEquipmentForEdit } from "@/lib/queries"

type EditEquipmentPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditEquipmentPage({ params }: EditEquipmentPageProps) {
  const { id } = await params
  const [{ user, profile }, categories, equipment] = await Promise.all([
    getCurrentUserProfile(),
    getCategories(),
    getEquipmentForEdit(id),
  ])

  if (!user) redirect(`/login?next=/dashboard/maquinaria/${id}/editar`)
  if (profile?.role !== "owner") redirect("/dashboard")
  if (!equipment) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 border-b pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Editar</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">{equipment.title}</h1>
      </div>
      <ProductForm categories={categories} equipment={equipment} />
    </div>
  )
}
