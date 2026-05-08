"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import type { ActionState } from "@/lib/actions/types"
import { createClient } from "@/lib/supabase/server"

const bookingSchema = z.object({
  equipment_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().max(500).optional(),
})

export async function createBookingAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = bookingSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return { message: "Selecciona una fecha y horario valido." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { message: "Inicia sesion para agendar." }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "renter") {
    return { message: "Solo los contratistas pueden agendar maquinaria." }
  }

  const { data: equipment } = await supabase
    .from("equipment")
    .select("owner_id")
    .eq("id", parsed.data.equipment_id)
    .eq("status", "active")
    .single()

  if (!equipment) {
    return { message: "La maquinaria no esta disponible." }
  }

  const startAt = new Date(`${parsed.data.date}T${parsed.data.start_time}:00.000Z`)
  const endAt = new Date(`${parsed.data.date}T${parsed.data.end_time}:00.000Z`)

  const { error } = await supabase.from("bookings").insert({
    equipment_id: parsed.data.equipment_id,
    owner_id: equipment.owner_id,
    renter_id: user.id,
    start_at: startAt.toISOString(),
    end_at: endAt.toISOString(),
    notes: parsed.data.notes || null,
  })

  if (error) {
    return { message: "Ese horario no esta disponible o choca con otra reserva." }
  }

  revalidatePath(`/maquinaria/${parsed.data.equipment_id}`)
  redirect("/dashboard/reservas")
}

export async function updateBookingStatusAction(formData: FormData) {
  const bookingId = String(formData.get("booking_id") ?? "")
  const status = String(formData.get("status") ?? "")

  if (!bookingId || !["confirmed", "cancelled", "completed", "rejected"].includes(status)) {
    return
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (status === "confirmed" || status === "rejected" || status === "completed") {
    if (profile?.role !== "owner") return
  }

  await supabase.from("bookings").update({ status }).eq("id", bookingId)
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/reservas")
}
