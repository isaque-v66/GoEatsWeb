"use client"

import { Button } from "@/components/ui/button"

interface Props {
  onClick: () => void
  loading: boolean
}


export function SubmitOrderButton({onClick,loading}: Props) {
  return (
    <Button
      onClick={onClick}
      className="w-full"
      size="lg"
      disabled={loading}
    >
      {loading
        ? "Enviando..."
        : "Enviar Pedido"}
    </Button>
  )
}