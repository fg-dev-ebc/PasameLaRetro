import { redirect } from "next/navigation"

import { updateBookingStatusAction } from "@/lib/actions/bookings"
import { bookingStatusLabels } from "@/lib/constants"
import { formatCurrency, formatDateTime } from "@/lib/format"
import { getBookingsForUser, getCurrentUserProfile } from "@/lib/queries"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default async function BookingsPage() {
  const { user } = await getCurrentUserProfile()
  if (!user) redirect("/login?next=/dashboard/reservas")

  const bookings = await getBookingsForUser()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 border-b pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Agenda</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Reservas</h1>
      </div>

      <div className="grid gap-px bg-border">
        {bookings.map((booking) => {
          const isOwner = booking.owner_id === user.id
          return (
            <div key={booking.id} className="grid gap-4 bg-background p-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-none font-mono text-[11px]">{bookingStatusLabels[booking.status]}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">{isOwner ? "Recibida" : "Solicitada"}</span>
                </div>
                <h2 className="mt-3 text-xl font-semibold">{booking.equipment?.title ?? "Maquinaria"}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{formatDateTime(booking.start_at)} - {formatDateTime(booking.end_at)}</p>
                <p className="mt-2 font-mono text-sm">{formatCurrency(booking.total_price)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isOwner ? `Renter: ${booking.renter?.company_name || booking.renter?.full_name || "Usuario"}` : `Owner: ${booking.owner?.company_name || booking.owner?.full_name || "Owner"}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {isOwner && booking.status === "pending" ? (
                  <>
                    <StatusForm id={booking.id} status="confirmed" label="Confirmar" />
                    <StatusForm id={booking.id} status="rejected" label="Rechazar" variant="outline" />
                  </>
                ) : null}
                {booking.status === "pending" || booking.status === "confirmed" ? (
                  <StatusForm id={booking.id} status="cancelled" label="Cancelar" variant="destructive" />
                ) : null}
                {isOwner && booking.status === "confirmed" ? (
                  <StatusForm id={booking.id} status="completed" label="Completar" variant="outline" />
                ) : null}
              </div>
            </div>
          )
        })}
        {bookings.length === 0 ? <div className="bg-background p-10 text-center text-muted-foreground">No hay reservas todavia.</div> : null}
      </div>
    </div>
  )
}

function StatusForm({ id, status, label, variant = "default" }: { id: string; status: string; label: string; variant?: "default" | "outline" | "destructive" }) {
  return (
    <form action={updateBookingStatusAction}>
      <input type="hidden" name="booking_id" value={id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" size="sm" variant={variant} className="rounded-none">{label}</Button>
    </form>
  )
}
