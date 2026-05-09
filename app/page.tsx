import Link from "next/link"
import Image from "next/image"
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
              Renta de maquinaria sin vueltas
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Encuentra la retro, grua o montacargas que tu obra necesita.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Busca equipos cercanos, revisa disponibilidad y agenda directo con el dueño. Menos llamadas, menos esperas, mas obra avanzando.
            </p>
            <div className="mt-10 max-w-2xl">
              <SearchBar large />
            </div>
          </div>

          <div className="flex items-center justify-center border bg-white p-6">
            <Image
              src="/pasamelaretro-logo.png"
              alt="Pasame La Retro"
              width={760}
              height={432}
              priority
              className="w-[106%] max-w-none object-contain"
            />
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
            { icon: CalendarCheck, title: "Agenda validada", text: "Las reservas pasan por bloqueos de reglas de disponibilidad." },
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
