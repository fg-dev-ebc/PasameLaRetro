export type ActionState = {
  ok?: boolean
  message?: string
  errors?: Record<string, string[] | undefined>
}

export const initialActionState: ActionState = {}
