import Link from "next/link"
import { redirect } from "next/navigation"

import { RegisterForm } from "@/components/marketplace/auth-forms"
import { getCurrentUserProfile } from "@/lib/queries"

export default async function RegisterPage() {
  const { user } = await getCurrentUserProfile()
  if (user) redirect("/dashboard")

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Onboarding</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em]">Publica o renta maquinaria en minutos.</h1>
        <p className="mt-5 text-muted-foreground">Elige tu rol inicial. Puedes operar como owner, renter o ambos.</p>
        <p className="mt-8 text-sm text-muted-foreground">Ya tienes cuenta? <Link href="/login" className="text-foreground underline">Entrar</Link></p>
      </div>
      <RegisterForm />
    </div>
  )
}
