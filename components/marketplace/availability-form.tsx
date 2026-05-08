"use client"

import { useActionState } from "react"

import { updateAvailabilityAction } from "@/lib/actions/equipment"
import { initialActionState } from "@/lib/actions/types"
import { weekdays } from "@/lib/constants"
import type { Tables } from "@/lib/supabase/database.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SubmitButton } from "@/components/marketplace/submit-button"

type AvailabilityFormProps = {
  equipmentId: string
  rules: Tables<"availability_rules">[]
}

export function AvailabilityForm({ equipmentId, rules }: AvailabilityFormProps) {
  const [state, formAction] = useActionState(
    updateAvailabilityAction.bind(null, equipmentId),
    initialActionState
  )

  return (
    <form action={formAction}>
      <Card className="rounded-none ring-0">
        <CardHeader className="border-b">
          <CardTitle>Disponibilidad semanal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          {state.message ? <p className={state.ok ? "text-sm" : "text-sm text-destructive"}>{state.message}</p> : null}
          {weekdays.map((day) => {
            const rule = rules.find((item) => item.weekday === day.value)
            return (
              <div key={day.value} className="grid gap-3 border-b pb-4 sm:grid-cols-[120px_1fr_1fr] sm:items-center">
                <label className="flex items-center gap-2 font-mono text-xs uppercase">
                  <input type="checkbox" name={`day_${day.value}`} defaultChecked={Boolean(rule)} className="size-4 accent-foreground" />
                  {day.label}
                </label>
                <Input name={`start_${day.value}`} type="time" defaultValue={rule?.start_time.slice(0, 5) ?? "08:00"} />
                <Input name={`end_${day.value}`} type="time" defaultValue={rule?.end_time.slice(0, 5) ?? "17:00"} />
              </div>
            )
          })}
          <SubmitButton className="rounded-none" pendingText="Guardando">
            Guardar horarios
          </SubmitButton>
        </CardContent>
      </Card>
    </form>
  )
}
