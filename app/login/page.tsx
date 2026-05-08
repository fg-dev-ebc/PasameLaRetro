import Link from "next/link"
import { redirect } from "next/navigation"

import { LoginForm } from "@/components/marketplace/auth-forms"
import { getCurrentUserProfile } from "@/lib/queries"

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const { user } = await getCurrentUserProfile()
  if (user) redirect("/dashboard")

  const oauthError = params.error === "oauth"

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Auth</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em]">Entra al panel operativo.</h1>
        <p className="mt-5 text-muted-foreground">Gestiona maquinaria, horarios y reservas desde un panel operativo privado.</p>
        <p className="mt-8 text-sm text-muted-foreground">No tienes cuenta? <Link href="/registro" className="text-foreground underline">Registrate</Link></p>
      </div>
      <div className="space-y-4">
        {oauthError ? (
          <div className="border border-destructive/40 bg-background p-4 text-sm text-destructive">
            El inicio con Google aun no esta disponible en este entorno.
          </div>
        ) : null}
        <LoginForm />
      </div>
    </div>
  )
}
