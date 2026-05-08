"use client"

import { useActionState } from "react"

import { signInAction, signInWithGoogleAction, signUpAction } from "@/lib/actions/auth"
import { initialActionState } from "@/lib/actions/types"
import { roleLabels } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/marketplace/submit-button"

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
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <SubmitButton className="w-full rounded-none" pendingText="Entrando">
            Entrar
          </SubmitButton>
        </form>
        <form action={signInWithGoogleAction}>
          <Button type="submit" variant="outline" className="w-full rounded-none">
            Continuar con Google
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function RegisterForm() {
  const [state, formAction] = useActionState(signUpAction, initialActionState)

  return (
    <Card className="rounded-none ring-0">
      <CardHeader className="border-b">
        <CardTitle>Crear cuenta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <form action={formAction} className="space-y-4">
          <FormNotice ok={state.ok} message={state.message} />
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre</Label>
            <Input id="full_name" name="full_name" required autoComplete="name" />
            <FieldError message={state.errors?.full_name?.[0]} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <select id="role" name="role" defaultValue="renter" className="h-9 w-full rounded-none border bg-background px-3 text-sm">
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
            <FieldError message={state.errors?.email?.[0]} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="new-password" />
            <FieldError message={state.errors?.password?.[0]} />
          </div>
          <SubmitButton className="w-full rounded-none" pendingText="Creando">
            Crear cuenta
          </SubmitButton>
        </form>
        <form action={signInWithGoogleAction}>
          <Button type="submit" variant="outline" className="w-full rounded-none">
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
