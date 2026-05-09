import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { CalendarDays, MapPin, Phone, UserRound } from "lucide-react"

import { BookingForm } from "@/components/marketplace/booking-form"
import { ProductGrid } from "@/components/marketplace/product-grid"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { conditionLabels, weekdays } from "@/lib/constants"
import { formatCurrency, toTimeLabel } from "@/lib/format"
import { getCurrentUserProfile, getEquipmentById, getRelatedEquipment } from "@/lib/queries"

type EquipmentPageProps = {
  params: Promise<{ id: string }>
}

export default async function EquipmentPage({ params }: EquipmentPageProps) {
  const { id } = await params
  const equipment = await getEquipmentById(id)

  if (!equipment || equipment.status !== "active") notFound()

  const [{ user, profile }, related] = await Promise.all([getCurrentUserProfile(), getRelatedEquipment(equipment)])
  const images = equipment.equipment_images

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <div className="grid gap-px bg-border sm:grid-cols-4">
            <div className="relative aspect-[16/10] bg-muted sm:col-span-3">
              {images[0] ? (
                <Image src={images[0].public_url} alt={images[0].alt_text || equipment.title} fill sizes="(min-width: 1024px) 66vw, 100vw" className="object-cover grayscale" />
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center bg-muted font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Sin imagen</div>
              )}
            </div>
            <div className="grid gap-px bg-border">
              {images.slice(1, 4).map((image) => (
                <div key={image.public_url} className="relative min-h-32 bg-muted">
                  <Image src={image.public_url} alt={image.alt_text || equipment.title} fill sizes="180px" className="object-cover grayscale" />
                </div>
              ))}
            </div>
          </div>

          <section>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-none font-mono text-[11px]">{equipment.categories?.name}</Badge>
              <Badge variant="outline" className="rounded-none font-mono text-[11px]">{conditionLabels[equipment.condition]}</Badge>
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">{equipment.title}</h1>
            <div className="mt-5 flex flex-wrap gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><MapPin className="size-4" /> {equipment.location}</span>
              <span className="font-mono">Min. {equipment.min_rental_hours}h</span>
            </div>
            <Separator className="my-8" />
            <div className="prose prose-neutral max-w-none">
              <p className="whitespace-pre-line text-base leading-8 text-foreground">{equipment.description}</p>
            </div>
          </section>

          <Card className="rounded-none ring-0">
            <CardHeader className="border-b">
              <CardTitle>Disponibilidad publicada</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-px bg-border p-0 sm:grid-cols-2 lg:grid-cols-3">
              {weekdays.map((day) => {
                const rules = equipment.availability_rules.filter((rule) => rule.weekday === day.value)
                return (
                  <div key={day.value} className="bg-background p-4">
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{day.label}</p>
                    {rules.length > 0 ? (
                      rules.map((rule) => (
                        <p key={rule.id} className="mt-3 font-mono text-sm">{toTimeLabel(rule.start_time)} - {toTimeLabel(rule.end_time)}</p>
                      ))
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">No disponible</p>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <Card className="rounded-none ring-0">
            <CardContent className="space-y-5 p-5">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Tarifa</p>
                <p className="mt-2 font-mono text-4xl font-semibold">{formatCurrency(equipment.price_per_hour, equipment.currency)}</p>
                <p className="font-mono text-xs uppercase text-muted-foreground">por hora</p>
              </div>
              {equipment.price_per_day ? (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">Dia completo</p>
                  <p className="font-mono text-xl font-semibold">{formatCurrency(equipment.price_per_day, equipment.currency)}</p>
                </div>
              ) : null}
              {equipment.deposit_amount ? (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">Deposito sugerido</p>
                  <p className="font-mono text-xl font-semibold">{formatCurrency(equipment.deposit_amount, equipment.currency)}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-none ring-0">
            <CardHeader className="border-b">
              <CardTitle>Owner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5 text-sm">
              <p className="flex items-center gap-2"><UserRound className="size-4" /> {equipment.owner?.company_name || equipment.owner?.full_name || "Owner verificado"}</p>
              <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="size-4" /> {equipment.owner?.location || equipment.location}</p>
              {equipment.owner?.phone ? (
                <Link href={`tel:${equipment.owner.phone}`} className="flex items-center gap-2 underline"><Phone className="size-4" /> Contactar vendedor</Link>
              ) : (
                <p className="flex items-center gap-2 text-muted-foreground"><Phone className="size-4" /> Contacto tras reserva</p>
              )}
            </CardContent>
          </Card>

          <BookingForm equipmentId={equipment.id} isAuthenticated={Boolean(user)} userRole={profile?.role} />
        </aside>
      </div>

      <section className="mt-14 border-t pt-10">
        <div className="mb-6 flex items-center gap-2">
          <CalendarDays className="size-5" />
          <h2 className="text-2xl font-semibold tracking-tight">Relacionados</h2>
        </div>
        <ProductGrid equipment={related} />
      </section>
    </div>
  )
}
