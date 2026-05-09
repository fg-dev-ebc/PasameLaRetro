export type ActionState = {
  ok?: boolean
  message?: string
  errors?: Record<string, string[] | undefined>
  equipmentId?: string
}

export const initialActionState: ActionState = {}
