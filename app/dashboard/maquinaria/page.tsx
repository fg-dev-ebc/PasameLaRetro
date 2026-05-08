import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"

import { deleteEquipmentAction } from "@/lib/actions/equipment"
import { formatCurrency } from "@/lib/format"
import { getCurrentUserProfile, getOwnerEquipment } from "@/lib/queries"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { statusLabels } from "@/lib/constants"
import { cn } from "@/lib/utils"

export default async function DashboardEquipmentPage() {
  const { user, profile } = await getCurrentUserProfile()
  if (!user) redirect("/login?next=/dashboard/maquinaria")
  if (profile?.role !== "owner") redirect("/dashboard")

  const equipment = await getOwnerEquipment()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4 border-b pb-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Owner</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Mis publicaciones</h1>
        </div>
        <Link href="/publicar" className={cn(buttonVariants(), "rounded-none")}>Nueva oferta</Link>
      </div>

      <div className="grid gap-px bg-border">
        {equipment.map((item) => (
          <div key={item.id} className="grid gap-4 bg-background p-4 md:grid-cols-[120px_1fr_auto] md:items-center">
            <div className="relative aspect-[4/3] bg-muted">
              {item.equipment_images[0] ? <Image src={item.equipment_images[0].public_url} alt={item.title} fill sizes="120px" className="object-cover grayscale" /> : null}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-none font-mono text-[11px]">{statusLabels[item.status]}</Badge>
                <span className="font-mono text-xs text-muted-foreground">{formatCurrency(item.price_per_hour, item.currency)}/h</span>
              </div>
              <h2 className="mt-2 text-xl font-semibold">{item.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{item.location}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/dashboard/maquinaria/${item.id}/editar`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-none")}>Editar</Link>
              <Link href={`/dashboard/maquinaria/${item.id}/horarios`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-none")}>Horarios</Link>
              <form action={deleteEquipmentAction}>
                <input type="hidden" name="equipment_id" value={item.id} />
                <Button type="submit" variant="destructive" size="sm" className="rounded-none">Eliminar</Button>
              </form>
            </div>
          </div>
        ))}
        {equipment.length === 0 ? <div className="bg-background p-10 text-center text-muted-foreground">Aun no has publicado maquinaria.</div> : null}
      </div>
    </div>
  )
}
