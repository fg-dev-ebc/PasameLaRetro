"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { createEquipmentAction, saveEquipmentImagesAction, updateEquipmentAction } from "@/lib/actions/equipment"
import { initialActionState } from "@/lib/actions/types"
import { conditionLabels, statusLabels, weekdays } from "@/lib/constants"
import type { EquipmentDetailRecord } from "@/lib/queries"
import type { Tables } from "@/lib/supabase/database.types"
import { createClient } from "@/lib/supabase/client"
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
  const router = useRouter()
  const action = equipment ? updateEquipmentAction.bind(null, equipment.id) : createEquipmentAction
  const [state, formAction] = useActionState(action, initialActionState)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<string>()
  const uploadedEquipmentId = useRef<string | null>(null)

  const modeLabel = equipment ? "edicion" : "creacion"
  const values = state.values ?? {}
  console.log(`[ProductForm] Render - Modo: ${modeLabel}`, equipment ? { id: equipment.id } : "nuevo")

  if (state.message) {
    console.log(`[ProductForm] Estado: ok=${state.ok} msg="${state.message}"`)
  }
  if (state.errors) {
    console.log("[ProductForm] Errores de validacion:", JSON.stringify(state.errors))
  }

  useEffect(() => {
    if (equipment || !state.ok || !state.equipmentId || uploadedEquipmentId.current === state.equipmentId) return

    uploadedEquipmentId.current = state.equipmentId

    async function uploadImages() {
      const equipmentId = state.equipmentId
      if (!equipmentId) return

      if (imageFiles.length === 0) {
        router.push(`/maquinaria/${equipmentId}`)
        router.refresh()
        return
      }

      setIsUploadingImages(true)
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsUploadingImages(false)
        setUploadMessage("La maquinaria se publico, pero la sesion expiro antes de subir imagenes.")
        return
      }

      const uploadedImages = []

      for (const [position, file] of imageFiles.slice(0, 8).entries()) {
        if (file.size > 10 * 1024 * 1024) {
          setIsUploadingImages(false)
          setUploadMessage("Cada imagen debe pesar maximo 10 MB.")
          return
        }

        const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
        const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
        const path = `${user.id}/${equipmentId}/${uniqueId}.${fileExt}`
        const { error } = await supabase.storage.from("equipment-images").upload(path, file, { upsert: false })

        if (error) {
          setIsUploadingImages(false)
          setUploadMessage("La maquinaria se publico, pero no pudimos subir todas las imagenes.")
          return
        }

        const { data } = supabase.storage.from("equipment-images").getPublicUrl(path)
        uploadedImages.push({
          path,
          public_url: data.publicUrl,
          alt_text: file.name,
          position,
        })
      }

      const imageState = await saveEquipmentImagesAction(equipmentId, uploadedImages)
      if (!imageState.ok) {
        setIsUploadingImages(false)
        setUploadMessage(imageState.message ?? "La maquinaria se publico, pero no pudimos guardar las imagenes.")
        return
      }

      router.push(`/maquinaria/${equipmentId}`)
      router.refresh()
    }

    uploadImages()
  }, [equipment, imageFiles, router, state.equipmentId, state.ok])

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
          <FormMessage message={uploadMessage ?? state.message} />
          <div className="space-y-2">
            <Label htmlFor="title">Titulo</Label>
            <Input id="title" name="title" defaultValue={values.title ?? equipment?.title} required placeholder="Excavadora 320 GC lista para obra" className="rounded-none" />
            <FormMessage message={state.errors?.title?.[0]} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea id="description" name="description" defaultValue={values.description ?? equipment?.description} required rows={7} placeholder="Capacidad, operador incluido, restricciones, mantenimiento y condiciones de entrega." className="rounded-none" />
            <FormMessage message={state.errors?.description?.[0]} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoria</Label>
              <select id="category_id" name="category_id" defaultValue={values.category_id ?? equipment?.category_id ?? ""} required className="h-9 w-full rounded-none border bg-background px-3 text-sm">
                <option value="" disabled>Selecciona</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condicion</Label>
              <select id="condition" name="condition" defaultValue={values.condition ?? equipment?.condition ?? "good"} className="h-9 w-full rounded-none border bg-background px-3 text-sm">
                {Object.entries(conditionLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {equipment ? (
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select id="status" name="status" defaultValue={values.status ?? equipment.status} className="h-9 w-full rounded-none border bg-background px-3 text-sm">
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price_per_hour">Precio/hora</Label>
              <Input id="price_per_hour" name="price_per_hour" type="number" min="0" step="1" defaultValue={values.price_per_hour ?? equipment?.price_per_hour} required className="rounded-none" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_per_day">Precio/dia</Label>
              <Input id="price_per_day" name="price_per_day" type="number" min="0" step="1" defaultValue={values.price_per_day ?? equipment?.price_per_day ?? ""} className="rounded-none" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deposit_amount">Deposito</Label>
              <Input id="deposit_amount" name="deposit_amount" type="number" min="0" step="1" defaultValue={values.deposit_amount ?? equipment?.deposit_amount ?? ""} className="rounded-none" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="location">Ubicacion</Label>
              <Input id="location" name="location" defaultValue={values.location ?? equipment?.location} required placeholder="Zona de cobertura" className="rounded-none" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_rental_hours">Min. horas</Label>
              <Input id="min_rental_hours" name="min_rental_hours" type="number" min="1" defaultValue={values.min_rental_hours ?? equipment?.min_rental_hours ?? 1} required className="rounded-none" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" name="city" defaultValue={values.city ?? equipment?.city ?? ""} className="rounded-none" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input id="state" name="state" defaultValue={values.state ?? equipment?.state ?? ""} className="rounded-none" />
            </div>
          </div>

          {!equipment ? (
            <div className="space-y-2">
              <Label htmlFor="images">Imagenes</Label>
              <Input
                id="images"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                multiple
                onChange={(event) => setImageFiles(Array.from(event.target.files ?? []).slice(0, 8))}
                className="rounded-none file:mr-3 file:bg-foreground file:px-3 file:text-background file:hover:bg-foreground/90"
              />
              <p className="font-mono text-xs text-muted-foreground">Hasta 8 archivos. Maximo 10 MB por imagen.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <ScheduleFields rules={equipment?.availability_rules ?? []} />
        <SubmitButton className="h-11 w-full rounded-none" loading={isUploadingImages} pendingText="Publicando">
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
              <Input name={`start_${day.value}`} type="time" defaultValue={rule?.start_time.slice(0, 5) ?? "08:00"} className="rounded-none" />
              <Input name={`end_${day.value}`} type="time" defaultValue={rule?.end_time.slice(0, 5) ?? "17:00"} className="rounded-none" />
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
