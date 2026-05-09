"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import type { ActionState } from "@/lib/actions/types"

const emailSchema = z.string().email("Email invalido")
const passwordSchema = z.string().min(6, "Minimo 6 caracteres")
const roleSchema = z.enum(["owner", "renter"])

const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

const signUpSchema = signInSchema.extend({
  full_name: z.string().min(2, "Agrega tu nombre"),
  role: roleSchema,
})

async function getOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
}

export async function signInAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { message: "No pudimos iniciar sesion con esos datos." }
  }

  redirect("/dashboard")
}

export async function signUpAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const origin = await getOrigin()
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      data: {
        full_name: parsed.data.full_name,
        role: parsed.data.role,
      },
    },
  })

  if (error) {
    return { message: "No pudimos crear tu cuenta. Intenta con otro email." }
  }

  if (!data.session) {
    return {
      ok: true,
      message: "Cuenta creada. Revisa tu correo y confirma tu email antes de iniciar sesion.",
    }
  }

  redirect("/dashboard")
}

export async function signInWithGoogleAction(formData?: FormData) {
  const origin = await getOrigin()
  const parsedRole = roleSchema.safeParse(formData?.get("role"))
  const cookieStore = await cookies()

  if (parsedRole.success) {
    cookieStore.set("oauth_role", parsedRole.data, {
      httpOnly: true,
      maxAge: 10 * 60,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
  } else {
    cookieStore.delete("oauth_role")
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  })

  if (error || !data.url) {
    redirect("/login?error=oauth")
  }

  redirect(data.url)
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}
