"use client"

import { useActionState } from "react"

import { createEquipmentAction, updateEquipmentAction } from "@/lib/actions/equipment"
import { initialActionState } from "@/lib/actions/types"
import { conditionLabels, statusLabels, weekdays } from "@/lib/constants"
import type { EquipmentDetailRecord } from "@/lib/queries"
import type { Tables } from "@/lib/supabase/database.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SubmitButton } from "@/components/marketplace/submit-button"

type ProductFormProps = {
  categories: Tables<"categories">[]
  equipment?: EquipmentDetailRecord
}

export function ProductForm({ categories, equipment }: ProductFormProps) {
  const action = equipment ? updateEquipmentAction.bind(null, equipment.id) : createEquipmentAction
  const [state, formAction] = useActionState(action, initialActionState)

  const modeLabel = equipment ? "edicion" : "creacion"
  console.log(`[ProductForm] Render - Modo: ${modeLabel}`, equipment ? { id: equipment.id } : "nuevo")

  if (state.message) {
    console.log(`[ProductForm] Estado: ok=${state.ok} msg="${state.message}"`)
  }
  if (state.errors) {
    console.log("[ProductForm] Errores de validacion:", JSON.stringify(state.errors))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget
    const fd = new FormData(form)
    console.log("===== [ProductForm] SUBMIT =====")
    console.log("[ProductForm] Title:", fd.get("title"))
    const desc = String(fd.get("description") ?? "")
    console.log("[ProductForm] Description length:", desc.length)
    console.log("[ProductForm] Description text:", JSON.stringify(desc))
    console.log("[ProductForm] Category:", fd.get("category_id"))
    console.log("[ProductForm] Condition:", fd.get("condition"))
    console.log("[ProductForm] Price/hr:", fd.get("price_per_hour"))
    console.log("[ProductForm] Location:", fd.get("location"))
    console.log("[ProductForm] Images count:", fd.getAll("images").filter(f => f instanceof File && f.size > 0).length)
    const days = [0, 1, 2, 3, 4, 5, 6]
    const activeDays = days.filter(d => fd.get(`day_${d}`) === "on")
    console.log("[ProductForm] Availability days:", activeDays)
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="rounded-none ring-0">
        <CardHeader className="border-b">
          <CardTitle>Ficha tecnica</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 p-5">
          <FormMessage message={state.message} />
          <div className="space-y-2">
            <Label htmlFor="title">Titulo</Label>
            <Input id="title" name="title" defaultValue={equipment?.title} required placeholder="Excavadora 320 GC lista para obra" />
            <FormMessage message={state.errors?.title?.[0]} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea id="description" name="description" defaultValue={equipment?.description} required rows={7} placeholder="Capacidad, operador incluido, restricciones, mantenimiento y condiciones de entrega." />
            <FormMessage message={state.errors?.description?.[0]} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoria</Label>
              <select id="category_id" name="category_id" defaultValue={equipment?.category_id ?? ""} required className="h-9 w-full rounded-none border bg-background px-3 text-sm">
                <option value="" disabled>Selecciona</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condicion</Label>
              <select id="condition" name="condition" defaultValue={equipment?.condition ?? "good"} className="h-9 w-full rounded-none border bg-background px-3 text-sm">
                {Object.entries(conditionLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {equipment ? (
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select id="status" name="status" defaultValue={equipment.status} className="h-9 w-full rounded-none border bg-background px-3 text-sm">
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price_per_hour">Precio/hora</Label>
              <Input id="price_per_hour" name="price_per_hour" type="number" min="0" step="1" defaultValue={equipment?.price_per_hour} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_per_day">Precio/dia</Label>
              <Input id="price_per_day" name="price_per_day" type="number" min="0" step="1" defaultValue={equipment?.price_per_day ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deposit_amount">Deposito</Label>
              <Input id="deposit_amount" name="deposit_amount" type="number" min="0" step="1" defaultValue={equipment?.deposit_amount ?? ""} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="location">Ubicacion</Label>
              <Input id="location" name="location" defaultValue={equipment?.location} required placeholder="Zona de cobertura" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_rental_hours">Min. horas</Label>
              <Input id="min_rental_hours" name="min_rental_hours" type="number" min="1" defaultValue={equipment?.min_rental_hours ?? 1} required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" name="city" defaultValue={equipment?.city ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input id="state" name="state" defaultValue={equipment?.state ?? ""} />
            </div>
          </div>

          {!equipment ? (
            <div className="space-y-2">
              <Label htmlFor="images">Imagenes</Label>
              <Input id="images" name="images" type="file" accept="image/png,image/jpeg,image/webp,image/avif" multiple />
              <p className="font-mono text-xs text-muted-foreground">Hasta 8 archivos. Maximo 10 MB por imagen.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <ScheduleFields rules={equipment?.availability_rules ?? []} />
        <SubmitButton className="h-11 w-full rounded-none" pendingText="Guardando">
          {equipment ? "Guardar cambios" : "Publicar oferta"}
        </SubmitButton>
      </div>
    </form>
  )
}

function ScheduleFields({ rules }: { rules: Tables<"availability_rules">[] }) {
  return (
    <Card className="rounded-none ring-0">
      <CardHeader className="border-b">
        <CardTitle>Horarios variables</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-5">
        {weekdays.map((day) => {
          const rule = rules.find((item) => item.weekday === day.value)
          const defaultChecked = Boolean(rule) || (rules.length === 0 && day.value >= 1 && day.value <= 5)
          return (
            <div key={day.value} className="grid grid-cols-[64px_1fr_1fr] items-center gap-2 border-b pb-3 last:border-b-0 last:pb-0">
              <label className="flex items-center gap-2 font-mono text-xs uppercase">
                <input type="checkbox" name={`day_${day.value}`} defaultChecked={defaultChecked} className="size-4 accent-foreground" />
                {day.short}
              </label>
              <Input name={`start_${day.value}`} type="time" defaultValue={rule?.start_time.slice(0, 5) ?? "08:00"} />
              <Input name={`end_${day.value}`} type="time" defaultValue={rule?.end_time.slice(0, 5) ?? "17:00"} />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function FormMessage({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-sm text-destructive">{message}</p>
}
