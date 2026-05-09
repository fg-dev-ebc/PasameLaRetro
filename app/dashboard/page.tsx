import Link from "next/link"
import { redirect } from "next/navigation"
import { CalendarCheck, Plus, Truck } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { getBookingsForUser, getCurrentUserProfile, getOwnerEquipment } from "@/lib/queries"
import { cn } from "@/lib/utils"

export default async function DashboardPage() {
  const { user, profile } = await getCurrentUserProfile()
  if (!user) redirect("/login?next=/dashboard")

  const isOwner = profile?.role === "owner"
  const [equipment, bookings] = await Promise.all([
    isOwner ? getOwnerEquipment() : Promise.resolve([]),
    getBookingsForUser(),
  ])
  const received = bookings.filter((booking) => booking.owner_id === user.id)
  const requested = bookings.filter((booking) => booking.renter_id === user.id)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Dashboard</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Operacion</h1>
          <p className="mt-3 text-muted-foreground">{profile?.company_name || profile?.full_name || user.email}</p>
        </div>
        {isOwner ? (
          <Link href="/publicar" className={cn(buttonVariants(), "rounded-none")}><Plus className="size-4" /> Publicar maquinaria</Link>
        ) : null}
      </div>

      <div className={cn("grid gap-px bg-border", isOwner ? "md:grid-cols-3" : "md:grid-cols-1")}>
        {isOwner ? <Metric title="Publicaciones" value={equipment.length} icon={Truck} /> : null}
        {isOwner ? <Metric title="Reservas recibidas" value={received.length} icon={CalendarCheck} /> : null}
        <Metric title="Reservas hechas" value={requested.length} icon={CalendarCheck} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {isOwner ? (
          <Card className="rounded-none ring-0">
            <CardHeader className="border-b"><CardTitle>Accesos owner</CardTitle></CardHeader>
            <CardContent className="grid gap-px bg-border p-0">
              <Link href="/dashboard/maquinaria" className="bg-background p-5 hover:bg-muted/30">Mis publicaciones</Link>
              <Link href="/publicar" className="bg-background p-5 hover:bg-muted/30">Nueva oferta</Link>
            </CardContent>
          </Card>
        ) : null}
        <Card className="rounded-none ring-0">
          <CardHeader className="border-b"><CardTitle>Reservas</CardTitle></CardHeader>
          <CardContent className="grid gap-px bg-border p-0">
            <Link href="/dashboard/reservas" className="bg-background p-5 hover:bg-muted/30">Ver agenda completa</Link>
            <Link href="/catalogo" className="bg-background p-5 hover:bg-muted/30">Buscar maquinaria</Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Metric({ title, value, icon: Icon }: { title: string; value: number; icon: typeof Truck }) {
  return (
    <div className="bg-background p-6">
      <Icon className="size-5" />
      <p className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
      <p className="mt-2 font-mono text-4xl font-semibold">{value}</p>
    </div>
  )
}
