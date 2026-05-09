"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { Building2, Search } from "lucide-react"

import { signInAction, signInWithGoogleAction, signUpAction } from "@/lib/actions/auth"
import { initialActionState } from "@/lib/actions/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/marketplace/submit-button"

type UserRole = "owner" | "renter"

const roleOptions: Array<{
  value: UserRole
  title: string
  description: string
  icon: typeof Search
}> = [
  {
    value: "renter",
    title: "Contratista",
    description: "Busca y reserva maquinaria",
    icon: Search,
  },
  {
    value: "owner",
    title: "Dueno de maquinaria",
    description: "Publica y renta tus equipos",
    icon: Building2,
  },
]

export function LoginForm() {
  const [state, formAction] = useActionState(signInAction, initialActionState)

  return (
    <Card className="rounded-none ring-0">
      <CardHeader className="border-b">
        <CardTitle>Acceso operativo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <form action={formAction} className="space-y-4">
          <FormNotice ok={state.ok} message={state.message} />
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" className="rounded-none" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" className="rounded-none" />
          </div>
          <SubmitButton className="w-full rounded-none" pendingText="Entrando">
            Entrar
          </SubmitButton>
        </form>
        <form action={signInWithGoogleAction}>
          <Button type="submit" variant="outline" className="w-full rounded-none">
            <GoogleIcon />
            Continuar con Google
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function RegisterForm() {
  const [state, formAction] = useActionState(signUpAction, initialActionState)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

  if (!selectedRole) {
    return (
      <Card className="rounded-none ring-0">
        <CardHeader className="border-b text-center">
          <CardTitle>Crear cuenta</CardTitle>
          <p className="text-sm text-muted-foreground">Selecciona como quieres usar Pasame La Retro</p>
        </CardHeader>
        <CardContent className="space-y-6 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {roleOptions.map((option) => {
              const Icon = option.icon

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedRole(option.value)}
                  className="group flex min-h-44 flex-col items-center justify-center gap-4 rounded-none border bg-muted/20 p-5 text-center transition hover:border-foreground hover:bg-muted/40"
                >
                  <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-8" />
                  </span>
                  <span>
                    <span className="block text-lg font-semibold">{option.title}</span>
                    <span className="mt-2 block text-sm text-muted-foreground">{option.description}</span>
                  </span>
                </button>
              )
            })}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Ya tienes cuenta? <Link href="/login" className="text-foreground underline">Inicia sesion</Link>
          </p>
        </CardContent>
      </Card>
    )
  }

  const selectedOption = roleOptions.find((option) => option.value === selectedRole)

  return (
    <Card className="rounded-none ring-0">
      <CardHeader className="border-b">
        <CardTitle>Crear cuenta como {selectedOption?.title.toLowerCase()}</CardTitle>
        <button type="button" onClick={() => setSelectedRole(null)} className="w-fit text-sm text-muted-foreground underline">
          Cambiar tipo de cuenta
        </button>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="role" value={selectedRole} />
          <FormNotice ok={state.ok} message={state.message} />
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre</Label>
            <Input id="full_name" name="full_name" required autoComplete="name" className="rounded-none" />
            <FieldError message={state.errors?.full_name?.[0]} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" className="rounded-none" />
            <FieldError message={state.errors?.email?.[0]} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="new-password" className="rounded-none" />
            <FieldError message={state.errors?.password?.[0]} />
          </div>
          <SubmitButton className="w-full rounded-none" pendingText="Creando">
            Crear cuenta
          </SubmitButton>
        </form>
        <form action={signInWithGoogleAction}>
          <input type="hidden" name="role" value={selectedRole} />
          <Button type="submit" variant="outline" className="w-full rounded-none">
            <GoogleIcon />
            Continuar con Google
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-sm text-destructive">{message}</p>
}

function FormNotice({ ok, message }: { ok?: boolean; message?: string }) {
  if (!message) return null

  return (
    <p className={ok ? "border p-3 text-sm" : "text-sm text-destructive"}>
      {message}
    </p>
  )
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
