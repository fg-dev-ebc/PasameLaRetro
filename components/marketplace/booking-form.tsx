"use client"

import Link from "next/link"
import { useActionState } from "react"

import { createBookingAction } from "@/lib/actions/bookings"
import { initialActionState } from "@/lib/actions/types"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SubmitButton } from "@/components/marketplace/submit-button"
import { cn } from "@/lib/utils"

type BookingFormProps = {
  equipmentId: string
  isAuthenticated: boolean
  userRole?: string | null
}

export function BookingForm({ equipmentId, isAuthenticated, userRole }: BookingFormProps) {
  const [state, formAction] = useActionState(createBookingAction, initialActionState)
  const today = new Date().toISOString().slice(0, 10)
  const isOwner = userRole === "owner"

  return (
    <Card className="rounded-none ring-0">
      <CardHeader className="border-b">
        <CardTitle>Agendar maquinaria</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {isOwner ? (
          <p className="text-sm text-muted-foreground">Los dueños de maquinaria no pueden agendar. Usa una cuenta de contratista.</p>
        ) : isAuthenticated ? (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="equipment_id" value={equipmentId} />
            {state.message ? <p className="text-sm text-destructive">{state.message}</p> : null}
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input id="date" name="date" type="date" min={today} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="start_time">Inicio</Label>
                <Input id="start_time" name="start_time" type="time" defaultValue="09:00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">Fin</Label>
                <Input id="end_time" name="end_time" type="time" defaultValue="13:00" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas para el owner</Label>
              <Textarea id="notes" name="notes" rows={4} placeholder="Obra, acceso, operador requerido, contacto." />
            </div>
            <SubmitButton className="w-full rounded-none" pendingText="Agendando">
              Solicitar reserva
            </SubmitButton>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Necesitas una cuenta para reservar y coordinar con el owner.</p>
            <Link href="/login" className={cn(buttonVariants(), "w-full rounded-none")}>
              Entrar para agendar
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
