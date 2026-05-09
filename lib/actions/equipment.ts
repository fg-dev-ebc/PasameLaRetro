"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import type { ActionState } from "@/lib/actions/types"
import { createClient } from "@/lib/supabase/server"
import type { TablesInsert } from "@/lib/supabase/database.types"

const equipmentSchema = z.object({
  title: z.string().min(4, "Minimo 4 caracteres"),
  description: z.string().min(10, "Agrega al menos 10 caracteres"),
  category_id: z.string().uuid("Selecciona una categoria"),
  condition: z.enum(["new", "excellent", "good", "fair", "needs_service"]),
  status: z.enum(["active", "paused", "maintenance", "archived"]).default("active"),
  price_per_hour: z.coerce.number().positive("Agrega precio por hora"),
  price_per_day: z.coerce.number().optional().nullable(),
  deposit_amount: z.coerce.number().optional().nullable(),
  min_rental_hours: z.coerce.number().int().positive().default(1),
  location: z.string().min(3, "Agrega ubicacion"),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
})

const timeSchema = z.object({
  weekday: z.coerce.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
})

function optionalNumber(value: FormDataEntryValue | null) {
  if (!value || value.toString().trim() === "") return null
  return Number(value)
}

function getEquipmentFormValues(formData: FormData, status = "active") {
  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    category_id: String(formData.get("category_id") ?? ""),
    condition: String(formData.get("condition") ?? "good"),
    status: String(formData.get("status") ?? status),
    price_per_hour: String(formData.get("price_per_hour") ?? ""),
    price_per_day: String(formData.get("price_per_day") ?? ""),
    deposit_amount: String(formData.get("deposit_amount") ?? ""),
    min_rental_hours: String(formData.get("min_rental_hours") ?? "1"),
    location: String(formData.get("location") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
  }
}

function getAvailabilityRules(formData: FormData) {
  return Array.from({ length: 7 }, (_, weekday) => {
    const enabled = formData.get(`day_${weekday}`) === "on"
    if (!enabled) return null

    return timeSchema.parse({
      weekday,
      start_time: formData.get(`start_${weekday}`),
      end_time: formData.get(`end_${weekday}`),
    })
  }).filter((rule): rule is z.infer<typeof timeSchema> => Boolean(rule))
}

export async function createEquipmentAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  console.log("===== [createEquipmentAction] INICIO =====")
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[createEquipmentAction] ERROR - Usuario no autenticado")
      return { message: "Inicia sesion para publicar maquinaria." }
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "owner") {
      console.log("[createEquipmentAction] ERROR - Rol no es owner:", profile?.role)
      return { message: "Solo los dueños de maquinaria pueden publicar ofertas." }
    }
    console.log("[createEquipmentAction] Usuario autenticado:", user.id, "rol:", profile?.role)

    const values = getEquipmentFormValues(formData)
    const rawData = {
      ...values,
      price_per_day: optionalNumber(formData.get("price_per_day")),
      deposit_amount: optionalNumber(formData.get("deposit_amount")),
      city: values.city || null,
      state: values.state || null,
    }
    console.log("[createEquipmentAction] Raw form data:", rawData)

    const parsed = equipmentSchema.safeParse(rawData)

    if (!parsed.success) {
      console.log("[createEquipmentAction] Validacion Zod fallo:", parsed.error.flatten().fieldErrors)
      return { errors: parsed.error.flatten().fieldErrors, values }
    }
    console.log("[createEquipmentAction] Datos validados OK")

    const rules = getAvailabilityRules(formData)
    console.log("[createEquipmentAction] Horarios parseados:", rules.length)
    if (rules.length === 0) {
      console.log("[createEquipmentAction] ERROR - 0 horarios disponibles")
      return { message: "Define al menos un horario disponible.", values }
    }

    const payload: TablesInsert<"equipment"> = {
      ...parsed.data,
      owner_id: user.id,
      currency: "MXN",
      specs: {},
    }

    console.log("[createEquipmentAction] Insertando equipo en DB...", payload)
    const { data: equipment, error } = await supabase
      .from("equipment")
      .insert(payload)
      .select("id")
      .single()

    if (error) {
      console.log("[createEquipmentAction] ERROR DB insert:", JSON.stringify(error, null, 2))
      return { message: "No pudimos publicar la maquinaria." }
    }
    if (!equipment) {
      console.log("[createEquipmentAction] ERROR DB insert - no devolvio ID")
      return { message: "No pudimos publicar la maquinaria." }
    }
    console.log("[createEquipmentAction] Equipo creado ID:", equipment.id)

    const availabilityRows = rules.map((rule) => ({
      equipment_id: equipment.id,
      weekday: rule.weekday,
      start_time: rule.start_time,
      end_time: rule.end_time,
    }))

    const { error: availabilityError } = await supabase
      .from("availability_rules")
      .insert(availabilityRows)

    if (availabilityError) {
      console.log("[createEquipmentAction] ERROR availability insert:", JSON.stringify(availabilityError))
      return { message: "La maquinaria se publico, pero no pudimos guardar horarios." }
    }
    console.log("[createEquipmentAction] Horarios guardados OK")

    console.log("[createEquipmentAction] TODO OK - equipo listo para imagenes: " + equipment.id)
    revalidatePath("/")
    revalidatePath("/catalogo")
    return { ok: true, equipmentId: equipment.id }
  } catch (err) {
    const errObj = err as { digest?: string; message?: string }
    if (errObj?.digest?.startsWith("NEXT_REDIRECT") || errObj?.message === "NEXT_REDIRECT") throw err
    console.log("[createEquipmentAction] ERROR INESPERADO:", err instanceof Error ? err.message : String(err))
    console.log("[createEquipmentAction] Stack:", err instanceof Error ? err.stack : "---")
    return { message: "Error inesperado al publicar. Revisa la consola del servidor." }
  }
}

export async function saveEquipmentImagesAction(
  equipmentId: string,
  images: Array<{ path: string; public_url: string; alt_text: string; position: number }>
): Promise<ActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { message: "Inicia sesion para subir imagenes." }

  const { data: equipment } = await supabase
    .from("equipment")
    .select("id, owner_id")
    .eq("id", equipmentId)
    .single()

  if (!equipment || equipment.owner_id !== user.id) {
    return { message: "No puedes modificar imagenes de esta maquinaria." }
  }

  const rows: TablesInsert<"equipment_images">[] = images.slice(0, 8).map((image) => ({
    equipment_id: equipmentId,
    path: image.path,
    public_url: image.public_url,
    alt_text: image.alt_text,
    position: image.position,
  }))

  if (rows.length === 0) return { ok: true }

  const { error } = await supabase.from("equipment_images").insert(rows)
  if (error) return { message: "La maquinaria se publico, pero no pudimos guardar las imagenes." }

  revalidatePath("/")
  revalidatePath("/catalogo")
  revalidatePath(`/maquinaria/${equipmentId}`)
  return { ok: true }
}

export async function updateEquipmentAction(
  equipmentId: string,
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { message: "Inicia sesion para editar maquinaria." }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "owner") {
    return { message: "Solo los dueños de maquinaria pueden editar ofertas." }
  }

  const values = getEquipmentFormValues(formData)
  const parsed = equipmentSchema.safeParse({
    ...values,
    price_per_day: optionalNumber(formData.get("price_per_day")),
    deposit_amount: optionalNumber(formData.get("deposit_amount")),
    city: values.city || null,
    state: values.state || null,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, values }
  }

  const { error } = await supabase.from("equipment").update(parsed.data).eq("id", equipmentId)

  if (error) {
    return { message: "No pudimos actualizar la maquinaria." }
  }

  const rules = getAvailabilityRules(formData)
  if (rules.length > 0) {
    await supabase.from("availability_rules").delete().eq("equipment_id", equipmentId)
    await supabase.from("availability_rules").insert(
      rules.map((rule) => ({
        equipment_id: equipmentId,
        weekday: rule.weekday,
        start_time: rule.start_time,
        end_time: rule.end_time,
      }))
    )
  }

  revalidatePath("/dashboard")
  revalidatePath(`/maquinaria/${equipmentId}`)
  redirect("/dashboard/maquinaria")
}

export async function updateAvailabilityAction(
  equipmentId: string,
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { message: "Inicia sesion para editar horarios." }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "owner") {
    return { message: "Solo los dueños de maquinaria pueden editar horarios." }
  }

  const rules = getAvailabilityRules(formData)

  if (rules.length === 0) {
    return { message: "Define al menos un horario disponible." }
  }

  const { error: deleteError } = await supabase
    .from("availability_rules")
    .delete()
    .eq("equipment_id", equipmentId)

  if (deleteError) {
    return { message: "No pudimos reemplazar los horarios." }
  }

  const { error } = await supabase.from("availability_rules").insert(
    rules.map((rule) => ({
      equipment_id: equipmentId,
      weekday: rule.weekday,
      start_time: rule.start_time,
      end_time: rule.end_time,
    }))
  )

  if (error) {
    return { message: "No pudimos guardar los horarios." }
  }

  revalidatePath(`/maquinaria/${equipmentId}`)
  revalidatePath("/dashboard/maquinaria")
  return { ok: true, message: "Horarios actualizados." }
}

export async function deleteEquipmentAction(formData: FormData) {
  const equipmentId = String(formData.get("equipment_id") ?? "")
  const supabase = await createClient()

  if (!equipmentId) return

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "owner") return

  await supabase.from("equipment").delete().eq("id", equipmentId)
  revalidatePath("/dashboard")
  revalidatePath("/catalogo")
}
