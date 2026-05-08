import { notFound, redirect } from "next/navigation"

import { AvailabilityForm } from "@/components/marketplace/availability-form"
import { getCurrentUserProfile, getEquipmentForEdit } from "@/lib/queries"

type AvailabilityPageProps = {
  params: Promise<{ id: string }>
}

export default async function AvailabilityPage({ params }: AvailabilityPageProps) {
  const { id } = await params
  const [{ user, profile }, equipment] = await Promise.all([getCurrentUserProfile(), getEquipmentForEdit(id)])

  if (!user) redirect(`/login?next=/dashboard/maquinaria/${id}/horarios`)
  if (profile?.role !== "owner") redirect("/dashboard")
  if (!equipment) notFound()

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 border-b pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Horarios</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">{equipment.title}</h1>
      </div>
      <AvailabilityForm equipmentId={equipment.id} rules={equipment.availability_rules} />
    </div>
  )
}
