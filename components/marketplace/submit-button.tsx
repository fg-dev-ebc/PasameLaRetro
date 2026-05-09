"use client"

import { useFormStatus } from "react-dom"
import { LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

type SubmitButtonProps = React.ComponentProps<typeof Button> & {
  loading?: boolean
  pendingText?: string
}

export function SubmitButton({ children, loading = false, pendingText = "Procesando", ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus()
  const isLoading = pending || loading

  return (
    <Button type="submit" disabled={isLoading} {...props}>
      {isLoading ? (
        <>
          <LoaderCircle className="size-4 animate-spin" />
          {pendingText}
        </>
      ) : children}
    </Button>
  )
}
