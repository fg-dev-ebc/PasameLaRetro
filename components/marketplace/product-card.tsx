import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { conditionLabels } from "@/lib/constants"
import { formatCurrency } from "@/lib/format"
import type { EquipmentCardRecord } from "@/lib/queries"

type ProductCardProps = {
  equipment: EquipmentCardRecord
}

export function ProductCard({ equipment }: ProductCardProps) {
  const image = equipment.equipment_images[0]

  return (
    <Link href={`/maquinaria/${equipment.id}`} className="group block h-full">
      <Card className="h-full rounded-none border bg-background py-0 ring-0">
        <div className="relative aspect-[4/3] border-b bg-muted">
          {image ? (
            <Image
              src={image.public_url}
              alt={image.alt_text || equipment.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover grayscale"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Sin imagen
            </div>
          )}
        </div>
        <CardContent className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {equipment.categories?.name ?? "Maquinaria"}
              </p>
              <h3 className="mt-2 line-clamp-2 text-lg font-semibold tracking-tight">
                {equipment.title}
              </h3>
            </div>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
          </div>

          <div className="mt-auto space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              <span className="truncate">{equipment.location}</span>
            </div>
            <div className="flex items-end justify-between gap-3 border-t pt-3">
              <Badge variant="outline" className="rounded-none font-mono text-[11px]">
                {conditionLabels[equipment.condition]}
              </Badge>
              <div className="text-right">
                <p className="font-mono text-lg font-semibold">
                  {formatCurrency(equipment.price_per_hour, equipment.currency)}
                </p>
                <p className="font-mono text-[11px] uppercase text-muted-foreground">por hora</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
