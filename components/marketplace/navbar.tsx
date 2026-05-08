import Link from "next/link"
import { Tractor } from "lucide-react"
import { User } from "@supabase/supabase-js"

import { signOutAction } from "@/lib/actions/auth"
import type { Tables } from "@/lib/supabase/database.types"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type NavbarProps = {
  user: User | null
  profile: Tables<"profiles"> | null
}

export function Navbar({ user, profile }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-lg border border-foreground bg-foreground text-background">
            <Tractor className="size-4" />
          </span>
          <span className="font-mono text-sm font-semibold tracking-tight">PasameLaRetro</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/catalogo" className="hover:text-foreground">Catalogo</Link>
          {user ? (
            <>
              {profile?.role === "owner" ? <Link href="/publicar" className="hover:text-foreground">Publicar</Link> : null}
              <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            </>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden max-w-40 truncate font-mono text-xs text-muted-foreground sm:inline">
                {profile?.company_name || profile?.full_name || user.email}
              </span>
              <form action={signOutAction}>
                <Button type="submit" variant="outline" size="sm">Salir</Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                Login
              </Link>
              <Link href="/registro" className={cn(buttonVariants({ size: "sm" }))}>
                Registro
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
