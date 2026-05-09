export type ActionState = {
  ok?: boolean
  message?: string
  errors?: Record<string, string[] | undefined>
  equipmentId?: string
  values?: Record<string, string>
}

export const initialActionState: ActionState = {}
