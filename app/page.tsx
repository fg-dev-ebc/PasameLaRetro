import Link from "next/link"
import { ArrowUpRight, CalendarCheck, ShieldCheck, Truck } from "lucide-react"

import { ProductGrid } from "@/components/marketplace/product-grid"
import { SearchBar } from "@/components/marketplace/search-bar"
import { buttonVariants } from "@/components/ui/button"
import { getCategories, getEquipmentList } from "@/lib/queries"
import { cn } from "@/lib/utils"

export default async function HomePage() {
  const [categories, equipment] = await Promise.all([getCategories(), getEquipmentList({}, 6)])

  return (
    <div>
      <section className="border-b">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Marketplace de renta de maquinaria
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Maquinaria disponible, agenda clara, operacion sin friccion.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              PasameLaRetro conecta dueños de maquinaria con contratistas que necesitan disponibilidad real por horas.
            </p>
            <div className="mt-10 max-w-2xl">
              <SearchBar large />
            </div>
          </div>

          <div className="grid content-between border bg-muted/20 p-6">
            <div className="grid grid-cols-2 gap-px bg-border">
              {[
                ["Activos", "24/7"],
                ["Reservas", "Por hora"],
                ["Agenda", "Validada"],
                ["Owners", "Verificados"],
              ].map(([label, value]) => (
                <div key={label} className="bg-background p-5">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                  <p className="mt-6 font-mono text-2xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 border-t pt-6">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Owner flow</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight">Publica maquinaria con imagenes y disponibilidad variable.</p>
              <Link href="/publicar" className={cn(buttonVariants(), "mt-6 rounded-none")}>Publicar oferta</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Categorias</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Equipos destacados</h2>
          </div>
          <Link href="/catalogo" className="hidden items-center gap-1 font-mono text-xs uppercase tracking-[0.16em] sm:flex">
            Ver catalogo <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <Link key={category.id} href={`/catalogo?category=${category.slug}`} className="bg-background p-5 hover:bg-muted/30">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">{category.slug}</p>
              <h3 className="mt-8 text-xl font-semibold">{category.name}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Inventario reciente</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Maquinaria lista para agendar</h2>
            </div>
            <Link href="/catalogo" className={cn(buttonVariants({ variant: "outline" }), "hidden rounded-none sm:inline-flex")}>
              Explorar todo
            </Link>
          </div>
          <ProductGrid equipment={equipment} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-px bg-border lg:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Operacion segura", text: "Dueños y contratistas mantienen control sobre publicaciones, agenda y solicitudes." },
            { icon: CalendarCheck, title: "Agenda validada", text: "Las reservas pasan por reglas de disponibilidad y bloqueo de solapes." },
            { icon: Truck, title: "Inventario real", text: "Publicaciones activas, fichas completas y control operativo desde el dashboard." },
          ].map((item) => (
            <div key={item.title} className="bg-background p-6">
              <item.icon className="size-5" />
              <h3 className="mt-8 text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
